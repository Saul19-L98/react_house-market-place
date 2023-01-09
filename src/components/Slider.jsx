import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.config";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import Spinner from "./Spinner.jsx";

function Slider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchListing = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      // console.log(listings);
      setListings(listings);
      setLoading(false);
    };
    fetchListing();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>
        <SwiperComponent
          modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          style={{ height: "400px" }}
        >
          {listings.map(({ data, id }) => {
            const imgUrl = data.imageUrls[0];
            {
              /* console.log(data, imgUrl); */
            }
            return (
              <SwiperSlide
                key={id}
                onClick={() => navigate(`/category/${data.type}/${id}`)}
              >
                <div
                  style={{
                    height: "100%",
                    background: `url(${imgUrl}) no-repeat center`,
                    backgroundSize: "cover",
                  }}
                  className="swiperSlider"
                >
                  <p className="swiperSlideText">{data.name}</p>
                  <p className="swiperSlidePrice">
                    $
                    {(data.discountedPrce ?? data.regularPrice)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/, ",")}{" "}
                    {data.type === "rent" && " / month"}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </SwiperComponent>
      </>
    )
  );
}

export default Slider;
