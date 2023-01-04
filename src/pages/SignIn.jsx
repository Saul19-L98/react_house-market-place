import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowRightIcon from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg?url";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import OAuth from "../components/OAuth.jsx";
import { toast } from "react-toastify";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate("/");
      }
      toast.success("Long in successful 😎");
    } catch (error) {
      toast.error("Bad user credentials 😯");
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
          <main>
            <form onSubmit={onSubmit}>
              <input
                type="email"
                className="emailInput"
                placeholder="Email"
                id="email"
                value={email}
                onChange={onChange}
              />
              <div className="passwordInputDiv">
                <input
                  type={showPassword ? "text" : "password"}
                  className="passwordInput"
                  placeholder="Password"
                  id="password"
                  value={password}
                  onChange={onChange}
                />
                <img
                  src={visibilityIcon}
                  alt="show password"
                  className="showPassword"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              </div>
              <Link to="/forget-password" className="forgotPasswordLink">
                Forgot Password
              </Link>
              <div className="signInBar">
                <p className="signInText">Sign In</p>
                <button className="signInButton">
                  <ArrowRightIcon fill="#ffffffff" width="34px" height="34px" />
                </button>
              </div>
            </form>

            <OAuth />

            <Link to="/sign-up" className="registerLink">
              Sign Up Instead
            </Link>
          </main>
        </header>
      </div>
    </>
  );
}

export default SignIn;
