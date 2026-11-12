import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.diwalichit.app",
  appName: "DIWALI CHIT",
  webDir: "public",
  server: {
    url: "https://smsdiwalichits.vercel.app/login",
    cleartext: true,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      backgroundColor: "#2b0007",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#f59e0b",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
