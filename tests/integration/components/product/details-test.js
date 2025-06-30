import { module, test } from 'qunit';
import { setupRenderingTest } from 'shopping-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | product/details', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Product::Details />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <Product::Details>
        template block text
      </Product::Details>
    `);

    assert.dom().hasText('template block text');
  });
});
