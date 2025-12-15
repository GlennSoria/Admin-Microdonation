import { View, TextInput, Button, Alert} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';

export default function EditProject() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    fetch(`http://192.168.1.20/api/get_project.php?id=${id}`)
      .then(res => res.json())
      .then(p => {
        setTitle(p.title);
        setDescription(p.description);
        setTargetAmount(p.target_amount.toString());
        setStatus(p.status);
      });
  }, []);

  const save = async () => {
    const res = await fetch('http://192.168.1.20/api/edit_project.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        title,
        description,
        target_amount: parseFloat(targetAmount),
        status,
      }),
    });

    const data = await res.json();
    if (data.success) {
      Alert.alert('Project Updated');
      router.back();
    } else {
      Alert.alert('Error', data.message || 'Failed to update project');
    }
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <TextInput value={title} onChangeText={setTitle} placeholder="Title" />
      <TextInput value={description} onChangeText={setDescription} placeholder="Description" />
      <TextInput
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder="Target Amount"
        keyboardType="numeric"
      />
      <Picker selectedValue={status} onValueChange={v => setStatus(v)}>
        <Picker.Item label="Active" value="active" />
        <Picker.Item label="Inactive" value="inactive" />
      </Picker>
      <Button title="Update Project" onPress={save} />
    </View>
  );
}
