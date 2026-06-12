import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCanViewPost } from '../utils/visibility.js';
import { NotFoundError } from '../utils/errors.js';
const publicPost = {
    id: 1n,
    userId: 10n,
    privacyType: 'public',
    isDeleted: false,
};
const privatePost = {
    id: 2n,
    userId: 10n,
    privacyType: 'private',
    isDeleted: false,
};
test('allows anyone to view a public post', () => {
    assert.doesNotThrow(() => assertCanViewPost(publicPost));
});
test('allows the author to view a private post', () => {
    assert.doesNotThrow(() => assertCanViewPost(privatePost, 10n));
});
test('hides private posts from non-authors', () => {
    assert.throws(() => assertCanViewPost(privatePost, 11n), NotFoundError);
});
test('hides deleted posts', () => {
    assert.throws(() => assertCanViewPost({ ...publicPost, isDeleted: true }), NotFoundError);
});
//# sourceMappingURL=visibility.service.test.js.map