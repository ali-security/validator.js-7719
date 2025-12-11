import assert from 'assert';
import { format } from 'util';
import validator from '../../src/index';

function test(options) {
  const args = options.args || [];

  args.unshift(null);

  if (options.error) {
    options.error.forEach((error) => {
      args[0] = error;

      try {
        assert.throws(() => validator[options.validator](...args));
      } catch (err) {
        const warning = format(
          'validator.%s(%s) passed but should error',
          options.validator, args.join(', ')
        );

        throw new Error(warning);
      }
    });
  }

  if (options.valid) {
    options.valid.forEach((valid) => {
      args[0] = valid;

      if (validator[options.validator](...args) !== true) {
        const warning = format(
          'validator.%s(%s) failed but should have passed',
          options.validator, args.join(', ')
        );

        throw new Error(warning);
      }
    });
  }

  if (options.invalid) {
    options.invalid.forEach((invalid) => {
      args[0] = invalid;

      if (validator[options.validator](...args) !== false) {
        const warning = format(
          'validator.%s(%s) passed but should have failed',
          options.validator, args.join(', ')
        );

        throw new Error(warning);
      }
    });
  }
}

describe('isLength', () => {
  it('should return false for a string with length greater than the max', () => {
    test({
      validator: 'isLength',
      args: [{ max: 3 }],
      invalid: ['test'],
    });
  });

  it('should return true for a string with length equal to the max', () => {
    test({
      validator: 'isLength',
      args: [{ max: 4 }],
      valid: ['test'],
    });
  });

  it('should correctly calculate the length of a string with presentation sequences', () => {
    test({
      validator: 'isLength',
      args: [{ max: 4 }],
      valid: ['test\uFE0F'],
    });

    test({
      validator: 'isLength',
      args: [{ min: 5, max: 5 }],
      valid: ['test\uFE0F\uFE0F'],
    });

    test({
      validator: 'isLength',
      args: [{ min: 5, max: 5 }],
      valid: ['\uFE0Ftest'],
    });

    test({
      validator: 'isLength',
      args: [{ min: 9, max: 9 }],
      valid: ['test\uFE0F\uFE0F\uFE0F\uFE0F\uFE0F\uFE0F'],
    });
  });

  it('should validate strings by length (deprecated api)', () => {
    test({
      validator: 'isLength',
      args: [2],
      valid: ['abc', 'de', 'abcd'],
      invalid: ['', 'a'],
    });
    test({
      validator: 'isLength',
      args: [2, 3],
      valid: ['abc', 'de'],
      invalid: ['', 'a', 'abcd'],
    });
    test({
      validator: 'isLength',
      args: [2, 3],
      valid: ['干𩸽', '𠮷野家'],
      invalid: ['', '𠀋', '千竈通り'],
    });
    test({
      validator: 'isLength',
      args: [0, 0],
      valid: [''],
      invalid: ['a', 'ab'],
    });
  });

  it('should validate strings by length', () => {
    test({
      validator: 'isLength',
      args: [{ min: 2 }],
      valid: ['abc', 'de', 'abcd'],
      invalid: ['', 'a'],
    });
    test({
      validator: 'isLength',
      args: [{ min: 2, max: 3 }],
      valid: ['abc', 'de'],
      invalid: ['', 'a', 'abcd'],
    });
    test({
      validator: 'isLength',
      args: [{ min: 2, max: 3 }],
      valid: ['干𩸽', '𠮷野家'],
      invalid: ['', '𠀋', '千竈通り'],
    });
    test({
      validator: 'isLength',
      args: [{ max: 3 }],
      valid: ['abc', 'de', 'a', ''],
      invalid: ['abcd'],
    });
    test({
      validator: 'isLength',
      args: [{ max: 6, discreteLengths: 5 }],
      valid: ['abcd', 'vfd', 'ff', '', 'k'],
      invalid: ['abcdefgh', 'hfjdksks'],
    });
    test({
      validator: 'isLength',
      args: [{ min: 2, max: 6, discreteLengths: 5 }],
      valid: ['bsa', 'vfvd', 'ff'],
      invalid: ['', ' ', 'hfskdunvc'],
    });
    test({
      validator: 'isLength',
      args: [{ min: 1, discreteLengths: 2 }],
      valid: [' ', 'hello', 'bsa'],
      invalid: [''],
    });
    test({
      validator: 'isLength',
      args: [{ max: 0 }],
      valid: [''],
      invalid: ['a', 'ab'],
    });
    test({
      validator: 'isLength',
      args: [{ min: 5, max: 10, discreteLengths: [2, 6, 8, 9] }],
      valid: ['helloguy', 'shopping', 'validator', 'length'],
      invalid: ['abcde', 'abcdefg'],
    });
    test({
      validator: 'isLength',
      args: [{ discreteLengths: '9' }],
      valid: ['a', 'abcd', 'abcdefghijkl'],
      invalid: [],
    });
    test({
      validator: 'isLength',
      valid: ['a', '', 'asds'],
    });
    test({
      validator: 'isLength',
      args: [{ max: 8 }],
      valid: ['👩🦰👩👩👦👦🏳️🌈', '⏩︎⏩︎⏪︎⏪︎⏭︎⏭︎⏮︎⏮︎'],
    });
  });
});
