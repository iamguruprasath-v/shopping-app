// CART SERVICE
import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CartService extends Service {
  @service products;
  @service session;
  @service utils;

  @tracked allCartItems = [];

  constructor() {
    super(...arguments);
    this.#initializeCart();
  }

  #initializeCart() {
    const user = this.session.currentUser;
    if (!user || !Array.isArray(user.cart)) {
      this.allCartItems = [];
      return;
    }

    this.#syncCartItemsFromUser(user.cart);
  }

  #syncCartItemsFromUser(cartList) {
    // Always create a new array reference for reactivity
    this.allCartItems = cartList.map(item => ({
      product: this.products.getProductById(item.pid).data,
      quantity: item.quantity
    }));
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
    console.log("reaching addToCart");
    const user = this.session.currentUser;
    if (!user) {
      return this.utils.createResponse(false, 'Sign in or Register to Continue');
    }

    const existing = user.cart.find(item => item.pid === pid);
    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ pid, quantity });
    }

    this.#syncCartItemsFromUser(user.cart); // This creates new array reference
    this.session.updateUserToDB(user);
    return this.utils.createResponse(true, 'Product added to cart');
  }

  removeFromCart(pid) {
    const user = this.session.currentUser;
    if (!user) return;
    
    user.cart = user.cart.filter(item => item.pid !== pid);
    this.#syncCartItemsFromUser(user.cart); // This creates new array reference
    this.session.updateUserToDB(user);
  }

  updateQuantity(pid, deltaQuantity) {
    console.log("reaching updateQuantity", pid, deltaQuantity);
    const user = this.session.currentUser;
    if (!user) return;
    
    const item = user.cart.find(i => i.pid === pid);
    if (!item) return;

    item.quantity += deltaQuantity;

    if (item.quantity <= 0) {
      this.removeFromCart(pid);
    } else {
      this.#syncCartItemsFromUser(user.cart); // This creates new array reference
      this.session.updateUserToDB(user);
    }
  }

  // Legacy method for backward compatibility - maps to new methods
  async updateCart(pid, action, quantity = 1) {
    console.log("Legacy updateCart called:", pid, action, quantity);
    
    switch(action) {
      case 'clear':
        this.clearCart();
        break;
      case 'remove':
        this.removeFromCart(pid);
        break;
      case 'update':
      case 'add':
        if (pid === 0) break; // Skip invalid pid
        const existingItem = this.session.currentUser?.cart?.find(item => item.pid === pid);
        if (existingItem) {
          this.updateQuantity(pid, quantity);
        } else if (quantity > 0) {
          this.addToCart(pid, quantity);
        }
        break;
      default:
        console.warn(`Unknown cart action: ${action}`);
        return this.utils.createResponse(false, `Unknown action: ${action}`);
    }
    
    return this.utils.createResponse(true, 'Cart updated');
  }

  // Order helper logic remains same
  setDefaultOrderDetails(orderDetails) {
    return {
      ...orderDetails,
      isDelivered: false,
      deliveredDate: '',
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