import EmberRouter from '@ember/routing/router';
import config from 'shopping-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('favs');
  this.route('cart');
  this.route('orders');
  this.route('logout');
  this.route('login');
  this.route('register');
  this.route('product', {
    path: '/product/:pr_id'
  });
});
