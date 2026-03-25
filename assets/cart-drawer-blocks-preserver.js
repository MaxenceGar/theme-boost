(function () {
  var cachedBlocksHTML = null;

  function init() {
    var drawerInner = document.querySelector('#CartDrawer .drawer__inner');
    if (!drawerInner) return;

    var blocks = drawerInner.querySelector('[data-cart-blocks]');
    if (blocks && blocks.innerHTML.trim() !== '') {
      cachedBlocksHTML = blocks.outerHTML;
    }

    var observer = new MutationObserver(function () {
      var current = drawerInner.querySelector('[data-cart-blocks]');

      if (current && current.innerHTML.trim() !== '') {
        cachedBlocksHTML = current.outerHTML;
      } else if (cachedBlocksHTML) {
        var header = drawerInner.querySelector('.drawer__header');
        if (header) {
          header.insertAdjacentHTML('afterend', cachedBlocksHTML);
        }
      }
    });

    observer.observe(drawerInner, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
