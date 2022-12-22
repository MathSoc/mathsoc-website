var collapsible = document.getElementsByClassName("collapsible-button");
var i;

for (i = 0; i < collapsible.length; i++) {
    collapsible[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.maxHeight){
        content.style.maxHeight = null;
        content.style.paddingBottom = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.paddingBottom = "18px";
      }
    });
  }