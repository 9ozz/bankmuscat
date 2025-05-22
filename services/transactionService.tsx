import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TransactionType, WalletType, ResponseType } from "@/types";
import { 
  addDoc, 
  collection, 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { uploadFileToCloudinary } from "@/services/imageService";
import { scale } from "@/utils/styling";
import { colors } from "@/constants/theme";
import { getLast7Days, getLast12Months } from '@/utils/common'; // Ensure getLast12Months is imported



export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;
    
    if(!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data!" };
    }
    
    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "transactions", id)
      );
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOriginal = 
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.walletId != walletId;
      if(shouldRevertOriginal){
        let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
        if(!res.success) return res;
      }
    } else {
      // update wallet for new transaction
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      );
      if(!res.success) return res;
    }
    
    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        "transactions"
      );
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload receipt",
        };
      }
      transactionData.image = imageUploadRes.data;
    }
    
    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));
    
    await setDoc(transactionRef, transactionData, {merge: true});
    
    return { success: true, data: {...transactionData, id: transactionRef.id} };
  } catch (err: any) {
    console.log("error creating or updating transaction: ", err);
    return { success: false, msg: err.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
) => {
  try {
    // Get the original wallet data
    const originalWalletSnapshot = await getDoc(
      doc(firestore, "wallets", oldTransaction.walletId)
    );
    
    const originalWallet = originalWalletSnapshot.data() as WalletType;
    
    let newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId)
    );
    let newWallet = newWalletSnapshot.data() as WalletType;
    
    const revertType = 
      oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";
    
    const revertIncomeExpense: number = 
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);
    
    const revertedWalletAmount = Number(originalWallet.amount) + revertIncomeExpense;
    
    const revertedIncomeExpenseAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount);
    
    // Check if there's enough balance for the new transaction
    if (newTransactionType == "expense") {
      // if user tries to convert income to expense on the same wallet
      // or if the user tries to increase the expense amount and don't have enough balance
      if (
        oldTransaction.walletId == newWalletId && 
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "The selected wallet don't have enough balance",
        };
      }
      
      // if user tries to add expense from a new wallet but the wallet don't have enough balance
      if (newWallet.amount! < newTransactionAmount) {
        return {
          success: false,
          msg: "The selected wallet don't have enough balance",
        };
      }
    }
    
    // Update the original wallet to revert the transaction
    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });
    
    // If the wallet is different, update the new wallet
    if (oldTransaction.walletId !== newWalletId) {
      // Refresh the new wallet data
      newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
      newWallet = newWalletSnapshot.data() as WalletType;
      
      const updateType = 
        newTransactionType == "income" ? "totalIncome" : "totalExpenses";
      
      const updatedTransactionAmount: number = 
        newTransactionType == "income"
          ? Number(newTransactionAmount)
          : -Number(newTransactionAmount);
      
      const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;
      
      const newIncomeExpenseAmount = Number(
        newWallet[updateType]
      ) + Number(newTransactionAmount);
      
      await createOrUpdateWallet({
        id: newWalletId,
        amount: newWalletAmount,
        [updateType]: newIncomeExpenseAmount,
      });
    }
    
    return { success: true };
  } catch (err: any) {
    console.log("error updating wallet for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    
    if(!walletSnapshot.exists()) {
      console.log("error updating wallet for new transaction");
      return { success: false, msg: "Wallet not found" };
    }
    
    const walletData = walletSnapshot.data() as WalletType;
    
    if(type === "expense" && walletData.amount! - amount < 0) {
      return { 
        success: false, 
        msg: "Selected wallet don't have enough balance" 
      };
    }
    
    const updateType = type === "income" ? "totalIncome" : "totalExpenses";
    const updatedWalletAmount = 
      type === "income" 
        ? Number(walletData.amount) + amount 
        : Number(walletData.amount) - amount;
    
    const updatedTotals = 
      type === "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;
    
    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });
    
    return { success: true };
  } catch (err: any) {
    console.log("error updating wallet for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

// Helper function for wallet updates
const createOrUpdateWallet = async (walletData: Partial<WalletType>) => {
  try {
    const { id } = walletData;
    if (!id) return { success: false, msg: "Wallet ID is required" };
    
    const walletRef = doc(firestore, "wallets", id);
    await updateDoc(walletRef, walletData);
    
    return { success: true };
  } catch (err: any) {
    console.log("error updating wallet: ", err);
    return { success: false, msg: err.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string
): Promise<ResponseType> => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transactionRef);
    
    if(!transactionSnapshot.exists()){
      return { success: false, msg: "Transaction not found" };
    }
    
    const transactionData = transactionSnapshot.data() as TransactionType;
    
    const transactionType = transactionData?.type;
    const transactionAmount = transactionData?.amount;
    
    // fetch wallet to update amount, totalIncome or totalExpenses
    const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
    const walletData = walletSnapshot.data() as WalletType;
    
    // check fields to be updated based on transaction type
    const updateType = 
      transactionType === "income" ? "totalIncome" : "totalExpenses";
    
    // Calculate new wallet amount by reversing the transaction effect
    const newWalletAmount = 
      transactionType === "income" 
        ? Number(walletData.amount) - Number(transactionAmount)
        : Number(walletData.amount) + Number(transactionAmount);
    
    // Calculate new income/expense total by subtracting the transaction amount
    const newIncomeExpenseAmount = Number(walletData[updateType]) - Number(transactionAmount);
    
    // Update the wallet with the new values
    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });
    
    // Delete the transaction document
    await deleteDoc(transactionRef);
    
    return { success: true };
  } catch (err: any) {
    console.log("error deleting transaction: ", err);
    return { success: false, msg: err.message };
  }
};

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );
    
    const querySnapshot = await getDocs(transactionsQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];
    
    // maping each transaction in day
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);
      
      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split("T")[0]; // as specific date
      
      const dayData = weeklyData.find((day) => day.date == transactionDate);
      
      if (dayData) {
        if (transaction.type == "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type == "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });
    
    // takes each day and creates two entries in an array
    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.green, // Changed from primary to green for income
      },
      { value: day.expense, frontColor: colors.rose }, // Keep rose color for expenses
    ]);
    
    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (err: any) {
    console.log("error fetching weekly stats: ", err);
    return { success: false, msg: err.message };
  }
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    // Define query to fetch transactions in the last 12 months
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const monthlyData = getLast12Months(); // Use getLast12Months here
    const transactions: TransactionType[] = [];

    // Process transactions to calculate income and expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();
      const monthName = transactionDate.toLocaleString("default", {
        month: "short",
      });
      const shortYear = transactionDate.getFullYear().toString().slice(-2);

      const monthDataItem = monthlyData.find(
        (month) => month.month === `${monthName}${shortYear}`
      );

      if (monthDataItem) {
        if (transaction.type === "income") {
          monthDataItem.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthDataItem.expense += transaction.amount;
        }
      }
    });

    // Reformat monthlyData for the bar chart with income and expense entries for each month
    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(46), // Adjusted labelWidth as per image
        frontColor: colors.green, // Income bar color (using green as in weekly)
      },
      {
        value: month.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error: any) {
    console.error("Error fetching monthly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch monthly transactions",
    };
  }
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();

    // Define query to fetch all transactions for the user
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("uid", "==", uid),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const yearlyData: { year: string; income: number; expense: number }[] = [];
    const transactions: TransactionType[] = [];

    // Process transactions to calculate income and expense for each year
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();
      const yearName = transactionDate.getFullYear().toString();

      let yearEntry = yearlyData.find((entry) => entry.year === yearName);

      if (!yearEntry) {
        yearEntry = { year: yearName, income: 0, expense: 0 };
        yearlyData.push(yearEntry);
      }

      if (transaction.type === "income") {
        yearEntry.income += transaction.amount;
      } else if (transaction.type === "expense") {
        yearEntry.expense += transaction.amount;
      }
    });

    // Sort yearlyData by year in ascending order for consistent chart display
    yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

    // Reformat yearlyData for the bar chart with income and expense entries for each year
    const stats = yearlyData.flatMap((yearEntry) => [
      {
        value: yearEntry.income,
        label: yearEntry.year,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: colors.green, // Changed from colors.green[500] to match other functions
      },
      {
        value: yearEntry.expense,
        frontColor: colors.rose, // Changed from colors.rose[500] to match other functions
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error("Error fetching yearly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch yearly transactions",
    };
  }
};