import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, MapPin, Gift, Upload, X, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/contexts/ItemContext';
import { CameraModal } from '@/components/CameraModal';
import { SupabaseSetupBanner } from '@/components/SupabaseSetupBanner';
import * as Haptics from 'expo-haptics';

export default function ReportLostScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reward, setReward] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { user } = useAuth();
  const { reportLostItem, getCurrentLocation } = useItems();

  const categories = [
    'Electronics', 'Jewelry', 'Bags', 'Keys', 'Documents', 'Clothing', 'Sports', 'Other'
  ];
  const [selectedCategory, setSelectedCategory] = useState('');

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleGetLocation = async () => {
    try {
      const locationData = await getCurrentLocation();
      setLocation(locationData.address || `${locationData.latitude}, ${locationData.longitude}`);
      Alert.alert('Success', 'Location captured successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in title and description');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'You must be logged in to report an item');
      return;
    }

    setIsSubmitting(true);
    triggerHapticFeedback();

    try {
      const locationData = await getCurrentLocation();
      
      await reportLostItem({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory || 'Other',
        location_lat: locationData.latitude,
        location_lng: locationData.longitude,
        location_address: location.trim() || locationData.address || '',
        date_lost: new Date().toISOString().split('T')[0],
        image_url: images[0] || '',
        reward_offered: parseInt(reward) || 0,
      });

      setShowSuccessModal(true);
      
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setLocation('');
        setReward('');
        setImages([]);
        setSelectedCategory('');
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error reporting lost item:', error);
      Alert.alert('Error', 'Failed to report item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhoto = () => {
    triggerHapticFeedback();
    setShowCamera(true);
  };

  const handleImageCaptured = (uri: string) => {
    setImages([...images, uri]);
  };

  const removeImage = (index: number) => {
    triggerHapticFeedback();
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Lost Item</Text>
        <Text style={styles.subtitle}>Help us help you find your lost belongings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SupabaseSetupBanner />
        
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., iPhone 15 Pro"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category && styles.categoryButtonActive,
                      ]}
                      onPress={() => {
                        triggerHapticFeedback();
                        setSelectedCategory(category);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === category && styles.categoryButtonTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Detailed description of the item..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Photos</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Seen Location</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color="#718096" />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="e.g., Central Park, NYC"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#A0AEC0"
                />
                <TouchableOpacity onPress={handleGetLocation} style={styles.locationButton}>
                  <Text style={styles.locationButtonText}>Get Location</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photos</Text>
              <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
                <Camera size={24} color="#667eea" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              {images.length > 0 && (
                <ScrollView horizontal style={styles.imagePreview}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <X size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reward (Optional)</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWithIcon}>
                <Gift size={20} color="#718096" />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="e.g., $50 or Thank you reward"
                  value={reward}
                  onChangeText={setReward}
                  placeholderTextColor="#A0AEC0"
                />
              </View>
              <Text style={styles.helperText}>
                Offering a reward increases the chances of your item being returned
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Upload size={20} color="white" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Reporting...' : 'Report Lost Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onImageCaptured={handleImageCaptured}
      />

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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1A202C',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWithIconText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1A202C',
  },
  locationButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4A5568',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  imagePreview: {
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
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