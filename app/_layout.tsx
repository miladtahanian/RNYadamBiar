import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import LocaleProvider from "@/providers/LocaleProvider/LocaleProvider";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {SQLiteDatabase, SQLiteProvider} from "expo-sqlite";
import * as SQLite from 'expo-sqlite';
import {Linking, Pressable, Text, View} from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  async function migrateDbIfNeeded(db: SQLiteDatabase) {
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS dictionaries (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'name TEXT NOT NULL,' +
      'created TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
      ');' +
      'CREATE TABLE IF NOT EXISTS words (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'word TEXT NOT NULL,' +
      'translation TEXT NOT NULL,' +
      'dictionary_id INTEGER NOT NULL,' +
      'created TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
      ');'
    );
  };

  return (
    <SQLiteProvider databaseName={'rememberme.db'} onInit={migrateDbIfNeeded}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <LocaleProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="game" options={{ headerShown: false }} />
            </Stack>
            <View style={{ marginTop: 'auto', flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'flex-end'}}>
              <Pressable onPress={()=>{
                Linking.openURL('https://cafebazaar.ir/developer/tahanian')
              }}><Text style={{fontSize:10}}>طراحی و توسعه توسط میلاد طحانیان</Text></Pressable>
              <Text style={{ fontSize: 10}}>نسخه 1.0</Text>
            </View>
          </LocaleProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
