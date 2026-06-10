# Claude-like UI customization and plugin compatibility notes

## Scope

This change keeps the app on Backstage's new frontend system and adds app-level appearance extensions only. The UI target is Claude-inspired rather than a pixel-perfect clone: warm off-white canvas, low-contrast borders, spacious cards, dark navigation, rounded controls, and a three-layer shell made from sidebar, top menu bar, and main plugin surface.

## Implementation approach

- Register a custom theme with `ThemeBlueprint` so the palette and font stack remain a Backstage theme option instead of hard-forking individual OSS plugins.
- Register an app root wrapper with `AppRootWrapperBlueprint` for the persistent top menu bar.
- Keep the existing `NavContentBlueprint` sidebar and its `navItems` collection so future page extensions continue to appear in navigation automatically.
- Apply only broad shell/card/header CSS overrides at the app layer; plugin route components are not edited.

## Compatibility assessment for future open-source plugins

| Area                        | Expected compatibility | Notes                                                                                                                                                                                                                                                            |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New frontend system plugins | High                   | Backstage frontend plugins are installed as frontend features and typically expose pages, nav metadata, APIs, or extension outputs. The current customization is also expressed as app-level extensions, so newly installed feature plugins can coexist with it. |
| Navigation                  | High                   | The sidebar still consumes auto-discovered nav items via `navItems.take(...)` and `navItems.rest(...)`. Plugins that expose page extensions with title/icon metadata should appear without requiring sidebar rewrites.                                           |
| Theme-aware UI              | High                   | Plugins that use Material UI / Backstage theme tokens inherit the Claude-like palette, spacing feel, typography, and card/header styling.                                                                                                                        |
| Hard-coded plugin CSS       | Medium                 | OSS plugins with fixed colors, fixed heights, or custom layout assumptions may visually diverge. They should still run, but may need local polish if their pages were not built against theme tokens.                                                            |
| Legacy frontend plugins     | Medium to low          | The app already uses `createApp` from `@backstage/frontend-defaults`, so plugins that only support the legacy frontend system may require the official compatibility/migration path or a wrapper/conversion before they can be installed cleanly.                |
| Top menu bar overlap        | Medium                 | The top bar is an app-root overlay with a reserved top padding on the Backstage sidebar page. Standard Backstage pages should fit; plugins that render full-viewport fixed panels may need per-plugin CSS exceptions.                                            |

## Sources checked

- Backstage stable docs describe frontend plugins as packages that encapsulate pages, navigation, APIs, and extension points, and note that a plugin instance can be installed directly in a frontend app: <https://backstage.io/docs/frontend-system/architecture/plugins/>.
- Backstage extension blueprint docs describe `ThemeBlueprint` as the app-level mechanism for adding selectable custom themes, and `NavContentBlueprint` as the mechanism for replacing the nav while still receiving auto-discovered page nav items: <https://backstage.io/docs/frontend-system/building-plugins/common-extension-blueprints/>.
- Backstage app docs list installing plugins, configuring extensions, and converting third-party plugins as first-class app-building topics for the new frontend system: <https://backstage.io/docs/next/building-apps/generated-index/>.

## Recommendation

This implementation should not materially lock the platform away from open-source plugins. The main long-term maintenance risk is visual QA: each plugin should be checked for fixed-position layouts and hard-coded light/dark surfaces after installation. Prefer OSS plugins that already publish a `/alpha` or new frontend-system entry point, and keep any plugin-specific visual fixes isolated in plugin modules rather than expanding global CSS.
