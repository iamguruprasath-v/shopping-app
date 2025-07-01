import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class GlobalToast extends Component {
  @service toast;
}
