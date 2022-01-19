/*!
 * maska v1.5.0
 * (c) 2019-2022 Alexander Shabunevich
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Maska = {}));
})(this, (function (exports) { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /* eslint quote-props: ["error", "consistent"] */
  var tokens = {
    '#': {
      pattern: /[0-9]/
    },
    'X': {
      pattern: /[0-9a-zA-Z]/
    },
    'S': {
      pattern: /[a-zA-Z]/
    },
    'A': {
      pattern: /[a-zA-Z]/,
      uppercase: true
    },
    'a': {
      pattern: /[a-zA-Z]/,
      lowercase: true
    },
    '!': {
      escape: true
    },
    '*': {
      repeat: true
    }
  };

  function mask(value, mask) {
    var tokens$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : tokens;
    var masked = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    return processMask(mask).length > 1 ? dynamic(mask)(value, mask, tokens$1, masked) : process(value, mask, tokens$1, masked);
  }

  function processMask(mask) {
    try {
      return JSON.parse(mask);
    } catch (_unused) {
      return [mask];
    }
  }

  function dynamic(mask) {
    var masks = processMask(mask).sort(function (a, b) {
      return a.length - b.length;
    });
    return function (value, mask, tokens) {
      var masked = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var processed = masks.map(function (m) {
        return process(value, m, tokens, false);
      });
      var last = processed.pop();

      for (var i in masks) {
        if (checkMask(last, masks[i], tokens)) {
          return process(value, masks[i], tokens, masked);
        }
      }

      return ''; // empty masks
    };

    function checkMask(variant, mask, tokens) {
      for (var tok in tokens) {
        if (tokens[tok].escape) {
          mask = mask.replace(new RegExp(tok + '.{1}', 'g'), '');
        }
      }

      return mask.split('').filter(function (el) {
        return tokens[el] && tokens[el].pattern;
      }).length >= variant.length;
    }
  }

  function process(value, mask, tokens) {
    var masked = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var im = 0;
    var iv = 0;
    var ret = '';
    var rest = '';

    while (im < mask.length && iv < value.length) {
      var maskChar = mask[im];
      var valueChar = value[iv];
      var token = tokens[maskChar];

      if (token && token.pattern) {
        if (token.pattern.test(valueChar)) {
          ret += tokenTransform(valueChar, token);
          im++;
          console.log(mask[im]);
          console.log(masked); // check next char

          if (masked && mask[im]) {
            if (!tokens[mask[im]] && im + 1 == mask.length) {
              ret += mask[im];
              im++;
            } else if (tokens[mask[im]] && tokens[mask[im]].escape && im + 2 == mask.length) {
              ret += mask[im + 1];
              im = im + 2;
            }
          }
        }

        iv++;
      } else if (token && token.repeat) {
        var tokenPrev = tokens[mask[im - 1]];

        if (tokenPrev && !tokenPrev.pattern.test(valueChar)) {
          im++;
        } else {
          im--;
        }
      } else {
        if (token && token.escape) {
          im++;
          maskChar = mask[im];
        }

        if (masked) ret += maskChar;
        if (valueChar === maskChar) iv++;
        im++;
      }
    } // fix mask that ends with parenthesis


    while (masked && im < mask.length) {
      // eslint-disable-line no-unmodified-loop-condition
      var maskCharRest = mask[im];

      if (tokens[maskCharRest]) {
        rest = '';
        break;
      }

      rest += maskCharRest;
      im++;
    }

    return ret + rest;
  }
  /**
   *
   * @param {String} value
   * @param {'uppercase' | 'lowercase' | 'transform'} token
   */


  function tokenTransform(value, token) {
    if (token.transform) {
      value = token.transform(value);
    }

    if (token.uppercase) {
      return value.toLocaleUpperCase();
    } else if (token.lowercase) {
      return value.toLocaleLowerCase();
    }

    return value;
  }

  /* global HTMLInputElement */
  function event(name) {
    var inputType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var event = document.createEvent('Event');
    event.initEvent(name, true, true);

    if (inputType) {
      event.inputType = inputType;
    }

    return event;
  }

  function findInputElement(el) {
    return el instanceof HTMLInputElement ? el : el.querySelector('input') || el;
  }

  function fixInputSelection(el, position, digit) {
    while (position && position < el.value.length && el.value.charAt(position - 1) !== digit) {
      position++;
    }

    var selectionRange = el.type ? el.type.match(/^(text|search|password|tel|url)$/i) : !el.type;

    if (selectionRange && el === document.activeElement) {
      el.setSelectionRange(position, position);
      setTimeout(function () {
        el.setSelectionRange(position, position);
      }, 0);
    }
  }

  function isString(val) {
    return Object.prototype.toString.call(val) === '[object String]';
  }

  var Maska = /*#__PURE__*/function () {
    function Maska(el) {
      var _this = this;

      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Maska);

      if (!el) throw new Error('Maska: no element for mask');

      if (opts.preprocessor != null && typeof opts.preprocessor !== 'function') {
        throw new Error('Maska: preprocessor must be a function');
      }

      if (opts.tokens) {
        for (var i in opts.tokens) {
          opts.tokens[i] = _objectSpread2({}, opts.tokens[i]);

          if (opts.tokens[i].pattern && isString(opts.tokens[i].pattern)) {
            opts.tokens[i].pattern = new RegExp(opts.tokens[i].pattern);
          }
        }
      }

      this._opts = {
        mask: opts.mask,
        tokens: _objectSpread2(_objectSpread2({}, tokens), opts.tokens),
        preprocessor: opts.preprocessor
      };
      this._el = isString(el) ? document.querySelectorAll(el) : !el.length ? [el] : el;

      this.inputEvent = function (e) {
        return _this.updateValue(e.target, e);
      };

      this.init();
    }

    _createClass(Maska, [{
      key: "init",
      value: function init() {
        var _this2 = this;

        var _loop = function _loop(i) {
          var el = findInputElement(_this2._el[i]);

          if (_this2._opts.mask && (!el.dataset.mask || el.dataset.mask !== _this2._opts.mask)) {
            el.dataset.mask = _this2._opts.mask;
          }

          setTimeout(function () {
            return _this2.updateValue(el);
          }, 0);

          if (!el.dataset.maskInited) {
            el.dataset.maskInited = true;
            el.addEventListener('input', _this2.inputEvent);
            el.addEventListener('beforeinput', _this2.beforeInput);
          }
        };

        for (var i = 0; i < this._el.length; i++) {
          _loop(i);
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        for (var i = 0; i < this._el.length; i++) {
          var el = findInputElement(this._el[i]);
          el.removeEventListener('input', this.inputEvent);
          el.removeEventListener('beforeinput', this.beforeInput);
          delete el.dataset.mask;
          delete el.dataset.maskInited;
        }
      }
    }, {
      key: "updateValue",
      value: function updateValue(el, evt) {
        if (!el || !el.type) return;
        var wrongNum = el.type.match(/^number$/i) && el.validity.badInput;

        if (!el.value && !wrongNum || !el.dataset.mask) {
          el.dataset.maskRawValue = '';
          this.dispatch('maska', el, evt);
          return;
        }

        var position = el.selectionEnd;
        var oldValue = el.value;
        var digit = oldValue[position - 1];
        el.dataset.maskRawValue = mask(el.value, el.dataset.mask, this._opts.tokens, false);
        var elValue = el.value;

        if (this._opts.preprocessor) {
          elValue = this._opts.preprocessor(elValue);
        }

        el.value = mask(elValue, el.dataset.mask, this._opts.tokens);

        if (evt && evt.inputType === 'insertText' && position === oldValue.length) {
          position = el.value.length;
        }

        fixInputSelection(el, position, digit);
        this.dispatch('maska', el, evt);

        if (el.value !== oldValue) {
          this.dispatch('input', el, evt);
        }
      }
    }, {
      key: "beforeInput",
      value: function beforeInput(e) {
        if (e && e.target && e.target.type && e.target.type.match(/^number$/i) && e.data && isNaN(e.target.value + e.data)) {
          e.preventDefault();
        }
      }
    }, {
      key: "dispatch",
      value: function dispatch(name, el, evt) {
        el.dispatchEvent(event(name, evt && evt.inputType || null));
      }
    }]);

    return Maska;
  }();

  function getOpts(mask) {
    var opts = {};

    if (mask.mask) {
      opts.mask = Array.isArray(mask.mask) ? JSON.stringify(mask.mask) : mask.mask;
      opts.tokens = mask.tokens ? _objectSpread2({}, mask.tokens) : {};
      opts.preprocessor = mask.preprocessor;
    } else {
      opts.mask = Array.isArray(mask) ? JSON.stringify(mask) : mask;
    }

    return opts;
  }

  function needUpdate(mask) {
    return !(isString(mask.value) && mask.value === mask.oldValue || Array.isArray(mask.value) && JSON.stringify(mask.value) === JSON.stringify(mask.oldValue) || mask.value && mask.value.mask && mask.oldValue && mask.oldValue.mask && mask.value.mask === mask.oldValue.mask);
  }

  var directive = function directive() {
    var state = new WeakMap();
    return function (el, mask) {
      if (!mask.value) return;

      if (state.has(el) && !needUpdate(mask)) {
        return;
      }

      state.set(el, new Maska(el, getOpts(mask.value)));
    };
  };

  var directive$1 = directive();

  function install(Vue) {
    Vue.directive('maska', directive$1);
  } // Install by default if included from script tag (only Vue 2)


  if (typeof window !== 'undefined' && window.Vue && window.Vue.use) {
    window.Vue.use(install);
  }

  function create(el, options) {
    return new Maska(el, options);
  }

  exports.create = create;
  exports["default"] = install;
  exports.install = install;
  exports.mask = mask;
  exports.maska = directive$1;
  exports.tokens = tokens;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
