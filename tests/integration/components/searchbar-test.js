import { module, test } from 'qunit';
import { setupRenderingTest } from 'shopping-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | searchbar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Searchbar />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <Searchbar>
        template block text
      </Searchbar>
    `);

    assert.dom().hasText('template block text');
  });
});
