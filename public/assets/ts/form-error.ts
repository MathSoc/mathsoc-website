const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const button = document.getElementById("email-btn");

button.addEventListener("click", (event: Event) => {
  const emailInput = document.getElementById(
    "email"
  ) as HTMLInputElement | null;
  const errorMessage = document.getElementById(
    "email-error"
  ) as HTMLElement | null;

  if (emailInput && errorMessage) {
    const emailValue = emailInput.value.trim();

    // Check if the email field is empty
    if (emailValue === "") {
      event.preventDefault();
      errorMessage.textContent = "Please fill out this field";
      errorMessage.style.display = "block";
    }
    // Check if email is valid
    else if (!EMAIL_PATTERN.test(emailValue)) {
      event.preventDefault();
      errorMessage.textContent = "Please enter a valid email address";
      errorMessage.style.display = "block";
    } else {
      errorMessage.style.display = "none";
    }
  }
});
