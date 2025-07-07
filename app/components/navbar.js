import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class Navbar extends Component {
    @service session;
    @service cart;
    @service offers;

    get isLoggedIn() {
        return this.session.isAuthenticated;
    }

    get favCount() {
        if (this.isLoggedIn) {
            return this.session.currentUser.favourites.length;
        }
    }

    get cartCount() {
        return this.cart.getCartCount();
    }

    @action
    isInOffer(id) {
        return this.offers.isInOffer(id);
    }

    @action
    logout() {
        if(confirm('Do you want to logout?')) {
            this.session.logout();
        }
    }

}
