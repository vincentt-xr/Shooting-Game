# Shooter Game Handoff

## Runtime

`src/Scene.tsx` mounts the camera background and `ShooterGame`. The game uses
Vincentt SDK screen-space components for images and text, hand tracking for
aiming, and gesture tracking for fist shooting.

The round starts after an open palm is detected. The player aims with the open
palm and shoots on the closed-fist gesture edge. Each accepted shot decrements
ammo, updates Bullet Number, and updates Score when a bottle is hit.

When the player wins or runs out of ammo, gameplay pauses. The centered HTML
instruction and `PLAY AGAIN` button remain visible. Reset occurs only from the
button click or a fist gesture while the crosshair is over the button.

## Source of truth

- `src/shooter/settings.ts`: default game values, layer definitions, positions,
  sizes, render order, and image paths.
- `src/shooter/ShooterGame.tsx`: gameplay state, gesture handling, movement,
  collisions, scoring, audio, and pause/reset behavior.
- `src/shooter/ShooterLayer.tsx`: SDK `ScreenImage` and `ScreenText` wrappers.
- `src/shooter/ShooterInstruction.tsx`: centered HTML instruction overlay.
- `src/shooter/ShooterResetButton.tsx`: game-over HTML reset button.

## Remix points

Edit `settings.ts`, replace artwork in `public/images`, and replace
`public/audio/gun-shot.mp3`. Change game behavior in `ShooterGame.tsx` and
overlay presentation in the two HTML overlay components.

Bullet Number and Score are runtime HUD layers without debug settings panels.
Game Message and the old debug text panels are not part of the final runtime.

## Assets and defaults

- Eight bottles move across the screen using the configured duration and gap.
- The gun, bullet icon, crosshair, bottle states, and broken pieces load from
  `public/images`.
- The shooting SFX loads once from `public/audio/gun-shot.mp3` and plays once
  per accepted shot after browser audio is unlocked by interaction.

## Validation

Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` before sharing a remix.
Verify the editor preview, camera feed, hand controls, paused game-over state,
reset button, HUD text, and audio asset after changing content.
