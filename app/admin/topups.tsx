import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';

type WalletTransaction = {
  id: number;
  user_name: string;
  amount: number;
  type: string;
  method: string;
  created_at: string;
};

export default function TopUps() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    fetchTopUps();
  }, []);

  const fetchTopUps = async () => {
    try {
      const res = await fetch('http://192.168.1.20/api/get_topups.php'); // Replace with your LAN IP
      const data: WalletTransaction[] = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error('Fetch top-ups failed:', error);
    }
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}>
          <Text>User: {item.user_name}</Text>
          <Text>Amount: ₱{item.amount}</Text>
          <Text>Type: {item.type}</Text>
          <Text>Method: {item.method}</Text>
          <Text>Date: {item.created_at}</Text>
        </View>
      )}
    />
  );
}
