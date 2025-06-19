# Required Assets for system.css

This document lists the external assets required by `styles/system.css` and their intended paths within the project.

## Fonts

The following font files should be placed in `assets/fonts/system/`:
- `ChicagoFLF.woff`
- `ChicagoFLF.woff2`
- `monaco.woff`
- `monaco.woff2`
- `ChiKareGo2.woff`
- `ChiKareGo2.woff2`
- `FindersKeepers.woff`
- `FindersKeepers.woff2`

## Images (SVG)

The following SVG files should be placed in `assets/images/system/`:
- `button.svg`
- `button-default.svg`
- `checkmark-disabled.svg` (Note: `system.css` refers to this via a non-standard `svg-load` function. If this is a required asset, it should be placed here. The `svg-load` function itself is not implemented by this change.)
