import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AccountActions from './AccountActions';

const DESKTOP_NAV = [
  { id: 'home', icon: '⌂', label: 'Inicio', active: true },
  { id: 'recent', icon: '◷', label: 'Recientes' },
  { id: 'new', icon: '✦', label: 'Nuevos' },
  { id: 'saved', icon: '♡', label: 'Guardados' },
];

function GameTile({ game, className = '', onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Abrir ${game.title}`}
      accessibilityRole="button"
      className={`relative overflow-hidden rounded-2xl bg-[#20212a] ${className}`}
    >
      {game.imageUrl ? (
        <Image
          accessibilityLabel={`Portada de ${game.title}`}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
          source={{ uri: game.imageUrl }}
        />
      ) : null}
      <View className="absolute bottom-0 left-0 right-0 h-20 bg-black/60" />
      <Text className="absolute bottom-3 left-3 right-3 text-xl font-black text-white" numberOfLines={1}>
        {game.title}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ children }) {
  return <Text className="mb-4 text-xl font-extrabold text-white">{children}</Text>;
}

export default function HomeScreen({
  games = [],
  featuredGames = [],
  isLoading = false,
  error = null,
  authActionError = null,
  isAuthenticated = false,
  isSigningOut = false,
  onSelectGame, // <--- Nueva función para manejar el clic
  onRegister,
  onSignIn,
  onSignOut,
  userEmail,
}) {
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const query = search.trim();
  const isSidebarExpanded = isSidebarOpen && isSidebarHovered;
  const sidebarHoverHandlers = Platform.OS === 'web'
    ? {
        onPointerEnter: () => setIsSidebarHovered(true),
        onPointerLeave: () => setIsSidebarHovered(false),
      }
    : {};
  const visibleGames = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase();
    if (!normalizedQuery) return games;
    return games.filter((game) => game.title.toLocaleLowerCase().includes(normalizedQuery));
  }, [games, query]);

  return (
    <View className="flex-1 bg-[#0c0d13]">
      <StatusBar style="light" />
      <View className="z-10 h-16 flex-row items-center border-b border-[#262730] bg-[#17181f] px-3">
        <Pressable
          accessibilityLabel={isSidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          accessibilityRole="button"
          className="mr-3 h-10 w-9 items-center justify-center"
          onPress={() => setIsSidebarOpen((open) => !open)}
        >
          <Text className="text-2xl font-bold text-white">☰</Text>
        </Pressable>
        <View className="mr-3 flex-row items-center">
          <Image
            accessibilityLabel="Icono de Kokoro Match"
            className="mr-1"
            resizeMode="contain"
            source={require('./assets/icon.png')}
            style={{ height: 16, width: 16 }}
          />
          <View>
            <Text className="text-xs font-black leading-3 text-white">kokoro</Text>
            <Text className="text-xs font-black leading-3 text-white">Match</Text>
          </View>
        </View>

        <View className="mx-auto h-10 max-w-[460px] flex-1 flex-row items-center rounded-full bg-[#37384f] px-4 md:mx-auto">
          <TextInput
            accessibilityLabel="Buscar juegos y categorías"
            className="flex-1 py-0 text-sm font-semibold text-white"
            onChangeText={setSearch}
            placeholder="Buscar juegos y categorías"
            placeholderTextColor="#b0b1c2"
            returnKeyType="search"
            value={search}
          />
          <Text className="text-xl text-[#c2c3d0]">⌕</Text>
        </View>

        <AccountActions
          isAuthenticated={isAuthenticated}
          isSigningOut={isSigningOut}
          onRegister={onRegister}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          userEmail={userEmail}
        />
      </View>
      {authActionError ? (
        <Text accessibilityRole="alert" className="bg-[#17181f] px-3 py-2 text-center text-xs font-semibold text-rose-400">
          {authActionError}
        </Text>
      ) : null}

      <View className="flex-1 flex-row">
        {isSidebarOpen && (
          <View
            {...sidebarHoverHandlers}
            className={`hidden border-r border-[#20212a] bg-[#111218] py-3 md:flex ${isSidebarExpanded ? 'w-[190px] px-2' : 'w-[68px] items-center'}`}
          >
            {DESKTOP_NAV.map((item) => (
              <Pressable
                key={item.id}
                accessibilityLabel={item.label}
                accessibilityRole="button"
                className={`mb-2 h-11 flex-row items-center rounded-xl ${isSidebarExpanded ? 'w-full px-2' : 'w-10 justify-center'} ${item.active ? 'bg-[#22232d]' : ''}`}
              >
                <Text className={`w-9 text-center text-2xl ${item.active ? 'text-lime-300' : 'text-violet-400'}`}>
                  {item.icon}
                </Text>
                {isSidebarExpanded && (
                  <Text className={`ml-2 text-sm font-semibold ${item.active ? 'text-lime-300' : 'text-[#d7d7e2]'}`}>
                    {item.label}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView className="flex-1" contentContainerClassName="pb-8">
          <View className="mt-7">
            <View className="mb-4 flex-row items-center px-4">
              <SectionTitle>{query ? `Resultados para "${query}"` : 'Todos'}</SectionTitle>
            </View>
            <ScrollView
              horizontal
              contentContainerClassName="gap-2 px-4"
              showsHorizontalScrollIndicator={false}
            >
              {error ? (
                <Text className="py-3 text-sm text-[#ff9b9b]">{error}</Text>
              ) : isLoading ? (
                <Text className="py-3 text-sm text-[#a3a4b2]">Cargando juegos...</Text>
              ) : visibleGames.length ? (
                visibleGames.map((game) => (
                  <GameTile 
                    key={game.id} 
                    game={game} 
                    className="h-[150px] w-[220px]" 
                    onPress={() => onSelectGame(game)} // <--- Al hacer clic avisa al padre
                  />
                ))
              ) : query ? (
                <Text className="py-3 text-sm text-[#a3a4b2]">
                  No encontramos juegos con ese nombre.
                </Text>
              ) : null}
            </ScrollView>
          </View>

          <View className="mt-6">
            <View className="px-4">
              <SectionTitle>destacados</SectionTitle>
            </View>
            <ScrollView
              horizontal
              contentContainerClassName="gap-2 px-4"
              showsHorizontalScrollIndicator={false}
            >
              {featuredGames.map((game) => (
                <GameTile 
                  key={game.id} 
                  game={game} 
                  className="h-[130px] w-[190px]" 
                  onPress={() => onSelectGame(game)} // <--- Igual en destacados
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <View className="flex-row justify-around border-t border-[#262730] bg-[#17181f] py-2 md:hidden">
        {DESKTOP_NAV.map((item) => (
          <Pressable key={item.id} accessibilityLabel={item.label} accessibilityRole="button" className="items-center px-2">
            <Text className={`text-xl ${item.active ? 'text-lime-300' : 'text-violet-400'}`}>{item.icon}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}