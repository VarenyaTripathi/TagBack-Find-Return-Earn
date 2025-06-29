import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Image as ImageIcon, RotateCcw } from 'lucide-react-native';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onImageCaptured: (uri: string) => void;
}

export function CameraModal({ visible, onClose, onImageCaptured }: CameraModalProps) {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const sampleImages = [
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1037990/pexels-photo-1037990.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
      ];
      const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      onImageCaptured(randomImage);
      onClose();
      return;
    }

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          onImageCaptured(photo.uri);
          onClose();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickFromGallery = async () => {
    if (Platform.OS === 'web') {
      const sampleImages = [
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1037990/pexels-photo-1037990.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=400',
      ];
      const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      onImageCaptured(randomImage);
      onClose();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageCaptured(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#667eea" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos of items
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {Platform.OS !== 'web' ? (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.bottomControls}>
                <TouchableOpacity style={styles.galleryButton} onPress={handlePickFromGallery}>
                  <ImageIcon size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                  <RotateCcw size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        ) : (
          <View style={styles.webContainer}>
            <View style={styles.webHeader}>
              <Text style={styles.webTitle}>Add Photo</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#667eea" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.webContent}>
              <Camera size={80} color="#667eea" />
              <Text style={styles.webText}>Camera not available on web</Text>
              <Text style={styles.webSubtext}>We'll add a sample photo for demonstration</Text>
              
              <TouchableOpacity style={styles.webButton} onPress={handleTakePhoto}>
                <Text style={styles.webButtonText}>Add Sample Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#667eea',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1A202C',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: '#718096',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  webContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  webTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
  },
  webContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginTop: 24,
    marginBottom: 8,
  },
  webSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  webButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  webButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});