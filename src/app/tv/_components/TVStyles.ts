// TV Theme & Style Constants
// All styles are inline to bypass Tailwind/PostCSS and ensure compatibility with TV browsers

export const COLORS = {
  bg: "#0B0D13",
  bgCard: "#111827",
  bgCardHover: "#1a2035",
  bgSurface: "#1a1c2e",
  bgOverlay: "rgba(0,0,0,0.7)",
  accent: "#FFD875",
  accentHover: "#FFE49A",
  accentDark: "#f0a500",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  textDim: "rgba(255,255,255,0.4)",
  border: "rgba(255,255,255,0.1)",
  borderFocus: "#FFD875",
  success: "#7dffa6",
  error: "#ff6b6b",
  gold: "#FFD875",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "20px",
  xl: "28px",
  xxl: "36px",
  hero: "48px",
  family: "Arial, Helvetica, sans-serif",
} as const;

export const RADIUS = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  full: "50px",
} as const;

// Common style objects
export const styles = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: FONT.family,
    padding: 0,
    margin: 0,
  } as React.CSSProperties,

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: `0 ${SPACING.lg}px`,
  } as React.CSSProperties,

  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,

  flexBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,

  // Button styles
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
    color: "#000",
    fontWeight: 700,
    fontSize: FONT.md,
    border: "none",
    borderRadius: RADIUS.full,
    cursor: "pointer",
    minHeight: "48px",
    textDecoration: "none",
  } as React.CSSProperties,

  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "rgba(255,255,255,0.1)",
    color: COLORS.text,
    fontWeight: 600,
    fontSize: FONT.sm,
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADIUS.full,
    cursor: "pointer",
    minHeight: "48px",
    textDecoration: "none",
  } as React.CSSProperties,

  // Card styles
  card: {
    background: COLORS.bgCard,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    cursor: "pointer",
    border: `1px solid ${COLORS.border}`,
    textDecoration: "none",
    color: COLORS.text,
    display: "block",
  } as React.CSSProperties,

  // Section header
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: FONT.xl,
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
  } as React.CSSProperties,

  // Movie grid
  movieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
  } as React.CSSProperties,

  // Horizontal scroll row
  horizontalRow: {
    display: "flex",
    gap: "14px",
    overflowX: "auto" as const,
    paddingBottom: "8px",
    scrollBehavior: "smooth" as const,
  } as React.CSSProperties,

  // Badge
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: FONT.xs,
    fontWeight: 700,
    background: COLORS.accent,
    color: "#000",
  } as React.CSSProperties,

  // Tag (category, quality, etc.)
  tag: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: RADIUS.full,
    fontSize: FONT.xs,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.textMuted,
  } as React.CSSProperties,

  // Loading spinner
  spinner: {
    width: "48px",
    height: "48px",
    border: `4px solid ${COLORS.border}`,
    borderTopColor: COLORS.accent,
    borderRadius: "50%",
    animation: "tvspin 0.8s linear infinite",
  } as React.CSSProperties,
} as const;
