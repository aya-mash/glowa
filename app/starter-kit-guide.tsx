import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Section = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  content: React.ReactNode;
};

export default function StarterKitGuide() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isLargeScreen = width > 768;
  const [activeSection, setActiveSection] = useState("intro");

  const handleOpenLink = (url: string) => {
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      WebBrowser.openBrowserAsync(url);
    }
  };

  const sections: Section[] = [
    {
      id: "intro",
      title: "Introduction",
      icon: "rocket-outline",
      content: (
        <View style={{ gap: 16 }}>
          <ThemedText type="title">
            Image Enhancer AI SaaS Starter Kit
          </ThemedText>
          <ThemedText>
            A complete, white-label SaaS starter kit for building AI image
            enhancement applications with Expo, Firebase, and Google Gemini.
          </ThemedText>

          <View
            style={[
              styles.demoContainer,
              { backgroundColor: theme.text + "08" },
            ]}
          >
            <ThemedText type="subtitle">Live Demos</ThemedText>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, { backgroundColor: theme.tint }]}
                onPress={() =>
                  handleOpenLink("https://glowa--pqovdojykt.expo.app/")
                }
              >
                <Ionicons name="globe-outline" size={20} color="#fff" />
                <ThemedText style={styles.buttonText}>Web Demo</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: theme.tint }]}
                onPress={() =>
                  handleOpenLink(
                    "https://expo.dev/artifacts/eas/mGkkDhXKdj9JHrk4v3VmdP.aab"
                  )
                }
              >
                <Ionicons name="logo-android" size={20} color="#fff" />
                <ThemedText style={styles.buttonText}>Android APK</ThemedText>
              </Pressable>
            </View>
          </View>

          <ThemedText type="subtitle">Key Features</ThemedText>
          <View style={styles.featureGrid}>
            {[
              {
                icon: "images-outline",
                text: "AI Image Enhancement (Gemini Image / Nano Banana Pro)",
              },
              {
                icon: "card-outline",
                text: "Monetization Ready (Paystack/Stripe)",
              },
              { icon: "logo-firebase", text: "Firebase Auth & Firestore" },
              {
                icon: "cloud-upload-outline",
                text: "Cloud Storage & Functions",
              },
              {
                icon: "phone-portrait-outline",
                text: "Cross-Platform (iOS, Android, Web)",
              },
              {
                icon: "color-palette-outline",
                text: "Fully Customizable Theme",
              },
            ].map((feature, index) => (
              <View
                key={index}
                style={[styles.featureItem, { borderColor: theme.icon + "40" }]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={theme.tint}
                />
                <ThemedText style={{ flex: 1 }}>{feature.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "play-outline",
      content: (
        <View style={{ gap: 16 }}>
          <ThemedText type="subtitle">1. Installation</ThemedText>
          <CodeBlock
            code={`# Clone the repository
git clone <repo-url>

# Install App Dependencies
npm install

# Install Backend Dependencies
cd functions
npm install`}
          />
          <ThemedText type="subtitle">2. Environment Setup</ThemedText>
          <ThemedText>
            Copy the example environment files and fill in your API keys.
          </ThemedText>
          <CodeBlock
            code={`# Root .env
cp .env.example .env

# Functions .env
cd functions
cp .env.example .env`}
          />
        </View>
      ),
    },
    {
      id: "firebase",
      title: "Firebase Setup",
      icon: "logo-firebase",
      content: (
        <View style={{ gap: 16 }}>
          <ThemedText>
            This project relies on Firebase for Auth, Database, Storage, and
            Functions.
          </ThemedText>
          <Step
            number={1}
            title="Create Project"
            text="Go to Firebase Console and create a new project."
          />
          <Step
            number={2}
            title="Enable Services"
            text="Enable Authentication (Email/Google), Firestore, Storage, and Functions (Blaze Plan required)."
          />
          <Step
            number={3}
            title="Get Config"
            text="Go to Project Settings -> General -> Your Apps -> Web. Copy the config to your root .env file."
          />
          <Step
            number={4}
            title="Deploy"
            text="Run `firebase deploy` to set up security rules and cloud functions."
          />
        </View>
      ),
    },
    {
      id: "config",
      title: "Configuration",
      icon: "settings-outline",
      content: (
        <View style={{ gap: 16 }}>
          <ThemedText type="subtitle">App Configuration</ThemedText>
          <ThemedText>
            Edit{" "}
            <ThemedText type="defaultSemiBold">config/app.config.ts</ThemedText>{" "}
            to change the app name, pricing, and links.
          </ThemedText>
          <CodeBlock
            code={`export const config = {
  appName: "My AI App",
  payments: {
    currency: "USD",
    priceCents: 499, // $4.99
  },
  // ...
};`}
          />
          <ThemedText type="subtitle">AI Styles</ThemedText>
          <ThemedText>
            Edit{" "}
            <ThemedText type="defaultSemiBold">
              prompt-kit/prompts.json
            </ThemedText>{" "}
            to add or modify image enhancement styles.
          </ThemedText>
        </View>
      ),
    },
    {
      id: "deployment",
      title: "Deployment",
      icon: "cloud-done-outline",
      content: (
        <View style={{ gap: 16 }}>
          <ThemedText type="subtitle">Web Deployment</ThemedText>
          <CodeBlock
            code={`npx expo export --platform web
firebase deploy --only hosting`}
          />
          <ThemedText type="subtitle">Mobile Deployment (EAS)</ThemedText>
          <CodeBlock
            code={`# Android
eas build --platform android

# iOS
eas build --platform ios`}
          />
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{ title: "Starter Kit Guide", headerShown: true }}
      />

      <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
        {/* Sidebar Navigation (Desktop) or Top Scroll (Mobile) */}
        <View
          style={[
            styles.sidebar,
            !isLargeScreen && styles.sidebarMobile,
            {
              borderRightColor: theme.icon + "20",
              borderBottomColor: theme.icon + "20",
            },
          ]}
        >
          <ScrollView
            horizontal={!isLargeScreen}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={!isLargeScreen && { paddingHorizontal: 16 }}
          >
            {sections.map((section) => (
              <Pressable
                key={section.id}
                onPress={() => setActiveSection(section.id)}
                style={[
                  styles.navItem,
                  !isLargeScreen && styles.navItemMobile,
                  activeSection === section.id && {
                    backgroundColor: theme.tint + "20",
                  },
                ]}
              >
                <Ionicons
                  name={section.icon}
                  size={20}
                  color={activeSection === section.id ? theme.tint : theme.icon}
                />
                <ThemedText
                  style={[
                    styles.navText,
                    activeSection === section.id && {
                      color: theme.tint,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {section.title}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Main Content Area */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        >
          {sections.find((s) => s.id === activeSection)?.content}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function CodeBlock({ code }: { code: string }) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.codeBlock, { backgroundColor: theme.text + "10" }]}>
      <ThemedText
        style={{
          fontFamily: Platform.select({ web: "monospace", default: "Courier" }),
          fontSize: 13,
        }}
      >
        {code}
      </ThemedText>
    </View>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: number;
  title: string;
  text: string;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={styles.stepContainer}>
      <View style={[styles.stepNumber, { backgroundColor: theme.tint }]}>
        <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
          {number}
        </ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText style={{ opacity: 0.8 }}>{text}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  containerLarge: {
    flexDirection: "row",
  },
  sidebar: {
    paddingVertical: 16,
  },
  sidebarMobile: {
    borderBottomWidth: 1,
    maxHeight: 70,
  },
  content: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  navItemMobile: {
    marginHorizontal: 4,
    paddingHorizontal: 16,
    height: 40,
  },
  navText: {
    fontSize: 15,
  },
  demoContainer: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureItem: {
    width: "48%",
    minWidth: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  codeBlock: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  stepContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
