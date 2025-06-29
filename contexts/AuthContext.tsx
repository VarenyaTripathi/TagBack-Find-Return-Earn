import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthUser extends User {
  username?: string;
  reward_points?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { username?: string; reward_points?: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        // Still set the user with auth data if profile fetch fails
        setUser({
          ...authUser,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
          reward_points: 0,
        });
      } else if (profile) {
        console.log('Profile loaded:', profile);
        setUser({
          ...authUser,
          username: profile.username,
          reward_points: profile.reward_points || 0,
        });
      } else {
        console.log('No profile found, creating one...');
        // Try to create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            reward_points: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Use auth user data as fallback
          setUser({
            ...authUser,
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            reward_points: 0,
          });
        } else {
          console.log('Profile created:', newProfile);
          setUser({
            ...authUser,
            username: newProfile.username,
            reward_points: newProfile.reward_points || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Fallback to auth user data
      setUser({
        ...authUser,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
        reward_points: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Check if Supabase is properly configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            username: username
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        if (error.message.includes('over_email_send_rate_limit')) {
          throw new Error('Too many signup attempts. Please wait a moment before trying again.');
        } else if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('signup_disabled')) {
          throw new Error('Account creation is currently disabled. Please contact support.');
        } else if (error.message.includes('invalid_credentials')) {
          throw new Error('Invalid email or password format. Please check your input.');
        } else {
          throw new Error(error.message || 'Failed to create account. Please try again.');
        }
      }

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      console.log('Sign up successful:', data);
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if Supabase is properly configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signin error:', error);
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          throw new Error('Invalid email or password. Please check your credentials or create a new account if you don\'t have one.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('too_many_requests')) {
          throw new Error('Too many login attempts. Please wait a moment before trying again.');
        } else if (error.message.includes('signup_disabled')) {
          throw new Error('Authentication is currently disabled. Please contact support.');
        } else {
          throw new Error(error.message || 'Sign in failed. Please check your internet connection and try again.');
        }
      }

      if (!data.user) {
        throw new Error('Sign in failed. Please try again.');
      }

      console.log('Sign in successful:', data);
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: { username?: string; reward_points?: number }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.warn('Could not update profile:', error.message);
        return;
      }

      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.warn('Profile update failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signUp,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}