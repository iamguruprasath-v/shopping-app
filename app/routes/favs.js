import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FavsRoute extends Route {
  @service session;
  @service products;

  model() {
    const user = this.session.currentUser;
    const favIds = user?.favourites || [];
    const favProducts = this.products.getProductsByIds(favIds);
    
    return {
      favProducts,
    };
  }
}
