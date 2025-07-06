import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OrdersRoute extends Route {
  @service session;

  model() {
    const currentUser = this.session.currentUser;
    if (!currentUser) return [];

    const data = JSON.parse(localStorage.getItem('orders'));
    const allOrders = data?.orders || [];

    // 🔍 Filter orders that belong to current user
    return allOrders.filter(order => order.userId === currentUser.id);
  }
}
