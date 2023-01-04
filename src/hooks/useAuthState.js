import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useAuthState = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    // FIXED: use the unsubscribe returned from onAuthStateChanged for cleanup
    const unsubcribe = onAuthStateChanged(auth, (user) => {
      if (user) setLoggedIn(true);
      setCheckingStatus(false);
    });
    return unsubcribe;
  }, []);
  return { loggedIn, checkingStatus };
};
