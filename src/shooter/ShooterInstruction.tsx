import { Html } from "@react-three/drei";

const instructionStyle = {
  width: "calc(100vw - 32px)",
  color: "#ffffff",
  fontFamily: "system-ui, sans-serif",
  fontSize: "clamp(16px, 3.5vw, 28px)",
  fontWeight: 800,
  letterSpacing: "0.04em",
  lineHeight: 1.2,
  textAlign: "center" as const,
  whiteSpace: "normal" as const,
  pointerEvents: "none" as const,
};

export const ShooterInstruction = ({ text }: { text: string }) => (
  <Html
    calculatePosition={(_, __, size) => [size.width / 2, size.height / 2, 0]}
    zIndexRange={[10, 0]}
    pointerEvents="none"
    style={{
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  >
    <div style={instructionStyle}>{text}</div>
  </Html>
);
