import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Search, Plus, Package, ShoppingBag, User, Settings, Shield, CircleHelp as HelpCircle, LogOut, Chrome as Home } from 'lucide-react-native';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const drawerWidth = screenWidth * 0.8;

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const { user, signOut } = useSupabaseAuth();
  const { colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-drawerWidth)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const mainMenuItems = [
    { label: 'Report Lost', icon: Search, route: '/(tabs)/index' },
    { label: 'Report Found', icon: Plus, route: '/(tabs)/found' },
    { label: 'My Items', icon: Package, route: '/(tabs)/items' },
    { label: 'Store', icon: ShoppingBag, route: '/(tabs)/store' },
    { label: 'Profile', icon: User, route: '/(tabs)/profile' },
  ];

  const settingsMenuItems = [
    { label: 'Account Settings', icon: Settings, route: '/profile/settings' },
    { label: 'Privacy & Security', icon: Shield, route: '/profile/privacy' },
    { label: 'Help & Support', icon: HelpCircle, route: '/profile/help' },
  ];

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.drawerContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.appInfo}>
                <View style={styles.logoContainer}>
                  <Home size={32} color="#667eea" />
                </View>
                <Text style={styles.appName}>Smart Lost & Found</Text>
                <Text style={styles.appTagline}>Reuniting people with their belongings</Text>
              </View>
            </View>

            {/* User Info */}
            {user && (
              <View style={styles.userSection}>
                <View style={styles.userAvatar}>
                  <User size={24} color="#667eea" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>@{user.username}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.rewardPoints}>{user.reward_points || 0} points</Text>
                </View>
              </View>
            )}

            {/* Main Navigation */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Navigation</Text>
              {mainMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigation(item.route)}
                  >
                    <IconComponent size={20} color={colors.textSecondary} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Settings */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Settings</Text>
              {settingsMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigation(item.route)}
                  >
                    <IconComponent size={20} color={colors.textSecondary} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Logout */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color="#E53E3E" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: drawerWidth,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 16,
  },
  appInfo: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rewardPoints: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  menuSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#E53E3E',
  },
});