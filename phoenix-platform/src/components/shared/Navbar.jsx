import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";


export default function CustomNavbar() {
  const { pathname } = useLocation();

  const landingLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "#features" },
    { name: "Products", path: "#products" },
    { name: "About", path: "#about" },
    { name: "Reviews", path: "#reviews" },
    { name: "Contact", path: "#contact" },
  ];

  const homeLinks = [
    { name: "Feed", path: "/home" },
    { name: "Profile", path: "/profile" },
    { name: "Settings", path: "/settings" },
  ];

  const links = pathname === "/" ? landingLinks : homeLinks;

  return (
    <Navbar expand="lg"  className="shadow py-1 gradient" >
      <Container>
        <div>
          <img src="/src/assets/logo-icon.png" alt="Phoenix Logo"  width="60" className="me-2" />
        <Navbar.Brand as={Link} to="/" className="fw-bold  ">
          Phoenix
        </Navbar.Brand>
        </div>
        
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto me-4">
            {links.map((link) => (
              <Nav.Link
                as={Link}
                to={link.path}
                key={link.name}
                className="mx-1 fw-medium text-white linksHover"
              >
                {link.name}
              </Nav.Link>
            ))}
          </Nav>
          {pathname === "/" && (
            <Button as={Link} to="/home"  variant="outline-light">
              Sign In
            </Button>
          )}
          {pathname === "/" && (
            <Button as={Link} to="/home" className="ms-2 orangebtn"  >
              Sign up
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
