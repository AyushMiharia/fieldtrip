import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span>⛰ FieldTrip</span>
          <span className="footer-tagline">Plan Less. Explore More.</span>
        </div>
        <div className="footer-info">
          <p>Built by Ayush Miharia &amp; Siddharth Agarwal</p>
          <p>CS-5610 Web Development &middot; MIT License</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
