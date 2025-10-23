"use client";
import { useState ,KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";



const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");


  const handleSearch = () => {
  // Xử lý logic tìm kiếm ở đây
  if(query.trim() !== "") {
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <div className=" max-w-sm">
      <div className="flex items-center bg-gray-600 rounded-md px-4 py-2">
        <input
          type="text"
          placeholder="Bạn đang tìm gì ..."
          className="flex-1  bg-transparent text-white placeholder-gray-300 focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <FiSearch className="text-white text-xl cursor-pointer" onClick={handleSearch} />
      </div>
    </div>
  );
};

export default Search;
