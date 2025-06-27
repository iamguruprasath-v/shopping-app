import { module, test } from 'qunit';
import { setupTest } from 'shopping-app/tests/helpers';

module('Unit | Service | utils', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:utils');
    assert.ok(service);
  });
});
