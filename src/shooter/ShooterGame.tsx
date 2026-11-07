import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ScreenSpaceUI,
  XRModel,
} from "@vincentt-xr/sdk";
import { useXRModelNode } from "@vincentt-xr/sdk/low-level";
import { GestureTracker, HandTracker } from "@vincentt-xr/sdk/tracking";

import { AmmoCounter, AmmoIcon, Bottle, Crosshair, Gun, ScoreCounter } from "./ShooterLayer";
import { ShooterInstruction, type InstructionStep } from "./ShooterInstruction";
import { ShooterResetButton } from "./ShooterResetButton";
import { BOTTLE_RECT, CROSSHAIR_RECT, SHOOTER_GAME } from "./settings";

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

const smashOpacityAt = (elapsed: number) => {
  const fadeIn = Math.min(1, elapsed / SMASH_FADE_IN_DURATION);
  const fadeOut = 1 - Math.max(0, elapsed - SMASH_HOLD_DURATION) / SMASH_FADE_OUT_DURATION;
  return Math.max(0, fadeIn * fadeOut);
};

export const ShooterGame = () => {
  const game = SHOOTER_GAME;
  const [time, setTime] = useState(0);
  const [ammo, setAmmo] = useState<number>(game.numberOfBullet);
  const [lastShotAt, setLastShotAt] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasShot, setHasShot] = useState(false);
  const gunShotAudioRef = useRef<HTMLAudioElement | null>(null);
  const [aimX, setAimX] = useState<number>(CROSSHAIR_RECT.x);
  const [aimY, setAimY] = useState<number>(CROSSHAIR_RECT.y);
  const [bottles, setBottles] = useState<BottleState[]>(() => createBottleState(game.bottleCount));
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

  const liveCount = bottles.filter((bottle) => !bottle.broken).length;
  const score = game.bottleCount - liveCount;
  const resultTarget = clamp(game.resultTarget ?? game.bottleCount, 1, game.bottleCount);
  const didWin = score >= resultTarget;
  const gameOver = ammo <= 0 || didWin;
  let instruction: InstructionStep = null;
  if (gameOver) instruction = "playAgain";
  else if (!hasShot) instruction = hasStarted ? "shoot" : "start";
  const recoilElapsed = lastShotAt === null ? Number.POSITIVE_INFINITY : time - lastShotAt;
  const recoilProgress = Math.min(1, Math.max(0, recoilElapsed / RECOIL_DURATION));
  const recoilWave = recoilElapsed > RECOIL_SETTLE_DURATION ? 0 : Math.sin(recoilProgress * Math.PI);
  const shotPopupElapsed = lastShotAt === null ? Number.POSITIVE_INFINITY : time - lastShotAt;
  const shotPopupScale = 1 + Math.max(0, 1 - shotPopupElapsed / CROSSHAIR_POP_DURATION) * CROSSHAIR_POP_SCALE;
  const crosshairPosition = { x: aimX, y: gameOver ? aimY : CROSSHAIR_RECT.y };

  const bottleLayout = useMemo(() => {
    const base = BOTTLE_RECT;
    const extraGap = Math.max(0, game.gapBetweenBottles) / SCREEN_PIXELS_PER_UNIT;
    const gap = base.width + extraGap;
    const duration = Math.max(0.1, game.movingDuration);
    const phase = (time % duration) / duration;
    const trackSpan = Math.max(gap, bottles.length * gap);
    const travel = phase * trackSpan;

    return bottles.map((bottle) => {
      const wrappedTrackX = ((bottle.id * gap + travel) % trackSpan + trackSpan) % trackSpan;
      return {
        ...bottle,
        x: base.x + SCREEN_TRACK_LEFT - gap + wrappedTrackX,
        y: base.y,
        width: base.width,
        height: base.height,
      };
    });
  }, [bottles, game, time]);

  const shoot = () => {
    if (!hasStarted || gameOver || ammo <= 0) return;
    const gunShotAudio = gunShotAudioRef.current;
    if (gunShotAudio) {
      gunShotAudio.currentTime = 0;
      gunShotAudio.play().catch(() => undefined);
    }
    setHasShot(true);
    setLastShotAt(time);

    const crosshairRect = {
      x: aimX,
      y: CROSSHAIR_RECT.y,
      width: CROSSHAIR_RECT.width,
      height: CROSSHAIR_RECT.height,
    };
    const hit = bottleLayout.find((bottle) => (
      !bottle.broken
      && overlaps(crosshairRect, bottle, game.bottleHitPadding)
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
    setAmmo(game.numberOfBullet);
    setLastShotAt(null);
    setHasShot(false);
    setHasStarted(false);
    setAimX(CROSSHAIR_RECT.x);
    setAimY(CROSSHAIR_RECT.y);
    setBottles(createBottleState(game.bottleCount));
  };

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
        <mesh position={[0, 0, -0.01]} renderOrder={-10}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <ScreenSpaceUI>
          {bottleLayout.map((bottle) => {
            const elapsed = bottle.hitAt === null ? 0 : Math.max(0, time - bottle.hitAt);
            const { broken } = bottle;
            return (
              <Bottle
                key={bottle.id}
                x={bottle.x - BOTTLE_RECT.x}
                broken={broken}
                bottomDrop={Math.min(BOTTOM_DROP_MAX, elapsed * BOTTOM_DROP_SPEED)}
                bottomOpacity={broken ? Math.max(0, 1 - elapsed / BOTTOM_FADE_DURATION) : 0}
                smashedOpacity={broken ? smashOpacityAt(elapsed) : 0}
              />
            );
          })}
          <Gun rotation={recoilWave * 5 - recoilWave * recoilProgress * 10} />
          <Crosshair
            offset={{ x: crosshairPosition.x - CROSSHAIR_RECT.x, y: crosshairPosition.y - CROSSHAIR_RECT.y }}
            scale={shotPopupScale}
          />
          <AmmoIcon />
          <AmmoCounter ammo={ammo} />
          <ScoreCounter score={score} target={resultTarget} />
          <ShooterInstruction step={instruction} />
          <ShooterResetButton visible={gameOver} onReset={reset} />
        </ScreenSpaceUI>
      </group>
    </>
  );
};
