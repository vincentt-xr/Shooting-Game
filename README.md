# Shooter Game Template

A remixable Vincentt XR shooter game built with React, React Three Fiber, and
the Vincentt XR SDK. It uses esbuild for local development and production
bundles.

## Run locally

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm dev` starts the local esbuild server. The editor preview uses the same
application entry points and SDK components.

## Game controls

- Show an open palm to start the round and aim the crosshair.
- Make a fist to shoot once.
- Bullet Number and Score are runtime HUD elements.
- After the win or lose condition, the game pauses and shows `PLAY AGAIN`.
- Click `PLAY AGAIN`, or move the crosshair over it and make a fist, to reset.
- A first pointer interaction unlocks browser audio; shooting then plays
  `public/audio/gun-shot.mp3`.

The instruction and Play Again overlays are plain HTML rendered through drei's
`Html` bridge and centered against the Vincentt canvas viewport.

## Remix guide

- `src/shooter/settings.ts`: bullet count, bottle count, target score, movement
  speed, layer positions, sizes, render order, and asset paths.
- `src/shooter/ShooterGame.tsx`: gesture input, shooting, hit detection,
  scoring, game-over pause, and animation behavior.
- `src/shooter/ShooterInstruction.tsx`: the centered start/shoot instruction.
- `src/shooter/ShooterResetButton.tsx`: the game-over reset button.
- `public/images/`: replace artwork while keeping paths in `settings.ts` synced.
- `public/audio/gun-shot.mp3`: replace the shooting sound effect.

The runtime keeps Bullet Number and Score visible without a debug settings
panel. Game Message has been removed.

## Project structure

```text
src/
  main.tsx              application mount
  App.tsx               Vincentt XR shell and settings state
  Scene.tsx             camera-feed scene composition
  PreviewAnchors.tsx    editor preview integration
  shooter/              game runtime, layers, settings, and HTML overlays
public/
  images/               game artwork
  audio/                game sound effects
.vincentt/project.json  Vincentt project identity for remixing
```

`App.tsx` and `Scene.tsx` retain the settings wiring used by the game.

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Confirm the production output contains the image assets and
`audio/gun-shot.mp3`.
