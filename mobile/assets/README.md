# App Assets

CoachConnect branding: bold white **C** on solid black (#000000).

## Production files

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | iOS + Android app icon |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |
| `splash.png` | 1284×2778 | Native splash screen |
| `favicon.png` | 192×192 | Web favicon |
| `canva-icon-source.png` | 1024×1024 | Master source artwork |

## Regenerate from source

```bash
cd mobile
npm run icons
```

This runs `scripts/import-canva-icon.py`, which copies `canva-icon-source.png` into all Expo asset paths and refreshes `previews/`.

## Design notes

- **Background:** `#000000` everywhere (icon, splash, adaptive icon)
- **Mark:** Minimal geometric **C**, high contrast, readable at small sizes
- **Splash:** Centered C with slight upward offset for visual balance on tall phones
