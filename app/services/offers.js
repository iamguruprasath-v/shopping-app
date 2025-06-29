// app/services/offers.js
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OffersService extends Service {
  @tracked offeredProducts = [];
  @tracked totalSeconds = 30;
  interval = null;
  productPool = [];

  constructor() {
    super(...arguments);
    this.initializeProducts();
  }

  get minutes() {
    return Math.floor(this.totalSeconds / 60);
  }

  get seconds() {
    return this.totalSeconds % 60;
  }

  initializeProducts() {
    const stored = JSON.parse(localStorage.getItem('products')).products || [];
    this.productPool = [...stored];

    this.offeredProducts = this.pickRandomProducts(4);

    this.totalSeconds = 500;
    this.interval = setInterval(() => this.tick(), 1000);
  }

  pickRandomProducts(count) {
    const selected = [];

    for (let i = 0; i < count && this.productPool.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * this.productPool.length);
      const prod = this.productPool.splice(randomIndex, 1)[0];
      selected.push({ ...prod });
    }

    return selected;
  }

  tick() {
    this.totalSeconds--;

    if (this.totalSeconds <= 0) {
      // Return offered back to pool
      this.productPool.push(...this.offeredProducts);

      // Replace with new set
      this.offeredProducts = this.pickRandomProducts(4);
      this.totalSeconds = 30;
    }

    // Trigger reactivity
    this.offeredProducts = [...this.offeredProducts];
  }
}
