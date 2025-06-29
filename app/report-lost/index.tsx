import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useItems } from '@/contexts/ItemContext';
import { MapPin, Calendar, DollarSign, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react-native';

const categories = [
  'Electronics',
  'Jewelry',
  'Clothing',
  'Documents',
  'Keys',
  'Bags',
  'Sports Equipment',
  'Other',
];

export default function ReportLostScreen() {
  const { reportLostItem, getCurrentLocation } = useItems();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_lat: undefined as number | undefined,
    location_lng: undefined as number | undefined,
    location_address: '',
    date_lost: new Date().toISOString().split('T')[0],
    reward_offered: 0,
  });

  const handleGetLocation = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        location_lat: location.latitude,
        location_lng: location.longitude,
        location_address: location.address || '',
      }));
      Alert.alert('Success', 'Location captured successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the lost item.');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get current location if not already set
      let locationData = formData;
      if (!locationData.location_lat || !locationData.location_lng) {
        const location = await getCurrentLocation();
        locationData = {
          ...formData,
          location_lat: location.latitude,
          location_lng: location.longitude,
          location_address: location.address || formData.location_address,
        };
      }

      await reportLostItem({
        title: locationData.title,
        description: locationData.description,
        category: locationData.category,
        location_lat: locationData.location_lat,
        location_lng: locationData.location_lng,
        location_address: locationData.location_address,
        date_lost: locationData.date_lost,
        reward_offered: locationData.reward_offered,
      });

      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        router.back();
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to report lost item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#667eea" />
        </TouchableOpacity>
        <Text style={styles.title}>Report Lost Item</Text>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="What did you lose?"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Describe the item in detail..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, category }))}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
            <MapPin size={20} color="#667eea" />
            <Text style={styles.locationButtonText}>
              {formData.location_address ? 'Update Location' : 'Get Current Location'}
            </Text>
          </TouchableOpacity>
          {formData.location_address && (
            <Text style={styles.locationText}>{formData.location_address}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date Lost</Text>
          <View style={styles.dateContainer}>
            <Calendar size={20} color="#667eea" />
            <TextInput
              style={styles.dateInput}
              value={formData.date_lost}
              onChangeText={(text) => setFormData(prev => ({ ...prev, date_lost: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reward Offered (Optional)</Text>
          <View style={styles.rewardContainer}>
            <DollarSign size={20} color="#667eea" />
            <TextInput
              style={styles.rewardInput}
              value={formData.reward_offered.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reward_offered: parseInt(text) || 0 }))}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Report Lost Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <CheckCircle size={64} color="#38A169" />
            <Text style={styles.successTitle}>Lost Item Reported!</Text>
            <Text style={styles.successMessage}>
              We'll notify you if someone finds your item
            </Text>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  rewardInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1A202C',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
  },
});