// CART SERVICE
import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CartService extends Service {
  @service products;
  @service session;
  @service utils;

  @tracked allCartItems = this.session.currentUser?.cart || [];

  // constructor() {
  //   super(...arguments);
  //   this.#initializeCart();
  // }

  // #initializeCart() {
  //   const user = this.session.currentUser;
  //   if (!user || !Array.isArray(user.cart)) {
  //     this.allCartItems = [];
  //     return;
  //   }

  //   this.allCartItems = user.cart;
  // }

  loadCart() {
    let cartDatas = this.allCartItems.map(item => ({
      product: this.products.getProductById(item.pid).data,
      quantity: item.quantity,
      selected: true
    }));

    return cartDatas
  }

  // Make this a getter for automatic reactivity
  get cartCount() {
    return this.allCartItems.reduce((count, item) => count + item.quantity, 0);
  }

  // Keep method for backward compatibility
  getCartCount() {
    return this.cartCount;
  }

  clearCart() {
    const user = this.session.currentUser;
    if (!user) return;
    
    user.cart = [];
    this.allCartItems = []; // New array reference
    this.session.updateUserToDB(user);
  }

  addToCart(pid, quantity = 1) {
    const user = this.session.currentUser;
    if (!user) {
      return this.utils.createResponse(false, 'Sign in or Register to Continue');
    }

    let carts = this.allCartItems;
    const existing = carts.findIndex(item => item.pid === pid);
    if (existing !== -1) {
      carts[existing].quantity += 1;
    } else {
      carts.push({ pid, quantity });
    }

    this.allCartItems = carts;
    user.cart = carts;

    this.session.updateUserToDB(user);
    return this.utils.createResponse(true, 'Product added to cart');
  }

  removeFromCart(pid) {
    const user = this.session.currentUser;
    if (!user) return;
    let cart = this.allCartItems;
    cart = cart.filter(item => item.pid !== pid);
    this.allCartItems = cart;
    user.cart = cart;
    this.session.updateUserToDB(user);
  }

  updateQuantity(pid, deltaQuantity) {
    console.log("reaching updateQuantity", pid, deltaQuantity);
    const user = this.session.currentUser;
    if (!user) return;
    let cart = this.allCartItems
    
    const index = cart.findIndex(i => i.pid === pid);
    if (index !== -1) {
      cart[index].quantity += deltaQuantity;
    }
    this.allCartItems = cart;
    user.cart = cart;
    this.session.updateUserToDB(user);
  }

  // Order helper logic remains same
  setDefaultOrderDetails(orderDetails) {
    return {
      ...orderDetails,
      isDelivered: true,
      deliveredDate: Date.now(),
    };
  }

  createOrders(orderDetails) {
    try {
      const data = localStorage.getItem('orders');
      let orders = [];

      if (data) {
        const parsed = JSON.parse(data);
        orders = parsed.orders || parsed || [];
      }

      const newOrder = this.setDefaultOrderDetails({
        ...orderDetails,
        id: orders.length + 1,
        createdAt: new Date().toISOString(),
      });

      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify({ orders }));
      return newOrder;
    } catch (err) {
      console.error('Error saving order:', err);
      throw err;
    }
  }
}