import Service from '@ember/service';
import { service } from '@ember/service';

export default class CartService extends Service {

    @service products;
    @service session;
    @service utils;

    get cart() {
        // Ensuring currentUser exists and has a cart
        const currentUser = this.session.currentUser;
        if (!currentUser || !currentUser.cart) {
            return [];
        }
        return this.products.getProductByIds(currentUser.cart);
    }

    getCartCount() {
        return this.cart.length;
    }

    /**
     * Updates the user's cart
     * @param {number} pid - Product ID
     * @param {string} action - 'clear', 'remove', 'update', or 'add'
     * @param {number} quantity - Quantity to add/update (default: 1)
     */
    async updateCart(pid, action, quantity = 1) {
        const currUser = this.session.currentUser; // Use consistent naming
        
        if (!currUser) {
            throw new Error('No current user found');
        }

        // Ensure cart exists
        if (!currUser.cart) {
            currUser.cart = [];
        }
        
        switch(action) {
            case 'clear':
                currUser.cart = [];
                break;
                
            case 'remove':
                currUser.cart = currUser.cart.filter(itm => itm.pid !== pid);
                break;
                
            case 'update':
            case 'add':
                const existingItemIndex = currUser.cart.findIndex(itm => itm.pid == pid);
                
                if (existingItemIndex !== -1) {
                    // Update existing item
                    currUser.cart[existingItemIndex].quantity += quantity;
                    
                    // Remove if quantity becomes 0 or negative
                    if (currUser.cart[existingItemIndex].quantity <= 0) {
                        currUser.cart.splice(existingItemIndex, 1);
                    }
                } else if (quantity > 0) {
                    // Add new item
                    currUser.cart.push({ pid: pid, quantity: quantity });
                }
                break;
                
            default:
                console.warn(`Unknown cart action: ${action}`);
                return;
        }
        
        await this.session.updateUserToDB(currUser);
    }

    /**
     * Sets default properties for order details
     */
    setDefaultOrderDetails(orderDetails) {
        return {
            ...orderDetails,
            isDelivered: false, 
            deliveredDate: '',
        };
    }

    /**
     * Creates a new order and saves to localStorage
     */
    createOrders(orderDetails) {
        try {
            // Safely get existing orders
            const ordersData = localStorage.getItem('orders');
            let orders = [];
            
            if (ordersData) {
                const parsedData = JSON.parse(ordersData);
                orders = parsedData.orders || parsedData || [];
            }
            
            // Create new order with auto-incrementing ID
            const updatedOrderDetails = this.setDefaultOrderDetails({
                ...orderDetails, 
                id: orders.length + 1,
                createdAt: new Date().toISOString() // Add timestamp
            });
            
            orders.push(updatedOrderDetails);
            
            // Save back to localStorage
            localStorage.setItem('orders', JSON.stringify({ orders }));
            
            return updatedOrderDetails;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
}