import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";


export default function HeroSection({ onLearnMoreClick }) {
  return (
    <section className="py-2 my-3 mb-5  w-100 d-flex  align-items-center justify-content-center ">
      <div className="w-75 d-flex   align-items-center justify-content-between row hero-section">
          <div className="w-50 col-md-6 col-12 wid">
            <h1 className="fw-bold">
              Rebuild. Reuse. <span className="text-success">Revive the Planet</span> with Phoenix.
            </h1>
            <p className="text-muted my-3">
              Join our community of eco-warriors creating sustainable change through upcycling, sharing, and inspiring others.
            </p>
            <Button  className="btn-gradient me-2" onClick={onLearnMoreClick}
        >Learn More</Button>
            
            <Link to="/home" className="orangebtnWithoutBg text-decoration-none"><Button className="orangebtnWithoutBg">Get Started</Button></Link>
          </div>
          <div className="col">
            <img src="/src/assets/landingImgs/logo big (1).png" alt="Hero" className="img-fluid mt-4 biglogo" />
          </div>  
      </div>
      

    </section>
  );
}
