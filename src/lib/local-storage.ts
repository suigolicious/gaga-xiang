// Web already has `localStorage`. The iOS and Android version is in local-storage.native.ts;
// keeping expo-sqlite out of the web bundle avoids its web worker, which isn't needed here.
export {};
