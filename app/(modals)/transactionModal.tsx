import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import ModalWrapper from '@/components/ModelWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import { getProfileImage } from '@/services/imageService'
import { Image } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import { TransactionType, UserDataType, WalletType } from '@/types'
import Buttons from '@/components/Buttons'
import { useAuth } from '@/contexts/authContext'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '@/components/ImageUpload'
import { Dropdown } from 'react-native-element-dropdown';
import { deleteDoc, doc, orderBy, where } from 'firebase/firestore'; // Add this import
import { firestore } from '@/config/firebase'; // Add this import if not already present
import useFetchData from '@/hooks/useFetchData'

const TransactionModal = () => {
  const router = useRouter(); // Move this inside the component
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    date: new Date(),
    category: "",
    walletId: "",
    image: null,
  })


  const [loading, setLoading] = useState(false);

  const oldTransaction: { name: string; image: string; id: string } =
  useLocalSearchParams();

  const {data:wallets, error, loading: walletsLoading} = useFetchData<WalletType>("wallets", [
    where("uid","==", user?.uid),
    orderBy("created", "desc")
  ]);

  const transactionTypes = [
    { label: "Expense", value: "expense" },
    { label: "Income", value: "income" },
    { label: "Transfer", value: "transfer" },
  ];


  useEffect(() => {
  if (oldTransaction?.id) {
    setTransaction({
      name: oldTransaction?.name,
      image: oldTransaction?.image ? { uri: oldTransaction.image } : null,
      id: oldTransaction?.id
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


  const data: transactionType = {
    name: transaction.name,
    image: transaction.image,
    uid: user?.uid,
  };
  if(oldTransaction?.id) data.id = oldTransaction?.id;
  
  const onSubmit = async () => {
    let { name, image } = transaction;
    
    if(name.trim().length === 0 || !image) {
       Alert.alert("transaction", "Please fill all the fields");
      return;
    }
    
    setLoading(true);
    try {
      // Create transaction data with user ID
      const transactionData: Partial<transactionType> = {
        ...transaction,
        uid: user?.uid,
        created: new Date(),
        amount: transaction.amount || 0 // Make sure amount is initialized
      };
      
      // If we're editing an existing transaction, make sure to include the ID
      if (oldTransaction?.id) {
        transactionData.id = oldTransaction.id;
      }
      
      // Use createOrUpdatetransaction instead of updateUser
      const res = await createOrUpdatetransaction(transactionData);
      
      if (res.success) {
        Alert.alert("transaction", oldTransaction?.id ? "transaction updated successfully" : "transaction created successfully");
        router.back();
      } else {
        Alert.alert("transaction", res.msg || "Failed to create transaction");
      }
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      Alert.alert("transaction", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!oldTransaction?.id) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, "transactions", oldTransaction.id));
      Alert.alert("transaction", "transaction deleted successfully");
      router.back();
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      Alert.alert("transaction", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to do this? \nThis action will remove all the transactions related to this transaction",
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
          title={oldTransaction?.id ? "Update transaction" : "New transaction"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Type</Typo>
            {/* Transaction Type Dropdown */}
            <View style={styles.inputContainer}>
              <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={transactionTypes}
                maxHeight={300}
                labelField="label"
                valueField="value"
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                placeholder={"Select item"}
                value={transaction.type}
                onChange={(item) => {
                  setTransaction({ ...transaction, type: item.value });
                }}
              />
            </View>
          </View>

          {/* Wallet Dropdown */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet</Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={wallets?.map((wallet) => ({
                label: `${wallet?.name} (${wallet?.amount})`,
                value: wallet?.id,
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              placeholder={"Select wallet"}
              value={transaction.walletId}
              onChange={(item) => {
                setTransaction({ ...transaction, walletId: item.value || "" });
              }}
            />
          </View>

          {/* Continue with other form fields */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Amount</Typo>
            <Input
              placeholder="0.00"
              keyboardType="numeric"
              value={transaction.amount ? transaction.amount.toString() : ""}
              onChangeText={(value) => setTransaction({...transaction, amount: parseFloat(value) || 0})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Description</Typo>
            <Input
              placeholder="Transaction description"
              value={transaction.description}
              onChangeText={(value) => setTransaction({...transaction, description: value})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>transaction Icon</Typo>
            <ImageUpload 
              onClear={() => setTransaction({...transaction, image: null})} 
              file={transaction.image} 
              onSelect={(file) => setTransaction({...transaction, image: file})} 
              placeholder='Upload'
            />
          </View>

        </ScrollView>
      </View>
      <View style={styles.footer}>
        {
          oldTransaction?.id && (
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
            {oldTransaction?.id ? "Update transaction" : "Add transaction"}
          </Typo>
        </Buttons>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._20,
    paddingBottom: spacingY._20,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  // Dropdown styles
  dropdownContainer: {
    height: verticalScale(54),
    backgroundColor: colors.neutral700,
    borderRadius: radius._15,
    paddingHorizontal: spacingX._15,
  },
  dropdownPlaceholder: {
    color: colors.neutral400,
    fontSize: verticalScale(16),
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(16),
  },
  dropdownIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
    tintColor: colors.neutral300,
  },
  dropdownItemText: {
    color: colors.white,
    fontSize: verticalScale(16),
  },
  dropdownItemContainer: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    padding: spacingY._10,
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.neutral600,
  },
});

