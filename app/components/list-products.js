import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ListProducts extends Component {
    @service offers;

    constructor() {
        super(...arguments);
    }

    @action
    prodIsInOffer(id) {
        return this.offers.isInOffer(id);
    }
}
