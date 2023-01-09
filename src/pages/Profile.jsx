import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
////////////////////////////////////////////////////////////////
//To delete storage
import { getStorage, ref, deleteObject } from "firebase/storage";
////////////////////////////////////////////////////////////////
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ListingItem from "../components/ListingItem.jsx";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg?url";
import homeIcon from "../assets/svg/homeIcon.svg?url";

function Profile() {
  const auth = getAuth();
  const storage = getStorage();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
  const navigate = useNavigate();

  const fetchUserListings = async () => {
    try {
      const listingsRef = collection(db, "listings");
      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings(listings);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(`Could not fetch listings ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUserListings();
  }, [auth.currentUser.uid]);

  const onLogOut = () => {
    auth.signOut();
    navigate("/");
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        //Update display name in firebase
        await updateProfile(auth.currentUser, { displayName: name });
        //Update in firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
      if (auth.currentUser.email !== email) {
        await updateEmail(auth.currentUser, email);
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          email,
        });
      }
      toast.success("Profile updated");
    } catch (error) {
      console.log(error);
      toast.error("Could not update profile details");
    }
  };

  const onChange = (e) => {
    e.preventDefault();
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (listingId) => {
    try {
      if (window.confirm("Are you sure you want to delete ?")) {
        // Delete firestore record
        await deleteDoc(doc(db, "listings", listingId));

        // Delete pictures from firebase filestorage
        const imagesToDelete = listings.filter(
          (listing) => listing.id === listingId
        );
        const imagesArray = imagesToDelete[0].data.imageUrls;

        imagesArray.forEach((urlToDelete) => {
          //Get the filename from the upload URL
          let fileName = urlToDelete
            .split("/")
            .pop()
            .split("#")[0]
            .split("?")[0];
          // Replace "%2F" in the URL with "/"
          fileName = fileName.replace("%2F", "/");

          const imageToDeleteRef = ref(storage, `${fileName}`);

          //Delete the file
          deleteObject(imageToDeleteRef);
          // .then(() => {
          //   // You can comment this out in production. :)
          //   toast.success("Images deleted");
          // })
          // .catch((error) => {
          //   toast.error(`Failed to delete image: ${error.message}`);
          // });
        });
        // show newest state after delete
        const updatedListings = listings.filter(
          (listing) => listing.id !== listingId
        );
        setListings(updatedListings);
        toast.success("Successfuly deleted listing and images from storage");
      }
    } catch (err) {
      console.error(err.message);
      toast.error(`Failed to delete posted house 🏡`);
    }
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogOut}>
          LogOut
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="email"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
