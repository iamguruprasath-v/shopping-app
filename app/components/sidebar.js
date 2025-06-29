import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

export default class SidebarComponent extends Component {
  @tracked categories = [];
  @tracked selectedCategories = [];
  @tracked sortOrder = null;
  @tracked isSidebarOpen = false;
  @tracked _price = null;
  @tracked hasUserTouchedPrice = false;

  constructor() {
    super(...arguments);
    this.fetchCategories();

    // Wait for initial render
    setTimeout(() => {
      this._price = this.maxPrice;
    }, 0);
  }

  async fetchCategories() {
    const res = await fetch('https://dummyjson.com/products/categories');
    this.categories = await res.json();
  }

  get filteredBeforePrice() {
    // Apply category filtering only
    let result = this.args.searchFilteredRes || [];
    if (this.selectedCategories.length > 0) {
      result = result.filter(p => this.selectedCategories.includes(p.category));
    }
    return result;
  }

  get maxPrice() {
    const prices = this.filteredBeforePrice.map(p => p.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
  }

  get price() {
    if (!this.hasUserTouchedPrice) {
      return this.maxPrice;
    }
    return this._price ?? this.maxPrice;
  }

  set price(val) {
    if (this._price !== val) {
      this._price = val;
    }
  }

  @action
  updatePrice(event) {
    this.hasUserTouchedPrice = true;
    debounce(this, () => {
      this.price = Number(event.target.value);
    }, 300);
  }

  @action
  toggleCategory(cat) {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
    } else {
      this.selectedCategories = [...this.selectedCategories, cat];
    }

    // Reset price if user hasn't touched slider
    if (!this.hasUserTouchedPrice) {
      this._price = this.maxPrice;
    }
  }

  @action
  setSort(order) {
    this.sortOrder = order === 0 ? 'low-to-high' : 'high-to-low';
  }

  @action
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  get toPopFilters() {
    return this.args.searchQuery.length > 0 || this.selectedCategories.length > 0;
  }

  get filteredProds() {
    let result = this.filteredBeforePrice;

    // Apply price filtering
    result = result.filter(p => Math.ceil(p.price) <= this.price);

    // Apply sort
    if (this.sortOrder === 'low-to-high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'high-to-low') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }
}
