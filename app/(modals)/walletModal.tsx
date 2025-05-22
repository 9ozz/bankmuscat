import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import ModalWrapper from '@/components/ModelWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import { getProfileImage } from '@/services/imageService'
import { Image } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { UserDataType, WalletType } from '@/types'
import Buttons from '@/components/Buttons'
import { useAuth } from '@/contexts/authContext'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService';
import { deleteDoc, doc } from 'firebase/firestore'; // Add this import
import { firestore } from '@/config/firebase'; // Add this import if not already present

const WalletModal = () => {
  const router = useRouter(); // Move this inside the component
  const { user, updateUserData } = useAuth();
  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null,
  })


  const [loading, setLoading] = useState(false);

  const oldWallet: { name: string; image: string; id: string } =
  useLocalSearchParams();

  useEffect(() => {
  if (oldWallet?.id) {
    setWallet({
      name: oldWallet?.name,
      image: oldWallet?.image ? { uri: oldWallet.image } : null,
      id: oldWallet?.id
    });
  }
}, []);


  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
  
    console.log(result);
  
    if (!result.canceled) {
      //setUserData({ ...userData, image: result.assets[0] });
    }
  };


  const data: WalletType = {
    name: wallet.name,
    image: wallet.image,
    uid: user?.uid,
  };
  if(oldWallet?.id) data.id = oldWallet?.id;
  
  const onSubmit = async () => {
    let { name, image } = wallet;
    
    if(name.trim().length === 0 || !image) {
       Alert.alert("Wallet", "Please fill all the fields");
      return;
    }
    
    setLoading(true);
    try {
      // Create wallet data with user ID
      const walletData: Partial<WalletType> = {
        ...wallet,
        uid: user?.uid,
        created: new Date(),
        amount: wallet.amount || 0 // Make sure amount is initialized
      };
      
      // If we're editing an existing wallet, make sure to include the ID
      if (oldWallet?.id) {
        walletData.id = oldWallet.id;
      }
      
      // Use createOrUpdateWallet instead of updateUser
      const res = await createOrUpdateWallet(walletData);
      
      if (res.success) {
        Alert.alert("Wallet", oldWallet?.id ? "Wallet updated successfully" : "Wallet created successfully");
        router.back();
      } else {
        Alert.alert("Wallet", res.msg || "Failed to create wallet");
      }
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      Alert.alert("Wallet", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!oldWallet?.id) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, "wallets", oldWallet.id));
      Alert.alert("Wallet", "Wallet deleted successfully");
      router.back();
    } catch (error: any) {
      console.error("Error deleting wallet:", error);
      Alert.alert("Wallet", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to do this? \nThis action will remove all the transactions related to this wallet",
      [
        {
          text: "Cancel",
          onPress: () => console.log("cancel delete"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldWallet?.id ? "Update Wallet" : "New Wallet"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* form */}
        <ScrollView 
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false} // Add this line
        >
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Name</Typo>
            <Input
              placeholder="Salary"
              value={wallet.name}
              onChangeText={(value) => setWallet({...wallet, name: value})}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Icon</Typo>
            <ImageUpload 
              onClear={() => setWallet({...wallet, image: null})} 
              file={wallet.image} 
              onSelect={(file) => setWallet({...wallet, image: file})} 
              placeholder='Upload'
            />
          </View>

        </ScrollView>
      </View>
      <View style={styles.footer}>
        {
          oldWallet?.id && (
            <Buttons
              onPress={showDeleteAlert}
              style={{
                backgroundColor: colors.rose,
                paddingHorizontal: spacingX._15,
              }}
            >
              <Icons.Trash
                color={colors.white}
                size={verticalScale(24)}
                weight="bold"
              />
            </Buttons>
          )
        }
        <Buttons onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight="700">
            {oldWallet?.id ? "Update Wallet" : "Add Wallet"}
          </Typo>
        </Buttons>
      </View>
    </ModalWrapper>
  );
};

export default WalletModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingRight: 40, // This offsets the width of the back button to center the title
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._40,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",

  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._10,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});