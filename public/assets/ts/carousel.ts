class Carousel {
  private element: HTMLElement;
  private slideIndex: number = 1;

  constructor(container: HTMLElement) {
    this.element = container;

    this.element.querySelector(".prev").addEventListener("click", () => {
      this.plusSlides(-1);
    });
    this.element.querySelector(".next").addEventListener("click", () => {
      this.plusSlides(1);
    });

    this.element.querySelectorAll(".dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        this.showSlide(parseInt(dot.getAttribute("data-index")));
      });
    });

    this.showSlide(this.slideIndex);
  }

  plusSlides(n: number) {
    this.showSlide(this.slideIndex + n);
  }

  currentSlide(n: number) {
    this.showSlide(n);
  }

  showSlide(newSlideIndex: number) {
    const slides = Array.from(
      this.element.querySelectorAll(".mySlides")
    ) as HTMLElement[];

    const dots = this.element.querySelectorAll(".dot");

    if (newSlideIndex > slides.length) {
      this.slideIndex = 1;
    } else if (newSlideIndex < 1) {
      this.slideIndex = slides.length;
    } else {
      this.slideIndex = newSlideIndex;
    }

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("active");
    }

    slides[this.slideIndex - 1].style.display = "block";
    dots[this.slideIndex - 1].classList.add("active");
  }
}

class CarouselInitializer {
  static carousels: Carousel[] = [];

  static init() {
    const carouselContainers = Array.from(
      document.getElementsByClassName("carousel")
    ) as HTMLElement[];

    for (const container of carouselContainers) {
      this.carousels.push(new Carousel(container));
    }
  }
}

CarouselInitializer.init();
