import { useState, useEffect } from "react";

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.testimonial-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section style={styles.section} id="testimonials">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>💬 Real Stories</span>
          <h2 style={styles.title}>Adventure Stories from Bengaluru</h2>
          <p style={styles.subtitle}>
            Discover how Sanchar transformed ordinary days into extraordinary adventures 🌟
          </p>
        </div>

        {/* Featured Testimonial */}
        <div style={styles.featured}>
          <div style={styles.featuredCard}>
            <div style={styles.quote}>"</div>
            <p style={styles.featuredText}>{testimonials[currentTestimonial].text}</p>
            <div style={styles.featuredAuthor}>
              <div style={styles.featuredAvatar}>
                {testimonials[currentTestimonial].initial}
              </div>
              <div>
                <div style={styles.featuredName}>{testimonials[currentTestimonial].name}</div>
                <div style={styles.featuredPlace}>
                  📍 {testimonials[currentTestimonial].place} • {testimonials[currentTestimonial].experience}
                </div>
              </div>
            </div>
            <div style={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={styles.star}>⭐</span>
              ))}
            </div>
          </div>
        </div>

        {/* All Testimonials Grid */}
        <div style={styles.grid}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              data-index={i}
              className="testimonial-card"
              style={{
                ...styles.card,
                ...(visibleCards.includes(i) ? styles.visible : styles.hidden),
                ...(i === currentTestimonial ? styles.highlighted : {})
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(45, 212, 191, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
              }}
              onClick={() => setCurrentTestimonial(i)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>{t.initial}</div>
                <div>
                  <div style={styles.name}>{t.name}</div>
                  <div style={styles.place}>📍 {t.place}</div>
                </div>
                <div style={styles.experience}>{t.experience}</div>
              </div>
              <p style={styles.text}>"{t.text}"</p>
              <div style={styles.cardFooter}>
                <div style={styles.tags}>
                  {t.tags.map((tag, idx) => (
                    <span key={idx} style={styles.tag}>{tag}</span>
                  ))}
                </div>
                <div style={styles.cardRating}>
                  {[...Array(5)].map((_, idx) => (
                    <span key={idx} style={styles.miniStar}>⭐</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div style={styles.stats}>
          <div style={styles.stat}>
            <div style={styles.statNumber}>10K+</div>
            <div style={styles.statLabel}>Happy Adventurers</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Hidden Gems Found</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNumber}>4.9★</div>
            <div style={styles.statLabel}>Average Rating</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNumber}>50+</div>
            <div style={styles.statLabel}>Locations Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    initial: "A",
    name: "Ananya Sharma",
    place: "Koramangala, Bengaluru",
    experience: "🏖️ Weekend Explorer",
    text: "Sanchar found this incredible lakeside café in Ramanagara I never knew existed! The AI perfectly matched my 'peaceful morning' vibe with my ₹800 budget. Best weekend ever!",
    tags: ["Hidden Gems", "Budget-Friendly", "Nature"]
  },
  {
    initial: "R",
    name: "Rahul Krishnan",
    place: "Indiranagar, Bengaluru",
    experience: "🎯 Last-minute Planner",
    text: "Had 2 hours free on Sunday afternoon. Sanchar instantly planned a food crawl through local street vendors + a sunset spot. The hidden gems feature is seriously magical!",
    tags: ["Food", "Quick Plans", "Local Culture"]
  },
  {
    initial: "S",
    name: "Sneha Patel",
    place: "Whitefield, Bengaluru",
    experience: "🌟 Adventure Seeker",
    text: "No more endless Googling! Just told Sanchar I wanted 'adventure + photography' and got a perfect trekking route with Instagram-worthy spots. My friends are amazed!",
    tags: ["Adventure", "Photography", "Trekking"]
  }
];

const styles = {
  section: {
    padding: "120px 20px",
    background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
    color: "#ffffff",
    position: "relative",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "80px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "25px",
    fontSize: "0.9rem",
    color: "#2dd4bf",
    marginBottom: "20px",
    fontWeight: "600",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "16px",
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  featured: {
    marginBottom: "80px",
    textAlign: "center",
  },
  featuredCard: {
    padding: "50px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(94, 234, 212, 0.05) 100%)",
    border: "2px solid rgba(45, 212, 191, 0.2)",
    maxWidth: "800px",
    margin: "0 auto",
    position: "relative",
    transition: "all 0.3s ease",
  },
  quote: {
    fontSize: "4rem",
    color: "#2dd4bf",
    position: "absolute",
    top: "20px",
    left: "30px",
    fontFamily: "serif",
  },
  featuredText: {
    fontSize: "1.4rem",
    color: "#e2e8f0",
    lineHeight: 1.7,
    marginBottom: "30px",
    fontStyle: "italic",
  },
  featuredAuthor: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  featuredAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    color: "#0f172a",
    fontSize: "1.5rem",
  },
  featuredName: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  featuredPlace: {
    fontSize: "1rem",
    color: "#94a3b8",
  },
  rating: {
    fontSize: "1.2rem",
  },
  star: {
    marginRight: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
    marginBottom: "80px",
  },
  card: {
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    transition: "all 0.5s ease",
    cursor: "pointer",
  },
  visible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  hidden: {
    opacity: 0,
    transform: "translateY(30px)",
  },
  highlighted: {
    border: "2px solid rgba(45, 212, 191, 0.4)",
    boxShadow: "0 25px 50px rgba(45, 212, 191, 0.1)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#0f172a",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  name: {
    fontWeight: "600",
    fontSize: "1rem",
    color: "#ffffff",
  },
  place: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  experience: {
    marginLeft: "auto",
    fontSize: "0.8rem",
    padding: "4px 8px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    borderRadius: "12px",
    color: "#2dd4bf",
  },
  text: {
    fontSize: "1rem",
    color: "#e5e7eb",
    lineHeight: 1.6,
    marginBottom: "16px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tags: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: "0.75rem",
    padding: "4px 8px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    borderRadius: "10px",
    color: "#2dd4bf",
  },
  cardRating: {
    fontSize: "0.9rem",
  },
  miniStar: {
    marginRight: "2px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
    textAlign: "center",
  },
  stat: {
    padding: "30px 20px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  statNumber: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#2dd4bf",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#cbd5e1",
    fontWeight: "500",
  },
};