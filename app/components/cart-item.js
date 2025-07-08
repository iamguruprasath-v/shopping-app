import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CartItem extends Component {
  @service offers;
  @service toast;
  @service('cart') cartService;

  @tracked quantity;
  @tracked selected = true;

  SHIPPING_VALUES_IN_DAYS = {
  'Ships overnight': 1,
  'Ships in 1 month': 30,
  'Ships in 1 week': 7,
  'Ships in 3-5 business days': 5,
  'Ships in 2 weeks': 14,
  'Ships in 1-2 business days': 2,
};


  constructor() {
    super(...arguments);
    this.quantity = Math.min(this.args.item.quantity, this.args.item.product.stock);
    this.selected = this.args.item.selected ?? true;
  }

  get item() {
    return {
      ...this.args.item,
      quantity: this.quantity,
      selected: this.selected
    };
  }

  get isInOffer() {
    return this.offers.isInOffer(this.item.product.id);
  }

  @action
  addQuantity() {
    if (this.quantity >= this.item.product.stock) {
      return this.toast.show(`Only ${this.item.product.stock} in stock`);
    }

    this.quantity++;
    this.args.updateQuantity({ ...this.item, quantity: this.quantity });
    this.cartService.updateQuantity(this.item.product.id, 1);
  }

  @action
  reduceQuantity() {
    if (this.quantity === 1) {
      return this.removeFromCart();
    }

    this.quantity--;
    this.args.updateQuantity({ ...this.item, quantity: this.quantity });
    this.cartService.updateQuantity(this.item.product.id, -1);
  }

  @action
  removeFromCart() {
    if (confirm('Do you want to remove this product from cart?')) {
      this.args.removeProduct(this.item);
    }
  }

  @action
  updateItemSelectionStatus() {
    this.selected = !this.selected;
    this.args.toggleSelection({
      ...this.item,
      selected: this.selected
    });
  }
}
