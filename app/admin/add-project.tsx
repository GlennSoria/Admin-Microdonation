import React, { useState } from 'react';
import { 
  View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API } from '../api/api';
import { router } from 'expo-router';

// --- Colors ---
const Colors = {
  background: '#3A3A3A',
  inputBackground: '#2C2C2C',
  cardAccent1: '#F5C170',
  textPrimary: '#FFFFFF',
  textPlaceholder: '#AAAAAA',
  textButtonDark: '#2C2C2C',
};

// --- Button Component ---
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, disabled = false }) => (
  <TouchableOpacity 
    style={[styles.customButton, disabled && styles.disabledButton]} 
    onPress={onPress} 
    disabled={disabled}
  >
    <Text style={styles.customButtonText}>{title}</Text>
  </TouchableOpacity>
);

// --- Main Component ---
export default function AddProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [image, setImage] = useState<any>(null);

  const isFormValid = title.trim() !== '' && description.trim() !== '' && targetAmount.trim() !== '';

  // --- Pick image from gallery ---
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // --- Submit project ---
  const submit = async () => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('target_amount', targetAmount);

      if (image) {
        formData.append('image', {
          uri: image.uri,
          type: 'image/jpeg', // adjust if PNG
          name: 'project.jpg',
        } as any);
      }

      const res = await fetch(`${API}/add_project.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Project Added Successfully!');
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Failed to add project');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Create New Project</Text>

          <TextInput
            style={styles.input}
            placeholder="Project Title"
            placeholderTextColor={Colors.textPlaceholder}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed Description"
            placeholderTextColor={Colors.textPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Target Funding Amount (e.g., 5000)"
            placeholderTextColor={Colors.textPlaceholder}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={{ color: Colors.textPrimary }}>
              {image ? 'Change Image' : 'Pick an Image'}
            </Text>
          </TouchableOpacity>

          {image && (
            <Image
              source={{ uri: image.uri }}
              style={{ width: '100%', height: 200, borderRadius: 15, marginVertical: 10 }}
            />
          )}

          <CustomButton title="Save Project" onPress={submit} disabled={!isFormValid} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  container: {
    flex: 1,
    gap: 15,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    paddingTop: 10,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.textPrimary,
    padding: 16,
    borderRadius: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  imagePicker: {
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  customButton: {
    backgroundColor: Colors.cardAccent1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  customButtonText: {
    color: Colors.textButtonDark,
    fontSize: 18,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
