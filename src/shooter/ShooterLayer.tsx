// Every picture here is a `ScreenImage` with a literal `src`, `fit` and literal
// `anchors`, and every fixed line of copy is a `ScreenText` with literal `text`,
// so the console's visual editor can swap, move, resize and retype each one.
// Keep them written out like this: a value read from a variable can only be
// changed in code. Motion (the moving bottles, the recoil, the aim, the pop)
// lives on the wrapping <group>, never on the image itself.
//
// Anchors are normalized screen edges: -1..1 across the screen, centre origin,
// y up. Render order, back to front: bottles (20-36), gun (60), crosshair (70),
// bullet icon (80), counters (90), prompts (100).
import type { ReactNode } from "react";
import { ScreenImage, ScreenText } from "@vincentt-xr/sdk";
import { useScreenSpace } from "@vincentt-xr/sdk/low-level";

type Point = { x: number; y: number };

/**
 * Moves, turns and scales its children about `pivot`, all in normalized screen
 * units. `offset` shifts the pivot; `rotation` is in degrees, counter-clockwise.
 */
const Motion = ({
  name,
  pivot = { x: 0, y: 0 },
  offset = { x: 0, y: 0 },
  rotation = 0,
  scale = 1,
  children,
}: {
  name: string;
  pivot?: Point;
  offset?: Point;
  rotation?: number;
  scale?: number;
  children: ReactNode;
}) => {
  const { width, height } = useScreenSpace();
  const toWorld = (p: Point): [number, number, number] => [(p.x * width) / 2, (p.y * height) / 2, 0];
  return (
    <group
      name={name}
      position={toWorld({ x: pivot.x + offset.x, y: pivot.y + offset.y })}
      rotation={[0, 0, (rotation * Math.PI) / 180]}
      scale={[scale, scale, 1]}
    >
      <group position={toWorld({ x: -pivot.x, y: -pivot.y })}>{children}</group>
    </group>
  );
};

/** One bottle in the moving row, `x` away from its authored place. */
export const Bottle = ({
  x,
  broken,
  bottomDrop,
  bottomOpacity,
  smashedOpacity,
}: {
  x: number;
  broken: boolean;
  bottomDrop: number;
  bottomOpacity: number;
  smashedOpacity: number;
}) => (
  <>
    <Motion name="Bottle" offset={{ x, y: 0 }}>
      <ScreenImage name="Bottle" src="/images/Whole bottle.png" fit="contain" transparent renderOrder={20} opacity={broken ? 0 : 1} anchors={{ left: -0.08, right: 0.08, top: 1.09, bottom: 0.51 }} />
      <ScreenImage name="Broken pieces" src="/images/Smashed bottle.png" fit="contain" transparent renderOrder={30} opacity={smashedOpacity} anchors={{ left: -0.17, right: 0.17, top: 0.78, bottom: 0.54 }} />
      <ScreenImage name="Top half bottle" src="/images/Top half bottle.png" fit="contain" transparent renderOrder={35} opacity={broken ? 1 : 0} anchors={{ left: -0.08, right: 0.08, top: 1.21, bottom: 0.51 }} />
    </Motion>
    <Motion name="Falling bottom half" offset={{ x, y: -bottomDrop }}>
      <ScreenImage name="Bottom half bottle" src="/images/Bottom half bottle.png" fit="contain" transparent renderOrder={36} opacity={bottomOpacity} anchors={{ left: -0.08, right: 0.08, top: 0.745, bottom: 0.495 }} />
    </Motion>
  </>
);

/** The gun, turned by `rotation` degrees about its own centre for the recoil. */
export const Gun = ({ rotation }: { rotation: number }) => (
  <Motion name="Gun recoil" pivot={{ x: -0.25, y: -0.74 }} rotation={rotation}>
    <ScreenImage name="Holding guns" src="/images/Holding guns.png" fit="contain" opacity={1} transparent renderOrder={60} anchors={{ left: -1.5, right: 1, top: 0.51, bottom: -1.99 }} />
  </Motion>
);

/** The crosshair, `offset` away from its authored place and popped by `scale`. */
export const Crosshair = ({ offset, scale }: { offset: Point; scale: number }) => (
  <Motion name="Aim" pivot={{ x: 0, y: 0.7 }} offset={offset} scale={scale}>
    <ScreenImage name="Crosshair" src="/images/Crosshair.png" fit="contain" opacity={1} transparent renderOrder={70} anchors={{ left: -0.11, right: 0.11, top: 0.81, bottom: 0.59 }} />
  </Motion>
);

export const AmmoIcon = () => (
  <ScreenImage name="Bullet icon" src="/images/Bullet.png" fit="contain" opacity={1} transparent renderOrder={80} anchors={{ left: -0.8, right: -0.72, top: -0.695, bottom: -0.945 }} />
);

const COUNTER_SHADOW = [{ color: "#000000", blur: 14, offsetX: 8, offsetY: -8, opacity: 0.6 }];

/** Bullets left. The number is the game's state, so this text is set in code. */
export const AmmoCounter = ({ ammo }: { ammo: number }) => (
  <ScreenText
    name="Bullet number"
    text={`x${ammo}`}
    screenTransform={{ position: { x: -201.6, y: -544 }, size: { width: 720, height: 240 }, rotation: 0, renderOrder: 90 }}
    fontFamily='"Space Grotesk", sans-serif'
    fontSize={60}
    lineSpacing={0.3}
    color="#ffffff"
    strokeLayers={[{ color: "#120807", width: 8, opacity: 1 }]}
    shadowLayers={COUNTER_SHADOW}
    textAlign="center"
    verticalAlign="center"
    resolution={2048}
  />
);

/** Bottles hit out of the target. Set in code, like the bullet number. */
export const ScoreCounter = ({ score, target }: { score: number; target: number }) => (
  <ScreenText
    name="Score"
    text={`${score} / ${target}`}
    screenTransform={{ position: { x: 262.8, y: -384 }, size: { width: 240, height: 240 }, rotation: 0, renderOrder: 90 }}
    fontFamily='"Space Grotesk", sans-serif'
    fontSize={60}
    lineSpacing={0.3}
    color="#ffffff"
    strokeLayers={[{ color: "#120807", width: 10, opacity: 1 }]}
    shadowLayers={COUNTER_SHADOW}
    textAlign="center"
    verticalAlign="center"
    resolution={2048}
  />
);
