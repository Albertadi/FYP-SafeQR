"use client"

import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import React from "react"
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface FAQScreenProps {
    visible: boolean
    onClose: () => void
}

export default function FAQModal({ visible, onClose }: FAQScreenProps) {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? "light"]

    const faqItems = [
        { question: "How do I scan a QR code?", answer: "Simply tap on the camera icon in the Scan tab and point your camera at the QR code to scan it." },
        { question: "Why is my scan not working?", answer: "Make sure the QR code is fully visible and there is adequate lighting. Damaged or blurry codes may not scan correctly." },
        { question: "Where can I view my scan history?", answer: "Tap the Scan History tab to view all past scans." },
        { question: "Can I use the app offline?", answer: "No. The application requires an internet connection to verify the safety of scanned QR code content." },
        { question: "What permissions does this app require?", answer: "The app requests access to your camera and gallery. Camera access is essential for scanning QR codes and using most features." },
        { question: "How does the app handle my data?", answer: "We only save the contents of the QR codes you scan along with your user ID to improve your experience." },
        { question: "Can I delete my account?", answer: "Complete deletion isn’t available, as your data is also used for machine learning training purposes." },
    ]

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Frequently Asked Questions</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
                            <Text style={[styles.title, { color: colors.text }]}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={{ maxHeight: 300 }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {faqItems.map((item, index) => (
                            <View key={index} style={{ marginBottom: 16 }}>
                                <Text style={[styles.question, { color: colors.text }]}>
                                    {index + 1}. {item.question}
                                </Text>
                                <Text style={[styles.answer, { color: colors.secondaryText }]}>
                                    {item.answer}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    modalContainer: {
        maxHeight: "80%",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    question: {
        fontSize: 16,
        fontWeight: "600",
    },
    answer: {
        fontSize: 14,
        marginTop: 4,
    },
    closeIconButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
})
