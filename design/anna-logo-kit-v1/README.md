# Anna Relay logo kit

Version 1.0.0 is the complete production icon package for Anna, Anamata's digital AI assistant.

## The idea

ANNA is a palindrome: the name remains recognisable from both directions, reflected in the mark's balanced geometry. The two relay forms represent a controlled transfer of work between a person and Anna, while the tight gradient moves from insight and trust toward action and completion.

## What is included

- Five approved SVG masters: full color on transparent, navy and black, plus dark and light monochrome.
- Platform-specific square, tight-crop and maskable SVG derivatives.
- Standard PNG exports from 16 through 1024 pixels.
- Microsoft Teams color, outline, focused and optional 32-pixel color assets.
- Browser favicons, a multi-resolution ICO, Apple Touch, Android, PWA maskable and Microsoft tile assets.
- Rounded avatar exports from 32 through 1024 pixels.
- A visual contact sheet, machine-readable manifest and SHA-256 inventory.
- A deterministic export script for rebuilding the package or adding another size.

## Choosing a variant

| Context | Preferred asset |
| --- | --- |
| Light interface or document | `color-transparent` or `mono-dark` |
| Dark interface or document | `mono-light` |
| Product avatar or app tile | `color-navy-rounded` |
| Maximum-contrast campaign tile | `color-black-rounded` |
| Microsoft Teams package | Use the ready-made files in `platforms/teams/` |
| Browser or installable web app | Use the ready-made files in `platforms/web/` |

Do not redraw, stretch, rotate, recolor, add shadows to, or alter the spacing inside the mark. Use a supplied platform derivative where the host imposes masking, safe-area or transparency rules.

## Microsoft Teams

Copy `platforms/teams/color.png` and `platforms/teams/outline.png` into the Teams app package. `color.png` is a full-bleed 192 × 192 square with the critical mark inside Microsoft's 120 × 120 safe area; `outline.png` is a white, transparent, unpadded 32 × 32 mark. `color32x32.png` is included for newer Microsoft 365 manifests that support the optional `color32x32` property.

The ready-made color icon intentionally has square corners. Microsoft applies its own runtime mask, so pre-rounded Teams artwork would be incorrect.

- [Microsoft Teams app icon guidance](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/design/design-teams-app-icon-store-appbar)
- [Microsoft 365 manifest icon schema](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/root-icons?view=m365-app-1.30)

## Rebuilding

From this directory:

```bash
npm install
npm run build
npm test
```

The exporter regenerates `png/`, `platforms/`, `previews/`, `CHECKSUMS.sha256` and the adjacent `anna-logo-kit-v1.zip`. It never edits the approved SVG sources.

## Importing into `anna-assistant`

For production and development Teams packages, replace their existing `color.png` and `outline.png` with the matching files from `platforms/teams/`, then rebuild the app-package ZIPs. For the admin interface, use `platforms/web/favicon-32x32.png` or the larger app-tile asset that matches the template's declared dimensions.
