import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, X } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();
  
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const privacyPolicyContent = `
PRIVACY POLICY

Last updated: December 2024

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, report lost or found items, or contact us for support.

2. HOW WE USE YOUR INFORMATION
- To provide and maintain our services
- To match lost and found items
- To communicate with you about your account
- To improve our services

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. YOUR RIGHTS
You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.

6. CONTACT US
If you have questions about this Privacy Policy, please contact us at privacy@smartlostandfound.com
  `;

  const termsOfServiceContent = `
TERMS OF SERVICE

Last updated: December 2024

1. ACCEPTANCE OF TERMS
By using Smart Lost & Found, you agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
Smart Lost & Found is a platform that helps users report and recover lost items while preventing fraudulent claims.

3. USER RESPONSIBILITIES
- Provide accurate information when reporting items
- Act in good faith when claiming found items
- Respect other users' privacy and property

4. PROHIBITED USES
- Making false claims about lost or found items
- Using the service for illegal activities
- Harassing or threatening other users

5. LIMITATION OF LIABILITY
Smart Lost & Found is not responsible for the loss, theft, or damage of items reported on our platform.

6. TERMINATION
We reserve the right to terminate accounts that violate these terms.

7. CHANGES TO TERMS
We may update these terms from time to time. Continued use of the service constitutes acceptance of new terms.

8. CONTACT US
For questions about these Terms, contact us at legal@smartlostandfound.com
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Shield size={24} color="#667eea" />
          <Text style={styles.infoTitle}>Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            We're committed to protecting your personal information and giving you control over your data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Eye size={20} color="#718096" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Public Profile</Text>
                <Text style={styles.settingDescription}>
                  Allow others to see your profile information
                </Text>
              </View>
            </View>
            <Switch
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              trackColor={{ false: '#E2E8F0', true: '#667eea' }}
              thumbColor={profileVisibility ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <UserCheck size={20} color="#718096" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Contact Information</Text>
                <Text style={styles.settingDescription}>
                  Show contact details to matched users only
                </Text>
              </View>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#E2E8F0', true: '#667eea' }}
              thumbColor="#ffffff"
              disabled
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Location</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Database size={20} color="#718096" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Data Sharing</Text>
                <Text style={styles.settingDescription}>
                  Share anonymized data to improve our services
                </Text>
              </View>
            </View>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: '#E2E8F0', true: '#667eea' }}
              thumbColor={dataSharing ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Lock size={20} color="#718096" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Location Services</Text>
                <Text style={styles.settingDescription}>
                  Help improve location accuracy for lost items
                </Text>
              </View>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: '#E2E8F0', true: '#667eea' }}
              thumbColor={locationTracking ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Database size={20} color="#718096" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Analytics</Text>
                <Text style={styles.settingDescription}>
                  Help us improve the app with usage analytics
                </Text>
              </View>
            </View>
            <Switch
              value={analyticsOptIn}
              onValueChange={setAnalyticsOptIn}
              trackColor={{ false: '#E2E8F0', true: '#667eea' }}
              thumbColor={analyticsOptIn ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legalSection}>
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => setShowPrivacyPolicy(true)}
          >
            <Text style={styles.legalText}>Privacy Policy</Text>
            <ArrowLeft size={16} color="#A0AEC0" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => setShowTermsOfService(true)}
          >
            <Text style={styles.legalText}>Terms of Service</Text>
            <ArrowLeft size={16} color="#A0AEC0" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
              <X size={24} color="#1A202C" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>{privacyPolicyContent}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsOfService}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={() => setShowTermsOfService(false)}>
              <X size={24} color="#1A202C" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>{termsOfServiceContent}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1A202C',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  actionButton: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1A202C',
  },
  dangerButton: {
    backgroundColor: '#FED7D7',
    borderColor: '#FC8181',
  },
  dangerButtonText: {
    color: '#E53E3E',
  },
  legalSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  legalText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1A202C',
    lineHeight: 22,
  },
});