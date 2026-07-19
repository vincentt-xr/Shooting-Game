import {
  DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS,
  type ScreenImageSceneSettings,
} from "@vincentt-xr/sdk";
import type { ScreenTextSceneSettings } from "@vincentt-xr/sdk/debug-ui";

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
  | "scoreText"
  | "gameMessage";

export type ShooterImageLayerId = Extract<
  ShooterLayerId,
  "gun" | "crosshair" | "ammoIcon" | "bottles" | "brokenPieces" | "topHalfBottle" | "bottomHalfBottle"
>;

export type ShooterTextLayerId = Extract<
  ShooterLayerId,
  "ammoText" | "scoreText" | "gameMessage"
>;

export type ShooterGameSettings = {
  numberOfBullet: number;
  bottleCount: number;
  resultTarget: number;
  gapBetweenBottles: number;
  movingDuration: number;
  bottleHitPadding: number;
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
  text?: ScreenTextSceneSettings;
  textResolution?: number;
};

export type ShooterSettings = {
  version: 1;
  game: ShooterGameSettings;
  layers: Record<ShooterLayerId, ShooterLayerSettings>;
};

const DEFAULT_SCREEN_TEXT_SCENE_SETTINGS: ScreenTextSceneSettings = {
  screenText: {
    enabled: true,
    content: { text: "" },
    layout: {
      textAlign: "center",
      verticalAlign: "center",
      overflow: "shrink",
      resizeToFit: true,
      minFontSize: 8,
    },
    style: {
      fontSize: 84,
      letterSpacing: 0,
      lineSpacing: 1,
      color: "#ffffff",
      opacity: 1,
      aspect: 1,
      background: {
        enabled: false,
        autoSize: false,
        fit: "full",
        fillMode: "solid",
        color: "#000000",
        opacity: 0,
        borderRadius: 0,
        padding: 0,
        width: 1,
        height: 1,
        borderEnabled: false,
        borderWidth: 0,
        borderColor: "#000000",
        gradientStops: [],
        textureFit: "cover",
        textureFlipX: false,
        textureFlipY: false,
      },
      strokeLayers: [],
      shadowLayers: [],
    },
    transformation: {
      enabled: true,
      showTransformGuides: false,
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
      rotation: 0,
      pivot: [0.5, 0.5],
      renderOrder: 0,
      overlay: true,
      visible: true,
    },
    textArtPreset: "clean",
  },
  screenSpaceUI: { enabled: true },
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
      style: {
        ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText.style,
        fontSize,
        color: "#ffffff",
        aspect: size.width / size.height,
        strokeLayers: [{ color: "#120807", width: strokeWidth, opacity: 1 }],
        shadowLayers: [{ color: "#000000", blur: 14, offsetX: 8, offsetY: -8, opacity: 0.6 }],
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
      72,
      8,
    ),
    scoreText: textLayer(
      "scoreText",
      "Score",
      "0 / 8",
      { x: 0.73, y: -0.6 },
      { width: 0.7, height: 3 },
      90,
      72,
      10,
    ),
    gameMessage: textLayer(
      "gameMessage",
      "Game Message",
      "",
      { x: 0, y: 0 },
      { width: 4, height: 4 },
      95,
      360,
      10,
    ),
  },
};
