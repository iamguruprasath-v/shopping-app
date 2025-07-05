// routes/orders.js
import Route from '@ember/routing/route';

export default class OrdersRoute extends Route {
  model() {
    const data = JSON.parse(localStorage.getItem('orders'));
    return data?.orders || [];
  }
}
