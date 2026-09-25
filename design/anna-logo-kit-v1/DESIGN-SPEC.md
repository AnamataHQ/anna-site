# Anna Relay design specification

## Geometry

- Canvas: `200 × 200` units.
- Standard mark bounds: `x=42..158`, `y=42..158`.
- All upper stems terminate at `y=42`.
- All lower stems terminate at `y=158`.
- The mark consists of four relay forms merged into one compound path to prevent rendering seams.

## Gradient

The production gradient runs diagonally from `(42, 42)` to `(158, 158)` in user space.

| Offset | Color |
| ---: | --- |
| 0% | `#2C548C` |
| 43% | `#3159C7` |
| 49% | `#6252EF` |
| 55% | `#8D4DFF` |
| 61% | `#E15091` |
| 100% | `#FF5C42` |

The violet handoff is intentionally narrow. Do not distribute violet evenly across the whole mark.

## Backgrounds

- Primary app tile: Anna navy, `#08152E`.
- Maximum-contrast tile: black, `#000000`.
- Standard rounded tile radius: `48` units on the `200 × 200` canvas.
- Platform-owned masks, including Microsoft Teams, use full-bleed square backgrounds without pre-rounded corners.

## Monochrome

- Dark mark: Anna navy, `#08152E`.
- Light mark: white, `#FFFFFF`.
- Host-controlled mask artwork may use solid black where the platform applies the final color.
