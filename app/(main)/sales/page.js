"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumbs";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import React, { useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";

import "react-big-calendar/lib/css/react-big-calendar.css";
import InputModal from "@/components/InputModal/InputModal";
import { collection, getCountFromServer, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase.config";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SalesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [options, setOptions] = useState([]);

 

  const fetchData = async () => {
    const col = collection(db, "sales");
    try {
      const querySnapshot = await getDocs(col);
      const count = await getCountFromServer(col);

      const newData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    const fetch = async () => {
      const col = collection(db, "branches");
      const spanshot = await getDocs(col);
      setOptions(
        spanshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        })
      );
    };
    fetch();
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day) => {
    const salesDataForDay = getSalesDataForDate(day);
    if (salesDataForDay.length > 0) {
      setSalesData(salesDataForDay);
    } else {
      setSalesData([]);
    }
    
    setSelectedDate(day);
    setIsOpen(true);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-2 mt-2">
        <button
          className="flex justify-center items-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 ml-2"
          onClick={handlePrevMonth}
        >
          <svg
            className="mr-2 w-6 h-6 text-gray-800 dark:text-white hidden md:block"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14M5 12l4-4m-4 4 4 4"
            />
          </svg>
          Prev
        </button>
        <div className="font-bold text-lg">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button
          className="flex justify-center items-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
          onClick={handleNextMonth}
        >
          Next
          <svg
            className="ml-2 w-6 h-6 text-gray-800 dark:text-white hidden md:block"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 12H5m14 0-4 4m4-4-4-4"
            />
          </svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    return daysOfWeek.map((day, index) => (
      <th
        key={index}
        className="flex h-15 items-center justify-center rounded-tl-sm p-1 text-xs font-semibold sm:text-base xl:p-5"
      >
        {day}
      </th>
    ));
  };

  const getSalesDataForDate = (date) => {
    return data.filter((sale) => isSameDay(new Date(sale.date), date));
  };

  const renderSalesData = (sales) => {
    
    
    
    return (
      <div className="group h-16 w-28 flex-grow cursor-pointer py-1 md:h-30 md:w-full">
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="group-hover:text-primary md:hidden"
        >
          More
        </span>
        {sales.map((sale, index) => {
          let branchData = options.find((option) => option.id === sale.branchId);
          return (
            <div
            key={index}
            className="p-1 mt-1 text-xs rounded bg-primary text-white dark:bg-meta-4  invisible opacity-0 group-hover:visible group-hover:opacity-100 md:visible md:opacity-100"
          >
            {branchData?.branchName}: £{sale?.totalSale}
          </div>
          )
        })}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    const currentDate = new Date().toDateString();

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const salesData = getSalesDataForDate(day);
        days.push(
          <td
            className={`overflow-auto  hide-scrollbar ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
              !isSameMonth(day, monthStart) ? "bg-primary/10" : ""
            } ${isSameDay(day, currentDate) ? "bg-gray dark:bg-meta-4" : ""}`}
            key={day}
            onClick={() => handleDateClick(cloneDay)}
          >
            <span className="font-medium text-black dark:text-white">
              {formattedDate}
            </span>
            {salesData.length > 0 && renderSalesData(salesData)}
          </td>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <tr className="grid grid-cols-7" key={day}>
          {days}
        </tr>
      );
      days = [];
    }
    return rows;
  };

  return (
    <ProtectedRoute>
      <Breadcrumb pageName="Sales" />

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {renderHeader()}
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
              {renderDays()}
            </tr>
          </thead>
          <tbody>{renderCells()}</tbody>
        </table>
      </div>
      {isOpen && (
        <InputModal
          date={selectedDate}
          onClose={() => setIsOpen(false)}
          isOpen={isOpen}
          salesData={salesData}
          setOptions={setOptions}
          options={options}
        />
      )}
    </ ProtectedRoute>
  );
}

export default SalesPage;
