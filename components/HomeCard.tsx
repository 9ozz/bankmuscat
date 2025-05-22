import { StyleSheet, View } from 'react-native'
import React from 'react'
import Typo from './Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { ImageBackground } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData' // Fixed import (default import)
import { where, orderBy } from 'firebase/firestore' // Added import for query functions
import { WalletType } from '@/types' // Make sure WalletType is imported

const HomeCard = () => {
  const {user} = useAuth();

  const {
    data: wallets,
    error,
    loading: walletLoading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const getTotals = () => {
    return wallets.reduce((totals: any, item: WalletType) => {
      totals.balance = totals.balance + Number(item.amount);
      totals.income = totals.income + Number(item.totalIncome);
      totals.expenses = totals.expenses + Number(item.totalExpenses);
      return totals;
    }, {balance: 0, income: 0, expenses: 0});
  };

  const totals = getTotals();

  return (
    <ImageBackground
      source={require("../assets/images/card.png")}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        <View>
          {/* total balance */}
          <View style={styles.totalBalanceRow}>
            <Typo color={colors.neutral800} size={17} fontWeight={"500"}>
              Total Balance
            </Typo>
            <Icons.DotsThreeOutline
              size={verticalScale(23)}
              color={colors.black}
              weight="fill"
            />
          </View>
          <Typo color={colors.black} size={30} fontWeight={"bold"}>
            OMR {walletLoading ? "..." : totals.balance.toFixed(2)}
          </Typo>
        </View>
        {/* total expense and income */}
        <View style={styles.stats}>
          {/* income */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Income
              </Typo>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Typo size={17} color={colors.green} fontWeight={"500"}>
                OMR {walletLoading ? "..." : totals.income.toFixed(2)}
              </Typo>
            </View>
          </View>
          
          {/* expense */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Expense
              </Typo>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Typo size={17} color={colors.rose} fontWeight={"500"}>
               OMR {walletLoading ? "..." : totals.expenses.toFixed(2)}
              </Typo>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: "87%",
    width: "100%",
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  statsIcon: {
    backgroundColor: colors.white,
    height: verticalScale(25),
    width: verticalScale(25),
    borderRadius: verticalScale(25) / 2,
    justifyContent: "center",
    alignItems: "center",
  },
});