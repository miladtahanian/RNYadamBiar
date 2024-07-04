import {Stack} from 'expo-router';
import {Text} from "react-native";
import {useLocale} from "@/providers/LocaleProvider/LocaleProvider";

export default function GameLayout() {
  const { i18n } = useLocale();

  const getHeader = (text: string) => {
    return <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{text}</Text>;
  };

  return (
    <Stack>
      <Stack.Screen name="addWord" options={{ headerTitle: () => getHeader(i18n.t('addWord')) }} />
      <Stack.Screen name="repeatWords" options={{ headerTitle: () => getHeader(i18n.t('repeatWords')) }} />
      <Stack.Screen name="dictionaries" options={{ headerTitle: () => getHeader(i18n.t('dictionaries')) }} />
      <Stack.Screen name="selectDictionaries" options={{ headerTitle: () => getHeader(i18n.t('selectDictionaries')) }} />
    </Stack>
  );
}
