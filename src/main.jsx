import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'normalize.css'
import './index.css'
import App from './App.jsx'
import './App.css';
import './styles/Landing/HeroSection.css';
import './styles/Landing/AboutSection.css';
import './styles/Landing/FeaturesSection.css';
import './styles/Landing/TestimonialsSection.css';

import 'bootstrap/dist/css/bootstrap.min.css'
import "@popperjs/core/dist/umd/popper.js"
import "bootstrap/dist/js/bootstrap.min.js"
import 'bootstrap-icons/font/bootstrap-icons.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
