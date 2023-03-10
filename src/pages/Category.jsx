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
import ListingItem from "../components/ListingItem.jsx";

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

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

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);

        const listings = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not find any data from storage");
      }
    };
    fetchListings();
  }, [params.categoryName]);

  const onfetchMoreListings = async () => {
    try {
      //Fet reference
      const listingsRef = collection(db, "listings");
      //Create a query
      const q = query(
        listingsRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );

      //Execute query
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);

      const listings = [];
      querySnap.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //Keep the last 10 listings and add the new  10 listings
      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error("Could not find any data from storage");
    }
  };

  return (
    <div className="category">
      <header>
        <h1 className="pageHeader">
          {params.categoryName === "rent"
            ? "Place for rent"
            : "Places for sale"}
        </h1>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing, index) => (
                <ListingItem
                  key={index}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={onfetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
}

export default Category;
