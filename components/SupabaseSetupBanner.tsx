import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Database, ExternalLink, X, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export function SupabaseSetupBanner() {
  const [showModal, setShowModal] = useState(false);

  const handleSetupSupabase = () => {
    Linking.openURL('https://supabase.com/dashboard/new');
  };

  const isConfigured = process.env.EXPO_PUBLIC_SUPABASE_URL && 
                     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
                     !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project') &&
                     !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon-key');

  return (
    <>
      <View style={[styles.banner, !isConfigured && styles.warningBanner]}>
        <View style={styles.bannerContent}>
          {isConfigured ? (
            <Database size={24} color="#10B981" />
          ) : (
            <AlertTriangle size={24} color="#F59E0B" />
          )}
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, !isConfigured && styles.warningTitle]}>
              {isConfigured ? '🚀 Ready for Scale!' : '⚠️ Setup Required'}
            </Text>
            <Text style={[styles.bannerDescription, !isConfigured && styles.warningDescription]}>
              {isConfigured 
                ? 'This app is built with Supabase for production-ready scaling to millions of users'
                : 'Supabase configuration needed. Please update your environment variables to enable authentication.'
              }
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.setupButton, !isConfigured && styles.warningButton]}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.setupButtonText}>
            {isConfigured ? 'Setup Guide' : 'Fix Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Supabase Setup Guide</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color="#1A202C" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {!isConfigured && (
              <View style={styles.configWarning}>
                <AlertTriangle size={20} color="#F59E0B" />
                <Text style={styles.configWarningText}>
                  Your Supabase configuration appears to be incomplete. Please follow the steps below to set up your project.
                </Text>
              </View>
            )}

            <View style={styles.setupStep}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.stepText}>1. Create a Supabase project</Text>
            </View>
            
            <View style={styles.setupStep}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.stepText}>2. Copy your project URL and anon key</Text>
            </View>
            
            <View style={styles.setupStep}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.stepText}>3. Update .env file with your credentials</Text>
            </View>
            
            <View style={styles.setupStep}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.stepText}>4. Run the SQL migrations in your Supabase dashboard</Text>
            </View>

            <View style={styles.setupStep}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.stepText}>5. Disable email confirmation in Authentication settings</Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSetupSupabase}
            >
              <ExternalLink size={20} color="white" />
              <Text style={styles.actionButtonText}>Open Supabase Dashboard</Text>
            </TouchableOpacity>

            <View style={styles.envSection}>
              <Text style={styles.envTitle}>Environment Variables (.env file):</Text>
              <View style={styles.envCode}>
                <Text style={styles.envText}>{`EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}</Text>
              </View>
              <Text style={styles.envNote}>
                Replace 'your-project-id' and 'your-anon-key-here' with your actual Supabase project values.
              </Text>
            </View>

            <View style={styles.sqlSection}>
              <Text style={styles.sqlTitle}>SQL Migrations to Run:</Text>
              <View style={styles.sqlCode}>
                <Text style={styles.sqlText}>{`-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  reward_points INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  reward TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'returned')),
  date_reported TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create found_items table
CREATE TABLE IF NOT EXISTS found_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'returned')),
  date_reported TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item_matches table
CREATE TABLE IF NOT EXISTS item_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lost_item_id UUID REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES found_items(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all lost items" ON lost_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own lost items" ON lost_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lost items" ON lost_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all found items" ON found_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own found items" ON found_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own found items" ON found_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view relevant matches" ON item_matches FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM lost_items WHERE id = lost_item_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM found_items WHERE id = found_item_id AND user_id = auth.uid()
  )
);`}</Text>
              </View>
            </View>

            <View style={styles.troubleshootSection}>
              <Text style={styles.troubleshootTitle}>Troubleshooting Authentication Issues:</Text>
              <Text style={styles.troubleshootText}>
                • Make sure your Supabase URL and API key are correct{'\n'}
                • Disable email confirmation in Authentication → Settings{'\n'}
                • Check that RLS policies are properly configured{'\n'}
                • Verify all SQL migrations have been run successfully{'\n'}
                • Try creating a new account if sign-in fails
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warningBanner: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
    marginBottom: 4,
  },
  warningTitle: {
    color: '#92400E',
  },
  bannerDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#047857',
  },
  warningDescription: {
    color: '#B45309',
  },
  setupButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  setupButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  configWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  configWarningText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    flex: 1,
  },
  setupStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1A202C',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 20,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  envSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  envTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 12,
  },
  envCode: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
  },
  envText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    lineHeight: 18,
  },
  envNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sqlSection: {
    marginTop: 20,
  },
  sqlTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 12,
  },
  sqlCode: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    maxHeight: 300,
  },
  sqlText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    lineHeight: 18,
  },
  troubleshootSection: {
    marginTop: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 12,
  },
  troubleshootText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4A5568',
    lineHeight: 20,
  },
});