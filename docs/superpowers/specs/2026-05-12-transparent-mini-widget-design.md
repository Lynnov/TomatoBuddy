# Transparent Mini Widget Design

## Goal

Mini mode should feel like a small desktop companion rather than a card window. It should show only the pixel cat and timer core on a transparent, undecorated always-on-top window, with no visible panel border or heavy shadow.

## Approach

Use the existing mini-mode branch in `App.tsx` and keep `MiniWidget` focused on rendering `PixelCat` plus the formatted remaining time. The design avoids new controls or interaction concepts: double-click still expands to full mode, and clicking the cat still triggers the existing pet message.

## UI Behavior

When `documentElement` has `is-mini-mode`, CSS should make `html`, `body`, `#root`, and the mini widget transparent. `.mini-widget` should use a compact layout with no border, no card background, no heavy box shadow, and only enough padding to keep the cat and timer readable. Mini-mode overrides should shrink the cat spacing and suppress decorative speech-bubble weight where necessary so the widget remains unobtrusive.

## Window Behavior

Tauri should support transparent rendering from startup, and `applyWindowMode('mini')` should switch the current window to undecorated, always-on-top, and compact dimensions. Full mode should restore decorations and the larger app dimensions.

## Testing

Keep style/config tests focused on observable guarantees: mini widget CSS includes transparent/unobtrusive rules, and Tauri config allows transparent rendering without fixed minimum dimensions blocking compact mini mode. Run the existing Vitest suite after implementation.
