import Service from '@ember/service';
import { service } from '@ember/service';

export default class ProductsService extends Service {
  @service utils;

  get allProducts() {
    return JSON.parse(localStorage.getItem('products'))?.products || [];
  }

  getProductById(id) {
    const product = this.allProducts.find(prod => prod.id === id);

    if (!product) {
      return this.utils.createResponse(false, 'Product not found.');
    }

    return this.utils.createResponse(true, 'Product found', product);
  }

  getProductsByIds(productIds = []) {
    return productIds.map(id => this.getProductById(id).data);
  }

  updateProduct(updatedProd) {
    const all = this.allProducts.map(p => p.id === updatedProd.id ? updatedProd : p);
    localStorage.setItem('products', JSON.stringify({ products: all }));
  }

  updateStockAvailability(id, quantity) {
    const productRes = this.getProductById(id);
    if (!productRes.status) return productRes;

    productRes.data.stock += quantity;
    this.updateProduct(productRes.data);
    return this.utils.createResponse(true, 'Stock updated');
  }

  inStock(id) {
    const productRes = this.getProductById(id);
    return productRes.status ? productRes.data.stock : 0;
  }

  getStockAvailability(pid) {
    let prod = this.allProducts.find(prod => prod.id == pid)
    return prod.stock;
  }
}
