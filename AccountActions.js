import { Pressable, Text, View } from 'react-native';

export default function AccountActions({
  isAuthenticated = false,
  isSigningOut = false,
  onRegister,
  onSignIn,
  onSignOut,
  userEmail,
}) {
  return (
    <View className="flex-row items-center">
      {isAuthenticated ? (
        <>
          <View
            accessibilityLabel={`Sesión iniciada como ${userEmail || 'usuario'}`}
            className="ml-2 max-w-[120px] rounded-full bg-lime-300 px-2 py-2 md:ml-3 md:max-w-[220px] md:px-4"
          >
            <Text className="text-xs font-extrabold text-[#11120f]" numberOfLines={1}>
              {userEmail || 'Sesión iniciada'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
            className="ml-1 rounded-full bg-[#37384f] px-2 py-2 md:ml-2 md:px-4"
            disabled={isSigningOut}
            onPress={onSignOut}
          >
            <Text className="text-[10px] font-extrabold text-white md:text-xs">
              {isSigningOut ? 'Cerrando…' : 'Cerrar sesión'}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            accessibilityLabel="Iniciar sesión"
            accessibilityRole="button"
            className="ml-2 rounded-full bg-lime-300 px-2 py-2 md:ml-3 md:px-4"
            onPress={onSignIn}
          >
            <Text className="text-[10px] font-extrabold text-[#11120f] md:text-xs">
              Iniciar sesión
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Registrarse"
            accessibilityRole="button"
            className="ml-1 rounded-full bg-lime-300 px-2 py-2 md:ml-2 md:px-4"
            onPress={onRegister}
          >
            <Text className="text-[10px] font-extrabold text-[#11120f] md:text-xs">
              Registrarse
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
