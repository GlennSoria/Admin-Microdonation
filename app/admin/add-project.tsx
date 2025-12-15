import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function AddProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const submit = async () => {
    const res = await fetch('http://192.168.1.20/api/add_project.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        target_amount: parseFloat(targetAmount),
      }),
    });

    const data = await res.json();
    if (data.success) {
      Alert.alert('Project Added');
      router.back();
    } else {
      Alert.alert('Error', data.message || 'Failed to add project');
    }
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput
        placeholder="Target Amount"
        value={targetAmount}
        onChangeText={setTargetAmount}
        keyboardType="numeric"
      />
      <Button title="Save Project" onPress={submit} />
    </View>
  );
}
