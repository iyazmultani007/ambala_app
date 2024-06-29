"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumbs";
import InputField from "@/components/InputField/InputField";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { db } from "@/utils/firebase.config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function BranchSlug() {
  const router = useRouter();
  const params = useParams();

  const [branchData, setBranchData] = useState({
    branchName: "",
    address: "",
    postCode: "",
    city: "",
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    if (params.slug !== "add") {
      const ref = doc(db, "branches", params.slug);
      const snapshot = await getDoc(ref);
      setBranchData({ ...snapshot.data() });
    }
  };

  useEffect(() => {
    getData();
  }, [params.slug]);

  const handleInputChange = (key) => (e) => {
    if (key === "branchName") {
      setError(false);
    }
    setBranchData({
      ...branchData,
      [key]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (branchData.branchName === "") {
      return setError(true);
    }

    setLoading(true);
    const col = collection(db, "branches");

    try {
      const docRef = await addDoc(col, {
        ...branchData,
        timestamp: serverTimestamp(),
      });

      if (docRef) {
        router.push("/branch");
      } else {
        console.log("error");
      }
    } catch (error) {
      throw error;
    }
    setLoading(false);
  };

  const handleUpdate = () => {
    if (branchData.branchName === "") {
      return setError(true);
    }
    setLoading(true);

    const ref = doc(db, "branches", params.slug);
    setDoc(ref, {
        ...branchData,
        timestamp: serverTimestamp(),
    })
      .then(() => {
        router.push("/branch");
      })
      .catch((error) => {
        throw error;
      });
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Breadcrumb
        pageName={params.slug === "add" ? "Add Branch" : "Edit Branch"}
      />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-6.5">
          <InputField
            label="Branch Name"
            value={branchData.branchName}
            onChange={handleInputChange("branchName")}
            placeholder="Enter Branch Name"
            type="text"
            style="mb-4.5"
            required={true}
            error={error}
          />

          <InputField
            label="Address"
            value={branchData.address}
            onChange={handleInputChange("address")}
            placeholder="Enter Address"
            type="text"
            style="mb-4.5"
          />

          <InputField
            label="Post Code"
            value={branchData.postCode}
            onChange={handleInputChange("postCode")}
            placeholder="Enter Post Code"
            type="text"
            style="mb-4.5"
          />

          <InputField
            label="City"
            value={branchData.city}
            onChange={handleInputChange("city")}
            placeholder="Enter City"
            type="text"
            style="mb-4.5"
          />

          <div className="flex justify-between">
            <button
              className="flex justify-center rounded bg-black p-3 font-medium text-gray hover:bg-opacity-90 gap-1"
              onClick={() => router.push("/branch")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Cancel
            </button>
            <button
              className="flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 gap-1"
              disabled={loading}
              onClick={() => {
                if (params.slug === "add") {
                  handleSubmit();
                } else {
                  handleUpdate();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6 "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </ ProtectedRoute>
  );
}

export default BranchSlug;
