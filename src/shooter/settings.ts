import {
  DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS,
  DEFAULT_SCREEN_TEXT_SCENE_SETTINGS as SDK_DEFAULT_SCREEN_TEXT_SCENE_SETTINGS,
  type ScreenImageSceneSettings,
} from "@vincentt-xr/sdk";
import type {
  ScreenTextSceneSettings,
  ScreenTextSettings,
} from "@vincentt-xr/sdk/debug-ui";

export type ShooterLayerKind = "image" | "text" | "group";

export type ShooterLayerId =
  | "bottles"
  | "brokenPieces"
  | "topHalfBottle"
  | "bottomHalfBottle"
  | "gun"
  | "crosshair"
  | "ammoIcon"
  | "ammoText"
  | "scoreText";

export type ShooterImageLayerId = Extract<
  ShooterLayerId,
  | "gun"
  | "crosshair"
  | "ammoIcon"
  | "bottles"
  | "brokenPieces"
  | "topHalfBottle"
  | "bottomHalfBottle"
>;

export type ShooterTextLayerId = Extract<
  ShooterLayerId,
  "ammoText" | "scoreText"
>;

export type ShooterGameSettings = {
  numberOfBullet: number;
  bottleCount: number;
  resultTarget: number;
  gapBetweenBottles: number;
  movingDuration: number;
  bottleHitPadding: number;
};

export type ShooterScreenTransform2DSettings = {
  enabled: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  pivot: [number, number];
  rotation: number;
  scale2D: { x: number; y: number };
  referencePixelsPerUnit: number;
  renderOrder: number;
  overlay: boolean;
  visible: boolean;
  showTransformGuides: boolean;
};

export type ShooterTextSceneSettings = Omit<
  ScreenTextSceneSettings,
  "screenText"
> & {
  screenText: ScreenTextSettings & {
    screenTransform?: ShooterScreenTransform2DSettings;
  };
};

export type ShooterLayerSettings = {
  id: ShooterLayerId;
  label: string;
  kind: ShooterLayerKind;
  visible: boolean;
  enabled: boolean;
  locked?: boolean;
  renderOrder: number;
  image?: ScreenImageSceneSettings;
  text?: ShooterTextSceneSettings;
  textResolution?: number;
};

export type ShooterSettings = {
  version: 1;
  game: ShooterGameSettings;
  layers: Record<ShooterLayerId, ShooterLayerSettings>;
};

const DEFAULT_SCREEN_TRANSFORM_2D: ShooterScreenTransform2DSettings = {
  enabled: true,
  position: { x: 0, y: 0 },
  size: { width: 720, height: 1280 },
  pivot: [0.5, 0.5],
  rotation: 0,
  scale2D: { x: 1, y: 1 },
  referencePixelsPerUnit: 32,
  renderOrder: 999,
  overlay: true,
  visible: true,
  showTransformGuides: false,
};

const DEFAULT_SCREEN_TEXT_SCENE_SETTINGS: ShooterTextSceneSettings = {
  ...SDK_DEFAULT_SCREEN_TEXT_SCENE_SETTINGS,
  screenText: {
    ...SDK_DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText,
    screenTransform: DEFAULT_SCREEN_TRANSFORM_2D,
  },
  screenImage: DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage,
  screenSpaceUI: SDK_DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenSpaceUI,
};

const imageLayer = (
  id: ShooterImageLayerId,
  label: string,
  src: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  renderOrder: number,
): ShooterLayerSettings => ({
  id,
  label,
  kind: "image",
  visible: true,
  enabled: true,
  renderOrder,
  image: {
    ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS,
    screenImage: {
      ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage,
      transformation: {
        ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage.transformation,
        position,
        size,
        renderOrder,
        visible: true,
        overlay: true,
      },
      image: {
        ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage.image,
        sourceKind: "image",
        src,
        stretchMode: "fit",
        materialType: "unlit",
        transparent: true,
      },
    },
  },
});

const textLayer = (
  id: ShooterTextLayerId,
  label: string,
  text: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  renderOrder: number,
  fontSize = 84,
  strokeWidth = 10,
): ShooterLayerSettings => ({
  id,
  label,
  kind: "text",
  visible: true,
  enabled: true,
  renderOrder,
  textResolution: 2048,
  text: {
    ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS,
    screenText: {
      ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText,
      content: { text },
      transformation: {
        ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText.transformation,
        position,
        size,
        renderOrder,
        visible: true,
        overlay: true,
      },
      screenTransform: {
        ...DEFAULT_SCREEN_TRANSFORM_2D,
        position: { x: position.x * 360, y: position.y * 640 },
        size: {
          width: Math.max(240, size.width * 240),
          height: Math.max(160, size.height * 80),
        },
        pivot: [0.5, 0.5],
        rotation: 0,
        renderOrder,
        overlay: true,
        visible: true,
        showTransformGuides: false,
      },
      style: {
        ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText.style,
        fontSize,
        color: "#ffffff",
        aspect: size.width / size.height,
        strokeLayers: [{ color: "#120807", width: strokeWidth, opacity: 1 }],
        shadowLayers: [
          { color: "#000000", blur: 14, offsetX: 8, offsetY: -8, opacity: 0.6 },
        ],
      },
    },
  },
});

export const DEFAULT_SHOOTER_SETTINGS: ShooterSettings = {
  version: 1,
  game: {
    numberOfBullet: 10,
    bottleCount: 8,
    resultTarget: 8,
    gapBetweenBottles: 300,
    movingDuration: 7,
    bottleHitPadding: 0.03,
  },
  layers: {
    bottles: imageLayer(
      "bottles",
      "Bottles",
      "/images/Whole bottle.png",
      { x: 0, y: 0.8 },
      { width: 0.16, height: 0.58 },
      20,
    ),
    brokenPieces: imageLayer(
      "brokenPieces",
      "Broken Pieces",
      "/images/Smashed bottle.png",
      { x: 0, y: 0.66 },
      { width: 0.34, height: 0.24 },
      30,
    ),
    topHalfBottle: imageLayer(
      "topHalfBottle",
      "Top Half Bottle",
      "/images/Top half bottle.png",
      { x: 0, y: 0.86 },
      { width: 0.16, height: 0.7 },
      35,
    ),
    bottomHalfBottle: imageLayer(
      "bottomHalfBottle",
      "Bottom Half Bottle",
      "/images/Bottom half bottle.png",
      { x: 0, y: 0.62 },
      { width: 0.16, height: 0.25 },
      36,
    ),
    gun: imageLayer(
      "gun",
      "Holding Guns",
      "/images/Holding guns.png",
      { x: -0.25, y: -0.74 },
      { width: 2.5, height: 2.5 },
      60,
    ),
    crosshair: imageLayer(
      "crosshair",
      "Crosshair",
      "/images/Crosshair.png",
      { x: 0, y: 0.7 },
      { width: 0.22, height: 0.22 },
      70,
    ),
    ammoIcon: imageLayer(
      "ammoIcon",
      "Bullet Icon",
      "/images/Bullet.png",
      { x: -0.76, y: -0.82 },
      { width: 0.08, height: 0.25 },
      80,
    ),
    ammoText: textLayer(
      "ammoText",
      "Bullet Number",
      "x10",
      { x: -0.56, y: -0.85 },
      { width: 3, height: 3 },
      90,
      60,
      8,
    ),
    scoreText: textLayer(
      "scoreText",
      "Score",
      "0 / 8",
      { x: 0.73, y: -0.6 },
      { width: 0.7, height: 3 },
      90,
      60,
      10,
    ),
  },
};
