// import { Link } from "react-router-dom";

// function CallToAction() {
//     return (
//         <>
//             <section className="d-flex justify-content-center flex-column align-items-center gradient p-5 text-white text-center">
//                 <h3 className="fw-bold p-2">Join the Phoenix Movement Today!</h3>
//                 <p className="p-2">Be part of a sustainable future. Rebuild, reuse, and inspire change.</p>
//                 <div>
//                     <Link to="/home" className="orangebtn px-3 py-2 rounded me-1 text-decoration-none">Sign Up Now</Link>
//                     <Link to="/home" className="btn btn-outline-light px-3 py-2 m-2 rounded text-decoration-none">Login</Link>
//                 </div>
                
//             </section>
//         </>
//     );
// }
// export default CallToAction;

import React, { useState, useEffect, useRef } from 'react';
 // Make sure to create this file for the CSS
import '../../styles/Landing/Parallax.css';
import { Link } from 'react-router-dom';
const ParallaxDivider = () => {
  // State to control the visibility/animation of the content
  const [isVisible, setIsVisible] = useState(false);
  
  // Ref to get a direct reference to the content element in the DOM
  const contentRef = useRef(null);

  useEffect(() => {
    // Function to check if the content is in the viewport
    const revealParallaxContent = () => {
      const content = contentRef.current;
      if (!content) return; // Exit if the ref hasn't been attached yet

      // Get the position of the element relative to the viewport
      const top = content.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      // The condition is the same as your original JS: 
      // when the top of the element is less than 85% of the window height
      if (top < windowHeight * 0.85) {
        setIsVisible(true);
      }
    };

    // Attach the scroll listener
    window.addEventListener('scroll', revealParallaxContent);
    
    // Call it once on mount to check if it's already visible
    revealParallaxContent(); 

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', revealParallaxContent);
    };
  }, []); // Empty dependency array means this runs only on mount and unmount

  return (
    <div className="parallax-divider">
      {/* Overlay is a styling layer */}
      <div className="overlay">
        {/* The content container */}
        <div 
          ref={contentRef} // Attach the ref here
          className={`parallax-content ${isVisible ? 'visible' : ''} container`} 
          // The 'visible' class is conditionally added based on state
        >
          <h2>Join the Phoenix Movement Today!</h2>
          <p>Be part of a sustainable future. Rebuild, reuse, and inspire change.</p>
          <Link to="/home" className="greenBtn px-3 py-2 rounded me-1 text-decoration-none">Sign Up Now</Link>
        </div>
      </div>
    </div>
  );
};

export default ParallaxDivider;