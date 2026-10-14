// TV Theme & Style Constants
// All styles are inline to bypass Tailwind/PostCSS and ensure compatibility with TV browsers
// Synced with Cinematic Design System tokens from globals.css

export const COLORS = {
  // Backgrounds — synced with --cinema-bg-* tokens
  bg: "#0A0C14",          // was #0B0D13 → now matches --cinema-bg-base
  bgDeep: "#06070C",      // NEW: --cinema-bg-deep (for darkest areas)
  bgCard: "#171B28",      // was #111827 → now matches --cinema-bg-card
  bgCardHover: "#1E2338", // updated to complement new card bg
  bgSurface: "#131620",   // was #1a1c2e → now matches --cinema-bg-surface
  bgOverlay: "rgba(0,0,0,0.7)",
  // Accent colors
  accent: "#FFD875",
  accentHover: "#FFE49A",
  accentDark: "#f0a500",
  // Text
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  textDim: "rgba(255,255,255,0.4)",
  // Borders
  border: "rgba(255,255,255,0.1)",
  borderFocus: "#FFD875",
  // Status
  success: "#7dffa6",
  error: "#ff6b6b",
  warning: "#f0a500",
  gold: "#FFD875",
  // Focus / D-pad navigation
  focusRing: "rgba(255, 216, 117, 0.45)",
  focusOutline: "#FFD875",
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
  xs: "14px",
  sm: "18px",
  md: "20px",
  lg: "24px",
  xl: "32px",
  xxl: "42px",
  hero: "60px",
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
    maxWidth: "1760px",
    margin: "0 auto",
    padding: `0 40px`,
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
    padding: "18px 34px",
    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
    color: "#000",
    fontWeight: 700,
    fontSize: FONT.lg,
    border: "none",
    borderRadius: RADIUS.full,
    cursor: "pointer",
    minHeight: "60px",
    textDecoration: "none",
  } as React.CSSProperties,

  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 30px",
    background: "rgba(255,255,255,0.1)",
    color: COLORS.text,
    fontWeight: 600,
    fontSize: FONT.md,
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADIUS.full,
    cursor: "pointer",
    minHeight: "60px",
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
    marginBottom: "24px",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  } as React.CSSProperties,

  // Horizontal scroll row
  horizontalRow: {
    display: "flex",
    gap: "20px",
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

  // Focus state for D-pad / remote navigation
  focusRing: {
    outline: `3px solid ${COLORS.focusOutline}`,
    boxShadow: `0 0 0 3px ${COLORS.focusRing}`,
    transform: "translateY(-4px) scale(1.02)",
  } as React.CSSProperties,

  // Toast notification
  toast: {
    position: "fixed" as const,
    top: "90px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 200,
    padding: "12px 24px",
    background: COLORS.bgSurface,
    border: `1px solid rgba(255,216,117,0.25)`,
    borderRadius: RADIUS.md,
    color: COLORS.accent,
    fontSize: FONT.sm,
    fontWeight: 600,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  } as React.CSSProperties,

  // Progress bar (for continue watching)
  progressBar: {
    height: "3px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "2px",
    overflow: "hidden" as const,
    marginTop: "6px",
  } as React.CSSProperties,

  progressFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
    borderRadius: "2px",
  } as React.CSSProperties,
} as const;
