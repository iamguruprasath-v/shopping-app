import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const SHIPPING_VALUES_IN_DAYS = {
  'Ships overnight': 1,
  'Ships in 1 month': 30,
  'Ships in 1 week': 7,
  'Ships in 3-5 business days': 5,
  'Ships in 2 weeks': 14,
  'Ships in 1-2 business days': 2,
};

export default class OrderCardComponent extends Component {
  @tracked isModalOpen = false;

  // ✅ Reusable formatter
  formatDateTime(dateObj) {
    return dateObj.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // ✅ Formatted order date
  get formattedDate() {
    const date = new Date(this.args.order.createdAt);
    return this.formatDateTime(date);
  }

  // ✅ Estimated delivery date (calculated from max shipping)
  get estimatedDeliveryDate() {
    let products = this.args.order.products ?? [];
    let max = -1;

    products.forEach((prod) => {
      const key = prod?.product?.shippingInformation;
      const days = SHIPPING_VALUES_IN_DAYS[key] ?? 3;
      max = Math.max(max, days);
    });

    const createdAt = new Date(this.args.order.createdAt);
    createdAt.setDate(createdAt.getDate() + max);
    return this.formatDateTime(createdAt);
  }

  @action
  openModal() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }
}
