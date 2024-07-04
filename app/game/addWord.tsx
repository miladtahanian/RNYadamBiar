import {Alert, StyleSheet, Text, View} from "react-native";
import {useLocale} from "@/providers/LocaleProvider/LocaleProvider";
import {ButtonVariants, ThemedButton} from "@/components/ThemedButton";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {ThemedInput} from "@/components/ThemedInput";
import {useEffect, useRef, useState} from "react";
import {useSQLiteContext} from "expo-sqlite";
import Snackbar, {SnackbarHandle} from "@/components/Snackbar";
import {Dictionary} from "@/types/entities.types";
import {RadioButton} from "react-native-paper";
import {useRouter} from "expo-router";

export default function AddWordScreen() {
  const { i18n } = useLocale();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [word, setWord] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null);

  const db = useSQLiteContext();
  const snackBarRef = useRef<SnackbarHandle>(null);

  useEffect(() => {
    (async function () {
      const result = await db.getAllAsync<Dictionary>('SELECT * FROM dictionaries');

      if (!result.length) {
        Alert.alert(i18n.t('noDictionariesCreated'), i18n.t('createDictionaryFirst'), [
          {
            text: i18n.t('buttons.ok'),
            style: 'default',
            onPress: () => {
              router.replace('/game/dictionaries');
            }
          },
        ]);
      }
      setDictionaries(result);
    })();
  }, []);

  const addWordClick = () => {
    if (word.length && translation.length && selectedDictionary) {
      addWordToDb().then(() => {
        snackBarRef.current?.show(i18n.t('snackbars.wordAdded'));
        setWord('');
        setTranslation('');
      }).catch(() => {
        alert(i18n.t('errors.cannotAddWordToDB'))
      })
    } else {
      alert(i18n.t('errors.fillTheFields'));
    }
  };

  const addWordToDb = async () => {
    return new Promise<void>((resolve, reject) => {
      db.prepareAsync('INSERT INTO `words` (word, translation, dictionary_id) VALUES ($word, $translation, $dictId)')
        .then((statement) => {
          try {
            statement.executeAsync({
                $word: word.trim().toLowerCase(),
                $translation: translation.trim().toLowerCase(),
                $dictId: selectedDictionary,
              })
              .then(() => {
                resolve();
              })
              .catch((err2) => {
                alert(err2);
                reject();
              });
          } finally {
            statement.finalizeAsync();
          }
        })
        .catch(() => {
          reject();
        });
    });
  };

  const styles = StyleSheet.create({
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginHorizontal: 'auto',
      color: Colors[colorScheme ?? 'light'].text,
    },
    innerContainer: {
      gap: 10,
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 25,
    },
    radioContainer: {
      width: '100%',
      alignItems: 'flex-end'
    },
    radioLabel: {
     fontSize: 18,
     marginBottom: 10,
    },
    radioButton: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center'
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 10, backgroundColor: Colors[colorScheme ?? 'light'].background, }}>
      <View style={styles.innerContainer}>
        <ThemedInput onChangeText={(text) => setWord(text)} value={word} label={i18n.t('theWord')}></ThemedInput>
        <ThemedInput onChangeText={(text) => setTranslation(text)} value={translation} label={i18n.t('theTranslation')}></ThemedInput>
        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>{i18n.t('dictionary')}</Text>
          <RadioButton.Group onValueChange={newValue => setSelectedDictionary(newValue)} value={selectedDictionary ?? ''}>
            {
              dictionaries.map((dict, i) =>
              <View key={i} style={styles.radioButton}>
                <Text>{dict.name}</Text>
                <RadioButton value={dict.id.toString()} />
              </View>
              )
            }
          </RadioButton.Group>
        </View>
        <View style={{ marginTop: 25 }}>
          <ThemedButton onPress={addWordClick} variant={ButtonVariants.Yellow} text={i18n.t('iLearned')}></ThemedButton>
        </View>
      </View>
      <Snackbar ref={snackBarRef}></Snackbar>
    </SafeAreaView>
  );
}