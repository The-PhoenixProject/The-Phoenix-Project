import React from "react";
import { Container, Row, Col } from "react-bootstrap";
const aboutImage = "/assets/landingImgs/aboutImageresiezed.png";

export default function AboutSection() {
  return (
    <section id="about" className="py-2 my-3  w-100 d-flex  align-items-center justify-content-center ">
      <div className="px-5 about d-flex   align-items-center justify-content-between ">
        <Row className="align-items-center  mt-5">
          <h2 className="text-center  fw-bold title-color">About Phoenix Project</h2>
          <Col lg={6} className="text-muted py-2">
            <p >
              Phoenix Project is a revolutionary community platform that brings 
              together eco-conscious individuals passionate about sustainability. 
              We believe in the power of collective action to create meaningful environmental 
              change through upcycling, sharing resources, and inspiring others.
            </p>
            <p >
              Our mission is to transform how we think about waste and consumption, 
              turning discarded items into treasures and building a community that 
              values creativity, sustainability, and collaboration.
            </p>
            <button className="px-3 py-1 my-2  rounded greenBtn">Join</button>
          </Col>
          <Col lg={6}>
            <img
              src={aboutImage}
              alt="about"
              className="img-fluid"
            />
          </Col>
        </Row>
      </div>
    </section>
  );
}
