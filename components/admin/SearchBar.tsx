"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Search…" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/admin/products?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form className="admin-search" onSubmit={handleSubmit}>
      <Search size={16} strokeWidth={1.75} />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Search admin"
      />
    </form>
  );
}
