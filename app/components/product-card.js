import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ProductCardComponent extends Component {
  @service offers;
  @service session;
  @service('cart') cartService;
  @service toast;

  get isInOffer() {
    return this.offers.isInOffer(this.args.product.id);
  }



  get isInStock() {
    return this.args.product.stock > 0;
  }

  @action
  async addToCart(event) {
    console.log("reaching")
    event.preventDefault();
    event.stopPropagation();

    try {
      let res = await this.cartService.updateCart(this.args.product.id, "add", 1);
      console.log(res)
      this.toast.show(res.message);
    } catch (error) {
      console.log(error)
      this.toast.show("Unknown Error Occured");
    }
  }
}
