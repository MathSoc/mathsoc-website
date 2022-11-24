class MobileNavigation {
  static registerButtonListeners() {
    const mobileNav = document.getElementById('mobile-nav');

    // register open button listeners
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
      mobileNav.classList.toggle('active');

      MobileNavigation.resizeMobileMenu();
    });

    this.registerDropdownListeners();
  }

  static registerDropdownListeners() {
    const mobileNav = document.getElementById('mobile-nav');
    const dropdowns = mobileNav.querySelectorAll('.dropdown');

    for (const dropdown of dropdowns) {
      const contentId = '.dropdown-content';

      if (dropdown.querySelector(contentId)) { // don't add sub-menu clickability if no items
        dropdown.addEventListener('click', () => {
          // close all other dropdowns first
          for (const closedDropdown of dropdowns) {
            closedDropdown.classList.remove('active');

            const closedContent = closedDropdown.querySelector(contentId);
            if (closedContent) {
              closedContent.style.maxHeight = '';
            }
          }

          dropdown.classList.toggle('active');
          if (dropdown.classList.contains('active')) {
            dropdown.querySelector(contentId).style.maxHeight = dropdown.querySelector(contentId).scrollHeight + 'px';
          } else {
            dropdown.querySelector(contentId).style.maxHeight = '';
          }

          MobileNavigation.resizeMobileMenu();
        });
      }
    }
  }

  static resizeMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav.classList.contains('active')) {
      const dropdowns = mobileNav.querySelectorAll('.dropdown');
      let height = 0;

      for (const dropdown of dropdowns) {
        height += dropdown.scrollHeight;

        const content = dropdown.querySelector('.dropdown-content');

        if (content && dropdown.classList.contains('active')) {
          height += content.scrollHeight;
        }
      }

      mobileNav.style.maxHeight = height + 'px';
    } else {
      mobileNav.style.maxHeight = ''
    }
  }
}

MobileNavigation.registerButtonListeners();
