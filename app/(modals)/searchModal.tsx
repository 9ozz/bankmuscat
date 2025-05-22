import { StyleSheet, View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import useFetchData from '@/hooks/useFetchData';
import { TransactionType } from '@/types';
import { colors, spacingX, spacingY } from '@/constants/theme'; // Ensure this import exists and is correct
import Input from '@/components/Input';
import TransactionList from '@/components/TransactionList';
import ModalWrapper from '@/components/ModelWrapper'; // Assuming this is the correct path
import { orderBy, where } from 'firebase/firestore';

const SearchModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Fetch all transactions for the user, ordered by date
  const constraints = user?.uid ? [where("uid", "==", user.uid), orderBy("date", "desc")] : [];
  const { 
    data: allTransactions = [], // Default to empty array if data is undefined
    loading: transactionsLoading 
  } = useFetchData<TransactionType>("transactions", constraints);

  // Filter transactions based on search input
  const filteredTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      const searchTerm = search.toLowerCase();
      return (
        item.category?.toLowerCase().includes(searchTerm) ||
        item.type?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    }
    return true; // Show all transactions if search length is not > 1
  });

  return (
    <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
      <View style={styles.container}>
        {/* Header or Back Button can be added here if needed */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Search by category, type, or description..."
              value={search}
              placeholderTextColor={colors.neutral400}
              containerStyle={{ backgroundColor: colors.neutral800 }}
              onChangeText={(value) => setSearch(value)}
            />
          </View>

          <View>
            <TransactionList
              loading={transactionsLoading}
              data={filteredTransactions}
              emptyListMessage={search.length > 1 ? "No transactions match your search keywords" : "No transactions yet. Start by adding one!"}
            />
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacingX._20, // Corrected: Accessing _20 property of spacingX
  },
  form: {
    paddingVertical: spacingY._20, // Corrected: Using a specific value like _20 from spacingY. Adjust if needed.
  },
  inputContainer: {
    marginBottom: spacingY._20, // Corrected: Using a specific value like _20 from spacingY. Adjust if needed.
  },
});