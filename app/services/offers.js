// app/services/offers.js
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OffersService extends Service {
  @tracked offeredProducts = [];
  @tracked totalSeconds = 0;

  interval = null;
  productPool = [];
  offerDuration = 600; // seconds = 5 mins

  constructor() {
    super(...arguments);
    this.loadOffers();
  }

  get minutes() {
    return String(Math.floor(this.totalSeconds / 60)).padStart(2, '0');
  }

  get seconds() {
    return String(this.totalSeconds % 60).padStart(2, '0');
  }

  /**
   * Load offers from localStorage if valid, else reset new offers.
   */
  loadOffers() {
    const allProducts = JSON.parse(localStorage.getItem('products'))?.products || [];
    this.productPool = [...allProducts];

    const savedOffers = JSON.parse(localStorage.getItem('offeredProducts'));
    const startTimestamp = parseInt(localStorage.getItem('offerStartTime'), 10);

    if (savedOffers && startTimestamp) {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      const remaining = this.offerDuration - elapsed;

      if (remaining > 0) {
        this.offeredProducts = savedOffers;
        this.totalSeconds = remaining;
        this.startInterval();
        return;
      }
    }

    this.resetOffers(); // else create new offers
  }

  /**
   * Pick new offers, store in localStorage and restart timer
   */
  resetOffers() {
    this.offeredProducts = this.pickRandomProducts(4);
    this.totalSeconds = this.offerDuration;

    localStorage.setItem('offeredProducts', JSON.stringify(this.offeredProducts));
    localStorage.setItem('offerStartTime', `${Date.now()}`);

    this.startInterval();
  }

  /**
   * Pick N random products from eligible pool (stock > 5)
   */
  pickRandomProducts(count) {
    const eligible = this.productPool.filter(p => p.stock > 5);
    const selected = [];

    for (let i = 0; i < count && eligible.length > 0; i++) {
      const index = Math.floor(Math.random() * eligible.length);
      const prod = eligible.splice(index, 1)[0];

      selected.push({ ...prod, inOffer: true });
      this.productPool = this.productPool.filter(p => p.id !== prod.id); // avoid repeats
    }

    return selected;
  }

  /**
   * Start countdown timer and reset offers on expiry
   */
  startInterval() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      if (this.totalSeconds <= 1) {
        this.productPool.push(...this.offeredProducts);
        this.resetOffers(); // refresh offers
      } else {
        this.totalSeconds--;
      }
    }, 1000);
  }

  /**
   * Check if a product is in offer
   */
  isInOffer(productId) {
    return this.offeredProducts.some(p => p.id === productId);
  }
}
