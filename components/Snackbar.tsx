
import { View, StyleSheet } from 'react-native';
import { Button, Snackbar as RNPSnackbar} from 'react-native-paper';
import {forwardRef, useImperativeHandle, useState} from "react";
import {Colors} from "@/constants/Colors";
import {useLocale} from "@/providers/LocaleProvider/LocaleProvider";

export type SnackbarHandle = {
  show: (text: string) => void;
}

type SnackbarProps = {
};

const Snackbar = forwardRef<SnackbarHandle, SnackbarProps>((props, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [text, setText] = useState<string>();
  const { i18n } = useLocale();

  useImperativeHandle(ref, () => ({
    show (text) {
      setText(text);
      setVisible(true);
    }
  }));
  const onDismissSnackBar = () => setVisible(false);

  return (
    <View style={styles.container}>
      <RNPSnackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={2000}
        theme={{ colors: { primary: Colors.green } }}
        action={{
          label: i18n.t('buttons.close'),
          onPress: () => {
            onDismissSnackBar();
          },
        }}>
        {text}
      </RNPSnackbar>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default Snackbar;