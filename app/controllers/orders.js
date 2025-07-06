import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class OrdersController extends Controller {
    @service('cart') cartService;
}
