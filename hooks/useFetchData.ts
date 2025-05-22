import React, { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

const useFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): { data: T[]; loading: boolean; error: string | null; refetch: () => Promise<void> } => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(async () => {
    setRefreshKey(prev => prev + 1);
    return Promise.resolve();
  }, []);

  useEffect(() => {
    // Return early if collectionName is not provided to prevent errors
    if (!collectionName) {
      setError("Collection name is required.");
      setLoading(false);
      return;
    };

    try {
      // Get a reference to the specified Firestore collection
      const collectionRef = collection(firestore, collectionName);

      // Construct the Firestore query with the base collection reference and any provided constraints
      const q = query(collectionRef, ...constraints);

      // Set up a real-time listener (onSnapshot) to the query
      // This function will be called initially and whenever the query results change
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Map through the documents in the snapshot
          const fetchedData = snapshot.docs.map((doc) => {
            // Return an object for each document including its ID and data
            // The 'as T' assertion assumes the document data matches the generic type T
            return {
              id: doc.id,
              ...doc.data(),
            } as T; // Ensure the data structure matches the expected type T
          });

          // Update the state with the fetched data
          setData(fetchedData);
          // Set loading to false as data has been fetched
          setLoading(false);
          // Clear any previous errors
          setError(null);
        },
        // Error handler for the onSnapshot listener
        (err) => {
          console.error("Error fetching data from Firestore:", err);
          setError(`Failed to fetch data: ${err.message}`);
          setLoading(false);
        }
      );

      // Cleanup function: Unsubscribe from the listener when the component unmounts
      // or when the dependencies (collectionName, constraints) change.
      // This prevents memory leaks.
      // Return the unsubscribe function
      return () => unsubscribe();
    } catch (err: any) {
      // Add this catch block to handle any errors during setup
      console.error("Error setting up Firestore listener:", err);
      setError(`Error setting up listener: ${err.message}`);
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, [collectionName, JSON.stringify(constraints), refreshKey]); // Add refreshKey to dependencies

  return { data, loading, error, refetch };
};

export default useFetchData;
