import React, { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Accordion,
  Alert,
  Spinner,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import emailjs from "@emailjs/browser";

export default function ContactUs() {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // EmailJS configuration - Replace these with your actual IDs
  const emailjsConfig = {
    serviceId: "service_wer4648",
    templateId: "template_58h48mn",
    publicKey: "Hd_yCLwEWoYN5OHmq",
  };

  // Show alert messages
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .sendForm(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        form.current,
        {
          publicKey: emailjsConfig.publicKey,
        }
      )
      .then(
        () => {
          setLoading(false);
          showAlert(
            "Message sent successfully! We'll get back to you soon.",
            "success"
          );
          form.current.reset(); // Reset the form after successful sending
        },
        (error) => {
          setLoading(false);
          console.log("FAILED...", error.text);
          showAlert(
            "Failed to send message. Please try again later.",
            "danger"
          );
        }
      );
  };

  return (
    <div className="bg-light text-dark min-vh-100">
      {/* Alert Component */}
      {alert.show && (
        <Alert
          variant={alert.type}
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 1050, minWidth: "300px" }}
          dismissible
          onClose={() => setAlert({ show: false, message: "", type: "" })}
        >
          {alert.message}
        </Alert>
      )}

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
                <Form ref={form} onSubmit={sendEmail}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="user_name"
                      placeholder="Your Name"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="user_email"
                      placeholder="your@email.com"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    className="w-100 rounded-pill border-0"
                    style={{ backgroundColor: "#EC744A" }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#e0653a")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#EC744A")
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
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
            <Card className="shadow-sm border-0 rounded-4">
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
          <div
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
          </div>
        </section>

        {/* FAQ Section - Remaining the same */}
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
