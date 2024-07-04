import {ReactElement} from "react";
import {TextInput, View, Text, StyleSheet, TextInputProps} from "react-native";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Colors} from "@/constants/Colors";

export const ThemedInput = ( {label, ...restProps}: { label: string } & TextInputProps): ReactElement => {
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    label: {
      fontSize: 18,
    },
    input: {
      paddingVertical: 15,
      fontSize: 18,
      paddingHorizontal: 25,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].text,
      width: '100%',
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...restProps}></TextInput>
    </View>
  )
}