import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from './SupabaseAuthContext';
import * as Location from 'expo-location';

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
  finder_id: string;
  owner_id: string;
  points_awarded: number;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  updated_at: string;
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
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function SupabaseItemProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [userLostItems, setUserLostItems] = useState<LostItem[]>([]);
  const [userFoundItems, setUserFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
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
      // Fetch all lost items
      const { data: allLostItems, error: lostError } = await supabase
        .from('lost_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (lostError) throw lostError;
      setLostItems(allLostItems || []);

      // Fetch all found items
      const { data: allFoundItems, error: foundError } = await supabase
        .from('found_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (foundError) throw foundError;
      setFoundItems(allFoundItems || []);

      // Fetch user's lost items
      const { data: userLost, error: userLostError } = await supabase
        .from('lost_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userLostError) throw userLostError;
      setUserLostItems(userLost || []);

      // Fetch user's found items
      const { data: userFound, error: userFoundError } = await supabase
        .from('found_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userFoundError) throw userFoundError;
      setUserFoundItems(userFound || []);

      // Fetch matches involving the user
      const { data: userMatches, error: matchesError } = await supabase
        .from('item_matches')
        .select(`
          *,
          lost_item:lost_items(*),
          found_item:found_items(*)
        `)
        .or(`finder_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;
      setMatches(userMatches || []);

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reportLostItem = async (item: Omit<LostItem, 'id' | 'user_id' | 'is_found' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('lost_items')
        .insert({
          ...item,
          user_id: user.id,
          is_found: false,
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error reporting lost item:', error);
      throw error;
    }
  };

  const reportFoundItem = async (item: Omit<FoundItem, 'id' | 'user_id' | 'is_matched' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('found_items')
        .insert({
          ...item,
          user_id: user.id,
          is_matched: false,
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error reporting found item:', error);
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
    }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useSupabaseItems() {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useSupabaseItems must be used within a SupabaseItemProvider');
  }
  return context;
}