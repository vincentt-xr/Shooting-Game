import { VideoBackground } from "@vincentt-xr/sdk";

import { ShooterGame } from "./shooter/ShooterGame";
import type { ShooterSettings } from "./shooter/settings";

export const Scene = ({ settings }: { settings: ShooterSettings }) => {
  return (
    <>
      <VideoBackground renderOrder={-999} />
      <ShooterGame settings={settings} />
    </>
  );
};
