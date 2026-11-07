import { Html } from "@react-three/drei";
import { ScreenText } from "@vincentt-xr/sdk";

/**
 * "PLAY AGAIN": the label is a literal `ScreenText` the visual editor can
 * retype; an invisible DOM button of the same size sits over it so a tap or a
 * click still resets the round. A fist aimed at it resets too (ShooterGame).
 */
export const ShooterResetButton = ({ visible, onReset }: { visible: boolean; onReset: () => void }) => (
  <>
    <ScreenText
      name="Play again button"
      text="PLAY AGAIN"
      screenTransform={{ position: { x: 0, y: -230 }, size: { width: 270, height: 78 }, rotation: 0, renderOrder: 100 }}
      fontFamily="system-ui, sans-serif"
      fontSize={34}
      fontWeight={700}
      letterSpacing={0.04}
      color="#ffffff"
      strokeLayers={[]}
      shadowLayers={[]}
      textAlign="center"
      verticalAlign="center"
      bgFit="full"
      bgColor="#000000"
      bgOpacity={0}
      borderColor="rgba(255, 255, 255, 0.7)"
      borderWidth={2}
      borderRadius={15}
      visible={visible}
    />
    {visible ? (
      <Html
        calculatePosition={(_, __, size) => [size.width / 2, size.height * 0.68, 0]}
        zIndexRange={[20, 0]}
        pointerEvents="auto"
        style={{ transform: "translate(-50%, -50%)", pointerEvents: "auto" }}
      >
        <button
          type="button"
          aria-label="Play again"
          onClick={onReset}
          style={{ width: 150, height: 44, padding: 0, border: 0, background: "transparent", cursor: "pointer" }}
        />
      </Html>
    ) : null}
  </>
);
