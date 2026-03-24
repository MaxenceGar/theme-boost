document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.insta__slider[data-section-id]').forEach(function (el) {
    if (typeof Swiper === 'undefined') return;

    const sectionId = el.dataset.sectionId;
    const slidesCount = parseInt(el.dataset.slides, 10);

    new Swiper('#InstagramSwiper-' + sectionId, {
      slidesPerView: 2.2,
      spaceBetween: 12,
      navigation: {
        prevEl: el.querySelector('.swiper-button-prev'),
        nextEl: el.querySelector('.swiper-button-next'),
      },
      breakpoints: {
        750: {
          enabled: false,
          slidesPerView: slidesCount,
          spaceBetween: 16,
        },
      },
    });
  });
});
