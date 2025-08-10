// app/Education.tsx
"use client"

import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import React, { useState } from "react"
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import ImageViewing from "react-native-image-viewing"

interface EducationScreenProps {
  visible: boolean
  onClose: () => void
}

export default function EducationModal({ visible, onClose }: EducationScreenProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? "light"]

  const educationItems = [
    {
      question: "What is HTML Phishing?",
      answer: [
        "HTML (HyperText Markup Language) files are interactive content documents designed for viewing on web browsers.",
        "In phishing emails, HTML files are commonly used to redirect users to malicious sites, download malware-laden files or to display phishing forms locally within your browser without the use of internet.",
        "As HTML is not inherently malicious, HTML attachments tend to be undetected by antivirus or spam filters, so you are likely to receive phishing emails with HTML files embedded in your inboxes."
      ],
      image: require('@/assets/images/education/HTML.png')
    },
    {
      question: "What could happen when you click on HTML attachments?",
      answer: [
        "Fake Websites: When you open the HTML attachment, it might open up a 'webpage' in your browser that looks like a legitimate website. However, this page is not a real website but a phishing HTML form and any information that you fill in are actually given to hackers.",
        "Malware and Viruses: After clicking on the HTML attachment, malicious code inside the file might automatically download a malware or virus from another source onto your computer. Since the HTML file itself is not a malware, your anti-virus and other security products would not block it.",
        "Malicious Websites: When you open the HTML attachment, it might redirect you to a malicious website and your computer can be attacked by simply visiting it. The website might install malware and gather your personal information without even you knowing."
      ]
    },
    {
      question: "What should you do when you receive an HTML attachment?",
      answer: [
        "Be suspicious of any email that contains an .html or .htm attachment",
        "Never click on the attachment provided or reply to the sender",
        "Report the email to IT Security and delete it without opening the HTML file",
        "If you are expecting an email from the sender, call the sender and request them to resend the file in another format such as .pdf"
      ]
    }
  ]

  // ---- NEW: state for the image viewer ----
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerUri, setViewerUri] = useState<string | null>(null)

  // Helper to turn local `require()` into a uri the viewer understands
  const toUri = (img: any) => Image.resolveAssetSource(img).uri

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Phishing Education</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
              <Text style={[styles.title, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: '80%' }} contentContainerStyle={{ paddingBottom: 20 }}>
            {educationItems.map((item, index) => (
              <View key={index} style={{ marginBottom: 24 }}>
                <Text style={[styles.question, { color: colors.text }]}>
                  {index + 1}. {item.question}
                </Text>

                {item.answer.map((answer, answerIndex) => (
                  <Text key={answerIndex} style={[styles.answer, { color: colors.secondaryText }]}>
                    • {answer}
                  </Text>
                ))}

                {item.image && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      const uri = toUri(item.image)
                      setViewerUri(uri)
                      setViewerVisible(true)
                    }}
                  >
                    <Image
                      source={item.image}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* ---- NEW: Full-screen zoomable viewer ---- */}
      <ImageViewing
        images={viewerUri ? [{ uri: viewerUri }] : []}
        imageIndex={0}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        // Optional: dark background to mimic “inspect”
        presentationStyle="overFullScreen"
      />
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
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 8,
    lineHeight: 20,
  },
  closeIconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
  },
})
