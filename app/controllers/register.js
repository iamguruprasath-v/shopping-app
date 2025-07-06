import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class RegisterController extends Controller {
  @service session;
  @service router;

  // 🧾 Personal Info
  @tracked name = '';
  @tracked username = '';

  // 📧 Contact Info
  @tracked email = '';
  @tracked phone = '';

  // 📍 Address
  @tracked address = '';
  @tracked state = '';
  @tracked postalCode = '';

  // 🔒 Auth Info
  @tracked password = '';

  // 💬 Feedback
  @tracked registerMessage = '';
  @tracked registerSuccess = false;

  @action
  async register(e) {
    e.preventDefault();

    const userDetails = {
      id: Date.now(),
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password,
      phone: this.phone,
      address: {
        address: this.address,
        state: this.state,
        postalCode: this.postalCode
      }
    };

    const response = await this.session.registerNewUser(userDetails);
    this.registerSuccess = response.success;
    this.registerMessage = response.message;

    if (this.registerSuccess) {
      setTimeout(() => this.router.transitionTo('login'), 1000);
    }
  }

  @action
  handleInput(e) {
    const { name, value } = e.target;
    this[name] = value;
  }
}
