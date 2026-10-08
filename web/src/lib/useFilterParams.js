import { useCallback } from "react";
import { useSearchParams } from "react-router";

// Search/filter state kept in the URL so it survives reloads and the back button.
export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilters = useCallback(
    (changes) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  // Unknown enum values in the URL are ignored rather than sent to the API.
  const getEnum = (key, allowed) => {
    const value = searchParams.get(key);
    return allowed.includes(value) ? value : "";
  };

  return { search: searchParams.get("search") ?? "", getEnum, updateFilters };
}
