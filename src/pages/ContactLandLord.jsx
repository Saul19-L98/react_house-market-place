import React from "react";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";

function ContactLandLord() {
  const [message, setMessage] = useState("");
  const [landlord, setLandlord] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  useEffect(() => {
    const getLandLord = async () => {
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLandlord(docSnap.data());
      } else {
        toast.error("Could no get landlord data");
      }
    };
    getLandLord();
  }, [params.landlordId]);

  const onChange = (e) => setMessage(e.target.value);

  return (
    <div className="papeContainer">
      <header>
        <h1 className="pageHeader">Contact Landlord</h1>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label className="messageLabel">Message</label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={onChange}
              ></textarea>
              <a
                href={`mailto:${landlord.email}?Subject=${searchParams.get(
                  "listingName"
                )}&body=${message}`}
              >
                <button type="button" className="primaryButton">
                  Send Message
                </button>
              </a>
            </div>
          </form>
        </main>
      )}
    </div>
  );
}

export default ContactLandLord;
