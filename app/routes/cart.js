import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CartRoute extends Route {
    @service('cart') cartService;
    model() {
        let cartProds = this.cartService.cart;
        console.log(cartProds)
        return cartProds;
    }
}
