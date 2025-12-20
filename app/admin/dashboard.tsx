import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

// --- Custom Colors ---
const Colors = {
  background: '#3A3A3A',
  cardAccent1: '#F5C170',
  textPrimary: '#FFFFFF',
  textButtonDark: '#2C2C2C',
};

// --- Interface for AdminButton Props ---
interface AdminButtonProps {
  title: string;
  onPress: () => void;
}

// --- AdminButton Component ---
const AdminButton: React.FC<AdminButtonProps> = ({ title, onPress }) => (
  <TouchableOpacity style={styles.adminButton} onPress={onPress}>
    <Text style={styles.adminButtonText}>{title}</Text>
  </TouchableOpacity>
);

// --- Main Admin Dashboard ---
export default function AdminDashboard() {
  const handlePress = (path: string) => {
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Welcome back, Administrator.</Text>
        </View>

        {/* Admin Buttons */}
        <View style={styles.adminToolsContainer}>
          <AdminButton 
            title="Manage Projects" 
            onPress={() => handlePress('/admin/projects')} 
          />
          <AdminButton 
            title="View Donations" 
            onPress={() => handlePress('/admin/donations')} 
          />
          <AdminButton 
            title="View Top-Ups" 
            onPress={() => handlePress('/admin/topups')} 
          />
          <AdminButton 
            title="Pending Accounts" 
            onPress={() => handlePress('/admin/pending_accounts')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 30,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 5,
  },
  subtitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    opacity: 0.7,
  },
  adminToolsContainer: {
    gap: 15,
  },
  adminButton: {
    backgroundColor: Colors.cardAccent1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  adminButtonText: {
    color: Colors.textButtonDark,
    fontSize: 18,
    fontWeight: '800',
  },
});
