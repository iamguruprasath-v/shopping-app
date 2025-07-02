// ===========================================
// UPDATED COMPONENT
// ===========================================

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ListCartProductsComponent extends Component {
  @service offers;
  @service('cart') cartService;
  @service router;
  @service toast;

  // Use the service's reactive allCartItems directly
  get allItems() {
    return this.cartService.allCartItems;
  }

  @action
  isInOffer(id) {
    return this.offers.isInOffer(id);
  }

  @action
  calculateDiscountedAmount(offerPercent, price) {
    return parseFloat(price - (price * offerPercent / 100)).toFixed(2);
  }

  // Use allItems instead of args.cartProducts for reactivity
  get subtotal() {
    let total = 0;

    for (let prod of this.allItems || []) {
      let price = prod.product.price;

      if (this.isInOffer(prod.product.id)) {
        price = this.calculateDiscountedAmount(prod.product.discountPercentage, prod.product.price);
      }

      total += price * prod.quantity;
    }

    return total.toFixed(2);
  }

  // Use the reactive getter
  get cartQuantityCount() {
    return this.cartService.cartCount;
  }

  @action
  clearCart() {
    if (confirm("Do you want to clear the cart?")) {
      this.cartService.clearCart(); // Use the direct method
    }
    // Remove router.refresh() - not needed with reactivity
  }

  @action
  addQuantity(item) {
    if (item.quantity >= item.product.stock) {
      this.toast.show(`Vendor has only ${item.product.stock} Stock`);
    } else {
      this.cartService.updateQuantity(item.product.id, 1); // Use direct method
    }
    // Remove router.refresh() - not needed with reactivity
  }

  @action
  removeQuantity(id) {
    this.cartService.updateQuantity(id, -1); // Use direct method
    // Remove router.refresh() - not needed with reactivity
  }

  @action
  removeItem(id) {
    if (confirm("Do you want to remove this item?")) {
      this.cartService.removeFromCart(id); // Use direct method
    }
    // Remove router.refresh() - not needed with reactivity
  }
}