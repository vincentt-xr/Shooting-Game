import { VideoBackground } from "@vincentt-xr/sdk";

import { ShooterGame } from "./shooter/ShooterGame";
import type { ShooterSettings } from "./shooter/settings";

export const Scene = ({
  settings,
  onSettingsChange,
}: {
  settings: ShooterSettings;
  onSettingsChange?: (next: ShooterSettings) => void;
}) => (
  <>
    <VideoBackground renderOrder={-999} />
    <ShooterGame settings={settings} onSettingsChange={onSettingsChange} />
  </>
);
