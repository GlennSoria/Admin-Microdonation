import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { API } from '../api/api'; // dynamic API

type Account = {
  id: number;
  user_name: string;
  account_number: string;
  provider: 'bank' | 'gcash';
  status: 'pending' | 'approved' | 'rejected';
};

export default function PendingAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Fetch pending accounts
  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/get_pending_accounts.php`);
      const data: Account[] = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const updateAccountStatus = async (account: Account, newStatus: 'approved' | 'rejected') => {
    setProcessingId(account.id);
    try {
      const res = await fetch(`${API}/update_pending_account.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: account.id, provider: account.provider, action: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        Alert.alert('Success', data.message);
        fetchPendingAccounts(); // refresh list
      } else {
        Alert.alert('Error', data.message || 'Failed to update account.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Could not connect to server.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: Account }) => (
    <View style={styles.card}>
      <Text style={styles.userName}>{item.user_name}</Text>
      <Text>Account Number: {item.account_number}</Text>
      <Text>Provider: {item.provider.toUpperCase()}</Text>
      <Text>Status: {item.status}</Text>

      {item.status === 'pending' && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#28A745' }]}
            onPress={() => updateAccountStatus(item, 'approved')}
            disabled={processingId === item.id}
          >
            {processingId === item.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Approve</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#DC3545' }]}
            onPress={() => updateAccountStatus(item, 'rejected')}
            disabled={processingId === item.id}
          >
            {processingId === item.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reject</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Pending Accounts</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF4500" />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No pending accounts.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F7F7F7' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 5 },
  buttonsContainer: { flexDirection: 'row', marginTop: 10, gap: 10 },
  button: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
