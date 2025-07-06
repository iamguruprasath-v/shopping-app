// app/components/offered-products.js
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object'; 
export default class OfferedProducts extends Component {
  @service offers;
  
  @service session;
  @service('cart') cartService;
  @service toast;

  @tracked showToast = false;
  @tracked toastMsg = '';

  @action
  isLoggedIn() {
    return this.session.isAuthenticated;
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

  @action
  async addToCart(id, event) {
    event.preventDefault();
    event.stopPropagation();

    try {
      let res = await this.cartService.addToCart(id, 1);
      this.toast.show(res.message);
    } catch (error) {
      console.log(error)
      this.toast.show("Unknown Error Occured");
    }
  }
}
