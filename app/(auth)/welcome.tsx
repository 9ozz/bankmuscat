import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors, spacingX, spacingY } from '@/constants/theme';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { verticalScale } from '@/utils/styling';
import Button from '@/components/Buttons';
import  Animated, { FadeIn, FadeInDown }  from 'react-native-reanimated';

export default function Welcome() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Login Button & Image */}
        <View>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginButton}>
            <Typo>Sign in</Typo>
          </TouchableOpacity>
          <Animated.Image
            entering={FadeIn.duration(1000)}
            source={require('../../assets/images/welcome1.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            style={{alignItems:'center'}}
            >
            <Typo size={25} fontWeight={800}>
              Track your expenses
            </Typo>
            <Typo size={25} fontWeight={800} style={{marginBottom: verticalScale(10)}}>
              And control your budget
            </Typo>
            <Animated.View
              entering={FadeInDown.duration(1000).delay(100).springify().damping(12)}
              style={{alignItems:'center', gap: 2, marginTop: verticalScale(5)}}
            >
              <Typo size={17} color={colors.textLight}>
                tracking every rial that matters
              </Typo>
            </Animated.View>
          </Animated.View>
        </View>
      </View>
      <Animated.View
        entering={FadeInDown.duration(1000)
                  .delay(200)
                  .springify()
                  .damping(12)}
        style={styles.buttonContainer}
      >
        <Button onPress={() => router.push('/(auth)/register')}>
          <Typo size={22} color={colors.neutral900} fontWeight={"600"}>Get Started</Typo>
        </Button>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      paddingTop: spacingY._7,
    },
    welcomeImage: {
      width: "80%",
      height: verticalScale(300),
      alignSelf: "center",
      marginTop: verticalScale(100),
    },
    loginButton: {
      alignSelf: "flex-end",
      marginRight: spacingX._20,
    },
    footer: {
      backgroundColor: colors.neutral900,
      alignItems: "center",
      paddingTop: verticalScale(30),
      paddingBottom: verticalScale(45),
      gap: spacingY._20,
      shadowColor: "white",
      shadowOffset: { width: 0, height: 1 }, // Note: -10 for shadow going upwards
      elevation: 10,
      shadowRadius: 25,
      shadowOpacity: 0.15,
    },
    buttonContainer: {
      width: "100%",
      paddingHorizontal: spacingX._10,
    },
  });