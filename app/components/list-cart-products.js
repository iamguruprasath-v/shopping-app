import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ListCartProductsComponent extends Component {
  @service offers;
  @service('cart') cartService;
  @service toast;
  @service router;
  @service products;

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
  handlePayment(selectedProducts) {
    // 1. Update stock & availability
    selectedProducts.forEach(item => {
      let prod = item.product;
      prod.stock -= item.quantity;

      if (prod.stock <= 0) {
        prod.stock = 0;
        prod.availability = 'Out of Stock';
      }

      this.products.updateProduct(prod);
    });

    // 2. Create order
    const order = this.cartService.createOrders({
      products: selectedProducts,
      total: this.calculateSubtotal(selectedProducts),
    });

    // 3. Remove from cart
    selectedProducts.forEach(item => {
      this.cartService.removeFromCart(item.product.id);
    });

    // 4. Feedback
    this.toast.show("Payment Successful! Order placed ✅");

    // 5. Go to orders page
    this.router.transitionTo('orders');
  }

}
