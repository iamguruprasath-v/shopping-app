import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ProductActionsComponent extends Component {
  @service session;

  get isInCart() {
    return this.session.currentUser?.cart?.some(item => item.id === this.args.product.id);
  }

  get isInFavourites() {
    return this.session.currentUser?.favourites?.some(item => item.id === this.args.product.id);
  }

  @action
  addToCart() {
    this.session.currentUser.cart.pushObject(this.args.product);
    this.session.updateUserToDB(this.session.currentUser);
  }

  @action
  addToFavourites() {
    this.session.currentUser.favourites.pushObject(this.args.product);
    this.session.updateUserToDB(this.session.currentUser);
  }
}
