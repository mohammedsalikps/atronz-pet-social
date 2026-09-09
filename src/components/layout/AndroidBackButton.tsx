import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { runBackHandlers } from '@/lib/androidBack';

/**
 * Wires the Android hardware back button to in-app navigation.
 *
 * Order matters: an open dialog, drawer or message thread consumes the press
 * first, then route history, and only an empty history closes the app. Without
 * this, Capacitor's default sends back straight to history — which would
 * navigate out from underneath an open dialog.
 *
 * Renders nothing, and does nothing at all on the web build.
 */
export function AndroidBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let remove: (() => void) | undefined;

    // `addListener` resolves to the handle; keep it so we can detach on unmount.
    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (runBackHandlers()) return;
      if (canGoBack) {
        window.history.back();
        return;
      }
      void CapacitorApp.exitApp();
    }).then((handle) => {
      remove = () => void handle.remove();
    });

    return () => remove?.();
  }, []);

  return null;
}
