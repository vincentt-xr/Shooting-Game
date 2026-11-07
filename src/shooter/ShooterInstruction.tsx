import { ScreenText } from "@vincentt-xr/sdk";

export type InstructionStep = "start" | "shoot" | "playAgain" | null;

/**
 * The centre prompt. One literal `ScreenText` per step, so the console's visual
 * editor can retype each; the game only chooses which one shows.
 */
export const ShooterInstruction = ({ step }: { step: InstructionStep }) => (
  <>
    <ScreenText
      name="Start prompt"
      text="SHOW YOUR HAND TO START"
      screenTransform={{ position: { x: 0, y: 0 }, size: { width: 688, height: 120 }, rotation: 0, renderOrder: 100 }}
      fontFamily="system-ui, sans-serif"
      fontSize={34}
      fontWeight={800}
      letterSpacing={0.04}
      color="#ffffff"
      strokeLayers={[]}
      shadowLayers={[]}
      textAlign="center"
      verticalAlign="center"
      visible={step === "start"}
    />
    <ScreenText
      name="Shoot prompt"
      text="MAKE A FIST TO SHOOT"
      screenTransform={{ position: { x: 0, y: 0 }, size: { width: 688, height: 120 }, rotation: 0, renderOrder: 100 }}
      fontFamily="system-ui, sans-serif"
      fontSize={34}
      fontWeight={800}
      letterSpacing={0.04}
      color="#ffffff"
      strokeLayers={[]}
      shadowLayers={[]}
      textAlign="center"
      verticalAlign="center"
      visible={step === "shoot"}
    />
    <ScreenText
      name="Play again prompt"
      text="SHOW YOUR HAND TO PLAY AGAIN"
      screenTransform={{ position: { x: 0, y: 0 }, size: { width: 688, height: 120 }, rotation: 0, renderOrder: 100 }}
      fontFamily="system-ui, sans-serif"
      fontSize={34}
      fontWeight={800}
      letterSpacing={0.04}
      color="#ffffff"
      strokeLayers={[]}
      shadowLayers={[]}
      textAlign="center"
      verticalAlign="center"
      visible={step === "playAgain"}
    />
  </>
);
