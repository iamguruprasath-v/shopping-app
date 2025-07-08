import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service session;
  @service router;

  @tracked email = '';
  @tracked password = '';
  @tracked loginInfo = '';
  @tracked loginSuccess = null; // null for neutral, true/false for color logic

  @action
  login(e) {
    e.preventDefault();

    // Client-side required field check
    if (!this.email || !this.password) {
      this.loginInfo = 'Please fill in both email and password';
      this.loginSuccess = false;
      return;
    }

    const loginResponse = this.session.login({
      email: this.email,
      password: this.password
    });

    this.loginInfo = loginResponse.message;
    this.loginSuccess = loginResponse.success;

    this.email = '';
    this.password = '';

    if (this.loginSuccess) {
      setTimeout(() => {
        this.router.transitionTo('');
        this.clearLoginStatus();
      }, 1000);
    }
  }

  clearLoginStatus() {
    this.loginInfo = '';
    this.loginSuccess = null;
  }

  @action
  onChangeHandler(e) {
    const { name, value } = e.target;
    this[name] = value;
  }
}
