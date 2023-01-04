import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "../../hooks/useAuthState";
import Spinner from "../../components/Spinner.jsx";

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthState();
  if (checkingStatus) return <Spinner />;
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
