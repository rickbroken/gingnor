const header = document.querySelector('.site-header');
const toggle = document.querySelector('.navigation__toggle');
const menu = document.getElementById('primary-menu');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    toggle.setAttribute('aria-expanded', String(newState));
    menu.setAttribute('aria-expanded', String(newState));

    header?.classList.toggle('header--open', newState);
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-expanded', 'false');
      header?.classList.remove('header--open');
    }
  });
}

const form = document.querySelector('.cta__form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = new FormData(form).get('email');
    if (email) {
      alert('¡Gracias! Muy pronto recibirás noticias sobre Gingnor.');
    }
  });
}

const slider = document.querySelector('.features-slider');

if (slider) {
  const slides = Array.from(slider.querySelectorAll('.feature-slide'));
  const controls = Array.from(slider.querySelectorAll('.features-slider__control'));
  const totalSlides = slides.length;
  let currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains('is-active')),
  );
  const autoplayDelay = Number(slider.getAttribute('data-autoplay')) || 6500;
  slider.style.setProperty('--slide-duration', `${autoplayDelay}ms`);
  let autoplayId;

  const restartControlAnimation = () => {
    const activeControl = controls[currentIndex];
    if (!activeControl) {
      return;
    }
    activeControl.classList.remove('is-active');
    void activeControl.offsetWidth;
    activeControl.classList.add('is-active');
    activeControl.setAttribute('aria-selected', 'true');
    activeControl.setAttribute('tabindex', '0');
  };

  const setActiveSlide = (nextIndex) => {
    slides.forEach((slide, index) => {
      const isActive = index === nextIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    controls.forEach((control, index) => {
      const isActive = index === nextIndex;
      control.classList.toggle('is-active', isActive);
      control.setAttribute('aria-selected', String(isActive));
      control.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    currentIndex = nextIndex;
    restartControlAnimation();
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = undefined;
    }
  };

  const startAutoplay = () => {
    if (totalSlides <= 1) {
      return;
    }
    stopAutoplay();
    slider.classList.remove('is-paused');
    restartControlAnimation();
    autoplayId = window.setInterval(() => {
      const nextIndex = (currentIndex + 1) % totalSlides;
      setActiveSlide(nextIndex);
    }, autoplayDelay);
  };

  const pauseAutoplay = () => {
    if (totalSlides <= 1) {
      return;
    }
    stopAutoplay();
    slider.classList.add('is-paused');
  };

  const resumeAutoplayIfAllowed = () => {
    if (totalSlides <= 1) {
      return;
    }
    if (slider.matches(':hover') || slider.contains(document.activeElement)) {
      pauseAutoplay();
      return;
    }
    startAutoplay();
  };

  const goToSlide = (targetIndex) => {
    const nextIndex = ((targetIndex % totalSlides) + totalSlides) % totalSlides;
    if (nextIndex === currentIndex) {
      restartControlAnimation();
      return;
    }
    setActiveSlide(nextIndex);
    resumeAutoplayIfAllowed();
  };

  controls.forEach((control, index) => {
    control.addEventListener('click', () => {
      goToSlide(index);
    });

    control.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = (index + 1) % totalSlides;
        controls[nextIndex]?.focus();
        goToSlide(nextIndex);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const previousIndex = (index - 1 + totalSlides) % totalSlides;
        controls[previousIndex]?.focus();
        goToSlide(previousIndex);
      }
    });
  });

  slider.addEventListener('mouseenter', pauseAutoplay);
  slider.addEventListener('mouseleave', resumeAutoplayIfAllowed);

  slider.addEventListener('focusin', pauseAutoplay);
  slider.addEventListener('focusout', () => {
    window.setTimeout(() => {
      resumeAutoplayIfAllowed();
    }, 0);
  });

  setActiveSlide(currentIndex);
  resumeAutoplayIfAllowed();
}
