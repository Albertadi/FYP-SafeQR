/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4"
const tintColorDark = "#fff"

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    // Additional colors for UI elements
    screenBackground: "#f5f5f5",
    searchBackground: "#f0f0f0",
    cardBackground: "#e8e8e8",
    borderColor: "#e0e0e0",
    placeholderText: "#999",
    secondaryText: "#666",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    // Additional colors for UI elements
    screenBackground: "#0a0a0a",
    searchBackground: "#2a2a2a",
    cardBackground: "#1f1f1f",
    borderColor: "#333",
    placeholderText: "#666",
    secondaryText: "#999",
  },
}
