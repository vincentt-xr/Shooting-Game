import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_SDK_DIR = path.resolve(repoRoot, "..", "vincentt-xr-sdk");

export const resolveSdkLinks = (value) => {
  if (!value) return undefined;
  const sdkRoot = value === "1" ? DEFAULT_SDK_DIR : path.resolve(value);
  return {
    main: path.join(sdkRoot, "dist", "main.js"),
    tracking: path.join(sdkRoot, "dist", "tracking.js"),
    faceEffects: path.join(sdkRoot, "dist", "face-effects.js"),
    lowLevel: path.join(sdkRoot, "dist", "low-level.js"),
    internal: path.join(sdkRoot, "dist", "internal.js"),
    debugUi: path.join(sdkRoot, "dist", "debug-ui.js"),
    debugUiMediaSource: path.join(sdkRoot, "dist", "debug-ui", "media-source.js"),
    debugUiDefaultSetting: path.join(sdkRoot, "dist", "debug-ui", "default-setting.js"),
  };
};

export const formatSdkLinks = (value) => resolveSdkLinks(value) ?? null;
