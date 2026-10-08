import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

// Refetch when the screen comes back into focus (e.g. switching tabs). The first focus is skipped
// because the query already fetches when it mounts.
export function useRefreshOnFocus(refetch) {
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetch({ cancelRefetch: false });
    }, [refetch]),
  );
}
