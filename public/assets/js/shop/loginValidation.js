
const form = document.getElementById("loginForm");
const emailInput = form.querySelector('input[name="email"]');
const passwordInput = form.querySelector('input[name="password"]');
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const submitButton = document.getElementById("submitButton");


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function isValidEmail(email) {
    return emailRegex.test(email);
}


function validateForm() {
    let valid = true;

    if (!isValidEmail(emailInput.value)) {
        emailError.textContent = "Please enter a valid email address.";
        valid = false;
    } else {
        emailError.textContent = "";
    }

    if (passwordInput.value.trim() === "") {
        passwordError.textContent = "Password is required.";
        valid = false;
    } else {
        passwordError.textContent = "";
    }

    
    submitButton.disabled = !valid;

    return valid;
}


emailInput.addEventListener("blur", validateForm);
passwordInput.addEventListener("blur", validateForm);


form.addEventListener("submit", function (e) {
    if (!validateForm()) {
        e.preventDefault(); 
    }
});