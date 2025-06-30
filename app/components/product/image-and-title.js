import Component from '@glimmer/component';

export default class ProductImageAndTitleComponent extends Component {
  get roundedRating() {
    console.log(this.args.product)
    return Math.round(this.args.product.rating);
  }

  get emptyStars() {
    return 5 - this.roundedRating;
  }
}
