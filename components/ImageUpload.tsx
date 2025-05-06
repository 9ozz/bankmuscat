import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ImageUploadProps } from "@/types";
import * as Icons from 'phosphor-react-native';
import { colors, radius } from "@/constants/theme";
import Typo from "./Typo";
import { scale, verticalScale } from "@/utils/styling";
// Remove the import for getFileImage since it's not defined
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";


const ImageUpload = ({
    file = null,
    onSelect,
    onClear,
    containerStyle,
    imageStyle,
    placeholder = "",
  }: ImageUploadProps) => {

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
    
      console.log(result);
    
      if (!result.canceled) {
        onSelect(result.assets[0]);
      }
    };
    
    return (
      <View>
        {!file && (
          <TouchableOpacity onPress={pickImage} style={[styles.inputContainer, containerStyle && containerStyle]}>
            <Icons.UploadSimple color={colors.neutral200} />
            {placeholder && <Typo size={15}>{placeholder}</Typo>}
          </TouchableOpacity>
        )}

        {file && (
          <View style={[styles.image, imageStyle && imageStyle]}>
            <Image
              style={{flex: 1}}
              source={{uri: file.uri}} 
              contentFit="cover"
              transition={100}
            />
            <TouchableOpacity 
              style={styles.deleteIcon} 
              onPress={onClear}
            >
              <Icons.XCircle weight="fill" color={colors.white} size={verticalScale(24)} /> 
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  export default ImageUpload;
  
  const styles = StyleSheet.create({
    inputContainer: {
      height: verticalScale(54),
      backgroundColor: colors.neutral700,
      borderRadius: radius._15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.neutral500,
      borderStyle: "dashed",
    },
    image: {
      height: scale(150),
      position: 'relative',
      width: scale(150),
      overflow: 'hidden',
      borderRadius: radius._15,
      borderCurve: 'circular',
    },
    deleteIcon: {
      position: 'absolute',
      top: scale(6),
      right: scale(6),
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      zIndex: 1,
    }
  });