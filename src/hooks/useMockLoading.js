import { useEffect, useState } from 'react';

function useMockLoading(dependencies, delay = 420) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeoutId = window.setTimeout(() => setIsLoading(false), delay);

    return () => window.clearTimeout(timeoutId);
  }, dependencies);

  return isLoading;
}

export { useMockLoading };
