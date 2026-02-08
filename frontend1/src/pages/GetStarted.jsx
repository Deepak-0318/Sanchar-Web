import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    key: "mood",
    type: "options",
    title: "What's the vibe today?",
    subtitle: "Choose your perfect mood for the adventure 🌟",
    options: [
      { label: "Chill & Relaxed", value: "chill", emoji: "😌", color: "#10B981" },
      { label: "Fun & Lively", value: "fun", emoji: "🎉", color: "#F59E0B" },
      { label: "Romantic", value: "romantic", emoji: "❤️", color: "#EF4444" },
      { label: "Adventure", value: "adventure", emoji: "🔥", color: "#8B5CF6" },
    ],
  },
  {
    key: "budget",
    type: "options",
    title: "What's your budget?",
    subtitle: "Let's find the perfect spots within your range 💰",
    options: [
      { label: "Budget-friendly", value: "low", emoji: "💸", color: "#06B6D4", desc: "₹200-500" },
      { label: "Moderate", value: "medium", emoji: "💰", color: "#10B981", desc: "₹500-1500" },
      { label: "Premium", value: "high", emoji: "💎", color: "#8B5CF6", desc: "₹1500+" },
    ],
  },
  {
    key: "time",
    type: "options",
    title: "How much time do you have?",
    subtitle: "We'll plan the perfect itinerary for your schedule ⏰",
    options: [
      { label: "Quick Escape", value: "1-2", emoji: "⏱️", color: "#F59E0B", desc: "1-2 hours" },
      { label: "Half Adventure", value: "2-4", emoji: "⌛", color: "#10B981", desc: "2-4 hours" },
      { label: "Extended Fun", value: "half-day", emoji: "🌤️", color: "#06B6D4", desc: "Half day" },
      { label: "Full Experience", value: "full-day", emoji: "🌞", color: "#EF4444", desc: "Full day" },
    ],
  },
  {
    key: "location_access",
    type: "location",
    title: "Let's find your current location",
    subtitle: "We need your location to suggest the best nearby spots 📍",
  },
  {
    key: "preferred_location",
    type: "input",
    title: "Where do you want to explore?",
    subtitle: "Any specific area you'd like to discover? (Optional) 🗺️",
    placeholder: "Eg: MG Road, Bengaluru or leave blank for AI suggestions",
  },
];

export default function GetStarted() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [locationError, setLocationError] = useState("");

  const current = questions[step];

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          const address = await reverseGeocode(latitude, longitude);
          
          const locationData = {
            lat: latitude,
            lon: longitude,
            address: address
          };

          const updated = { ...answers, location_access: locationData };
          setAnswers(updated);
          setLoading(false);
          
          // Move to next step
          setStep((s) => s + 1);
        } catch (error) {
          setLocationError("Failed to get your address. Please try again.");
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location access and try again.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An unknown error occurred while getting your location.");
            break;
        }
      },
      options
    );
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.locality && data.city) {
        return `${data.locality}, ${data.city}`;
      } else if (data.city) {
        return data.city;
      } else {
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  const handleNearbySearch = async () => {
    const locationData = answers.location_access;
    if (!locationData) {
      alert("Location not available. Please go back and allow location access.");
      return;
    }

    // Navigate directly to planner with current location as preferred location
    navigate("/planner", {
      state: {
        mood: answers.mood,
        budget: answers.budget,
        time: answers.time,
        startLocation: locationData.address,
        preferredLocation: "", // Empty to use current location
        start_lat: locationData.lat,
        start_lon: locationData.lon,
      },
    });
  };

  const handleNext = async (value) => {
    const updated = { ...answers, [current.key]: value };
    setAnswers(updated);

    // FINAL STEP → NAVIGATE TO PLANNER
    if (current.key === "preferred_location") {
      setLoading(true);
      try {
        const locationData = updated.location_access;
        
        navigate("/planner", {
          state: {
            mood: updated.mood,
            budget: updated.budget,
            time: updated.time,
            startLocation: locationData.address,
            preferredLocation: updated.preferred_location || "",
            start_lat: locationData.lat,
            start_lon: locationData.lon,
          },
        });
      } catch (err) {
        alert("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep((s) => s + 1);
    setInputValue("");
    setSelectedOption(null);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setSelectedOption(null);
      setLocationError("");
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${((step + 1) / questions.length) * 100}%`
            }}
          />
        </div>
        <p style={styles.step}>
          Step {step + 1} of {questions.length}
        </p>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{current.title}</h1>
        <p style={styles.subtitle}>{current.subtitle}</p>
      </div>

      {/* Options Layout */}
      {current.type === "options" && (
        <div style={styles.optionsContainer}>
          <div style={styles.optionsRow}>
            {current.options.map((opt, index) => (
              <div
                key={opt.value}
                style={{
                  ...styles.optionCard,
                  ...(selectedOption === opt.value ? styles.selectedCard : {}),
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={() => {
                  setSelectedOption(opt.value);
                  setTimeout(() => handleNext(opt.value), 300);
                }}
                onMouseEnter={(e) => {
                  if (selectedOption !== opt.value) {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 20px 40px ${opt.color}20`;
                    e.currentTarget.style.borderColor = opt.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOption !== opt.value) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(45, 212, 191, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                  }
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                }}
              >
                <div style={styles.optionEmoji}>{opt.emoji}</div>
                <h3 style={styles.optionLabel}>{opt.label}</h3>
                {opt.desc && <p style={styles.optionDesc}>{opt.desc}</p>}
                <div 
                  style={{
                    ...styles.optionGlow,
                    background: `radial-gradient(circle, ${opt.color}20 0%, transparent 70%)`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Access Layout */}
      {current.type === "location" && (
        <div style={styles.locationContainer}>
          <div style={styles.locationCard}>
            <div style={styles.locationIcon}>📍</div>
            <h3 style={styles.locationTitle}>Access Your Location</h3>
            <p style={styles.locationText}>
              We'll use your current location to find the best nearby hangout spots and plan your perfect route.
            </p>
            
            {locationError && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span>
                {locationError}
              </div>
            )}
            
            <button
              style={{
                ...styles.locationBtn,
                ...(loading ? styles.disabledBtn : {})
              }}
              disabled={loading}
              onClick={getCurrentLocation}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 15px 35px rgba(45, 212, 191, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 25px rgba(45, 212, 191, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={styles.loadingText}>
                  <span style={styles.spinner}></span>
                  Getting Location...
                </span>
              ) : (
                <>
                  <span style={styles.locationBtnIcon}>📍</span>
                  Allow Location Access
                </>
              )}
            </button>
            
            <p style={styles.privacyNote}>
              🔒 Your location is only used to suggest nearby places and is not stored.
            </p>
          </div>
        </div>
      )}

      {/* Input Layout */}
      {current.type === "input" && (
        <div style={styles.inputContainer}>
          <div style={styles.inputWrapper}>
            <div style={styles.searchContainer}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={current.placeholder}
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2dd4bf';
                  e.target.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                style={styles.nearbyBtn}
                onClick={() => handleNearbySearch()}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(45, 212, 191, 0.2)';
                  e.target.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(45, 212, 191, 0.1)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                📍 Nearby
              </button>
            </div>
            <button
              style={{
                ...styles.primaryBtn,
                ...(loading ? styles.disabledBtn : {})
              }}
              disabled={loading}
              onClick={() => handleNext(inputValue)}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 15px 35px rgba(45, 212, 191, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 25px rgba(45, 212, 191, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={styles.loadingText}>
                  <span style={styles.spinner}></span>
                  Processing...
                </span>
              ) : (
                "Continue →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navigation}>
        {step > 0 && (
          <button
            style={styles.backBtn}
            onClick={handleBack}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(45, 212, 191, 0.1)';
              e.target.style.borderColor = '#2dd4bf';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    position: "relative",
  },
  progressContainer: {
    position: "absolute",
    top: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: "4px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2dd4bf, #5eead4)",
    borderRadius: "2px",
    transition: "width 0.5s ease",
  },
  step: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  header: {
    textAlign: "center",
    marginBottom: "60px",
    maxWidth: "800px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "16px",
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  optionsContainer: {
    width: "100%",
    maxWidth: "1200px",
    marginBottom: "40px",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  optionCard: {
    flex: "1",
    minWidth: "200px",
    maxWidth: "280px",
    padding: "32px 24px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    border: "2px solid rgba(45, 212, 191, 0.2)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(45, 212, 191, 0.1)",
    animation: "fadeInUp 0.6s ease-out forwards",
    opacity: 0,
    transform: "translateY(20px)",
  },
  selectedCard: {
    borderColor: "#2dd4bf",
    background: "rgba(45, 212, 191, 0.1)",
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(45, 212, 191, 0.2)",
  },
  optionEmoji: {
    fontSize: "3rem",
    marginBottom: "16px",
    display: "block",
  },
  optionLabel: {
    fontSize: "1.2rem",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#ffffff",
  },
  optionDesc: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    margin: 0,
  },
  optionGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    zIndex: -1,
    opacity: 0.3,
  },
  locationContainer: {
    width: "100%",
    maxWidth: "500px",
    marginBottom: "40px",
  },
  locationCard: {
    padding: "40px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    border: "2px solid rgba(45, 212, 191, 0.2)",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(45, 212, 191, 0.1)",
  },
  locationIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  locationTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#ffffff",
  },
  locationText: {
    fontSize: "1rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginBottom: "30px",
  },
  locationBtn: {
    width: "100%",
    padding: "18px 24px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 25px rgba(45, 212, 191, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  locationBtnIcon: {
    fontSize: "1.2rem",
  },
  privacyNote: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  errorMessage: {
    padding: "12px 16px",
    borderRadius: "12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#FCA5A5",
    fontSize: "0.9rem",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorIcon: {
    fontSize: "1.1rem",
  },
  inputContainer: {
    width: "100%",
    maxWidth: "500px",
    marginBottom: "40px",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "18px 120px 18px 24px",
    borderRadius: "16px",
    border: "2px solid rgba(45, 212, 191, 0.3)",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    color: "#fff",
    fontSize: "1.1rem",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  nearbyBtn: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    background: "rgba(45, 212, 191, 0.1)",
    color: "#2dd4bf",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
  },
  primaryBtn: {
    width: "100%",
    padding: "18px 24px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 25px rgba(45, 212, 191, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none !important",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  navigation: {
    position: "absolute",
    bottom: "40px",
    left: "40px",
  },
  backBtn: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    background: "transparent",
    color: "#cbd5e1",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};