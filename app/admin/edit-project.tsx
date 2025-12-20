import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { API } from '../api/api'; // <-- dynamic API

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

const LabeledTextInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}) => (
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

export default function EditProject() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const isFormValid = title.trim() !== '' && description.trim() !== '' && targetAmount.trim() !== '';

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API}/getProjects.php?id=${id}`);
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          Alert.alert('Server Error', 'Invalid response from server');
          return;
        }
        const project = Array.isArray(data) ? data[0] : data;
        if (!project) {
          Alert.alert('Error', 'Project not found');
          router.back();
          return;
        }
        setTitle(project.title ?? '');
        setDescription(project.description ?? '');
        setTargetAmount(String(project.target_amount ?? ''));
        setStatus(project.status === 'inactive' ? 'inactive' : 'active');
        setExistingImage(project.image ?? null);
      } catch (e) {
        Alert.alert('Network Error', 'Unable to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera roll permission is required to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!isFormValid || !id) return;

    const formData = new FormData();
    formData.append('id', id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('target_amount', targetAmount);
    formData.append('status', status);

    if (imageUri) {
      const filename = imageUri.split('/').pop() as string;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      // @ts-ignore
      formData.append('image', { uri: imageUri, name: filename, type });
    }

    try {
      const res = await fetch(`${API}/admin/updateProject.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Project updated successfully');
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Network Error', 'Failed to connect to server');
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

          {(existingImage || imageUri) && (
            <TouchableOpacity onPress={pickImage} style={{ marginVertical: 10 }}>
              <Image
                source={{ uri: imageUri || existingImage! }}
                style={{ width: '100%', height: 200, borderRadius: 15 }}
                resizeMode="cover"
              />
              <Text style={{ color: Colors.cardAccent1, textAlign: 'center', marginTop: 5 }}>
                Tap to change image
              </Text>
            </TouchableOpacity>
          )}

          {!existingImage && !imageUri && <CustomButton title="Select Image" onPress={pickImage} />}

          <LabeledTextInput label="Project Title" value={title} onChangeText={setTitle} placeholder="Enter project title" />
          
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <LabeledTextInput
                label="Target Amount (₱)"
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="e.g., 5000"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.gridItem}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={status}
                    onValueChange={setStatus}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Inactive" value="inactive" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          <LabeledTextInput
            label="Detailed Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the project goals..."
            multiline
          />

          <CustomButton title="Update Project" onPress={save} disabled={!isFormValid} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { color: Colors.textPrimary, marginTop: 10 },
  scrollContent: { flexGrow: 1, padding: 20 },
  container: { flex: 1, gap: 20 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: 10, alignSelf: 'center' },
  inputGroup: { gap: 5 },
  inputLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', paddingHorizontal: 5 },
  input: { backgroundColor: Colors.inputBackground, color: Colors.textPrimary, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 10, borderRadius: 15, fontSize: 16 },
  textArea: { height: 120, paddingVertical: 16 },
  gridRow: { flexDirection: 'row', gap: 15 },
  gridItem: { flex: 1 },
  pickerContainer: { backgroundColor: Colors.inputBackground, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  picker: { width: '100%', color: Colors.textPrimary },
  customButton: { backgroundColor: Colors.cardAccent1, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  customButtonText: { color: Colors.textButtonDark, fontSize: 18, fontWeight: '800' },
  disabledButton: { opacity: 0.5 },
});
