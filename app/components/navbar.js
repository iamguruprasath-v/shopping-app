import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class Navbar extends Component {
    @service session;
    @service cart;
    @service offers;

    @action
    isLoggedIn() {
        console.log(this.session.isAuthenticated)
        return this.session.isAuthenticated;
    }

    get favCount() {
        return this.session.currentUser?.favourites?.length;
    }

    @action
    getCartCount() {
        return this.cart.getCartCount();
    }

    @action
    isInOffer(id) {
        return this.offers.isInOffer(id);
    }

    @action
    getSubTotal() {
        let total = 0;

        for (let prod of this.cart.cart || []) {
          let price = prod.product.price;

          if (this.isInOffer(prod.product.id)) {
            price = this.calculateDiscountedAmount(prod.product.discountPercentage, prod.product.price);
          }

          total += price * prod.quantity;
        }

        return total.toFixed(2);
  }
}
