"use client";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import CardData from "@/components/CardData/CardData";
import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/utils/firebase.config";

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css"; // Change theme as necessary
import "flatpickr/dist/flatpickr.css"; // Import flatpickr styles
import ChartOne from "@/components/Charts/ChartOne";

export default function Home() {
  const [totalSalesAllBranches, setTotalSalesAllBranches] = useState(0);
  const [salesByBranch, setSalesByBranch] = useState([]);
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [chartData, setChartData] = useState({});
  const [branches, setBranches] = useState([]);
  const [dateRange, setDateRange] = useState([]);

 

  useEffect(() => {
    const fetchTotalSales = async () => {
      const col = collection(db, "sales");
      const branchesCollection = collection(db, "branches");
      try {
        let querySnapshot;
        if (dateRange.length > 0) {
          const q = query(
            col,
            where("date", ">=", dateRange[0].toISOString()),
            where("date", "<=", dateRange[1].toISOString())
          );

          querySnapshot = await getDocs(q);
        } else {
          querySnapshot = await getDocs(col);
        }

        const branchesSnapshot = await getDocs(branchesCollection);

        const branches = branchesSnapshot?.docs?.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let totalSales = 0;
        const salesData = [];

        querySnapshot.forEach((doc) => {
          totalSales += doc.data().totalSale;
        });

        querySnapshot.forEach((doc) => {
          const { branchId, totalSale, card, cash } = doc.data();
          let branchData = branches.find((branch) => branch.id === branchId);
          const existingBranch = salesData.find(
            (item) => item.branchId === branchId
          );

          if (existingBranch) {
            existingBranch.total += totalSale;
            existingBranch.card += parseFloat(card);
            existingBranch.cash += parseFloat(cash);
          } else {
            salesData.push({
              branchName: branchData?.branchName,
              branchId: branchId,
              total: totalSale,
              card: parseFloat(card),
              cash: parseFloat(cash),
            });
          }
        });

        setSalesByBranch(salesData);

        setTotalSalesAllBranches(totalSales);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };
    fetchTotalSales();
  }, [dateRange]);

  useEffect(() => {
    const fetchSalesData = async () => {
      const branchesCol = collection(db, "branches");
      const salesCol = collection(db, "sales");

      const branchesSnapshot = await getDocs(branchesCol);
      // const salesSnapshot = await getDocs(salesCol);

      const branchesData = branchesSnapshot?.docs?.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let startDate, endDate;
      const now = new Date();

      if (timePeriod === "weekly") {
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
      } else if (timePeriod === "monthly") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      const salesQuery = query(
        salesCol,
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate))
      );

      const salesSnapshot = await getDocs(salesQuery);
      const salesData = salesSnapshot?.docs?.map((doc) => doc.data());

      

      setBranches(branchesData);
      updateChartData(salesData, branchesData, timePeriod);
    };

    fetchSalesData();
  }, [timePeriod]);

  // const updateChartData = (salesData, branchesData, period) => {
  //   const labels = branchesData?.map((branch) => branch.branchName);
  //   const data = branchesData?.map((branch) => {
  //     const sales = salesData.filter((sale) => sale.branchId === branch.id);
  //     console.log("sales: ", sales);
  //     const totalSales = sales.reduce((acc, sale) => acc + sale.totalSale, 0);
  //     console.log("totalSales", totalSales);
  //     return totalSales;
  //   });

  //   console.log("data", data);

  //   setChartData({
  //     labels,
  //     datasets: [
  //       {
  //         label: `Total Sales (${period})`,
  //         data,
  //         backgroundColor: "rgba(75, 192, 192, 0.2)",
  //         borderColor: "rgba(75, 192, 192, 1)",
  //         borderWidth: 1,
  //       },
  //     ],
  //   });
  // };

  // const options = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: "top",
  //     },
  //     title: {
  //       display: true,
  //       text: `Total Sales (${timePeriod})`,
  //     },
  //   },
  // };

  return (
    <ProtectedRoute>
      <main>
        <div className="relative mb-4 w-full md:w-1/3 xl:w-1/5">
          <div className="flatpickr-wrapper">
            <Flatpickr
              options={{
                mode: "range",
                dateFormat: "Y-m-d",
                class:
                  "dark:bg-gray-700 dark:text-white flatpickr-calendar rangeMode animate static flatpickr-right arrowTop arrowLeft",
              }}
              value={dateRange}
              onChange={setDateRange}
              className="w-[120%] rounded border border-stroke bg-white py-2 pl-10 pr-4 text-sm font-medium shadow-card-2 focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 left-4 right-auto flex items-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.75 3.75C3.33579 3.75 3 4.08579 3 4.5V15C3 15.4142 3.33579 15.75 3.75 15.75H14.25C14.6642 15.75 15 15.4142 15 15V4.5C15 4.08579 14.6642 3.75 14.25 3.75H3.75ZM1.5 4.5C1.5 3.25736 2.50736 2.25 3.75 2.25H14.25C15.4926 2.25 16.5 3.25736 16.5 4.5V15C16.5 16.2426 15.4926 17.25 14.25 17.25H3.75C2.50736 17.25 1.5 16.2426 1.5 15V4.5Z"
                fill="#64748B"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 0.75C12.4142 0.75 12.75 1.08579 12.75 1.5V4.5C12.75 4.91421 12.4142 5.25 12 5.25C11.5858 5.25 11.25 4.91421 11.25 4.5V1.5C11.25 1.08579 11.5858 0.75 12 0.75Z"
                fill="#64748B"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6 0.75C6.41421 0.75 6.75 1.08579 6.75 1.5V4.5C6.75 4.91421 6.41421 5.25 6 5.25C5.58579 5.25 5.25 4.91421 5.25 4.5V1.5C5.25 1.08579 5.58579 0.75 6 0.75Z"
                fill="#64748B"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.5 7.5C1.5 7.08579 1.83579 6.75 2.25 6.75H15.75C16.1642 6.75 16.5 7.08579 16.5 7.5C16.5 7.91422 16.1642 8.25 15.75 8.25H2.25C1.83579 8.25 1.5 7.91422 1.5 7.5Z"
                fill="#64748B"
              ></path>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardData title="Total Sales" total={totalSalesAllBranches}>
            <svg
              className="fill-primary dark:fill-white"
              width="20"
              height="22"
              viewBox="0 0 20 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z"
                fill=""
              />
              <path
                d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.2937 19.4562 4.2937 18.9406C4.2937 18.425 4.7062 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z"
                fill=""
              />
              <path
                d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937C0.237478 7.49374 0.237478 7.49374 0.237478 7.52812L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19999 17.0125 2.16562 17.0812 2.16562H18.9375C19.35 2.16562 19.7281 1.82187 19.7281 1.37499C19.7281 0.928119 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9531 12.8219 13.5062 13.2 12.9906 13.2H3.7781L1.92185 7.56249H14.7094L14.0219 12.3062Z"
                fill=""
              />
            </svg>
          </CardData>
          {Array.isArray(salesByBranch) &&
            salesByBranch.length > 0 &&
            salesByBranch?.map((item, index) => (
              <CardData key={index} title={item?.branchName} total={item.total}>
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
                    fill=""
                  />
                  <path
                    d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
                    fill=""
                  />
                </svg>
              </CardData>
            ))}
        </div>

        <div className="p-4 mt-6">
          <ChartOne salesByBranch={salesByBranch} />
        </div>
      </main>
    </ProtectedRoute>
  );
}
