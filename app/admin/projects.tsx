import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { API } from '../api/api';
import React from 'react';

// --- Custom Colors based on the previous design ---
const Colors = {
  background: '#3A3A3A', // Main Dark Background
  cardBackground: '#2C2C2C', // Card/List Item Background (Slightly lighter dark)
  cardAccent1: '#F5C170', // Orange/Beige for Primary (Add Project) button
  cardAccent2: '#68F5A6', // Light Green for Secondary (Edit) button, matching the third screen's calculator
  textPrimary: '#FFFFFF', // White for titles and main text
  textSecondary: '#AAAAAA', // Light gray for descriptions
  textButtonDark: '#2C2C2C', // Dark text on the light buttons
};

// --- Interfaces for TypeScript ---
type Project = {
  id: number;
  title: string;
  description: string;
  // Assuming projects might have a target amount from the previous component
  targetAmount?: number; 
};

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: 'primary' | 'secondary';
}

// --- Custom Components ---

// Reusable styled button using TouchableOpacity
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, color = 'primary' }) => {
  const buttonStyle = color === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const textStyle = color === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText;

  return (
    <TouchableOpacity style={[styles.customButtonBase, buttonStyle]} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// Component to render each project item
const ProjectItem: React.FC<{ item: Project }> = ({ item }) => (
  <View style={styles.projectCard}>
    <View style={styles.textContainer}>
      <Text style={styles.projectTitle}>{item.title}</Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
    </View>
    
    <CustomButton
      title="Edit"
      color="secondary"
      onPress={() =>
        router.push({ pathname: '/admin/edit-project', params: { id: item.id.toString() } })
      }
    />
  </View>
);

// --- Main Component ---

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API}/api/getProjects.php`)
      .then(res => res.json())
      .then((data: Project[]) => { // Explicitly type the fetched data
        setProjects(data);
      })
      .catch(error => {
        console.error('Failed to fetch projects:', error);
        // Handle fetch error gracefully in a real app (e.g., show an error message)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header and Add Project Button */}
        <View style={styles.headerContainer}>
            <Text style={styles.listTitle}>All Projects</Text>
            <CustomButton 
                title="Add New Project" 
                onPress={() => router.push('/admin/add-project')} 
                color="primary"
            />
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading projects...</Text>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <ProjectItem item={item} />}
            contentContainerStyle={styles.flatListContent}
            // Fallback for empty list
            ListEmptyComponent={
                <Text style={styles.emptyText}>No projects found. Use the button above to add one!</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
    gap: 15,
  },
  listTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  flatListContent: {
    paddingBottom: 20, // ensure space at the bottom for the last item
    gap: 15, // spacing between list items
  },
  // --- Project Card Style ---
  projectCard: {
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 20, // Rounded corners for the card
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  projectTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  projectDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  // --- Button Styles ---
  customButtonBase: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15, // Slightly rounded buttons inside the card
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.cardAccent1, // Orange/Beige for 'Add' button
  },
  secondaryButton: {
    backgroundColor: Colors.cardAccent2, // Light Green for 'Edit' button
    minWidth: 70, // Ensure the edit button has a minimum width
  },
  primaryButtonText: {
    color: Colors.textButtonDark,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: Colors.textButtonDark,
    fontSize: 14,
    fontWeight: '700',
  },
});