import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

const index = () => {    
    //const router = useRouter();
  //  useEffect(() => {
        //  setTimeout(() => {
       //       router.push("/(auth)/welcome");
    //      }, 2000);
   //   }, []);
  return (
      <View style={[styles.container, styles.content]}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require("../assets/images/splashImage.png")}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    height: "17%",
    aspectRatio: 1,
  },
});
export default index;
