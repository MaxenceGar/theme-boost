/**
 * Cart Drawer - Blocks Preserver
 *
 * Préserve les blocks (palier, timer, text, divider) lors des mises à jour AJAX du panier.
 * Crée le wrapper s'il n'existe pas dans le HTML retourné.
 */

(function() {
  const cartDrawer = document.querySelector('cart-drawer');
  if (!cartDrawer) return;

  const originalRenderContents = cartDrawer.renderContents;

  cartDrawer.renderContents = function(parsedState) {
    // 1. Sauvegarder les blocks AVANT le refetch
    const blocksWrapper = this.querySelector('[data-blocks-wrapper]');
    const savedBlocksHTML = blocksWrapper ? blocksWrapper.innerHTML : null;

    // 2. Appeler le renderContents original
    originalRenderContents.call(this, parsedState);

    // 3. Réinsérer les blocks APRÈS le refetch
    if (savedBlocksHTML) {
      requestAnimationFrame(() => {
        let newBlocksWrapper = this.querySelector('[data-blocks-wrapper]');

        // Si le wrapper n'existe pas, le créer et l'insérer au bon endroit
        if (!newBlocksWrapper) {
          newBlocksWrapper = document.createElement('div');
          newBlocksWrapper.setAttribute('data-blocks-wrapper', '');

          const cartDrawerItems = this.querySelector('cart-drawer-items');
          if (cartDrawerItems) {
            cartDrawerItems.parentNode.insertBefore(newBlocksWrapper, cartDrawerItems);
          }
        }

        // Réinsérer les blocks sauvegardés
        newBlocksWrapper.innerHTML = savedBlocksHTML;
      });
    }
  };
})();
