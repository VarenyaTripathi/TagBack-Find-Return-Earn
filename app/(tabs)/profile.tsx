import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/contexts/ItemContext';
import { User, Award, Settings, CircleHelp as HelpCircle, LogOut, Star, Trophy, Heart, Shield, ChevronRight, Gift } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { userLostItems, userFoundItems, matches } = useItems();
  const router = useRouter();

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLogout = () => {
    triggerHapticFeedback();
    signOut();
    router.replace('/auth');
  };

  const handleNavigation = (route: string) => {
    triggerHapticFeedback();
    router.push(route as any);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Please log in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalReported = userLostItems.length + userFoundItems.length;
  const successfulReturns = matches.filter(match => match.status === 'confirmed').length;
  const karmaScore = totalReported > 0 
    ? Math.min(100, Math.round((successfulReturns / totalReported) * 100))
    : 0;

  const stats = [
    { label: 'Items Reported', value: totalReported.toString(), icon: Star },
    { label: 'Successful Returns', value: successfulReturns.toString(), icon: Trophy },
    { label: 'Community Points', value: (user.reward_points || 0).toString(), icon: Gift },
    { label: 'Karma Score', value: `${karmaScore}%`, icon: Heart },
  ];

  const menuItems = [
    { label: 'Account Settings', icon: Settings, onPress: () => handleNavigation('/profile/settings') },
    { label: 'Privacy & Security', icon: Shield, onPress: () => handleNavigation('/profile/privacy') },
    { label: 'Help & Support', icon: HelpCircle, onPress: () => handleNavigation('/profile/help') },
    { label: 'Sign Out', icon: LogOut, onPress: handleLogout, danger: true },
  ];

  const achievements = [];
  
  if (successfulReturns >= 5) {
    achievements.push({
      title: 'Good Samaritan',
      description: 'Successfully returned 5 items to their owners',
      icon: Trophy,
      color: '#F6AD55'
    });
  }
  
  if (totalReported >= 10) {
    achievements.push({
      title: 'Community Hero',
      description: 'Helped 10 people find their lost belongings',
      icon: Heart,
      color: '#E53E3E'
    });
  }

  if (achievements.length === 0) {
    achievements.push({
      title: 'Getting Started',
      description: 'Report your first item to start earning achievements',
      icon: Star,
      color: '#718096'
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color="#667eea" />
            </View>
            <View style={styles.rewardBadge}>
              <Award size={16} color="white" />
            </View>
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.pointsContainer}>
            <Gift size={20} color="#F6AD55" />
            <Text style={styles.pointsText}>{user.reward_points || 0} Reward Points</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <IconComponent size={24} color="#667eea" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <View key={index} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <IconComponent size={24} color={achievement.color} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <IconComponent 
                    size={20} 
                    color={item.danger ? '#E53E3E' : '#718096'} 
                  />
                  <Text 
                    style={[
                      styles.menuItemText, 
                      item.danger && styles.menuItemTextDanger
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={20} color="#A0AEC0" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Lost & Found v1.0.0</Text>
          <Text style={styles.footerText}>Built with Bolt.new</Text>
          <Text style={styles.footerSubtext}>
            Making the world a more honest place, one return at a time.
          </Text>
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
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1A202C',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6AD55',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#C05621',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1A202C',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
  },
  achievementsContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  menuContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1A202C',
  },
  menuItemTextDanger: {
    color: '#E53E3E',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#718096',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
  },
});