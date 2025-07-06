import Service from '@ember/service';
import { service } from '@ember/service';

export default class ProductsService extends Service {
  @service utils;


  get allProducts() {
    return JSON.parse(localStorage.getItem('products'))?.products;
  }
  
  /**
   * get a product by its id
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
   * Get Multiple products by their ids.
   *
   * @param {Array} productIds 
   * @returns {Array} - List of resolved products. 
   */
  getProductsByIds(productIds) {
    let products = productIds.map(productId => this.getProductById(productId).data);
    return products;
  }

  
  /**
   * Update the updated product in localstorage
   *
   * @param {Object} prod 
   */
  updateProduct(prod) {
    let all = this.allProducts;
    const updated = all.map(p => p.id === prod.id ? prod : p);
    localStorage.setItem('products', JSON.stringify({ products: updated }));
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

  inStock(id) {
    let prodResponse = this.getProductById(id);
    return prodResponse.data.stock;
  }

}
