import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class CartItem extends Component {
  @service offers;

  @action
  isInOffer(id) {
    return this.offers.isInOffer(id);
  }

  @action
  calculateDiscountedAmount(offerPercent, price) {
    return parseFloat(price - (price * offerPercent / 100)).toFixed(2);
  }
}
