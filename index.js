import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import HomeScreen from './HomeScreen';
import GameDetailScreen from './GameDetailScreen'; // <--- Importamos la nueva vista
import AuthScreen from './AuthScreen';

export default function App() {
  const [games, setGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authActionError, setAuthActionError] = useState(null);

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

  const handleSignOut = async () => {
    setAuthActionError(null);
    setIsSigningOut(true);

    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('No se pudo cerrar la sesión de Firebase Auth.', signOutError);
      setAuthActionError('No se pudo cerrar sesión. Intenta de nuevo.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const openAuthScreen = (mode) => {
    setAuthMode(mode);
    setShowAuthScreen(true);
  };

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      setCurrentUser,
      (authError) => {
        console.error('No se pudo consultar la sesión de Firebase Auth.', authError);
        setCurrentUser(null);
      }
    );
  }, []);

  return (
    <View className="flex-1">
      {selectedGame ? (
        <GameDetailScreen
          game={selectedGame}
          authActionError={authActionError}
          isAuthenticated={Boolean(currentUser)}
          isSigningOut={isSigningOut}
          onBack={() => setSelectedGame(null)}
          onRegister={() => openAuthScreen('register')}
          onSignIn={() => openAuthScreen('login')}
          onSignOut={handleSignOut}
          userEmail={currentUser?.email}
        />
      ) : (
        <HomeScreen
          games={games}
          featuredGames={featuredGames}
          isLoading={isLoading}
          error={error}
          authActionError={authActionError}
          isAuthenticated={Boolean(currentUser)}
          isSigningOut={isSigningOut}
          onSelectGame={(game) => setSelectedGame(game)}
          onRegister={() => openAuthScreen('register')}
          onSignIn={() => openAuthScreen('login')}
          onSignOut={handleSignOut}
          userEmail={currentUser?.email}
        />
      )}

      {showAuthScreen && (
        <View className="absolute inset-0 z-50">
          <AuthScreen
            initialMode={authMode}
            onBack={() => setShowAuthScreen(false)}
          />
        </View>
      )}
    </View>
  );
}