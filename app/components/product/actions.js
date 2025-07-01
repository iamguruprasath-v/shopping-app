import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProductActionsComponent extends Component {
  @service session;
  @service offers;
  @service toast;

  @tracked showToast = false;
  @tracked toastMsg = '';

  get isInCart() {
    return this.session.currentUser?.cart?.some(item => item.id === this.args.product.id);
  }

  get isInFavourites() {
    return this.session.currentUser?.favourites?.some(item => item === this.args.product.id);
  }

  @action
  addToCart() {
    if(!this.session.currentUser) {
      this.toast.show("Signin or Register to continue.");
      return;
    }
    this.session.currentUser.cart.pushObject(this.args.product);
    this.session.updateUserToDB(this.session.currentUser);
  }

  @action
  addToFavourites() {
    if(!this.session.currentUser) {
      this.toast.show("Signin or Register to continue.");
      return;
    }
    this.session.addOrRemFav(this.args.product.id, 1);
    this.toast.show("Added To Favourites")
  }

  @action
  removeFavourites() {
    this.session.addOrRemFav(this.args.product.id, 0);
    this.toast.show("Removed From Favourites")
  }

  get roundedRating() {
    console.log(this.args.product)
    return Math.round(this.args.product.rating);
  }

  get emptyStars() {
    return 5 - this.roundedRating;
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

  
}
