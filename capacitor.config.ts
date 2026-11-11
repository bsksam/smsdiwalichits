import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.diwalichit.app",
  appName: "DIWALI CHIT",
  webDir: "public",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a8a",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#f59e0b",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
