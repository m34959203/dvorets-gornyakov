interface MonogramProps {
  size?: number;
  light?: boolean;
}

export default function Monogram({ size = 46, light = false }: MonogramProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: light ? "rgba(247,241,230,0.12)" : "var(--emerald)",
        border: light ? "1.5px solid var(--ochre)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 28 28" fill="none">
        <path
          d="M14 4 C 5 8, 5 20, 14 24 C 23 20, 23 8, 14 4 Z"
          stroke="#d4a843"
          strokeWidth="1.4"
        />
        <circle cx="14" cy="14" r="2.4" fill="#d4a843" />
        <path d="M9 14 C 9 11, 11.5 9.5, 14 9.5" stroke="#d4a843" strokeWidth="1.2" />
        <path d="M19 14 C 19 11, 16.5 9.5, 14 9.5" stroke="#d4a843" strokeWidth="1.2" />
      </svg>
    </div>
  );
}
