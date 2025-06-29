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
import { useItems } from '@/contexts/ItemContext';
import { MapPin, Calendar, Plus, CircleCheck as CheckCircle } from 'lucide-react-native';

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

export default function FoundScreen() {
  const { reportFoundItem, getCurrentLocation, foundItems, isLoading: contextLoading } = useItems();
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_lat: undefined as number | undefined,
    location_lng: undefined as number | undefined,
    location_address: '',
    date_found: new Date().toISOString().split('T')[0],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location_lat: undefined,
      location_lng: undefined,
      location_address: '',
      date_found: new Date().toISOString().split('T')[0],
    });
  };

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
      Alert.alert('Error', 'Please enter a title for the found item.');
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

      await reportFoundItem({
        title: locationData.title,
        description: locationData.description,
        category: locationData.category,
        location_lat: locationData.location_lat,
        location_lng: locationData.location_lng,
        location_address: locationData.location_address,
        date_found: locationData.date_found,
      });

      setShowSuccessModal(true);
      
      setTimeout(() => {
        resetForm();
        setShowForm(false);
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error reporting found item:', error);
      Alert.alert('Error', 'Failed to report found item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Found Item</Text>
          <Text style={styles.subtitle}>Help reunite someone with their belongings</Text>
        </View>
        
        <ScrollView style={styles.formContainer}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="What did you find?"
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
              <Text style={styles.label}>Location *</Text>
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
              <Text style={styles.label}>Date Found</Text>
              <View style={styles.dateContainer}>
                <Calendar size={20} color="#667eea" />
                <TextInput
                  style={styles.dateInput}
                  value={formData.date_found}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, date_found: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Report Found Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <CheckCircle size={64} color="#38A169" />
              <Text style={styles.successTitle}>Found Item Reported!</Text>
              <Text style={styles.successMessage}>
                We'll check for matches and notify you if we find the owner
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Found Items</Text>
        <Text style={styles.subtitle}>Help others find their lost belongings</Text>
      </View>
      
      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
        <Plus size={24} color="#fff" />
        <Text style={styles.addButtonText}>Report Found Item</Text>
      </TouchableOpacity>

      <ScrollView style={styles.itemsList}>
        {contextLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading found items...</Text>
          </View>
        ) : foundItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No found items reported yet</Text>
            <Text style={styles.emptySubtext}>Be the first to help someone find their lost item!</Text>
          </View>
        ) : (
          foundItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}
              <View style={styles.itemMeta}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemDate}>Found: {item.date_found}</Text>
              </View>
              {item.location_address && (
                <Text style={styles.itemLocation}>{item.location_address}</Text>
              )}
              {item.is_matched && (
                <View style={styles.matchedBadge}>
                  <Text style={styles.matchedText}>Matched!</Text>
                </View>
              )}
            </View>
          ))
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
  formContainer: {
    flex: 1,
  },
  form: {
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    margin: 20,
    padding: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6c757d',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  itemLocation: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  matchedBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  matchedText: {
    color: '#fff',
    fontSize: 12,
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