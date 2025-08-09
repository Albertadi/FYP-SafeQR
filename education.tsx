// app/Education.tsx
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FAQItems = [
  {
    question: "What is HTML Phishing?",
    answer: [
      "HTML (HyperText Markup Language) files are interactive content documents designed for viewing on web browsers.",
      "In phishing emails, HTML files are commonly used to redirect users to malicious sites, download malware-laden files or to display phishing forms locally within your browser without the use of internet.",
      "As HTML is not inherently malicious, HTML attachments tend to be undetected by antivirus or spam filters, so you are likely to receive phishing emails with HTML files embedded in your inboxes."
    ],
    image: require('@/assets/images/Education/HTML.png')
  },
  {
    question: "What could happen when you click on HTML attachments?",
    answer: [
      {
        title: "Fake Websites",
        content: "When you open the HTML attachment, it might open up a 'webpage' in your browser that looks like a legitimate website. However, this page is not a real website but a phishing HTML form and any information that you fill in are actually given to hackers."
      },
      {
        title: "Malware and Viruses",
        content: "After clicking on the HTML attachment, malicious code inside the file might automatically download a malware or virus from another source onto your computer. Since the HTML file itself is not a malware, your anti-virus and other security products would not block it."
      },
      {
        title: "Malicious Websites",
        content: "When you open the HTML attachment, it might redirect you to a malicious website and your computer can be attacked by simply visiting it. The website might install malware and gather your personal information without even you knowing."
      }
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
];

export default function EducationScreen() {
  const [expandedItems, setExpandedItems] = useState<{[key: number]: boolean}>({});

  const toggleItem = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phishing Awareness FAQ</Text>
      
      {FAQItems.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <TouchableOpacity 
            style={styles.questionContainer}
            onPress={() => toggleItem(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.questionText}>{item.question}</Text>
            <Text style={styles.expandIcon}>
              {expandedItems[index] ? '−' : '+'}
            </Text>
          </TouchableOpacity>
          
          {expandedItems[index] && (
            <View style={styles.answerContainer}>
              {item.answer.map((point, i) => (
                <View key={i}>
                  {typeof point === 'string' ? (
                    <Text style={styles.answerText}>{point}</Text>
                  ) : (
                    <>
                      <Text style={styles.subAnswerTitle}>{point.title}</Text>
                      <Text style={styles.answerText}>{point.content}</Text>
                    </>
                  )}
                </View>
              ))}
              
              {item.image && (
                <Image 
                  source={item.image} 
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  faqItem: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2c3e50',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  answerContainer: {
    padding: 15,
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  subAnswerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 250,
    marginTop: 15,
    borderRadius: 6,
  },
});