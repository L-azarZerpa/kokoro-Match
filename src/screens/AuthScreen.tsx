import { FirebaseError } from 'firebase/app';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { AuthMode } from '../types';

interface AuthScreenProps {
  initialMode?: AuthMode;
  onBack?: () => void;
}

export default function AuthScreen({ initialMode = 'login', onBack }: AuthScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordReset = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Escribe primero tu correo electrónico para enviarte el enlace.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfoMessage('Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja o spam.');
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-email') {
          setErrorMessage('El formato del correo electrónico no es válido.');
        } else {
          setErrorMessage('No se pudo enviar el correo de recuperación. Intenta de nuevo.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim() || (isRegisterMode && !name.trim())) {
      setErrorMessage('Completa todos los campos.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });

        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          createdAt: serverTimestamp(),
          latestResult: null,
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      if (onBack) onBack();
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : null;
      if (code === 'auth/email-already-in-use') {
        setErrorMessage('Ese correo ya está registrado.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMessage('Correo o contraseña incorrectos.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setErrorMessage('No se pudo completar la operación. Verifica tus datos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#0c0d13] px-4">
      <StatusBar style="light" />

      <View className="w-full max-w-[420px] rounded-3xl border border-[#262730] bg-[#17181f] p-6">
        {onBack && (
          <Pressable onPress={onBack} className="mb-4 self-start">
            <Text className="text-xs font-bold text-violet-400">← Volver</Text>
          </Pressable>
        )}

        <Text className="text-center text-2xl font-black text-white">
          {isRegisterMode ? 'Crear perfil' : 'Iniciar sesión'}
        </Text>
        <Text className="mt-1 text-center text-xs text-[#9ea0b3]">
          Guarda tus resultados de personalidad en tu cuenta
        </Text>

        {isRegisterMode && (
          <View className="mt-5">
            <Text className="mb-1.5 text-xs font-bold text-[#b0b1c2]">Nombre o apodo</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Alex"
              placeholderTextColor="#5d5f70"
              className="rounded-2xl border border-[#2d2e3d] bg-[#111218] px-4 py-3 text-sm text-white"
            />
          </View>
        )}

        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-bold text-[#b0b1c2]">Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tu@correo.com"
            placeholderTextColor="#5d5f70"
            className="rounded-2xl border border-[#2d2e3d] bg-[#111218] px-4 py-3 text-sm text-white"
          />
        </View>

        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-bold text-[#b0b1c2]">Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#5d5f70"
            className="rounded-2xl border border-[#2d2e3d] bg-[#111218] px-4 py-3 text-sm text-white"
          />
        </View>

        {!isRegisterMode && (
          <Pressable
            disabled={isSubmitting}
            onPress={handlePasswordReset}
            className="mt-2 self-end py-1"
          >
            <Text className="text-xs font-semibold text-violet-300">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        )}

        {errorMessage && (
          <Text className="mt-3 text-center text-xs font-semibold text-rose-400">
            {errorMessage}
          </Text>
        )}

        {infoMessage && (
          <Text className="mt-3 text-center text-xs font-semibold text-lime-300">
            {infoMessage}
          </Text>
        )}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit}
          className="mt-5 items-center rounded-full bg-lime-300 py-3.5"
        >
          <Text className="text-sm font-black text-[#11120f]">
            {isSubmitting
              ? 'Procesando...'
              : isRegisterMode
                ? 'Crear cuenta'
                : 'Entrar'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setIsRegisterMode((prev) => !prev);
            setErrorMessage(null);
            setInfoMessage(null);
          }}
          className="mt-4 items-center py-2"
        >
          <Text className="text-xs font-semibold text-violet-300">
            {isRegisterMode
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate aquí'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}