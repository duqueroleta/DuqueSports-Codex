import { useEffect, useState } from 'react';

function useAsyncData(loader, dependencies = [], initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (isActive) {
          setData(result ?? initialValue);
          setIsLoading(false);
        }
      })
      .catch((loadError) => {
        if (isActive) {
          setError(loadError);
          setData(initialValue);
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [...dependencies, retryKey]);

  function retry() {
    setRetryKey((value) => value + 1);
  }

  return { data, error, isLoading, retry };
}

export { useAsyncData };
