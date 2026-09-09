import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor is configured but deliberately NOT initialised yet — no `android/`
 * folder exists until `npx cap add android` is run in the packaging step.
 *
 * `appId` is distinct from Atronz Pet Health (`com.atronz.pethealth`) so both
 * APKs can be installed on the same device at the same time.
 */
const config: CapacitorConfig = {
  appId: 'com.atronz.petsocial',
  appName: 'Atronz Pet Social',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    // Matches the cream page background so there is no white flash between the
    // native splash and the web view painting.
    backgroundColor: '#FAF8F4',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
