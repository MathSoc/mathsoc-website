export function showToast(
  message: string | string[],
  intent: "success" | "fail"
) {
  const toast = document.getElementById("toast");

  const toastHeader = document.querySelector(".toast-header");
  const toastMessage = document.querySelector(".toast-message");
  const toastBody = document.querySelector(".toast-body");

  toastHeader.innerHTML = intent === "success" ? "Success" : "Failure";
  if (typeof message == "string") {
    toastMessage.innerHTML = message;
  } else if (Array.isArray(message)) {
    const html = `<ul>${message
      .map((item) => `<li>${item}</li>`)
      .join("")}</ul>`;
    console.log(html);
    toastMessage.innerHTML = html;
  }

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
