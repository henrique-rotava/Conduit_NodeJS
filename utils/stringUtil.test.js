const { slugify } = require('./stringUtil');

describe('String utils', () => {
    it('should slugify text', () => {
        const text = 'This is a TEXT%$# with 1# or 2 numbers';
        const slug = slugify(text);
        expect(slug).toEqual('this-is-a-text-with-1-or-2-numbers');
    });
});
