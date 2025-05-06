import React, { useEffect, useState } from 'react'; // 6.9k (gzipped: 2.7k)
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore'; // 551k (gzipped: ?) - Note: Gzip size might vary
import { firestore } from '@/config/firebase'; // Assuming this path is correct for your project structure

/**
 * Custom React hook to fetch data from a Firestore collection in real-time.
 *
 * @template T The expected type of the documents in the collection.
 * @param {string} collectionName The name of the Firestore collection to fetch data from.
 * @param {QueryConstraint[]} [constraints=[]] An optional array of Firestore query constraints (e.g., where, orderBy, limit).
 * @returns {{ data: T[], loading: boolean, error: string | null }} An object containing the fetched data, loading state, and any potential error.
 */
const useFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): { data: T[]; loading: boolean; error: string | null } => {
  // State to store the fetched data
  const [data, setData] = useState<T[]>([]);
  // State to track the loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to store any potential errors during fetching
  const [error, setError] = useState<string | null>(null);

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
      return () => unsubscribe();

    } catch (err: any) {
        // Catch any synchronous errors during setup
        console.error("Error setting up Firestore listener:", err);
        setError(`Error setting up listener: ${err.message}`);
        setLoading(false);
    }

  }, [collectionName, JSON.stringify(constraints)]); // Stringify constraints for stable dependency check

  // Return the state variables: data, loading status, and error
  return { data, loading, error };
};

export default useFetchData;
