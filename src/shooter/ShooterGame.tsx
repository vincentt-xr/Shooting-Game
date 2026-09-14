import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ScreenSpaceUI,
  XRModel,
} from "@vincentt-xr/sdk";
import { useXRModelNode } from "@vincentt-xr/sdk/low-level";
import { GestureTracker, HandTracker } from "@vincentt-xr/sdk/tracking";

import { ShooterImageLayer, ShooterTextLayer } from "./ShooterLayer";
import { ShooterInstruction } from "./ShooterInstruction";
import { ShooterResetButton } from "./ShooterResetButton";
import type {
  ShooterScreenTransform2DSettings,
  ShooterSettings,
} from "./settings";

type BottleState = {
  id: number;
  broken: boolean;
  hitAt: number | null;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HandNode = {
  coordinates?: Array<{ x: number; y: number; z?: number }>;
  gesture?: "closed_fist" | "open_palm";
};

type GestureNode = {
  gesture?: "closed_fist" | "open_palm" | "pointing_up" | "thumb_down" | "thumb_up" | "victory" | "i_love_you" | "none";
};

const SCREEN_TRACK_LEFT = -1.12;
const SCREEN_PIXELS_PER_UNIT = 720;
const RECOIL_DURATION = 0.18;
const RECOIL_SETTLE_DURATION = 0.26;
const CROSSHAIR_POP_DURATION = 0.42;
const CROSSHAIR_POP_SCALE = 0.45;
const SMASH_FADE_IN_DURATION = 0.12;
const SMASH_HOLD_DURATION = 0.35;
const SMASH_FADE_OUT_DURATION = 0.65;
const BOTTOM_DROP_SPEED = 0.42;
const BOTTOM_DROP_MAX = 0.55;
const BOTTOM_FADE_DURATION = 1.4;
const RESET_BUTTON_AIM_TOLERANCE = 0.35;
const RESET_BUTTON_POSITION = { x: 0, y: -0.35 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const createBottleState = (count: number): BottleState[] => (
  Array.from({ length: count }, (_, id) => ({
    id,
    broken: false,
    hitAt: null,
  }))
);

const overlaps = (a: Rect, b: Rect, padding: number) => (
  Math.abs(a.x - b.x) <= (a.width + b.width) * 0.5 + padding
  && Math.abs(a.y - b.y) <= (a.height + b.height) * 0.5 + padding
);

const relativeToBottle = (
  bottle: { x: number; y: number },
  base: { x: number; y: number },
  part?: { x: number; y: number },
) => ({
  x: bottle.x + ((part?.x ?? base.x) - base.x),
  y: bottle.y + ((part?.y ?? base.y) - base.y),
});

const smashOpacityAt = (elapsed: number) => {
  const fadeIn = Math.min(1, elapsed / SMASH_FADE_IN_DURATION);
  const fadeOut = 1 - Math.max(0, elapsed - SMASH_HOLD_DURATION) / SMASH_FADE_OUT_DURATION;
  return Math.max(0, fadeIn * fadeOut);
};

export const ShooterGame = ({
  settings,
  onSettingsChange,
}: {
  settings: ShooterSettings;
  onSettingsChange?: (next: ShooterSettings) => void;
}) => {
  const [time, setTime] = useState(0);
  const [ammo, setAmmo] = useState(settings.game.numberOfBullet);
  const [lastShotAt, setLastShotAt] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasShot, setHasShot] = useState(false);
  const gunShotAudioRef = useRef<HTMLAudioElement | null>(null);
  const [aimX, setAimX] = useState(settings.layers.crosshair.image?.screenImage.transformation.position.x ?? 0);
  const [aimY, setAimY] = useState(settings.layers.crosshair.image?.screenImage.transformation.position.y ?? 0.7);
  const [bottles, setBottles] = useState<BottleState[]>(() => createBottleState(settings.game.bottleCount));
  const previousGestureRef = useRef<HandNode["gesture"]>();
  const previousResultGestureRef = useRef<GestureNode["gesture"]>();
  const handNode = useXRModelNode<HandNode>(XRModel.HAND_TRACKER);
  const gestureNode = useXRModelNode<GestureNode>(XRModel.GESTURE_TRACKER);

  useEffect(() => {
    const audio = new Audio("/audio/gun-shot.mp3");
    audio.preload = "auto";
    gunShotAudioRef.current = audio;

    return () => {
      audio.pause();
      gunShotAudioRef.current = null;
    };
  }, []);

  const bottleTransform = settings.layers.bottles.image?.screenImage.transformation;
  const topTransform = settings.layers.topHalfBottle.image?.screenImage.transformation;
  const bottomTransform = settings.layers.bottomHalfBottle.image?.screenImage.transformation;
  const smashedTransform = settings.layers.brokenPieces.image?.screenImage.transformation;
  const crosshairTransform = settings.layers.crosshair.image?.screenImage.transformation;
  const liveCount = bottles.filter((bottle) => !bottle.broken).length;
  const score = settings.game.bottleCount - liveCount;
  const resultTarget = clamp(settings.game.resultTarget ?? settings.game.bottleCount, 1, settings.game.bottleCount);
  const didWin = score >= resultTarget;
  const gameOver = ammo <= 0 || didWin;
  let instruction = "SHOW YOUR HAND TO START";
  if (hasStarted) instruction = "MAKE A FIST TO SHOOT";
  if (gameOver) instruction = "SHOW YOUR HAND TO PLAY AGAIN";
  const recoilElapsed = lastShotAt === null ? Number.POSITIVE_INFINITY : time - lastShotAt;
  const recoilProgress = Math.min(1, Math.max(0, recoilElapsed / RECOIL_DURATION));
  const recoilWave = recoilElapsed > RECOIL_SETTLE_DURATION ? 0 : Math.sin(recoilProgress * Math.PI);
  const gunRotation = settings.layers.gun.image?.screenImage.transformation.rotation ?? 0;
  const shotPopupElapsed = lastShotAt === null ? Number.POSITIVE_INFINITY : time - lastShotAt;
  const shotPopupScale = 1 + Math.max(0, 1 - shotPopupElapsed / CROSSHAIR_POP_DURATION) * CROSSHAIR_POP_SCALE;
  const crosshairBasePosition = crosshairTransform?.position ?? { x: 0, y: 0.7 };
  const crosshairPosition = { x: aimX, y: gameOver ? aimY : crosshairBasePosition.y };
  const crosshairSize = crosshairTransform?.size ?? { width: 0.22, height: 0.22 };
  const updateTextScreenTransform = (
    id: "ammoText" | "scoreText",
    screenTransform: ShooterScreenTransform2DSettings,
  ) => {
    const layer = settings.layers[id];
    if (!layer.text || !onSettingsChange) return;
    onSettingsChange({
      ...settings,
      layers: {
        ...settings.layers,
        [id]: {
          ...layer,
          text: {
            ...layer.text,
            screenText: {
              ...layer.text.screenText,
              screenTransform,
              transformation: {
                ...layer.text.screenText.transformation,
                showTransformGuides: screenTransform.showTransformGuides,
                position: screenTransform.position,
                size: screenTransform.size,
                rotation: screenTransform.rotation,
                pivot: screenTransform.pivot,
                renderOrder: screenTransform.renderOrder,
                overlay: screenTransform.overlay,
                visible: screenTransform.visible,
              },
            },
          },
        },
      },
    });
  };

  const bottleLayout = useMemo(() => {
    const base = bottleTransform?.position ?? { x: 0, y: 0.8 };
    const size = bottleTransform?.size ?? { width: 0.16, height: 0.58 };
    const extraGap = Math.max(0, settings.game.gapBetweenBottles) / SCREEN_PIXELS_PER_UNIT;
    const gap = size.width + extraGap;
    const duration = Math.max(0.1, settings.game.movingDuration);
    const phase = (time % duration) / duration;
    const trackSpan = Math.max(gap, bottles.length * gap);
    const travel = phase * trackSpan;

    return bottles.map((bottle) => {
      const wrappedTrackX = ((bottle.id * gap + travel) % trackSpan + trackSpan) % trackSpan;
      return {
        ...bottle,
        x: base.x + SCREEN_TRACK_LEFT - gap + wrappedTrackX,
        y: base.y,
        width: size.width,
        height: size.height,
      };
    });
  }, [bottleTransform, bottles, settings.game, time]);

  const shoot = () => {
    if (!hasStarted || gameOver || ammo <= 0 || !crosshairTransform) return;
    const gunShotAudio = gunShotAudioRef.current;
    if (gunShotAudio) {
      gunShotAudio.currentTime = 0;
      gunShotAudio.play().catch(() => undefined);
    }
    setHasShot(true);
    setLastShotAt(time);

    const crosshairRect = {
      x: aimX,
      y: crosshairTransform.position.y,
      width: crosshairTransform.size.width,
      height: crosshairTransform.size.height,
    };
    const hit = bottleLayout.find((bottle) => (
      !bottle.broken
      && overlaps(crosshairRect, bottle, settings.game.bottleHitPadding)
    ));

    setAmmo((current) => Math.max(0, current - 1));
    if (!hit) return;

    setBottles((current) => current.map((bottle) => (
      bottle.id === hit.id ? { ...bottle, broken: true, hitAt: time } : bottle
    )));
  };

  const unlockGunShotAudio = () => {
    const gunShotAudio = gunShotAudioRef.current;
    if (!gunShotAudio || !gunShotAudio.paused) return;
    gunShotAudio.muted = true;
    gunShotAudio.play().then(() => {
      gunShotAudio.pause();
      gunShotAudio.currentTime = 0;
      gunShotAudio.muted = false;
    }).catch(() => {
      gunShotAudio.muted = false;
    });
  };

  const reset = () => {
    setAmmo(settings.game.numberOfBullet);
    setLastShotAt(null);
    setHasShot(false);
    setHasStarted(false);
    setAimX(settings.layers.crosshair.image?.screenImage.transformation.position.x ?? 0);
    setAimY(settings.layers.crosshair.image?.screenImage.transformation.position.y ?? 0.7);
    setBottles(createBottleState(settings.game.bottleCount));
  };

  useEffect(() => {
    reset();
    // reset intentionally uses the current settings snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.game.numberOfBullet, settings.game.bottleCount, settings.game.resultTarget]);

  useFrame((_, delta) => {
    setTime((current) => current + delta);

    const gesture = handNode?.gesture;
    if (gesture === "open_palm" && handNode?.coordinates?.length) {
      if (!hasStarted) {
        setHasStarted(true);
      }
      const palmX = handNode.coordinates.reduce((sum, point) => sum + point.x, 0) / handNode.coordinates.length;
      setAimX((current) => current + (clamp(palmX, -0.9, 0.9) - current) * 0.32);
      if (gameOver) {
        const palmY = handNode.coordinates.reduce((sum, point) => sum + point.y, 0) / handNode.coordinates.length;
        setAimY(clamp(palmY, -0.9, 0.9));
      }
    }

    if (gesture === "closed_fist" && previousGestureRef.current !== "closed_fist") {
      if (gameOver) {
        const overResetButton = (
          Math.abs(aimX - RESET_BUTTON_POSITION.x) <= RESET_BUTTON_AIM_TOLERANCE
          && Math.abs(aimY - RESET_BUTTON_POSITION.y) <= RESET_BUTTON_AIM_TOLERANCE
        );
        if (overResetButton) reset();
      } else {
        shoot();
      }
    }
    previousGestureRef.current = gesture;

    const resultGesture = gestureNode?.gesture;
    previousResultGestureRef.current = resultGesture;
  });

  return (
    <>
      <HandTracker />
      <GestureTracker />
      <group
        onPointerDown={(event) => {
          event.stopPropagation();
          unlockGunShotAudio();
          shoot();
        }}
      >
        {/* eslint-disable react/no-unknown-property */}
        <mesh position={[0, 0, -0.01]} renderOrder={-10}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* eslint-enable react/no-unknown-property */}
        {(!hasShot || gameOver) && <ShooterInstruction text={instruction} />}
        {gameOver && <ShooterResetButton onReset={reset} />}
        <ScreenSpaceUI>
          {bottleLayout.map((bottle) => {
            const elapsed = bottle.hitAt === null ? 0 : Math.max(0, time - bottle.hitAt);
            const { broken } = bottle;
            const base = bottleTransform?.position ?? { x: 0, y: 0.8 };
            const topPosition = relativeToBottle(bottle, base, topTransform?.position);
            const bottomBase = relativeToBottle(bottle, base, bottomTransform?.position);
            const smashedPosition = relativeToBottle(bottle, base, smashedTransform?.position);
            const bottomDrop = Math.min(BOTTOM_DROP_MAX, elapsed * BOTTOM_DROP_SPEED);
            const bottomOpacity = broken ? Math.max(0, 1 - elapsed / BOTTOM_FADE_DURATION) : 0;
            const smashedOpacity = broken ? smashOpacityAt(elapsed) : 0;

            return (
              <group key={bottle.id}>
                <ShooterImageLayer
                  layer={settings.layers.bottles}
                  position={{ x: bottle.x, y: bottle.y }}
                  opacity={broken ? 0 : undefined}
                />
                <ShooterImageLayer
                  layer={settings.layers.topHalfBottle}
                  position={topPosition}
                  opacity={broken ? undefined : 0}
                />
                <ShooterImageLayer
                  layer={settings.layers.bottomHalfBottle}
                  position={{ x: bottomBase.x, y: bottomBase.y - bottomDrop }}
                  opacity={bottomOpacity}
                />
                <ShooterImageLayer
                  layer={settings.layers.brokenPieces}
                  position={smashedPosition}
                  opacity={smashedOpacity}
                />
              </group>
            );
          })}
          <ShooterImageLayer
            layer={settings.layers.gun}
            rotation={gunRotation + recoilWave * 5 - recoilWave * recoilProgress * 10}
          />
          <ShooterImageLayer
            layer={settings.layers.crosshair}
            position={crosshairPosition}
            size={{
              width: crosshairSize.width * shotPopupScale,
              height: crosshairSize.height * shotPopupScale,
            }}
          />
          <ShooterImageLayer layer={settings.layers.ammoIcon} />
          <ShooterTextLayer
            layer={settings.layers.ammoText}
            text={`x${ammo}`}
            onScreenTransformChange={(next) => updateTextScreenTransform("ammoText", next)}
          />
          <ShooterTextLayer
            layer={settings.layers.scoreText}
            text={`${score} / ${resultTarget}`}
            onScreenTransformChange={(next) => updateTextScreenTransform("scoreText", next)}
          />
        </ScreenSpaceUI>
      </group>
    </>
  );
};
