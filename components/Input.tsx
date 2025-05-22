import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { InputProps } from "@/types";
import { colors, radius, spacingX } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";

const Input = (props: InputProps) => {
    const { containerStyle, inputStyle, icon, inputRef, ...restProps } = props;
    
    return (
      <View
        style={[styles.container, containerStyle]}
      >
        {icon && icon}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.neutral400}
          ref={inputRef}
          {...restProps}
        />
      </View>
    );
  };

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: verticalScale(56), // Reduced height for cleaner look
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: colors.neutral600, // Darker border for better contrast
    borderRadius: radius._15, // Consistent with dropdowns
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
    gap: spacingX._10,
    backgroundColor: colors.neutral800, // Match dropdown background
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: verticalScale(15), // Match dropdown text size
  },
});