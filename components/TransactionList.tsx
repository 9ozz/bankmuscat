import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Typo from './Typo';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import { FlashList } from '@shopify/flash-list';
import Loading from './Loading';
import { expenseCategories } from '@/constants/data';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface TransactionItemProps {
  item: any;
  index: number;
  handleClick: (item: any) => void;  // Removed the question mark
}

const TransactionItem = ({ item, index, handleClick }: TransactionItemProps) => {
  let category = expenseCategories['transportation']
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
            paidwifi on 22/05/2023
          </Typo>  
        </View>
        <View style={styles.amountDate}>
          <Typo fontWeight={"500"} color={colors.rose}>
            - $23
          </Typo>
          <Typo size={13} color={colors.neutral400}>
            12 jan
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
  const handleClick = () => {
    // todo: open transaction details
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
              data={data}
              renderItem={({ item, index }) => (
                <TransactionItem 
                  item={item}
                  index={index}
                  handleClick={handleClick}
                />
              )}
              estimatedItemSize={60}
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
    height: 300, // FlashList requires a fixed height
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