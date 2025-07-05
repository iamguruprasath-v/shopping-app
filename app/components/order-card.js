import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrderCardComponent extends Component {
  @tracked isModalOpen = false;

  get formattedDate() {
    return new Date(this.args.order.createdAt).toLocaleString();
  }

  @action
  openModal() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  mul(a, b) {
    return (a * b).toFixed(2);
  }
}
