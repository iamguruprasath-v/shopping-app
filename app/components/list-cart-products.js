import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const SHIPPING_VALUES_IN_DAYS = {
  'Ships overnight': 1,
  'Ships in 1 month': 30,
  'Ships in 1 week': 7,
  'Ships in 3-5 business days': 5,
  'Ships in 2 weeks': 14,
  'Ships in 1-2 business days': 2,
};

export default class ListCartProductsComponent extends Component {
  @service offers;
  @service('cart') cartService;
  @service toast;
  @service router;
  @service products;
  @service utils;

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
    // 1. Update stock
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
    this.cartService.createOrders({
      products: selectedProducts,
      total: this.calculateSubtotal(selectedProducts),
      createdAt: this.createdAt,
      deliveredOn: this.estimatedDeliveryDate
    });

    // 3. Remove all selected products at once
    const productIds = selectedProducts.map(item => item.product.id);
    this.cartService.removeMultipleFromCart(productIds);

    // 4. Toast and redirect
    this.toast.show("Payment Successful! Order placed ✅");
    this.router.transitionTo('orders');
  }

    // 5. Formatted order date
  get createdAt() {
    const date = new Date();
    return this.utils.formatDateTime(date);
  }


  get estimatedDeliveryDate() {
    let products = this.selectedProducts ?? [];
    let max = -1;

    products.forEach((prod) => {
      const key = prod?.product?.shippingInformation;
      const days = SHIPPING_VALUES_IN_DAYS[key] ?? 3;
      max = Math.max(max, days);
    });

    const createdAt = new Date(this.createdAt);
    createdAt.setDate(createdAt.getDate() + max);
    return this.utils.formatDateTime(createdAt);
  }


}
