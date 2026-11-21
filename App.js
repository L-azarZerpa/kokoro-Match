import { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { collection, getDocs } from 'firebase/firestore';
import './global.css';

import HomeScreen from './index';
import { db } from './firebase';

function App() {
  const [games, setGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGames() {
      try {
        const snapshot = await getDocs(collection(db, 'games'));
        const activeGames = snapshot.docs
          .map((gameDocument) => ({
            ...gameDocument.data(),
            id: gameDocument.id,
          }))
          .filter((game) => game.isActive !== false)
          .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

        if (isMounted) {
          setGames(activeGames);
          setFeaturedGames(activeGames.filter((game) => game.isFeatured === true));
        }
      } catch (loadError) {
        console.error('No se pudieron cargar los juegos desde Firestore.', loadError);
        if (isMounted) {
          setError('No se pudieron cargar los juegos. Intenta de nuevo más tarde.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <HomeScreen
      error={error}
      featuredGames={featuredGames}
      games={games}
      isLoading={isLoading}
    />
  );
}

registerRootComponent(App);
