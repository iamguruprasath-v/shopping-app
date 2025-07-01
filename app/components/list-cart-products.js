import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ListCartProductsComponent extends Component {
  @service offers;

  @action
  isInOffer(id) {
    return this.offers.isInOffer(id);
  }

  @action
  calculateDiscountedAmount(offerPercent, price) {
    return price - (price * offerPercent / 100);
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
}
