import {Alert, ScrollView, StyleSheet, Text, View} from "react-native";
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

export default function DictionariesScreen() {
  const { i18n } = useLocale();
  const colorScheme = useColorScheme();

  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [newDictionary, setNewDictionary] = useState<string>('');

  const db = useSQLiteContext();
  const snackBarRef = useRef<SnackbarHandle>(null);

  useEffect(() => {
    (async function () {
      const result = await db.getAllAsync<Dictionary>('SELECT * FROM dictionaries');

      setDictionaries(result);
    })();
  }, []);

  const addDictionaryClick = () => {
    if (newDictionary.length) {
      addDictionary().then((lastRowId) => {
        snackBarRef.current?.show(i18n.t('snackbars.dictionaryAdded'));
        setDictionaries((old) => [...old, { id: lastRowId, name: newDictionary, created: 'now' }]);
        setNewDictionary('');
      }).catch(() => {
        alert(i18n.t('errors.cannotAddWordToDB'))
      });
    } else {
      alert(i18n.t('errors.fillTheFields'));
    }
  };

  const deleteDictionaryClick = (id: number) => () => {
    Alert.alert(i18n.t('areYouSure'), i18n.t('allDictionaryWordsWillBeDeleted'), [
      {
        text: i18n.t('buttons.yes'),
        onPress: () => {
          deleteDictionary(id).then(() => {
            snackBarRef.current?.show(i18n.t('snackbars.dictionaryDeleted'));
            setDictionaries((old) => old.filter((dict) => dict.id !== id));
          }).catch(() => {
            alert(i18n.t('errors.cannotAddWordToDB'))
          });
        },
      },
      {
        text: i18n.t('buttons.cancel'),
        style: 'cancel',
      },
    ]);
  }

  const deleteDictionary = async (id: number) => {
    return new Promise<void>((resolve, reject) => {
      db.prepareAsync('DELETE FROM `dictionaries` WHERE id=$id; DELETE FROM `words` WHERE dictionary_id=$id;')
        .then((statement) => {
          try {
            statement.executeAsync({$id: id})
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
  }

  const addDictionary = async () => {
    return new Promise<number>((resolve, reject) => {
      db.prepareAsync('INSERT INTO `dictionaries` (name) VALUES ($name)')
        .then((statement) => {
          try {
            statement.executeAsync({$name: newDictionary.trim().toLowerCase()})
              .then((result) => {
                resolve(result.lastInsertRowId);
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
    topContainer: {
      gap: 10,
      alignItems: 'flex-end',
      flexDirection: 'row',
      width: '100%',
    },
    dictionariesContainer: {
      marginTop: 30,
    },
    dictionaryBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: Colors.secondary,
      paddingLeft: 10,
      marginTop: 10,
    },
    dictionaryText: {
      fontSize: 22,
    }
  })
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 10, padding: 25, backgroundColor: Colors[colorScheme ?? 'light'].background, }}>
      <View style={styles.topContainer}>
        <View style={{ width: '70%' }}>
          <ThemedInput onChangeText={(text) => setNewDictionary(text)} value={newDictionary} label={i18n.t('dictionaryName')}></ThemedInput>
        </View>
        <ThemedButton onPress={addDictionaryClick} variant={ButtonVariants.Yellow} text={i18n.t('buttons.add')}></ThemedButton>
      </View>
      <ScrollView style={styles.dictionariesContainer}>
        {dictionaries.map((dictionary, index) =>
          <View key={index} style={styles.dictionaryBlock}>
            <Text style={styles.dictionaryText}>{dictionary.name}</Text>
            <ThemedButton
              text={i18n.t('buttons.delete')}
              variant={ButtonVariants.Danger}
              onPress={deleteDictionaryClick(dictionary.id)}
            ></ThemedButton>
          </View>
        )}
      </ScrollView>
      <Snackbar ref={snackBarRef}></Snackbar>
    </SafeAreaView>
  );
}