"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/component/Logo";
import {
  DEFAULT_MANAGED_API_CONFIG,
  ManagedApiConfig,
  normalizeManagedApiConfig,
  readManagedApiConfig,
  resetManagedApiConfig,
  saveManagedApiConfig,
} from "@/lib/apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faArrowRotateRight,
  faBolt,
  faCheck,
  faClipboardList,
  faCopy,
  faDatabase,
  faFilm,
  faGaugeHigh,
  faHouse,
  faListCheck,
  faMagnifyingGlass,
  faPlug,
  faRotateLeft,
  faServer,
  faShieldHalved,
  faTrash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type TabKey = "overview" | "api" | "content" | "tools" | "ops" | "perf";
type CheckKey = "ophim" | "kkphim" | "nguonc";
type CheckStatus = "idle" | "checking" | "ok" | "error";

interface ApiCheck {
  label: string;
  url: string;
  status: CheckStatus;
  message: string;
  latencyMs?: number;
}

interface RouteCheck {
  label: string;
  path: string;
  status: CheckStatus;
  message: string;
  latencyMs?: number;
}

interface ContentProbe {
  status: CheckStatus;
  searchMessage: string;
  detailMessage: string;
  latencyMs?: number;
}

interface TaskItem {
  id: string;
  label: string;
}

interface MovieLookupItem {
  name?: string;
  origin_name?: string;
  slug?: string;
  year?: string | number;
  episode_current?: string;
  quality?: string;
  lang?: string;
  category?: Array<{ name?: string }>;
  country?: Array<{ name?: string }>;
}

const NOTES_STORAGE_KEY = "rophim.ceo.notes.v1";
const TASKS_STORAGE_KEY = "rophim.ceo.tasks.v1";

const tabs = [
  { key: "overview" as const, label: "Tổng quan", icon: faGaugeHigh },
  { key: "api" as const, label: "Nguồn API", icon: faPlug },
  { key: "content" as const, label: "Nội dung", icon: faFilm },
  { key: "tools" as const, label: "Công cụ", icon: faClipboardList },
  { key: "ops" as const, label: "Vận hành", icon: faListCheck },
  { key: "perf" as const, label: "Hiệu năng", icon: faBolt },
];

// Image test URLs — lấy từ API thật để đảm bảo URL còn tồn tại
// Các URL này được cập nhật định kỳ từ kết quả API phim mới nhất
const IMAGE_TEST_URLS: { label: string; url: string; dynamic?: boolean }[] = [
  {
    label: "OPhim CDN",
    url: "https://img.ophim.live/uploads/movies/avatar-2-thumb.jpg",
    dynamic: true, // sẽ được thay bằng ảnh thật từ API khi test
  },
  {
    label: "PhimImg CDN",
    url: "https://phimimg.com/upload/vod/20231128-1/c94e35ff50af80e5bb3e7b8a6f2d1c09.jpg",
  },
  {
    label: "TMDB Image",
    url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    label: "NguonC Image",
    url: "https://phim.nguonc.com/images/film/avatar-2.jpg",
  },
];

interface ImageTestResult {
  label: string;
  url: string;
  status: CheckStatus;
  latencyMs?: number;
  size?: string;
  message: string;
}

interface SwCacheStats {
  imageCount: number;
  pageCount: number;
  cacheName: string;
  imageCacheName: string;
}

async function sendSwMessage(data: Record<string, string>): Promise<any> {
  if (typeof navigator === "undefined" || !navigator.serviceWorker?.controller) {
    throw new Error("Service Worker chưa active");
  }
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => {
      if (e.data?.success) resolve(e.data);
      else reject(new Error("SW error"));
    };
    navigator.serviceWorker.controller!.postMessage(data, [channel.port2]);
    setTimeout(() => reject(new Error("SW timeout")), 5000);
  });
}

const checkLabels: Record<CheckKey, string> = {
  ophim: "OPhim",
  kkphim: "KKPhim",
  nguonc: "NguonC",
};

const initialChecks: Record<CheckKey, ApiCheck> = {
  ophim: { label: checkLabels.ophim, url: "", status: "idle", message: "Chưa kiểm tra" },
  kkphim: { label: checkLabels.kkphim, url: "", status: "idle", message: "Chưa kiểm tra" },
  nguonc: { label: checkLabels.nguonc, url: "", status: "idle", message: "Chưa kiểm tra" },
};

const routeTargets: RouteCheck[] = [
  { label: "Trang chủ", path: "/", status: "idle", message: "Chưa kiểm tra" },
  { label: "Phim mới", path: "/phimhay", status: "idle", message: "Chưa kiểm tra" },
  { label: "Phim lẻ", path: "/phim-le", status: "idle", message: "Chưa kiểm tra" },
  { label: "Phim bộ", path: "/phim-bo", status: "idle", message: "Chưa kiểm tra" },
  { label: "Chiếu rạp", path: "/chieu-rap", status: "idle", message: "Chưa kiểm tra" },
  { label: "Tìm kiếm", path: "/search", status: "idle", message: "Chưa kiểm tra" },
];

const defaultTasks: TaskItem[] = [
  { id: "api", label: "Test API sau khi đổi domain" },
  { id: "home", label: "Mở trang chủ trên laptop và điện thoại" },
  { id: "search", label: "Tìm thử một phim phổ biến" },
  { id: "detail", label: "Mở trang chi tiết và kiểm tra tập phim" },
  { id: "routes", label: "Smoke test các route chính" },
  { id: "deploy", label: "Chạy lint/test trước khi deploy" },
];

function formatDate(value?: string) {
  if (!value) return "Mặc định";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status: CheckStatus) {
  if (status === "checking") return "Đang test";
  if (status === "ok") return "OK";
  if (status === "error") return "Lỗi";
  return "Idle";
}

function statusClass(status: CheckStatus) {
  if (status === "ok") return "bg-[#7DFFA6]/12 text-[#7DFFA6]";
  if (status === "error") return "bg-[#FF6B6B]/12 text-[#FF8A8A]";
  if (status === "checking") return "bg-[#FFD875]/14 text-[#FFD875]";
  return "bg-white/8 text-white/50";
}

async function fetchJsonProbe(url: string) {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 7500);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = JSON.parse(text);
    return {
      data,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchPageProbe(path: string) {
  const startedAt = performance.now();
  const response = await fetch(path, { cache: "no-store" });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (/Runtime Error|Build Error|nextjs-portal/.test(text)) {
    throw new Error("Có dấu hiệu error overlay");
  }
  return Math.round(performance.now() - startedAt);
}

function getItemCount(key: CheckKey, data: any): number {
  if (key === "ophim") return Number(data?.data?.items?.length || 0);
  return Number(data?.items?.length || data?.data?.items?.length || 0);
}

function makeCheckUrls(config: ManagedApiConfig): Record<CheckKey, string> {
  return {
    ophim: `${config.ophimBaseUrl}/v1/api/danh-sach/phim-moi-cap-nhat?page=1`,
    kkphim: `${config.kkphimBaseUrl}/danh-sach/phim-moi-cap-nhat?page=1`,
    nguonc: `${config.nguoncBaseUrl}/films/phim-moi-cap-nhat?page=1`,
  };
}

function getSavedTaskState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(TASKS_STORAGE_KEY) || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

function getMovieLookupItems(data: any): MovieLookupItem[] {
  const items = data?.data?.items || data?.items || [];
  return Array.isArray(items) ? items : [];
}

function formatMovieTags(item: MovieLookupItem) {
  const tags = [
    item.year,
    item.quality,
    item.lang,
    item.episode_current,
    ...(item.category || []).map((category) => category.name).slice(0, 2),
    ...(item.country || []).map((country) => country.name).slice(0, 1),
  ]
    .filter(Boolean)
    .map(String);

  return tags.length ? tags.join(" · ") : "Chưa có metadata";
}

export default function CeoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [config, setConfig] = useState<ManagedApiConfig>(DEFAULT_MANAGED_API_CONFIG);
  const [savedAt, setSavedAt] = useState<string | undefined>();
  const [checks, setChecks] = useState<Record<CheckKey, ApiCheck>>(initialChecks);
  const [routeChecks, setRouteChecks] = useState<RouteCheck[]>(routeTargets);
  const [contentProbe, setContentProbe] = useState<ContentProbe>({
    status: "idle",
    searchMessage: "Chưa kiểm tra tìm kiếm",
    detailMessage: "Chưa kiểm tra chi tiết",
  });
  const [notice, setNotice] = useState("");
  const [importText, setImportText] = useState("");
  const [notes, setNotes] = useState("");
  const [taskState, setTaskState] = useState<Record<string, boolean>>({});
  const [keyword, setKeyword] = useState("mai");
  const [detailSlug, setDetailSlug] = useState("hom-nay-lai-ban-het");
  const [movieLookupStatus, setMovieLookupStatus] = useState<CheckStatus>("idle");
  const [movieLookupMessage, setMovieLookupMessage] = useState("Nhập từ khóa để tra cứu phim từ OPhim");
  const [movieLookupItems, setMovieLookupItems] = useState<MovieLookupItem[]>([]);

  // Performance tab state
  const [imageTests, setImageTests] = useState<ImageTestResult[]>(
    IMAGE_TEST_URLS.map((u) => ({ ...u, status: "idle" as CheckStatus, message: "Chưa test" }))
  );
  const [swStats, setSwStats] = useState<SwCacheStats | null>(null);
  const [swStatsStatus, setSwStatsStatus] = useState<CheckStatus>("idle");
  const [clearStatus, setClearStatus] = useState("");
  const [coldStartMs, setColdStartMs] = useState<number | null>(null);

  useEffect(() => {
    const current = readManagedApiConfig();
    setConfig(current);
    setSavedAt(current.updatedAt);
    setNotes(window.localStorage.getItem(NOTES_STORAGE_KEY) || "");
    setTaskState(getSavedTaskState());
    const urls = makeCheckUrls(current);
    setChecks({
      ophim: { ...initialChecks.ophim, url: urls.ophim },
      kkphim: { ...initialChecks.kkphim, url: urls.kkphim },
      nguonc: { ...initialChecks.nguonc, url: urls.nguonc },
    });
  }, []);

  const normalizedPreview = useMemo(() => normalizeManagedApiConfig(config), [config]);
  const apiOkCount = Object.values(checks).filter((item) => item.status === "ok").length;
  const routeOkCount = routeChecks.filter((item) => item.status === "ok").length;
  const doneTaskCount = defaultTasks.filter((item) => taskState[item.id]).length;
  const configJson = useMemo(() => JSON.stringify(normalizedPreview, null, 2), [normalizedPreview]);
  const statusReport = useMemo(() => {
    const checkedAt = new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date());
    const apiLines = (Object.keys(checks) as CheckKey[]).map((key) => {
      const item = checks[key];
      return `- ${item.label}: ${formatStatus(item.status)} (${item.message}${item.latencyMs ? `, ${item.latencyMs}ms` : ""})`;
    });
    const routeLines = routeChecks.map((item) => {
      return `- ${item.label} ${item.path}: ${formatStatus(item.status)} (${item.latencyMs ? `${item.latencyMs}ms` : item.message})`;
    });
    const taskLines = defaultTasks.map((item) => {
      return `- ${taskState[item.id] ? "[x]" : "[ ]"} ${item.label}`;
    });
    const swLine = swStats
      ? `SW cache: ${swStats.imageCount} ảnh, ${swStats.pageCount} page`
      : "SW cache: chưa đọc";
    const coldStartLine =
      coldStartMs === null ? "Cold start: chưa đo" : coldStartMs === -1 ? "Cold start: lỗi" : `Cold start: ${coldStartMs}ms`;

    const lines = [
      `Rổ Phim CEO Report`,
      `Thời điểm: ${checkedAt}`,
      `Lưu cấu hình: ${formatDate(savedAt)}`,
      "",
      `Tổng quan: API ${apiOkCount}/3 · Route ${routeOkCount}/${routeTargets.length} · Checklist ${doneTaskCount}/${defaultTasks.length}`,
      "",
      "API health:",
      ...apiLines,
      "",
      "Content probe:",
      `- Tìm kiếm: ${contentProbe.searchMessage}`,
      `- Chi tiết: ${contentProbe.detailMessage}`,
      "",
      "Routes:",
      ...routeLines,
      "",
      "Performance:",
      `- ${swLine}`,
      `- ${coldStartLine}`,
      "",
      "Checklist:",
      ...taskLines,
    ];

    if (notes.trim()) {
      lines.push("", "Ghi chú:", notes.trim());
    }

    return lines.join("\n");
  }, [apiOkCount, checks, coldStartMs, contentProbe, doneTaskCount, notes, routeChecks, routeOkCount, savedAt, swStats, taskState]);

  const updateField = (field: keyof ManagedApiConfig, value: string) => {
    setConfig((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveConfig = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const saved = saveManagedApiConfig(config);
    const urls = makeCheckUrls(saved);
    setConfig(saved);
    setSavedAt(saved.updatedAt);
    setChecks({
      ophim: { ...initialChecks.ophim, url: urls.ophim },
      kkphim: { ...initialChecks.kkphim, url: urls.kkphim },
      nguonc: { ...initialChecks.nguonc, url: urls.nguonc },
    });
    setNotice("Đã lưu cấu hình API");
  };

  const resetConfig = () => {
    const restored = resetManagedApiConfig();
    const urls = makeCheckUrls(restored);
    setConfig(restored);
    setSavedAt(undefined);
    setChecks({
      ophim: { ...initialChecks.ophim, url: urls.ophim },
      kkphim: { ...initialChecks.kkphim, url: urls.kkphim },
      nguonc: { ...initialChecks.nguonc, url: urls.nguonc },
    });
    setNotice("Đã khôi phục mặc định");
  };

  const runApiChecks = async () => {
    const safeConfig = normalizeManagedApiConfig(config);
    const urls = makeCheckUrls(safeConfig);
    setNotice("");
    setChecks({
      ophim: { label: checkLabels.ophim, url: urls.ophim, status: "checking", message: "Đang kiểm tra" },
      kkphim: { label: checkLabels.kkphim, url: urls.kkphim, status: "checking", message: "Đang kiểm tra" },
      nguonc: { label: checkLabels.nguonc, url: urls.nguonc, status: "checking", message: "Đang kiểm tra" },
    });

    const entries = await Promise.all(
      (Object.keys(urls) as CheckKey[]).map(async (key) => {
        try {
          const result = await fetchJsonProbe(urls[key]);
          const count = getItemCount(key, result.data);
          if (count <= 0) {
            throw new Error("Không có phim trong phản hồi");
          }
          return [
            key,
            {
              label: checkLabels[key],
              url: urls[key],
              status: "ok" as CheckStatus,
              message: `${count} phim`,
              latencyMs: result.latencyMs,
            },
          ] as const;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Không kiểm tra được";
          return [
            key,
            {
              label: checkLabels[key],
              url: urls[key],
              status: "error" as CheckStatus,
              message,
            },
          ] as const;
        }
      })
    );

    setChecks(Object.fromEntries(entries) as Record<CheckKey, ApiCheck>);
  };

  const runRouteChecks = async () => {
    setRouteChecks(routeTargets.map((item) => ({ ...item, status: "checking", message: "Đang kiểm tra" })));
    const next = await Promise.all(
      routeTargets.map(async (item) => {
        try {
          const latencyMs = await fetchPageProbe(item.path);
          return {
            ...item,
            status: "ok" as CheckStatus,
            message: "Render OK",
            latencyMs,
          };
        } catch (error) {
          return {
            ...item,
            status: "error" as CheckStatus,
            message: error instanceof Error ? error.message : "Không kiểm tra được",
          };
        }
      })
    );
    setRouteChecks(next);
  };

  const runContentProbe = async () => {
    const safeConfig = normalizeManagedApiConfig(config);
    const safeKeyword = keyword.trim() || "mai";
    const safeSlug = detailSlug.trim() || "hom-nay-lai-ban-het";
    const searchUrl = `${safeConfig.ophimBaseUrl}/v1/api/tim-kiem?keyword=${encodeURIComponent(safeKeyword)}&limit=8`;
    const detailUrl = `${safeConfig.ophimBaseUrl}/phim/${encodeURIComponent(safeSlug)}`;

    setContentProbe({
      status: "checking",
      searchMessage: "Đang kiểm tra tìm kiếm",
      detailMessage: "Đang kiểm tra chi tiết phim",
    });

    const startedAt = performance.now();
    const [searchResult, detailResult] = await Promise.allSettled([
      fetchJsonProbe(searchUrl),
      fetchJsonProbe(detailUrl),
    ]);

    const searchMessage =
      searchResult.status === "fulfilled"
        ? `${Number(searchResult.value.data?.data?.items?.length || 0)} kết quả cho "${safeKeyword}"`
        : searchResult.reason instanceof Error
          ? searchResult.reason.message
          : "Tìm kiếm lỗi";

    const detailMessage =
      detailResult.status === "fulfilled"
        ? `${detailResult.value.data?.movie?.name || safeSlug} · ${Number(detailResult.value.data?.episodes?.length || 0)} server`
        : detailResult.reason instanceof Error
          ? detailResult.reason.message
          : "Chi tiết lỗi";

    const hasError = searchResult.status === "rejected" || detailResult.status === "rejected";
    setContentProbe({
      status: hasError ? "error" : "ok",
      searchMessage,
      detailMessage,
      latencyMs: Math.round(performance.now() - startedAt),
    });
  };

  const runAllChecks = async () => {
    await Promise.all([runApiChecks(), runRouteChecks(), runContentProbe()]);
  };

  // Performance tab functions
  const runImageSpeedTest = async () => {
    setImageTests((prev) => prev.map((item) => ({ ...item, status: "checking", message: "Đang đo..." })));

    // Lấy URL ảnh thật từ API phim để test chính xác hơn
    const safeConfig = normalizeManagedApiConfig(config);
    let liveTestUrls = [...IMAGE_TEST_URLS];
    try {
      const apiRes = await fetch(`${safeConfig.ophimBaseUrl}/v1/api/danh-sach/phim-moi-cap-nhat?page=1`, {
        cache: "no-store",
      });
      const apiData = await apiRes.json();
      const firstMovie = apiData?.data?.items?.[0];
      if (firstMovie?.thumb_url) {
        const realThumbUrl = firstMovie.thumb_url.startsWith("http")
          ? firstMovie.thumb_url
          : `${safeConfig.ophimImageCdn}/uploads/movies/${firstMovie.thumb_url}`;
        liveTestUrls = liveTestUrls.map((item) =>
          item.label === "OPhim CDN" ? { ...item, url: realThumbUrl } : item
        );
      }
      const firstPoster = firstMovie?.poster_url;
      if (firstPoster?.startsWith("http") && firstPoster.includes("phimimg.com")) {
        liveTestUrls = liveTestUrls.map((item) =>
          item.label === "PhimImg CDN" ? { ...item, url: firstPoster } : item
        );
      }
    } catch {
      // Dùng URL mặc định nếu không fetch được
    }

    const results = await Promise.all(
      liveTestUrls.map(async (item) => {
        const startedAt = performance.now();
        try {
          const res = await fetch(item.url + (item.url.includes("?") ? "&" : "?") + "_nocache=" + Date.now(), {
            cache: "no-store",
            mode: "cors",
          });
          const buffer = await res.arrayBuffer();
          const latencyMs = Math.round(performance.now() - startedAt);
          const sizeKb = (buffer.byteLength / 1024).toFixed(1);
          return {
            ...item,
            status: res.ok ? ("ok" as CheckStatus) : ("error" as CheckStatus),
            latencyMs,
            size: `${sizeKb} KB`,
            message: res.ok ? `Load OK · ${sizeKb} KB` : `HTTP ${res.status}`,
          };
        } catch {
          return {
            ...item,
            status: "error" as CheckStatus,
            message: "Timeout hoặc bị block (CORS)",
          };
        }
      })
    );
    setImageTests(results);
  };

  const fetchSwStats = async () => {
    setSwStatsStatus("checking");
    try {
      const stats = await sendSwMessage({ type: "GET_CACHE_STATS" });
      setSwStats(stats);
      setSwStatsStatus("ok");
    } catch (e) {
      setSwStatsStatus("error");
      setSwStats(null);
    }
  };

  const clearImageCache = async () => {
    setClearStatus("Đang xóa cache ảnh...");
    try {
      await sendSwMessage({ type: "CLEAR_IMAGE_CACHE" });
      setClearStatus("✓ Đã xóa cache ảnh CDN");
      fetchSwStats();
    } catch {
      setClearStatus("⚠ Không xóa được — SW chưa active?");
    }
  };

  const clearAllCache = async () => {
    setClearStatus("Đang xóa tất cả cache...");
    try {
      await sendSwMessage({ type: "CLEAR_ALL_CACHE" });
      setClearStatus("✓ Đã xóa toàn bộ cache");
      fetchSwStats();
    } catch {
      setClearStatus("⚠ Không xóa được — SW chưa active?");
    }
  };

  const measureColdStart = async () => {
    setColdStartMs(null);
    const startedAt = performance.now();
    try {
      await fetch("/api/health", { cache: "no-store" });
      setColdStartMs(Math.round(performance.now() - startedAt));
    } catch {
      setColdStartMs(-1);
    }
  };

  const copyTextFallback = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      return document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const copyText = (text: string, successMessage: string) => {
    setNotice("Đang copy...");
    void (async () => {
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard API không khả dụng");
        }
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error("Clipboard timeout")), 900)),
        ]);
        setNotice(successMessage);
      } catch {
        setNotice(copyTextFallback(text) ? successMessage : "Không copy được, hãy copy thủ công");
      }
    })();
  };

  const copyConfig = () => {
    copyText(configJson, "Đã copy cấu hình JSON");
  };

  const downloadStatusReport = () => {
    const blob = new Blob([statusReport], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rophim-ceo-report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    setNotice("Đã tạo file báo cáo");
  };

  const runMovieLookup = async () => {
    const safeKeyword = keyword.trim();
    if (!safeKeyword) {
      setMovieLookupStatus("error");
      setMovieLookupMessage("Nhập từ khóa phim trước khi tra cứu");
      setMovieLookupItems([]);
      return;
    }

    const safeConfig = normalizeManagedApiConfig(config);
    setMovieLookupStatus("checking");
    setMovieLookupMessage("Đang tra cứu phim");
    setMovieLookupItems([]);

    try {
      const result = await fetchJsonProbe(
        `${safeConfig.ophimBaseUrl}/v1/api/tim-kiem?keyword=${encodeURIComponent(safeKeyword)}&limit=12`
      );
      const items = getMovieLookupItems(result.data).slice(0, 12);
      setMovieLookupItems(items);
      setMovieLookupStatus("ok");
      setMovieLookupMessage(`${items.length} kết quả cho "${safeKeyword}" · ${result.latencyMs}ms`);
    } catch (error) {
      setMovieLookupStatus("error");
      setMovieLookupMessage(error instanceof Error ? error.message : "Không tra cứu được");
    }
  };

  const openMovie = (item: MovieLookupItem) => {
    if (!item.slug) {
      setNotice("Phim này chưa có slug");
      return;
    }
    router.push(`/phim/${item.slug}`);
  };

  const copyMovieSlug = (item: MovieLookupItem) => {
    if (!item.slug) {
      setNotice("Phim này chưa có slug");
      return;
    }
    copyText(item.slug, `Đã copy slug: ${item.slug}`);
  };

  const importConfig = () => {
    try {
      const parsed = JSON.parse(importText);
      const nextConfig = normalizeManagedApiConfig(parsed);
      setConfig(nextConfig);
      setNotice("Đã nạp cấu hình vào form, bấm Lưu để áp dụng");
    } catch {
      setNotice("JSON không hợp lệ");
    }
  };

  const updateNotes = (value: string) => {
    setNotes(value);
    window.localStorage.setItem(NOTES_STORAGE_KEY, value);
  };

  const toggleTask = (id: string) => {
    setTaskState((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#0B0D13] text-white">
      <section className="border-b border-white/8 bg-[#10141E]">
        <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/")}
              className="h-[50px] w-[158px] shrink-0 transition active:scale-[0.98] sm:h-[56px] sm:w-[176px]"
              aria-label="Về trang chủ"
            >
              <Logo />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/phimhay")}
                className="hidden min-h-[42px] rounded-md px-4 text-[14px] font-semibold text-white/72 transition hover:bg-white/8 hover:text-white sm:inline-flex sm:items-center"
              >
                Kho phim
              </button>
              <button
                onClick={runAllChecks}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#FFD875] px-4 text-[14px] font-bold text-black transition hover:bg-[#FFE49A]"
              >
                <FontAwesomeIcon icon={faArrowRotateRight} className="text-xs" />
                Test tổng
              </button>
            </div>
          </nav>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end">
            <div>
              <h1 className="text-[30px] font-black leading-tight text-white sm:text-[42px]">
                CEO Center Rổ Phim
              </h1>
              <p className="mt-2 max-w-[760px] text-[15px] leading-6 text-white/62">
                Bảng điều khiển để theo dõi nguồn phim, kiểm tra route, test nội dung và chuẩn bị deploy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="API OK" value={`${apiOkCount}/3`} tone={apiOkCount === 3 ? "good" : "warn"} />
              <Metric label="Route OK" value={`${routeOkCount}/${routeTargets.length}`} tone={routeOkCount === routeTargets.length ? "good" : "idle"} />
              <Metric label="Checklist" value={`${doneTaskCount}/${defaultTasks.length}`} tone={doneTaskCount === defaultTasks.length ? "good" : "idle"} />
              <Metric label="Lưu lúc" value={formatDate(savedAt)} tone="idle" compact />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-md px-4 text-[14px] font-bold transition ${
                  activeTab === tab.key
                    ? "bg-[#FFD875] text-black"
                    : "border border-white/8 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-md border border-[#7DFFA6]/20 bg-[#7DFFA6]/10 px-3 py-3 text-[13px] font-semibold text-[#7DFFA6]">
            <FontAwesomeIcon icon={faCheck} className="text-xs" />
            {notice}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Panel title="Tình trạng hệ thống" icon={faGaugeHigh}>
              <div className="grid gap-3 md:grid-cols-3">
                {Object.values(checks).map((item) => (
                  <StatusBlock key={item.label} title={item.label} status={item.status} detail={item.message} meta={item.latencyMs ? `${item.latencyMs}ms` : item.url} />
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <ActionButton onClick={runApiChecks} icon={faPlug} label="Test API" />
                <ActionButton onClick={runRouteChecks} icon={faHouse} label="Test route" variant="secondary" />
                <ActionButton onClick={runContentProbe} icon={faMagnifyingGlass} label="Test nội dung" variant="secondary" />
              </div>
            </Panel>

            <Panel title="Quick actions" icon={faClipboardList}>
              <div className="grid gap-2">
                {[
                  { label: "Mở trang phim mới", path: "/phimhay" },
                  { label: "Mở trang tìm kiếm", path: "/search" },
                  { label: "Mở chiếu rạp", path: "/chieu-rap" },
                  { label: "Về trang chủ", path: "/" },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className="flex min-h-[46px] items-center justify-between rounded-md border border-white/8 bg-white/5 px-3 text-left text-[14px] font-semibold text-white/74 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                    <FontAwesomeIcon icon={faAngleRight} className="text-[11px] text-white/36" />
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Smoke routes" icon={faHouse} wide>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {routeChecks.map((item) => (
                  <RouteRow key={item.path} item={item} onOpen={() => router.push(item.path)} />
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "api" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <Panel title="Cấu hình nguồn" icon={faServer}>
              <form onSubmit={saveConfig} className="grid gap-4">
                <Field label="OPhim API" value={config.ophimBaseUrl} onChange={(value) => updateField("ophimBaseUrl", value)} />
                <Field label="OPhim CDN ảnh" value={config.ophimImageCdn} onChange={(value) => updateField("ophimImageCdn", value)} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="KKPhim API" value={config.kkphimBaseUrl} onChange={(value) => updateField("kkphimBaseUrl", value)} />
                  <Field label="NguonC API" value={config.nguoncBaseUrl} onChange={(value) => updateField("nguoncBaseUrl", value)} />
                </div>

                <div className="rounded-md border border-white/8 bg-[#0B0D13] p-3">
                  <p className="mb-2 text-[13px] font-semibold text-white/58">URL sau chuẩn hóa</p>
                  <div className="grid gap-2 text-[12px] text-white/54">
                    <p className="truncate">OPhim: {normalizedPreview.ophimBaseUrl}</p>
                    <p className="truncate">Ảnh: {normalizedPreview.ophimImageCdn}</p>
                    <p className="truncate">KKPhim: {normalizedPreview.kkphimBaseUrl}</p>
                    <p className="truncate">NguonC: {normalizedPreview.nguoncBaseUrl}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <ActionButton type="submit" icon={faCheck} label="Lưu cấu hình" />
                  <ActionButton type="button" onClick={resetConfig} icon={faRotateLeft} label="Mặc định" variant="secondary" />
                </div>
              </form>
            </Panel>

            <Panel title="Import / Export" icon={faDatabase}>
              <textarea
                value={importText || configJson}
                onChange={(event) => setImportText(event.target.value)}
                className="min-h-[210px] w-full resize-y rounded-md border border-white/10 bg-[#0B0D13] p-3 font-mono text-[12px] leading-5 text-white/72 outline-none focus:border-[#FFD875]/55"
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ActionButton onClick={copyConfig} icon={faCopy} label="Copy JSON" variant="secondary" />
                <ActionButton onClick={importConfig} icon={faClipboardList} label="Nạp JSON" variant="secondary" />
              </div>
            </Panel>

            <Panel title="API health" icon={faPlug} wide>
              <div className="grid gap-3 lg:grid-cols-3">
                {(Object.keys(checks) as CheckKey[]).map((key) => (
                  <ApiCard key={key} item={checks[key]} />
                ))}
              </div>
              <div className="mt-4">
                <ActionButton onClick={runApiChecks} icon={faArrowRotateRight} label="Test lại API" variant="secondary" />
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "content" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <Panel title="Content probe" icon={faMagnifyingGlass}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Từ khóa test" value={keyword} onChange={setKeyword} />
                <Field label="Slug chi tiết" value={detailSlug} onChange={setDetailSlug} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <StatusBlock title="Tìm kiếm" status={contentProbe.status} detail={contentProbe.searchMessage} />
                <StatusBlock title="Chi tiết phim" status={contentProbe.status} detail={contentProbe.detailMessage} meta={contentProbe.latencyMs ? `${contentProbe.latencyMs}ms` : undefined} />
              </div>
              <div className="mt-4">
                <ActionButton onClick={runContentProbe} icon={faMagnifyingGlass} label="Test nội dung" />
              </div>
            </Panel>

            <Panel title="Route monitor" icon={faHouse}>
              <div className="grid gap-2">
                {routeChecks.map((item) => (
                  <RouteRow key={item.path} item={item} compact onOpen={() => router.push(item.path)} />
                ))}
              </div>
              <div className="mt-4">
                <ActionButton onClick={runRouteChecks} icon={faArrowRotateRight} label="Test route" variant="secondary" />
              </div>
            </Panel>

            <Panel title="Nội dung cần kiểm tra khi API đổi" icon={faFilm} wide>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  "Poster và thumb còn hiện đúng",
                  "Trang chi tiết có episode",
                  "Tìm kiếm trả kết quả",
                  "Chiếu rạp không rỗng",
                ].map((item) => (
                  <div key={item} className="rounded-md border border-white/8 bg-white/5 p-3 text-[14px] font-semibold text-white/74">
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "tools" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <Panel title="Tra cứu phim nhanh" icon={faMagnifyingGlass}>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px] md:items-end">
                <Field label="Từ khóa phim" value={keyword} onChange={setKeyword} />
                <ActionButton onClick={runMovieLookup} icon={faMagnifyingGlass} label="Tra cứu" />
              </div>
              <div className="mt-4">
                <StatusBlock title="Kết quả OPhim" status={movieLookupStatus} detail={movieLookupMessage} />
              </div>
              <div className="mt-4 grid gap-2">
                {movieLookupItems.length > 0 ? (
                  movieLookupItems.map((item, index) => (
                    <MovieLookupRow
                      key={`${item.slug || item.name || "movie"}-${index}`}
                      item={item}
                      onOpen={() => openMovie(item)}
                      onCopy={() => copyMovieSlug(item)}
                    />
                  ))
                ) : (
                  <div className="rounded-md border border-white/8 bg-[#0B0D13] p-4 text-[13px] leading-6 text-white/44">
                    Kết quả tra cứu sẽ hiện ở đây để mở nhanh trang chi tiết hoặc copy slug.
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Báo cáo trạng thái" icon={faClipboardList}>
              <textarea
                readOnly
                value={statusReport}
                className="min-h-[360px] w-full resize-y rounded-md border border-white/10 bg-[#0B0D13] p-3 font-mono text-[12px] leading-5 text-white/72 outline-none focus:border-[#FFD875]/55"
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ActionButton
                  onClick={() => {
                    setNotice("Đang copy...");
                    copyText(statusReport, "Đã copy báo cáo trạng thái");
                  }}
                  icon={faCopy}
                  label="Copy report"
                  variant="secondary"
                />
                <ActionButton onClick={downloadStatusReport} icon={faClipboardList} label="Tải report" variant="secondary" />
              </div>
            </Panel>

            <Panel title="Lối tắt kiểm tra" icon={faHouse} wide>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {routeTargets.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className="flex min-h-[48px] items-center justify-between gap-3 rounded-md border border-white/8 bg-white/5 px-3 text-left text-[14px] font-semibold text-white/74 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                    <FontAwesomeIcon icon={faAngleRight} className="shrink-0 text-[11px] text-white/36" />
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <ActionButton onClick={runAllChecks} icon={faArrowRotateRight} label="Test tổng" />
                <ActionButton
                  onClick={() => {
                    setNotice("Đang copy...");
                    copyText(statusReport, "Đã copy báo cáo trạng thái");
                  }}
                  icon={faCopy}
                  label="Copy báo cáo"
                  variant="secondary"
                />
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "ops" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <Panel title="Checklist vận hành" icon={faListCheck}>
              <div className="grid gap-2">
                {defaultTasks.map((item) => (
                  <label
                    key={item.id}
                    className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-md border border-white/8 bg-white/5 px-3 text-[14px] font-semibold text-white/76 transition hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(taskState[item.id])}
                      onChange={() => toggleTask(item.id)}
                      className="h-4 w-4 accent-[#FFD875]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </Panel>

            <Panel title="Bảo mật" icon={faShieldHalved}>
              <div className="rounded-md border border-[#FFD875]/14 bg-[#171C29] p-4">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="mt-1 text-[#FFD875]" />
                  <p className="text-[13px] leading-6 text-white/62">
                    Trang này chỉ lưu cấu hình local trong trình duyệt, không chứa secret và không ghi file server. Nếu đưa lên production, cần thêm đăng nhập quản trị trước khi cho phép cấu hình global.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="Ghi chú quản trị" icon={faClipboardList} wide>
              <textarea
                value={notes}
                onChange={(event) => updateNotes(event.target.value)}
                placeholder="Ghi lại API vừa đổi, lỗi đang theo dõi, việc cần kiểm tra trước deploy..."
                className="min-h-[210px] w-full resize-y rounded-md border border-white/10 bg-[#0B0D13] p-3 text-[14px] leading-6 text-white outline-none placeholder:text-white/32 focus:border-[#FFD875]/55"
              />
            </Panel>
          </div>
        )}
        {activeTab === "perf" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* Image Speed Test */}
            <Panel title="Kiểm tra tốc độ ảnh CDN" icon={faBolt}>
              <p className="mb-4 text-[13px] leading-6 text-white/54">
                Test load ảnh trực tiếp từ CDN ngoài (không qua cache). Nếu latency cao (&gt;2000ms) là CDN đang chậm.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {imageTests.map((item) => (
                  <div key={item.label} className="rounded-md border border-white/8 bg-[#0B0D13] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-white">{item.label}</p>
                        <p className="mt-1 truncate text-[11px] text-white/34">{item.url.slice(0, 48)}...</p>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-bold ${statusClass(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[13px] text-white/62">{item.message}</p>
                      {item.latencyMs && (
                        <span className={`text-[13px] font-bold ${
                          item.latencyMs < 500 ? "text-[#7DFFA6]" :
                          item.latencyMs < 1500 ? "text-[#FFD875]" : "text-[#FF8A8A]"
                        }`}>
                          {item.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <ActionButton onClick={runImageSpeedTest} icon={faBolt} label="Test tốc độ ảnh" />
              </div>
            </Panel>

            {/* SW Cache Stats */}
            <Panel title="Service Worker Cache" icon={faDatabase}>
              <div className="grid gap-3">
                <div className="rounded-md border border-white/8 bg-[#0B0D13] p-4">
                  <p className="mb-3 text-[13px] font-semibold text-white/58">Thống kê cache hiện tại</p>
                  {swStats ? (
                    <div className="grid gap-2 text-[14px]">
                      <div className="flex justify-between">
                        <span className="text-white/60">Ảnh CDN cache</span>
                        <span className="font-bold text-[#7DFFA6]">{swStats.imageCount} files</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Page cache</span>
                        <span className="font-bold text-white">{swStats.pageCount} files</span>
                      </div>
                      <div className="mt-1 text-[11px] text-white/30">
                        Cache: {swStats.cacheName} / {swStats.imageCacheName}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[13px] text-white/40]">
                      {swStatsStatus === "checking" ? "Đang đọc cache..." :
                       swStatsStatus === "error" ? "⚠ SW chưa active hoặc lỗi" :
                       "Bấm nút bên dưới để kiểm tra"}
                    </p>
                  )}
                </div>

                {clearStatus && (
                  <div className={`rounded-md border px-3 py-3 text-[13px] font-semibold ${
                    clearStatus.startsWith("✓")
                      ? "border-[#7DFFA6]/20 bg-[#7DFFA6]/10 text-[#7DFFA6]"
                      : clearStatus.startsWith("⚠")
                        ? "border-[#FFD875]/20 bg-[#FFD875]/10 text-[#FFD875]"
                        : "border-white/8 bg-white/5 text-white/60"
                  }`}>
                    {clearStatus}
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-2">
                <ActionButton onClick={fetchSwStats} icon={faArrowRotateRight} label="Xem cache stats" variant="secondary" />
                <ActionButton onClick={clearImageCache} icon={faTrash} label="Xóa cache ảnh CDN" variant="secondary" />
                <ActionButton onClick={clearAllCache} icon={faTrash} label="Xóa toàn bộ cache" variant="secondary" />
              </div>
            </Panel>

            {/* Cold Start Monitor */}
            <Panel title="Cold Start Monitor" icon={faGaugeHigh} wide>
              <p className="mb-4 text-[13px] leading-6 text-white/54">
                Đo thời gian response của server. Nếu &gt;3000ms là server đang cold start (Vercel free plan ngủ ~15 phút không có traffic).
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border border-white/8 bg-[#0B0D13] p-4 text-center">
                  <p className="text-[13px] font-semibold text-white/50">Latency API Health</p>
                  <p className={`mt-2 text-[32px] font-black ${
                    coldStartMs === null ? "text-white/30" :
                    coldStartMs === -1 ? "text-[#FF8A8A]" :
                    coldStartMs < 500 ? "text-[#7DFFA6]" :
                    coldStartMs < 2000 ? "text-[#FFD875]" : "text-[#FF8A8A]"
                  }`}>
                    {coldStartMs === null ? "---" : coldStartMs === -1 ? "ERR" : `${coldStartMs}ms`}
                  </p>
                  <p className="mt-1 text-[11px] text-white/30">
                    {coldStartMs === null ? "Chưa đo" :
                     coldStartMs === -1 ? "Không kết nối được" :
                     coldStartMs < 500 ? "Server đang warm 🟢" :
                     coldStartMs < 2000 ? "Hơi chậm 🟡" : "Cold start! 🔴"}
                  </p>
                </div>
                <div className="rounded-md border border-white/8 bg-[#0B0D13] p-4 md:col-span-2">
                  <p className="mb-3 text-[13px] font-semibold text-white/50">Giải thích chỉ số</p>
                  <div className="grid gap-2 text-[13px]">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#7DFFA6]"></span><span className="text-white/70">&lt;500ms — Server warm, load nhanh</span></div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FFD875]"></span><span className="text-white/70">500–2000ms — Bình thường hoặc hơi chậm</span></div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF8A8A]"></span><span className="text-white/70">&gt;2000ms — Cold start, request đầu sẽ chậm</span></div>
                  </div>
                  <p className="mt-3 text-[12px] text-white/36">💡 Vercel free plan cold start sau ~15 phút idle. Upgrade lên Pro để có warm instances.</p>
                </div>
              </div>
              <div className="mt-4">
                <ActionButton onClick={measureColdStart} icon={faBolt} label="Đo cold start" />
              </div>
            </Panel>
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
  compact = false,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "idle";
  compact?: boolean;
}) {
  const color = tone === "good" ? "text-[#7DFFA6]" : tone === "warn" ? "text-[#FFD875]" : "text-white";
  return (
    <div className="rounded-lg border border-white/8 bg-[#171C29] p-3">
      <p className="text-[12px] font-semibold text-white/44">{label}</p>
      <p className={`mt-1 truncate font-black ${compact ? "text-[13px]" : "text-[22px]"} ${color}`}>{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  wide = false,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`rounded-lg border border-white/8 bg-[#111827] p-4 sm:p-5 ${wide ? "xl:col-span-2" : ""}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold text-white">{title}</h2>
        <FontAwesomeIcon icon={icon} className="text-[18px] text-[#FFD875]" />
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] font-semibold text-white/64">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[48px] rounded-md border border-white/10 bg-[#0B0D13] px-3 text-[15px] text-white outline-none transition focus:border-[#FFD875]/55"
      />
    </label>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  type = "button",
  variant = "primary",
}: {
  label: string;
  icon: any;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md px-5 text-[15px] font-bold transition ${
        variant === "primary"
          ? "bg-[#FFD875] text-black hover:bg-[#FFE49A]"
          : "border border-white/10 bg-white/6 text-white hover:bg-white/10"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="text-xs" />
      {label}
    </button>
  );
}

function StatusBlock({
  title,
  status,
  detail,
  meta,
}: {
  title: string;
  status: CheckStatus;
  detail: string;
  meta?: string;
}) {
  return (
    <div className="rounded-md border border-white/8 bg-[#0B0D13] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-white">{title}</p>
        <span className={`rounded px-2 py-1 text-[11px] font-bold ${statusClass(status)}`}>{formatStatus(status)}</span>
      </div>
      <p className="mt-3 text-[13px] text-white/62">{detail}</p>
      {meta && <p className="mt-2 truncate text-[12px] text-white/34">{meta}</p>}
    </div>
  );
}

function ApiCard({ item }: { item: ApiCheck }) {
  return (
    <div className="rounded-md border border-white/8 bg-[#0B0D13] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-white">{item.label}</p>
          <p className="mt-1 truncate text-[12px] text-white/38">{item.url}</p>
        </div>
        <span className={`rounded px-2 py-1 text-[11px] font-bold ${statusClass(item.status)}`}>
          {formatStatus(item.status)}
        </span>
      </div>
      <p className="mt-3 text-[13px] text-white/62">
        {item.message}
        {item.latencyMs ? ` · ${item.latencyMs}ms` : ""}
      </p>
    </div>
  );
}

function MovieLookupRow({
  item,
  onOpen,
  onCopy,
}: {
  item: MovieLookupItem;
  onOpen: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-md border border-white/8 bg-[#0B0D13] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-white">{item.name || "Chưa có tên"}</p>
          <p className="mt-1 truncate text-[12px] text-white/42">{item.origin_name || item.slug || "Chưa có tên gốc"}</p>
        </div>
        <span className="shrink-0 rounded bg-white/8 px-2 py-1 text-[11px] font-bold text-white/56">
          {item.slug || "no-slug"}
        </span>
      </div>
      <p className="mt-3 text-[12px] leading-5 text-white/54">{formatMovieTags(item)}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md bg-[#FFD875] px-3 text-[13px] font-bold text-black transition hover:bg-[#FFE49A]"
        >
          <FontAwesomeIcon icon={faAngleRight} className="text-[11px]" />
          Mở chi tiết
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-white/10 bg-white/6 px-3 text-[13px] font-bold text-white transition hover:bg-white/10"
        >
          <FontAwesomeIcon icon={faCopy} className="text-[11px]" />
          Copy slug
        </button>
      </div>
    </div>
  );
}

function RouteRow({
  item,
  compact = false,
  onOpen,
}: {
  item: RouteCheck;
  compact?: boolean;
  onOpen?: () => void;
}) {
  return (
    <div className="flex min-h-[54px] items-center justify-between gap-3 rounded-md border border-white/8 bg-[#0B0D13] px-3">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold text-white">{item.label}</p>
        {!compact && <p className="truncate text-[12px] text-white/36">{item.path}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <span className={`rounded px-2 py-1 text-[11px] font-bold ${statusClass(item.status)}`}>
            {formatStatus(item.status)}
          </span>
          <p className="mt-1 text-[11px] text-white/38">{item.latencyMs ? `${item.latencyMs}ms` : item.message}</p>
        </div>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/8 bg-white/5 text-white/62 transition hover:bg-white/10 hover:text-white"
            aria-label={`Mở ${item.label}`}
          >
            <FontAwesomeIcon icon={faAngleRight} className="text-[11px]" />
          </button>
        )}
      </div>
    </div>
  );
}
