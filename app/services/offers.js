// app/services/offers.js
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OffersService extends Service {
  @tracked offeredProducts = [];
  @tracked totalSeconds = 0;

  interval = null;
  productPool = [];
  offerDuration = 500;

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

  loadOffers() {
    const storedAllProducts = JSON.parse(localStorage.getItem('products'))?.products || [];
    this.productPool = [...storedAllProducts];

    const storedOffers = JSON.parse(localStorage.getItem('offeredProducts'));
    const startedAt = parseInt(localStorage.getItem('offerStartTime'), 10);

    if (storedOffers && startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = this.offerDuration - elapsed;

      if (remaining > 0) {
        this.offeredProducts = storedOffers;
        this.totalSeconds = remaining;
        this.startInterval();
        return;
      }
    }

    this.resetOffers();
  }

  resetOffers() {
    this.offeredProducts = this.pickRandomProducts(4);
    this.totalSeconds = this.offerDuration;

    localStorage.setItem('offeredProducts', JSON.stringify(this.offeredProducts));
    localStorage.setItem('offerStartTime', `${Date.now()}`);

    this.startInterval();
  }

  pickRandomProducts(count) {
    const selected = [];

    for (let i = 0; i < count && this.productPool.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * this.productPool.length);
      const prod = this.productPool.splice(randomIndex, 1)[0];

      selected.push({ ...prod, inOffer: true });
    }

    return selected;
  }

  startInterval() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      if (this.totalSeconds <= 1) {
        this.productPool.push(...this.offeredProducts);
        this.resetOffers(); // This will also restart timer
      } else {
        this.totalSeconds--;
      }
    }, 1000);
  }
}
