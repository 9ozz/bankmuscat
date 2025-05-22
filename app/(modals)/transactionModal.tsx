import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Pressable, Platform, KeyboardAvoidingView } from 'react-native'
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
import { deleteDoc, doc, orderBy, where } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import useFetchData from '@/hooks/useFetchData'
import Input from '@/components/Input'
import { expenseCategories, transactionTypes } from '@/constants/data'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// Update the imports at the top of the file
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService';




const TransactionModal = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    date: new Date(),
    category: "",
    walletId: "",
    image: null,
  });

  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError] = useState(false);
  
  type paramType = {
    id: string | string[];
    type: string | string[];
    amount: string | string[];
    category?: string | string[];
    date: string | string[];
    description?: string | string[];
    image?: any;
    uid?: string | string[];
    walletId: string | string[];
  };
  
  const oldTransaction: paramType = useLocalSearchParams();

  // Remove this useEffect completely
  /*
  useEffect(() => {
    if (oldTransaction?.id) {
      setTransaction({
        type: Array.isArray(oldTransaction.type) ? oldTransaction.type[0] : oldTransaction.type,
        amount: Number(Array.isArray(oldTransaction.amount) ? oldTransaction.amount[0] : oldTransaction.amount),
        description: Array.isArray(oldTransaction.description) ? oldTransaction.description[0] : (oldTransaction.description || ""),
        category: Array.isArray(oldTransaction.category) ? oldTransaction.category[0] : (oldTransaction.category || ""),
        date: new Date(Array.isArray(oldTransaction.date) ? oldTransaction.date[0] : oldTransaction.date),
        walletId: Array.isArray(oldTransaction.walletId) ? oldTransaction.walletId[0] : oldTransaction.walletId,
        image: Array.isArray(oldTransaction.image) ? oldTransaction.image[0] : oldTransaction.image,
      });
    }
  }, []);
  */
  
  // Safe date parsing utility function - improved version
  const safeDate = (date: any): Date => {
    try {
      // If it's already a Date object, return it
      if (date instanceof Date && !isNaN(date.getTime())) return date;
      
      // If it's a string or number, try to create a Date
      if (date) {
        const parsedDate = new Date(date);
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) return parsedDate;
      }
      
      // Default to current date if invalid
      return new Date();
    } catch (e) {
      console.error('Date parsing error:', e);
      setDateError(true);
      return new Date();
    }
  };

  const handleDatePress = () => {
    try {
      // Ensure we have a valid date before opening the picker
      const validDate = safeDate(transaction.date);
      console.log('Opening date picker with date:', validDate);
      
      // Update transaction with the validated date first
      setTransaction(prev => ({ ...prev, date: validDate }));
      
      // Then show the picker
      setShowDatePicker(true);
    } catch (e) {
      console.error('Date picker open error:', e);
      setDateError(true);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // For Android, always hide the picker after any event
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    // Only update the date if the user selected one (not if dismissed)
    if (event.type === 'set' && selectedDate) {
      // Validate the selected date
      const validDate = safeDate(selectedDate);
      setTransaction(prev => ({ ...prev, date: validDate }));
      
      // For iOS, hide the picker after selection
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (Platform.OS === 'ios' && event.type === 'dismissed') {
      // For iOS, hide the picker when dismissed
      setShowDatePicker(false);
    }
  };

  const { data: wallets } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const transactionTypeOptions = [
    { label: "Expense", value: "expense" },
    { label: "Income", value: "income" },
  ];

  useEffect(() => {
    if (oldTransaction?.id) {
      try {
        setTransaction({
          type: typeof oldTransaction.type === 'string' ? oldTransaction.type : Array.isArray(oldTransaction.type) ? oldTransaction.type[0] : 'expense',
          amount: oldTransaction.amount ? Number(Array.isArray(oldTransaction.amount) ? oldTransaction.amount[0] : oldTransaction.amount) : 0,
          description: typeof oldTransaction.description === 'string' ? oldTransaction.description : Array.isArray(oldTransaction.description) ? oldTransaction.description[0] : '',
          date: oldTransaction.date ? safeDate(Array.isArray(oldTransaction.date) ? oldTransaction.date[0] : oldTransaction.date) : new Date(),
          category: typeof oldTransaction.category === 'string' ? oldTransaction.category : Array.isArray(oldTransaction.category) ? oldTransaction.category[0] : '',
          walletId: typeof oldTransaction.walletId === 'string' ? oldTransaction.walletId : Array.isArray(oldTransaction.walletId) ? oldTransaction.walletId[0] : '',
          image: oldTransaction.image ? { uri: Array.isArray(oldTransaction.image) ? oldTransaction.image[0] : oldTransaction.image } : null
        });
      } catch (error) {
        console.error("Error initializing transaction:", error);
      }
    }
  }, []); // Changed from [oldTransaction] to [] to run only once

  const onSubmit = async () => {
    const { amount, walletId, type, category, date, image, description } = transaction;
    // Remove the description validation since it's now optional
    
    if (!amount || isNaN(amount) || amount <= 0) {
      Alert.alert("transaction", "Please enter a valid amount");
      return;
    }
    if (!walletId) {
      Alert.alert("transaction", "Please select a wallet");
      return;
    }
    if (!type) {
      Alert.alert("transaction", "Please select a transaction type");
      return;
    }
    if (type === "expense" && !category) {
      Alert.alert("transaction", "Please select a category");
      return;
    }

    console.log("good to go");
    let transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image,
      uid: user?.uid,
    };
    
    console.log("Transaction data: ", transactionData);

    //todo: include transaction id for updating
    if (oldTransaction?.id) {
      transactionData.id = Array.isArray(oldTransaction.id) 
        ? oldTransaction.id[0] 
        : oldTransaction.id;
    }
    
    setLoading(true);
    try {
      const res = await createOrUpdateTransaction(transactionData);
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
    
    // Get the ID as a string (take first element if it's an array)
    const transactionId = Array.isArray(oldTransaction.id) 
      ? oldTransaction.id[0] 
      : oldTransaction.id;
      
    // Get the walletId as a string (take first element if it's an array)
    const walletId = Array.isArray(oldTransaction.walletId) 
      ? oldTransaction.walletId[0] 
      : oldTransaction.walletId;
      
    setLoading(true);
    try {
      const res = await deleteTransaction(transactionId, walletId);
      if (res.success) {
        Alert.alert("transaction", "Transaction deleted successfully");
        router.back();
      } else {
        Alert.alert("transaction", res.msg || "Failed to delete transaction");
      }
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.container}>
          <Header
            title={oldTransaction?.id ? "Update transaction" : "New transaction"}
            leftIcon={<BackButton />}
            style={{ marginBottom: spacingY._10 }}
          />

          {/* form */}
          <ScrollView 
            contentContainerStyle={styles.form} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Type</Typo>
              <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={transactionTypeOptions}
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

            {/* expense categories */}
            {transaction.type === "expense" && (
              <View style={styles.inputContainer}>
                <Typo color={colors.neutral200}>Expense Category</Typo>
                <Dropdown
                  style={styles.dropdownContainer}
                  activeColor={colors.neutral700}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  data={Object.values(expenseCategories)}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  placeholder={"Select category"}
                  value={transaction.category}
                  onChange={(item) => {
                    setTransaction({
                      ...transaction,
                      category: item.value || "",
                    });
                  }}
                />
              </View>
            )}

            {/* date picker */}
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Date</Typo>
              <Pressable
                style={({ pressed }) => [
                  styles.dateInput,
                  pressed && { opacity: 0.7 }
                ]}
                android_ripple={{ color: colors.neutral600 }}
                accessibilityRole="button"
                accessibilityLabel="Select transaction date"
                onPress={handleDatePress}
                disabled={showDatePicker}
              >
                <View style={styles.dateInputContent}>
                  {dateError ? (
                    <Typo size={14} color={colors.rose}>Invalid Date</Typo>
                  ) : (
                    <Typo size={15}>
                      {safeDate(transaction.date).toLocaleDateString()}
                    </Typo>
                  )}
                  <Icons.Calendar size={20} color={colors.neutral300} />
                </View>
              </Pressable>
            </View>

            {showDatePicker && (
              <View style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}>
                <DateTimePicker
                  themeVariant="dark"
                  value={safeDate(transaction.date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? "inline" : "calendar"}
                  onChange={onDateChange}
                  textColor={colors.white}
                />
                {Platform.OS === 'ios' && (
                  <View style={[styles.iosDatePickerButtons, { justifyContent: 'center' }]}>
                    <Buttons
                      onPress={() => setShowDatePicker(false)}
                      style={{ 
                        paddingHorizontal: spacingX._20, 
                        paddingVertical: spacingY._10 
                      }}
                    >
                      <Typo color={colors.black} fontWeight="bold">Done</Typo>
                    </Buttons>
                  </View>
                )}
              </View>
            )}
          
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

            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Amount</Typo>
              <Input
                placeholder="0.00"
                keyboardType="numeric"
                value={transaction.amount ? transaction.amount.toString() : ""}
                onChangeText={(value) => setTransaction({ ...transaction, amount: parseFloat(value) || 0 })}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Typo color={colors.neutral200}>Description</Typo>
                  <Typo color={colors.neutral400} size={12} style={{ marginLeft: 4 }}>(Optional)</Typo>
                </View>
                <Input
                  placeholder="Transaction description"
                  value={transaction.description}
                  onChangeText={(value) => setTransaction({ ...transaction, description: value })}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Receipt</Typo>
              <ImageUpload
                onClear={() => setTransaction({ ...transaction, image: null })}
                file={transaction.image}
                onSelect={(file) => setTransaction({ ...transaction, image: file })}
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
          <Buttons onPress={onSubmit} loading={loading} style={{ flex: 1, marginTop: 20}}>
            <Typo color={colors.black} fontWeight="700">
              {oldTransaction?.id ? "Update transaction" : "Add transaction"}
            </Typo>
          </Buttons>
        </View>
      </KeyboardAvoidingView>
    </ModalWrapper>
  );
};

{/* amount */}


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
    paddingTop: spacingY._30,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  dropdownContainer: {
    height: verticalScale(56), // Match input height
    backgroundColor: colors.neutral800,
    borderRadius: radius._15, // Consistent radius
    paddingHorizontal: spacingX._15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral600,
    // Keep subtle shadow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android shadow
  },
  dateInput: {
    height: verticalScale(56), // Match input height
    backgroundColor: colors.neutral800, // Match other inputs
    borderRadius: radius._15, // Consistent radius
    paddingHorizontal: spacingX._15,
    justifyContent: 'center',
    borderWidth: 1, // Add border
    borderColor: colors.neutral600, // Match other inputs
  },
  dateInputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iosDatePicker: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._15,
    overflow: 'hidden',
  },
  iosDatePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._15,
    borderTopWidth: 1,
    borderTopColor: colors.neutral600,
    backgroundColor: colors.neutral700,
  },
  iosDatePickerButton: {
    paddingHorizontal: spacingX._15,
  },
  dropdownPlaceholder: {
    color: colors.neutral400,
    fontSize: verticalScale(15), // Slightly smaller placeholder text
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(15), // Consistent font size
    fontWeight: '500', // Medium weight for selected text
  },
  dropdownIcon: {
    width: verticalScale(22), // Slightly larger icon
    height: verticalScale(22),
    tintColor: colors.neutral300,
  },
  dropdownItemText: {
    color: colors.white,
    fontSize: verticalScale(15),
    fontWeight: '400',
  },
  dropdownItemContainer: {
    backgroundColor: colors.neutral700, // Slightly lighter item background
    borderRadius: radius._30, // Larger radius for items
    paddingVertical: spacingY._12, // Adjust padding for item spacing
    paddingHorizontal: spacingX._15,
    marginVertical: spacingY._7, // Add some vertical margin between items
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral800, // Consistent with dropdown background
    borderRadius: radius._20, // Larger radius for the list container
    borderWidth: 1,
    borderColor: colors.neutral600,
    marginTop: spacingY._5, // Add a small margin from the dropdown itself
    // Adding a subtle shadow for the list container
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5, // for Android shadow
  },
});

