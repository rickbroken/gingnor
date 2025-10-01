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
const formMessage = document.querySelector('.cta__form-message');

const setFormMessage = (message, type = 'success') => {
  if (!formMessage) {
    return;
  }
  formMessage.textContent = message;
  formMessage.dataset.variant = type;
};

const sendResendEmail = async (email) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'No fue posible enviar el correo.');
  }
};

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();

    if (!email) {
      setFormMessage('Por favor escribe un correo válido para continuar.', 'error');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton?.setAttribute('disabled', 'true');
    setFormMessage('Enviando tu registro...', 'info');

    try {
      await sendResendEmail(email);
      form.reset();
      setFormMessage(
        '¡Listo! Revisa tu bandeja de entrada, pronto recibirás noticias y recursos exclusivos.',
        'success',
      );
    } catch (error) {
      console.error(error);
      setFormMessage(
        'Tuvimos un inconveniente al registrarte. Por favor intenta nuevamente en unos minutos.',
        'error',
      );
    } finally {
      submitButton?.removeAttribute('disabled');
    }
  });
}

const initializeFeaturesSlider = (sliderElement) => {
  const viewport = sliderElement.querySelector('.features-slider__viewport');
  const slides = Array.from(sliderElement.querySelectorAll('.feature-slide'));
  const paginationItems = Array.from(
    sliderElement.querySelectorAll('.features-slider__pagination-item'),
  );
  const prevButton = sliderElement.querySelector('.features-slider__arrow--prev');
  const nextButton = sliderElement.querySelector('.features-slider__arrow--next');
  const totalSlides = slides.length;

  if (!viewport || totalSlides === 0) {
    sliderElement.classList.add('is-inactive');
    return;
  }

  slides.forEach((slide, index) => {
    slide.dataset.index = String(index);
  });

  let currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains('is-active')),
  );
  const autoplayDelay = Number(sliderElement.getAttribute('data-autoplay')) || 6500;
  let autoplayId;
  let isDragging = false;
  let activePointerId = null;
  let dragStartX = 0;
  let lastDragDelta = 0;
  let hasMoved = false;
  let dragStartIndex = -1;

  const setActiveSlide = (nextIndex) => {
    const previousIndex = (nextIndex - 1 + totalSlides) % totalSlides;
    const upcomingIndex = (nextIndex + 1) % totalSlides;

    slides.forEach((slide, index) => {
      const isActive = index === nextIndex;
      const isPrev = totalSlides > 1 && index === previousIndex && index !== nextIndex;
      const isNext = totalSlides > 1 && index === upcomingIndex && index !== nextIndex;
      const isDormant = !isActive && !isPrev && !isNext;

      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-prev', isPrev);
      slide.classList.toggle('is-next', isNext);
      slide.classList.toggle('is-dormant', isDormant);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    paginationItems.forEach((item, index) => {
      const isActive = index === nextIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    currentIndex = nextIndex;
    sliderElement.style.setProperty('--drag-offset', '0px');
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
    sliderElement.classList.remove('is-paused');
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
    sliderElement.classList.add('is-paused');
  };

  const resumeAutoplayIfAllowed = () => {
    if (totalSlides <= 1 || isDragging) {
      return;
    }
    if (
      sliderElement.matches(':hover') ||
      sliderElement.contains(document.activeElement)
    ) {
      pauseAutoplay();
      return;
    }
    startAutoplay();
  };

  const goToSlide = (targetIndex) => {
    const nextIndex = ((targetIndex % totalSlides) + totalSlides) % totalSlides;
    if (nextIndex === currentIndex) {
      sliderElement.style.setProperty('--drag-offset', '0px');
      return;
    }
    setActiveSlide(nextIndex);
    resumeAutoplayIfAllowed();
  };

  paginationItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
    });
  }

  const startDrag = (event) => {
    if (!event.isPrimary || (event.button !== undefined && event.button !== 0)) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    if (
      event.target.closest('.features-slider__arrow') ||
      event.target.closest('.features-slider__pagination')
    ) {
      return;
    }

    const slideTarget = event.target.closest('.feature-slide');

    if (!slideTarget) {
      return;
    }

    isDragging = true;
    hasMoved = false;
    dragStartX = event.clientX;
    lastDragDelta = 0;
    dragStartIndex = slides.indexOf(slideTarget);
    activePointerId = event.pointerId;

    sliderElement.classList.add('is-dragging', 'is-grabbing');
    sliderElement.style.setProperty('--drag-offset', '0px');
    pauseAutoplay();

    if (typeof sliderElement.setPointerCapture === 'function') {
      try {
        sliderElement.setPointerCapture(activePointerId);
      } catch (error) {
        // Ignore pointer capture errors
      }
    }
  };

  const handleDragMove = (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartX;

    if (Math.abs(deltaX) > 3) {
      hasMoved = true;
    }

    lastDragDelta = deltaX;
    const limitedOffset = Math.max(Math.min(deltaX, 240), -240);
    sliderElement.style.setProperty('--drag-offset', `${limitedOffset}px`);
  };

  const finishDrag = (event, cancelled = false) => {
    if (!isDragging || (activePointerId !== null && event.pointerId !== activePointerId)) {
      return;
    }

    if (
      typeof sliderElement.releasePointerCapture === 'function' &&
      activePointerId !== null
    ) {
      try {
        sliderElement.releasePointerCapture(activePointerId);
      } catch (error) {
        // Ignore pointer capture errors
      }
    }

    sliderElement.classList.remove('is-dragging', 'is-grabbing');
    sliderElement.style.setProperty('--drag-offset', '0px');

    const deltaX = cancelled ? 0 : lastDragDelta || event.clientX - dragStartX;
    const movedEnough = Math.abs(deltaX) > 80;
    const movedDuringGesture = hasMoved;

    isDragging = false;
    hasMoved = false;
    activePointerId = null;
    dragStartX = 0;

    if (movedEnough) {
      goToSlide(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    } else if (!movedDuringGesture && dragStartIndex !== -1 && dragStartIndex !== currentIndex) {
      goToSlide(dragStartIndex);
    } else {
      resumeAutoplayIfAllowed();
    }

    dragStartIndex = -1;
    lastDragDelta = 0;
  };

  sliderElement.addEventListener('pointerdown', startDrag);
  sliderElement.addEventListener('pointermove', handleDragMove);
  sliderElement.addEventListener('pointerup', (event) => finishDrag(event));
  sliderElement.addEventListener('pointercancel', (event) => finishDrag(event, true));

  sliderElement.addEventListener('mouseenter', pauseAutoplay);
  sliderElement.addEventListener('mouseleave', resumeAutoplayIfAllowed);

  sliderElement.addEventListener('focusin', pauseAutoplay);
  sliderElement.addEventListener('focusout', () => {
    window.setTimeout(() => {
      resumeAutoplayIfAllowed();
    }, 0);
  });

  setActiveSlide(currentIndex);
  resumeAutoplayIfAllowed();
};

const slider = document.querySelector('.features-slider');

if (slider) {
  initializeFeaturesSlider(slider);
}
