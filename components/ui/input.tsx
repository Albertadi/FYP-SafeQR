import { TextInput } from "react-native"

export function Input({ value, onChange, placeholder, ...props }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      className="border border-gray-300 px-4 py-2 rounded-lg text-base"
      {...props}
    />
  )
}
