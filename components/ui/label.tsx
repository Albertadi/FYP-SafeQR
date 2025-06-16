import { Text } from "react-native"

export function Label({ children }) {
  return <Text className="text-sm font-medium text-gray-700 mb-1">{children}</Text>
}