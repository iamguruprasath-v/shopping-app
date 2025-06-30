import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginController extends Controller {

    @service session;
    @service router;
    @tracked email = '';
    @tracked password = '';
    @tracked loginInfo = ''

    @action
    async login(e) {
        e.preventDefault();
        if(!this.email || !this.password) this.errorDetails = 'please fill the required fields';
        let loginResponse = await this.session.login({
            email: this.email,
            password: this.password
        });
        if(!loginResponse.success) {
            this.loginInfo = loginResponse.message;
        }
        this.loginInfo = loginResponse.message;
        setTimeout(() => this.router.transitionTo(''), 1000)
    }


    @action
    onChangeHandler(e) {
        let {name, value} = e.target;
        this[name] = value;
    }
}
