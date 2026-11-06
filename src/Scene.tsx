import { useEffect } from "react";

import { ShooterGame } from "./shooter/ShooterGame";

// The counters are drawn in Space Grotesk. `vincentt build` refuses a stylesheet
// @import of a web address, so the font's stylesheet is linked from here.
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap";

const useWebFont = (href: string) => {
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
};

export const Scene = () => {
  useWebFont(FONT_HREF);
  return <ShooterGame />;
};
