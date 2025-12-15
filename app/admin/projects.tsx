import { View, Text, FlatList, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

type Project = {
  id: number;
  title: string;
  description: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch('http://192.168.1.20/api/getProjects.php')
      .then(res => res.json())
      .then(setProjects);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Add Project" onPress={() => router.push('/admin/add-project')} />

      <FlatList
        data={projects}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Button
              title="Edit"
              onPress={() =>
                router.push({ pathname: '/admin/edit-project', params: { id: item.id } })
              }
            />
          </View>
        )}
      />
    </View>
  );
}
