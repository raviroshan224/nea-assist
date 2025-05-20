    import React, { useState, useEffect } from "react";
    import { auth } from "../firebase";
    import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
    import { useNavigate } from "react-router-dom";
    import "./Auth.css";
    import { onAuthStateChanged } from "firebase/auth"; // ⬅️ Make sure this is imported
    import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // ⬅️ Add this
    import { db } from "../firebase"; // ⬅️ Your Firestore instance

    const Signup = () => {
    const navigate = useNavigate();
    

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
        navigate("/"); // Redirect to home or dashboard if already logged in
        }
    });

    return () => unsubscribe(); // Cleanup on unmount
    }, [navigate]);


    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    });

    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [firebaseError, setFirebaseError] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation functions
    const validateName = (name) => {
        if (!name.trim()) return "Full name is required";
        if (name.trim().length < 3) return "Name must be at least 3 characters";
        return "";
    };

    const validatePhone = (phone) => {
        if (!phone.trim()) return "Phone number is required";
        if (/[a-zA-Z]/.test(phone)) return "Phone number cannot contain letters";
        const nepPhoneRegex = /^(9[678]\d{8})$/;
        if (!nepPhoneRegex.test(phone.trim()))
        return "Invalid Nepali phone number (e.g., 9801234567)";
        return "";
    };

    const validateEmail = (email) => {
        if (!email.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return "Invalid email address";
        return "";
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
        return "Password must contain letters and numbers";
        return "";
    };

    // Validate entire form on each change
    useEffect(() => {
        const nameError = validateName(formData.name);
        const phoneError = validatePhone(formData.phone);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        setErrors({
        name: nameError,
        phone: phoneError,
        email: emailError,
        password: passwordError,
        });

        setIsValid(!nameError && !phoneError && !emailError && !passwordError);
        setFirebaseError("");
    }, [formData]);

    const handleBlur = (e) => {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };



    const handleSignup = async (e) => {
    e.preventDefault();

    setTouched({
        name: true,
        phone: true,
        email: true,
        password: true,
    });

    if (!isValid) return;

    setLoading(true);
    setFirebaseError("");

    try {
        const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
        );

        await updateProfile(userCredential.user, {
        displayName: formData.name,
        });

        // ✅ Save to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        createdAt: serverTimestamp(),
        });

        setLoading(false);
        navigate("/");
    } catch (err) {
        setLoading(false);
        if (err.code === "auth/email-already-in-use") {
        setFirebaseError("This email is already registered");
        } else if (err.code === "auth/weak-password") {
        setFirebaseError("Password is too weak");
        } else {
        setFirebaseError("Signup failed. Please try again.");
        }
    }
    };


    return (
        <div className="auth-container">
        <div className="auth-box" role="form" aria-label="Signup Form">
            <h2>Create Account</h2>

            {firebaseError && <div className="error-msg firebase-error">{firebaseError}</div>}

            <form onSubmit={handleSignup} noValidate>
            <div className="input-group">
                <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="name-error"
                aria-invalid={touched.name && !!errors.name}
                />
                {touched.name && errors.name && (
                <small id="name-error" className="error-msg">
                    {errors.name}
                </small>
                )}
            </div>

            <div className="input-group">
                <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="phone-error"
                aria-invalid={touched.phone && !!errors.phone}
                />
                {touched.phone && errors.phone && (
                <small id="phone-error" className="error-msg">
                    {errors.phone}
                </small>
                )}
            </div>

            <div className="input-group">
                <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="email-error"
                aria-invalid={touched.email && !!errors.email}
                />
                {touched.email && errors.email && (
                <small id="email-error" className="error-msg">
                    {errors.email}
                </small>
                )}
            </div>

            <div className="input-group">
                <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="password-error"
                aria-invalid={touched.password && !!errors.password}
                />
                {touched.password && errors.password && (
                <small id="password-error" className="error-msg">
                    {errors.password}
                </small>
                )}
            </div>

            <button
                type="submit"
                className="submit-btn"
                disabled={!isValid || loading}
                aria-disabled={!isValid || loading}
            >
                {loading ? "Signing Up..." : "Sign Up"}
            </button>
            </form>

            <p className="switch-text">
            Already have an account?{" "}
            <span role="button" tabIndex={0} onClick={() => navigate("/login")}>
                Login here
            </span>
            </p>
        </div>
        </div>
    );
    };

    export default Signup;
