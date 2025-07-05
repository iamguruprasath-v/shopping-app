import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class SelectProduct extends Component {
    @service('cart') cartService;
    @tracked allItems = this.args.cartProducts;
    @tracked selectedProducts = [...this.allItems];


    @action
removeProduct(item) {
        console.log("indeletion:", item)
        this.toggleSelection(item);
        this.allItems = this.allItems.filter(prod => prod.product.id !== item.product.id);
        if(this.allItems.length <= 0) this.selectedProducts = [];
        this.cartService.removeFromCart(item.product.id);
    }

    @action
    toggleSelection(item) {
        console.log("Toggling", item)
        let exists = this.selectedProducts.find(prod => prod.product.id === item.product.id);
        
        if (exists) {
        this.selectedProducts = this.selectedProducts.filter(prod => prod.product.id !== item.product.id);
        } else {
        this.selectedProducts = [...this.selectedProducts, item];
        }
    }

    @action
    updateQuantity(item) {
    let index = this.selectedProducts.findIndex(prod => prod.product.id === item.product.id);
    if (index !== -1) {
        console.log("Updateing here")
        let updated = [...this.selectedProducts];
        updated[index] = item; // replace the old item with the new one
        this.selectedProducts = updated; // trigger reactivity
    }
    }

}

