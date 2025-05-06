import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType>(null);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          name: firebaseUser?.displayName,
        });
        updateUserData(firebaseUser?.uid);
        router.replace("/(tabs)");
      } else {
        // no user
        setUser(null);
        router.replace("/(auth)/welcome");
      }
    });

    return () => unsub(); // Cleanup function to unsubscribe
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      console.log('error: ', msg);
      if(msg.includes("(auth/invalid-credential"))
        msg = "Wrrong credentials ";
      if(msg.includes("(auth/invalid-email"))
        msg = "Invalid email address";
      return { success: false, msg };
    }
  };

  const register = async (email: string, password: string, name:string) => {
    try {
      let response = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(firestore, "users", response?.user?.uid), {
        uid: response?.user?.uid,
        name,
        email,
      });
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      console.log('error: ', msg);
      if(msg.includes("(auth/email-already-in-use"))
        msg = "This email is already in use";
      if(msg.includes("(auth/invalid-email"))
        msg = "Invalid email address";
      return { success: false, msg };
    }
  };

  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const userData = {
          uid: data.uid,
          name: data.name || null,
          email: data.email || null, 
          image: data.image || null,
        };
        setUser(userData);
        return { success: true };
      }
      return { success: false, msg: "User document not found" };
    } catch (error: any) {
      let msg = error.message;
      console.log('error: ', error);
      return { success: false, msg };
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;