import { ResponseType, WalletType } from "@/types"; // Assuming WalletType includes: id?, amount?, totalIncome?, totalExpenses?, created?, image? etc.
import { uploadFileToCloudinary } from "./imageService"; // Uncommented Cloudinary import
import { doc, collection, setDoc, deleteDoc } from "firebase/firestore"; // Import Firestore functions
import { firestore } from '@/config/firebase'; // Assuming firestore instance is exported from here

/**
 * Creates or updates a wallet in Firestore. Uploads image to Cloudinary if provided.
 *
 * @param {Partial<WalletType>} walletData - The wallet data to create or update. Can be a partial object. Expects an 'id' property for updates.
 * @returns {Promise<ResponseType>} A promise that resolves with a response object indicating success or failure, including the saved wallet data on success.
 */
export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    // Initialize walletToSave with the input data.
    let walletToSave: Partial<WalletType> = { ...walletData };

    // Handle image upload to Cloudinary if an image is provided
    if (walletToSave.image && typeof walletToSave.image === 'object' && walletToSave.image.uri) {
      console.log("[WALLET] Uploading image to Cloudinary");
      const imageUploadRes = await uploadFileToCloudinary(
        walletToSave.image,
        "wallets"
      );
      
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload wallet image",
        };
      }
      
      // Update the image field with the Cloudinary URL
      walletToSave.image = imageUploadRes.data;
      console.log("[WALLET] Image uploaded successfully:", walletToSave.image);
    }
    
    // Check if it's a new wallet (no ID provided)
    if (!walletData?.id) {
      // Initialize default fields for a new wallet
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.created = new Date();
    }

    // Get the Firestore document reference.
    const walletRef = walletData?.id
      ? doc(firestore, "wallets", walletData.id)
      : doc(collection(firestore, "wallets"));

    // Use setDoc with { merge: true } to create or update the document.
    await setDoc(walletRef, walletToSave, { merge: true });

    // Return success response including the final wallet data (with ID)
    return {
      success: true,
      msg: `Wallet ${walletData?.id ? 'updated' : 'created'} successfully.`,
      data: { ...walletToSave, id: walletRef.id }
    };

  } catch (error: any) {
    console.error("Error creating or updating wallet:", error);
    return { success: false, msg: error.message || "An unexpected error occurred." };
  }
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    await deleteDoc(walletRef);
    return { success: true, msg: "Wallet deleted successfully" };
  }
  catch (error: any) {
      console.error("Error deleting wallet:", error);
      return { success: false, msg: error.message || "An unexpected error occurred." };
    }
  }; // Removed the extra closing curly brace here
