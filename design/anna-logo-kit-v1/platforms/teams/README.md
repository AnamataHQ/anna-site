# Microsoft Teams icon assets

Use `color.png` and `outline.png` in every Teams app package. Both files meet the current Microsoft dimensions: 192 × 192 full-color and 32 × 32 white-on-transparent respectively.

The current `anna-assistant` manifests use schema 1.17, so copy the two required properties from `manifest-icons.v1.17.snippet.json`. Use `manifest-icons.snippet.json` only after moving to a schema that supports the optional `color32x32` property.

`focused.png` is supplied for host surfaces that accept a separate pressed-state icon. It is identical to the transparent full-color 32-pixel asset.

Do not round `color.png`: Teams applies its own corner mask. The Anna mark is confined to the 120 × 120 central safe area.
