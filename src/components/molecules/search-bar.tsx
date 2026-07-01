import { FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Icon, Input, Spinner } from "@/components/atoms";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  loading = false,
  className = "",
}: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <span className="pointer-events-none absolute left-3 text-text-secondary">
        <Icon icon={Search} size="sm" />
      </span>
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="!pl-9 !pr-9"
      />
      {loading ? (
        <span className="absolute right-3 text-text-secondary">
          <Spinner size="sm" />
        </span>
      ) : (
        value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 rounded-full text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon icon={X} size="sm" />
          </button>
        )
      )}
    </form>
  );
}
