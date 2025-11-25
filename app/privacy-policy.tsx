
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Color Blast! This privacy policy explains how we handle your information when you use our game application.
          </Text>

          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            Color Blast is designed with your privacy in mind. We collect minimal information:
          </Text>
          <Text style={styles.bulletPoint}>- Game progress and high scores (stored locally on your device)</Text>
          <Text style={styles.bulletPoint}>- Level completion data (stored locally on your device)</Text>
          <Text style={styles.bulletPoint}>- App usage statistics (anonymous)</Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            The information we collect is used solely to:
          </Text>
          <Text style={styles.bulletPoint}>- Save your game progress</Text>
          <Text style={styles.bulletPoint}>- Track your high scores</Text>
          <Text style={styles.bulletPoint}>- Unlock levels as you progress</Text>
          <Text style={styles.bulletPoint}>- Improve the game experience</Text>

          <Text style={styles.sectionTitle}>4. Data Storage</Text>
          <Text style={styles.paragraph}>
            All your game data is stored locally on your device using secure storage mechanisms. We do not transmit your personal data to external servers.
          </Text>

          <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Color Blast does not use any third-party analytics or advertising services that collect personal information.
          </Text>

          <Text style={styles.sectionTitle}>6. Children&apos;s Privacy</Text>
          <Text style={styles.paragraph}>
            Our game is suitable for all ages. We do not knowingly collect personal information from children under 13. All data is stored locally on the device.
          </Text>

          <Text style={styles.sectionTitle}>7. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your game data stored on your device. However, no method of electronic storage is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>8. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>- Delete your game data by uninstalling the app</Text>
          <Text style={styles.bulletPoint}>- Reset your progress within the app settings</Text>
          <Text style={styles.bulletPoint}>- Request information about data we collect</Text>

          <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any changes by updating the &quot;Last Updated&quot; date at the top of this policy.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this privacy policy or our data practices, please contact us through the app store where you downloaded Color Blast.
          </Text>

          <Text style={styles.sectionTitle}>11. Open Source</Text>
          <Text style={styles.paragraph}>
            This app is open source. The source code is available at:
          </Text>
          <Text style={styles.githubText}>
            https://github.com/taylorbaile0703-svg
          </Text>
          <Text style={styles.paragraph}>
            You can view the source code, report issues, or contribute to the project through the repository.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Color Blast, you agree to this privacy policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 60 : 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '30',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 8,
  },
  githubText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary + '30',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
