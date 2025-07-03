import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CartItem extends Component {
  @service offers;
  @service toast;
  @service('cart') cartService;

  @tracked item = this.args.item;

  @action
  isInOffer(id) {
    return this.offers.isInOffer(id);
  }

  @action
  calculateDiscountedAmount(offerPercent, price) {
    return parseFloat(price - (price * offerPercent / 100)).toFixed(2);
  }

  @action
  addQuantity() {

    if(this.item.quantity >= this.item.product.stock) return this.toast.show(`vendor only has ${this.item.quantity} stock`);
    this.item = {...this.item, quantity: this.item.quantity + 1}
    this.args.updateQuantity(this.item);
    this.cartService.updateQuantity(this.item.product.id, 1);
    
  }

  @action
  removeFromCart() {
    if(confirm('Do you want to remove this product from cart?')) {
      this.args.removeProduct(this.item);
    }
  }

  @action
  reduceQuantity() {
    if (this.item.quantity == 1) {
      this.removeFromCart(this.item);
    } else {
      this.item = {...this.item, quantity: this.item.quantity - 1}
      this.args.updateQuantity(this.item);
      this.cartService.updateQuantity(this.item.product.id, -1)
    }
  }

  @action
  updateItemSelectionStatus() {
    console.log("reaching", this.item)
    this.item = { ...this.item, selected: !this.item.selected };
    this.args.toggleSelection(this.item);
  }
}
