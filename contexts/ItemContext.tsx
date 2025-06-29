import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LostItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  date_lost?: string;
  image_url?: string;
  is_found: boolean;
  reward_offered: number;
  created_at: string;
  updated_at: string;
}

export interface FoundItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  date_found?: string;
  image_url?: string;
  is_matched: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  lost_item?: LostItem;
  found_item?: FoundItem;
}

interface ItemContextType {
  lostItems: LostItem[];
  foundItems: FoundItem[];
  userLostItems: LostItem[];
  userFoundItems: FoundItem[];
  matches: Match[];
  isLoading: boolean;
  reportLostItem: (item: Omit<LostItem, 'id' | 'user_id' | 'is_found' | 'created_at' | 'updated_at'>) => Promise<void>;
  reportFoundItem: (item: Omit<FoundItem, 'id' | 'user_id' | 'is_matched' | 'created_at' | 'updated_at'>) => Promise<void>;
  getCurrentLocation: () => Promise<{ latitude: number; longitude: number; address?: string }>;
  refreshData: () => Promise<void>;
  confirmMatch: (matchId: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [userLostItems, setUserLostItems] = useState<LostItem[]>([]);
  const [userFoundItems, setUserFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Clear data when user logs out
      setLostItems([]);
      setFoundItems([]);
      setUserLostItems([]);
      setUserFoundItems([]);
      setMatches([]);
    }
  }, [user]);

  const getCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      // For web, return a default location (New York City)
      return {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY, USA'
      };
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        const addressString = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        return { latitude, longitude, address: addressString };
      } catch (error) {
        console.warn('Could not get address:', error);
        return { latitude, longitude };
      }
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Refreshing data for user:', user.id);

      // Fetch all lost items
      const { data: allLostItems, error: lostError } = await supabase
        .from('lost_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (lostError) {
        console.error('Error fetching lost items:', lostError);
      } else {
        console.log('Fetched lost items:', allLostItems?.length || 0);
        setLostItems(allLostItems || []);
      }

      // Fetch all found items
      const { data: allFoundItems, error: foundError } = await supabase
        .from('found_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (foundError) {
        console.error('Error fetching found items:', foundError);
      } else {
        console.log('Fetched found items:', allFoundItems?.length || 0);
        setFoundItems(allFoundItems || []);
      }

      // Fetch user's lost items
      const { data: userLost, error: userLostError } = await supabase
        .from('lost_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userLostError) {
        console.error('Error fetching user lost items:', userLostError);
      } else {
        console.log('Fetched user lost items:', userLost?.length || 0);
        setUserLostItems(userLost || []);
      }

      // Fetch user's found items
      const { data: userFound, error: userFoundError } = await supabase
        .from('found_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userFoundError) {
        console.error('Error fetching user found items:', userFoundError);
      } else {
        console.log('Fetched user found items:', userFound?.length || 0);
        setUserFoundItems(userFound || []);
      }

      // Fetch matches involving the user
      const { data: userMatches, error: matchesError } = await supabase
        .from('item_matches')
        .select('*')
        .or(`lost_item_id.in.(${userLost?.map(item => item.id).join(',') || 'null'}),found_item_id.in.(${userFound?.map(item => item.id).join(',') || 'null'})`)
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
      } else {
        console.log('Fetched matches:', userMatches?.length || 0);
        setMatches(userMatches || []);
      }

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reportLostItem = async (item: Omit<LostItem, 'id' | 'user_id' | 'is_found' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Reporting lost item:', item);
      
      const { data, error } = await supabase
        .from('lost_items')
        .insert({
          title: item.title,
          description: item.description || '',
          category: item.category || 'Other',
          location: item.location_address || '',
          reward: item.reward_offered ? item.reward_offered.toString() : null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Lost item reported successfully:', data);
      await refreshData();
    } catch (error) {
      console.error('Error reporting lost item:', error);
      throw error;
    }
  };

  const reportFoundItem = async (item: Omit<FoundItem, 'id' | 'user_id' | 'is_matched' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Reporting found item:', item);
      
      const { data, error } = await supabase
        .from('found_items')
        .insert({
          description: item.description || item.title || '',
          category: item.category || 'Other',
          location: item.location_address || '',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Found item reported successfully:', data);
      await refreshData();
    } catch (error) {
      console.error('Error reporting found item:', error);
      throw error;
    }
  };

  const confirmMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('item_matches')
        .update({ status: 'confirmed' })
        .eq('id', matchId);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error confirming match:', error);
      throw error;
    }
  };

  const rejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('item_matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error rejecting match:', error);
      throw error;
    }
  };

  return (
    <ItemContext.Provider value={{
      lostItems,
      foundItems,
      userLostItems,
      userFoundItems,
      matches,
      isLoading,
      reportLostItem,
      reportFoundItem,
      getCurrentLocation,
      refreshData,
      confirmMatch,
      rejectMatch,
    }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
}