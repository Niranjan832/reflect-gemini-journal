
import { useEffect, useState } from 'react';

/**
 * Custom hook for safely handling async data loading
 * @param asyncFn - The async function to execute
 * @param dependencies - Optional array of dependencies to trigger re-fetching
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  dependencies: any[] = []
): [T | undefined, boolean, Error | null] {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await asyncFn();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
          console.error('Error fetching data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return [data, loading, error];
}

/**
 * Helper function to safely wait for a promise to resolve
 * @param promise - The promise to await
 * @param defaultValue - Default value to return if the promise fails
 */
export async function safeAwait<T>(
  promise: Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Error in safeAwait:', error);
    return defaultValue;
  }
}
