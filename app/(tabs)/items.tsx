import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, MapPin, Gift, Check, Search, Plus, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useItems, LostItem, FoundItem } from '@/contexts/ItemContext';

export default function MyItemsScreen() {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const { user } = useAuth();
  const { userLostItems, userFoundItems, matches, confirmMatch, rejectMatch } = useItems();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Items</Text>
          <Text style={styles.subtitle}>Track your reported items</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Please log in to view your items</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#F59E0B';
      case 'matched': return '#2563EB';
      case 'returned': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusText = (item: LostItem | FoundItem) => {
    if ('is_found' in item) {
      return item.is_found ? 'Found' : 'Active';
    } else {
      return item.is_matched ? 'Matched' : 'Active';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleConfirmMatch = (matchId: string) => {
    confirmMatch(matchId);
  };

  const handleRejectMatch = (matchId: string) => {
    rejectMatch(matchId);
  };

  const renderItem = (item: LostItem | FoundItem) => {
    const isLostItem = 'is_found' in item;
    const status = getStatusText(item);
    const hasMatch = matches.find(match => 
      (isLostItem && match.lost_item_id === item.id) || 
      (!isLostItem && match.found_item_id === item.id)
    );

    return (
      <View key={item.id} style={styles.itemCard}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        )}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
          
          {item.description && (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.itemDetails}>
            <View style={styles.detailItem}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.location_address || 'Location not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>

          {'reward_offered' in item && item.reward_offered > 0 && (
            <View style={styles.rewardContainer}>
              <Gift size={14} color="#F59E0B" />
              <Text style={styles.rewardText}>Reward: ${item.reward_offered}</Text>
            </View>
          )}

          {hasMatch && hasMatch.status === 'pending' && (
            <View style={styles.matchActions}>
              <Text style={styles.matchText}>Match found!</Text>
              <View style={styles.matchButtons}>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => handleConfirmMatch(hasMatch.id)}
                >
                  <Check size={16} color="white" />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleRejectMatch(hasMatch.id)}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const currentItems = activeTab === 'lost' ? userLostItems : userFoundItems;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Items</Text>
        <Text style={styles.subtitle}>Track your reported items</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lost' && styles.activeTab]}
          onPress={() => setActiveTab('lost')}
        >
          <Search size={20} color={activeTab === 'lost' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'lost' && styles.activeTabText]}>
            Lost Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'found' && styles.activeTab]}
          onPress={() => setActiveTab('found')}
        >
          <Plus size={20} color={activeTab === 'found' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'found' && styles.activeTabText]}>
            Found Items
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentItems.length > 0 ? (
          currentItems.map(renderItem)
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              {activeTab === 'lost' ? (
                <Search size={48} color="#D1D5DB" />
              ) : (
                <Plus size={48} color="#D1D5DB" />
              )}
            </View>
            <Text style={styles.emptyTitle}>
              No {activeTab} items yet
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'lost' 
                ? 'Start by reporting a lost item' 
                : 'Help others by reporting found items'
              }
            </Text>
          </View>
        )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  rewardText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
  },
  matchActions: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  matchText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#166534',
    marginBottom: 8,
  },
  matchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rejectButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
  },
});