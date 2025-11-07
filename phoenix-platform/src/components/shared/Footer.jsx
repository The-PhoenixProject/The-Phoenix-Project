import { color } from "framer-motion";
import { li, link } from "framer-motion/client";
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { TbBrandLinkedin } from "react-icons/tb";

const linkStyle ={
  textDecoration: 'none',
}

export default function Footer() {
  return (
    <footer>
      <Container>
        <Row className="d-flex justify-content-between py-4 px-3">
          <Col md={3} sm={6} lg={3} >
            <h5>Phoenix</h5>
            <p className="text-secondary">Rebuild. Reuse. Revive the planet with Phoenix.</p>
          </Col>
          <Col md={2} lg={3}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled ">
              <li><a style={linkStyle }  className="text-secondary linksHover " href="/">Home</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#about">About</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#features">Features</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#marketplace">marketplace</a></li>
            </ul>
          </Col>
          <Col md={5} lg={3}>
            <h5>Contact</h5>
            <ul className="list-unstyled ">
              <li><a style={linkStyle}  className="text-secondary linksHover" href="mailto:mariammamdouh977@gmail.com" target="_blank">mariammamdouh977@gmail.com</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#">Rowida</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#">Mariam</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#">Ahmed</a></li>
              <li><a style={linkStyle} className="text-secondary linksHover" href="#">Eyad</a></li>
            </ul>
          </Col>
          <Col md={2} >
            <h5>Follow Us</h5>
            <a href="https://www.linkedin.com/in/mariammamdouh-webdeveloper/" style={linkStyle} className="text-secondary fs-3 linksHover" target="_blank"><TbBrandLinkedin /></a>
            <a href="" target="_blank" className="text-secondary fs-3 linksHover"><TbBrandLinkedin /></a>
            <a href="" target="_blank" className="text-secondary fs-3 linksHover"><TbBrandLinkedin /></a>
            <a href="" target="_blank" className="text-secondary fs-3 linksHover"><TbBrandLinkedin /></a>
          </Col>
        </Row>
        <hr className="border-light" />
        <p className="text-center mb-0">© 2025 Phoenix Project. All rights reserved.</p>
      </Container>
    </footer>
  );
}
