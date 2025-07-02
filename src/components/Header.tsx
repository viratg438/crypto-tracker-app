import Link from "next/link";
import React from "react";

function Header() {
  return (
    <div className="flex w-full bg-gray-800 px-6 py-2">
      <div className="container">
        <Link
          href={"/"}
          className="text-yellow-500 text-3xl font-semibold text-center w-full flex justify-center items-center"
        >
          Crypto Converter
        </Link>
      </div>
    </div>
  );
}

export default Header;
