# Shooter Translation And Handoff

## Current Handoff

This app is the Vincentt XR translation of `.temp/EH_scenes/Game01_Shooter.scene`.
It keeps the live camera feed and renders the shooter game with SDK screen-space
components from `@vincentt-xr/sdk`.

Runtime files:

- `src/Scene.tsx`: mounts `VideoBackground` and `ShooterGame`.
- `src/shooter/settings.ts`: final game constants, asset URLs, and screen-space layer placements.
- `src/shooter/ShooterGame.tsx`: game state, hand/gesture input, hit detection, movement, and animations.
- `src/shooter/ShooterLayer.tsx`: thin wrappers around SDK `ScreenImage` and `ScreenText`.
- `scene.md`: Effect House scene-graph notes, object mapping, and translation decisions.

Do not edit `src/App.tsx`, `src/main.tsx`, or build config unless the app shell
itself needs to change.

## Source Mapping

Effect House source values preserved as final defaults:

- `numberOfBullet`: `10`
- `movingDuration`: `7`
- `gapBetweenBottles`: `300`
- `resultTarget`: `8`
- bottle count: `8`
- root scene: `Shooting Game`
- UI objects: `Holding gun with both hands`, `Bullet UI`, `Bullet Number`, `Crosshair UI`
- target hierarchy: `Bottles Group` with `Bottle` through `Bottle (7)`
- bottle states: `Whole Bottle`, `Top Half`, `Bottom Half`, `Broken`

Asset mapping:

- `Holding gun with both hands` -> `/images/Holding guns.png`
- `Bullet UI` -> `/images/Bullet.png`
- `Crosshair UI` -> `/images/Crosshair.png`
- `Whole Bottle` -> `/images/Whole bottle.png`
- `Top Half` -> `/images/Top half bottle.png`
- `Bottom Half` -> `/images/Bottom half bottle.png`
- `Broken` -> `/images/Smashed bottle.png`

## SDK Components

Runtime rendering:

- `VideoBackground` for the camera feed.
- `ScreenSpaceUI` as the screen-space game container.
- `ScreenImage` for gun, crosshair, bullet icon, bottles, and bottle pieces.
- `ScreenText` for ammo count, score, and win/lose messaging.
- `HandTracker` for palm/fist input.
- `GestureTracker` for result-scene peace/victory reset.

Earlier placement/debug phase used SDK debug UI only:

- `ScreenImageSettingsPanel` for selected image transform/material tuning.
- `ScreenTextSettingsPanel` for text layer tuning.
- `LayerPanel` for the separate layer-order editor.
- A `Copy Transform` button inside the transform section copied item name plus transform JSON.

Those debug panels were a deliberate human/AI collaboration workflow. The user
manually adjusted placement in the running app, used copy buttons to send the
selected item name plus transform JSON back to the AI agent, and the AI agent
baked those values into `settings.ts`. They were intentionally removed after
tuning. The final app keeps only runtime game code.

## Final Game Settings

- Bullets: `10`
- Bottle count: `8`
- Result target: `8`
- Bottle extra gap: `300`
- Movement duration: `7`
- Hit padding: `0.03`

`gapBetweenBottles` is extra space added after the whole-bottle width, so `0`
means bottles touch edge-to-edge. Wrapping uses the full `bottleCount * spacing`
track length, which prevents bottles from stacking onto the same position.

## Final Behavior

- Bottles move continuously from left to right in one row.
- Mouse/touch click is a debug shot trigger.
- Open palm controls the crosshair X position.
- Closed fist shoots once on the gesture edge.
- Peace/victory resets only after the win/lose result is showing.
- Shooting triggers a subtle gun recoil and crosshair pop.
- A hit hides the whole bottle.
- The top piece appears using its tuned offset and stays in place.
- The bottom piece appears using its tuned offset, drops downward, and fades out.
- The smashed sprite appears using its tuned offset, pops in, then dissolves.
- Score and ammo text update live.
- Win shows `YOU WIN` when score reaches the result target.
- Lose shows `YOU LOSE` when ammo reaches zero first.
- The DOM `Reset` button is mounted through a separate React root so no DOM nodes enter the R3F tree.

## Tuned Placement

- `Bottles`: position `{ x: 0, y: 0.8 }`, size `{ width: 0.16, height: 0.58 }`
- `Top Half Bottle`: position `{ x: 0, y: 0.86 }`, size `{ width: 0.16, height: 0.7 }`
- `Bottom Half Bottle`: position `{ x: 0, y: 0.62 }`, size `{ width: 0.16, height: 0.25 }`
- `Broken Pieces`: position `{ x: 0, y: 0.66 }`, size `{ width: 0.34, height: 0.24 }`
- `Holding Guns`: position `{ x: -0.25, y: -0.74 }`, size `{ width: 2.5, height: 2.5 }`
- `Crosshair`: position `{ x: 0, y: 0.7 }`, size `{ width: 0.22, height: 0.22 }`
- `Bullet Number`: position `{ x: -0.53, y: -0.85 }`, size `{ width: 0.5, height: 0.5 }`
- `Score`: position `{ x: 0.73, y: -0.52 }`, size `{ width: 0.7, height: 0.7 }`

## Implementation History

Initial build steps:

1. Copy `v2-template` into `v2-template-shooterGame`.
2. Run it with the published SDK package: `npm run dev`.
3. Remove the 3D face-wrap template code while keeping the camera feed.
4. Read Effect House `.scene` and `.md` files to map assets and UI objects.
5. Add assets under `public/images`.
6. Build placement first with SDK screen-space components.
7. Add temporary transform and layer-order panels for tuning.
8. Remove tuning panels once layout and gameplay were finalized.

SDK note:

- The production template grounding is kept in `GROUNDING.md`.
- For this project case, development now uses `@vincentt-xr/sdk@2.0.0-alpha.1` from npm.
- Any project-specific SDK instruction belongs in this app copy's `GROUNDING.md`, not in the original upstream grounding/template.

Gameplay implementation pass:

1. Keep `VideoBackground` at a low render order.
2. Render all game visuals inside `ScreenSpaceUI`.
3. Render 8 bottles from settings-derived normalized screen positions.
4. Animate the bottle row horizontally over `movingDuration`.
5. Use click as debug shoot input.
6. Use open palm for aiming X and closed fist for shooting.
7. On hit, mark the bottle broken and render the broken-state pieces.
8. Decrement ammo after each shot.
9. End with win when `score >= resultTarget`; lose when ammo reaches `0` first.

Key fixes made during implementation:

- DOM panels/buttons were moved outside the R3F tree to avoid `R3F: Span/Button/Svg is not part of the THREE namespace`.
- The `SHOT` text popup was removed; the crosshair PNG now pops instead.
- Bottle spacing was changed from center spacing to `bottle width + extra gap`.
- Bottle wrapping was changed to use the full 8-bottle track length to prevent overlapping after wrap.
- The runtime settings panel was removed after baking final gap/speed values.
- Stale debug-panel files and copy helpers were removed for readability.

## Validation

- `npm run typecheck`
- `npm run build`
- Local dev loop: `npm run dev`
- Verify camera feed stays visible.
- Verify no face-wrap/face-tracker code returns.
- Verify no debug setting panel is mounted in the final app.
