import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ProductsService extends Service {
  @tracked allProducts = [];
  @service utils;


  
  /**
   * Description placeholder
   *
   * @param {String} id 
   * @returns {Object} - if success result then book data else error response 
   */
  getProductById(id) {
    let product = this.allProducts.find((prod) => prod.id === id);

    if (!product) return this.utils.createResponse(false, 'Product not found.');
    return this.utils.createResponse(true, 'Product found', product);
  }

  
  /**
   * Update the updated product in localstorage
   *
   * @param {Object} prod 
   */
  updateProduct(prod) {
    this.allProducts = this.allProducts.map(product => {
        if (prod.id == product.id) return product;
        else return prod;
    })

    localStorage.setItem('products', JSON.stringify({products: this.allProducts}));
  }

  
  /**
   * Update the stock availability of the product.
   *
   * @param {String} id 
   * @param {Number} quantity  
   */
  updateStockAvailability(id, quantity) {
    let productResponse = this.getProductById(id);
    if (!product.status) return productResponse;

    productResponse.data.stock += quantity;
    updateProduct(productResponse.data);
  }


}
