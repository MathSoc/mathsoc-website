let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n: number) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n: number) {
  showSlides(slideIndex = n);
}

function showSlides(n: number) {
  let i: number;
  let slides = Array.from(document.getElementsByClassName("mySlides")) as HTMLElement[];
  let dots = document.getElementsByClassName("dot");

  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}
