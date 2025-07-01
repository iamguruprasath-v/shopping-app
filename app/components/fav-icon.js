import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class FavIcon extends Component {
    @service session;   


    get currUser() {
        // console.log(this.session.currUser)
        return this.session.currentUser;
    }

    get isFavourite() {
        // console.log(this.currUser)
        return this.currUser?.favourites?.includes(this.args.prod.id);
    }

    @action
    favClickHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    let id = this.args.prod.id;
    let isFav = this.currUser.favourites.includes(id);

    this.session.addOrRemFav(id, isFav ? 0 : 1);

    // Callback to parent
    this.args.notify?.(isFav ? 'Removed from favourites' : 'Added to favourites');
    }

}
