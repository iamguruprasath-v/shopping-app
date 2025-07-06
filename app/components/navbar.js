import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class Navbar extends Component {
    @service session;
    @service cart;
    @service offers;

    @action
    isLoggedIn() {
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
    logout() {
        this.session.logout();
    }

}
