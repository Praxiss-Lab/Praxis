# Praxis theme system

A Praxis palette covers the interface, code views and terminal output together. CSS/HeroUI, Prism/Monaco and xterm render colors differently, so a new theme needs an explicit mapping for each system.

For the dashboard design, use the agreed brand palette in [Praxis visual identity](../../docs/BRAND.md): Charcoal `#0F172A`, Electric Blue `#2563EB` and Light `#F8FAFC`.

## Add and register a palette

1. Create a definition in `color-theme/definitions/` with its appearance, grey scale, HeroUI HSL channels and semantic token overrides.
2. Extend `ColorThemeKey` and register the definition in `color-theme/definitions/index.ts`. The registry supplies the settings menu.
3. Map the key in `syntax-highlighter-themes.ts`, `file-diff-viewer.tsx` and `terminal-themes.ts`. Supply all 16 ANSI terminal colors. These mappings must remain exhaustive.
4. Run the theme tests and inspect the interface, code and terminal together. Include portalled menus/modals, Markdown, inline code, diffs, ANSI output and keyboard focus. Check selected, disabled and hover states, then switch between existing palettes.

## Selection and persistence

`setColorTheme` owns selection and persistence. React consumers use `useColorTheme`; avoid a second selected-theme store. The application loads and applies its saved preference. An embedded root uses its default appearance until a palette has actually been applied.

The head bootstrap uses the same CSS generator before hydration. It must work when storage is unavailable or contains an obsolete key.

## CSS and embedding

The stylesheet owns base defaults; runtime CSS supplies palette overrides only. Missing overrides fall back to the base or host stylesheet. `AgentServerUIRoot` owns its React attributes and preserves caller-provided `styleOverrides` and inline `style` properties.

Use surface and foreground tokens for ordinary content. `contrast` provides high-emphasis ink; `contrast-foreground` supplies its inverse foreground for pills and tooltips. Preserve opacity and state variants such as `hover:bg-contrast/10`.

Reserve literal white for fixed-color surfaces such as the blue Plan control, image-lightbox scrims and document previews. Do not redefine the white utility globally. SVG recoloring must preserve transparent negative-space paths.

## Editor and terminal colors

Monaco and xterm require concrete colors rather than CSS custom-property strings. The terminal resolves its main foreground from the mounted scope, preserving embedding overrides. Check those renderers directly; a correct page background does not prove that editor or terminal contrast is correct.
