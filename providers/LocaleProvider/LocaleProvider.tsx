import {
  PropsWithChildren,
  createContext,
  useContext,
} from 'react';

import {I18n} from "i18n-js";
import {getLocales} from "expo-localization";
import {localization} from "@/localization";

type LocaleContext = {
  i18n: I18n,
};

const LocaleContext = createContext<LocaleContext>({
  i18n: new I18n(),
});

export default function LocaleProvider({ children }: PropsWithChildren) {
  const i18n = new I18n(localization);
  i18n.locale = getLocales()[0].languageCode ?? 'en';

  return (
    <LocaleContext.Provider value={{ i18n: i18n }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);