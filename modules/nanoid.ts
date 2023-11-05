// The MIT License (MIT)

// Copyright 2017 Andrey Sitnik <andrey@sitnik.ru>

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Source: https://github.com/ai/nanoid/

export let nanoid = () =>
  crypto
    .getRandomValues(new Uint8Array(30))
    .reduce((id, byte) => {
      // It is incorrect to use bytes exceeding the alphabet size.
      // The following mask reduces the random byte in the 0-255 value
      // range to the 0-63 value range. Therefore, adding hacks, such
      // as empty string fallback or magic numbers, is unneccessary because
      // the bitmask trims bytes down to the alphabet size.
      byte &= 63;
      if (byte < 36) {
        // `0-9a-z`
        id += byte.toString(36);
      } else if (byte < 62) {
        // `A-Z`
        id += (byte - 26).toString(36).toUpperCase();
      }
      // Skipping -/_ because they are ugly, instead we'll generate a longer
      // result and then remove the extra characters
      return id;
    }, "")
    .substring(0, 21);
