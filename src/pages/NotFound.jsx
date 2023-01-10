import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div>
      <div>
        <div>
          <h1 style={{ textAlign: "center", fontSize: "6rem" }}>Oops!</h1>
          <p style={{ textAlign: "center" }}>404 - Page not found!</p>
          <Link to="/" style={{ textAlign: "center" }}>
            👉 Back To Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
