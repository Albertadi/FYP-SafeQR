// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import type { SymbolWeight } from "expo-symbols"
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native"

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "person.crop.circle.badge.plus": "person-add",
  "person.crop.circle": "account-circle",
  "clock.fill": "history",
  "qrcode.viewfinder": "qr-code-scanner",
  magnifyingglass: "search",
  xmark: "close",
  "xmark.circle.fill": "cancel",
  "chevron.down": "keyboard-arrow-down",
  "chevron.up": "keyboard-arrow-up",
  "envelope.fill": "email",
  link: "link",
  "shield.checkered": "security",
  "trash.fill": "delete",
  "questionmark.circle": "help",
  "info.circle": "info",
  gear: "settings",
  // New mappings for scan types
  "message-square": "message", // For SMS
  phone: "phone", // For Tel
  wifi: "wifi", // For Wi-Fi
  "doc.text": "description", // For Plain Text
} as const // Use 'as const' to infer literal types for keys and values

// Define IconSymbolName directly from the keys of the MAPPING object
type IconSymbolName = keyof typeof MAPPING

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
  weight?: SymbolWeight
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />
}
