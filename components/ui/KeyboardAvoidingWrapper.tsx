import React, { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ScrollViewProps,
    StyleSheet,
    TouchableWithoutFeedback,
    ViewStyle,
} from "react-native";

type Props = {
    children: React.ReactNode
    style?: ViewStyle
    scrollProps?: ScrollViewProps
    textInputValue?: string;
}

const KeyboardAvoidingWrapper = ({ children, style, scrollProps, textInputValue }: Props) => {
    const behavior = Platform.OS === "ios" ? "padding" : "height"
    const keyboardVerticalOffset = 80

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
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={[styles.container, style]}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={[scrollProps?.contentContainerStyle]}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={isTyping}
                    {...scrollProps}
                >
                    {children}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default KeyboardAvoidingWrapper

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
