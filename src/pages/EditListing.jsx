import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject, //TODO: Import deleteObject function from firebase/storage
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";

const accessToken = process.env.REACT_APP_POSITIONSTACK_API_KEY;

function EditListings() {
  const initialState = {
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
    latitude: 0,
    longitude: 0,
  };

  // (setted from true to fall)http:, protocal  is active in this API, so I can't  used in the server with SSL https active
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [imagesToRemove, setImagesToRemove] = useState([]); //TODO: instantiate state as an array for Images the user wants to delete

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();

  //Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You can not edit that listing");
      navigate("/profile");
    }
  }, []);

  //Fetch listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListings = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({
          ...docSnap.data(),
          address: docSnap.data().location,
          latitude: docSnap.data().geolocation.lat,
          longitude: docSnap.data().geolocation.lng,
        });
        setLoading(false);
      } else {
        navigate("/profile");
        toast.error("Listing does not exist");
      }
    };
    fetchListings();
  }, [params.listingId, navigate]);

  //Sets userRef to logged in user
  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...initialState, userRef: user.uid });
      } else {
        navigate("/sign-in");
      }
    });
    return unsubcribe;
  }, [auth, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      return;
    }
    if (images && images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }
    let geolocation = {};
    let location;
    if (geolocationEnabled) {
      const response = await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${accessToken}&query=${address}&country_module=1&limit=1`
      );
      const result = await response.json();
      geolocation.lat = result.data[0]?.latitude ?? 0;
      geolocation.lng = result.data[0]?.longitude ?? 0;
      location = result.data.length === 0 ? undefined : result.data[0]?.label;
      if (location === undefined || location.includes("undefiend")) {
        setLoading(false);
        toast.error("Please enter a correct address");
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      location = address;
    }

    //Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, "image/" + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            //console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                //console.log("Upload is paused");
                break;
              case "running":
                //console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              // resolve("File available at", downloadURL);
              resolve(downloadURL);
            });
          }
        );
      });
    };

    //TODO: Throw an error if new image Total is not 6 or less
    const availableImageStorage =
      6 - listing.imageUrls.length + imagesToRemove.length;
    // Return an error only if new  images were added AND the total files exceeds 6.
    if (images && images.length > availableImageStorage) {
      setLoading(false);
      toast.error("Image Upload failed - Too many images for this");
      return;
    }
    //TODO: If new images were uploaded, Store the returned imageUrls in a new array
    let newImageUrls;
    if (images) {
      newImageUrls = await Promise.all(
        [...images].map((image) => storeImage(image))
      ).catch(() => {
        setLoading(false);
        toast.error("Images not uploaded");
        return;
      });
    }
    //TODO: Function to Delete an Image from Storage.
    const deleteImage = async (imgUrl) => {
      //Split Url to get the filename in the middle
      let fileName = imgUrl.split("image%2F");
      fileName = fileName[1].split("?alt");
      fileName = fileName[0];
      const storage = getStorage();
      //Create a reference to the file to delete
      const imgRef = ref(storage, `image/${fileName}`);
      //Returns a promise
      return deleteObject(imgRef);
    };

    //TODO: Delete each image in imagesToRemove from storage
    imagesToRemove.forEach(async (imgUrl) => {
      await deleteImage(imgUrl) //Handle the returned promise
        .then(() => {
          toast.success("Image was successfully removed  from storage");
        })
        .catch((err) => {
          console.error(err.message);
          toast.error("Deletion failed");
          setLoading(false);
        });
    });

    //TODO: Remove all imagesToRemove from current imageUrls for this listing
    const remainingListingImages = listing.imageUrls.filter(
      (val) => !imagesToRemove.includes(val)
    );

    //TODO: Merge ImageUrls with newImageUrls (ifdefined) --> Then Delete newImageUrls
    let mergedImageUrls;
    if (newImageUrls) {
      mergedImageUrls = [...remainingListingImages, ...newImageUrls];
    } else {
      mergedImageUrls = [...remainingListingImages];
    }

    // const imageUrls = await Promise.all(
    //   [...images].map((image) => storeImage(image))
    // ).catch(() => {
    //   setLoading(false);
    //   toast.error("Images not uploaded");
    //   return;
    // });

    //Create a separate copy of the formData, then add/delete fields as needed to match collection keys.

    const formDataCopy = {
      ...formData,
      imageUrls:
        imagesToRemove.length !== 0 ? mergedImageUrls : listing.imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    delete formDataCopy.images;
    delete formDataCopy.address;
    location && (formDataCopy.location = location);
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // const docRef = await addDoc(collection(db, "listings"), formDataCopy);

    //Update Listing
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("listing saved");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);

    setLoading(false);
  };

  const onMutate = (e) => {
    e.preventDefault();
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    //Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    //Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  // TODO: handleChange on image checkboxes
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.checked) {
      // Case 1 : The user checks the box
      setImagesToRemove([...imagesToRemove, e.target.value]);
    } else {
      // Case 2  : The user unchecks the box
      setImagesToRemove((current) =>
        current.filter((url) => {
          return url !== e.target.value;
        })
      );
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <h1 className="pageHeader">Edit a Listing</h1>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
              min="1"
              max="50"
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? "formButtonActive" : "formButton"}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required
              />
            </>
          )}
          {/* <label className="formLabel">Images</label> */}
          {/* TODO: Display Current Images (Noting Cover) with Delete Buttons --> Then display "Add Image" Option */}
          <label className="formLabel">Listing Images</label>
          <p style={{ paddingLeft: "10px", fontSize: "0.8rem" }}>
            DELETE: Check the box of each image you wish to delete
          </p>
          <div className="editListingImgContainer">
            {listing?.imageUrls &&
              listing.imageUrls.map((img, index) => (
                <div
                  key={index}
                  className="editListingImg"
                  style={{
                    background: `url(${img}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                >
                  {index === 0 && <p className="editListingImgText">Cover</p>}

                  <input
                    type="checkbox"
                    id="imageDelete"
                    name="imageDelete"
                    value={img}
                    onChange={handleChange}
                  />
                </div>
              ))}
          </div>
          {/* Displays the number of remaining spots available after checked images are deleted */}
          <p style={{ paddingLeft: "10px", fontSize: "0.8rem" }}>
            ADD: Choose files to add. (
            {listing?.imageUrls &&
              imagesToRemove &&
              ` ${
                6 - listing.imageUrls.length + imagesToRemove.length
              } image slots remaining`}{" "}
            - Max 6 total )
          </p>
          {/*  */}
          {imagesToRemove.length !== 0 && (
            <input
              className="formInputFile"
              type="file"
              id="images"
              onChange={onMutate}
              min="50"
              accept=".jpg,.png,.jpeg"
              multiple
            />
          )}
          <button type="submit" className="primaryButton  createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListings;
