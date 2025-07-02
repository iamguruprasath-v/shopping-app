import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ListCartProductsComponent extends Component {
  @service offers;
  @service('cart') cartService;
  @service router;
  @service toast

  @action
  isInOffer(id) {
    return this.offers.isInOffer(id);
  }

  @action
  calculateDiscountedAmount(offerPercent, price) {
    return parseFloat(price - (price * offerPercent / 100)).toFixed(2);
  }

  get subtotal() {
    let total = 0;

    for (let prod of this.args.cartProducts || []) {
      let price = prod.product.price;

      if (this.isInOffer(prod.product.id)) {
        price = this.calculateDiscountedAmount(prod.product.discountPercentage, prod.product.price);
      }

      total += price * prod.quantity;
    }

    return total.toFixed(2);
  }

  @action
  getCartQuantityCount() {
    return this.cartService.getCartCount();
  }

  @action
  clearCart() {
    if(confirm("Do you want to clear the cart? ")) {
      this.cartService.updateCart(0, 'clear');
    }
    this.router.refresh();
  }

  @action
  addQuantity(item) {
    if(item.quantity >= item.product.stock) this.toast.show(`Vendor has only ${item.product.stock} Stock`)
    else {
      this.cartService.updateCart(item.product.id, 'update', 1);
      this.router.refresh();}
  }

  @action
  removeQuantity(id) {
    this.cartService.updateCart(id, 'update', -1);
    this.router.refresh();
  }

  @action
  removeItem(id) {
    if(confirm("Do you want to remove this item?")) {
      this.cartService.updateCart(id, 'remove');
    }
    this.router.refresh();
  }
}
