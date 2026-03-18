if (!customElements.get('quantity-reductions')) {
  customElements.define(
    'quantity-reductions',
    class QuantityReductions extends HTMLElement {
      constructor() {
        super();

        this.sectionId = this.dataset.sectionId;
        this.allReductions = this.querySelectorAll('.product-reductions__item');
        this.inputQuantity = this.querySelector('#quantityReductions');
        this.allReductions.forEach((reduction) => {
          reduction.addEventListener('click', (e) => this.handleClickOnEl(e, reduction));
        });
      }

      handleClickOnEl(event, elClicked) {
        const parentContainer = event.target.closest('.product-reductions__item');

        if (parentContainer) {
          document
            .querySelectorAll(`#ProductInfo-${this.sectionId} [data-price-container]`)
            .forEach((priceContainer) => this.updatePrice(priceContainer, parentContainer));

          // Update price in buy button
          const buttonPrice = document.querySelector(`#price-${this.sectionId}`);
          if (buttonPrice) {
            buttonPrice.textContent = parentContainer.dataset.salePrice;
          }

          this.inputQuantity.value = parentContainer.dataset.quantity;
          this.allReductions.forEach((item) => item.classList.remove('active'));
          parentContainer.classList.add('active');
        }
      }

      updatePrice(priceContainer, parentContainer) {
        const comparePrice = priceContainer.querySelector('.price__sale span s');
        const salePrice = priceContainer.querySelector('.price-item--sale');

        if (comparePrice && salePrice) {
          const saleTag = priceContainer.querySelector('.product__sale-badge');
          comparePrice.textContent = parentContainer.dataset.comparePrice;
          salePrice.textContent = parentContainer.dataset.salePrice;
          if (saleTag) saleTag.textContent = parentContainer.dataset.saleTag;
        } else {
          const regularPrice = priceContainer.querySelector('.price__regular .price-item');
          regularPrice.textContent = parentContainer.dataset.salePrice;
        }
      }
    },
  );
}
