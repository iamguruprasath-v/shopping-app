import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ListProducts extends Component {
    @service offers;

    constructor() {
        super(...arguments);
    }

    @action
    isInOffer(id) {
        let offeredProducts = this.offers.offeredProducts;
        let prodInOffer = offeredProducts.find(prod => prod.id == id);
        if (prodInOffer) return true;
        else return false;
    }
}
