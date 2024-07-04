import {StyleSheet, Text, View} from "react-native";
import {useLocale} from "@/providers/LocaleProvider/LocaleProvider";
import {ButtonVariants, ThemedButton} from "@/components/ThemedButton";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useRef, useState} from "react";
import {SavedWord} from "@/types/entities.types";
import {useLocalSearchParams} from "expo-router";

export enum RepeatType {
  TYPE_WORDS = 'TYPE_WORDS',
  TYPE_TRANSLATIONS = 'TYPE_TRANSLATIONS',
}

type GameTranslation = {
  text: string;
  correct: boolean;
}
export default function RepeatWordsScreen() {
  const { i18n } = useLocale();
  const colorScheme = useColorScheme();
  const db = useSQLiteContext();

  const [allWords, setAllWords] = useState<SavedWord[]>([]);
  const [currentWord, setCurrentWord] = useState<SavedWord | undefined>();
  const [translations, setTranslations] = useState<GameTranslation[]>([]);
  const [truth, showTruth] = useState(false);
  const [guessed, setGuessed] = useState<number>(0);
  const { type, dictionaries }  = useLocalSearchParams();
  const keyParam = (type as unknown as RepeatType) === RepeatType.TYPE_WORDS ? 'word' : 'translation';
  const visibleParam = keyParam === 'word' ? 'translation' : 'word';

  useEffect(() => {
    (async function () {
      const dictionariesRow = JSON.parse(dictionaries as string).join(',');

      const result = await db.getAllAsync<SavedWord>('SELECT * FROM words WHERE dictionary_id IN ('+dictionariesRow+')');
      setAllWords(result);
    })();

  }, []);

  useEffect(() => {
    setUpCurrentWord(allWords);
  }, [allWords]);

  const setUpCurrentWord = (restWords: SavedWord[]): void => {
    if (restWords.length) {
      const randomWord = restWords[Math.floor(Math.random() * (restWords.length))];

      setCurrentWord(randomWord);
      const allTranslations = restWords.map((word) => word[visibleParam]);
      let randomTranslations: GameTranslation[] = [{text: randomWord[visibleParam], correct: true}];

      while (randomTranslations.length < Math.min(4, restWords.length) ) {
        const transToAdd = {
          text: allTranslations[Math.floor(Math.random() * (allTranslations.length))],
          correct: false,
        };

        if (!randomTranslations.find((existing) => existing.text === transToAdd.text)) {
          randomTranslations.push(transToAdd);
        }
      }

      let currentIndex = randomTranslations.length;

      while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [randomTranslations[currentIndex], randomTranslations[randomIndex]] = [
          randomTranslations[randomIndex], randomTranslations[currentIndex]
        ];
      }

      setTranslations(randomTranslations);

    }
  }
  const translationChosen = (text: string) => (): void => {
    if (text === currentWord?.[visibleParam]) {
      setGuessed(guessed => ++guessed);
    }

    setTimeout(() => showTruth(true), 200);

    setTimeout(() => {
      showTruth(false);

      const restWords = allWords.filter((word) => word.word !== currentWord?.word);

      if (!restWords.length) {
        alert(i18n.t('noWordsLeft'));
      } else {
        setAllWords(restWords);
      }
    }, 1000);
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
      marginTop: 100,
    },
    guessedText: {
      marginTop: 25,
      fontWeight: 'bold'
    }
  })
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 100, backgroundColor: Colors[colorScheme ?? 'light'].background, }}>
      <Text style={styles.title}>{currentWord?.[keyParam]}</Text>
      <View style={styles.innerContainer}>
        {translations.map((translation, i) => {
          let variant = ButtonVariants.Primary;

          if (truth) {
            variant = translation.correct
              ? ButtonVariants.Success
              : ButtonVariants.Danger;
          }
          return <ThemedButton key={i} variant={variant} text={translation.text} onPress={translationChosen(translation.text)}></ThemedButton>
        })}
        <Text style={styles.guessedText}>{i18n.t('guessed', {count: guessed})}</Text>
      </View>
    </SafeAreaView>
  );
}