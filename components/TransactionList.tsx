import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Typo from './Typo';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import { FlashList } from '@shopify/flash-list';
import Loading from './Loading';
import { expenseCategories, incomeCategory } from '@/constants/data';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { TransactionType, WalletType } from '@/types';
import { Timestamp } from 'firebase/firestore';
import useFetchData from '@/hooks/useFetchData';
import { where } from 'firebase/firestore';
import { useAuth } from '@/contexts/authContext';

// Add this helper function outside of any component
const formatDate = (dateValue: any) => {
  try {
    if (!dateValue) return 'Unknown date';
    
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle ISO strings or other date formats
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    
    return 'Invalid date';
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
  }
};

interface TransactionItemProps {
  item: any;
  index: number;
  handleClick: (item: any) => void;  // Removed the question mark
}

const TransactionItem = ({ item, index, handleClick }: TransactionItemProps) => {
  let category = item?.type === "income" ? incomeCategory : expenseCategories[item?.category];
  const IconComponent = category.icon;
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity style={styles.row} onPress={() => handleClick(item)}>
        <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
          {IconComponent && (
            <IconComponent
              size={verticalScale(25)}
              weight="fill"
              color={colors.white}
            />
          )}
        </View>
        <View style={styles.categoryDes}>
          <Typo size={17}>{category.label}</Typo>
          <Typo size={12} color={colors.neutral400} textProps={{numberOfLines: 1}}>
            {item?.description || 'No description'}
          </Typo>
        </View>
        <View style={styles.amountDate}>
          <Typo fontWeight={"500"} color={item?.type === "expense" ? colors.rose : colors.green}>
            {item?.type === "expense" ? '- ' : '+ '}OMR {item?.amount || 0}
          </Typo>
          <Typo size={13} color={colors.neutral400}>
            {formatDate(item?.date)}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface TransactionListType {
  data?: any[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
}

const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage = "No transactions found",
}: TransactionListType) => {

  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch wallets to filter transactions
  const {
    data: wallets,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
  ]);
  
  // Filter transactions to only show those with existing wallets
  const filteredData = data?.filter(transaction => {
    return wallets.some(wallet => wallet.id === transaction.walletId);
  });

  const handleClick = (item: TransactionType) => {
   router.push({
    pathname: '/(modals)/transactionModal',
    params: {
      id: item?.id,  // Changed from "item" to "id" to match what the modal expects
      type: item?.type,
      category: item?.category,
      amount: item?.amount.toString(),
      date: (item?.date as Timestamp).toDate().toISOString(),
      description: item?.description,
      image: item?.image,
      uid: item?.uid,
      walletId: item?.walletId,
    }
   })
  };

  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} fontWeight={"500"}>
          {title}
        </Typo>
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <Loading/>
        </View>
      )}
      
      {!loading && (
        <>
          <View style={styles.list}>
            <FlashList
              data={filteredData}
              renderItem={({ item, index }) => (
                <TransactionItem 
                  item={item}
                  index={index}
                  handleClick={handleClick}
                />
              )}
              estimatedItemSize={60}
              showsVerticalScrollIndicator={false}
            />
          </View>
          
          {data?.length === 0 && (
            <Typo size={15} color={colors.neutral400} style={{textAlign: 'center', marginTop: spacingY._15}}>
              {emptyListMessage}
            </Typo>
          )}
        </>
      )}
    </View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
    minHeight: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._12,
    marginBottom: spacingY._12,
    // list with background
    backgroundColor: colors.neutral800,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._17, // Add this line to make the icon rounded
  },
  list: {
    height: 500, // Increase height to show more transactions
    overflow: 'hidden', // Add this line to hide scrollbar
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingY._20,
  }
});