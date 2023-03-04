class CarouselSlide {
  dot: HTMLElement;
  image: HTMLElement;
  index: number;

  constructor(image: HTMLElement, dot: HTMLElement, index: number) {
    this.image = image;
    this.dot = dot;
    this.index = index;
  }

  makeActive() {
    this.dot.classList.add("active");
    this.image.classList.add("active");
  }

  makeInactive() {
    this.dot.classList.remove("active");
    this.image.classList.remove("active");
  }
}

class Carousel {
  private element: HTMLElement;
  private slideIndex: number = 1;
  private slides: CarouselSlide[] = [];
  private timeOfLastChange: number = Date.now();
  private readonly DELAY_BETWEEN_AUTO_UPDATES = 6 * 1000;

  constructor(container: HTMLElement) {
    this.element = container;

    this.initializeSlides();
    this.initializeControls();

    this.showSlide(this.slides[0]);
    this.setAutoChangeTimeout();
  }

  private initializeSlides() {
    const slideImages = Array.from(
      this.element.querySelectorAll(".slide")
    ) as HTMLElement[];
    const dots = Array.from(
      this.element.querySelectorAll(".dot")
    ) as HTMLElement[];
    for (let i = 0; i < slideImages.length && i < dots.length; i++) {
      this.slides.push(new CarouselSlide(slideImages[i], dots[i], i));
    }
  }

  private initializeControls() {
    this.element.querySelector(".prev").addEventListener("click", () => {
      this.plusSlides(-1);
    });
    this.element.querySelector(".next").addEventListener("click", () => {
      this.plusSlides(1);
    });

    for (const slide of this.slides) {
      slide.dot.addEventListener("click", () => {
        this.showSlide(slide);
      });
    }
  }

  private plusSlides(slideIncrement: number) {
    const mathModulus = (n: number, m: number) => ((n % m) + m) % m;

    const targetSlide = this.slides.find(
      (slide) =>
        slide.index ===
        mathModulus(this.slideIndex + slideIncrement, this.slides.length)
    );

    this.showSlide(targetSlide);
  }

  private showSlide(target: CarouselSlide) {
    for (const slide of this.slides) {
      if (slide === target) {
        slide.makeActive();
      } else {
        slide.makeInactive();
      }
    }

    this.slideIndex = target.index;
    this.timeOfLastChange = Date.now();
  }

  private setAutoChangeTimeout() {
    const timeElapsedSinceLastChange = Date.now() - this.timeOfLastChange;

    setTimeout(() => {
      if (timeElapsedSinceLastChange < this.DELAY_BETWEEN_AUTO_UPDATES) {
        this.setAutoChangeTimeout();
        return;
      }

      this.plusSlides(1);
      this.setAutoChangeTimeout();
    }, this.DELAY_BETWEEN_AUTO_UPDATES - timeElapsedSinceLastChange);
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
