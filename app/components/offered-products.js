// app/components/offered-products.js
import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class OfferedProducts extends Component {
  @service offers;
}
