import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CircleHelp as HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react-native';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={24} color="#667eea" />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I report a lost item?</Text>
            <Text style={styles.faqAnswer}>
              Go to the "Report Lost" tab and tap the report button. Fill in the details including title, description, category, and location. The more details you provide, the better chance of finding your item.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I report a found item?</Text>
            <Text style={styles.faqAnswer}>
              Go to the "Report Found" tab and tap "Report Found Item". Make sure to capture your current location and provide detailed description. Our system will automatically check for matches with lost items.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How does the matching system work?</Text>
            <Text style={styles.faqAnswer}>
              When you report a found item, our system automatically searches for lost items in the same category and nearby location. If a match is found, both users are notified and the finder receives reward points.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I earn reward points?</Text>
            <Text style={styles.faqAnswer}>
              You earn 10 points for each successful match when you find and report someone's lost item. Points are awarded automatically when the owner confirms the match.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What should I do if I find a match?</Text>
            <Text style={styles.faqAnswer}>
              When a match is found, both you and the item owner will be notified. You can then coordinate through the app to arrange the return of the item safely.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is my location data safe?</Text>
            <Text style={styles.faqAnswer}>
              Yes, we only use location data to help match lost and found items. Your exact location is not shared with other users - only general area information for matching purposes.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <TouchableOpacity style={styles.contactItem}>
            <MessageCircle size={20} color="#667eea" />
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactSubtitle}>Get instant help from our support team</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Mail size={20} color="#667eea" />
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>support@lostandfound.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Phone size={20} color="#667eea" />
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactSubtitle}>1-800-LOST-FOUND</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>• Be Detailed</Text>
            <Text style={styles.tipText}>
              Provide as much detail as possible when reporting items. Include colors, brands, unique features, and circumstances.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>• Use Accurate Location</Text>
            <Text style={styles.tipText}>
              Make sure to capture the exact location where you lost or found the item for better matching.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>• Check Regularly</Text>
            <Text style={styles.tipText}>
              Check the app regularly for matches and respond promptly to notifications.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>• Stay Safe</Text>
            <Text style={styles.tipText}>
              When meeting to return items, choose public places and consider bringing a friend.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginLeft: 8,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  contactText: {
    marginLeft: 15,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1A202C',
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    marginTop: 2,
  },
  tipItem: {
    marginBottom: 15,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    lineHeight: 20,
    marginLeft: 15,
  },
});