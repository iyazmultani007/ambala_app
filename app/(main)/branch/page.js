"use client";

import AddButton from "@/components/AddButton/AddButton";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumbs";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import SearchInput from "@/components/SearchInput/SearchInput";
import Table from "@/components/Table/Table";
import { db } from "@/utils/firebase.config";
import {
  collection,
  endBefore,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

function BranchPage() {
  const [data, setData] = useState([]);
  const [lastItem, setLastItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const col = collection(db, "branches");

  

  const fetchData = async (isNext = true) => {
    setLoading(true);
    try {
      const q = query(
        col,
        orderBy("branchName"),
        lastItem
          ? isNext
            ? startAfter(lastItem)
            : endBefore(lastItem)
          : limit(pageSize),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(q);
      const count = await getCountFromServer(col);

      const newData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newLastItem =
        querySnapshot.docs[querySnapshot.docs.length - 1] || lastItem;
      const newTotalPages = Math.ceil(count.data().count / pageSize);

      setData([...data, ...newData]);
      setLastItem(newLastItem);
      setTotalPages(newTotalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [pageSize]);

  const handleLoadMore = () => {
    fetchData();
    setCurrentPage(currentPage + 1);
  };

  return (
    <ProtectedRoute>
      <Breadcrumb pageName="Branch" />

      <div>
        <div className="md:flex md:justify-end">
          
          <AddButton title="Add Branch" link="/branch/add" />
        </div>

        <Table
          type="branch"
          data={data}
          setData={setData}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          handleLoadMore={handleLoadMore}
          setPageSize={setPageSize}
        />
      </div>
    </ ProtectedRoute>
  );
}

export default BranchPage;
