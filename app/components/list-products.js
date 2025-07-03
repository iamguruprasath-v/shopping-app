import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListProducts extends Component {
  @service session;
  @service offers;
  @service('cart') cartService;
  @service products;

  @tracked showToast = false;
  @tracked toastMsg = '';

  @action
  isLoggedIn() {
    return this.session.isAuthenticated;
  }

  @action
  isProductInStock(id) {
    let stockCount = this.products.inStock(id);
    return stockCount > 0;
  }

  @action
  triggerToast(msg) {
    this.toastMsg = msg;
    this.showToast = true;

    // Auto-dismiss after 2s
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  @action 
  prodIsInOffer(prId) {
    return this.offers.isInOffer(prId)
  }


}
