import {ReactElement} from "react";
import {Animated, Pressable, PressableProps, StyleSheet, Text} from "react-native";
import {Colors} from "@/constants/Colors";

export enum ButtonVariants {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Yellow = 'Yellow',
  Success = 'Success',
  Danger = 'Danger'
}

type TButtonProps = PressableProps & {
  text: string;
  variant?: ButtonVariants;
}

export const ThemedButton = ({ text, variant = ButtonVariants.Primary, ...rest }: TButtonProps): ReactElement => {
  const animated = new Animated.Value(1);

  const fadeIn = () => {
    Animated.timing(animated, {
      toValue: 0.7,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const commonStyles = {
    paddingVertical: 15,
    paddingHorizontal: 25,
    opacity: animated,
    width:150,
    alignItems:'center'
  };

  const styles = StyleSheet.create({
    [ButtonVariants.Primary]: {
      backgroundColor: Colors.primary,
      ...commonStyles,
    },
    [ButtonVariants.Secondary]: {
      backgroundColor: Colors.secondary,
      ...commonStyles,
    },
    [ButtonVariants.Yellow]: {
      backgroundColor: Colors.yellow,
      ...commonStyles,
    },
    [ButtonVariants.Success]: {
      backgroundColor: Colors.green,
      ...commonStyles,
    },
    [ButtonVariants.Danger]: {
      backgroundColor: Colors.red,
      ...commonStyles,
    },
  });

  const commonTextStyles = {
    fontSize: 18,
  };

  const textStyles = StyleSheet.create({
    [ButtonVariants.Primary]: {
      color: Colors.secondary,
      fontWeight: '700',
      ...commonTextStyles,
    },
    [ButtonVariants.Secondary]: {
      color: Colors.black,
      fontWeight: '700',
      ...commonTextStyles,
    },
    [ButtonVariants.Yellow]: {
      color: Colors.black,
      fontWeight: '700',
      ...commonTextStyles,
    },
    [ButtonVariants.Success]: {
      color: Colors.secondary,
      fontWeight: '700',
      ...commonTextStyles,
    },
    [ButtonVariants.Danger]: {
      color: Colors.secondary,
      fontWeight: '700',
      ...commonTextStyles,
    },
  });

  return (
    <Pressable onPressIn={fadeIn} onPressOut={fadeOut} {...rest}>
      <Animated.View
        style={styles[variant]}
      >
        <Text style={textStyles[variant]}>{text}</Text>
      </Animated.View>
    </Pressable>
  )
}