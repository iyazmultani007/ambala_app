import React from 'react'

function TabButton({ buttonText, isActive, onClick }) {
  return (
    <button
      className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6   ${
        isActive
          ? "bg-primary text-white"
          : "bg-gray dark:bg-meta-4 text-black dark:text-white"
      }`}
      onClick={onClick}
    >
      {buttonText}
    </button>
  )
}

export default TabButton