class PalierCartDrawer extends HTMLElement {
  connectedCallback() {
    this.update();
  }

  update() {
    try {
      const cartTotal = parseInt(this.dataset.cartTotal || '0', 10);
      const maxAmount = parseInt(this.dataset.maxAmount || '0', 10);
      const messageTemplate = this.dataset.message || '';

      if (!Number.isFinite(cartTotal) || !Number.isFinite(maxAmount)) {
        console.warn('PalierCartDrawer: Invalid data attributes');
        return;
      }

      if (maxAmount <= 0) return;

      const percent = Math.min((cartTotal / maxAmount) * 100, 100);
      const fillEl = this.querySelector('.palier-bar__fill');
      const messageEl = this.querySelector('.palier-message');

      requestAnimationFrame(() => {
        // Mettre à jour la barre
        if (fillEl) {
          fillEl.style.width = `${percent}%`;
        }

        // Mettre à jour le message avec # remplacé par le prix restant
        if (messageEl && messageTemplate) {
          const remaining = Math.ceil((maxAmount - cartTotal) / 100);
          const formattedMessage = messageTemplate.replace('#', remaining + '€');
          messageEl.textContent = formattedMessage;
        }
      });
    } catch (error) {
      console.error('PalierCartDrawer error:', error);
    }
  }
}

if (!customElements.get('palier-cart-drawer')) {
  customElements.define('palier-cart-drawer', PalierCartDrawer);
}
