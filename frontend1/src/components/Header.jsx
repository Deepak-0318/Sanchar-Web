import "./../styles/header.css";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          🌴 Sanchar<span>AI</span>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#testimonials" className="nav-link">Reviews</a>
        </nav>



        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <a href="#features" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>How it Works</a>
          <a href="#testimonials" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Reviews</a>
        </div>
      )}
    </header>
  );
}