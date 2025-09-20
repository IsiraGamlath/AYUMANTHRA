import React, { useState } from "react";
import Nav from "../Nav/Nav";
import AddCart from "../AddCart/AddCart";
import "./Home.css"; 

function Home() {
  const [showCartPopup, setShowCartPopup] = useState(false);

  return (
    <div className="home-container">
      <Nav />

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Ayumanthra</h1>
          <p className="hero-description">
            Discover the best herbal products and manage your cart seamlessly.
          </p>
          <button 
            className="hero-button" 
            onClick={() => setShowCartPopup(true)}
          >
            Add to Cart
          </button>
        </div>
      </section>

      {/* Popup Modal for AddCart */}
      {showCartPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button 
              className="popup-close" 
              onClick={() => setShowCartPopup(false)}
            >
              ✖
            </button>
            <AddCart />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
