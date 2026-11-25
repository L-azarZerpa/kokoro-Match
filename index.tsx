import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from './src/services/firebase';
import HomeScreen from './src/screens/HomeScreen';
import GameDetailScreen from './src/screens/GameDetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import type { AuthMode, Game } from './src/types';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authActionError, setAuthActionError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarJuegos() {
      try {
        setIsLoading(true);
        const q = query(collection(db, 'games'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        const listaGames = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Game[];

        setGames(listaGames);
        setFeaturedGames(listaGames.filter((game) => game.isFeatured));
      } catch (loadError) {
        console.error('Error al cargar juegos:', loadError);
        setError('No se pudieron cargar los juegos de Firebase.');
      } finally {
        setIsLoading(false);
      }
    }

    void cargarJuegos();
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

  const openAuthScreen = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthScreen(true);
  };

  useEffect(() => onAuthStateChanged(
    auth,
    setCurrentUser,
    (authError) => {
      console.error('No se pudo consultar la sesión de Firebase Auth.', authError);
      setCurrentUser(null);
    }
  ), []);

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
          onSignOut={() => void handleSignOut()}
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
          onSelectGame={setSelectedGame}
          onRegister={() => openAuthScreen('register')}
          onSignIn={() => openAuthScreen('login')}
          onSignOut={() => void handleSignOut()}
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
