import React, { useState, useEffect } from "react";
import "./Home.css";
import logo from "./logo.jpg";
import about from "./pic1.jpg";
import backgroundVideo from "./background.mp4.mp4"; // adjust path if needed

function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Backend base URL
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Users fetched from backend
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [API_BASE]);

  // Signup states
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1=form, 2=questions, 3=success

  const [usernameError, setUsernameError] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [emailError, setEmailError] = useState("");

  // MCQ Questions
  const questions = [
    {
      question: "Which is the largest ocean in the world?",
      options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
      answer: "Pacific Ocean",
    },
    {
      question: "Who is known as the father of computers?",
      options: ["Charles Babbage", "Albert Einstein", "Isaac Newton", "Alan Turing"],
      answer: "Charles Babbage",
    },
    {
      question: "What is the capital of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      answer: "Tokyo",
    },
  ];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState([]);

  // Reset Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Validation functions
  const validateUsername = (username) =>
    /^(?=.*[!@#$%^&*(),.?":{}|<>])[^\s_]{8,}$/.test(username);
  const validateMobileNumber = (mobileNumber) => /^\d{10}$/.test(mobileNumber);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(
      validateUsername(value)
        ? ""
        : "Username must be at least 8 characters, no underscores, and contain a special character."
    );
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    setMobileNumber(value);
    setMobileNumberError(
      validateMobileNumber(value) ? "" : "Mobile number must contain exactly 10 digits."
    );
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value) ? "" : "Invalid email address.");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert("Login successful!");
    e.target.reset();
    setIsLoginOpen(false);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!usernameError && !mobileNumberError && !emailError) {
      setStep(2); // go to MCQ step
    } else {
      alert("Please correct the errors before submitting.");
    }
  };

  // Call backend after LAST MCQ
  const handleFinalSignup = async (finalAnswers) => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          mobile: mobileNumber,
          email,
          password,
          gkAnswers: finalAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Sign up failed");
        return;
      }

      // Success
      setStep(3);
      setUsername("");
      setMobileNumber("");
      setEmail("");
      setPassword("");
    } catch (err) {
      alert("Could not reach server. Is the backend running on http://localhost:5000?");
    }
  };

  const handleAnswer = () => {
    if (!selected) {
      alert("Please select an answer.");
      return;
    }

    const updated = [...answers, selected];
    setAnswers(updated);
    setSelected("");

    const nextIndex = currentQ + 1;

    if (nextIndex < questions.length) {
      setCurrentQ(nextIndex);
    } else {
      handleFinalSignup(updated); // last question → send data
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    alert("Password reset successful!");
    setOldPassword("");
    setNewPassword("");
    setIsForgotPasswordOpen(false);
  };

  return (
    <div className="home-container">
      {/* Background Video */}
      <div className="video-background">
        <video autoPlay loop muted className="video">
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="coastal-beacon-logo">
          <img src={logo} alt="Coastal Beacon Logo" className="logo" />
          <h1 className="logo-text">Coastal Beacon</h1>
        </div>
        <div className="top-right-links">
          <span className="link home">Home</span>
          <span className="link login" onClick={() => setIsLoginOpen(true)}>
            Login
          </span>
          <span
            className="link signup"
            onClick={() => {
              setIsSignupOpen(true);
              setStep(1);
              setCurrentQ(0);
              setAnswers([]);
              setSelected("");
            }}
          >
            Sign Up
          </span>
        </div>
      </header>

      {/* Center Title */}
      <div className="center-title">
        <h2>Proactive Coastal and Tourist Information</h2>
        <h2>Welcome to Coastal Beacon</h2>
        <h2>Your Journey, Our Insights</h2>
      </div>

      {/* Login Dialog */}
      {isLoginOpen && (
        <div className="login-dialog">
          <div className="dialog-content glow-border">
            <button className="close-button" onClick={() => setIsLoginOpen(false)}>
              X
            </button>
            <h2>Login Page</h2>
            <form onSubmit={handleLoginSubmit}>
              <label>
                Username:<input type="text" required />
              </label>
              <label>
                Password:<input type="password" required />
              </label>
              <button type="submit">Login</button>
              <div className="dialog-links">
                <a
                  href="#"
                  onClick={() => {
                    setIsSignupOpen(true);
                    setIsLoginOpen(false);
                    setStep(1);
                  }}
                >
                  Create an account
                </a>
                <br />
                <a
                  href="#"
                  onClick={() => {
                    setIsForgotPasswordOpen(true);
                    setIsLoginOpen(false);
                  }}
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signup Dialog */}
      {isSignupOpen && (
        <div className="login-dialog">
          <div className="dialog-content glow-border">
            <button className="close-button" onClick={() => setIsSignupOpen(false)}>
              X
            </button>
            <h2>Sign Up</h2>

            {step === 1 && (
              <form onSubmit={handleSignupSubmit}>
                <label>
                  Username:
                  <input type="text" value={username} onChange={handleUsernameChange} required />
                  {usernameError && <p className="error-message">{usernameError}</p>}
                </label>
                <label>
                  Mobile Number:
                  <input type="text" value={mobileNumber} onChange={handleMobileNumberChange} required />
                  {mobileNumberError && <p className="error-message">{mobileNumberError}</p>}
                </label>
                <label>
                  Email:
                  <input type="email" value={email} onChange={handleEmailChange} required />
                  {emailError && <p className="error-message">{emailError}</p>}
                </label>
                <label>
                  Password:
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button type="submit">Submit</button>
              </form>
            )}

            {step === 2 && (
              <div className="mcq-step">
                <h3>Answer the Questions</h3>
                <p>{questions[currentQ].question}</p>
                <div className="options">
                  {questions[currentQ].options.map((opt) => (
                    <label key={opt}>
                      <input
                        type="radio"
                        name="answer"
                        value={opt}
                        checked={selected === opt}
                        onChange={(e) => setSelected(e.target.value)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                <button onClick={handleAnswer}>
                  {currentQ + 1 === questions.length ? "Submit" : "Next"}
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="success-message">
                <h3>🎉 Registered Successfully!</h3>
                <button onClick={() => setIsSignupOpen(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Dialog */}
      {isForgotPasswordOpen && (
        <div className="login-dialog">
          <div className="dialog-content glow-border">
            <button className="close-button" onClick={() => setIsForgotPasswordOpen(false)}>
              X
            </button>
            <h2>Reset Password</h2>
            <form onSubmit={handleResetSubmit}>
              <label>
                Old Password:
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </label>
              <label>
                New Password:
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="reset-btn">
                Reset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* About Section */}
      <section className="about-section">
        <div className="about-text">
          <h2>About Our Project</h2>
          <p>
            Coastal Beacon provides proactive coastal and tourist information.
            Our mission is to keep travelers safe and informed with real-time updates.
          </p>
          <p>
            With innovation and technology, we bring you accurate data about
            weather, safety, and cultural highlights while exploring coastal areas.
          </p>
          <button className="explore-btn">
            Explore <span className="arrow">→</span>
          </button>
        </div>
        <div className="about-image">
          <img src={about} alt="About Coastal Beacon" />
        </div>
      </section>

      {/* Show fetched users for testing */}
      <section className="users-section">
        <h2>Registered Users (from MySQL)</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.username} — {u.email}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Home;
