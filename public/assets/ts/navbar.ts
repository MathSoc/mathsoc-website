class MobileNavigation {
  static registerButtonListeners() {
    const mobileNav = document.getElementById("mobile-nav");

    // register open button listeners
    document
      .getElementById("mobile-menu-button")
      .addEventListener("click", () => {
        mobileNav.classList.toggle("active");

        MobileNavigation.resizeMobileMenu();
      });

    this.registerDropdownListeners();
  }

  static registerDropdownListeners() {
    const mobileNav = document.getElementById("mobile-nav");
    const dropdowns = Array.from(mobileNav.querySelectorAll(".dropdown"));

    for (const dropdown of dropdowns) {
      const contentId = ".dropdown-content";

      if (dropdown.querySelector(contentId)) {
        // don't add sub-menu clickability if no items
        dropdown.addEventListener("click", () => {
          // close all other dropdowns first
          for (const closedDropdown of dropdowns) {
            closedDropdown.classList.remove("active");

            const closedContent = closedDropdown.querySelector(
              contentId
            ) as HTMLElement;
            if (closedContent) {
              closedContent.style.maxHeight = "";
            }
          }

          dropdown.classList.toggle("active");
          const content = dropdown.querySelector(contentId) as HTMLElement;
          if (dropdown.classList.contains("active")) {
            content.style.maxHeight =
              dropdown.querySelector(contentId).scrollHeight + "px";
          } else {
            content.style.maxHeight = "";
          }

          MobileNavigation.resizeMobileMenu();
        });
      }
    }
  }

  static resizeMobileMenu() {
    const mobileNav = document.getElementById("mobile-nav");
    if (mobileNav.classList.contains("active")) {
      const dropdowns = Array.from(mobileNav.querySelectorAll(".dropdown"));
      let height = 0;

      for (const dropdown of dropdowns) {
        height += dropdown.scrollHeight;

        const content = dropdown.querySelector(".dropdown-content");

        if (content && dropdown.classList.contains("active")) {
          height += content.scrollHeight;
        }
      }

      mobileNav.style.maxHeight = height + "px";
    } else {
      mobileNav.style.maxHeight = "";
    }
  }
}

MobileNavigation.registerButtonListeners();
