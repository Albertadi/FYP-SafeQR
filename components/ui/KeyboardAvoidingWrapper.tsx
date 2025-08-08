import React, { useEffect, useRef, useState } from "react"
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ScrollViewProps,
    StyleSheet,
    TouchableWithoutFeedback,
    ViewStyle,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Props = {
    children: React.ReactNode
    style?: ViewStyle
    scrollProps?: ScrollViewProps
    textInputValue?: string;
    keyboardVerticalOffset?: number

}

const KeyboardAvoidingWrapper = ({ children, style, scrollProps, textInputValue, keyboardVerticalOffset }: Props) => {
    const behavior = Platform.OS === "ios" ? "padding" : "height"
    const resolveKeyboardVerticalOffset =  Platform.OS === "ios" ? 0 : keyboardVerticalOffset ?? 0;

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollViewRef = useRef<ScrollView | null>(null);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
        });

        return () => {
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (textInputValue && textInputValue.length > 0) {
            setIsTyping(true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 1500);
        } else {
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [textInputValue]);


    return (
        <KeyboardAvoidingView
            behavior={behavior}
            keyboardVerticalOffset={resolveKeyboardVerticalOffset}
            style={[styles.keyboardAvoidingView, { backgroundColor: style?.backgroundColor }]}
        >
            <SafeAreaView style={[styles.safeArea, { backgroundColor: style?.backgroundColor }]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={[
                            { flexGrow: 1, backgroundColor: style?.backgroundColor },
                            scrollProps?.contentContainerStyle,
                        ]}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={isTyping}
                        {...scrollProps}
                    >
                        {children}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

export default KeyboardAvoidingWrapper

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1
    },
    safeArea: {
        flex: 1,
    },
})