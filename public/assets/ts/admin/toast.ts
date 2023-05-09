export function showToast(message: string, intent: "success" | "fail") {
  const toast = document.getElementById("toast");

  const toastHeader = document.querySelector(".toast-header");
  const toastMessage = document.querySelector(".toast-message");
  const toastBody = document.querySelector(".toast-body");

  toastHeader.innerHTML = intent === "success" ? "Success" : "Failure";
  toastMessage.innerHTML = message;

  if (toast.classList.contains("visible")) {
    return;
  }

  toast.classList.add("visible");
  toastBody.classList.add(intent);

  setTimeout(
    () => {
      toast.classList.remove("visible");
    },
    intent === "success" ? 2000 : 8000
  );
}
