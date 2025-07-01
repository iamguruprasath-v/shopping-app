// app/components/offered-products.js
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object'; 
export default class OfferedProducts extends Component {
  @service offers;
  
  @service session;

  @tracked showToast = false;
  @tracked toastMsg = '';

  @action
  isLoggedIn() {
    console.log(this.session.isAuthenticated);
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
}
