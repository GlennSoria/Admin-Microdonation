import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { API } from '../api/api';
import React from 'react';

// --- Custom Colors (Unchanged) ---
const Colors = {
  background: '#3A3A3A',
  cardBackground: '#2C2C2C', 
  inputBackground: '#4A4A4A', 
  cardAccent1: '#F5C170',
  textPrimary: '#FFFFFF', 
  textSecondary: '#AAAAAA', 
  textPlaceholder: '#777777',
  textButtonDark: '#2C2C2C',
};

// --- Custom Components (Unchanged) ---
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

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}

const LabeledTextInput: React.FC<LabeledInputProps> = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      placeholder={placeholder}
      placeholderTextColor={Colors.textPlaceholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// --- Main Component (State/Logic Unchanged) ---

export default function EditProject() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState<boolean>(true);

  const isFormValid = title.trim() !== '' && description.trim() !== '' && targetAmount.trim() !== '';

  useEffect(() => {
    // ... (Load Project Logic) ...
    const loadProject = async () => {
      if (!id) return;
      try {
        const res = await fetch(
          `${API}/getProjects.php?id=${id}`
        );
        const text = await res.text();

        let p: any;
        try {
          p = JSON.parse(text);
        } catch {
          Alert.alert('Server Error', text || 'Received invalid data from server.');
          return;
        }

        const projectData = Array.isArray(p) ? p[0] : p;

        if (projectData && projectData.title) {
            setTitle(projectData.title ?? '');
            setDescription(projectData.description ?? '');
            setTargetAmount(String(projectData.target_amount ?? ''));
            setStatus(projectData.status === 'inactive' ? 'inactive' : 'active');
        } else {
            Alert.alert('Error', 'Project data not found.');
            router.back();
        }

      } catch (e) {
        Alert.alert('Network Error', 'Could not load project details.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const save = async () => {
    if (!isFormValid || !id) return;
    // ... (Save Logic) ...
    try {
        const res = await fetch(
          `${API}/admin/updateProject.php`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: Number(id),
              title,
              description,
              target_amount: Number(targetAmount),
              status,
            }),
          }
        );

        const text = await res.text();
        const data = JSON.parse(text);

        if (data.success) {
          Alert.alert('Success', 'Project Updated Successfully!');
          router.back();
        } else {
          Alert.alert('Error', data.message || 'Update failed');
        }
    } catch (e) {
        Alert.alert('Network Error', 'Failed to connect to the update server.');
    }
  };

  if (loading) {
    return (
        <View style={[styles.safeArea, styles.loadingContainer]}>
            <ActivityIndicator size="large" color={Colors.cardAccent1} />
            <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
            <Text style={styles.title}>Edit Project (ID: {id})</Text>

            {/* --- TOP CARD BLOCK: Title & Amount/Status --- */}
            <View style={styles.cardBlock}>
                
                {/* Full Width Input: Title */}
                <LabeledTextInput
                    label="Project Title"
                    placeholder="Enter project title"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Two-Column Grid: Amount and Status */}
                <View style={styles.gridRow}>
                    
                    {/* Column 1: Target Amount */}
                    <View style={styles.gridItem}>
                        <LabeledTextInput
                            label="Target Amount (₱)"
                            placeholder="e.g., 5000"
                            value={targetAmount}
                            onChangeText={setTargetAmount}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Column 2: Status Picker FIX */}
                    <View style={styles.gridItem}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue) => setStatus(itemValue)}
                                    style={styles.picker}
                                    mode="dropdown"
                                    dropdownIconColor={Colors.textPrimary}
                                    // 💡 FIX: The most reliable way to change the dialog/item color 
                                    // on Android is often through `style` on the Picker, 
                                    // but we also use the `color` prop for maximum compatibility.
                                    itemStyle={styles.pickerItem}
                                    
                                    // 💡 FIX 2: Explicitly set the text color on the Picker for 
                                    // both selected value and hopefully the Android dialog text.
                                    // We use a temporary fix of setting the text color of the parent container on Android.
                                    // The 'color' prop is applied via styles.picker
                                >
                                    {/* 💡 FIX 3: Removed individual item color settings, trusting the main Picker style 
                                        and the container style to handle it better. */}
                                    <Picker.Item label="Active" value="active" />
                                    <Picker.Item label="Inactive" value="inactive" />
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            
            {/* --- DESCRIPTION BLOCK --- */}
            <LabeledTextInput
                label="Detailed Description"
                placeholder="Describe the project goals and needs..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
            />

            <CustomButton
                title="Update Project"
                onPress={save}
                disabled={!isFormValid}
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textPrimary,
    marginTop: 10,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    gap: 20,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    alignSelf: 'center',
  },
  cardBlock: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 5,
  },
  // Reused input style for consistency
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.textPrimary, 
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 10,
    borderRadius: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
  textArea: {
    height: 120,
    paddingVertical: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 15,
  },
  gridItem: {
    flex: 1,
  },
  // --- Picker Styles for the new container ---
  pickerContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 52 : 46,
    // 💡 FIX: For Android dialog issues, setting the text color on the *parent* // container view can sometimes influence the dialog text.
    color: Platform.OS === 'android' ? Colors.textPrimary : undefined, 
  },
  picker: {
    width: '100%',
    // 💡 FIX: This ensures the text inside the *displayed* picker element is visible
    color: Colors.textPrimary, 
  },
  // NOTE: This style often only affects iOS when the wheel opens.
  pickerItem: {
    color: Colors.textPrimary,
    // 💡 FIX: Setting a transparent background on iOS might sometimes help the text visibility.
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : undefined,
  },
  // --- Button Styles (Unchanged) ---
  customButton: {
    backgroundColor: Colors.cardAccent1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
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
  }
});