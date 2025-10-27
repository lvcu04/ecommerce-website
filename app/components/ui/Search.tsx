"use client";
import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { Product } from "@/app/(types)";
import Link from "next/link";

const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/products?search=${query}`);
        const data = await response.json();
        setSuggestions(data.products);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Wait for 300ms after user stops typing

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSearch = () => {
    if (query.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative max-w-sm" ref={searchContainerRef}>
      <div className="flex items-center bg-gray-600 rounded-md px-4 py-2">
        <input
          type="text"
          placeholder="Bạn đang tìm gì ..."
          className="flex-1 bg-transparent text-white placeholder-gray-300 focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
        />
        <FiSearch
          className="text-white text-xl cursor-pointer"
          onClick={handleSearch}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 z-10 max-h-80 overflow-y-auto">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/products/product/${product.id}`}
              className="flex items-center p-2 hover:bg-gray-100"
              onClick={() => setShowSuggestions(false)}
            >
              <img
                src={product.imageUrl || 'https://placehold.co/40x40'}
                alt={product.name}
                className="w-10 h-10 object-cover rounded-md mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {product.name}
                </p>
                <p className="text-xs text-lime-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;