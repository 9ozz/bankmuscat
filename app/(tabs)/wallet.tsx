import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Typo from '@/components/Typo'
import * as Icons from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { orderBy, where } from 'firebase/firestore'
import { useAuth } from '@/contexts/authContext'
import Loading from '@/components/Loading'
import WalletListItem from '@/components/WalletListItem'


const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {data:wallets, error, loading} = useFetchData<WalletType>("wallets", [
    where("uid","==", user?.uid),
    orderBy("created", "desc")
  ]);

  console.log("wallets", Array.isArray(wallets) ? wallets.length : 0);
  const getTotalBalance = () => {
    return wallets.reduce((total, item) => {
      total = total + (item.amount || 0);
      return total;
    }, 0);
  };  
    

  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }}>
      <View style={styles.container}>
        {/* balance view */}
        <View style={styles.balanceView}>
          <View style={{ alignItems: "center" }}>
            <Typo size={45} fontWeight={"500"}>
              {getTotalBalance()?.toFixed(2)} OMR
            </Typo>
            <Typo size={16} color={colors.neutral300}>
              Total Balance
            </Typo>
          </View>
        </View>
        {/* wallets */}
        <View style={styles.wallets}>
            {/* header */}
            <View style={styles.flexRow}>
              <Typo size={20} fontWeight="500">My Wallets</Typo>
              <TouchableOpacity onPress={() => router.push("/(modals)/walletModal")}>
                <Icons.PlusCircle
                weight='fill'
                size={verticalScale(33)}
                color={colors.neutral300}
                />

              </TouchableOpacity>
            </View>
            <View style={styles.listStyle}>
              {loading && <Loading/>}
              {!loading && wallets && wallets.length > 0 && (
                <FlatList
                  data={wallets}
                  renderItem={({ item, index }) => (
                    <WalletListItem item={item} index={index} router={router}/>
                  )}
                  contentContainerStyle={styles.listStyle}
                />
              )}
              {!loading && wallets && wallets.length === 0 && (
                <Typo color={colors.neutral300} style={{textAlign: 'center', marginTop: 20}}>
                  No wallets found.
                </Typo>
              )}
            </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
  },
  listStyle: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
  },
});