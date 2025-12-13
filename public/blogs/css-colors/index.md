
基本颜色空间: HEX、RGB、HSL，以及 Alpha

- CSS Colors Module 到了 Level 4
- rgb 可以直接加 alpha，通过 `/`，如 `rgb(255 0 0 / 0.5)`
- 新增颜色空间：Display P3、CIELAB、Oklab
  - CIELAB: `lab(87.6 125 104)` `lch(54.3 107 40.9deg)`
  - Oklab: `oklch(0.93 0.39 28deg)`
  - HWB: `hwb(0deg 0% 0%)`
- 通用：`color()`，如：
  - `color(display-p3 0 1 0)`
  - `color(rec2020 0 0 1)`
  - `color(srgb 0 0 1)`
- 渐变可以选择色彩空间，设置过度方向，如：
  - `linear-gradient(
  to right in hsl longer hue,
  hsl(39deg 100% 50%),
  hsl(60deg 100% 50%)
)`

## 相关

- [https://developer.mozilla.org/en-US/blog/css-color-module-level-4/](https://developer.mozilla.org/en-US/blog/css-color-module-level-4/)
- [https://developer.mozilla.org/en-US/blog/learn-css-hues-colors-hsl/](https://developer.mozilla.org/en-US/blog/learn-css-hues-colors-hsl/)
