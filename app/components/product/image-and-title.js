import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ProductImageAndTitleComponent extends Component {
  @service offers;

  @action
  checkProdIsInoffer(id) {
    return this.offers.isInOffer(id);
  }

}
