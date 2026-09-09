/**
 * A stack of in-app "back" handlers for the Android hardware back button.
 *
 * Dialogs, the mobile drawer and the message thread are not route changes, so
 * the platform has no idea they are open — without this, back would navigate
 * away from a screen with a dialog on top of it, or exit the app outright.
 *
 * Handlers are consulted newest-first and each returns whether it consumed the
 * press. Only when none does do we fall back to history, and only when there
 * is no history do we let the app close.
 */
export type BackHandler = () => boolean;

const handlers: BackHandler[] = [];

/** Registers a handler and returns the function that removes it. */
export function pushBackHandler(handler: BackHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  };
}

/** Runs the newest handler that consumes the press. */
export function runBackHandlers(): boolean {
  for (let index = handlers.length - 1; index >= 0; index -= 1) {
    if (handlers[index]()) return true;
  }
  return false;
}

/** Test seam — the count of currently registered handlers. */
export function backHandlerCount(): number {
  return handlers.length;
}
