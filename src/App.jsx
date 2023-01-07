import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./routes/private/PrivateRoute.jsx";
import Explore from "./pages/Explore.jsx";
import Offers from "./pages/Offers.jsx";
import Category from "./pages/Category.jsx";
import Profile from "./pages/Profile.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Navbar from "./components/Navbar.jsx";
import CreateListings from "./pages/CreateListings.jsx";
import Listing from "./pages/Listing.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/create-listing" element={<CreateListings />} />
          <Route
            path="/category/:categoryName/:listingId"
            element={<Listing />}
          />
        </Routes>
        <Navbar />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
