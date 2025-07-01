// app/routes/product.js
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProductRoute extends Route {
  @service products;

  model(params) {
    console.log(params, params.pr_id)
    const response = this.products.getProductById(Number(params.pr_id));
    if (!response.status) {
      return null;
    }
    return response.data;
  }
}
