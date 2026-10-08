import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

// Debounced search field (docs/DESIGN.md section 8). `value` is the applied search; typing updates it
// 300 ms after the last keystroke, and external changes (e.g. "Clear filters") reset the text.
export function SearchInput({ value, onSearch, label, placeholder, maxLength = 100 }) {
  const [text, setText] = useState(value);
  const [appliedValue, setAppliedValue] = useState(value);

  if (value !== appliedValue) {
    setAppliedValue(value);
    if (value !== text.trim()) setText(value);
  }

  useEffect(() => {
    const next = text.trim();
    if (next === value) return undefined;
    const timer = setTimeout(() => onSearch(next), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  const clear = () => {
    setText("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        maxLength={maxLength}
        onChange={(event) => setText(event.target.value)}
        className="h-10 px-9 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {text ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
