// Source: https://github.com/HarasimowiczKamil/any-base/tree/master

/**
 * Converter
 *
 * @param {string|Array} srcAlphabet
 * @param {string|Array} dstAlphabet
 * @constructor
 */
function Converter(
  srcAlphabet: string | Array<any>,
  dstAlphabet: string | Array<any>,
) {
  if (
    !srcAlphabet ||
    !dstAlphabet ||
    !srcAlphabet.length ||
    !dstAlphabet.length
  ) {
    throw new Error("Bad alphabet");
  }
  this.srcAlphabet = srcAlphabet;
  this.dstAlphabet = dstAlphabet;
}

/**
 * Convert number from source alphabet to destination alphabet
 *
 * @param {string|Array} number - number represented as a string or array of points
 *
 * @returns {string|Array}
 */
Converter.prototype.convert = function (
  number: string | Array<any>,
): string | Array<any> {
  var i,
    divide,
    newlen,
    numberMap = {},
    fromBase = this.srcAlphabet.length,
    toBase = this.dstAlphabet.length,
    length = number.length,
    result = typeof number === "string" ? "" : [];

  if (!this.isValid(number)) {
    throw new Error(
      'Number "' +
        number +
        '" contains of non-alphabetic digits (' +
        this.srcAlphabet +
        ")",
    );
  }

  if (this.srcAlphabet === this.dstAlphabet) {
    return number;
  }

  for (i = 0; i < length; i++) {
    numberMap[i] = this.srcAlphabet.indexOf(number[i]);
  }
  do {
    divide = 0;
    newlen = 0;
    for (i = 0; i < length; i++) {
      divide = divide * fromBase + numberMap[i];
      if (divide >= toBase) {
        numberMap[newlen++] = parseInt((divide / toBase).toString(), 10);
        divide = divide % toBase;
      } else if (newlen > 0) {
        numberMap[newlen++] = 0;
      }
    }
    length = newlen;
    result = this.dstAlphabet.slice(divide, divide + 1).concat(result);
  } while (newlen !== 0);

  return result;
};

/**
 * Valid number with source alphabet
 *
 * @param {number} number
 *
 * @returns {boolean}
 */
Converter.prototype.isValid = function (number: string): boolean {
  var i = 0;
  for (; i < number.length; ++i) {
    if (this.srcAlphabet.indexOf(number[i]) === -1) {
      return false;
    }
  }
  return true;
};

/**
 * Function get source and destination alphabet and return convert function
 *
 * @param {string|Array} srcAlphabet
 * @param {string|Array} dstAlphabet
 *
 * @returns {function(number|Array)}
 */
function anyBase(
  srcAlphabet: string | Array<any>,
  dstAlphabet: string | Array<any>,
): (arg0: string | Array<any>) => any {
  var converter = new Converter(srcAlphabet, dstAlphabet);
  /**
   * Convert function
   *
   * @param {string|Array} number
   *
   * @return {string|Array} number
   */
  return function (number: string | Array<any>): string | Array<any> {
    return converter.convert(number);
  };
}

anyBase.BIN = "01";
anyBase.OCT = "01234567";
anyBase.DEC = "0123456789";
anyBase.HEX = "0123456789abcdef";

export default anyBase;
