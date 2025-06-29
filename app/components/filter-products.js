import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FilterProducts extends Component {
  @tracked searchQuery = '';
  @tracked searchedResult = this.args.products;

  @action
  searchHandler(event) {
    this.searchQuery = event.target.value.toLowerCase();

    this.searchedResult = this.args.products.filter(prod => {
      return (
        prod.title.toLowerCase().includes(this.searchQuery) ||
        prod.category.toLowerCase().includes(this.searchQuery) ||
        prod.description.toLowerCase().includes(this.searchQuery)
      );
    });
  }
}
