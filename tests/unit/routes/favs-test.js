import { module, test } from 'qunit';
import { setupTest } from 'shopping-app/tests/helpers';

module('Unit | Route | favs', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:favs');
    assert.ok(route);
  });
});
