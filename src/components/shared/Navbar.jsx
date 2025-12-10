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


// import React from "react";
// import { Navbar, Nav, Container, Button, Form, FormControl, InputGroup, NavDropdown } from "react-bootstrap";
// import { Link, useLocation } from "react-router-dom";
// import { IoMdHome } from "react-icons/io";
// import { FaShop , FaBell } from "react-icons/fa6";
// import { IoChatbubbleSharp } from "react-icons/io5";
// import { GrVmMaintenance } from "react-icons/gr";
// import { MdContactSupport } from "react-icons/md";
// const logoIcon = "/assets/landingImgs/logo-icon.png";

// export default function CustomNavbar() {
//     const { pathname } = useLocation();
    
//     // Original Landing Links (Requirement 1: Unchanged)
//     const landingLinks = [
//         { name: "Home", path: "/" },
//         { name: "Features", path: "#features" },
//         { name: "Products", path: "#products" },
//         { name: "About", path: "#about" },
//         { name: "Reviews", path: "#reviews" },
//         { name: "Contact", path: "/contact" },
//     ];

//     // Links for the Maintenance Component (New State)
//     const maintenanceLinks = [
//         { name: "Dashboard", path: "/maintenance/dashboard" },
//         { name: "Tickets", path: "/maintenance/tickets" },
//         { name: "Reports", path: "/maintenance/reports" },
//     ];

//     // Icon Links for Home/Internal Pages (Based on the image)
//     const iconLinks = [
//         // Using inline SVGs
//         { name: "Feed", path: "/home", icon: <IoMdHome /> },
//         { name: "Marketplace", path: "/marketplace", icon: <FaShop /> },
//         { name: "Messages", path: "/chat", icon: <IoChatbubbleSharp /> },
//         { name: "Maintenance", path: "/maintenance", icon: <GrVmMaintenance /> },
//         { name: "Services", path: "/explore-services", icon: <MdContactSupport /> },
//     ];

//     // --- Profile Avatar JSX (Reusable Block) ---
//     const ProfileAvatarJSX = (
//         <Nav.Link as={Link} to="/profile" className="d-flex align-items-center p-0 ms-2" title="Profile">
//             <img
//                 src="https://placehold.co/36x36/FF9800/ffffff?text=U"
//                 alt="User Avatar"
//                 className="rounded-circle shadow-sm"
//                 style={{ objectFit: 'cover' }}
//             />
//         </Nav.Link>
//     );

//     // --- Determine the current layout state ---
//     const isLandingPage = pathname === "/";
//     // const isMaintenancePage = pathname.startsWith("/maintenance");
//     const displaySearchBar = pathname === "/home";
//     // Icon navigation is displayed on ALL internal app pages (excluding landing and maintenance)
//     const displayIconNav = !isLandingPage ;


//     // --- Content for Internal App pages (Icons + Conditional Search Bar) ---
//     const InternalAppContent = (
//         <>
//             {/* Search Bar - ONLY visible on /home */}
//             {displaySearchBar && (
//                 <Form className="d-flex mx-auto w-100 me-lg-4 order-lg-2 my-2 my-lg-0" style={{ maxWidth: '500px' }}>
//                     <InputGroup className="rounded-pill overflow-hidden shadow-sm">
//                         <InputGroup.Text id="search-icon" className="bg-white border-0 py-2">
//                             {/* Search Icon */}
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" viewBox="0 0 16 16">
//                                 <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.098zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
//                             </svg>
//                         </InputGroup.Text>
//                         <FormControl
//                             type="search"
//                             placeholder="Search users, products, or posts..."
//                             aria-label="Search"
//                             className="border-0 py-2"
//                         />
//                     </InputGroup>
//                 </Form>
//             )}

//             {/* Icon Links and Profile Avatar - Always visible on internal pages */}
//             <Nav className="d-flex flex-row justify-content-center align-items-center ms-auto order-lg-3 gap-lg-1 ">
//                 {iconLinks.map((link) => (
//                     <Nav.Link as={Link} to={link.path} key={link.name} className="text-white p-2 " title={link.name}>
//                         {/* Icon display */}
//                         <span className="fs-4 linksHover">{link.icon}</span>
//                     </Nav.Link>
//                 ))}

//                 {/* Quick Links Dropdown */}
//                 <NavDropdown 
//                     title="📋" 
//                     id="quick-links-dropdown"
//                     className="text-white ms-2"
//                     align="end"
//                 >
//                     <h6 className="dropdown-header">Maintenance Hub</h6>
//                     <NavDropdown.Item as={Link} to="/maintenance">Dashboard</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/my-maintenance-requests">My Requests</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/my-services">My Services</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/explore-services">Browse Services</NavDropdown.Item>
//                     <NavDropdown.Divider />
//                     <h6 className="dropdown-header">Quick Access</h6>
//                     <NavDropdown.Item as={Link} to="/saved-posts">Saved Posts</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/marketplace">Marketplace</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/wishlist">Wishlist</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/notifications">Notifications</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
//                 </NavDropdown>
                
//                 {/* Profile Avatar: Use reusable block */}
//                 {ProfileAvatarJSX}
//             </Nav>
//         </>
//     );

//     // --- Content for Landing and Maintenance pages (Standard Links + Buttons) ---
    
//     let navLinks = isLandingPage ? landingLinks : maintenanceLinks;
//     let buttonContent = null;

//     if (isLandingPage) {
//         buttonContent = (
//             <>
//                 <Button as={Link} to="/home" variant="outline-light">
//                     Sign In
//                 </Button>
//                 {/* Placeholder style for the user's '.orangebtn' class */}
//                 <Button as={Link} to="/home" className="ms-2 orangebtn"  >
//                     Sign up
//                 </Button>
//             </>
//         );
//       }
    
//     // Handle anchor link clicks for smooth scrolling
//     const handleAnchorClick = (e, path) => {
//         if (path.startsWith('#')) {
//             e.preventDefault();
//             const element = document.querySelector(path);
//             if (element) {
//                 const yOffset = -80; // Offset for navbar
//                 const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
//                 window.scrollTo({ top: y, behavior: 'smooth' });
//             }
//         }
//     };

//     // NonHomeContent structure is different for landing vs maintenance
//     const NonHomeContent = (
//         <div className="d-flex flex-column flex-lg-row w-100 justify-content-end align-items-lg-center">
//              <Nav className="me-lg-4 d-flex justify-content-start align-items-start">
//                 {navLinks.map((link) => {
//                     // For anchor links, use regular anchor tag; for routes, use Link
//                     if (link.path.startsWith('#')) {
//                         return (
//                             <Nav.Link
//                                 href={link.path}
//                                 onClick={(e) => handleAnchorClick(e, link.path)}
//                                 key={link.name}
//                                 className="mx-1 fw-medium linksHover"
//                                 style={{ color: 'white' }}
//                             >
//                                 {link.name}
//                             </Nav.Link>
//                         );
//                     }
//                     return (
//                         <Nav.Link
//                             as={Link}
//                             to={link.path}
//                             key={link.name}
//                             className="mx-1 fw-medium linksHover"
//                             style={{ color: 'white' }}
//                         >
//                             {link.name}
//                         </Nav.Link>
//                     );
//                 })}
//             </Nav>
            
//             <div > 
//               {buttonContent}
//             </div>
            
//         </div>
//     );

//     return (
//         <Navbar expand="lg" className="shadow py-1 gradient ">
//             <Container fluid className="px-3 px-lg-5">
//                 {/* Brand/Logo Section */}
//                 <div className="d-flex align-items-center">
//                     <img src={logoIcon} alt="Phoenix Logo" width="60" className="me-2" />
//                     <Navbar.Brand as={Link} to="/" className="fw-bold  fs-4">
//                         Phoenix
//                     </Navbar.Brand>
//                 </div>

//                 <Navbar.Toggle aria-controls="main-navbar" />

//                 <Navbar.Collapse id="main-navbar" className={displayIconNav ? 'justify-content-between' : 'justify-content-end'}>
//                     {displayIconNav ? InternalAppContent : NonHomeContent}
//                 </Navbar.Collapse>
//             </Container>
//         </Navbar>
//     );
// }

import React, { useState, useRef, useEffect } from "react";
import { Navbar, Nav, Container, Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoMdHome, IoMdSettings } from "react-icons/io";
import { FaShop, FaBell } from "react-icons/fa6";
import { IoChatbubbleSharp } from "react-icons/io5";
import { GrVmMaintenance } from "react-icons/gr";
import { MdContactSupport, MdLogout } from "react-icons/md";
import { useUser } from "../../context/UserContext";
import axios from "axios";

const logoIcon = "/public/assets/landingImgs/phoenix-removebg-preview.png";

export default function CustomNavbar() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { userProfileData, logout } = useUser();
    
    // State for popups and notifications
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Refs for click outside detection
    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    
    const userProfileImage = userProfileData.profileImage;
    
    // Fetch notifications from backend
    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            // Fallback to empty array if error
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoadingNotifications(false);
        }
    };
    
    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };
    
    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/notifications/mark-all-read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };
    
    // Fetch notifications when opening the popup
    useEffect(() => {
        if (showNotifications && !shouldHideNavbar) {
            fetchNotifications();
        }
    }, [showNotifications]);
    
    // Poll for new notifications every 30 seconds when logged in
    useEffect(() => {
        if (!shouldHideNavbar) {
            // Initial fetch
            fetchNotifications();
            
            // Set up polling
            const interval = setInterval(() => {
                fetchNotifications();
            }, 30000); // 30 seconds
            
            return () => clearInterval(interval);
        }
    }, [pathname]);
    
    // Close popups when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Define Paths for Pages that should HIDE the Navbar 
    const NO_NAVBAR_PATHS = ["/login", "/signup", "/auth/signup", "/auth/login", "/otp-verification", "/forgot-password", "/reset-password"];

    const shouldHideNavbar = NO_NAVBAR_PATHS.includes(pathname);

    if (shouldHideNavbar) {
        return null;
    }

    const landingLinks = [
        { name: "Home", path: "/" },
        { name: "Features", path: "#features" },
        { name: "Products", path: "#products" },
        { name: "About", path: "#about" },
        { name: "Reviews", path: "#reviews" },
        { name: "Contact", path: "/contact" },
    ];

    const maintenanceLinks = [
        { name: "Dashboard", path: "/maintenance/dashboard" },
        { name: "Tickets", path: "/maintenance/tickets" },
        { name: "Reports", path: "/maintenance/reports" },
    ];

    const iconLinks = [
        { name: "Feed", path: "/home", icon: <IoMdHome /> },
        { name: "Explore Services", path: "/explore-services", icon: <FaShop /> },
        { name: "Messages", path: "/chat", icon: <IoChatbubbleSharp /> },
        { name: "Maintenance", path: "/maintenance", icon: <GrVmMaintenance /> },
        { name: "ContactSupport", path: "/contact", icon: <MdContactSupport /> },
    ];

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Call backend logout endpoint
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            // Clear local storage and context
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Call context logout function
            if (logout) {
                logout();
            }
            
            // Navigate to login
            navigate("/login");
        }
    };

    const isLandingPage = pathname === "/";
    const isMaintenancePage = pathname.startsWith("/maintenance");
    const displaySearchBar = pathname === "/home";
    const displayIconNav = !isLandingPage && !isMaintenancePage;

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            case 'friend':
                return '👤';
            case 'message':
                return '✉️';
            case 'maintenance':
                return '🔧';
            default:
                return '🔔';
        }
    };

    // Format notification time
    const formatTime = (timestamp) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now - notifTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifTime.toLocaleDateString();
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read) {
            await markAsRead(notification._id);
        }
        
        // Navigate to relevant page
        if (notification.link) {
            navigate(notification.link);
            setShowNotifications(false);
        }
    };

    // Notifications Popup Component
    const NotificationsPopup = () => (
        <div 
            ref={notificationRef}
            style={{
                position: 'absolute',
                top: '60px',
                right: '20px',
                width: '360px',
                maxHeight: '480px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                overflow: 'hidden'
            }}
        >
            <div style={{ 
                padding: '16px', 
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h5 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Notifications</h5>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#1877f2',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Mark all as read
                    </button>
                )}
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {loadingNotifications ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#65676b' }}>
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#65676b' }}>
                        <FaBell size={40} style={{ marginBottom: '10px', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                                padding: '12px 16px',
                                display: 'flex',
                                gap: '12px',
                                backgroundColor: notif.read ? 'white' : '#e7f3ff',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'white' : '#e7f3ff'}
                        >
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={notif.sender?.profileImage || 'https://i.pravatar.cc/48'}
                                    alt={notif.sender?.name || 'User'}
                                    style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    fontSize: '18px'
                                }}>
                                    {getNotificationIcon(notif.type)}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                                    <strong>{notif.sender?.name || 'Someone'}</strong> {notif.message}
                                </p>
                                <span style={{ fontSize: '12px', color: '#1877f2' }}>
                                    {formatTime(notif.createdAt)}
                                </span>
                            </div>
                            {!notif.read && (
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: '#1877f2',
                                    alignSelf: 'center'
                                }}></div>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div style={{ 
                padding: '12px', 
                borderTop: '1px solid #e5e5e5',
                textAlign: 'center'
            }}>
                <Link 
                    to="/notifications" 
                    style={{ 
                        color: '#1877f2', 
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                    onClick={() => setShowNotifications(false)}
                >
                    See all notifications
                </Link>
            </div>
        </div>
    );

    // Profile Menu Popup Component
    const ProfileMenuPopup = () => (
        <div 
            ref={profileRef}
            style={{
                position: 'absolute',
                top: '60px',
                right: '20px',
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                overflow: 'hidden'
            }}
        >
            <div style={{ padding: '16px' }}>
                <Link 
                    to="/profile" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'inherit',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setShowProfileMenu(false)}
                >
                    <img 
                        src={userProfileImage} 
                        alt="Profile"
                        style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                    <div>
                        <h6 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                            {userProfileData.name || userProfileData.firstName + ' ' + userProfileData.lastName || 'User Name'}
                        </h6>
                        <p style={{ margin: 0, fontSize: '13px', color: '#65676b' }}>
                            View your profile
                        </p>
                    </div>
                </Link>
            </div>
            
            <hr style={{ margin: 0, borderColor: '#e5e5e5' }} />
            
            <div style={{ padding: '8px' }}>
                <Link
                    to="/settings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setShowProfileMenu(false)}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#e4e6eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <IoMdSettings size={20} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>Settings & Privacy</span>
                </Link>
                
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#e4e6eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MdLogout size={20} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>Log Out</span>
                </button>
            </div>
        </div>
    );

    const InternalAppContent = (
        <>
            {displaySearchBar && (
                <Form className="d-flex mx-auto w-100 me-lg-4 order-lg-2 my-lg-0" style={{ maxWidth: '500px' }}>
                    <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                        <InputGroup.Text id="search-icon" className="bg-white border-0 py-2">
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

            <Nav className="d-flex flex-row justify-content-center align-items-center ms-auto order-lg-3 gap-lg-1 ">
                {/* Notifications with Badge */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfileMenu(false);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            position: 'relative'
                        }}
                        className="navLinks"
                        title="Notifications"
                    >
                        <span className="fs-4 linksHover">
                            <FaBell />
                        </span>
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                backgroundColor: '#f02849',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '2px 6px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                minWidth: '18px',
                                textAlign: 'center'
                            }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && <NotificationsPopup />}
                </div>
                
                {iconLinks.map((link) => (
                    <Nav.Link as={Link} to={link.path} key={link.name} className="navLinks p-2 " title={link.name}>
                        <span className="fs-4 linksHover">{link.icon}</span>
                    </Nav.Link>
                ))}
                
                {/* Profile Avatar with Popup */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifications(false);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            marginLeft: '8px'
                        }}
                        title="Profile"
                    >
                        <img
                            src={userProfileImage}
                            alt="User Profile"
                            className="rounded-circle shadow-sm"
                            style={{ 
                                objectFit: 'cover', 
                                width: '36px', 
                                height: '36px',
                                border: showProfileMenu ? '2px solid #1877f2' : '2px solid transparent',
                                transition: 'border 0.2s'
                            }}
                        />
                    </button>
                    {showProfileMenu && <ProfileMenuPopup />}
                </div>
            </Nav>
        </>
    );

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

    const handleAnchorClick = (e, path) => {
        if (path.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(path);
            if (element) {
                const yOffset = -80;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

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
        <Navbar expand="lg" className="p-0 nav-bg">
            <Container fluid className="px-3 px-lg-5">
                <div className="d-flex align-items-center">
                    <img src={logoIcon} alt="Phoenix Logo" width="80" className="me-1" />
                    <Navbar.Brand as={Link} to="/home" className="fw-bold fs-4 logo-text">
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