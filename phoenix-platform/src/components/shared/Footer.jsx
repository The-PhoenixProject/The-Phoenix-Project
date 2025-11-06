import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function Footer() {
  return (
    <footer>
      <Container>
        <Row>
          <Col md={4}>
            <h5>Phoenix Project</h5>
            <p>Rebuild. Reuse. Revive the planet with Phoenix.</p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#products">Products</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Follow Us</h5>
            <p>Facebook | Twitter | Instagram</p>
          </Col>
        </Row>
        <hr className="border-light" />
        <p className="text-center mb-0">© 2025 Phoenix Project. All rights reserved.</p>
      </Container>
    </footer>
  );
}
