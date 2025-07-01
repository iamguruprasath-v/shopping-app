import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ToastService extends Service {
  @tracked message = '';
  @tracked visible = false;

  show(msg, duration = 2500) {
    this.message = msg;
    this.visible = true;

    setTimeout(() => {
      this.visible = false;
      this.message = '';
    }, duration);
  }
}
