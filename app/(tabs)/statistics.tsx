import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import Typo from '@/components/Typo'
import Header from '@/components/Header'
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BarChart } from 'react-native-gifted-charts';
import Loading from '@/components/Loading'
import { useAuth } from '@/contexts/authContext'
import {
  fetchWeeklyStats,
  fetchMonthlyStats, // Added import
  fetchYearlyStats, // Added import
} from "@/services/transactionService";
import TransactionList from '@/components/TransactionList'

// Define the barData for the chart  // Consider removing this if unused
// const barData = [
//   { value: 250, label: 'M' },
//   { value: 500, label: 'T' },
//   { value: 745, label: 'W' },
//   { value: 320, label: 'T' },
//   { value: 600, label: 'F' },
//   { value: 256, label: 'S' },
//   { value: 300, label: 'S' },
// ];

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const {user} = useAuth();
  const [chartData, setChartData] = useState<any[]>([]); // Ensure chartData is always an array
  const [chartloading, setChartLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]); // Ensure transactions is always an array

  useEffect(() => {
    console.log("Current user ID in useEffect:", user?.uid); 
    if (!user?.uid) { // Check if user?.uid is available
      console.log("User ID not available yet, skipping fetch.");
      setChartData([]); // Clear chart data if no user
      setChartLoading(false); // Ensure loading is stopped
      return;
    }

    if (activeIndex === 0) {
      getWeeklyStats();
    } else if (activeIndex === 1) {
      getMonthlyStats();
    } else if (activeIndex === 2) {
      getYearlyStats();
    }
  }, [activeIndex, user?.uid]); // Add user?.uid to the dependency array
  
  const getWeeklyStats = async () => {
    if (!user?.uid) { // Guard clause for user?.uid
      console.log("getWeeklyStats: User ID not available.");
      setChartData([]);
      setChartLoading(false);
      return;
    }
    setChartLoading(true);
    try {
      let res = await fetchWeeklyStats(user.uid); // user.uid is now more reliably available
      console.log("Weekly stats response:", res);
      if (res.success && res.data && Array.isArray(res.data.stats)) {
        console.log("Chart data being set:", res.data.stats);
        setChartData(res.data.stats);
        setTransactions(res.data.transactions);
      } else {
        Alert.alert("Error", res.msg || "Failed to fetch weekly stats or data is not in expected format.");
        setChartData([]); // Set to empty array on failure or incorrect data format
      }
    } catch (error: any) {
      console.error("Error in getWeeklyStats:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred while fetching weekly stats.");
      setChartData([]); // Set to empty array on catch
    } finally {
      setChartLoading(false);
    }
  };

  const getMonthlyStats = async () => {
    if (!user?.uid) {
      console.log("getMonthlyStats: User ID not available.");
      setChartData([]);
      setChartLoading(false);
      return;
    }
    setChartLoading(true);
    try {
      let res = await fetchMonthlyStats(user.uid);
      console.log("Monthly stats response:", res);
      if (res.success && res.data && Array.isArray(res.data.stats)) {
        setChartData(res.data.stats);
        setTransactions(res.data.transactions);
      } else {
        Alert.alert("Error", res.msg || "Failed to fetch monthly stats or data is not in expected format.");
        setChartData([]);
      }
    } catch (error: any) {
      console.error("Error in getMonthlyStats:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred while fetching monthly stats.");
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const getYearlyStats = async () => {
    if (!user?.uid) {
      console.log("getYearlyStats: User ID not available.");
      setChartData([]);
      setChartLoading(false);
      return;
    }
    setChartLoading(true);
    try {
      let res = await fetchYearlyStats(user.uid);
      console.log("Yearly stats response:", res);
      if (res.success && res.data && Array.isArray(res.data.stats)) {
        setChartData(res.data.stats);
        setTransactions(res.data.transactions);
      } else {
        Alert.alert("Error", res.msg || "Failed to fetch yearly stats or data is not in expected format.");
        setChartData([]);
      }    
    } catch (error: any) {
      console.error("Error in getYearlyStats:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred while fetching yearly stats.");
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };
  
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header} />
        <Header title="Statistics" />
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: spacingY._20,
          paddingTop: spacingY._5,
          paddingBottom: verticalScale(100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl
          values={["Weekly", "Monthly", "Yearly"]}
          selectedIndex={activeIndex}
          onChange={(event) => {
            setActiveIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor={colors.neutral200}
          backgroundColor={colors.neutral800}
          appearance="dark"
          activeFontStyle={styles.segmentFontStyle}
          style={styles.segmentStyle}
          fontStyle={{...styles.segmentFontStyle, color: colors.white}}
        />

        <View style={styles.chartContainer}>
          {chartloading ? ( // Show loader if chartloading is true
            <View style={styles.chartLoadingContainer}>
              <Loading color={colors.white} />
            </View>
          ) : chartData.length > 0 ? (
            <BarChart
              data={chartData}
              barWidth={scale(12)}
              spacing={[1,2].includes(activeIndex) ? scale(25) : scale(16)}
              roundedTop
              roundedBottom
              hideRules
              yAxisLabelPrefix="OMR "
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisLabelWidth={scale(70)}
              yAxisTextStyle={{ color: colors.neutral350 }}
              xAxisLabelTextStyle={{
                color: colors.neutral350,
                fontSize: verticalScale(12),
              }}
              noOfSections={3}
              minHeight={5}
            />
          ) : (
            <View style={styles.noChartContainer}> 
              <Typo color={colors.neutral400}>No data available for the selected period.</Typo>
            </View>
          )}
          {/* This loading indicator might be redundant if the one above is used */}
          {/* { 
            chartloading && (
              <View style={styles.chartLoadingContainer}>
                <Loading color={colors.white} />
              </View>
            )
          } */}
        </View>
        {/* Transactions List */}
        <View>
          <TransactionList
            title="Transactions"
            emptyListMessage="No transactions found for the selected period."
            data={transactions}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Statistics;


const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0, 0.6)",
    justifyContent: "center", // Added for centering loader
    alignItems: "center",    // Added for centering loader
  },
  header: {},
  noChart: { // This style might be replaced by noChartContainer logic
    backgroundColor: "rgba(0,0,0, 0.6)", // Consider changing this to a message
    height: verticalScale(210),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
  },
  noChartContainer: { // New style for displaying "No data" message
    height: verticalScale(210),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral800, // Or a transparent/semi-transparent background
    borderRadius: radius._12,
    padding: spacingX._20,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous",
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black,
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
});