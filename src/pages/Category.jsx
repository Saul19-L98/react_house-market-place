import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner.jsx";

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  useEffect(() => {
    const fetchListings = async () => {
      try {
        //Fet reference
        const listingsRef = collection(db, "listings");
        //Create a query
        const q = query(
          listingsRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        //Execute query
        const querySnap = await getDocs(q);
        console.log(querySnap);
        let listings = [];
        querySnap.forEach((doc) => {
          console.log(doc.data());
        });
      } catch (error) {
        console.log(error);
        toast.error("Could not find any data from storage");
      }
    };
    fetchListings();
  }, []);
  return (
    <div>
      <h1>Hello from Categories</h1>
    </div>
  );
}

export default Category;
