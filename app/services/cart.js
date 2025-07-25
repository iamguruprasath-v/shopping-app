import Service from '@ember/service';
import { service } from '@ember/service';

export default class CartService extends Service {
  @service session;
  @service products;
  @service utils;
  @service offers;

  get allCartItems() {
    return this.session.currentUser?.cart || [];
  }

  getCartCount() {
    return this.allCartItems.reduce((sum, item) => sum + Math.min(item.quantity, this.products.getStockAvailability(item.pid)), 0);
  }

  loadCart() {
    return this.allCartItems.map(item => ({
      product: this.products.getProductById(item.pid).data,
      quantity: item.quantity,
      selected: true
    }));
  }

  clearCart() {
    const user = this.session.currentUser;
    if (!user) return;

    const updatedUser = { ...user, cart: [] };
    this.session.updateUserToDB(updatedUser);
  }

  addToCart(pid, quantity = 1) {
    const user = this.session.currentUser;
    if (!user) return this.utils.createResponse(false, 'Sign in or Register to continue');

    const prod = this.products.getProductById(pid);
    if (!prod || prod.data.stock <= 0) {
      return this.utils.createResponse(false, 'Product is out of stock');
    }

    let cart = [...this.allCartItems];
    const existing = cart.find(item => item.pid === pid);
    const currentQty = existing ? existing.quantity : 0;
    const total = currentQty + quantity;

    if (total > prod.data.stock) {
      return this.utils.createResponse(false, "All quantity of selected items has been added to cart please proceed to buy");
    }

    if (existing) {
      existing.quantity = total;
    } else {
      cart.push({ pid, quantity });
    }

    const updatedUser = { ...user, cart };
    this.session.updateUserToDB(updatedUser);
    return this.utils.createResponse(true, 'Product added to cart');
  }

  updateQuantity(pid, quantity) {
    const user = this.session.currentUser;
    if (!user) return;

    let cart = [...this.allCartItems];
    const index = cart.findIndex(i => i.pid === pid);

    if (index !== -1) {
      cart[index].quantity += quantity;
    }

    const updatedUser = { ...user, cart };
    this.session.updateUserToDB(updatedUser);
  }

  removeFromCart(pid) {
    const user = this.session.currentUser;
    if (!user) return;

    const cart = this.allCartItems.filter(i => i.pid !== pid);
    const updatedUser = { ...user, cart };
    this.session.updateUserToDB(updatedUser);
  }

  removeMultipleFromCart(pids = []) {
    const user = this.session.currentUser;
    if (!user) return;

    let cart = [...this.allCartItems];

    const updatedCart = cart.filter(item => !pids.includes(item.pid));

    const updatedUser = { ...user, cart: updatedCart };
    this.session.updateUserToDB(updatedUser);
  }


  setDefaultOrderDetails(orderDetails) {
    return {
      ...orderDetails,
      isDelivered: true,
      deliveredDate: Date.now(),
      location: this.session.currentUser.address
    };
  }


  createOrders(orderDetails) {
    orderDetails.products.forEach(prod => {
      prod.offered = this.offers.isInOffer(prod.product.id);
      
    })
    try {
      const data = localStorage.getItem('orders');
      let orders = [];

      if (data) {
        const parsed = JSON.parse(data);
        orders = parsed.orders || parsed || [];
      }

      const newOrder = this.setDefaultOrderDetails({
        ...orderDetails,
        userId: this.session.currentUser.id,
        id: orders.length + 1,
      });

      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify({ orders }));
      return newOrder;
    } catch (err) {
      console.error('Order creation failed', err);
      throw err;
    }
  }

  get orders() {
    const user = this.session.currentUser;

    if (!user || !user.id) {
      return [];
    }

    try {
      const data = localStorage.getItem('orders');
      const parsed = data ? JSON.parse(data) : { orders: [] };

      return parsed.orders.filter(order => order.userId === user.id);
    } catch (err) {
      console.error('Error parsing orders from localStorage:', err);
      return [];
    }
  }

}
