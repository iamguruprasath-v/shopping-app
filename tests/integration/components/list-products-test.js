import { module, test } from 'qunit';
import { setupRenderingTest } from 'shopping-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | list-products', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ListProducts />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <ListProducts>
        template block text
      </ListProducts>
    `);

    assert.dom().hasText('template block text');
  });
});
