import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ListCartProductsComponent extends Component {
  @service offers;
  @service('cart') cartService;
  @service toast;
  @service router;

  @tracked showPayModal = false;
  @tracked selectedProducts = [];

  @action
  openModal() {
    this.showPayModal = true;
  }

  @action
  closeModal() {
    this.showPayModal = false;
  }

  @action
  setSelectedProducts(selected) {
    this.selectedProducts = selected;
  }

  @action
  calculateSubtotal(items) {
    let total = 0;

    items.forEach(item => {
      if (item.selected) {
        if (this.offers.isInOffer(item.product.id)) {
          total += this.calculateDiscountedAmount(
            item.product.discountPercentage,
            item.product.price,
            item.quantity
          );
        } else {
          total += item.product.price * item.quantity;
        }
      }
    });

    return total.toFixed(2);
  }

  @action
  calculateDiscountedAmount(offerPercent, price, quantity) {
    return (price - (price * offerPercent / 100)) * quantity;
  }

  @action
  handlePaymentSuccess(selectedProducts) {
    // 1. Remove paid products from cart
    selectedProducts.forEach((item) => {
      this.cartService.removeFromCart(item.product.id)
    });

    // 2. Optional: Show toast
    this.toast.show("Payment successful. Items removed from cart.");

    // 3. Optional: Navigate to success or orders page
    this.router.transitionTo('orders');
  }

}
