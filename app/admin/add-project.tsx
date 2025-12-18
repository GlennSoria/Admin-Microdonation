import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { API } from '../api/api';
import React from 'react';

// --- Custom Colors based on the previous design ---
const Colors = {
  background: '#3A3A3A', // Dark Gray/Black for the main background
  inputBackground: '#2C2C2C', // Slightly lighter dark for input fields
  cardAccent1: '#F5C170', // The Orange/Beige color for the button
  textPrimary: '#FFFFFF', // White for titles and input text
  textPlaceholder: '#AAAAAA', // Light gray for placeholders
  textButtonDark: '#2C2C2C', // Dark text on the light button
};

// --- Interfaces for TypeScript ---
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// --- Custom Components ---

// Reusable styled button using TouchableOpacity
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

  // Check if all required fields are filled to enable the button
  const isFormValid = title.trim() !== '' && description.trim() !== '' && targetAmount.trim() !== '';

  const submit = async () => {
    // Basic validation
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    // Set button to disabled while fetching (optional feature, but good practice)
    // You would typically use a loading state for this, but for simplicity, we'll proceed.

    try {
      const res = await fetch(`${API}/api/add_project.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          // Ensure targetAmount is a valid number before parsing
          target_amount: parseFloat(targetAmount) || 0,
        }),
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
          placeholder="Detailed Description of the Project"
          placeholderTextColor={Colors.textPlaceholder}
          value={description}
          onChangeText={setDescription}
          multiline={true}
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
        
        <CustomButton 
          title="Save Project" 
          onPress={submit} 
          disabled={!isFormValid} // Button styling changes if disabled
        />
        
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 15, // Space between inputs/buttons
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
    // Rounded corners matching the overall theme
    borderRadius: 15, 
    fontSize: 16,
    // Add a light border/shadow for better separation in the dark theme
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', 
  },
  textArea: {
    height: 120, // Make the description field taller
    textAlignVertical: 'top', // Start text at the top on Android
    paddingTop: 16,
  },
  customButton: {
    backgroundColor: Colors.cardAccent1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20, // Rounded button style
    alignItems: 'center',
    marginTop: 15,
    // Shadow for depth
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
    // Fade the button when disabled
    opacity: 0.5, 
  }
});