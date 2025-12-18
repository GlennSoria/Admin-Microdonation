import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { API } from '../api/api';
import React from 'react';

// --- Custom Colors based on the consistent design theme ---
const Colors = {
  background: '#3A3A3A', // Main Dark Background
  cardBackground: '#2C2C2C', // Card/List Item Background
  textPrimary: '#FFFFFF', // White for main titles and record data
  textSecondary: '#AAAAAA', // Light gray for labels
  textAccent: '#F5C170', // ORANGE/BEIGE ACCENT for ALL amounts
  // Red color (textDebit) is no longer used for amount highlighting
};

// --- Interfaces for TypeScript ---
type WalletTransaction = {
  id: number;
  user_name: string;
  amount: number;
  type: string;
  method: string;
  created_at: string;
};

// --- Component for individual Transaction Card ---
const TransactionCard: React.FC<{ item: WalletTransaction }> = ({ item }) => {
  // We are removing the conditional color and sign logic entirely for the amount.
  // The amount will always be displayed with the ORANGE/BEIGE accent color.

  return (
    <View style={styles.transactionCard}>
      {/* Top Row: User and Amount */}
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={[styles.transactionAmount, { color: Colors.textAccent }]}>
          ₱{item.amount.toLocaleString()}
        </Text>
      </View>

      {/* Details */}
      <Text style={styles.methodText}>Method: {item.method}</Text>

      {/* Bottom Row: Type and Date */}
      <View style={styles.cardFooter}>
        <Text style={styles.transactionType}>Type: {item.type}</Text>
        <Text style={styles.transactionDate}>Date: {item.created_at.substring(0, 10)}</Text>
      </View>
    </View>
  );
};

// --- Main Component ---

export default function TopUps() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopUps();
  }, []);

  const fetchTopUps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/get_topups.php`);
      const data: WalletTransaction[] = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error('Fetch top-ups failed:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.textAccent} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <Text style={[styles.listTitle, styles.horizontalPadding]}>Wallet Transactions</Text>
        }
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <TransactionCard item={item} />}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No wallet transactions found.</Text>
        }
      />
    </SafeAreaView>
  );
}

// --- Stylesheet (Kept consistent) ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textPrimary,
    marginTop: 10,
    fontSize: 16,
  },
  horizontalPadding: {
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 20,
    paddingTop: 0,
    paddingHorizontal: 20,
    gap: 15,
  },
  listTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyText: {
    color: Colors.textSecondary,
    padding: 20,
    textAlign: 'center',
    marginTop: 30,
  },
  transactionCard: {
    backgroundColor: Colors.cardBackground,
    padding: 18,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  methodText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionType: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});