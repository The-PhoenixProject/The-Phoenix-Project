import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Footer from "../components/shared/Footer";

export default function HomePage() {
  return (
    <>
      <Container className="py-5">
        <Row>
          <Col md={8}>
            <Card className="mb-3 p-3 shadow-sm">
              <h5>New Post</h5>
              <p>Share your thoughts about sustainability...</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 shadow-sm">
              <h5>Trending Topics</h5>
              <ul>
                <li>Eco Projects</li>
                <li>Recycling Tips</li>
                <li>Green Startups</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
