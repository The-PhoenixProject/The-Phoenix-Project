import React,{useState} from "react";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import Footer from "../components/shared/Footer";
import LearnMore from "../components/landing/LearnMore";
import FeaturesSection from "../components/landing/FeaturesSection";
import MarketPlace from "../components/landing/MarketPlaceSection";
import Testimonials from "../components/landing/TestimonialsSection";
export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <>
      <div>
      <HeroSection onLearnMoreClick={() => setShowPopup(true)} />
      {/* Show the popup globally over the page */}
      {showPopup && <LearnMore onClose={() => setShowPopup(false)} />}
      </div>

      <AboutSection />
      <FeaturesSection />
      <MarketPlace />
      <Testimonials />
      <Footer />
    </>
  );
}
