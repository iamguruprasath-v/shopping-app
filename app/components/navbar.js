import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class Navbar extends Component {
    @service session;

    @action
    isLoggedIn() {
        console.log(this.session.isAuthenticated)
        return this.session.isAuthenticated;
    }

    get favCount() {
        return this.session.currentUser.favourites?.length;
    }
}
