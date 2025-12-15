import { useEffect, useState } from 'react';
import { router } from 'expo-router';

export default function Index() {
  const [ready, setReady] = useState(false);

  // Delay redirect until after first render
  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      router.replace('/admin/dashboard');
    }
  }, [ready]);

  return null; // Nothing to render
}
