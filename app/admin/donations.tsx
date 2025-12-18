import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { API } from '../api/api';
import React from 'react';

// --- Custom Colors based on the previous design ---
const Colors = {
  background: '#3A3A3A', // Main Dark Background
  cardBackground: '#2C2C2C', // Card/List Item Background (Donation Record)
  headerBackground: '#4A4A4A', // Slightly different dark background for the header totals
  cardAccent1: '#F5C170', // Orange/Beige for primary highlights (like currency totals)
  textPrimary: '#FFFFFF', // White for main titles and record data
  textSecondary: '#AAAAAA', // Light gray for labels
  textSuccess: '#68F5A6', // Light Green for success status or positive values
  textError: '#F56868', // Red for errors/failed status
};

// --- Interfaces for TypeScript ---
type Donation = {
  donation_id: number;
  user_name: string;
  project_title: string;
  amount: number;
  donation_status: string;
  created_at: string;
};

type ProjectTotal = {
  project_title: string;
  total: number;
};

// --- Component for individual Donation Record Card ---
const DonationRecordCard: React.FC<{ item: Donation }> = ({ item }) => {
  // Determine text color based on donation status
  const statusColor = item.donation_status === 'Successful' 
    ? Colors.textSuccess 
    : item.donation_status === 'Pending' 
      ? Colors.cardAccent1
      : Colors.textError;

  return (
    <View style={styles.recordCard}>
      {/* Top Row: User and Amount */}
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.donationAmount}>
          ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Details */}
      <Text style={styles.projectTitle}>Project: {item.project_title}</Text>
      
      {/* Bottom Row: Status and Date */}
      <View style={styles.cardFooter}>
        <Text style={[styles.donationStatus, { color: statusColor }]}>
          Status: {item.donation_status}
        </Text>
        <Text style={styles.donationDate}>Date: {item.created_at.substring(0, 10)}</Text>
      </View>
    </View>
  );
};


// --- Main Component ---

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch(`${API}/api/view_donations.php`);
        const text = await res.text();

        let data: Donation[] = [];
        try {
          // Attempt to parse the JSON response
          const parsedData = JSON.parse(text);
          // Assuming the API returns an array of Donation objects
          if (Array.isArray(parsedData)) {
            data = parsedData as Donation[];
          }
        } catch {
          console.error('Invalid JSON response or non-array data:', text);
          // Leave data as empty array on parsing failure
        }
        
        setDonations(data);
      } catch (err) {
        console.error('Fetch donations failed:', err);
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // 🔢 Calculate total donation per project
  const projectTotals: ProjectTotal[] = useMemo(() => {
    const totals: Record<string, number> = {};

    donations.forEach((d) => {
      // Ensure amount is treated as a number
      const amount = Number(d.amount) || 0; 
      totals[d.project_title] = (totals[d.project_title] || 0) + amount;
    });

    return Object.keys(totals).map((title) => ({
      project_title: title,
      total: totals[title],
    }));
  }, [donations]);

  if (loading) {
    return (
      <View style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.cardAccent1} />
        <Text style={styles.loadingText}>Loading donation data...</Text>
      </View>
    );
  }

  // --- List Header Component (Summary) ---
  const ListHeaderComponent = (
    <View style={styles.headerContainer}>
      
      {/* Project Totals Block */}
      <View style={styles.totalsBlock}>
        <Text style={styles.totalsTitle}>Total Donations by Project</Text>
        {projectTotals.map((p, index) => (
          <View key={index} style={styles.totalItem}>
            <Text style={styles.totalProjectTitle}>{p.project_title}</Text>
            <Text style={styles.totalAmount}>
              ₱{p.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.recordsTitle}>Donation Records</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        data={donations}
        keyExtractor={(item) => item.donation_id.toString()}
        renderItem={({ item }) => <DonationRecordCard item={item} />}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No donation records found.</Text>
        }
      />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textPrimary,
    marginTop: 10,
    fontSize: 16,
  },
  flatListContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyText: {
    color: Colors.textSecondary,
    padding: 20,
    textAlign: 'center',
    marginTop: 30,
  },
  // --- Header Styles ---
  headerContainer: {
    marginBottom: 15,
  },
  totalsBlock: {
    backgroundColor: Colors.headerBackground,
    padding: 20,
    borderRadius: 20, // Rounded container for the totals block
    marginBottom: 20,
  },
  totalsTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  totalProjectTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  totalAmount: {
    color: Colors.cardAccent1, // Highlight total amounts with Orange/Beige
    fontSize: 16,
    fontWeight: '700',
  },
  recordsTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  // --- Donation Record Card Style ---
  recordCard: {
    backgroundColor: Colors.cardBackground,
    padding: 18,
    borderRadius: 15, // Rounded corners for each record
    marginBottom: 15,
    // Subtle shadow for depth
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
  donationAmount: {
    color: Colors.textSuccess, // Highlight the amount in Green
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectTitle: {
    color: Colors.textSecondary,
    fontSize: 15,
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
  donationStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  donationDate: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});