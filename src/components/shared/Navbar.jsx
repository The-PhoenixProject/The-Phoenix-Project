// import React from "react";
// import { Navbar, Nav, Container, Button } from "react-bootstrap";
// import { Link, useLocation } from "react-router-dom";


// export default function CustomNavbar() {
//   const { pathname } = useLocation();

//   const landingLinks = [
//     { name: "Home", path: "/" },
//     { name: "Features", path: "#features" },
//     { name: "Products", path: "#products" },
//     { name: "About", path: "#about" },
//     { name: "Reviews", path: "#reviews" },
//     { name: "Contact", path: "#contact" },
//   ];

//   const homeLinks = [
//     { name: "Feed", path: "/home" },
//     { name: "Profile", path: "/profile" },
//     { name: "Settings", path: "/settings" },
//   ];

//   const links = pathname === "/" ? landingLinks : homeLinks;

//   return (
//     <Navbar expand="lg"  className="shadow py-1 gradient" >
//       <Container>
//         <div>
//           <img src="/src/assets/landingImgs/logo-icon.png" alt="Phoenix Logo"  width="60" className="me-2" />
//         <Navbar.Brand as={Link} to="/" className="fw-bold  ">
//           Phoenix
//         </Navbar.Brand>
//         </div>
        
//         <Navbar.Toggle aria-controls="main-navbar" />
//         <Navbar.Collapse id="main-navbar">
//           <Nav className="ms-auto me-4">
//             {links.map((link) => (
//               <Nav.Link
//                 as={Link}
//                 to={link.path}
//                 key={link.name}
//                 className="mx-1 fw-medium text-white linksHover"
//               >
//                 {link.name}
//               </Nav.Link>
//             ))}
//           </Nav>
//           {pathname === "/" && (
//             <Button as={Link} to="/home"  variant="outline-light">
//               Sign In
//             </Button>
//           )}
//           {pathname === "/" && (
//             <Button as={Link} to="/home" className="ms-2 orangebtn"  >
//               Sign up
//             </Button>
//           )}
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// }


import React from "react";
import { Navbar, Nav, Container, Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { FaShop , FaBell } from "react-icons/fa6";
import { IoChatbubbleSharp } from "react-icons/io5";
import { GrVmMaintenance } from "react-icons/gr";
import { MdContactSupport } from "react-icons/md";
const logoIcon = "/public/assets/landingImgs/phoenix-removebg-preview.png";

export default function CustomNavbar() {
    const { pathname } = useLocation();
    
    // Original Landing Links (Requirement 1: Unchanged)
    const landingLinks = [
        { name: "Home", path: "/" },
        { name: "Features", path: "#features" },
        { name: "Products", path: "#products" },
        { name: "About", path: "#about" },
        { name: "Reviews", path: "#reviews" },
        { name: "Contact", path: "/contact" },
    ];

    // Links for the Maintenance Component (New State)
    const maintenanceLinks = [
        { name: "Dashboard", path: "/maintenance/dashboard" },
        { name: "Tickets", path: "/maintenance/tickets" },
        { name: "Reports", path: "/maintenance/reports" },
    ];

    // Icon Links for Home/Internal Pages (Based on the image)
    const iconLinks = [
        // Using inline SVGs
        { name: "Feed", path: "/home", icon: <IoMdHome /> },
        { name: "Explore Services", path: "/explore-services", icon: <FaShop /> },
        { name: "Messages", path: "/chat", icon: <IoChatbubbleSharp /> },
        { name: "Maintenance", path: "/maintenance", icon: <GrVmMaintenance /> },
        { name: "ContactSupport", path: "/contact", icon: <MdContactSupport /> },
    ];

    // --- Profile Avatar JSX (Reusable Block) ---
    const ProfileAvatarJSX = (
        <Nav.Link as={Link} to="/profile" className="d-flex align-items-center p-0 ms-2" title="Profile">
            <img
                src="https://placehold.co/36x36/FF9800/ffffff?text=U"
                alt="User Avatar"
                className="rounded-circle shadow-sm"
                style={{ objectFit: 'cover' }}
            />
        </Nav.Link>
    );

    // --- Determine the current layout state ---
    const isLandingPage = pathname === "/";
    // const isMaintenancePage = pathname.startsWith("/maintenance");
    const displaySearchBar = pathname === "/home";
    // Icon navigation is displayed on ALL internal app pages (excluding landing and maintenance)
    const displayIconNav = !isLandingPage ;


    // --- Content for Internal App pages (Icons + Conditional Search Bar) ---
    const InternalAppContent = (
        <>
            {/* Search Bar - ONLY visible on /home */}
            {displaySearchBar && (
                <Form className="d-flex mx-auto w-100 me-lg-4 order-lg-2 my-2 my-lg-0" style={{ maxWidth: '500px' }}>
                    <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                        <InputGroup.Text id="search-icon" className="bg-white border-0 py-2">
                            {/* Search Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.098zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </InputGroup.Text>
                        <FormControl
                            type="search"
                            placeholder="Search users, products, or posts..."
                            aria-label="Search"
                            className="border-0 py-2"
                        />
                    </InputGroup>
                </Form>
            )}

            {/* Icon Links and Profile Avatar - Always visible on internal pages */}
            <Nav className="d-flex flex-row justify-content-center align-items-center ms-auto order-lg-3 gap-lg-1 ">
                {iconLinks.map((link) => (
                    <Nav.Link as={Link} to={link.path} key={link.name} className="navLinks p-2 " title={link.name}>
                        {/* Icon display */}
                        <span className="fs-4 linksHover">{link.icon}</span>
                    </Nav.Link>
                ))}
                
                {/* Profile Avatar: Use reusable block */}
                {ProfileAvatarJSX}
            </Nav>
        </>
    );

    // --- Content for Landing and Maintenance pages (Standard Links + Buttons) ---
    
    let navLinks = isLandingPage ? landingLinks : maintenanceLinks;
    let buttonContent = null;

    if (isLandingPage) {
        buttonContent = (
            <>
                <Button as={Link} to="/home" className="ms-2 greenBtn">
                    Sign In
                </Button>
                {/* Placeholder style for the user's '.orangebtn' class */}
                <Button as={Link} to="/home" className="ms-2 greenBtnWithoutBg"  >
                    Sign up
                </Button>
            </>
        );
      }
    
    // Handle anchor link clicks for smooth scrolling
    const handleAnchorClick = (e, path) => {
        if (path.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(path);
            if (element) {
                const yOffset = -80; // Offset for navbar
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    // NonHomeContent structure is different for landing vs maintenance
    const NonHomeContent = (
        <div className="d-flex flex-column flex-lg-row w-100 justify-content-end align-items-lg-center ">
             <Nav className="me-lg-4 d-flex justify-content-start align-items-start">
                {navLinks.map((link) => {
                    // For anchor links, use regular anchor tag; for routes, use Link
                    if (link.path.startsWith('#')) {
                        return (
                            <Nav.Link
                                href={link.path}
                                onClick={(e) => handleAnchorClick(e, link.path)}
                                key={link.name}
                                className="mx-1 fw-medium linksHover"
                                
                            >
                                {link.name}
                            </Nav.Link>
                        );
                    }
                    return (
                        <Nav.Link
                            as={Link}
                            to={link.path}
                            key={link.name}
                            className="mx-1 fw-medium linksHover navLinks"
                            
                        >
                            {link.name}
                        </Nav.Link>
                    );
                })}
            </Nav>
            
            <div > 
              {buttonContent}
            </div>
            
        </div>
    );

    return (
        <Navbar expand="lg" className=" py-1  nav-bg">
            <Container fluid className="px-3 px-lg-5">
                {/* Brand/Logo Section */}
                <div className="d-flex align-items-center">
                    <img src={logoIcon} alt="Phoenix Logo" width="80" className="me-1" />
                    <Navbar.Brand as={Link} to="/" className="fw-bold  fs-4 logo-text">
                        Phoenix
                    </Navbar.Brand>
                </div>

                <Navbar.Toggle aria-controls="main-navbar" />

                <Navbar.Collapse id="main-navbar" className={displayIconNav ? 'justify-content-between' : 'justify-content-end'}>
                    {displayIconNav ? InternalAppContent : NonHomeContent}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}