class QuickAddForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitForm.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
  }

  async onSubmitForm(e) {
    e.preventDefault();
    this.cartNotification.setActiveElement(document.activeElement);
    const submitBtn = this.querySelector('.feature-product__button-submit');

    submitBtn.setAttribute('disaled', true)
    submitBtn.querySelector('.feature-product__button-text').classList.add('quick-button__unactive');
    submitBtn.querySelector('.feature-product__button-text-adding').classList.add('quick-button__active');

    const body = JSON.stringify({
      ...JSON.parse(serializeForm(this.form)),
      sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });

    try {
      const response = await fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body });
      const product = await response.json();
      this.cartNotification.renderContents(product);
    }
    catch (error) {
      console.error(error);
    }
    finally {
      submitBtn.querySelector('.feature-product__button-text-adding').classList.remove('quick-button__active');
      submitBtn.querySelector('.feature-product__button-text-added').classList.add('quick-button__active');
      submitBtn.removeAttribute('disabled');
      setTimeout(() => {
        submitBtn.querySelector('.feature-product__button-text-added').classList.remove('quick-button__active');
        submitBtn.querySelector('.feature-product__button-text').classList.remove('quick-button__unactive');
      }, 1000)
    }
  }
}

if (!customElements.get('quick-add-form')) {
  customElements.define('quick-add-form', QuickAddForm);
}

class QuickAddModalOpener extends HTMLElement {
  constructor() {
    super();
    this.modal = this.querySelector('.quick-add-modal');
    this.openBtn = this.querySelector('.feature-product__button-modal');
    this.openBtn.addEventListener('click', this.openModal.bind(this));
    this.closeBtn = this.querySelector('.quick-add-modal__close');
    this.closeBtn.addEventListener('click', this.hideModal.bind(this));
    this.modal?.addEventListener('click', this.hideModalByOutsideClick.bind(this));
  }

  hideModalByOutsideClick(e) {
    if (this.modal?.classList.contains('modal-active') && e.target == this.modal) {
      this.hideModal();
    }
  }
  openModal() {
    this.modal?.classList.add('modal-active');
  }

  hideModal() {
    this.modal?.classList.remove('modal-active');
  }
}

if (!customElements.get('quick-add-modal-opener')) {
  customElements.define('quick-add-modal-opener', QuickAddModalOpener);
}

class QuickAddModal extends HTMLElement {
  constructor() {
    super();
    this.productVariantId = this.querySelector('.product-variant');
    this.addEventListener('change', this.onVariantChange);
    this.productImage = this.querySelector('.quick-product__media-img');
    this.priceCurrency = this.querySelector('.quick-product__price-block').getAttribute('data-money-format');
    this.price = this.querySelector('.quick-product__price');
    this.compareAtPrice = this.querySelector('.quick-product__compare-at-price');
  }

  onVariantChange() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => this.options[index] === option).includes(false);
    });
    this.productImage.setAttribute('src', this.currentVariant.featured_image.src);
    this.price.textContent = this.onChangePrice(this.currentVariant.price, this.priceCurrency);
    this.compareAtPrice.textContent = this.onChangePrice(this.currentVariant.compare_at_price, this.priceCurrency);
    this.currentVariant.compare_at_price > this.currentVariant.price
      ? this.compareAtPrice.classList.remove('hide')
      : this.compareAtPrice.classList.add('hide');

    this.productVariantId.setAttribute('value', this.currentVariant.id);

  }
  onChangePrice(cents, format) {
    if (typeof cents == 'string') { cents = cents.replace('.', ''); }
    let value = '';
    let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    let formatString = (format || this.money_format);

    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal = defaultOption(decimal, '.');

      if (isNaN(number) || number == null) { return 0; }

      number = (number / 100.0).toFixed(precision);

      let parts = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents = parts[1] ? (decimal + parts[1]) : '';

      return dollars + cents;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);

  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

if (!customElements.get('quick-add-modal')) {
  customElements.define('quick-add-modal', QuickAddModal)
}