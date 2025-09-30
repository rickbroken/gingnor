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
