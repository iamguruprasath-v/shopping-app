import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class FavIcon extends Component {
    @service session;   
    @service toast;


    get currUser() {
        return this.session.currentUser;
    }

    get isFavourite() {
        return this.currUser?.favourites?.includes(this.args.prod.id);
    }

    @action
    favClickHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    let currUser = this.currUser;
    if(!currUser) this.toast.show("Sign or Register to Continue")
    let id = this.args.prod.id;
    let isFav = this.currUser.favourites.includes(id);

    this.session.addOrRemFav(id, isFav ? 0 : 1);

    // Callback to parent
    this.toast.show(isFav ? 'Removed from favourites' : 'Added to favourites');
    }

}
