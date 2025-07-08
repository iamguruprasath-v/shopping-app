import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

const SHIPPINGINFOVALUES = {
  "Tomorrow": "Ships overnight",
  "1 - 2 Days": "Ships in 1-2 business days",
  "3 - 5 Days": "Ships in 3-5 business days",
  "1 Week": "Ships in 1 week",
  "2 Weeks": "Ships in 2 weeks",
  "1 Month": "Ships in 1 month"
}

export default class SidebarComponent extends Component {
  @tracked categories = [];
  @tracked selectedCategories = [];
  @tracked shippingInfos = ["Tomorrow", "1 - 2 Days", "3 - 5 Days", "1 Week", "2 Weeks", "1 Month"];
  @tracked selectedShippingInfo = [];
  @tracked sortOrder = null;
  @tracked isSidebarOpen = false;
  @tracked _price = null;
  @tracked hasUserTouchedPrice = false;

  constructor() {
    super(...arguments);
    this.fetchCategories();

    // Wait for initial render before setting slider
    setTimeout(() => {
      this._price = this.maxPrice;
    }, 0);
  }

  async fetchCategories() {
    const res = await fetch('https://dummyjson.com/products/categories');
    this.categories = await res.json();
  }

  @action
  toggleCategory(cat) {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
    } else {
      this.selectedCategories = [...this.selectedCategories, cat];
    }

    // Reset price if untouched
    if (!this.hasUserTouchedPrice) {
      this._price = this.maxPrice;
    }
  }

  @action
  toggleShippingInfo(info) {
    if (this.selectedShippingInfo.includes(info)) {
      this.selectedShippingInfo = this.selectedShippingInfo.filter(i => i !== info);
    } else {
      this.selectedShippingInfo = [...this.selectedShippingInfo, info];
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
  setSort(order) {
    this.sortOrder = order === 0 ? 'low-to-high' : 'high-to-low';
  }

  @action
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
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

  get filteredBeforePrice() {
    let result = this.args.searchFilteredRes || [];

    if (this.selectedCategories.length > 0) {
      result = result.filter(p => this.selectedCategories.includes(p.category));
    }

    if (this.selectedShippingInfo.length > 0) {
      const selectedShippingLabels = this.selectedShippingInfo.map(label => SHIPPINGINFOVALUES[label]);
      result = result.filter(p =>
        selectedShippingLabels.includes(p.shippingInformation ?? "Ships in 3-5 business days")
      );
    }

    return result;
  }

  get maxPrice() {
    const prices = this.filteredBeforePrice.map(p => p.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
  }

  get filteredProds() {
    let result = this.filteredBeforePrice;

    // Price filtering
    result = result.filter(p => Math.ceil(p.price) <= this.price);

    // Sorting
    if (this.sortOrder === 'low-to-high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'high-to-low') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }

  get toPopFilters() {
    return (
      this.args.searchQuery.length > 0 ||
      this.selectedCategories.length > 0 ||
      this.selectedShippingInfo.length > 0
    );
  }
}
