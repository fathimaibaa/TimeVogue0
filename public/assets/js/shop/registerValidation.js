const message = document.getElementById('message');
const errorMessage = document.getElementById('error-message');

const hide = (element) => {
  element.style.display = 'none';
};

setTimeout(() => hide(message), 3000);
setTimeout(() => hide(errorMessage), 3000);

function displayError(field, message, timeout = 3000) {
  const errorElement = document.getElementById(field + '-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.color = 'red'; 
    errorElement.style.display = 'block';
    setTimeout(() => hide(errorElement), timeout);
  }
}



function validateForm() {
  const userName = document.getElementById('user-name').value;
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-password').value;
  const repassword = document.getElementById('user-repassword').value;
  

 
  const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_]).{8,}$/;
  const nameRegex = /^[A-Z][a-zA-Z]{3,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  
  const passwordError = document.getElementById('password-error');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const repasswordError = document.getElementById('repassword-error');

  
  passwordError.textContent = '';
  nameError.textContent = '';
  emailError.textContent = '';
  repasswordError.textContent = '';

 

  let hasErrors = false;

  

  if (!passwordRegex.test(password)) {
    displayError(
      'password',
      'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.'
    );
    hasErrors = true;
  }

  if (userName.trim() === '') {
    displayError('name', 'Name is required.');
    hasErrors = true;
  } else if (userName.trim().length < 4 || !nameRegex.test(userName)) {
    displayError('name', 'Name should be at least 4 characters and start with a capital letter.');
    hasErrors = true;
  }

  if (email.trim() === '' || !emailRegex.test(email)) {
    displayError('email', 'Invalid email format.');
    hasErrors = true;
  }

  if (password.trim() === '') {
    displayError('password', 'Password is required.');
    hasErrors = true;
  }

  if (repassword.trim() === '') {
    displayError('repassword', 'Repeat Password is required.');
    hasErrors = true;
  }

  if (password !== repassword) {
    displayError('repassword', 'Passwords do not match.');
    hasErrors = true;
  }

  if (hasErrors) {
    return false;
  }

  return true;
}


