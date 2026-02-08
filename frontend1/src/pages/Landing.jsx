import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
// import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import "../styles/global.css";

export default function Landing() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      {/* <Testimonials /> */}
      <Footer />
    </>
  );
}
