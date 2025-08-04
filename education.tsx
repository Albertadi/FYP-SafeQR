// app/Education.tsx
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';


const phishingTips = [
  "Be careful of links and attachments sent through emails or SMS or posted online on social media sites. Such links and attachments may lead to phishing pages or install malware onto your device without your permission.",
  "Hover over links before clicking.",
  "Verify requests for sensitive information.",
  "Always check that links are using HTTPS and not HTTP.",
  "Avoid performing online transactions on public or shared devices or devices that you suspect are compromised.",
  "Never reply to unsolicited emails or SMSes. Responses to such emails or SMSes could be used by fraudsters to socially engineer information or trick users into performing unwanted actions.",
  "Verify any odd or suspicious requests through official contact numbers or channels.",
  "Common red flags: Subpar language and Low-resolution images."
];

// Assuming you've added HTML.png to your assets folder
const HTMLPhishingImage = require('@/assets/images/Education/HTML.png');

export default function EducationScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phishing Awareness Tips</Text>
      
      {phishingTips.map((tip, index) => (
        <View key={index} style={styles.tipContainer}>
          <Text style={styles.tipNumber}>{index + 1}.</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      {/* HTML Phishing Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>HTML Phishing and how it affects you</Text>
        
        <Text style={styles.subtitle}>What is HTML Phishing?</Text>
        <Text style={styles.paragraph}>
          HTML (HyperText Markup Language) files are interactive content documents designed for viewing on web browsers.
        </Text>
        <Text style={styles.paragraph}>
          In phishing emails, HTML files are commonly used to redirect users to malicious sites, download malware-laden files or to display phishing forms locally within your browser without the use of internet.
        </Text>
        <Text style={styles.paragraph}>
          As HTML is not inherently malicious, HTML attachments <Text style={styles.bold}>tend to be undetected by antivirus or spam filters</Text>, so you are likely to receive phishing emails with HTML files embedded in your inboxes.
        </Text>

      <Image 
      source={HTMLPhishingImage} 
      style={styles.image}
      resizeMode="contain"  
      />  

        <Text style={styles.subtitle}>What could happen when you click on the HTML attachments?</Text>
        
        <View style={styles.bulletPoint}>
          <Text style={styles.bulletNumber}>1.</Text>
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Fake Websites</Text>
            {"\n"}When you open the HTML attachment, it might open up a "webpage" in your browser that looks like a legitimate website. However, this page is not a real website but a phishing HTML form and any information that you fill in are actually given to hackers.
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bulletNumber}>2.</Text>
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Malware and Viruses</Text>
            {"\n"}After clicking on the HTML attachment, malicious code inside the file might automatically download a malware or virus from another source onto your computer. Since the HTML file itself is not a malware, your anti-virus and other security products would not block it.
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bulletNumber}>3.</Text>
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Malicious Websites</Text>
            {"\n"}When you open the HTML attachment, it might redirect you to a malicious website and your computer can be attacked by simply visiting it. The website might install malware and gather your personal information without even you knowing.
          </Text>
        </View>

        <Text style={styles.subtitle}>What should you do when receive a HTML attachment?</Text>
        <View style={styles.adviceContainer}>
          <Text style={styles.adviceText}>• Be suspicious of any email that contains an .html or .htm attachment</Text>
          <Text style={styles.adviceText}>• Never click on the attachment provided or reply to the sender</Text>
          <Text style={styles.adviceText}>• Report the email to IT Security and delete it without opening the HTML file</Text>
          <Text style={styles.adviceText}>• If you are expecting an email from the sender, call the sender and request them to resend the file in another format such as .pdf</Text>
        </View>
      </View>
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
  tipContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  tipNumber: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  sectionContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#2c3e50',
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  image: {
    width: '100%',  // Takes full width of screen
    height: 550,     // Increased height
    marginVertical: 20,
    borderRadius: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bulletNumber: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  adviceContainer: {
    marginTop: 10,
    marginLeft: 10,
  },
  adviceText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
});