import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class AllCarts extends Component {
    @service('cart') cartService;
}
