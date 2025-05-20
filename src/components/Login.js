import React, { useState, useEffect } from "react";
import { auth, provider, db } from "../firebase"; // ✅ include db
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";



const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Redirect user if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // redirect to homepage
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setErrorMsg(
        error.code === "auth/user-not-found"
          ? "No account found with this email."
          : error.code === "auth/wrong-password"
          ? "Incorrect password. Please try again."
          : "Login failed, please try again."
      );
    }
  };


const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email,
        phone: user.phoneNumber || "",
        createdAt: serverTimestamp(),
      });
    }

    navigate("/"); // or wherever your app goes after login
  } catch (error) {
    console.error("Google login error:", error);
    // show user-friendly error if needed
  }
};


  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Login to Your Account</h2>
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <div style={styles.separator}>OR</div>

        <button onClick={handleGoogleLogin} disabled={loading} style={styles.googleBtn}>
          <img
            src="https://img.icons8.com/color/20/000000/google-logo.png"
            alt="Google"
            style={{ marginRight: "8px" }}
          />
          Continue with Google
        </button>

        <p style={styles.switchText}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/signup")}>
            Sign up now
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f0f2f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  googleBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    textAlign: "center",
    margin: "20px 0",
    fontWeight: "bold",
    color: "#999",
  },
  switchText: {
    marginTop: "15px",
    fontSize: "14px",
    textAlign: "center",
  },
  link: {
    color: "#007bff",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
};

export default Login;
