import { NextResponse } from "next/server";

export async function GET() {
  const results: any = {};
  
  try {
    const res1 = await fetch("https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1", { cache: "no-store" });
    results.kkphim = { status: res1.status, ok: res1.ok, data: (await res1.json()).status };
  } catch (e: any) {
    results.kkphimError = e.message;
  }

  try {
    const res2 = await fetch("https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1", { cache: "no-store" });
    results.nguonc = { status: res2.status, ok: res2.ok, data: (await res2.json()).status };
  } catch (e: any) {
    results.nguoncError = e.message;
  }

  try {
    const res3 = await fetch("https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1", { cache: "no-store" });
    results.ophim = { status: res3.status, ok: res3.ok };
  } catch (e: any) {
    results.ophimError = e.message;
  }

  return NextResponse.json(results);
}
