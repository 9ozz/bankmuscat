import { StyleSheet, Text, TextStyle, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors, radius } from "@/constants/theme";
import { CustomButtonProps, TypoProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import Loading from "@/components/Loading";

const Buttons = ({
  style,
  onPress,
  loading = false,
  children
}: CustomButtonProps) => {
    if (loading) {
        return (
            <View style={[styles.button, style, {backgroundColor: "transparent"}]}>
                <Loading />
            </View>
        );
    }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
        {children}
    </TouchableOpacity>
  );
};

export default Buttons;

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.white,
        borderRadius: radius._30,
        borderCurve: "continuous",
        height: verticalScale(52),
        alignItems: "center",
        justifyContent: "center",
        transform: [{ translateY: verticalScale(-30) }], // Move button up by 5 units
    },
});