# Game01_Shooter.scene Map

Source: `.temp/EH_scenes/Game01_Shooter.scene`

## Entities

- `Camera`
- `General`
- `2D Foreground`
- `2D Camera`
- `Holding gun with both hands`
- `Shooting Game`
- `Bullet UI`
- `Bullet Number`
- `Bottles Group`
- `Crosshair UI`

## Script

`Shooting Game`

```yaml
bottlesGroup: {localId: 16}
bulletNumObject: {localId: 15}
crosshairObject: {localId: 25}
gapBetweenBottles: 200
holdingGunObject: {localId: 13}
movingDuration: 7.5
numberOfBullet: 10
```

Vincentt final:

```yaml
gapBetweenBottles: 300
movingDuration: 7
numberOfBullet: 10
resultTarget: 8
```

## Assets

| EH object | EH texture | Vincentt |
| --- | --- | --- |
| `Holding gun with both hands` | `4e3f35cf-...png` | `/images/Holding guns.png` |
| `Bullet UI` | `fd6176b0-...png` | `/images/Bullet.png` |
| `Crosshair UI` | `5ab5abaf-...png` | `/images/Crosshair.png` |
| `Whole Bottle` | `e491d7cb-...png` | `/images/Whole bottle.png` |
| `Top Half` | `51d7db60-...png` | `/images/Top half bottle.png` |
| `Bottom Half` | `b260b148-...png` | `/images/Bottom half bottle.png` |
| `Broken` | `e9044684-...png` | `/images/Smashed bottle.png` |

## Bottle Tree

`Bottles Group`

```text
Bottle
  Container
    BoxCollider2D
  Whole Bottle
  Top Half
  Bottom Half
    RigidBody2D
  Broken
Bottle (1)
Bottle (2)
Bottle (3)
Bottle (4)
Bottle (5)
Bottle (6)
Bottle (7)
```

`Bottle (1)` to `Bottle (7)` repeat the same child tree.

## EH ScreenTransform Values

| Object | anchoredPosition | sizeDelta |
| --- | --- | --- |
| Root UI canvas | `{ x: 0, y: 0 }` | `{ x: 720, y: 1280 }` |
| Gun | `{ x: -44.66, y: -585.55 }` | `{ x: 861.32, y: 668.96 }` |
| Bullet icon | `{ x: -240, y: -351 }` | `{ x: 24, y: 75.29 }` |
| Bullet number | `{ x: 23.03, y: -16.37 }` | `{ x: 120.47, y: 80 }` |
| Crosshair | `{ x: 0, y: 334 }` | `{ x: 43, y: 43 }` |
| Bottle root | `{ x: 0, y: 454 }` | `{ x: 70, y: 381.28 }` |
| Whole bottle | `{ x: 0, y: 0 }` | `{ x: 70, y: 381.28 }` |
| Top half | `{ x: 0, y: 42 }` | `{ x: 117, y: 512 }` |
| Bottom half | `{ x: 0, y: -141 }` | `{ x: 70, y: 100 }` |
| Broken pieces | `{ x: 0, y: -127 }` | `{ x: 145, y: 102.52 }` |

## Final Tuned Values

Runtime source: `src/shooter/settings.ts`

| Layer | position | size |
| --- | --- | --- |
| `Bottles` | `{ x: 0, y: 0.8 }` | `{ width: 0.16, height: 0.58 }` |
| `Top Half Bottle` | `{ x: 0, y: 0.86 }` | `{ width: 0.16, height: 0.7 }` |
| `Bottom Half Bottle` | `{ x: 0, y: 0.62 }` | `{ width: 0.16, height: 0.25 }` |
| `Broken Pieces` | `{ x: 0, y: 0.66 }` | `{ width: 0.34, height: 0.24 }` |
| `Holding Guns` | `{ x: -0.25, y: -0.74 }` | `{ width: 2.5, height: 2.5 }` |
| `Crosshair` | `{ x: 0, y: 0.7 }` | `{ width: 0.22, height: 0.22 }` |
| `Bullet Number` | `{ x: -0.53, y: -0.85 }` | `{ width: 0.5, height: 0.5 }` |
| `Score` | `{ x: 0.73, y: -0.52 }` | `{ width: 0.7, height: 0.7 }` |

## Mapping

- `ImageRenderer` -> `ScreenImage`
- `Text` -> `ScreenText`
- 2D hierarchy -> `ScreenSpaceUI`
- script properties -> `ShooterSettings.game`
- collider/rigid body -> rect hit test + authored animation
- Effect House camera/effect nodes -> `VideoBackground`
