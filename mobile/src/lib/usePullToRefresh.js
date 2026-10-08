import { useState } from "react";

// Pull-to-refresh for one or more queries. The spinner reflects only the user's pull (not background
// refetches), and `cancelRefetch: false` joins a request already in flight instead of sending another.
export function usePullToRefresh(...refetchers) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all(refetchers.map((refetch) => refetch({ cancelRefetch: false })));
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, onRefresh };
}
