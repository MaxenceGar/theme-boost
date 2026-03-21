class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true },
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;

      // 🔧 FIX: Préserver les blocks (palier, timer, text, divider) lors du refetch
      if (section.id === 'cart-drawer') {
        const blocksContainer = sectionElement.querySelector('[data-blocks-wrapper]');
        const savedBlocks = blocksContainer ? blocksContainer.innerHTML : null;

        sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);

        // Réinsérer les blocks dans le nouveau HTML
        if (savedBlocks) {
          const newBlocksContainer = sectionElement.querySelector('[data-blocks-wrapper]');
          if (newBlocksContainer) {
            newBlocksContainer.innerHTML = savedBlocks;
          }
        }
      } else {
        sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      }
    });

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

// Cart Timer - Réservation des produits
class CartTimer {
  constructor() {
    this.timerEl = document.getElementById('cart-timer');
    if (!this.timerEl) return;

    // Lire durée depuis data-duration ou défaut 10 minutes
    const durationMinutes = parseInt(this.timerEl.dataset.duration) || 10;
    this.TIMER_DURATION = durationMinutes * 60; // en secondes
    this.STORAGE_KEY = 'cart_timer_end';
    this.init();
  }

  init() {
    let endTime = localStorage.getItem(this.STORAGE_KEY);

    if (!endTime || parseInt(endTime) < Date.now()) {
      endTime = Date.now() + this.TIMER_DURATION * 1000;
      localStorage.setItem(this.STORAGE_KEY, endTime);
    }

    this.endTime = parseInt(endTime);
    this.updateTimer();
    this.interval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    const remaining = Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    this.timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remaining <= 0) {
      this.timerEl.textContent = '00:00';
      localStorage.removeItem(this.STORAGE_KEY);
      clearInterval(this.interval);
    }
  }
}

// Initialiser le timer quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => new CartTimer());

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
