// CustomNavbar.jsx
import React from 'react';
import {
  Navbar,
  Nav,
  Container,
  Button,
  Form,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { IoMdHome } from 'react-icons/io';
import { FaShop, FaBell } from 'react-icons/fa6';
import { IoChatbubbleSharp } from 'react-icons/io5';
import { GrVmMaintenance } from 'react-icons/gr';
import { MdContactSupport } from 'react-icons/md';
// ✅ استيراد Context
import { useUser } from '../../context/UserContext';

const logoIcon = '/public/assets/landingImgs/phoenix-removebg-preview.png';

export default function CustomNavbar() {
  const { pathname } = useLocation();
  // ✅ استخدام Context
  const { userProfileData } = useUser();

  // --- 1. User Profile Image Source (THE CRITICAL CHANGE) ---
  // ✅ استخدام الصورة من Context بدلاً من القيمة الثابتة
  const userProfileImage = userProfileData.profileImage;

  // Define Paths for Pages that should HIDE the Navbar
  const NO_NAVBAR_PATHS = [
    '/login',
    '/signup',
    '/auth/signup',
    '/auth/login',
    '/otp-verification',
    '/forgot-password',
    '/reset-password',
  ];

  // Check if the current path is one where the Navbar should be hidden
  const shouldHideNavbar = NO_NAVBAR_PATHS.includes(pathname);

  // If on a hidden path, return null
  if (shouldHideNavbar) {
    return null;
  }
  // -----------------------------------------------------------

  // Original Landing Links (Unchanged)
  const landingLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '#features' },
    { name: 'Products', path: '#products' },
    { name: 'About', path: '#about' },
    { name: 'Reviews', path: '#reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  // Links for the Maintenance Component (Unchanged)
  const maintenanceLinks = [{ name: 'Home', path: '/home' }];

  // Icon Links for Home/Internal Pages (Unchanged)
  const iconLinks = [
    { name: 'Feed', path: '/home', icon: <IoMdHome /> },
    { name: 'Explore Services', path: '/explore-services', icon: <FaShop /> },
    { name: 'Messages', path: '/chat', icon: <IoChatbubbleSharp /> },
    { name: 'Maintenance', path: '/maintenance', icon: <GrVmMaintenance /> },
    { name: 'ContactSupport', path: '/contact', icon: <MdContactSupport /> },
  ];

  // --- Profile Avatar JSX (Modified Block) ---
  const ProfileAvatarJSX = (
    <Nav.Link
      as={Link}
      to="/profile"
      className="d-flex align-items-center p-0 ms-2"
      title="Profile"
    >
      <img
        // 💡 UPDATED: الآن تستخدم الصورة المحدثة من Context
        src={userProfileImage}
        alt="User Profile" // Changed alt text for better context
        className="rounded-circle shadow-sm"
        // The size should match the old placeholder size (36x36)
        style={{ objectFit: 'cover', width: '36px', height: '36px' }}
      />
    </Nav.Link>
  );
  // --- End of Modified Block ---

  // --- Determine the current layout state (Unchanged) ---
  const isLandingPage = pathname === '/';
  const isMaintenancePage = pathname.startsWith('/maintenance');
  const displaySearchBar = pathname === '/home';
  const displayIconNav = !isLandingPage && !isMaintenancePage;

  // --- Content for Internal App pages (Icons + Conditional Search Bar) ---
  const InternalAppContent = (
    <>
      {/* Search Bar - ONLY visible on /home (Unchanged) */}
      {displaySearchBar && (
        <Form
          className="d-flex mx-auto w-100 me-lg-4 order-lg-2 my-lg-0"
          style={{ maxWidth: '500px' }}
        >
          <InputGroup className="rounded-pill overflow-hidden shadow-sm">
            <InputGroup.Text
              id="search-icon"
              className="bg-white border-0 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="gray"
                viewBox="0 0 16 16"
              >
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

      {/* Icon Links and Profile Avatar (Unchanged) */}
      <Nav className="d-flex flex-row justify-content-center align-items-center ms-auto order-lg-3 gap-lg-1 ">
        <Nav.Link
          as={Link}
          to="/notifications"
          key="Notifications"
          className="navLinks p-2 "
          title="Notifications"
        >
          <span className="fs-4 linksHover">
            <FaBell />
          </span>
        </Nav.Link>
        {iconLinks.map((link) => (
          <Nav.Link
            as={Link}
            to={link.path}
            key={link.name}
            className="navLinks p-2 "
            title={link.name}
          >
            <span className="fs-4 linksHover">{link.icon}</span>
          </Nav.Link>
        ))}

        {/* Profile Avatar: Uses the modified reusable block */}
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
        <Button as={Link} to="/login" className="ms-2 greenBtn">
          Sign In
        </Button>
        <Button as={Link} to="/signup" className="ms-2 greenBtnWithoutBg">
          Sign up
        </Button>
      </>
    );
  }

  // Handle anchor link clicks for smooth scrolling (Unchanged)
  const handleAnchorClick = (e, path) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(path);
      if (element) {
        const yOffset = -80; // Offset for navbar
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  // NonHomeContent structure (Unchanged)
  const NonHomeContent = (
    <div className="d-flex flex-column flex-lg-row w-100 justify-content-end align-items-lg-center ">
      <Nav className="me-lg-4 d-flex justify-content-start align-items-start">
        {navLinks.map((link) => {
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

      <div>{buttonContent}</div>
    </div>
  );

  return (
    <Navbar expand="lg" className=" p-0  nav-bg">
      <Container fluid className="px-3 px-lg-5">
        {/* Brand/Logo Section */}
        <div className="d-flex align-items-center">
          <img src={logoIcon} alt="Phoenix Logo" width="80" className="me-1" />
          <Navbar.Brand
            as={Link}
            to="/home"
            className="fw-bold  fs-4 logo-text"
          >
            Phoenix
          </Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse
          id="main-navbar"
          className={
            displayIconNav ? 'justify-content-between' : 'justify-content-end'
          }
        >
          {displayIconNav ? InternalAppContent : NonHomeContent}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
