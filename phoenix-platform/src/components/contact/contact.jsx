import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Accordion,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ContactUs() {
  // Removed unused chatActive state

  //   const handleLiveChat = () => {
  //     // In a real application, this would integrate with a live chat service
  //     alert(
  //       "Live chat will start now! (In a real app, this would connect to a chat service)"
  //     );
  //   };

  //   const handleFeedback = () => {
  //     // In a real application, this would open a feedback form
  //     alert(
  //       "Feedback form will open! (In a real app, this would open a feedback system)"
  //     );
  //   };

  return (
    <div className="bg-light text-dark min-vh-100">
      {/* Header with green transparent background */}
      <section
        className="text-center py-5"
        style={{ backgroundColor: "rgba(0, 125, 110, 0.1)" }}
      >
        <h1 className="fw-bold mb-2">Get in Touch</h1>
        <p className="text-muted">
          We'd love to hear from you. Send us a message and we'll respond as
          soon as possible.
        </p>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          {/* Contact Form */}
          <Col md={6}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body>
                <h4 className="fw-semibold mb-4">Send us a Message</h4>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Your Name" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="your@email.com" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Tell us how we can help you..."
                    />
                  </Form.Group>
                  <Button
                    className="w-100 rounded-pill border-0"
                    style={{ backgroundColor: "#EC744A" }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#e0653a")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#EC744A")
                    }
                  >
                    Send Message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Info */}
          <Col md={6}>
            <Card className="shadow-sm border-0 rounded-4 mb-4">
              <Card.Body>
                <h4 className="fw-semibold mb-4">Contact Information</h4>
                <div className="d-flex align-items-center mb-3">
                  <i
                    className="bi bi-geo-alt-fill me-2"
                    style={{ color: "red" }}
                  ></i>
                  <span>Cairo, Egypt</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i
                    className="bi bi-telephone-fill me-2"
                    style={{ color: "red" }}
                  ></i>
                  <span>+20 123 456 7890</span>
                </div>
                <div className="d-flex align-items-center">
                  <i
                    className="bi bi-envelope-fill me-2"
                    style={{ color: "red" }}
                  ></i>
                  <span>info@company.com</span>
                </div>
              </Card.Body>
            </Card>

            {/* Social Media */}
            <Card className="shadow-sm border-0 rounded-4 ">
              <Card.Body>
                <h5 className="fw-semibold mb-3">Follow Us</h5>
                <div className="d-flex gap-3 fs-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1877F2" }}
                  >
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#E4405F" }}
                  >
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0A66C2" }}
                  >
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Map */}
        <section className="my-5">
          {/* Header with green transparent background */}
          <section
            className="text-center py-5"
            style={{ backgroundColor: "rgba(0, 125, 110, 0.1)" }}
          >
            <h4 className="fw-semibold mb-3">Find Us</h4>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.60389525116!2d31.188423458033028!3d30.04438712704816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458466d5f0ca8c7%3A0x1da10d04174b0dd5!2sCairo%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1699876543210!5m2!1sen!2seg"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen=""
              loading="lazy"
              title="Company Location in Cairo, Egypt"
            ></iframe>
          </section>
        </section>

        {/* Support & Feedback */}
        {/* <Row className="g-4">
          <Col md={6}>
            <Card className="border-start border-success border-4 shadow-sm rounded-4">
              <Card.Body>
                <h5 className="fw-semibold mb-2">Customer Support</h5>
                <p className="text-muted mb-3">
                  Need immediate assistance? Our support team is here to help.
                </p>
                <Button
                  variant="success"
                  className="rounded-pill"
                  onClick={handleLiveChat}
                >
                  Start Live Chat
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-start border-warning border-4 shadow-sm rounded-4">
              <Card.Body>
                <h5 className="fw-semibold mb-2">Feedback & Issues</h5>
                <p className="text-muted mb-3">
                  Help us improve by sharing your feedback or reporting issues.
                </p>
                <Button
                  variant="warning"
                  className="rounded-pill text-white"
                  onClick={handleFeedback}
                >
                  Give Feedback
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
 */}
        {/* FAQ */}
        <section className="my-5">
          <h4 className="fw-semibold mb-4 text-center">
            Frequently Asked Questions
          </h4>
          <Accordion alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                How quickly do you respond to messages?
              </Accordion.Header>
              <Accordion.Body
                style={{ backgroundColor: "rgba(0, 125, 110, 0.1)" }}
              >
                We usually respond within 24 hours during business days.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>What are your business hours?</Accordion.Header>
              <Accordion.Body
                style={{ backgroundColor: "rgba(0, 125, 110, 0.1)" }}
              >
                Our support team is available from 9 AM to 6 PM, Monday through
                Friday.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Do you offer phone support?</Accordion.Header>
              <Accordion.Body
                style={{ backgroundColor: "rgba(0, 125, 110, 0.1)" }}
              >
                Yes, you can call us anytime during business hours.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>Can I schedule a meeting?</Accordion.Header>
              <Accordion.Body
                style={{ backgroundColor: "rgba(0, 125, 110, 0.1)" }}
              >
                Absolutely! Just send us a message, and we'll arrange a
                convenient time.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted py-4 border-top">
          <a href="#" className="text-decoration-none me-3 text-secondary">
            Privacy Policy
          </a>
          <a href="#" className="text-decoration-none text-secondary">
            Terms of Service
          </a>
        </footer>
      </Container>
    </div>
  );
}
