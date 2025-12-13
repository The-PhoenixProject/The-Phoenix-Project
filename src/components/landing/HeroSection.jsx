import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
const logoBig = '/assets/landingImgs/phoenix-removebg-preview.png';


export default function HeroSection({ onLearnMoreClick }) {
  return (
    <section className="  mb-5  w-100 d-flex  align-items-center justify-content-center py-4">
      <div className="w-100 d-flex flex-row align-items-center hero-section" style={{ gap: '2rem' }}>
          <div className="w-50 col-md-6 col-12 wid">
            <h1 className="hero-title">
              Rebuild. Reuse. the Planet with Phoenix.
            </h1>
            <p className="text-muted my-3" style={{ width: "100%" , maxWidth: "100%" }}>
              Join our community of eco-warriors creating sustainable change through upcycling, sharing, and inspiring others.
            </p>
            <Button  className="greenBtn me-2" onClick={onLearnMoreClick}
        >Learn More</Button>
            
            <Button as={Link} to="/login" className="greenBtnWithoutBg">Get Started</Button>
          </div>
          <div className="col d-flex justify-content-end">
            <img src={logoBig} alt="Hero" className="img-fluid mt-4 biglogo" />
          </div>  
      </div>
      

    </section>
  );
}
