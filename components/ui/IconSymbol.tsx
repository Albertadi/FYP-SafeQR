// components/ui/IconSymbol.tsx 
 
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import type { SymbolWeight } from "expo-symbols"
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native"
 
/** 
 * Add your SF Symbols to Material Icons mappings here. 
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
  "exclamationmark.octagon.fill": "report", 
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
  "message-square": "message", 
  phone: "phone", 
  wifi: "wifi", 
  "doc.text": "description", 
  newspaper: "newspaper", 
  globe: "public",
  // external‐link arrow 
  "arrow.up.right": "open-in-new", 
} as const 
 
type IconSymbolName = keyof typeof MAPPING 
 
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
  return ( 
    <MaterialIcons 
      name={MAPPING[name]} 
      size={size} 
      color={color} 
      style={style} 
    /> 
  ) 
}