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
import { ShoppingBag, Star, Clock, Sparkles } from 'lucide-react-native';

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  daysUnclaimed: number;
  rating: number;
  isAffiliate: boolean;
}

export default function StoreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Electronics', 'Jewelry', 'Bags', 'Clothing', 'Sports'];

  const mockItems: StoreItem[] = [
    {
      id: '1',
      title: 'Vintage Gold Watch',
      description: 'Beautiful vintage gold watch with leather strap',
      price: 75,
      originalPrice: 150,
      images: ['https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=400'],
      category: 'Jewelry',
      daysUnclaimed: 35,
      rating: 4.5,
      isAffiliate: false,
    },
    {
      id: '2',
      title: 'Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation',
      price: 120,
      images: ['https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400'],
      category: 'Electronics',
      daysUnclaimed: 42,
      rating: 4.8,
      isAffiliate: true,
    },
    {
      id: '3',
      title: 'Designer Handbag',
      description: 'Stylish leather handbag in excellent condition',
      price: 90,
      originalPrice: 200,
      images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400'],
      category: 'Bags',
      daysUnclaimed: 31,
      rating: 4.3,
      isAffiliate: false,
    },
    {
      id: '4',
      title: 'Running Shoes',
      description: 'Premium running shoes, barely used',
      price: 60,
      originalPrice: 120,
      images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400'],
      category: 'Sports',
      daysUnclaimed: 38,
      rating: 4.6,
      isAffiliate: true,
    },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? mockItems 
    : mockItems.filter(item => item.category === selectedCategory);

  const handlePurchase = (item: StoreItem) => {
    console.log('Purchasing:', item.title);
  };

  const renderItem = (item: StoreItem) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
        {item.isAffiliate && (
          <View style={styles.affiliateBadge}>
            <Sparkles size={12} color="white" />
            <Text style={styles.affiliateText}>Partner</Text>
          </View>
        )}
        <View style={styles.unclaimedBadge}>
          <Clock size={12} color="white" />
          <Text style={styles.unclaimedText}>{item.daysUnclaimed}d</Text>
        </View>
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.ratingContainer}>
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.purchaseButton}
          onPress={() => handlePurchase(item)}
        >
          <ShoppingBag size={16} color="white" />
          <Text style={styles.purchaseButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Store</Text>
        <Text style={styles.subtitle}>Unclaimed items & affiliate products</Text>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryScrollContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category === 'all' ? 'All Items' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.infoBanner}>
        <View style={styles.infoBannerIcon}>
          <Clock size={20} color="#2563EB" />
        </View>
        <View style={styles.infoBannerContent}>
          <Text style={styles.infoBannerTitle}>How it works</Text>
          <Text style={styles.infoBannerText}>
            Items unclaimed for 30+ days are available for purchase. Revenue supports the platform.
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredItems.map(renderItem)}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#718096',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoBannerIcon: {
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E3A8A',
  },
  content: {
    flex: 1,
  },
  grid: {
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
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  affiliateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  affiliateText: {
    marginLeft: 4,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  unclaimedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unclaimedText: {
    marginLeft: 4,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  itemContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1A202C',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textDecorationLine: 'line-through',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
  },
  purchaseButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});