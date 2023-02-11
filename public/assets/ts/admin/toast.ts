// the disable will be removed once we can import/export modules in the frontend

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showToast(message: string, intent: "success" | "fail") {
  const toast = document.getElementById("toast");

  const toastHeader = document.querySelector(".toast-header");
  const toastMessage = document.querySelector(".toast-message");
  const toastBody = document.querySelector(".toast-body");

  toastHeader.innerHTML = intent === "success" ? "Success" : "Failure";
  toastMessage.innerHTML = message;
  toast.classList.add("visible");
  toastBody.classList.add(intent);

  setTimeout(() => {
    toast.classList.remove("visible");
  }, 2000);
}
