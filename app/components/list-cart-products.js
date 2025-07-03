import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ListCartProductsComponent extends Component {
  @service offers;
  
  @action
  calculateSubtotal(items) {
    console.log("After removed", items)
    let total = 0;
    items.forEach(item => {
      if (item.selected) {
        if (this.offers.isInOffer(item.product.id)) total += this.calculateDiscountedAmount(item.product.discountPercentage, item.product.price, item.quantity)
        else total += item.product.price * item.quantity;
      }
    })

    return total.toFixed(2)
  }

  calculateDiscountedAmount(offerPercent, price, quantity) {
    return (price - (price * offerPercent / 100)) * quantity;
  }
}