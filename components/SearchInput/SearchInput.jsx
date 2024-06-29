import React from "react";

function SearchInput({ handleChange, disable }) {
  return (
    <div className="flex relative items-center mb-7 justify-center">
      <input
        className="w-full rounded-md border border-stroke bg-white px-5 py-2.5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
        type="search"
        name="search"
        placeholder="Product Search"
        onChange={(e) => handleChange(e)}
        disabled={disable}
      />
    </div>
  );
}

export default SearchInput;
