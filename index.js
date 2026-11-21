import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import HomeScreen from './HomeScreen';
import GameDetailScreen from './GameDetailScreen'; // <--- Importamos la nueva vista

export default function App() {
  const [games, setGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    async function cargarJuegos() {
      try {
        setIsLoading(true);
        const q = query(
          collection(db, 'games'),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const listaGames = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGames(listaGames);
        setFeaturedGames(listaGames.filter((g) => g.isFeatured));
      } catch (err) {
        console.error('Error al cargar juegos:', err);
        setError('No se pudieron cargar los juegos de Firebase.');
      } finally {
        setIsLoading(false);
      }
    }

    cargarJuegos();
  }, []);

  // SI HAY UN JUEGO SELECCIONADO, RENDERIZAMOS SU PROPIA VISTA
  if (selectedGame) {
    return (
      <GameDetailScreen 
        game={selectedGame} 
        onBack={() => setSelectedGame(null)} 
      />
    );
  }

  // SI NO, MOSTRAMOS EL HOME SCREEN
  return (
    <HomeScreen
      games={games}
      featuredGames={featuredGames}
      isLoading={isLoading}
      error={error}
      onSelectGame={(game) => setSelectedGame(game)}
    />
  );
}