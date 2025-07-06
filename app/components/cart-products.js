import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CartProducts extends Component {
    @service('cart') cartService;
    get cartItems () {
        let cartProds = this.cartService.loadCart();
        return cartProds;
    }

    @action
    clearCart() {   
        if (confirm("Really Want to Clear the Cart?")) {
            this.cartItems = [];
            this.cartService.clearCart();
        }
    }
}
