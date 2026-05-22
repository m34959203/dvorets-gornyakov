// Иконки для chiaroscuro-редизайна v4 (порт из дизайн-бандла shared.jsx).
// Тонкие линейные SVG, currentColor — наследуют цвет родителя.

export type DgIconName =
  | "arrow" | "chev-d" | "chev-l" | "chev-r"
  | "calendar" | "clock" | "pin" | "coin" | "phone" | "mail"
  | "menu" | "close" | "search" | "user" | "users"
  | "ig" | "fb" | "yt" | "tg"
  | "mic" | "dance" | "music" | "theatre" | "brush" | "sport" | "craft" | "stars";

interface DgIconProps {
  name: DgIconName;
  size?: number;
  stroke?: number;
}

export default function DgIcon({ name, size = 18, stroke = 1.4 }: DgIconProps) {
  const s = {
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const thin = { ...s, strokeWidth: 1.3 };
  switch (name) {
    case "arrow":    return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
    case "chev-d":   return <svg viewBox="0 0 24 24" style={s}><path d="M6 9l6 6 6-6" /></svg>;
    case "chev-l":   return <svg viewBox="0 0 24 24" style={s}><path d="M15 6l-6 6 6 6" /></svg>;
    case "chev-r":   return <svg viewBox="0 0 24 24" style={s}><path d="M9 6l6 6-6 6" /></svg>;
    case "calendar": return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case "clock":    return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "pin":      return <svg viewBox="0 0 24 24" style={s}><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case "coin":     return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" /><path d="M9 9h4.5a2 2 0 0 1 0 4H9M9 13h5a2 2 0 0 1 0 4H9M9 7v10" /></svg>;
    case "phone":    return <svg viewBox="0 0 24 24" style={s}><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
    case "mail":     return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
    case "menu":     return <svg viewBox="0 0 24 24" style={s}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "close":    return <svg viewBox="0 0 24 24" style={s}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "search":   return <svg viewBox="0 0 24 24" style={s}><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></svg>;
    case "user":     return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "users":    return <svg viewBox="0 0 24 24" style={s}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-6-7" /></svg>;
    case "ig":       return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>;
    case "fb":       return <svg viewBox="0 0 24 24" style={s}><path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h2V3Z" /></svg>;
    case "yt":       return <svg viewBox="0 0 24 24" style={s}><rect x="2" y="6" width="20" height="12" rx="3" /><path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor" /></svg>;
    case "tg":       return <svg viewBox="0 0 24 24" style={s}><path d="M21 4L3 11l5 2 2 6 3-4 4 3 4-14Z" /></svg>;
    case "mic":      return <svg viewBox="0 0 24 24" style={thin}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>;
    case "dance":    return <svg viewBox="0 0 24 24" style={thin}><circle cx="12" cy="5" r="2" /><path d="M12 7v6m0 0l-3 4m3-4l3 4M9 11l-3-1m6 1l3-1" /></svg>;
    case "music":    return <svg viewBox="0 0 24 24" style={thin}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    case "theatre":  return <svg viewBox="0 0 24 24" style={thin}><path d="M3 4h18v10a6 6 0 0 1-12 0V4M9 9h.01M15 9h.01M9 13s1 2 3 2 3-2 3-2" /></svg>;
    case "brush":    return <svg viewBox="0 0 24 24" style={thin}><path d="M14 3l7 7-9 9-5-1-1-5 8-10ZM4 20s2-2 4-1" /></svg>;
    case "sport":    return <svg viewBox="0 0 24 24" style={thin}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
    case "craft":    return <svg viewBox="0 0 24 24" style={thin}><path d="M5 21l5-5-2-2-5 5v2h2ZM12 14l5-5 4 4-5 5-4-4ZM14 12l4-4-2-2-4 4" /></svg>;
    case "stars":    return <svg viewBox="0 0 24 24" style={thin}><path d="M12 3l2.4 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.5L12 3ZM5 19h2M19 19h2M5 5h.01M19 5h.01" /></svg>;
    default: return null;
  }
}
