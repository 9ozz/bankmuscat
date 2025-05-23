import { Alert, Button, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import BackButton from '@/components/BackButton';
import Input from '@/components/Input';
import * as Icons from "phosphor-react-native";
import Buttons from '@/components/Buttons';
import { router, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
const Register = () => {
const emailRef = useRef("");
const passswordRef = useRef("");
const nameRef = useRef("");
const [isLoading, setIsLoading] = useState(false);
const router = useRouter();
const {register: registerUser} = useAuth();
const handleSubmit = async () => {
  if(!emailRef.current || !passswordRef.current || !nameRef.current) {
    Alert.alert("Sign up", "Please fill all fields");
    return;

  }
  setIsLoading(true);
  const res = await registerUser(emailRef.current, passswordRef.current, nameRef.current);
  console.log('register results', res);
  if (res?.success) {
    Alert.alert("Sign up", res.msg);
  }
};

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton></BackButton>
        <View style={{gap:5, marginTop: spacingY._20}} >
            <Typo size={30} fontWeight={"800"}>
                Let's
            </Typo>
            <Typo size={30} fontWeight={"800"}>
                Get Started
            </Typo>
        </View>

    {/* form */}
    <View style={styles.form} >
      <Typo size={16} color={colors.textLighter}>
        Create am account now to track all expenses
      </Typo>
      {/* input */}
      <Input 
        placeholder="Enter Your name" 
        onChangeText={(value) => (nameRef.current = value)}
        icon={<Icons.User size={verticalScale(26)} color={colors.neutral300} weight="fill" />}
        placeholderTextColor={colors.neutral400}
      />
      <Input 
        placeholder="Enter Your email" 
        onChangeText={(value) => (emailRef.current = value)}
        icon={<Icons.At size={verticalScale(26)} color={colors.neutral300} weight="fill" />}
        placeholderTextColor={colors.neutral400}
      />
      <Input 
        placeholder="Enter Your Password" 
        secureTextEntry
        onChangeText={(value) => (passswordRef.current = value)}
        icon={<Icons.Lock size={verticalScale(26)} color={colors.neutral300} weight="fill" />}
        placeholderTextColor={colors.neutral400}
      />
      <View style={{ marginTop: spacingY._20 }}>
        <Buttons loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={'700'} color={colors.black} size={21}>
            Sign Up
          </Typo>
        </Buttons>
      </View>
    </View>

    {/* foter */}
    <View style={styles.footer}>
    <Typo size={15}>Already have an account?</Typo>
    <Pressable onPress={() => router.navigate("/(auth)/login")}>
      <Typo fontWeight={'700'} color={colors.primary} size={15}>
        Login
      </Typo>
    </Pressable>
    </View>
        </View>
    </ScreenWrapper>
  )
}

export default Register;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: spacingY._30,
      paddingHorizontal: spacingX._20,
    },
    welcomeText: {
      fontSize: verticalScale(20),
      fontWeight: "bold",
      color: colors.text,
    },
    form: {
      gap: spacingY._20,
    },
    forgotPassword: {
      textAlign: "right",
      fontWeight: "500",
      color: colors.text,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
    },
    footerText: {
      textAlign: "center",
      color: colors.text,
      fontSize: verticalScale(15),
    },
  });