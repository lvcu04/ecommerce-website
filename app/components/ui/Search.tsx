"use client";

import { FiSearch } from "react-icons/fi";

const Search = () => {
  return (
    <div className=" max-w-sm">
      <div className="flex items-center bg-gray-600 rounded-md px-4 py-2">
        <input
          type="text"
          placeholder="Bạn đang tìm gì ..."
          className="flex-1  bg-transparent text-white placeholder-gray-300 focus:outline-none"
        />
        <FiSearch className="text-white text-xl cursor-pointer" />
      </div>
    </div>
  );
};

export default Search;
