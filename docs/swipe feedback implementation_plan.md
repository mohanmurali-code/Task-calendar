# Add Swipe Animation and Vibration Feedback to Calendar

This plan describes how we will add an interactive swipe animation to the calendar grid, complete with haptic feedback (vibration) for a polished, responsive mobile experience.

## User Review Required

- **Vibration feedback:** We will use `navigator.vibrate(50)`. This works well on Android devices. Note that iOS web browsers currently do not support the vibration API, so iOS users won't get the haptic feedback, but they will still get the fluid animation.
- **Animation Strategy:** We will replace the current basic `onSwipeEnd` snapping with an interactive drag. The calendar grid will visually follow the user's finger as they swipe. When released, if swiped far enough, it will animate smoothly off-screen, change the month, and animate back in from the opposite side.

## Open Questions

- Should the swipe animation be applied only to the calendar grid (the days), or also to the month title header at the top of the panel? Currently, the plan is to only animate the grid, keeping the header static while the days slide.

## Proposed Changes

### `src/App.jsx`

#### [MODIFY] App
- Remove the `swipe` state, `setSwipe`, and `handleSwipeEnd` functions from the main `App` component since the swipe logic will be handled directly inside the `CalendarPanel`.
- Pass `changeMonth` down to `CalendarPanel` as a prop (`onChangeMonth`).
- Update `CalendarPanel` props in the return statement.

#### [MODIFY] CalendarPanel
- Add new local state for tracking drag interactions (`isDragging`, `dragStartX`, `currentX`, and `animatingOffset`).
- Add handlers: `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`.
- During `onPointerMove`, calculate the horizontal displacement (`dx`) and update state.
- Apply an inline `transform: translateX(...)` and conditional `transition` style to the `calendar-grid` element to make it follow the finger and animate back/out.
- On `onPointerUp`, if `dx` exceeds the threshold (e.g., `70px`), trigger `navigator.vibrate(50)` (if supported), animate the grid fully out of view, call `onChangeMonth`, then animate the next month's grid in from the opposite direction.

### `src/styles.css`

#### [MODIFY] styles.css
- Update `.calendar-grid` to ensure it has `touch-action: pan-y` (already present, verify it allows horizontal pointer capture) and apply `will-change: transform` to optimize the sliding animation on mobile.
- Add `overflow: hidden` to `.panel` to ensure the grid doesn't bleed out of the card while sliding.

## Verification Plan

### Manual Verification
1. Open the preview on a simulated mobile device or physical device.
2. Swipe left and right on the calendar grid.
3. Verify the grid follows the touch movement.
4. Verify that releasing early snaps the grid back to the center.
5. Verify that swiping far enough completes the slide-out animation, changes the month, and slides in the new month.
6. Verify vibration occurs upon successful swipe (on supported Android devices).
