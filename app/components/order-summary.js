import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';



export default class OrderSummary extends Component {
  @service offers;
  @service utils;
  @tracked isPaying = false;
  @tracked isOpen = true;

  @action
  isInOffer(id) {
    return this.offers.isInOffer(id);
  }

  @action
  calculateTotal(price, quantity) {
    return (price * quantity).toFixed(2);
  }

  @action
  calculateDiscountedPrice(price, discount, quantity) {
    let discounted = price - (price * discount / 100);
    return (discounted * quantity).toFixed(2);
  }

  @action
  closeModal() {
    this.isOpen = false;
    if (this.args.onClose) {
      this.args.onClose(); // notifies parent
    }
  }

  @action
  payNow() {
    this.isPaying = true;

    setTimeout(() => {
      this.isPaying = false;
      this.closeModal();

      if (this.args.onPay) {
        this.args.onPay();
      }
    }, 3000); // 3 seconds for testing
  }

}
