// import React,{useState} from "react";
// import HeroSection from "../components/landing/HeroSection";
// import AboutSection from "../components/landing/AboutSection";
// import Footer from "../components/shared/Footer";
// import LearnMore from "../components/landing/LearnMore";
// import FeaturesSection from "../components/landing/FeaturesSection";
// import MarketPlace from "../components/landing/MarketPlaceSection";
// import Testimonials from "../components/landing/TestimonialsSection";
// import CallToAction from "../components/landing/CallToActionSection";
// export default function LandingPage() {
//   const [showPopup, setShowPopup] = useState(false);
//   return (
//     <>
//       <div>
//       <HeroSection onLearnMoreClick={() => setShowPopup(true)} />
//       {/* Show the popup globally over the page */}
//       {showPopup && <LearnMore onClose={() => setShowPopup(false)} />}
//       </div>

//       <AboutSection />
//       <FeaturesSection />
//       <MarketPlace />
//       <Testimonials />
//       <CallToAction />
//       <Footer />
//     </>
//   );
// }

import React,{useState} from "react";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import LearnMore from "../components/landing/LearnMore";
import FeaturesSection from "../components/landing/FeaturesSection";
import MarketPlace from "../components/landing/MarketPlaceSection";
import Testimonials from "../components/landing/TestimonialsSection";
import CallToAction from "../components/landing/CallToActionSection";
// <<<<<<< HEAD
// import ParallaxDivider from "../components/landing/CallToActionSection";
// =======
import ParallaxDivider from "../components/landing/ParallaxDivider";

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <>
      <div>
      <HeroSection onLearnMoreClick={() => setShowPopup(true)} />
      {/* Show the popup globally over the page */}
      {showPopup && <LearnMore onClose={() => setShowPopup(false)} />}
      </div>

      <ParallaxDivider />
      <AboutSection />
      <FeaturesSection />
      <MarketPlace />
      <Testimonials />
      {/* <CallToAction /> */}
    </>
  );
}
