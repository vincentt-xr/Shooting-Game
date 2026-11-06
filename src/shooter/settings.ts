/**
 * Gameplay tuning for the shooter. The pictures and text are written out in
 * ShooterLayer.tsx so the console's visual editor can change them; this file
 * holds only the numbers the game logic reads.
 */
export const SHOOTER_GAME = {
  numberOfBullet: 10,
  bottleCount: 8,
  resultTarget: 8,
  /** Extra space between bottles, in design pixels (720-wide canvas). */
  gapBetweenBottles: 300,
  /** Seconds for the bottle row to travel one full loop. */
  movingDuration: 7,
  bottleHitPadding: 0.03,
} as const;

/**
 * Where the game logic thinks the bottle and the crosshair are, in normalized
 * screen units (centre origin, -1..1 across the screen). They match the literal
 * anchors of the bottle and crosshair images; moving those images in the editor
 * does not move the hit test, so change both together.
 */
export const BOTTLE_RECT = { x: 0, y: 0.8, width: 0.16, height: 0.58 } as const;
export const CROSSHAIR_RECT = { x: 0, y: 0.7, width: 0.22, height: 0.22 } as const;
