console.log("Firebase JS Loaded Successfully");

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAqhxdr_vaqwGup-lXmefwQFxMJErawlvw",

    authDomain:
        "restaurant-qr-ordering-fdf9b.firebaseapp.com",

    projectId:
        "restaurant-qr-ordering-fdf9b",

    storageBucket:
        "restaurant-qr-ordering-fdf9b.firebasestorage.app",

    messagingSenderId:
        "907571024375",

    appId:
        "1:907571024375:web:796894f82f2cae4d7b9ef2",

    measurementId:
        "G-G3Q89BDFF9"

};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// ============================================================
// VARIABLES
// ============================================================

window.confirmationResult = null;
window.recaptchaVerifier = null;


// ============================================================
// SEND OTP
// ============================================================

window.sendOTP = async function () {

    try {

        const mobileInput =
            document.getElementById("mobile");

        const sendButton =
            document.getElementById("sendBtn");

        const mobile =
            mobileInput.value.trim();


        // ----------------------------------------------------
        // VALIDATE MOBILE
        // ----------------------------------------------------

        if (
            !/^[6-9]\d{9}$/.test(mobile)
        ) {

            alert(
                "Please enter a valid 10-digit Indian mobile number."
            );

            return;

        }


        sendButton.disabled =
            true;

        sendButton.textContent =
            "Sending OTP...";


        const phoneNumber =
            "+91" + mobile;


        // ----------------------------------------------------
        // CREATE RECAPTCHA
        // ----------------------------------------------------

        if (
            !window.recaptchaVerifier
        ) {

            window.recaptchaVerifier =
                new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "normal"
                    }
                );


            await
                window.recaptchaVerifier.render();

        }


        // ----------------------------------------------------
        // SEND OTP
        // ----------------------------------------------------

        const confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phoneNumber,
                window.recaptchaVerifier
            );


        window.confirmationResult =
            confirmationResult;


        console.log(
            "OTP sent to:",
            phoneNumber
        );


        alert(
            "OTP Sent Successfully!"
        );


        // ----------------------------------------------------
        // HIDE MOBILE SECTION
        // ----------------------------------------------------

        document.getElementById(
            "mobileSection"
        ).style.display =
            "none";


        // ----------------------------------------------------
        // SHOW OTP SECTION
        // ----------------------------------------------------

        document.getElementById(
            "otpSection"
        ).style.display =
            "block";


        // ----------------------------------------------------
        // FOCUS OTP
        // ----------------------------------------------------

        const otpInput =
            document.getElementById("otp");

        if (otpInput) {

            otpInput.focus();

        }


    }

    catch (error) {

        console.error(
            "Firebase OTP Error:",
            error
        );


        sendButton.disabled =
            false;

        sendButton.textContent =
            "Send OTP";


        // ----------------------------------------------------
        // RESET RECAPTCHA
        // ----------------------------------------------------

        try {

            if (
                window.recaptchaVerifier
            ) {

                window.recaptchaVerifier.clear();

            }

        }

        catch (e) {

            console.warn(
                "reCAPTCHA reset error:",
                e
            );

        }


        window.recaptchaVerifier =
            null;


        alert(
            firebaseError(error)
        );

    }

};


// ============================================================
// VERIFY OTP
// ============================================================

window.verifyOTP = async function () {

    const otpInput =
        document.getElementById("otp");

    const verifyButton =
        document.querySelector(
            "#otpSection button"
        );


    const otp =
        otpInput.value.trim();


    // --------------------------------------------------------
    // VALIDATE OTP
    // --------------------------------------------------------

    if (
        !/^\d{6}$/.test(otp)
    ) {

        alert(
            "Please enter the 6-digit OTP."
        );

        return;

    }


    if (
        !window.confirmationResult
    ) {

        alert(
            "Please request OTP again."
        );

        return;

    }


    try {

        if (verifyButton) {

            verifyButton.disabled =
                true;

            verifyButton.textContent =
                "Verifying...";

        }


        // ----------------------------------------------------
        // VERIFY OTP
        // ----------------------------------------------------

        const result =
            await window.confirmationResult.confirm(
                otp
            );


        const user =
            result.user;


        console.log(
            "Restaurant owner logged in:",
            user.uid
        );


        // ====================================================
        // IMPORTANT
        //
        // Firebase UID becomes Restaurant ID
        // ====================================================

        const restaurantId =
            user.uid;


        // ====================================================
        // RESTAURANT DOCUMENT
        // ====================================================

        const restaurantRef =
            doc(
                db,
                "restaurants",
                restaurantId
            );


        const restaurantSnapshot =
            await getDoc(
                restaurantRef
            );


        // ====================================================
        // FIRST LOGIN
        // ====================================================

        if (
            !restaurantSnapshot.exists()
        ) {

            await setDoc(
                restaurantRef,
                {

                    ownerUid:
                        user.uid,

                    mobile:
                        user.phoneNumber || "",

                    restaurantName:
                        "My Restaurant",

                    name:
                        "My Restaurant",

                    upiId:
                        "",

                    upiName:
                        "",

                    logo:
                        "",

                    address:
                        "",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp(),

                    lastLoginAt:
                        serverTimestamp()

                }
            );


            console.log(
                "New restaurant profile created."
            );

        }

        // ====================================================
        // EXISTING RESTAURANT
        // ====================================================

        else {

            await setDoc(
                restaurantRef,
                {

                    ownerUid:
                        user.uid,

                    mobile:
                        user.phoneNumber || "",

                    lastLoginAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                },
                {
                    merge: true
                }
            );


            console.log(
                "Restaurant login information updated."
            );

        }


        // ====================================================
        // SAVE LOGIN DATA LOCALLY
        // ====================================================

        localStorage.setItem(
            "restaurantId",
            restaurantId
        );


        localStorage.setItem(
            "restaurantOwnerUid",
            user.uid
        );


        localStorage.setItem(
            "restaurantMobile",
            user.phoneNumber || ""
        );


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        alert(
            "Login Successful!"
        );


        // ====================================================
        // OPEN DASHBOARD
        // ====================================================

        window.location.href =
            "dashboard.html" +
            "?restaurantId=" +
            encodeURIComponent(
                restaurantId
            );

    }

    catch (error) {

        console.error(
            "OTP Verification Error:",
            error
        );


        if (verifyButton) {

            verifyButton.disabled =
                false;

            verifyButton.textContent =
                "Verify OTP";

        }


        alert(
            firebaseError(error)
        );

    }

};


// ============================================================
// FIREBASE ERROR HANDLER
// ============================================================

function firebaseError(error) {

    const code =
        error?.code || "";


    const messages = {

        "auth/invalid-phone-number":
            "Invalid mobile number.",

        "auth/too-many-requests":
            "Too many attempts. Please wait and try again.",

        "auth/quota-exceeded":
            "SMS quota exceeded. Please try again later.",

        "auth/billing-not-enabled":
            "Firebase billing is not enabled for Phone Authentication.",

        "auth/invalid-verification-code":
            "Incorrect OTP.",

        "auth/code-expired":
            "OTP expired. Please request a new OTP.",

        "auth/captcha-check-failed":
            "reCAPTCHA verification failed.",

        "auth/operation-not-allowed":
            "Phone Authentication is not enabled in Firebase.",

        "auth/network-request-failed":
            "Network error. Please check your internet connection."

    };


    return (
        messages[code] ||
        error?.message ||
        "Something went wrong."
    );

}


// ============================================================
// OPTIONAL: MAKE FIREBASE OBJECTS AVAILABLE
// ============================================================

window.firebaseAuth =
    auth;

window.firebaseDB =
    db;
