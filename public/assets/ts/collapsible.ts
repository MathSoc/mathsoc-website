const collapsible = document.getElementsByClassName("collapsible-button");

for (let i = 0; i < collapsible.length; i++) {
  collapsible[i].addEventListener("click", function () {
    this.classList.toggle("active");
    const content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      content.style.paddingBottom = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      content.style.paddingBottom = "18px";
    }
  });
}
