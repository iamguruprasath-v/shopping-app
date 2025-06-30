import { module, test } from 'qunit';
import { setupTest } from 'shopping-app/tests/helpers';

module('Unit | Service | orders', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:orders');
    assert.ok(service);
  });
});
