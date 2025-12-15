import { View, Button } from 'react-native';
import { router } from 'expo-router';

export default function AdminDashboard() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Button title="Manage Projects" onPress={() => router.push('/admin/projects')} />
      <Button title="View Donations" onPress={() => router.push('/admin/donations')} />
      <Button title="View Top-Ups" onPress={() => router.push('/admin/topups')} />
    </View>
  );
}
