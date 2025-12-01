import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
const logoBig = '/public/assets/landingImgs/phoenix-removebg-preview.png';


export default function HeroSection({ onLearnMoreClick }) {
  return (
    <section className="  mb-5  w-100 d-flex  align-items-center justify-content-center py-4">
      <div className="w-75 d-flex   align-items-center justify-content-between row hero-section">
          <div className="w-50 col-md-6 col-12 wid">
            <h1 >
              Rebuild. Reuse. the Planet with Phoenix.
            </h1>
            <p className="text-muted my-3">
              Join our community of eco-warriors creating sustainable change through upcycling, sharing, and inspiring others.
            </p>
            <Button  className="greenBtn me-2" onClick={onLearnMoreClick}
        >Learn More</Button>
            
            <Button as={Link} to="/home" className="greenBtnWithoutBg">Get Started</Button>
          </div>
          <div className="col">
            <img src={logoBig} alt="Hero" className="img-fluid mt-4 biglogo" />
          </div>  
      </div>
      

    </section>
  );
}
