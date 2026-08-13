console.log("Firebase JS Loaded Successfully");

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqhxdr_vaqwGup-lXmefwQFxMJErawlvw",
  authDomain: "restaurant-qr-ordering-fdf9b.firebaseapp.com",
  projectId: "restaurant-qr-ordering-fdf9b",
  storageBucket: "restaurant-qr-ordering-fdf9b.firebasestorage.app",
  messagingSenderId: "907571024375",
  appId: "1:907571024375:web:796894f82f2cae4d7b9ef2",
  measurementId: "G-G3Q89BDFF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Send OTP
window.sendOTP = async function () {

  try {

    const mobile = document.getElementById("mobile").value.trim();

    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const phoneNumber = "+91" + mobile;

    // Create reCAPTCHA only once
    if (!window.recaptchaVerifier) {

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal"
        }
      );

      await window.recaptchaVerifier.render();
    }

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = confirmationResult;

    alert("OTP Sent Successfully!");

    // Hide Mobile Section
    document.getElementById("mobileSection").style.display = "none";

    // Show OTP Section
    document.getElementById("otpSection").style.display = "block";

  } catch (error) {

    console.error("Firebase Error:", error);
    alert(error.message);

  }

};

// Verify OTP
window.verifyOTP = async function () {

  const otp = document.getElementById("otp").value.trim();

  if (otp === "") {
    alert("Please enter OTP.");
    return;
  }

  try {

    await window.confirmationResult.confirm(otp);

    alert("Login Successful!");

  } catch (error) {

    console.error(error);
    alert("Invalid OTP");

  }

};

// Button Click
document.getElementById("sendBtn").addEventListener("click", window.sendOTP);