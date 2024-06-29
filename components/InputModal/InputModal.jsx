// components/ModalComponent.js
import React, { useEffect, useState } from "react";
import InputField from "../InputField/InputField";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase.config";

export default function InputModal({
  date,
  onClose,
  isOpen: modal,
  salesData,
  setOptions,
  options,
}) {
  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [totalSale, setTotalSale] = useState("");
  const [branch, setBranch] = useState("");
  
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingSaleId, setExistingSaleId] = useState(null);

  

  

  useEffect(() => {
    if (salesData.length > 0) {
      const sale = salesData.find((s) => s.branchId === selectedOption);
      if (sale) {
        setCash(sale.cash);
        setCard(sale.card);
        setTotalSale(sale.totalSale);
        // setBranch(sale.branch.branchName);
        setExistingSaleId(sale.id);
      } else {
        setCash("");
        setCard("");
        setTotalSale("");
        // setBranch("");
        setExistingSaleId(null);
      }
    }
  }, [salesData, selectedOption]);

  const handleCashChange = (e) => {
    const value = e.target.value;
    if (value < 0) {
      setError("Cash value cannot be negative");
    } else {
      setError("");
      setCash(value);
      setTotalSale(Number(value) + Number(card));
    }
  };

  const handleCardChange = (e) => {
    const value = e.target.value;
    if (value < 0) {
      setError("Card value cannot be negative");
    } else {
      setError("");
      setCard(value);
      setTotalSale(Number(cash) + Number(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption || !cash || !card) {
      setError("All fields are required");
      return;
    }
    if (cash < 0 || card < 0) {
      setError("Values cannot be negative");
      return;
    }

    setLoading(true);
    const branchData = options?.find((option) => option.id === selectedOption);

    try {
      if (existingSaleId) {
        // Update existing sale
        const saleDoc = doc(db, "sales", existingSaleId);
        await updateDoc(saleDoc, {
          cash,
          card,
          totalSale,
          branchId: branchData.id,
        });
      } else {
        // Add new sale
        await addDoc(collection(db, "sales"), {
          date: date.toISOString(),
          cash,
          card,
          totalSale,
          branchId: branchData.id,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Error saving data");
    }
    setLoading(false);
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        modal ? "block" : "hidden"
      }`}
    >
      <div className="w-full max-w-142.5 rounded-lg bg-white px-8 py-12 dark:bg-boxdark md:px-17.5 md:py-15">
        <h2 className="text-xl mb-4 text-center ">
          Sales for {date.toDateString()}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="w-full mb-3">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Branch
              <span className="text-meta-1">*</span>
            </label>

            <div className="relative z-20 bg-transparent dark:bg-form-input">
              <select
                value={selectedOption}
                onChange={(e) => {
                  setError(false);
                  setSelectedOption(e.target.value);
                  setIsOptionSelected(true);
                }}
                className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                  isOptionSelected ? "text-black dark:text-white" : ""
                }`}
              >
                <option
                  value=""
                  disabled
                  className="text-body dark:text-bodydark"
                >
                  Select Branch
                </option>
                {Array.isArray(options) &&
                  options.map((option) => (
                    <option
                      key={option}
                      value={option.id}
                      className="text-body dark:text-bodydark"
                    >
                      {option.branchName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <InputField
            label="Cash"
            value={cash}
            onChange={handleCashChange}
            placeholder="Enter Cash Sale"
            type="number"
            style="mb-4.5"
          />
          <InputField
            label="Card"
            value={card}
            onChange={handleCardChange}
            placeholder="Enter Card Sale"
            type="number"
            style="mb-4.5"
          />
          <InputField
            disabled={true}
            label="Total Sale"
            value={totalSale}
            type="number"
            style="mb-4.5"
          />

          {error && <div className="mb-4 text-center text-meta-1">{error}</div>}

          <div className="-mx-3 flex flex-wrap gap-y-4 mt-10">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={onClose}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition  hover:bg-primary hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white  dark:hover:bg-primary"
              >
                Close
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                type="submit"
                className="block w-full rounded border bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
              >
                {"Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
