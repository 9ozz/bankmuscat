import {
    ActivityIndicator,
    ActivityIndicatorProps,
    StyleSheet,
    Text,
    View,
  } from "react-native";
  
  import React from "react"; // 6.9k (gzipped: 2.7k)
  import { colors } from "@/constants/theme";
  
  const Loading = ({
    size = "large",
    color = colors.primary,
  }: ActivityIndicatorProps) => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  };
  
  export default Loading;
  
  const styles = StyleSheet.create({});