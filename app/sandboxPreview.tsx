import { fetchSanitizedHTML } from "@/controllers/scanController";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

export default function SandboxPreviewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>(url || "");
  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);

  // Force webpage to display mobile version
  const mobileUserAgent =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

  // Fetch sanitized HTML if the url is available
  useEffect(() => {
    if (!url) return;

    setLoading(true);
    fetchSanitizedHTML(url)
      .then((html) => {
        setSanitizedHtml(html);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch sanitized HTML:", error);
        setSanitizedHtml(null);
        setLoading(false);
      });
  }, [url]);

  useEffect(() => {
    if (!url) {
      Alert.alert("No URL", "Scan a QR code first", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    }
  }, [url]);


  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  if (!url) return <Text>No URL provided</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.sandboxBanner}>
        <Text style={styles.sandboxText}>
          You are viewing this page in Sandbox Mode. Only HTML elements have been loaded.
        </Text>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.toolbarColumn}>
          <TouchableOpacity
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
            style={[styles.navButton, !canGoBack && styles.disabledButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>{"<"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolbarColumn}>
        <TouchableOpacity
          onPress={() => webViewRef.current?.goForward()}
          disabled={!canGoForward}
          style={[styles.navButton, !canGoForward && styles.disabledButton]}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarTextColumn}>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={styles.toolbarText}
        >
          Viewing: {currentUrl}
        </Text>
      </View>
    </View>

      { loading && <ActivityIndicator style={{ marginTop: 20 }} /> }

  <WebView
    ref={webViewRef}
    onLoadEnd={() => setLoading(false)}
    userAgent={mobileUserAgent}
    originWhitelist={['*']}
    javaScriptEnabled={false}
    domStorageEnabled={false}
    allowsInlineMediaPlayback={false}
    allowsBackForwardNavigationGestures={false}
    onError={() => setLoading(false)}
    startInLoadingState
    style={styles.webview}
    onNavigationStateChange={handleNavigationStateChange}
    onShouldStartLoadWithRequest={(request) => {
      // Catch and block <a href>, <form>, <meta http>, <link> tags
      return false;
    }}
    source={
      sanitizedHtml !== null
        ? { html: sanitizedHtml || "<h3>No content returned from server</h3>", baseUrl: url }
        : undefined
    }
  />

  {
    !sanitizedHtml && !loading && (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Failed to load sanitized content
        </Text>
      </View>
    )
  }
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sandboxBanner: {
    backgroundColor: "#FFF3CD",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0C36C",
  },
  sandboxText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  toolbar: {
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },

  toolbarColumn: {
    flex: 0.15,
    alignItems: "center",
    justifyContent: "center",
  },

  toolbarTextColumn: {
    flex: 2,
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  toolbarText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },

  navButton: {
    padding: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },

  navButtonText: {
    fontSize: 14,
    color: "#333",
  },

  disabledButton: {
    opacity: 0.3,
  },
  webview: { flex: 1 },
});
