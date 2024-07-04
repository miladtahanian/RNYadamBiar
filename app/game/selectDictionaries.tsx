import {ReactElement, useEffect, useRef, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "@/constants/Colors";
import {Alert, ScrollView, StyleSheet, Text, View} from "react-native";
import {ThemedButton} from "@/components/ThemedButton";
import {Dictionary} from "@/types/entities.types";
import {useSQLiteContext} from "expo-sqlite";
import {useLocale} from "@/providers/LocaleProvider/LocaleProvider";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Checkbox} from "expo-checkbox";

export default function SelectDictionariesScreen (): ReactElement {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [selectedDictionaries, setSelectedDictionaries] = useState<Record<string, boolean>>({});
  const db = useSQLiteContext();
  const { i18n } = useLocale();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [checkAll, setCheckAll] = useState<boolean>(true);
  const { type }  = useLocalSearchParams();

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

      const selected: Record<string, boolean> = {};
      result.forEach((dict) => { selected[dict.id.toString()] = true; });

      setSelectedDictionaries(selected);
    })();
  }, []);

  const continueToRepeating = () => {
    router.push({
      pathname: '/game/repeatWords',
      params: {
        type: type,
        dictionaries: JSON.stringify(dictionaries.filter((dict) => selectedDictionaries[dict.id.toString()]).map((dict) => dict.id))
      }
    });
  };

  const styles = StyleSheet.create({
    dictionariesContainer: {
    },
    dictionary: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
    },
    checkbox: {
    },
    checkBoxText: {
      fontSize: 20,
      marginLeft: 5,
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 10, padding: 25, backgroundColor: Colors[colorScheme ?? 'light'].background, }}>
      <ScrollView style={styles.dictionariesContainer}>
        <View style={styles.dictionary}>
          <Checkbox
            value={checkAll}
            onValueChange={(value) => {
              const selected: Record<string, boolean> = {};
              dictionaries.forEach((dict) => { selected[dict.id.toString()] = value; });
              setSelectedDictionaries(selected);
              setCheckAll(value);
            }}
            color={checkAll ? Colors.primary : undefined}
          />
          <Text style={styles.checkBoxText}>{i18n.t('checkAll')}</Text>
        </View>
        {dictionaries.map((dict) =>
          <View style={styles.dictionary}>
            <Checkbox
              style={styles.checkbox}
              value={selectedDictionaries[dict.id.toString()]}
              onValueChange={(value) => {
                setSelectedDictionaries(selected => ({...selected, [dict.id.toString()]: value}))
              }}
              color={selectedDictionaries[dict.id.toString()] ? Colors.primary : undefined}
            />
            <Text style={styles.checkBoxText}>{dict.name}</Text>
          </View>
        )}
      </ScrollView>
      <View style={{ marginTop: 'auto' }}>
        <ThemedButton text={i18n.t('buttons.ok')} onPress={continueToRepeating}></ThemedButton>
      </View>
    </SafeAreaView>
  );
};