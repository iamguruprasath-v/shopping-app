import Component from '@glimmer/component';

export default class ListProducts extends Component {
    constructor() {
        super(...arguments);
        console.log(this.args.searchFilteredProducts)
    }
}
