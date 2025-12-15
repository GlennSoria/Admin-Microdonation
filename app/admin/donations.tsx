import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState, useMemo } from 'react';

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

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch('http://192.168.1.20/api/view_donations.php');
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Invalid JSON:', text);
          data = [];
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
      totals[d.project_title] =
        (totals[d.project_title] || 0) + Number(d.amount);
    });

    return Object.keys(totals).map((title) => ({
      project_title: title,
      total: totals[title],
    }));
  }, [donations]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Total Donations per Project
          </Text>

          {projectTotals.map((p, index) => (
            <Text key={index} style={{ marginTop: 4 }}>
              {p.project_title}: ₱{p.total}
            </Text>
          ))}

          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginTop: 16,
            }}
          >
            Donation Records
          </Text>
        </View>
      }
      data={donations}
      keyExtractor={(item) => item.donation_id.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 12,
            marginVertical: 6,
            borderWidth: 1,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{item.user_name}</Text>
          <Text>Project: {item.project_title}</Text>
          <Text>Donated: ₱{item.amount}</Text>
          <Text>Status: {item.donation_status}</Text>
          <Text>Date: {item.created_at}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ padding: 20, textAlign: 'center' }}>
          No donations found.
        </Text>
      }
    />
  );
}
