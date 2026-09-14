import { Html } from "@react-three/drei";

export const ShooterResetButton = ({ onReset }: { onReset: () => void }) => (
  <Html
    calculatePosition={(_, __, size) => [size.width / 2, size.height * 0.68, 0]}
    zIndexRange={[20, 0]}
    pointerEvents="auto"
    style={{
      transform: "translate(-50%, -50%)",
      pointerEvents: "auto",
    }}
  >
    <button
      type="button"
      onClick={onReset}
      style={{
        padding: "10px 20px",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: 8,
        background: "transparent",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
    >
      PLAY AGAIN
    </button>
  </Html>
);
