import { Button, StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useCallback, useState } from 'react'
import Buttons from '@/components/Buttons';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { colors, spacingX, spacingY } from '@/constants/theme';
import Typo from '@/components/Typo';
import { useAuth } from '@/contexts/authContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import { scale, verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native';
import HomeCard from '@/components/HomeCard';
import TransactionList from '@/components/TransactionList';
import { useRouter } from 'expo-router';
import useFetchData from '@/hooks/useFetchData';
import { where, orderBy, limit } from 'firebase/firestore';
import { TransactionType } from '@/types';

const Home = () => {
  const {user} = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(30)
  ];

  const {
    data: recentTransactions,
    error,
    loading: transactionsLoading,
    refetch
  } = useFetchData<TransactionType>("transactions", [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
  ]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);
  
  // Add these before the return statement
  console.log('User ID:', user?.uid);
  console.log('Recent Transactions:', recentTransactions);
  console.log('Transaction Loading:', transactionsLoading);
  console.log('Transaction Error:', error);
  console.log('Recent Transactions:', recentTransactions?.length, recentTransactions);
  
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello, 👋
            </Typo>
            <Typo size={20} fontWeight={"500"}>
              {user?.name} 
            </Typo>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(modals)/searchModal")}
            style={styles.searchIcon}
          >
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              color={colors.neutral200}
              weight="bold"
            />
          </TouchableOpacity>
        </View>
        <ScrollView
         contentContainerStyle={styles.scrollViewStyle}
         showsHorizontalScrollIndicator={false}
         showsVerticalScrollIndicator={false} // Add this line
         refreshControl={
           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
         }
         >
          {/* Cards */}
          <View>
            <HomeCard />
          </View>
          <TransactionList 
          data={recentTransactions} 
          loading={transactionsLoading} 
          emptyListMessage='No recent transactions!'
          title="Recent Transactions" 
          />
        </ScrollView>

        {/* floating button */}
        <Buttons style={styles.floatingButton} onPress={()=> router.push("/(modals)/transactionModal")}>
          <Icons.Plus
            size={verticalScale(24)}
            color={colors.neutral200}
            weight="bold"
          />
        </Buttons>

      </View>
    </ScreenWrapper>
  )
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
});