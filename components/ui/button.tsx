"use client"
import { Button as RNButton, Text, TouchableOpacity } from "react-native"

export function Button({ children, onPress, ...props }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-black px-4 py-2 rounded-lg"
      {...props}
    >
      <Text className="text-white text-base text-center">{children}</Text>
    </TouchableOpacity>
  )
}
