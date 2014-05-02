(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Hardcode image path, because Leaflet's autodetection
// fails, because mapbox.js is not named leaflet.js
window.L.Icon.Default.imagePath = '//api.tiles.mapbox.com/mapbox.js/' + 'v' +
    require('./package.json').version + '/images';

L.mapbox = module.exports = {
    VERSION: require('./package.json').version,
    geocoder: require('./src/geocoder'),
    marker: require('./src/marker'),
    simplestyle: require('./src/simplestyle'),
    tileLayer: require('./src/tile_layer'),
    infoControl: require('./src/info_control'),
    shareControl: require('./src/share_control'),
    legendControl: require('./src/legend_control'),
    geocoderControl: require('./src/geocoder_control'),
    gridControl: require('./src/grid_control'),
    gridLayer: require('./src/grid_layer'),
    featureLayer: require('./src/feature_layer'),
    map: require('./src/map'),
    config: require('./src/config'),
    sanitize: require('sanitize-caja'),
    template: require('mustache').to_html
};

L.mapbox.markerLayer = L.mapbox.featureLayer;

},{"./package.json":7,"./src/config":8,"./src/feature_layer":9,"./src/geocoder":10,"./src/geocoder_control":11,"./src/grid_control":13,"./src/grid_layer":14,"./src/info_control":15,"./src/legend_control":16,"./src/map":18,"./src/marker":19,"./src/share_control":21,"./src/simplestyle":22,"./src/tile_layer":23,"mustache":4,"sanitize-caja":5}],2:[function(require,module,exports){
function xhr(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.domain +
                (location.port ? ':' + location.port : ''));
    }

    var x;

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && (
        // IE7-9 Quirks & Compatibility
        typeof window.XDomainRequest === 'object' ||
        // IE9 Standards mode
        typeof window.XDomainRequest === 'function'
    )) {
        // IE8-10
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    } else {
        x = new window.XMLHttpRequest();
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = xhr;

},{}],3:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*! JSON v3.3.1 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the objectgs prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

},{}],4:[function(require,module,exports){
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var mustache = {};
    factory(mustache);
    if (typeof define === "function" && define.amd) {
      define(mustache); // AMD
    } else {
      root.Mustache = mustache; // <script>
    }
  }
}(this, function (mustache) {

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var nonSpaceRe = /\S/;
  var eqRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (match && match.index === 0) {
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    }

    return "";
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  function Context(view, parent) {
    this.view = view == null ? {} : view;
    this.parent = parent;
    this._cache = { '.': this.view };
  }

  Context.make = function (view) {
    return (view instanceof Context) ? view : new Context(view);
  };

  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  Context.prototype.lookup = function (name) {
    var value;
    if (name in this._cache) {
      value = this._cache[name];
    } else {
      var context = this;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;

          var names = name.split('.'), i = 0;
          while (value != null && i < names.length) {
            value = value[names[i++]];
          }
        } else {
          value = context.view[name];
        }

        if (value != null) break;

        context = context.parent;
      }

      this._cache[name] = value;
    }

    if (isFunction(value)) {
      value = value.call(this.view);
    }

    return value;
  };

  function Writer() {
    this.clearCache();
  }

  Writer.prototype.clearCache = function () {
    this._cache = {};
    this._partialCache = {};
  };

  Writer.prototype.compile = function (template, tags) {
    var fn = this._cache[template];

    if (!fn) {
      var tokens = mustache.parse(template, tags);
      fn = this._cache[template] = this.compileTokens(tokens, template);
    }

    return fn;
  };

  Writer.prototype.compilePartial = function (name, template, tags) {
    var fn = this.compile(template, tags);
    this._partialCache[name] = fn;
    return fn;
  };

  Writer.prototype.getPartial = function (name) {
    if (!(name in this._partialCache) && this._loadPartial) {
      this.compilePartial(name, this._loadPartial(name));
    }

    return this._partialCache[name];
  };

  Writer.prototype.compileTokens = function (tokens, template) {
    var self = this;
    return function (view, partials) {
      if (partials) {
        if (isFunction(partials)) {
          self._loadPartial = partials;
        } else {
          for (var name in partials) {
            self.compilePartial(name, partials[name]);
          }
        }
      }

      return renderTokens(tokens, self, Context.make(view), template);
    };
  };

  Writer.prototype.render = function (template, view, partials) {
    return this.compile(template)(view, partials);
  };

  /**
   * Low-level function that renders the given `tokens` using the given `writer`
   * and `context`. The `template` string is only needed for templates that use
   * higher-order sections to extract the portion of the original template that
   * was contained in that section.
   */
  function renderTokens(tokens, writer, context, template) {
    var buffer = '';

    // This function is used to render an artbitrary template
    // in the current context by higher-order functions.
    function subRender(template) {
      return writer.render(template, context);
    }

    var token, tokenValue, value;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      tokenValue = token[1];

      switch (token[0]) {
      case '#':
        value = context.lookup(tokenValue);

        if (typeof value === 'object' || typeof value === 'string') {
          if (isArray(value)) {
            for (var j = 0, jlen = value.length; j < jlen; ++j) {
              buffer += renderTokens(token[4], writer, context.push(value[j]), template);
            }
          } else if (value) {
            buffer += renderTokens(token[4], writer, context.push(value), template);
          }
        } else if (isFunction(value)) {
          var text = template == null ? null : template.slice(token[3], token[5]);
          value = value.call(context.view, text, subRender);
          if (value != null) buffer += value;
        } else if (value) {
          buffer += renderTokens(token[4], writer, context, template);
        }

        break;
      case '^':
        value = context.lookup(tokenValue);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0)) {
          buffer += renderTokens(token[4], writer, context, template);
        }

        break;
      case '>':
        value = writer.getPartial(tokenValue);
        if (isFunction(value)) buffer += value(context);
        break;
      case '&':
        value = context.lookup(tokenValue);
        if (value != null) buffer += value;
        break;
      case 'name':
        value = context.lookup(tokenValue);
        if (value != null) buffer += mustache.escape(value);
        break;
      case 'text':
        buffer += tokenValue;
        break;
      }
    }

    return buffer;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var tree = [];
    var collector = tree;
    var sections = [];

    var token;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      switch (token[0]) {
      case '#':
      case '^':
        sections.push(token);
        collector.push(token);
        collector = token[4] = [];
        break;
      case '/':
        var section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : tree;
        break;
      default:
        collector.push(token);
      }
    }

    return tree;
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          lastToken = token;
          squashedTokens.push(token);
        }
      }
    }

    return squashedTokens;
  }

  function escapeTags(tags) {
    return [
      new RegExp(escapeRegExp(tags[0]) + "\\s*"),
      new RegExp("\\s*" + escapeRegExp(tags[1]))
    ];
  }

  /**
   * Breaks up the given `template` string into a tree of token objects. If
   * `tags` is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. ["<%", "%>"]). Of
   * course, the default is to use mustaches (i.e. Mustache.tags).
   */
  function parseTemplate(template, tags) {
    template = template || '';
    tags = tags || mustache.tags;

    if (typeof tags === 'string') tags = tags.split(spaceRe);
    if (tags.length !== 2) throw new Error('Invalid tags: ' + tags.join(', '));

    var tagRes = escapeTags(tags);
    var scanner = new Scanner(template);

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(tagRes[0]);
      if (value) {
        for (var i = 0, len = value.length; i < len; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr == '\n') stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(tagRes[0])) break;
      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(eqRe);
        scanner.scan(eqRe);
        scanner.scanUntil(tagRes[1]);
      } else if (type === '{') {
        value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
        scanner.scan(curlyRe);
        scanner.scanUntil(tagRes[1]);
        type = '&';
      } else {
        value = scanner.scanUntil(tagRes[1]);
      }

      // Match the closing tag.
      if (!scanner.scan(tagRes[1])) throw new Error('Unclosed tag at ' + scanner.pos);

      token = [type, value, start, scanner.pos];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();
        if (!openSection) {
          throw new Error('Unopened section "' + value + '" at ' + start);
        }
        if (openSection[1] !== value) {
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
        }
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        tags = value.split(spaceRe);
        if (tags.length !== 2) {
          throw new Error('Invalid tags at ' + start + ': ' + tags.join(', '));
        }
        tagRes = escapeTags(tags);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection) {
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    }

    return nestTokens(squashTokens(tokens));
  }

  mustache.name = "mustache.js";
  mustache.version = "0.7.3";
  mustache.tags = ["{{", "}}"];

  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  mustache.parse = parseTemplate;

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // All Mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates and partials in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Compiles the given `template` to a reusable function using the default
   * writer.
   */
  mustache.compile = function (template, tags) {
    return defaultWriter.compile(template, tags);
  };

  /**
   * Compiles the partial with the given `name` and `template` to a reusable
   * function using the default writer.
   */
  mustache.compilePartial = function (name, template, tags) {
    return defaultWriter.compilePartial(name, template, tags);
  };

  /**
   * Compiles the given array of tokens (the output of a parse) to a reusable
   * function using the default writer.
   */
  mustache.compileTokens = function (tokens, template) {
    return defaultWriter.compileTokens(tokens, template);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

}));

},{}],5:[function(require,module,exports){
var html_sanitize = require('./sanitizer-bundle.js');

module.exports = function(_) {
    if (!_) return '';
    return html_sanitize(_, cleanUrl, cleanId);
};

// https://bugzilla.mozilla.org/show_bug.cgi?id=255107
function cleanUrl(url) {
    'use strict';
    if (/^https?/.test(url.getScheme())) return url.toString();
    if ('data' == url.getScheme() && /^image/.test(url.getPath())) {
        return url.toString();
    }
}

function cleanId(id) { return id; }

},{"./sanitizer-bundle.js":6}],6:[function(require,module,exports){

// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * Implements RFC 3986 for parsing/formatting URIs.
 *
 * @author mikesamuel@gmail.com
 * \@provides URI
 * \@overrides window
 */

var URI = (function () {

/**
 * creates a uri from the string form.  The parser is relaxed, so special
 * characters that aren't escaped but don't cause ambiguities will not cause
 * parse failures.
 *
 * @return {URI|null}
 */
function parse(uriStr) {
  var m = ('' + uriStr).match(URI_RE_);
  if (!m) { return null; }
  return new URI(
      nullIfAbsent(m[1]),
      nullIfAbsent(m[2]),
      nullIfAbsent(m[3]),
      nullIfAbsent(m[4]),
      nullIfAbsent(m[5]),
      nullIfAbsent(m[6]),
      nullIfAbsent(m[7]));
}


/**
 * creates a uri from the given parts.
 *
 * @param scheme {string} an unencoded scheme such as "http" or null
 * @param credentials {string} unencoded user credentials or null
 * @param domain {string} an unencoded domain name or null
 * @param port {number} a port number in [1, 32768].
 *    -1 indicates no port, as does null.
 * @param path {string} an unencoded path
 * @param query {Array.<string>|string|null} a list of unencoded cgi
 *   parameters where even values are keys and odds the corresponding values
 *   or an unencoded query.
 * @param fragment {string} an unencoded fragment without the "#" or null.
 * @return {URI}
 */
function create(scheme, credentials, domain, port, path, query, fragment) {
  var uri = new URI(
      encodeIfExists2(scheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
      encodeIfExists2(
          credentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
      encodeIfExists(domain),
      port > 0 ? port.toString() : null,
      encodeIfExists2(path, URI_DISALLOWED_IN_PATH_),
      null,
      encodeIfExists(fragment));
  if (query) {
    if ('string' === typeof query) {
      uri.setRawQuery(query.replace(/[^?&=0-9A-Za-z_\-~.%]/g, encodeOne));
    } else {
      uri.setAllParameters(query);
    }
  }
  return uri;
}
function encodeIfExists(unescapedPart) {
  if ('string' == typeof unescapedPart) {
    return encodeURIComponent(unescapedPart);
  }
  return null;
};
/**
 * if unescapedPart is non null, then escapes any characters in it that aren't
 * valid characters in a url and also escapes any special characters that
 * appear in extra.
 *
 * @param unescapedPart {string}
 * @param extra {RegExp} a character set of characters in [\01-\177].
 * @return {string|null} null iff unescapedPart == null.
 */
function encodeIfExists2(unescapedPart, extra) {
  if ('string' == typeof unescapedPart) {
    return encodeURI(unescapedPart).replace(extra, encodeOne);
  }
  return null;
};
/** converts a character in [\01-\177] to its url encoded equivalent. */
function encodeOne(ch) {
  var n = ch.charCodeAt(0);
  return '%' + '0123456789ABCDEF'.charAt((n >> 4) & 0xf) +
      '0123456789ABCDEF'.charAt(n & 0xf);
}

/**
 * {@updoc
 *  $ normPath('foo/./bar')
 *  # 'foo/bar'
 *  $ normPath('./foo')
 *  # 'foo'
 *  $ normPath('foo/.')
 *  # 'foo'
 *  $ normPath('foo//bar')
 *  # 'foo/bar'
 * }
 */
function normPath(path) {
  return path.replace(/(^|\/)\.(?:\/|$)/g, '$1').replace(/\/{2,}/g, '/');
}

var PARENT_DIRECTORY_HANDLER = new RegExp(
    ''
    // A path break
    + '(/|^)'
    // followed by a non .. path element
    // (cannot be . because normPath is used prior to this RegExp)
    + '(?:[^./][^/]*|\\.{2,}(?:[^./][^/]*)|\\.{3,}[^/]*)'
    // followed by .. followed by a path break.
    + '/\\.\\.(?:/|$)');

var PARENT_DIRECTORY_HANDLER_RE = new RegExp(PARENT_DIRECTORY_HANDLER);

var EXTRA_PARENT_PATHS_RE = /^(?:\.\.\/)*(?:\.\.$)?/;

/**
 * Normalizes its input path and collapses all . and .. sequences except for
 * .. sequences that would take it above the root of the current parent
 * directory.
 * {@updoc
 *  $ collapse_dots('foo/../bar')
 *  # 'bar'
 *  $ collapse_dots('foo/./bar')
 *  # 'foo/bar'
 *  $ collapse_dots('foo/../bar/./../../baz')
 *  # 'baz'
 *  $ collapse_dots('../foo')
 *  # '../foo'
 *  $ collapse_dots('../foo').replace(EXTRA_PARENT_PATHS_RE, '')
 *  # 'foo'
 * }
 */
function collapse_dots(path) {
  if (path === null) { return null; }
  var p = normPath(path);
  // Only /../ left to flatten
  var r = PARENT_DIRECTORY_HANDLER_RE;
  // We replace with $1 which matches a / before the .. because this
  // guarantees that:
  // (1) we have at most 1 / between the adjacent place,
  // (2) always have a slash if there is a preceding path section, and
  // (3) we never turn a relative path into an absolute path.
  for (var q; (q = p.replace(r, '$1')) != p; p = q) {};
  return p;
}

/**
 * resolves a relative url string to a base uri.
 * @return {URI}
 */
function resolve(baseUri, relativeUri) {
  // there are several kinds of relative urls:
  // 1. //foo - replaces everything from the domain on.  foo is a domain name
  // 2. foo - replaces the last part of the path, the whole query and fragment
  // 3. /foo - replaces the the path, the query and fragment
  // 4. ?foo - replace the query and fragment
  // 5. #foo - replace the fragment only

  var absoluteUri = baseUri.clone();
  // we satisfy these conditions by looking for the first part of relativeUri
  // that is not blank and applying defaults to the rest

  var overridden = relativeUri.hasScheme();

  if (overridden) {
    absoluteUri.setRawScheme(relativeUri.getRawScheme());
  } else {
    overridden = relativeUri.hasCredentials();
  }

  if (overridden) {
    absoluteUri.setRawCredentials(relativeUri.getRawCredentials());
  } else {
    overridden = relativeUri.hasDomain();
  }

  if (overridden) {
    absoluteUri.setRawDomain(relativeUri.getRawDomain());
  } else {
    overridden = relativeUri.hasPort();
  }

  var rawPath = relativeUri.getRawPath();
  var simplifiedPath = collapse_dots(rawPath);
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
    simplifiedPath = simplifiedPath
        && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
  } else {
    overridden = !!rawPath;
    if (overridden) {
      // resolve path properly
      if (simplifiedPath.charCodeAt(0) !== 0x2f /* / */) {  // path is relative
        var absRawPath = collapse_dots(absoluteUri.getRawPath() || '')
            .replace(EXTRA_PARENT_PATHS_RE, '');
        var slash = absRawPath.lastIndexOf('/') + 1;
        simplifiedPath = collapse_dots(
            (slash ? absRawPath.substring(0, slash) : '')
            + collapse_dots(rawPath))
            .replace(EXTRA_PARENT_PATHS_RE, '');
      }
    } else {
      simplifiedPath = simplifiedPath
          && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
      if (simplifiedPath !== rawPath) {
        absoluteUri.setRawPath(simplifiedPath);
      }
    }
  }

  if (overridden) {
    absoluteUri.setRawPath(simplifiedPath);
  } else {
    overridden = relativeUri.hasQuery();
  }

  if (overridden) {
    absoluteUri.setRawQuery(relativeUri.getRawQuery());
  } else {
    overridden = relativeUri.hasFragment();
  }

  if (overridden) {
    absoluteUri.setRawFragment(relativeUri.getRawFragment());
  }

  return absoluteUri;
}

/**
 * a mutable URI.
 *
 * This class contains setters and getters for the parts of the URI.
 * The <tt>getXYZ</tt>/<tt>setXYZ</tt> methods return the decoded part -- so
 * <code>uri.parse('/foo%20bar').getPath()</code> will return the decoded path,
 * <tt>/foo bar</tt>.
 *
 * <p>The raw versions of fields are available too.
 * <code>uri.parse('/foo%20bar').getRawPath()</code> will return the raw path,
 * <tt>/foo%20bar</tt>.  Use the raw setters with care, since
 * <code>URI::toString</code> is not guaranteed to return a valid url if a
 * raw setter was used.
 *
 * <p>All setters return <tt>this</tt> and so may be chained, a la
 * <code>uri.parse('/foo').setFragment('part').toString()</code>.
 *
 * <p>You should not use this constructor directly -- please prefer the factory
 * functions {@link uri.parse}, {@link uri.create}, {@link uri.resolve}
 * instead.</p>
 *
 * <p>The parameters are all raw (assumed to be properly escaped) parts, and
 * any (but not all) may be null.  Undefined is not allowed.</p>
 *
 * @constructor
 */
function URI(
    rawScheme,
    rawCredentials, rawDomain, port,
    rawPath, rawQuery, rawFragment) {
  this.scheme_ = rawScheme;
  this.credentials_ = rawCredentials;
  this.domain_ = rawDomain;
  this.port_ = port;
  this.path_ = rawPath;
  this.query_ = rawQuery;
  this.fragment_ = rawFragment;
  /**
   * @type {Array|null}
   */
  this.paramCache_ = null;
}

/** returns the string form of the url. */
URI.prototype.toString = function () {
  var out = [];
  if (null !== this.scheme_) { out.push(this.scheme_, ':'); }
  if (null !== this.domain_) {
    out.push('//');
    if (null !== this.credentials_) { out.push(this.credentials_, '@'); }
    out.push(this.domain_);
    if (null !== this.port_) { out.push(':', this.port_.toString()); }
  }
  if (null !== this.path_) { out.push(this.path_); }
  if (null !== this.query_) { out.push('?', this.query_); }
  if (null !== this.fragment_) { out.push('#', this.fragment_); }
  return out.join('');
};

URI.prototype.clone = function () {
  return new URI(this.scheme_, this.credentials_, this.domain_, this.port_,
                 this.path_, this.query_, this.fragment_);
};

URI.prototype.getScheme = function () {
  // HTML5 spec does not require the scheme to be lowercased but
  // all common browsers except Safari lowercase the scheme.
  return this.scheme_ && decodeURIComponent(this.scheme_).toLowerCase();
};
URI.prototype.getRawScheme = function () {
  return this.scheme_;
};
URI.prototype.setScheme = function (newScheme) {
  this.scheme_ = encodeIfExists2(
      newScheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);
  return this;
};
URI.prototype.setRawScheme = function (newScheme) {
  this.scheme_ = newScheme ? newScheme : null;
  return this;
};
URI.prototype.hasScheme = function () {
  return null !== this.scheme_;
};


URI.prototype.getCredentials = function () {
  return this.credentials_ && decodeURIComponent(this.credentials_);
};
URI.prototype.getRawCredentials = function () {
  return this.credentials_;
};
URI.prototype.setCredentials = function (newCredentials) {
  this.credentials_ = encodeIfExists2(
      newCredentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);

  return this;
};
URI.prototype.setRawCredentials = function (newCredentials) {
  this.credentials_ = newCredentials ? newCredentials : null;
  return this;
};
URI.prototype.hasCredentials = function () {
  return null !== this.credentials_;
};


URI.prototype.getDomain = function () {
  return this.domain_ && decodeURIComponent(this.domain_);
};
URI.prototype.getRawDomain = function () {
  return this.domain_;
};
URI.prototype.setDomain = function (newDomain) {
  return this.setRawDomain(newDomain && encodeURIComponent(newDomain));
};
URI.prototype.setRawDomain = function (newDomain) {
  this.domain_ = newDomain ? newDomain : null;
  // Maintain the invariant that paths must start with a slash when the URI
  // is not path-relative.
  return this.setRawPath(this.path_);
};
URI.prototype.hasDomain = function () {
  return null !== this.domain_;
};


URI.prototype.getPort = function () {
  return this.port_ && decodeURIComponent(this.port_);
};
URI.prototype.setPort = function (newPort) {
  if (newPort) {
    newPort = Number(newPort);
    if (newPort !== (newPort & 0xffff)) {
      throw new Error('Bad port number ' + newPort);
    }
    this.port_ = '' + newPort;
  } else {
    this.port_ = null;
  }
  return this;
};
URI.prototype.hasPort = function () {
  return null !== this.port_;
};


URI.prototype.getPath = function () {
  return this.path_ && decodeURIComponent(this.path_);
};
URI.prototype.getRawPath = function () {
  return this.path_;
};
URI.prototype.setPath = function (newPath) {
  return this.setRawPath(encodeIfExists2(newPath, URI_DISALLOWED_IN_PATH_));
};
URI.prototype.setRawPath = function (newPath) {
  if (newPath) {
    newPath = String(newPath);
    this.path_ = 
      // Paths must start with '/' unless this is a path-relative URL.
      (!this.domain_ || /^\//.test(newPath)) ? newPath : '/' + newPath;
  } else {
    this.path_ = null;
  }
  return this;
};
URI.prototype.hasPath = function () {
  return null !== this.path_;
};


URI.prototype.getQuery = function () {
  // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
  // Within the query string, the plus sign is reserved as shorthand notation
  // for a space.
  return this.query_ && decodeURIComponent(this.query_).replace(/\+/g, ' ');
};
URI.prototype.getRawQuery = function () {
  return this.query_;
};
URI.prototype.setQuery = function (newQuery) {
  this.paramCache_ = null;
  this.query_ = encodeIfExists(newQuery);
  return this;
};
URI.prototype.setRawQuery = function (newQuery) {
  this.paramCache_ = null;
  this.query_ = newQuery ? newQuery : null;
  return this;
};
URI.prototype.hasQuery = function () {
  return null !== this.query_;
};

/**
 * sets the query given a list of strings of the form
 * [ key0, value0, key1, value1, ... ].
 *
 * <p><code>uri.setAllParameters(['a', 'b', 'c', 'd']).getQuery()</code>
 * will yield <code>'a=b&c=d'</code>.
 */
URI.prototype.setAllParameters = function (params) {
  if (typeof params === 'object') {
    if (!(params instanceof Array)
        && (params instanceof Object
            || Object.prototype.toString.call(params) !== '[object Array]')) {
      var newParams = [];
      var i = -1;
      for (var k in params) {
        var v = params[k];
        if ('string' === typeof v) {
          newParams[++i] = k;
          newParams[++i] = v;
        }
      }
      params = newParams;
    }
  }
  this.paramCache_ = null;
  var queryBuf = [];
  var separator = '';
  for (var j = 0; j < params.length;) {
    var k = params[j++];
    var v = params[j++];
    queryBuf.push(separator, encodeURIComponent(k.toString()));
    separator = '&';
    if (v) {
      queryBuf.push('=', encodeURIComponent(v.toString()));
    }
  }
  this.query_ = queryBuf.join('');
  return this;
};
URI.prototype.checkParameterCache_ = function () {
  if (!this.paramCache_) {
    var q = this.query_;
    if (!q) {
      this.paramCache_ = [];
    } else {
      var cgiParams = q.split(/[&\?]/);
      var out = [];
      var k = -1;
      for (var i = 0; i < cgiParams.length; ++i) {
        var m = cgiParams[i].match(/^([^=]*)(?:=(.*))?$/);
        // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
        // Within the query string, the plus sign is reserved as shorthand
        // notation for a space.
        out[++k] = decodeURIComponent(m[1]).replace(/\+/g, ' ');
        out[++k] = decodeURIComponent(m[2] || '').replace(/\+/g, ' ');
      }
      this.paramCache_ = out;
    }
  }
};
/**
 * sets the values of the named cgi parameters.
 *
 * <p>So, <code>uri.parse('foo?a=b&c=d&e=f').setParameterValues('c', ['new'])
 * </code> yields <tt>foo?a=b&c=new&e=f</tt>.</p>
 *
 * @param key {string}
 * @param values {Array.<string>} the new values.  If values is a single string
 *   then it will be treated as the sole value.
 */
URI.prototype.setParameterValues = function (key, values) {
  // be nice and avoid subtle bugs where [] operator on string performs charAt
  // on some browsers and crashes on IE
  if (typeof values === 'string') {
    values = [ values ];
  }

  this.checkParameterCache_();
  var newValueIndex = 0;
  var pc = this.paramCache_;
  var params = [];
  for (var i = 0, k = 0; i < pc.length; i += 2) {
    if (key === pc[i]) {
      if (newValueIndex < values.length) {
        params.push(key, values[newValueIndex++]);
      }
    } else {
      params.push(pc[i], pc[i + 1]);
    }
  }
  while (newValueIndex < values.length) {
    params.push(key, values[newValueIndex++]);
  }
  this.setAllParameters(params);
  return this;
};
URI.prototype.removeParameter = function (key) {
  return this.setParameterValues(key, []);
};
/**
 * returns the parameters specified in the query part of the uri as a list of
 * keys and values like [ key0, value0, key1, value1, ... ].
 *
 * @return {Array.<string>}
 */
URI.prototype.getAllParameters = function () {
  this.checkParameterCache_();
  return this.paramCache_.slice(0, this.paramCache_.length);
};
/**
 * returns the value<b>s</b> for a given cgi parameter as a list of decoded
 * query parameter values.
 * @return {Array.<string>}
 */
URI.prototype.getParameterValues = function (paramNameUnescaped) {
  this.checkParameterCache_();
  var values = [];
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    if (paramNameUnescaped === this.paramCache_[i]) {
      values.push(this.paramCache_[i + 1]);
    }
  }
  return values;
};
/**
 * returns a map of cgi parameter names to (non-empty) lists of values.
 * @return {Object.<string,Array.<string>>}
 */
URI.prototype.getParameterMap = function (paramNameUnescaped) {
  this.checkParameterCache_();
  var paramMap = {};
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    var key = this.paramCache_[i++],
      value = this.paramCache_[i++];
    if (!(key in paramMap)) {
      paramMap[key] = [value];
    } else {
      paramMap[key].push(value);
    }
  }
  return paramMap;
};
/**
 * returns the first value for a given cgi parameter or null if the given
 * parameter name does not appear in the query string.
 * If the given parameter name does appear, but has no '<tt>=</tt>' following
 * it, then the empty string will be returned.
 * @return {string|null}
 */
URI.prototype.getParameterValue = function (paramNameUnescaped) {
  this.checkParameterCache_();
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    if (paramNameUnescaped === this.paramCache_[i]) {
      return this.paramCache_[i + 1];
    }
  }
  return null;
};

URI.prototype.getFragment = function () {
  return this.fragment_ && decodeURIComponent(this.fragment_);
};
URI.prototype.getRawFragment = function () {
  return this.fragment_;
};
URI.prototype.setFragment = function (newFragment) {
  this.fragment_ = newFragment ? encodeURIComponent(newFragment) : null;
  return this;
};
URI.prototype.setRawFragment = function (newFragment) {
  this.fragment_ = newFragment ? newFragment : null;
  return this;
};
URI.prototype.hasFragment = function () {
  return null !== this.fragment_;
};

function nullIfAbsent(matchPart) {
  return ('string' == typeof matchPart) && (matchPart.length > 0)
         ? matchPart
         : null;
}




/**
 * a regular expression for breaking a URI into its component parts.
 *
 * <p>http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234 says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * <p>The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * <p>The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * <p>msamuel: I have modified the regular expression slightly to expose the
 * credentials, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       credentials -\
 *    $3 = www.ics.uci.edu   domain       | authority
 *    $4 = <undefined>       port        -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 */
var URI_RE_ = new RegExp(
      "^" +
      "(?:" +
        "([^:/?#]+)" +         // scheme
      ":)?" +
      "(?://" +
        "(?:([^/?#]*)@)?" +    // credentials
        "([^/?#:@]*)" +        // domain
        "(?::([0-9]+))?" +     // port
      ")?" +
      "([^?#]+)?" +            // path
      "(?:\\?([^#]*))?" +      // query
      "(?:#(.*))?" +           // fragment
      "$"
      );

var URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_ = /[#\/\?@]/g;
var URI_DISALLOWED_IN_PATH_ = /[\#\?]/g;

URI.parse = parse;
URI.create = create;
URI.resolve = resolve;
URI.collapse_dots = collapse_dots;  // Visible for testing.

// lightweight string-based api for loadModuleMaker
URI.utils = {
  mimeTypeOf: function (uri) {
    var uriObj = parse(uri);
    if (/\.html$/.test(uriObj.getPath())) {
      return 'text/html';
    } else {
      return 'application/javascript';
    }
  },
  resolve: function (base, uri) {
    if (base) {
      return resolve(parse(base), parse(uri)).toString();
    } else {
      return '' + uri;
    }
  }
};


return URI;
})();

// Copyright Google Inc.
// Licensed under the Apache Licence Version 2.0
// Autogenerated at Mon Feb 25 13:05:42 EST 2013
// @overrides window
// @provides html4
var html4 = {};
html4.atype = {
  'NONE': 0,
  'URI': 1,
  'URI_FRAGMENT': 11,
  'SCRIPT': 2,
  'STYLE': 3,
  'HTML': 12,
  'ID': 4,
  'IDREF': 5,
  'IDREFS': 6,
  'GLOBAL_NAME': 7,
  'LOCAL_NAME': 8,
  'CLASSES': 9,
  'FRAME_TARGET': 10,
  'MEDIA_QUERY': 13
};
html4[ 'atype' ] = html4.atype;
html4.ATTRIBS = {
  '*::class': 9,
  '*::dir': 0,
  '*::draggable': 0,
  '*::hidden': 0,
  '*::id': 4,
  '*::inert': 0,
  '*::itemprop': 0,
  '*::itemref': 6,
  '*::itemscope': 0,
  '*::lang': 0,
  '*::onblur': 2,
  '*::onchange': 2,
  '*::onclick': 2,
  '*::ondblclick': 2,
  '*::onfocus': 2,
  '*::onkeydown': 2,
  '*::onkeypress': 2,
  '*::onkeyup': 2,
  '*::onload': 2,
  '*::onmousedown': 2,
  '*::onmousemove': 2,
  '*::onmouseout': 2,
  '*::onmouseover': 2,
  '*::onmouseup': 2,
  '*::onreset': 2,
  '*::onscroll': 2,
  '*::onselect': 2,
  '*::onsubmit': 2,
  '*::onunload': 2,
  '*::spellcheck': 0,
  '*::style': 3,
  '*::title': 0,
  '*::translate': 0,
  'a::accesskey': 0,
  'a::coords': 0,
  'a::href': 1,
  'a::hreflang': 0,
  'a::name': 7,
  'a::onblur': 2,
  'a::onfocus': 2,
  'a::shape': 0,
  'a::tabindex': 0,
  'a::target': 10,
  'a::type': 0,
  'area::accesskey': 0,
  'area::alt': 0,
  'area::coords': 0,
  'area::href': 1,
  'area::nohref': 0,
  'area::onblur': 2,
  'area::onfocus': 2,
  'area::shape': 0,
  'area::tabindex': 0,
  'area::target': 10,
  'audio::controls': 0,
  'audio::loop': 0,
  'audio::mediagroup': 5,
  'audio::muted': 0,
  'audio::preload': 0,
  'bdo::dir': 0,
  'blockquote::cite': 1,
  'br::clear': 0,
  'button::accesskey': 0,
  'button::disabled': 0,
  'button::name': 8,
  'button::onblur': 2,
  'button::onfocus': 2,
  'button::tabindex': 0,
  'button::type': 0,
  'button::value': 0,
  'canvas::height': 0,
  'canvas::width': 0,
  'caption::align': 0,
  'col::align': 0,
  'col::char': 0,
  'col::charoff': 0,
  'col::span': 0,
  'col::valign': 0,
  'col::width': 0,
  'colgroup::align': 0,
  'colgroup::char': 0,
  'colgroup::charoff': 0,
  'colgroup::span': 0,
  'colgroup::valign': 0,
  'colgroup::width': 0,
  'command::checked': 0,
  'command::command': 5,
  'command::disabled': 0,
  'command::icon': 1,
  'command::label': 0,
  'command::radiogroup': 0,
  'command::type': 0,
  'data::value': 0,
  'del::cite': 1,
  'del::datetime': 0,
  'details::open': 0,
  'dir::compact': 0,
  'div::align': 0,
  'dl::compact': 0,
  'fieldset::disabled': 0,
  'font::color': 0,
  'font::face': 0,
  'font::size': 0,
  'form::accept': 0,
  'form::action': 1,
  'form::autocomplete': 0,
  'form::enctype': 0,
  'form::method': 0,
  'form::name': 7,
  'form::novalidate': 0,
  'form::onreset': 2,
  'form::onsubmit': 2,
  'form::target': 10,
  'h1::align': 0,
  'h2::align': 0,
  'h3::align': 0,
  'h4::align': 0,
  'h5::align': 0,
  'h6::align': 0,
  'hr::align': 0,
  'hr::noshade': 0,
  'hr::size': 0,
  'hr::width': 0,
  'iframe::align': 0,
  'iframe::frameborder': 0,
  'iframe::height': 0,
  'iframe::marginheight': 0,
  'iframe::marginwidth': 0,
  'iframe::width': 0,
  'img::align': 0,
  'img::alt': 0,
  'img::border': 0,
  'img::height': 0,
  'img::hspace': 0,
  'img::ismap': 0,
  'img::name': 7,
  'img::src': 1,
  'img::usemap': 11,
  'img::vspace': 0,
  'img::width': 0,
  'input::accept': 0,
  'input::accesskey': 0,
  'input::align': 0,
  'input::alt': 0,
  'input::autocomplete': 0,
  'input::checked': 0,
  'input::disabled': 0,
  'input::inputmode': 0,
  'input::ismap': 0,
  'input::list': 5,
  'input::max': 0,
  'input::maxlength': 0,
  'input::min': 0,
  'input::multiple': 0,
  'input::name': 8,
  'input::onblur': 2,
  'input::onchange': 2,
  'input::onfocus': 2,
  'input::onselect': 2,
  'input::placeholder': 0,
  'input::readonly': 0,
  'input::required': 0,
  'input::size': 0,
  'input::src': 1,
  'input::step': 0,
  'input::tabindex': 0,
  'input::type': 0,
  'input::usemap': 11,
  'input::value': 0,
  'ins::cite': 1,
  'ins::datetime': 0,
  'label::accesskey': 0,
  'label::for': 5,
  'label::onblur': 2,
  'label::onfocus': 2,
  'legend::accesskey': 0,
  'legend::align': 0,
  'li::type': 0,
  'li::value': 0,
  'map::name': 7,
  'menu::compact': 0,
  'menu::label': 0,
  'menu::type': 0,
  'meter::high': 0,
  'meter::low': 0,
  'meter::max': 0,
  'meter::min': 0,
  'meter::value': 0,
  'ol::compact': 0,
  'ol::reversed': 0,
  'ol::start': 0,
  'ol::type': 0,
  'optgroup::disabled': 0,
  'optgroup::label': 0,
  'option::disabled': 0,
  'option::label': 0,
  'option::selected': 0,
  'option::value': 0,
  'output::for': 6,
  'output::name': 8,
  'p::align': 0,
  'pre::width': 0,
  'progress::max': 0,
  'progress::min': 0,
  'progress::value': 0,
  'q::cite': 1,
  'select::autocomplete': 0,
  'select::disabled': 0,
  'select::multiple': 0,
  'select::name': 8,
  'select::onblur': 2,
  'select::onchange': 2,
  'select::onfocus': 2,
  'select::required': 0,
  'select::size': 0,
  'select::tabindex': 0,
  'source::type': 0,
  'table::align': 0,
  'table::bgcolor': 0,
  'table::border': 0,
  'table::cellpadding': 0,
  'table::cellspacing': 0,
  'table::frame': 0,
  'table::rules': 0,
  'table::summary': 0,
  'table::width': 0,
  'tbody::align': 0,
  'tbody::char': 0,
  'tbody::charoff': 0,
  'tbody::valign': 0,
  'td::abbr': 0,
  'td::align': 0,
  'td::axis': 0,
  'td::bgcolor': 0,
  'td::char': 0,
  'td::charoff': 0,
  'td::colspan': 0,
  'td::headers': 6,
  'td::height': 0,
  'td::nowrap': 0,
  'td::rowspan': 0,
  'td::scope': 0,
  'td::valign': 0,
  'td::width': 0,
  'textarea::accesskey': 0,
  'textarea::autocomplete': 0,
  'textarea::cols': 0,
  'textarea::disabled': 0,
  'textarea::inputmode': 0,
  'textarea::name': 8,
  'textarea::onblur': 2,
  'textarea::onchange': 2,
  'textarea::onfocus': 2,
  'textarea::onselect': 2,
  'textarea::placeholder': 0,
  'textarea::readonly': 0,
  'textarea::required': 0,
  'textarea::rows': 0,
  'textarea::tabindex': 0,
  'textarea::wrap': 0,
  'tfoot::align': 0,
  'tfoot::char': 0,
  'tfoot::charoff': 0,
  'tfoot::valign': 0,
  'th::abbr': 0,
  'th::align': 0,
  'th::axis': 0,
  'th::bgcolor': 0,
  'th::char': 0,
  'th::charoff': 0,
  'th::colspan': 0,
  'th::headers': 6,
  'th::height': 0,
  'th::nowrap': 0,
  'th::rowspan': 0,
  'th::scope': 0,
  'th::valign': 0,
  'th::width': 0,
  'thead::align': 0,
  'thead::char': 0,
  'thead::charoff': 0,
  'thead::valign': 0,
  'tr::align': 0,
  'tr::bgcolor': 0,
  'tr::char': 0,
  'tr::charoff': 0,
  'tr::valign': 0,
  'track::default': 0,
  'track::kind': 0,
  'track::label': 0,
  'track::srclang': 0,
  'ul::compact': 0,
  'ul::type': 0,
  'video::controls': 0,
  'video::height': 0,
  'video::loop': 0,
  'video::mediagroup': 5,
  'video::muted': 0,
  'video::poster': 1,
  'video::preload': 0,
  'video::width': 0
};
html4[ 'ATTRIBS' ] = html4.ATTRIBS;
html4.eflags = {
  'OPTIONAL_ENDTAG': 1,
  'EMPTY': 2,
  'CDATA': 4,
  'RCDATA': 8,
  'UNSAFE': 16,
  'FOLDABLE': 32,
  'SCRIPT': 64,
  'STYLE': 128,
  'VIRTUALIZED': 256
};
html4[ 'eflags' ] = html4.eflags;
html4.ELEMENTS = {
  'a': 0,
  'abbr': 0,
  'acronym': 0,
  'address': 0,
  'applet': 272,
  'area': 2,
  'article': 0,
  'aside': 0,
  'audio': 0,
  'b': 0,
  'base': 274,
  'basefont': 274,
  'bdi': 0,
  'bdo': 0,
  'big': 0,
  'blockquote': 0,
  'body': 305,
  'br': 2,
  'button': 0,
  'canvas': 0,
  'caption': 0,
  'center': 0,
  'cite': 0,
  'code': 0,
  'col': 2,
  'colgroup': 1,
  'command': 2,
  'data': 0,
  'datalist': 0,
  'dd': 1,
  'del': 0,
  'details': 0,
  'dfn': 0,
  'dialog': 272,
  'dir': 0,
  'div': 0,
  'dl': 0,
  'dt': 1,
  'em': 0,
  'fieldset': 0,
  'figcaption': 0,
  'figure': 0,
  'font': 0,
  'footer': 0,
  'form': 0,
  'frame': 274,
  'frameset': 272,
  'h1': 0,
  'h2': 0,
  'h3': 0,
  'h4': 0,
  'h5': 0,
  'h6': 0,
  'head': 305,
  'header': 0,
  'hgroup': 0,
  'hr': 2,
  'html': 305,
  'i': 0,
  'iframe': 4,
  'img': 2,
  'input': 2,
  'ins': 0,
  'isindex': 274,
  'kbd': 0,
  'keygen': 274,
  'label': 0,
  'legend': 0,
  'li': 1,
  'link': 274,
  'map': 0,
  'mark': 0,
  'menu': 0,
  'meta': 274,
  'meter': 0,
  'nav': 0,
  'nobr': 0,
  'noembed': 276,
  'noframes': 276,
  'noscript': 276,
  'object': 272,
  'ol': 0,
  'optgroup': 0,
  'option': 1,
  'output': 0,
  'p': 1,
  'param': 274,
  'pre': 0,
  'progress': 0,
  'q': 0,
  's': 0,
  'samp': 0,
  'script': 84,
  'section': 0,
  'select': 0,
  'small': 0,
  'source': 2,
  'span': 0,
  'strike': 0,
  'strong': 0,
  'style': 148,
  'sub': 0,
  'summary': 0,
  'sup': 0,
  'table': 0,
  'tbody': 1,
  'td': 1,
  'textarea': 8,
  'tfoot': 1,
  'th': 1,
  'thead': 1,
  'time': 0,
  'title': 280,
  'tr': 1,
  'track': 2,
  'tt': 0,
  'u': 0,
  'ul': 0,
  'var': 0,
  'video': 0,
  'wbr': 2
};
html4[ 'ELEMENTS' ] = html4.ELEMENTS;
html4.ELEMENT_DOM_INTERFACES = {
  'a': 'HTMLAnchorElement',
  'abbr': 'HTMLElement',
  'acronym': 'HTMLElement',
  'address': 'HTMLElement',
  'applet': 'HTMLAppletElement',
  'area': 'HTMLAreaElement',
  'article': 'HTMLElement',
  'aside': 'HTMLElement',
  'audio': 'HTMLAudioElement',
  'b': 'HTMLElement',
  'base': 'HTMLBaseElement',
  'basefont': 'HTMLBaseFontElement',
  'bdi': 'HTMLElement',
  'bdo': 'HTMLElement',
  'big': 'HTMLElement',
  'blockquote': 'HTMLQuoteElement',
  'body': 'HTMLBodyElement',
  'br': 'HTMLBRElement',
  'button': 'HTMLButtonElement',
  'canvas': 'HTMLCanvasElement',
  'caption': 'HTMLTableCaptionElement',
  'center': 'HTMLElement',
  'cite': 'HTMLElement',
  'code': 'HTMLElement',
  'col': 'HTMLTableColElement',
  'colgroup': 'HTMLTableColElement',
  'command': 'HTMLCommandElement',
  'data': 'HTMLElement',
  'datalist': 'HTMLDataListElement',
  'dd': 'HTMLElement',
  'del': 'HTMLModElement',
  'details': 'HTMLDetailsElement',
  'dfn': 'HTMLElement',
  'dialog': 'HTMLDialogElement',
  'dir': 'HTMLDirectoryElement',
  'div': 'HTMLDivElement',
  'dl': 'HTMLDListElement',
  'dt': 'HTMLElement',
  'em': 'HTMLElement',
  'fieldset': 'HTMLFieldSetElement',
  'figcaption': 'HTMLElement',
  'figure': 'HTMLElement',
  'font': 'HTMLFontElement',
  'footer': 'HTMLElement',
  'form': 'HTMLFormElement',
  'frame': 'HTMLFrameElement',
  'frameset': 'HTMLFrameSetElement',
  'h1': 'HTMLHeadingElement',
  'h2': 'HTMLHeadingElement',
  'h3': 'HTMLHeadingElement',
  'h4': 'HTMLHeadingElement',
  'h5': 'HTMLHeadingElement',
  'h6': 'HTMLHeadingElement',
  'head': 'HTMLHeadElement',
  'header': 'HTMLElement',
  'hgroup': 'HTMLElement',
  'hr': 'HTMLHRElement',
  'html': 'HTMLHtmlElement',
  'i': 'HTMLElement',
  'iframe': 'HTMLIFrameElement',
  'img': 'HTMLImageElement',
  'input': 'HTMLInputElement',
  'ins': 'HTMLModElement',
  'isindex': 'HTMLUnknownElement',
  'kbd': 'HTMLElement',
  'keygen': 'HTMLKeygenElement',
  'label': 'HTMLLabelElement',
  'legend': 'HTMLLegendElement',
  'li': 'HTMLLIElement',
  'link': 'HTMLLinkElement',
  'map': 'HTMLMapElement',
  'mark': 'HTMLElement',
  'menu': 'HTMLMenuElement',
  'meta': 'HTMLMetaElement',
  'meter': 'HTMLMeterElement',
  'nav': 'HTMLElement',
  'nobr': 'HTMLElement',
  'noembed': 'HTMLElement',
  'noframes': 'HTMLElement',
  'noscript': 'HTMLElement',
  'object': 'HTMLObjectElement',
  'ol': 'HTMLOListElement',
  'optgroup': 'HTMLOptGroupElement',
  'option': 'HTMLOptionElement',
  'output': 'HTMLOutputElement',
  'p': 'HTMLParagraphElement',
  'param': 'HTMLParamElement',
  'pre': 'HTMLPreElement',
  'progress': 'HTMLProgressElement',
  'q': 'HTMLQuoteElement',
  's': 'HTMLElement',
  'samp': 'HTMLElement',
  'script': 'HTMLScriptElement',
  'section': 'HTMLElement',
  'select': 'HTMLSelectElement',
  'small': 'HTMLElement',
  'source': 'HTMLSourceElement',
  'span': 'HTMLSpanElement',
  'strike': 'HTMLElement',
  'strong': 'HTMLElement',
  'style': 'HTMLStyleElement',
  'sub': 'HTMLElement',
  'summary': 'HTMLElement',
  'sup': 'HTMLElement',
  'table': 'HTMLTableElement',
  'tbody': 'HTMLTableSectionElement',
  'td': 'HTMLTableDataCellElement',
  'textarea': 'HTMLTextAreaElement',
  'tfoot': 'HTMLTableSectionElement',
  'th': 'HTMLTableHeaderCellElement',
  'thead': 'HTMLTableSectionElement',
  'time': 'HTMLTimeElement',
  'title': 'HTMLTitleElement',
  'tr': 'HTMLTableRowElement',
  'track': 'HTMLTrackElement',
  'tt': 'HTMLElement',
  'u': 'HTMLElement',
  'ul': 'HTMLUListElement',
  'var': 'HTMLElement',
  'video': 'HTMLVideoElement',
  'wbr': 'HTMLElement'
};
html4[ 'ELEMENT_DOM_INTERFACES' ] = html4.ELEMENT_DOM_INTERFACES;
html4.ueffects = {
  'NOT_LOADED': 0,
  'SAME_DOCUMENT': 1,
  'NEW_DOCUMENT': 2
};
html4[ 'ueffects' ] = html4.ueffects;
html4.URIEFFECTS = {
  'a::href': 2,
  'area::href': 2,
  'blockquote::cite': 0,
  'command::icon': 1,
  'del::cite': 0,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 0,
  'q::cite': 0,
  'video::poster': 1
};
html4[ 'URIEFFECTS' ] = html4.URIEFFECTS;
html4.ltypes = {
  'UNSANDBOXED': 2,
  'SANDBOXED': 1,
  'DATA': 0
};
html4[ 'ltypes' ] = html4.ltypes;
html4.LOADERTYPES = {
  'a::href': 2,
  'area::href': 2,
  'blockquote::cite': 2,
  'command::icon': 1,
  'del::cite': 2,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 2,
  'q::cite': 2,
  'video::poster': 1
};
html4[ 'LOADERTYPES' ] = html4.LOADERTYPES;

// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * An HTML sanitizer that can satisfy a variety of security policies.
 *
 * <p>
 * The HTML sanitizer is built around a SAX parser and HTML element and
 * attributes schemas.
 *
 * If the cssparser is loaded, inline styles are sanitized using the
 * css property and value schemas.  Else they are remove during
 * sanitization.
 *
 * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
 *
 * @author mikesamuel@gmail.com
 * @author jasvir@gmail.com
 * \@requires html4, URI
 * \@overrides window
 * \@provides html, html_sanitize
 */

// The Turkish i seems to be a non-issue, but abort in case it is.
if ('I'.toLowerCase() !== 'i') { throw 'I/i problem'; }

/**
 * \@namespace
 */
var html = (function(html4) {

  // For closure compiler
  var parseCssDeclarations, sanitizeCssProperty, cssSchema;
  if ('undefined' !== typeof window) {
    parseCssDeclarations = window['parseCssDeclarations'];
    sanitizeCssProperty = window['sanitizeCssProperty'];
    cssSchema = window['cssSchema'];
  }

  // The keys of this object must be 'quoted' or JSCompiler will mangle them!
  // This is a partial list -- lookupEntity() uses the host browser's parser
  // (when available) to implement full entity lookup.
  // Note that entities are in general case-sensitive; the uppercase ones are
  // explicitly defined by HTML5 (presumably as compatibility).
  var ENTITIES = {
    'lt': '<',
    'LT': '<',
    'gt': '>',
    'GT': '>',
    'amp': '&',
    'AMP': '&',
    'quot': '"',
    'apos': '\'',
    'nbsp': '\240'
  };

  // Patterns for types of entity/character reference names.
  var decimalEscapeRe = /^#(\d+)$/;
  var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
  // contains every entity per http://www.w3.org/TR/2011/WD-html5-20110113/named-character-references.html
  var safeEntityNameRe = /^[A-Za-z][A-za-z0-9]+$/;
  // Used as a hook to invoke the browser's entity parsing. <textarea> is used
  // because its content is parsed for entities but not tags.
  // TODO(kpreid): This retrieval is a kludge and leads to silent loss of
  // functionality if the document isn't available.
  var entityLookupElement =
      ('undefined' !== typeof window && window['document'])
          ? window['document'].createElement('textarea') : null;
  /**
   * Decodes an HTML entity.
   *
   * {\@updoc
   * $ lookupEntity('lt')
   * # '<'
   * $ lookupEntity('GT')
   * # '>'
   * $ lookupEntity('amp')
   * # '&'
   * $ lookupEntity('nbsp')
   * # '\xA0'
   * $ lookupEntity('apos')
   * # "'"
   * $ lookupEntity('quot')
   * # '"'
   * $ lookupEntity('#xa')
   * # '\n'
   * $ lookupEntity('#10')
   * # '\n'
   * $ lookupEntity('#x0a')
   * # '\n'
   * $ lookupEntity('#010')
   * # '\n'
   * $ lookupEntity('#x00A')
   * # '\n'
   * $ lookupEntity('Pi')      // Known failure
   * # '\u03A0'
   * $ lookupEntity('pi')      // Known failure
   * # '\u03C0'
   * }
   *
   * @param {string} name the content between the '&' and the ';'.
   * @return {string} a single unicode code-point as a string.
   */
  function lookupEntity(name) {
    // TODO: entity lookup as specified by HTML5 actually depends on the
    // presence of the ";".
    if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
    var m = name.match(decimalEscapeRe);
    if (m) {
      return String.fromCharCode(parseInt(m[1], 10));
    } else if (!!(m = name.match(hexEscapeRe))) {
      return String.fromCharCode(parseInt(m[1], 16));
    } else if (entityLookupElement && safeEntityNameRe.test(name)) {
      entityLookupElement.innerHTML = '&' + name + ';';
      var text = entityLookupElement.textContent;
      ENTITIES[name] = text;
      return text;
    } else {
      return '&' + name + ';';
    }
  }

  function decodeOneEntity(_, name) {
    return lookupEntity(name);
  }

  var nulRe = /\0/g;
  function stripNULs(s) {
    return s.replace(nulRe, '');
  }

  var ENTITY_RE_1 = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g;
  var ENTITY_RE_2 = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/;
  /**
   * The plain text of a chunk of HTML CDATA which possibly containing.
   *
   * {\@updoc
   * $ unescapeEntities('')
   * # ''
   * $ unescapeEntities('hello World!')
   * # 'hello World!'
   * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
   * # '1 < 2 && 4 > 3\n'
   * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
   * # '<&lt <- unfinished entity>'
   * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
   * # '/foo?bar=baz&copy=true'
   * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
   * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
   * }
   *
   * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
   *     an HTML entity.
   */
  function unescapeEntities(s) {
    return s.replace(ENTITY_RE_1, decodeOneEntity);
  }

  var ampRe = /&/g;
  var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
  var ltRe = /[<]/g;
  var gtRe = />/g;
  var quotRe = /\"/g;

  /**
   * Escapes HTML special characters in attribute values.
   *
   * {\@updoc
   * $ escapeAttrib('')
   * # ''
   * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
   * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
   * $ escapeAttrib('Hello <World>!')
   * # 'Hello &lt;World&gt;!'
   * }
   */
  function escapeAttrib(s) {
    return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
  }

  /**
   * Escape entities in RCDATA that can be escaped without changing the meaning.
   * {\@updoc
   * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
   * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
   * }
   */
  function normalizeRCData(rcdata) {
    return rcdata
        .replace(looseAmpRe, '&amp;$1')
        .replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;');
  }

  // TODO(felix8a): validate sanitizer regexs against the HTML5 grammar at
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

  // We initially split input so that potentially meaningful characters
  // like '<' and '>' are separate tokens, using a fast dumb process that
  // ignores quoting.  Then we walk that token stream, and when we see a
  // '<' that's the start of a tag, we use ATTR_RE to extract tag
  // attributes from the next token.  That token will never have a '>'
  // character.  However, it might have an unbalanced quote character, and
  // when we see that, we combine additional tokens to balance the quote.

  var ATTR_RE = new RegExp(
    '^\\s*' +
    '([-.:\\w]+)' +             // 1 = Attribute name
    '(?:' + (
      '\\s*(=)\\s*' +           // 2 = Is there a value?
      '(' + (                   // 3 = Attribute value
        // TODO(felix8a): maybe use backref to match quotes
        '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
        '|' +
        '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
        '|' +
        // Positive lookahead to prevent interpretation of
        // <foo a= b=c> as <foo a='b=c'>
        // TODO(felix8a): might be able to drop this case
        '(?=[a-z][-\\w]*\\s*=)' +
        '|' +
        // Unquoted value that isn't an attribute name
        // (since we didn't match the positive lookahead above)
        '[^\"\'\\s]*' ) +
      ')' ) +
    ')?',
    'i');

  // false on IE<=8, true on most other browsers
  var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

  // bitmask for tags with special parsing, like <script> and <textarea>
  var EFLAGS_TEXT = html4.eflags['CDATA'] | html4.eflags['RCDATA'];

  /**
   * Given a SAX-like event handler, produce a function that feeds those
   * events and a parameter to the event handler.
   *
   * The event handler has the form:{@code
   * {
   *   // Name is an upper-case HTML tag name.  Attribs is an array of
   *   // alternating upper-case attribute names, and attribute values.  The
   *   // attribs array is reused by the parser.  Param is the value passed to
   *   // the saxParser.
   *   startTag: function (name, attribs, param) { ... },
   *   endTag:   function (name, param) { ... },
   *   pcdata:   function (text, param) { ... },
   *   rcdata:   function (text, param) { ... },
   *   cdata:    function (text, param) { ... },
   *   startDoc: function (param) { ... },
   *   endDoc:   function (param) { ... }
   * }}
   *
   * @param {Object} handler a record containing event handlers.
   * @return {function(string, Object)} A function that takes a chunk of HTML
   *     and a parameter.  The parameter is passed on to the handler methods.
   */
  function makeSaxParser(handler) {
    // Accept quoted or unquoted keys (Closure compat)
    var hcopy = {
      cdata: handler.cdata || handler['cdata'],
      comment: handler.comment || handler['comment'],
      endDoc: handler.endDoc || handler['endDoc'],
      endTag: handler.endTag || handler['endTag'],
      pcdata: handler.pcdata || handler['pcdata'],
      rcdata: handler.rcdata || handler['rcdata'],
      startDoc: handler.startDoc || handler['startDoc'],
      startTag: handler.startTag || handler['startTag']
    };
    return function(htmlText, param) {
      return parse(htmlText, hcopy, param);
    };
  }

  // Parsing strategy is to split input into parts that might be lexically
  // meaningful (every ">" becomes a separate part), and then recombine
  // parts if we discover they're in a different context.

  // TODO(felix8a): Significant performance regressions from -legacy,
  // tested on
  //    Chrome 18.0
  //    Firefox 11.0
  //    IE 6, 7, 8, 9
  //    Opera 11.61
  //    Safari 5.1.3
  // Many of these are unusual patterns that are linearly slower and still
  // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

  // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
  // browsers.  The hotspot is htmlSplit.

  // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
  // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

  // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
  // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

  // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

  var continuationMarker = {};
  function parse(htmlText, handler, param) {
    var m, p, tagName;
    var parts = htmlSplit(htmlText);
    var state = {
      noMoreGT: false,
      noMoreEndComments: false
    };
    parseCPS(handler, parts, 0, state, param);
  }

  function continuationMaker(h, parts, initial, state, param) {
    return function () {
      parseCPS(h, parts, initial, state, param);
    };
  }

  function parseCPS(h, parts, initial, state, param) {
    try {
      if (h.startDoc && initial == 0) { h.startDoc(param); }
      var m, p, tagName;
      for (var pos = initial, end = parts.length; pos < end;) {
        var current = parts[pos++];
        var next = parts[pos];
        switch (current) {
        case '&':
          if (ENTITY_RE_2.test(next)) {
            if (h.pcdata) {
              h.pcdata('&' + next, param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
            pos++;
          } else {
            if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\/':
          if (m = /^([-\w:]+)[^\'\"]*/.exec(next)) {
            if (m[0].length === next.length && parts[pos + 1] === '>') {
              // fast case, no attribute parsing needed
              pos += 2;
              tagName = m[1].toLowerCase();
              if (h.endTag) {
                h.endTag(tagName, param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
            } else {
              // slow case, need to parse attributes
              // TODO(felix8a): do we really care about misparsing this?
              pos = parseEndTag(
                parts, pos, h, param, continuationMarker, state);
            }
          } else {
            if (h.pcdata) {
              h.pcdata('&lt;/', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<':
          if (m = /^([-\w:]+)\s*\/?/.exec(next)) {
            if (m[0].length === next.length && parts[pos + 1] === '>') {
              // fast case, no attribute parsing needed
              pos += 2;
              tagName = m[1].toLowerCase();
              if (h.startTag) {
                h.startTag(tagName, [], param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
              // tags like <script> and <textarea> have special parsing
              var eflags = html4.ELEMENTS[tagName];
              if (eflags & EFLAGS_TEXT) {
                var tag = { name: tagName, next: pos, eflags: eflags };
                pos = parseText(
                  parts, tag, h, param, continuationMarker, state);
              }
            } else {
              // slow case, need to parse attributes
              pos = parseStartTag(
                parts, pos, h, param, continuationMarker, state);
            }
          } else {
            if (h.pcdata) {
              h.pcdata('&lt;', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\!--':
          // The pathological case is n copies of '<\!--' without '-->', and
          // repeated failure to find '-->' is quadratic.  We avoid that by
          // remembering when search for '-->' fails.
          if (!state.noMoreEndComments) {
            // A comment <\!--x--> is split into three tokens:
            //   '<\!--', 'x--', '>'
            // We want to find the next '>' token that has a preceding '--'.
            // pos is at the 'x--'.
            for (p = pos + 1; p < end; p++) {
              if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
            }
            if (p < end) {
              if (h.comment) {
                var comment = parts.slice(pos, p).join('');
                h.comment(
                  comment.substr(0, comment.length - 2), param,
                  continuationMarker,
                  continuationMaker(h, parts, p + 1, state, param));
              }
              pos = p + 1;
            } else {
              state.noMoreEndComments = true;
            }
          }
          if (state.noMoreEndComments) {
            if (h.pcdata) {
              h.pcdata('&lt;!--', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\!':
          if (!/^\w/.test(next)) {
            if (h.pcdata) {
              h.pcdata('&lt;!', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          } else {
            // similar to noMoreEndComment logic
            if (!state.noMoreGT) {
              for (p = pos + 1; p < end; p++) {
                if (parts[p] === '>') { break; }
              }
              if (p < end) {
                pos = p + 1;
              } else {
                state.noMoreGT = true;
              }
            }
            if (state.noMoreGT) {
              if (h.pcdata) {
                h.pcdata('&lt;!', param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
            }
          }
          break;
        case '<?':
          // similar to noMoreEndComment logic
          if (!state.noMoreGT) {
            for (p = pos + 1; p < end; p++) {
              if (parts[p] === '>') { break; }
            }
            if (p < end) {
              pos = p + 1;
            } else {
              state.noMoreGT = true;
            }
          }
          if (state.noMoreGT) {
            if (h.pcdata) {
              h.pcdata('&lt;?', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '>':
          if (h.pcdata) {
            h.pcdata("&gt;", param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
          break;
        case '':
          break;
        default:
          if (h.pcdata) {
            h.pcdata(current, param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
          break;
        }
      }
      if (h.endDoc) { h.endDoc(param); }
    } catch (e) {
      if (e !== continuationMarker) { throw e; }
    }
  }

  // Split str into parts for the html parser.
  function htmlSplit(str) {
    // can't hoist this out of the function because of the re.exec loop.
    var re = /(<\/|<\!--|<[!?]|[&<>])/g;
    str += '';
    if (splitWillCapture) {
      return str.split(re);
    } else {
      var parts = [];
      var lastPos = 0;
      var m;
      while ((m = re.exec(str)) !== null) {
        parts.push(str.substring(lastPos, m.index));
        parts.push(m[0]);
        lastPos = m.index + m[0].length;
      }
      parts.push(str.substring(lastPos));
      return parts;
    }
  }

  function parseEndTag(parts, pos, h, param, continuationMarker, state) {
    var tag = parseTagAndAttrs(parts, pos);
    // drop unclosed tags
    if (!tag) { return parts.length; }
    if (h.endTag) {
      h.endTag(tag.name, param, continuationMarker,
        continuationMaker(h, parts, pos, state, param));
    }
    return tag.next;
  }

  function parseStartTag(parts, pos, h, param, continuationMarker, state) {
    var tag = parseTagAndAttrs(parts, pos);
    // drop unclosed tags
    if (!tag) { return parts.length; }
    if (h.startTag) {
      h.startTag(tag.name, tag.attrs, param, continuationMarker,
        continuationMaker(h, parts, tag.next, state, param));
    }
    // tags like <script> and <textarea> have special parsing
    if (tag.eflags & EFLAGS_TEXT) {
      return parseText(parts, tag, h, param, continuationMarker, state);
    } else {
      return tag.next;
    }
  }

  var endTagRe = {};

  // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
  // which means everything is text until we see the correct closing tag.
  function parseText(parts, tag, h, param, continuationMarker, state) {
    var end = parts.length;
    if (!endTagRe.hasOwnProperty(tag.name)) {
      endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
    }
    var re = endTagRe[tag.name];
    var first = tag.next;
    var p = tag.next + 1;
    for (; p < end; p++) {
      if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
    }
    if (p < end) { p -= 1; }
    var buf = parts.slice(first, p).join('');
    if (tag.eflags & html4.eflags['CDATA']) {
      if (h.cdata) {
        h.cdata(buf, param, continuationMarker,
          continuationMaker(h, parts, p, state, param));
      }
    } else if (tag.eflags & html4.eflags['RCDATA']) {
      if (h.rcdata) {
        h.rcdata(normalizeRCData(buf), param, continuationMarker,
          continuationMaker(h, parts, p, state, param));
      }
    } else {
      throw new Error('bug');
    }
    return p;
  }

  // at this point, parts[pos-1] is either "<" or "<\/".
  function parseTagAndAttrs(parts, pos) {
    var m = /^([-\w:]+)/.exec(parts[pos]);
    var tag = {};
    tag.name = m[1].toLowerCase();
    tag.eflags = html4.ELEMENTS[tag.name];
    var buf = parts[pos].substr(m[0].length);
    // Find the next '>'.  We optimistically assume this '>' is not in a
    // quoted context, and further down we fix things up if it turns out to
    // be quoted.
    var p = pos + 1;
    var end = parts.length;
    for (; p < end; p++) {
      if (parts[p] === '>') { break; }
      buf += parts[p];
    }
    if (end <= p) { return void 0; }
    var attrs = [];
    while (buf !== '') {
      m = ATTR_RE.exec(buf);
      if (!m) {
        // No attribute found: skip garbage
        buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

      } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
        // Unterminated quote: slurp to the next unquoted '>'
        var quote = m[4] || m[6];
        var sawQuote = false;
        var abuf = [buf, parts[p++]];
        for (; p < end; p++) {
          if (sawQuote) {
            if (parts[p] === '>') { break; }
          } else if (0 <= parts[p].indexOf(quote)) {
            sawQuote = true;
          }
          abuf.push(parts[p]);
        }
        // Slurp failed: lose the garbage
        if (end <= p) { break; }
        // Otherwise retry attribute parsing
        buf = abuf.join('');
        continue;

      } else {
        // We have an attribute
        var aName = m[1].toLowerCase();
        var aValue = m[2] ? decodeValue(m[3]) : '';
        attrs.push(aName, aValue);
        buf = buf.substr(m[0].length);
      }
    }
    tag.attrs = attrs;
    tag.next = p + 1;
    return tag;
  }

  function decodeValue(v) {
    var q = v.charCodeAt(0);
    if (q === 0x22 || q === 0x27) { // " or '
      v = v.substr(1, v.length - 2);
    }
    return unescapeEntities(stripNULs(v));
  }

  /**
   * Returns a function that strips unsafe tags and attributes from html.
   * @param {function(string, Array.<string>): ?Array.<string>} tagPolicy
   *     A function that takes (tagName, attribs[]), where tagName is a key in
   *     html4.ELEMENTS and attribs is an array of alternating attribute names
   *     and values.  It should return a record (as follows), or null to delete
   *     the element.  It's okay for tagPolicy to modify the attribs array,
   *     but the same array is reused, so it should not be held between calls.
   *     Record keys:
   *        attribs: (required) Sanitized attributes array.
   *        tagName: Replacement tag name.
   * @return {function(string, Array)} A function that sanitizes a string of
   *     HTML and appends result strings to the second argument, an array.
   */
  function makeHtmlSanitizer(tagPolicy) {
    var stack;
    var ignoring;
    var emit = function (text, out) {
      if (!ignoring) { out.push(text); }
    };
    return makeSaxParser({
      'startDoc': function(_) {
        stack = [];
        ignoring = false;
      },
      'startTag': function(tagNameOrig, attribs, out) {
        if (ignoring) { return; }
        if (!html4.ELEMENTS.hasOwnProperty(tagNameOrig)) { return; }
        var eflagsOrig = html4.ELEMENTS[tagNameOrig];
        if (eflagsOrig & html4.eflags['FOLDABLE']) {
          return;
        }

        var decision = tagPolicy(tagNameOrig, attribs);
        if (!decision) {
          ignoring = !(eflagsOrig & html4.eflags['EMPTY']);
          return;
        } else if (typeof decision !== 'object') {
          throw new Error('tagPolicy did not return object (old API?)');
        }
        if ('attribs' in decision) {
          attribs = decision['attribs'];
        } else {
          throw new Error('tagPolicy gave no attribs');
        }
        var eflagsRep;
        var tagNameRep;
        if ('tagName' in decision) {
          tagNameRep = decision['tagName'];
          eflagsRep = html4.ELEMENTS[tagNameRep];
        } else {
          tagNameRep = tagNameOrig;
          eflagsRep = eflagsOrig;
        }
        // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
        // attribute names.

        // If this is an optional-end-tag element and either this element or its
        // previous like sibling was rewritten, then insert a close tag to
        // preserve structure.
        if (eflagsOrig & html4.eflags['OPTIONAL_ENDTAG']) {
          var onStack = stack[stack.length - 1];
          if (onStack && onStack.orig === tagNameOrig &&
              (onStack.rep !== tagNameRep || tagNameOrig !== tagNameRep)) {
                out.push('<\/', onStack.rep, '>');
          }
        }

        if (!(eflagsOrig & html4.eflags['EMPTY'])) {
          stack.push({orig: tagNameOrig, rep: tagNameRep});
        }

        out.push('<', tagNameRep);
        for (var i = 0, n = attribs.length; i < n; i += 2) {
          var attribName = attribs[i],
              value = attribs[i + 1];
          if (value !== null && value !== void 0) {
            out.push(' ', attribName, '="', escapeAttrib(value), '"');
          }
        }
        out.push('>');

        if ((eflagsOrig & html4.eflags['EMPTY'])
            && !(eflagsRep & html4.eflags['EMPTY'])) {
          // replacement is non-empty, synthesize end tag
          out.push('<\/', tagNameRep, '>');
        }
      },
      'endTag': function(tagName, out) {
        if (ignoring) {
          ignoring = false;
          return;
        }
        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
        var eflags = html4.ELEMENTS[tagName];
        if (!(eflags & (html4.eflags['EMPTY'] | html4.eflags['FOLDABLE']))) {
          var index;
          if (eflags & html4.eflags['OPTIONAL_ENDTAG']) {
            for (index = stack.length; --index >= 0;) {
              var stackElOrigTag = stack[index].orig;
              if (stackElOrigTag === tagName) { break; }
              if (!(html4.ELEMENTS[stackElOrigTag] &
                    html4.eflags['OPTIONAL_ENDTAG'])) {
                // Don't pop non optional end tags looking for a match.
                return;
              }
            }
          } else {
            for (index = stack.length; --index >= 0;) {
              if (stack[index].orig === tagName) { break; }
            }
          }
          if (index < 0) { return; }  // Not opened.
          for (var i = stack.length; --i > index;) {
            var stackElRepTag = stack[i].rep;
            if (!(html4.ELEMENTS[stackElRepTag] &
                  html4.eflags['OPTIONAL_ENDTAG'])) {
              out.push('<\/', stackElRepTag, '>');
            }
          }
          if (index < stack.length) {
            tagName = stack[index].rep;
          }
          stack.length = index;
          out.push('<\/', tagName, '>');
        }
      },
      'pcdata': emit,
      'rcdata': emit,
      'cdata': emit,
      'endDoc': function(out) {
        for (; stack.length; stack.length--) {
          out.push('<\/', stack[stack.length - 1].rep, '>');
        }
      }
    });
  }

  var ALLOWED_URI_SCHEMES = /^(?:https?|mailto|data)$/i;

  function safeUri(uri, effect, ltype, hints, naiveUriRewriter) {
    if (!naiveUriRewriter) { return null; }
    try {
      var parsed = URI.parse('' + uri);
      if (parsed) {
        if (!parsed.hasScheme() ||
            ALLOWED_URI_SCHEMES.test(parsed.getScheme())) {
          var safe = naiveUriRewriter(parsed, effect, ltype, hints);
          return safe ? safe.toString() : null;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function log(logger, tagName, attribName, oldValue, newValue) {
    if (!attribName) {
      logger(tagName + " removed", {
        change: "removed",
        tagName: tagName
      });
    }
    if (oldValue !== newValue) {
      var changed = "changed";
      if (oldValue && !newValue) {
        changed = "removed";
      } else if (!oldValue && newValue)  {
        changed = "added";
      }
      logger(tagName + "." + attribName + " " + changed, {
        change: changed,
        tagName: tagName,
        attribName: attribName,
        oldValue: oldValue,
        newValue: newValue
      });
    }
  }

  function lookupAttribute(map, tagName, attribName) {
    var attribKey;
    attribKey = tagName + '::' + attribName;
    if (map.hasOwnProperty(attribKey)) {
      return map[attribKey];
    }
    attribKey = '*::' + attribName;
    if (map.hasOwnProperty(attribKey)) {
      return map[attribKey];
    }
    return void 0;
  }
  function getAttributeType(tagName, attribName) {
    return lookupAttribute(html4.ATTRIBS, tagName, attribName);
  }
  function getLoaderType(tagName, attribName) {
    return lookupAttribute(html4.LOADERTYPES, tagName, attribName);
  }
  function getUriEffect(tagName, attribName) {
    return lookupAttribute(html4.URIEFFECTS, tagName, attribName);
  }

  /**
   * Sanitizes attributes on an HTML tag.
   * @param {string} tagName An HTML tag name in lowercase.
   * @param {Array.<?string>} attribs An array of alternating names and values.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes; it can return a new string value, or null to
   *     delete the attribute.  If unspecified, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes; it can return a new string value, or null to delete
   *     the attribute.  If unspecified, these attributes are kept unchanged.
   * @return {Array.<?string>} The sanitized attributes as a list of alternating
   *     names and values, where a null value means to omit the attribute.
   */
  function sanitizeAttribs(tagName, attribs,
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    // TODO(felix8a): it's obnoxious that domado duplicates much of this
    // TODO(felix8a): maybe consistently enforce constraints like target=
    for (var i = 0; i < attribs.length; i += 2) {
      var attribName = attribs[i];
      var value = attribs[i + 1];
      var oldValue = value;
      var atype = null, attribKey;
      if ((attribKey = tagName + '::' + attribName,
           html4.ATTRIBS.hasOwnProperty(attribKey)) ||
          (attribKey = '*::' + attribName,
           html4.ATTRIBS.hasOwnProperty(attribKey))) {
        atype = html4.ATTRIBS[attribKey];
      }
      if (atype !== null) {
        switch (atype) {
          case html4.atype['NONE']: break;
          case html4.atype['SCRIPT']:
            value = null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['STYLE']:
            if ('undefined' === typeof parseCssDeclarations) {
              value = null;
              if (opt_logger) {
                log(opt_logger, tagName, attribName, oldValue, value);
	      }
              break;
            }
            var sanitizedDeclarations = [];
            parseCssDeclarations(
                value,
                {
                  declaration: function (property, tokens) {
                    var normProp = property.toLowerCase();
                    var schema = cssSchema[normProp];
                    if (!schema) {
                      return;
                    }
                    sanitizeCssProperty(
                        normProp, schema, tokens,
                        opt_naiveUriRewriter
                        ? function (url) {
                            return safeUri(
                                url, html4.ueffects.SAME_DOCUMENT,
                                html4.ltypes.SANDBOXED,
                                {
                                  "TYPE": "CSS",
                                  "CSS_PROP": normProp
                                }, opt_naiveUriRewriter);
                          }
                        : null);
                    sanitizedDeclarations.push(property + ': ' + tokens.join(' '));
                  }
                });
            value = sanitizedDeclarations.length > 0 ?
              sanitizedDeclarations.join(' ; ') : null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['ID']:
          case html4.atype['IDREF']:
          case html4.atype['IDREFS']:
          case html4.atype['GLOBAL_NAME']:
          case html4.atype['LOCAL_NAME']:
          case html4.atype['CLASSES']:
            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['URI']:
            value = safeUri(value,
              getUriEffect(tagName, attribName),
              getLoaderType(tagName, attribName),
              {
                "TYPE": "MARKUP",
                "XML_ATTR": attribName,
                "XML_TAG": tagName
              }, opt_naiveUriRewriter);
              if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['URI_FRAGMENT']:
            if (value && '#' === value.charAt(0)) {
              value = value.substring(1);  // remove the leading '#'
              value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
              if (value !== null && value !== void 0) {
                value = '#' + value;  // restore the leading '#'
              }
            } else {
              value = null;
            }
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          default:
            value = null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
        }
      } else {
        value = null;
        if (opt_logger) {
          log(opt_logger, tagName, attribName, oldValue, value);
        }
      }
      attribs[i + 1] = value;
    }
    return attribs;
  }

  /**
   * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
   * and applies the default attribute sanitizer with the supplied policy for
   * URI attributes and NMTOKEN attributes.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes.  If not given, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes.  If not given, such attributes are left unchanged.
   * @return {function(string, Array.<?string>)} A tagPolicy suitable for
   *     passing to html.sanitize.
   */
  function makeTagPolicy(
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    return function(tagName, attribs) {
      if (!(html4.ELEMENTS[tagName] & html4.eflags['UNSAFE'])) {
        return {
          'attribs': sanitizeAttribs(tagName, attribs,
            opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger)
        };
      } else {
        if (opt_logger) {
          log(opt_logger, tagName, undefined, undefined, undefined);
        }
      }
    };
  }

  /**
   * Sanitizes HTML tags and attributes according to a given policy.
   * @param {string} inputHtml The HTML to sanitize.
   * @param {function(string, Array.<?string>)} tagPolicy A function that
   *     decides which tags to accept and sanitizes their attributes (see
   *     makeHtmlSanitizer above for details).
   * @return {string} The sanitized HTML.
   */
  function sanitizeWithPolicy(inputHtml, tagPolicy) {
    var outputArray = [];
    makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
    return outputArray.join('');
  }

  /**
   * Strips unsafe tags and attributes from HTML.
   * @param {string} inputHtml The HTML to sanitize.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes.  If not given, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes.  If not given, such attributes are left unchanged.
   */
  function sanitize(inputHtml,
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    var tagPolicy = makeTagPolicy(
      opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger);
    return sanitizeWithPolicy(inputHtml, tagPolicy);
  }

  // Export both quoted and unquoted names for Closure linkage.
  var html = {};
  html.escapeAttrib = html['escapeAttrib'] = escapeAttrib;
  html.makeHtmlSanitizer = html['makeHtmlSanitizer'] = makeHtmlSanitizer;
  html.makeSaxParser = html['makeSaxParser'] = makeSaxParser;
  html.makeTagPolicy = html['makeTagPolicy'] = makeTagPolicy;
  html.normalizeRCData = html['normalizeRCData'] = normalizeRCData;
  html.sanitize = html['sanitize'] = sanitize;
  html.sanitizeAttribs = html['sanitizeAttribs'] = sanitizeAttribs;
  html.sanitizeWithPolicy = html['sanitizeWithPolicy'] = sanitizeWithPolicy;
  html.unescapeEntities = html['unescapeEntities'] = unescapeEntities;
  return html;
})(html4);

var html_sanitize = html['sanitize'];

// Loosen restrictions of Caja's
// html-sanitizer to allow for styling
html4.ATTRIBS['*::style'] = 0;
html4.ELEMENTS['style'] = 0;
html4.ATTRIBS['a::target'] = 0;
html4.ELEMENTS['video'] = 0;
html4.ATTRIBS['video::src'] = 0;
html4.ATTRIBS['video::poster'] = 0;
html4.ATTRIBS['video::controls'] = 0;
html4.ELEMENTS['audio'] = 0;
html4.ATTRIBS['audio::src'] = 0;
html4.ATTRIBS['video::autoplay'] = 0;
html4.ATTRIBS['video::controls'] = 0;

if (typeof module !== 'undefined') {
    module.exports = html_sanitize;
}

},{}],7:[function(require,module,exports){
module.exports={
  "author": "Mapbox",
  "name": "mapbox.js",
  "description": "mapbox javascript api",
  "version": "1.6.2",
  "homepage": "http://mapbox.com/",
  "repository": {
    "type": "git",
    "url": "git://github.com/mapbox/mapbox.js.git"
  },
  "main": "index.js",
  "dependencies": {
    "leaflet": "0.7.2",
    "mustache": "0.7.3",
    "corslite": "0.0.5",
    "json3": "3.3.1",
    "sanitize-caja": "0.0.0"
  },
  "scripts": {
    "test": "jshint src/*.js && mocha-phantomjs test/index.html"
  },
  "devDependencies": {
    "leaflet-hash": "0.2.1",
    "leaflet-fullscreen": "0.0.0",
    "uglify-js": "2.4.8",
    "mocha": "1.17.1",
    "expect.js": "0.3.1",
    "sinon": "1.8.2",
    "mocha-phantomjs": "3.1.6",
    "happen": "0.1.3",
    "browserify": "3.23.1",
    "jshint": "2.4.4",
    "clean-css": "~2.0.7",
    "minimist": "0.0.5",
    "marked": "~0.3.0"
  },
  "optionalDependencies": {},
  "engines": {
    "node": "*"
  }
}

},{}],8:[function(require,module,exports){
'use strict';

module.exports = {

    HTTP_URLS: [
        'http://a.tiles.mapbox.com/v3/',
        'http://b.tiles.mapbox.com/v3/'],

    FORCE_HTTPS: false,

    HTTPS_URLS: [
        'https://a.tiles.mapbox.com/v3/',
        'https://b.tiles.mapbox.com/v3/']
};

},{}],9:[function(require,module,exports){
'use strict';

var util = require('./util'),
    urlhelper = require('./url'),
    request = require('./request'),
    marker = require('./marker'),
    simplestyle = require('./simplestyle');

// # featureLayer
//
// A layer of features, loaded from Mapbox or else. Adds the ability
// to reset features, filter them, and load them from a GeoJSON URL.
var FeatureLayer = L.FeatureGroup.extend({
    options: {
        filter: function() { return true; },
        sanitizer: require('sanitize-caja'),
        style: simplestyle.style
    },

    initialize: function(_, options) {
        L.setOptions(this, options);

        this._layers = {};

        if (typeof _ === 'string') {
            util.idUrl(_, this);
        // javascript object of TileJSON data
        } else if (_ && typeof _ === 'object') {
            this.setGeoJSON(_);
        }
    },

    setGeoJSON: function(_) {
        this._geojson = _;
        this.clearLayers();
        this._initialize(_);
        return this;
    },

    getGeoJSON: function() {
        return this._geojson;
    },

    loadURL: function(url) {
        if (this._request && 'abort' in this._request) this._request.abort();
        url = urlhelper.jsonify(url);
        this._request = request(url, L.bind(function(err, json) {
            this._request = null;
            if (err && err.type !== 'abort') {
                util.log('could not load features at ' + url);
                this.fire('error', {error: err});
            } else if (json) {
                this.setGeoJSON(json);
                this.fire('ready');
            }
        }, this));
        return this;
    },

    loadID: function(id) {
        return this.loadURL(urlhelper.base() + id + '/markers.geojson');
    },

    setFilter: function(_) {
        this.options.filter = _;
        if (this._geojson) {
            this.clearLayers();
            this._initialize(this._geojson);
        }
        return this;
    },

    getFilter: function() {
        return this.options.filter;
    },

    _initialize: function(json) {
        var features = L.Util.isArray(json) ? json : json.features,
            i, len;

        if (features) {
            for (i = 0, len = features.length; i < len; i++) {
                // Only add this if geometry or geometries are set and not null
                if (features[i].geometries || features[i].geometry || features[i].features) {
                    this._initialize(features[i]);
                }
            }
        } else if (this.options.filter(json)) {

            var layer = L.GeoJSON.geometryToLayer(json, marker.style),
                popupHtml = marker.createPopup(json, this.options.sanitizer);

            if ('setStyle' in layer) {
                layer.setStyle(simplestyle.style(json));
            }

            layer.feature = json;

            if (popupHtml) {
                layer.bindPopup(popupHtml, {
                    closeButton: false
                });
            }

            this.addLayer(layer);
        }
    }
});

module.exports = function(_, options) {
    return new FeatureLayer(_, options);
};

},{"./marker":19,"./request":20,"./simplestyle":22,"./url":24,"./util":25,"sanitize-caja":5}],10:[function(require,module,exports){
'use strict';

var util = require('./util'),
    urlhelper = require('./url'),
    request = require('./request');

// Low-level geocoding interface - wraps specific API calls and their
// return values.
module.exports = function(_) {

    var geocoder = {}, url;

    geocoder.getURL = function(_) {
        return url;
    };

    geocoder.setURL = function(_) {
        url = urlhelper.jsonify(_);
        return geocoder;
    };

    geocoder.setID = function(_) {
        util.strict(_, 'string');
        geocoder.setURL(urlhelper.base() + _ + '/geocode/{query}.json');
        return geocoder;
    };

    geocoder.setTileJSON = function(_) {
        util.strict(_, 'object');
        geocoder.setURL(_.geocoder);
        return geocoder;
    };

    geocoder.queryURL = function(_) {
        if (!geocoder.getURL()) throw new Error('Geocoding map ID not set');
        if (typeof _ !== 'string') {
            var parts = [];
            for (var i = 0; i < _.length; i++) {
                parts[i] = encodeURIComponent(_[i]);
            }
            return L.Util.template(geocoder.getURL(), {
                query: parts.join(';')
            });
        } else {
            return L.Util.template(geocoder.getURL(), {
                query: encodeURIComponent(_)
            });
        }
    };

    geocoder.query = function(_, callback) {
        util.strict(callback, 'function');
        request(geocoder.queryURL(_), function(err, json) {
            if (json && (json.length || json.results)) {
                var res = {
                    results: json.length ? json : json.results,
                };
                if (json.results) {
                    res.latlng = [json.results[0][0].lat,
                        json.results[0][0].lon];
                }
                if (json.results && json.results[0][0].bounds !== undefined) {
                    res.bounds = json.results[0][0].bounds;
                    res.lbounds = util.lbounds(res.bounds);
                }
                callback(null, res);
            } else callback(err || true);
        });

        return geocoder;
    };

    // a reverse geocode:
    //
    //  geocoder.reverseQuery([80, 20])
    geocoder.reverseQuery = function(_, callback) {
        var q = '';

        // sort through different ways people represent lat and lon pairs
        function normalize(x) {
            if (x.lat !== undefined && x.lng !== undefined) {
                return x.lng + ',' + x.lat;
            } else if (x.lat !== undefined && x.lon !== undefined) {
                return x.lon + ',' + x.lat;
            } else {
                return x[0] + ',' + x[1];
            }
        }

        if (_.length && _[0].length) {
            for (var i = 0, pts = []; i < _.length; i++) {
                pts.push(normalize(_[i]));
            }
            q = pts.join(';');
        } else {
            q = normalize(_);
        }

        request(geocoder.queryURL(q), function(err, json) {
            callback(err, json);
        });

        return geocoder;
    };

    if (typeof _ === 'string') {
        if (_.indexOf('/') == -1) geocoder.setID(_);
        else geocoder.setURL(_);
    } else if (typeof _ === 'object') {
        geocoder.setTileJSON(_);
    }

    return geocoder;
};

},{"./request":20,"./url":24,"./util":25}],11:[function(require,module,exports){
'use strict';

var geocoder = require('./geocoder');

var GeocoderControl = L.Control.extend({
    includes: L.Mixin.Events,

    options: {
        position: 'topleft',
        pointZoom: 16,
        keepOpen: false
    },

    initialize: function(_, options) {
        L.Util.setOptions(this, options);
        this.geocoder = geocoder(_);
    },

    setURL: function(_) {
        this.geocoder.setURL(_);
        return this;
    },

    getURL: function() {
        return this.geocoder.getURL();
    },

    setID: function(_) {
        this.geocoder.setID(_);
        return this;
    },

    setTileJSON: function(_) {
        this.geocoder.setTileJSON(_);
        return this;
    },

    _toggle: function(e) {
        if (e) L.DomEvent.stop(e);
        if (L.DomUtil.hasClass(this._container, 'active')) {
            L.DomUtil.removeClass(this._container, 'active');
            this._results.innerHTML = '';
            this._input.blur();
        } else {
            L.DomUtil.addClass(this._container, 'active');
            this._input.focus();
            this._input.select();
        }
    },

    _closeIfOpen: function(e) {
        if (L.DomUtil.hasClass(this._container, 'active') &&
            !this.options.keepOpen) {
            L.DomUtil.removeClass(this._container, 'active');
            this._results.innerHTML = '';
            this._input.blur();
        }
    },

    onAdd: function(map) {

        var container = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder leaflet-bar leaflet-control'),
            link = L.DomUtil.create('a', 'leaflet-control-mapbox-geocoder-toggle mapbox-icon mapbox-icon-geocoder', container),
            results = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder-results', container),
            wrap = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder-wrap', container),
            form = L.DomUtil.create('form', 'leaflet-control-mapbox-geocoder-form', wrap),
            input  = L.DomUtil.create('input', '', form);

        link.href = '#';
        link.innerHTML = '&nbsp;';

        input.type = 'text';
        input.setAttribute('placeholder', 'Search');

        L.DomEvent.addListener(form, 'submit', this._geocode, this);
        L.DomEvent.disableClickPropagation(container);

        this._map = map;
        this._results = results;
        this._input = input;
        this._form = form;

        if (this.options.keepOpen) {
            L.DomUtil.addClass(container, 'active');
        } else {
            this._map.on('click', this._closeIfOpen, this);
            L.DomEvent.addListener(link, 'click', this._toggle, this);
        }

        return container;
    },

    _geocode: function(e) {
        L.DomEvent.preventDefault(e);
        L.DomUtil.addClass(this._container, 'searching');

        var map = this._map;
        var onload = L.bind(function(err, resp) {
            L.DomUtil.removeClass(this._container, 'searching');
            if (err || !resp || !resp.results || !resp.results.length) {
                this.fire('error', {error: err});
            } else {
                this._results.innerHTML = '';
                if (resp.results.length === 1) {
                    this.fire('autoselect', { data: resp });
                    chooseResult(resp.results[0][0]);
                    this._closeIfOpen();
                } else {
                    for (var i = 0, l = Math.min(resp.results.length, 5); i < l; i++) {
                        var name = [];
                        for (var j = 0; j < resp.results[i].length; j++) {
                            if (resp.results[i][j].name) name.push(resp.results[i][j].name);
                        }
                        if (!name.length) continue;

                        var r = L.DomUtil.create('a', '', this._results);
                        r.innerHTML = name.join(', ');
                        r.href = '#';

                        (L.bind(function(result) {
                            L.DomEvent.addListener(r, 'click', function(e) {
                                chooseResult(result[0]);
                                L.DomEvent.stop(e);
                                this.fire('select', { data: result });
                            }, this);
                        }, this))(resp.results[i]);
                    }
                    if (resp.results.length > 5) {
                        var outof = L.DomUtil.create('span', '', this._results);
                        outof.innerHTML = 'Top 5 of ' + resp.results.length + '  results';
                    }
                }
                this.fire('found', resp);
            }
        }, this);

        var chooseResult = L.bind(function(result) {
            if (result.bounds) {
                var _ = result.bounds;
                this._map.fitBounds(L.latLngBounds([[_[1], _[0]], [_[3], _[2]]]));
            } else if (result.lat !== undefined && result.lon !== undefined) {
                this._map.setView([result.lat, result.lon], (map.getZoom() === undefined) ?
                    this.options.pointZoom :
                    Math.max(map.getZoom(), this.options.pointZoom));
            }
        }, this);

        this.geocoder.query(this._input.value, onload);
    }
});

module.exports = function(_, options) {
    return new GeocoderControl(_, options);
};

},{"./geocoder":10}],12:[function(require,module,exports){
'use strict';

function utfDecode(c) {
    if (c >= 93) c--;
    if (c >= 35) c--;
    return c - 32;
}

module.exports = function(data) {
    return function(x, y) {
        if (!data) return;
        var idx = utfDecode(data.grid[y].charCodeAt(x)),
            key = data.keys[idx];
        return data.data[key];
    };
};

},{}],13:[function(require,module,exports){
'use strict';

var util = require('./util'),
    Mustache = require('mustache');

var GridControl = L.Control.extend({

    options: {
        pinnable: true,
        follow: false,
        sanitizer: require('sanitize-caja'),
        touchTeaser: true,
        location: true
    },

    _currentContent: '',

    // pinned means that this control is on a feature and the user has likely
    // clicked. pinned will not become false unless the user clicks off
    // of the feature onto another or clicks x
    _pinned: false,

    initialize: function(_, options) {
        L.Util.setOptions(this, options);
        util.strict_instance(_, L.Class, 'L.mapbox.gridLayer');
        this._layer = _;
    },

    setTemplate: function(template) {
        util.strict(template, 'string');
        this.options.template = template;
        return this;
    },

    _template: function(format, data) {
        if (!data) return;
        var template = this.options.template || this._layer.getTileJSON().template;
        if (template) {
            var d = {};
            d['__' + format + '__'] = true;
            return this.options.sanitizer(
                Mustache.to_html(template, L.extend(d, data)));
        }
    },

    // change the content of the tooltip HTML if it has changed, otherwise
    // noop
    _show: function(content, o) {
        if (content === this._currentContent) return;

        this._currentContent = content;

        if (this.options.follow) {
            this._popup.setContent(content)
                .setLatLng(o.latLng);
            if (this._map._popup !== this._popup) this._popup.openOn(this._map);
        } else {
            this._container.style.display = 'block';
            this._contentWrapper.innerHTML = content;
        }
    },

    hide: function() {
        this._pinned = false;
        this._currentContent = '';

        this._map.closePopup();
        this._container.style.display = 'none';
        this._contentWrapper.innerHTML = '';

        L.DomUtil.removeClass(this._container, 'closable');

        return this;
    },

    _mouseover: function(o) {
        if (o.data) {
            L.DomUtil.addClass(this._map._container, 'map-clickable');
        } else {
            L.DomUtil.removeClass(this._map._container, 'map-clickable');
        }

        if (this._pinned) return;

        var content = this._template('teaser', o.data);
        if (content) {
            this._show(content, o);
        } else {
            this.hide();
        }
    },

    _mousemove: function(o) {
        if (this._pinned) return;
        if (!this.options.follow) return;

        this._popup.setLatLng(o.latLng);
    },

    _navigateTo: function(url) {
        window.top.location.href = url;
    },

    _click: function(o) {

        var location_formatted = this._template('location', o.data);
        if (this.options.location && location_formatted &&
            location_formatted.search(/^https?:/) === 0) {
            return this._navigateTo(this._template('location', o.data));
        }

        if (!this.options.pinnable) return;

        var content = this._template('full', o.data);

        if (!content && this.options.touchTeaser && L.Browser.touch) {
            content = this._template('teaser', o.data);
        }

        if (content) {
            L.DomUtil.addClass(this._container, 'closable');
            this._pinned = true;
            this._show(content, o);
        } else if (this._pinned) {
            L.DomUtil.removeClass(this._container, 'closable');
            this._pinned = false;
            this.hide();
        }
    },

    _onPopupClose: function() {
        this._currentContent = null;
        this._pinned = false;
    },

    _createClosebutton: function(container, fn) {
        var link = L.DomUtil.create('a', 'close', container);

        link.innerHTML = 'close';
        link.href = '#';
        link.title = 'close';

        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'mousedown', L.DomEvent.stopPropagation)
            .on(link, 'dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', fn, this);

        return link;
    },

    onAdd: function(map) {
        this._map = map;

        var className = 'leaflet-control-grid map-tooltip',
            container = L.DomUtil.create('div', className),
            contentWrapper = L.DomUtil.create('div', 'map-tooltip-content');

        // hide the container element initially
        container.style.display = 'none';
        this._createClosebutton(container, this.hide);
        container.appendChild(contentWrapper);

        this._contentWrapper = contentWrapper;
        this._popup = new L.Popup({ autoPan: false, closeOnClick: false });

        map.on('popupclose', this._onPopupClose, this);

        L.DomEvent
            .disableClickPropagation(container)
            // allow people to scroll tooltips with mousewheel
            .addListener(container, 'mousewheel', L.DomEvent.stopPropagation);

        this._layer
            .on('mouseover', this._mouseover, this)
            .on('mousemove', this._mousemove, this)
            .on('click', this._click, this);

        return container;
    },

    onRemove: function (map) {

        map.off('popupclose', this._onPopupClose, this);

        this._layer
            .off('mouseover', this._mouseover, this)
            .off('mousemove', this._mousemove, this)
            .off('click', this._click, this);
    }
});

module.exports = function(_, options) {
    return new GridControl(_, options);
};

},{"./util":25,"mustache":4,"sanitize-caja":5}],14:[function(require,module,exports){
'use strict';

var util = require('./util'),
    url = require('./url'),
    request = require('./request'),
    grid = require('./grid');

// forked from danzel/L.UTFGrid
var GridLayer = L.Class.extend({
    includes: [L.Mixin.Events, require('./load_tilejson')],

    options: {
        template: function() { return ''; }
    },

    _mouseOn: null,
    _tilejson: {},
    _cache: {},

    initialize: function(_, options) {
        L.Util.setOptions(this, options);
        this._loadTileJSON(_);
    },

    _setTileJSON: function(json) {
        util.strict(json, 'object');

        L.extend(this.options, {
            grids: json.grids,
            minZoom: json.minzoom,
            maxZoom: json.maxzoom,
            bounds: json.bounds && util.lbounds(json.bounds)
        });

        this._tilejson = json;
        this._cache = {};
        this._update();

        return this;
    },

    getTileJSON: function() {
        return this._tilejson;
    },

    active: function() {
        return !!(this._map && this.options.grids && this.options.grids.length);
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    onAdd: function(map) {
        this._map = map;
        this._update();

        this._map
            .on('click', this._click, this)
            .on('mousemove', this._move, this)
            .on('moveend', this._update, this);
    },

    onRemove: function() {
        this._map
            .off('click', this._click, this)
            .off('mousemove', this._move, this)
            .off('moveend', this._update, this);
    },

    getData: function(latlng, callback) {
        if (!this.active()) return;

        var map = this._map,
            point = map.project(latlng.wrap()),
            tileSize = 256,
            resolution = 4,
            x = Math.floor(point.x / tileSize),
            y = Math.floor(point.y / tileSize),
            max = map.options.crs.scale(map.getZoom()) / tileSize;

        x = (x + max) % max;
        y = (y + max) % max;

        this._getTile(map.getZoom(), x, y, function(grid) {
            var gridX = Math.floor((point.x - (x * tileSize)) / resolution),
                gridY = Math.floor((point.y - (y * tileSize)) / resolution);

            callback(grid(gridX, gridY));
        });

        return this;
    },

    _click: function(e) {
        this.getData(e.latlng, L.bind(function(data) {
            this.fire('click', {
                latLng: e.latlng,
                data: data
            });
        }, this));
    },

    _move: function(e) {
        this.getData(e.latlng, L.bind(function(data) {
            if (data !== this._mouseOn) {
                if (this._mouseOn) {
                    this.fire('mouseout', {
                        latLng: e.latlng,
                        data: this._mouseOn
                    });
                }

                this.fire('mouseover', {
                    latLng: e.latlng,
                    data: data
                });

                this._mouseOn = data;
            } else {
                this.fire('mousemove', {
                    latLng: e.latlng,
                    data: data
                });
            }
        }, this));
    },

    _getTileURL: function(tilePoint) {
        var urls = this.options.grids,
            index = (tilePoint.x + tilePoint.y) % urls.length,
            url = urls[index];

        return L.Util.template(url, tilePoint);
    },

    // Load up all required json grid files
    _update: function() {
        if (!this.active()) return;

        var bounds = this._map.getPixelBounds(),
            z = this._map.getZoom(),
            tileSize = 256;

        if (z > this.options.maxZoom || z < this.options.minZoom) return;

        var nwTilePoint = new L.Point(
                Math.floor(bounds.min.x / tileSize),
                Math.floor(bounds.min.y / tileSize)),
            seTilePoint = new L.Point(
                Math.floor(bounds.max.x / tileSize),
                Math.floor(bounds.max.y / tileSize)),
            max = this._map.options.crs.scale(z) / tileSize;

        for (var x = nwTilePoint.x; x <= seTilePoint.x; x++) {
            for (var y = nwTilePoint.y; y <= seTilePoint.y; y++) {
                // x wrapped
                var xw = (x + max) % max, yw = (y + max) % max;
                this._getTile(z, xw, yw);
            }
        }
    },

    _getTile: function(z, x, y, callback) {
        var key = z + '_' + x + '_' + y,
            tilePoint = L.point(x, y);

        tilePoint.z = z;

        if (!this._tileShouldBeLoaded(tilePoint)) {
            return;
        }

        if (key in this._cache) {
            if (!callback) return;

            if (typeof this._cache[key] === 'function') {
                callback(this._cache[key]); // Already loaded
            } else {
                this._cache[key].push(callback); // Pending
            }

            return;
        }

        this._cache[key] = [];

        if (callback) {
            this._cache[key].push(callback);
        }

        request(this._getTileURL(tilePoint), L.bind(function(err, json) {
            var callbacks = this._cache[key];
            this._cache[key] = grid(json);
            for (var i = 0; i < callbacks.length; ++i) {
                callbacks[i](this._cache[key]);
            }
        }, this));
    },

    _tileShouldBeLoaded: function(tilePoint) {
        if (tilePoint.z > this.options.maxZoom || tilePoint.z < this.options.minZoom) {
            return false;
        }

        if (this.options.bounds) {
            var tileSize = 256,
                nwPoint = tilePoint.multiplyBy(tileSize),
                sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
                nw = this._map.unproject(nwPoint),
                se = this._map.unproject(sePoint),
                bounds = new L.LatLngBounds([nw, se]);

            if (!this.options.bounds.intersects(bounds)) {
                return false;
            }
        }

        return true;
    }
});

module.exports = function(_, options) {
    return new GridLayer(_, options);
};

},{"./grid":12,"./load_tilejson":17,"./request":20,"./url":24,"./util":25}],15:[function(require,module,exports){
'use strict';

var InfoControl = L.Control.extend({
    options: {
        position: 'bottomright',
        sanitizer: require('sanitize-caja')
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._info = {};
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'mapbox-control-info mapbox-small');
        this._content = L.DomUtil.create('div', 'map-info-container', this._container);

        if (this.options.position === 'bottomright' ||
            this.options.position === 'topright') {
            this._container.className += ' mapbox-control-info-right';
        }

        var link = L.DomUtil.create('a', 'mapbox-info-toggle mapbox-icon mapbox-icon-info', this._container);
        link.href = '#';

        L.DomEvent.addListener(link, 'click', this._showInfo, this);
        L.DomEvent.disableClickPropagation(this._container);

        for (var i in map._layers) {
            if (map._layers[i].getAttribution) {
                this.addInfo(map._layers[i].getAttribution());
            }
        }

        map
            .on('moveend', this._editLink, this)
            .on('layeradd', this._onLayerAdd, this)
            .on('layerremove', this._onLayerRemove, this);

        this._update();
        return this._container;
    },

    onRemove: function(map) {
        map
            .off('moveend', this._editLink, this)
            .off('layeradd', this._onLayerAdd, this)
            .off('layerremove', this._onLayerRemove, this);
    },

    addInfo: function(text) {
        if (!text) return this;
        if (!this._info[text]) this._info[text] = 0;
        this._info[text] = true;
        return this._update();
    },

    removeInfo: function (text) {
        if (!text) return this;
        if (this._info[text]) this._info[text] = false;
        return this._update();
    },

    _showInfo: function(e) {
        L.DomEvent.preventDefault(e);
        if (this._active === true) return this._hidecontent();

        L.DomUtil.addClass(this._container, 'active');
        this._active = true;
        this._update();
    },

    _hidecontent: function() {
        this._content.innerHTML = '';
        this._active = false;
        L.DomUtil.removeClass(this._container, 'active');
        return;
    },

    _update: function() {
        if (!this._map) { return this; }
        this._content.innerHTML = '';
        var hide = 'none';
        var info = [];

        for (var i in this._info) {
            if (this._info.hasOwnProperty(i) && this._info[i]) {
                info.push(this.options.sanitizer(i));
                hide = 'block';
            }
        }

        this._content.innerHTML += info.join(' | ');
        this._editLink();

        // If there are no results in _info then hide this.
        this._container.style.display = hide;
        return this;
    },

    _editLink: function() {
        if (!this._content.getElementsByClassName) {
            return;
        }
        var link = this._content.getElementsByClassName('mapbox-improve-map');
        if (link.length && this._map._loaded) {
            var center = this._map.getCenter().wrap();
            var tilejson = this._tilejson || this._map._tilejson || {};
            var id = tilejson.id || '';

            for (var i = 0; i < link.length; i++) {
                link[i].href = link[i].href.split('#')[0] + '#' + id + '/' +
                    center.lng.toFixed(3) + '/' +
                    center.lat.toFixed(3) + '/' +
                    this._map.getZoom();
            }
        }
    },

    _onLayerAdd: function(e) {
        if (e.layer.getAttribution && e.layer.getAttribution()) {
            this.addInfo(e.layer.getAttribution());
        } else if ('on' in e.layer && e.layer.getAttribution) {
            e.layer.on('ready', L.bind(function() {
                this.addInfo(e.layer.getAttribution());
            }, this));
        }
    },

    _onLayerRemove: function (e) {
        if (e.layer.getAttribution) {
            this.removeInfo(e.layer.getAttribution());
        }
    }
});

module.exports = function(options) {
    return new InfoControl(options);
};

},{"sanitize-caja":5}],16:[function(require,module,exports){
'use strict';

var LegendControl = L.Control.extend({

    options: {
        position: 'bottomright',
        sanitizer: require('sanitize-caja')
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._legends = {};
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'map-legends wax-legends');
        L.DomEvent.disableClickPropagation(this._container);

        this._update();

        return this._container;
    },

    addLegend: function(text) {
        if (!text) { return this; }

        if (!this._legends[text]) {
            this._legends[text] = 0;
        }

        this._legends[text]++;
        return this._update();
    },

    removeLegend: function(text) {
        if (!text) { return this; }
        if (this._legends[text]) this._legends[text]--;
        return this._update();
    },

    _update: function() {
        if (!this._map) { return this; }

        this._container.innerHTML = '';
        var hide = 'none';

        for (var i in this._legends) {
            if (this._legends.hasOwnProperty(i) && this._legends[i]) {
                var div = L.DomUtil.create('div', 'map-legend wax-legend', this._container);
                div.innerHTML = this.options.sanitizer(i);
                hide = 'block';
            }
        }

        // hide the control entirely unless there is at least one legend;
        // otherwise there will be a small grey blemish on the map.
        this._container.style.display = hide;

        return this;
    }
});

module.exports = function(options) {
    return new LegendControl(options);
};

},{"sanitize-caja":5}],17:[function(require,module,exports){
'use strict';

var request = require('./request'),
    url = require('./url'),
    util = require('./util');

module.exports = {
    _loadTileJSON: function(_) {
        if (typeof _ === 'string') {
            if (_.indexOf('/') == -1) {
                _ = url.base() + _ + '.json';
            }

            request(url.secureFlag(_), L.bind(function(err, json) {
                if (err) {
                    util.log('could not load TileJSON at ' + _);
                    this.fire('error', {error: err});
                } else if (json) {
                    this._setTileJSON(json);
                    this.fire('ready');
                }
            }, this));
        } else if (_ && typeof _ === 'object') {
            this._setTileJSON(_);
        }
    }
};

},{"./request":20,"./url":24,"./util":25}],18:[function(require,module,exports){
'use strict';

var util = require('./util'),
    tileLayer = require('./tile_layer'),
    featureLayer = require('./feature_layer'),
    gridLayer = require('./grid_layer'),
    gridControl = require('./grid_control'),
    infoControl = require('./info_control'),
    shareControl = require('./share_control'),
    legendControl = require('./legend_control');

var LMap = L.Map.extend({
    includes: [require('./load_tilejson')],

    options: {
        tileLayer: {},
        featureLayer: {},
        gridLayer: {},
        legendControl: {},
        gridControl: {},
        infoControl: {},
        attributionControl: false,
        shareControl: false
    },

    _tilejson: {},

    initialize: function(element, _, options) {
        L.Map.prototype.initialize.call(this, element, options);

        // disable the default 'Leaflet' text
        if (this.attributionControl) this.attributionControl.setPrefix('');

        if (this.options.tileLayer) {
            this.tileLayer = tileLayer(undefined, this.options.tileLayer);
            this.addLayer(this.tileLayer);
        }

        if (this.options.featureLayer === false || this.options.markerLayer === false) {
            this.options.featureLayer = this.options.markerLayer = false;
        } else if (this.options.markerLayer) {
            this.options.featureLayer = this.options.markerLayer;
        }

        if (this.options.featureLayer) {
            this.featureLayer = this.markerLayer =
                featureLayer(undefined, this.options.featureLayer);
            this.addLayer(this.featureLayer);
        }

        if (this.options.gridLayer) {
            this.gridLayer = gridLayer(undefined, this.options.gridLayer);
            this.addLayer(this.gridLayer);
        }

        if (this.options.gridLayer && this.options.gridControl) {
            this.gridControl = gridControl(this.gridLayer, this.options.gridControl);
            this.addControl(this.gridControl);
        }

        if (this.options.infoControl) {
            this.infoControl = infoControl(this.options.infoControl);
            this.addControl(this.infoControl);
        }

        if (this.options.legendControl) {
            this.legendControl = legendControl(this.options.legendControl);
            this.addControl(this.legendControl);
        }

        if (this.options.shareControl) {
            this.shareControl = shareControl(undefined, this.options.shareControl);
            this.addControl(this.shareControl);
        }

        this._loadTileJSON(_);
    },

    // Update certain properties on 'ready' event
    addLayer: function(layer) {
        if ('on' in layer) { layer.on('ready', L.bind(function() { this._updateLayer(layer); }, this)); }
        return L.Map.prototype.addLayer.call(this, layer);
    },

    // use a javascript object of tilejson data to configure this layer
    _setTileJSON: function(_) {
        this._tilejson = _;
        this._initialize(_);
        return this;
    },

    getTileJSON: function() {
        return this._tilejson;
    },

    _initialize: function(json) {
        if (this.tileLayer) {
            this.tileLayer._setTileJSON(json);
            this._updateLayer(this.tileLayer);
        }

        if (this.featureLayer && !this.featureLayer.getGeoJSON() && json.data && json.data[0]) {
            this.featureLayer.loadURL(json.data[0]);
        }

        if (this.gridLayer) {
            this.gridLayer._setTileJSON(json);
            this._updateLayer(this.gridLayer);
        }

        if (this.infoControl && json.attribution) {
            this.infoControl.addInfo(json.attribution);
        }

        if (this.legendControl && json.legend) {
            this.legendControl.addLegend(json.legend);
        }

        if (this.shareControl) {
            this.shareControl._setTileJSON(json);
        }

        if (!this._loaded && json.center) {
            var zoom = json.center[2],
                center = L.latLng(json.center[1], json.center[0]);

            this.setView(center, zoom);
        }
    },

    _updateLayer: function(layer) {
        if (!layer.options) return;

        if (this.infoControl && this._loaded) {
            this.infoControl.addInfo(layer.options.infoControl);
        }

        if (this.attributionControl && this._loaded && layer.getAttribution) {
            this.attributionControl.addAttribution(layer.getAttribution());
        }

        if (!(L.stamp(layer) in this._zoomBoundLayers) &&
                (layer.options.maxZoom || layer.options.minZoom)) {
            this._zoomBoundLayers[L.stamp(layer)] = layer;
        }

        this._updateZoomLevels();
    }
});

module.exports = function(element, _, options) {
    return new LMap(element, _, options);
};

},{"./feature_layer":9,"./grid_control":13,"./grid_layer":14,"./info_control":15,"./legend_control":16,"./load_tilejson":17,"./share_control":21,"./tile_layer":23,"./util":25}],19:[function(require,module,exports){
'use strict';

var url = require('./url'),
    util = require('./util'),
    sanitize = require('sanitize-caja');

// mapbox-related markers functionality
// provide an icon from mapbox's simple-style spec and hosted markers
// service
function icon(fp) {
    fp = fp || {};

    var sizes = {
            small: [20, 50],
            medium: [30, 70],
            large: [35, 90]
        },
        size = fp['marker-size'] || 'medium',
        symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '',
        color = (fp['marker-color'] || '7e7e7e').replace('#', '');

    return L.icon({
        iconUrl: url.base() + 'marker/' +
            'pin-' + size.charAt(0) + symbol + '+' + color +
            // detect and use retina markers, which are x2 resolution
            ((L.Browser.retina) ? '@2x' : '') + '.png',
        iconSize: sizes[size],
        iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2],
        popupAnchor: [0, -sizes[size][1] / 2]
    });
}

// a factory that provides markers for Leaflet from Mapbox's
// [simple-style specification](https://github.com/mapbox/simplestyle-spec)
// and [Markers API](http://mapbox.com/developers/api/#markers).
function style(f, latlon) {
    return L.marker(latlon, {
        icon: icon(f.properties),
        title: util.strip_tags(
            sanitize((f.properties && f.properties.title) || ''))
    });
}

// Sanitize and format properties of a GeoJSON Feature object in order
// to form the HTML string used as the argument for `L.createPopup`
function createPopup(f, sanitizer) {
    if (!f || !f.properties) return '';
    var popup = '';

    if (f.properties.title) {
        popup += '<div class="marker-title">' + f.properties.title + '</div>';
    }

    if (f.properties.description) {
        popup += '<div class="marker-description">' + f.properties.description + '</div>';
    }

    return (sanitizer || sanitize)(popup);
}

module.exports = {
    icon: icon,
    style: style,
    createPopup: createPopup
};

},{"./url":24,"./util":25,"sanitize-caja":5}],20:[function(require,module,exports){
'use strict';

var corslite = require('corslite'),
    JSON3 = require('json3'),
    strict = require('./util').strict;

module.exports = function(url, callback) {
    strict(url, 'string');
    strict(callback, 'function');
    return corslite(url, onload);
    function onload(err, resp) {
        if (!err && resp) {
            // hardcoded grid response
            if (resp.responseText[0] == 'g') {
                resp = JSON3.parse(resp.responseText
                    .substring(5, resp.responseText.length - 2));
            } else {
                resp = JSON3.parse(resp.responseText);
            }
        }
        callback(err, resp);
    }
};

},{"./util":25,"corslite":2,"json3":3}],21:[function(require,module,exports){
'use strict';

var url = require('./url');

var ShareControl = L.Control.extend({
    includes: [require('./load_tilejson')],

    options: {
        position: 'topleft',
        url: ''
    },

    initialize: function(_, options) {
        L.setOptions(this, options);
        this._loadTileJSON(_);
    },

    _setTileJSON: function(json) {
        this._tilejson = json;
    },

    onAdd: function(map) {
        this._map = map;
        this._url = url;

        var container = L.DomUtil.create('div', 'leaflet-control-mapbox-share leaflet-bar');
        var link = L.DomUtil.create('a', 'mapbox-share mapbox-icon mapbox-icon-share', container);
        link.href = '#';

        this._modal = L.DomUtil.create('div', 'mapbox-modal', this._map._container);
        this._mask = L.DomUtil.create('div', 'mapbox-modal-mask', this._modal);
        this._content = L.DomUtil.create('div', 'mapbox-modal-content', this._modal);

        L.DomEvent.addListener(link, 'click', this._shareClick, this);
        L.DomEvent.disableClickPropagation(container);

        this._map.on('mousedown', this._clickOut, this);

        return container;
    },

    _clickOut: function(e) {
        if (this._sharing) {
            L.DomEvent.preventDefault(e);
            L.DomUtil.removeClass(this._modal, 'active');
            this._content.innerHTML = '';
            this._sharing = null;
            return;
        }
    },

    _shareClick: function(e) {
        L.DomEvent.stop(e);
        if (this._sharing) return this._clickOut(e);

        var tilejson = this._tilejson || this._map._tilejson || {},
            url = encodeURIComponent(this.options.url || tilejson.webpage || window.location),
            name = encodeURIComponent(tilejson.name),
            image = this._url.base() + tilejson.id + '/' + this._map.getCenter().lng + ',' + this._map.getCenter().lat + ',' + this._map.getZoom() + '/600x600.png',
            embed = this._url.base() + tilejson.id + '.html?secure',
            twitter = '//twitter.com/intent/tweet?status=' + name + ' ' + url,
            facebook = '//www.facebook.com/sharer.php?u=' + url + '&t=' + encodeURIComponent(tilejson.name),
            pinterest = '//www.pinterest.com/pin/create/button/?url=' + url + '&media=' + image + '&description=' + tilejson.name,
            share = ("<h3>Share this map</h3>" +
                    "<div class='mapbox-share-buttons'><a class='mapbox-button mapbox-button-icon mapbox-icon-facebook' target='_blank' href='{{facebook}}'>Facebook</a>" +
                    "<a class='mapbox-button mapbox-button-icon mapbox-icon-twitter' target='_blank' href='{{twitter}}'>Twitter</a>" +
                    "<a class='mapbox-button mapbox-button-icon mapbox-icon-pinterest' target='_blank' href='{{pinterest}}'>Pinterest</a></div>")
                    .replace('{{twitter}}', twitter)
                    .replace('{{facebook}}', facebook)
                    .replace('{{pinterest}}', pinterest),
            embedValue = '<iframe width="100%" height="500px" frameBorder="0" src="{{embed}}"></iframe>'.replace('{{embed}}', embed),
            embedLabel = 'Copy and paste this <strong>HTML code</strong> into documents to embed this map on web pages.';

        L.DomUtil.addClass(this._modal, 'active');

        this._sharing = L.DomUtil.create('div', 'mapbox-modal-body', this._content);
        this._sharing.innerHTML = share;

        var input = L.DomUtil.create('input', 'mapbox-embed', this._sharing);
        input.type = 'text';
        input.value = embedValue;

        var label = L.DomUtil.create('label', 'mapbox-embed-description', this._sharing);
        label.innerHTML = embedLabel;

        var close = L.DomUtil.create('a', 'leaflet-popup-close-button', this._sharing);
        close.href = '#';

        L.DomEvent.disableClickPropagation(this._sharing);
        L.DomEvent.addListener(close, 'click', this._clickOut, this);
        L.DomEvent.addListener(input, 'click', function(e) {
            e.target.focus();
            e.target.select();
        });
    }
});

module.exports = function(_, options) {
    return new ShareControl(_, options);
};

},{"./load_tilejson":17,"./url":24}],22:[function(require,module,exports){
'use strict';

// an implementation of the simplestyle spec for polygon and linestring features
// https://github.com/mapbox/simplestyle-spec
var defaults = {
    stroke: '#555555',
    'stroke-width': 2,
    'stroke-opacity': 1,
    fill: '#555555',
    'fill-opacity': 0.5
};

var mapping = [
    ['stroke', 'color'],
    ['stroke-width', 'weight'],
    ['stroke-opacity', 'opacity'],
    ['fill', 'fillColor'],
    ['fill-opacity', 'fillOpacity']
];

function fallback(a, b) {
    var c = {};
    for (var k in b) {
        if (a[k] === undefined) c[k] = b[k];
        else c[k] = a[k];
    }
    return c;
}

function remap(a) {
    var d = {};
    for (var i = 0; i < mapping.length; i++) {
        d[mapping[i][1]] = a[mapping[i][0]];
    }
    return d;
}

function style(feature) {
    return remap(fallback(feature.properties || {}, defaults));
}

module.exports = {
    style: style,
    defaults: defaults
};

},{}],23:[function(require,module,exports){
'use strict';

var util = require('./util'),
    url = require('./url');

var TileLayer = L.TileLayer.extend({
    includes: [require('./load_tilejson')],

    options: {
        format: 'png'
    },

    // http://mapbox.com/developers/api/#image_quality
    formats: [
        'png',
        // PNG
        'png32', 'png64', 'png128', 'png256',
        // JPG
        'jpg70', 'jpg80', 'jpg90'],

    scalePrefix: '@2x.',

    initialize: function(_, options) {
        L.TileLayer.prototype.initialize.call(this, undefined, options);

        this._tilejson = {};

        if (options && options.detectRetina &&
            L.Browser.retina && options.retinaVersion) {
            _ = options.retinaVersion;
        }

        if (options && options.format) {
            util.strict_oneof(options.format, this.formats);
        }

        this._loadTileJSON(_);
    },

    setFormat: function(_) {
        util.strict(_, 'string');
        this.options.format = _;
        this.redraw();
        return this;
    },

    _autoScale: function() {
        return this.options &&
            L.Browser.retina &&
            this.options.detectRetina &&
            (!this.options.retinaVersion) &&
            this.options.autoscale;
    },

    // disable the setUrl function, which is not available on mapbox tilelayers
    setUrl: null,

    _setTileJSON: function(json) {
        util.strict(json, 'object');

        L.extend(this.options, {
            tiles: json.tiles,
            attribution: json.attribution,
            minZoom: json.minzoom || 0,
            maxZoom: json.maxzoom || 18,
            autoscale: json.autoscale || false,
            tms: json.scheme === 'tms',
            bounds: json.bounds && util.lbounds(json.bounds)
        });

        this._tilejson = json;
        this.redraw();
        return this;
    },

    getTileJSON: function() {
        return this._tilejson;
    },

    // this is an exception to mapbox.js naming rules because it's called
    // by `L.map`
    getTileUrl: function(tilePoint) {
        var tiles = this.options.tiles,
            index = Math.floor(Math.abs(tilePoint.x + tilePoint.y) % tiles.length),
            url = tiles[index];

        var templated = L.Util.template(url, tilePoint);
        if (!templated) {
            return templated;
        } else {
            return templated.replace('.png',
                (this._autoScale() ? this.scalePrefix : '.') + this.options.format);
        }
    },

    // TileJSON.TileLayers are added to the map immediately, so that they get
    // the desired z-index, but do not update until the TileJSON has been loaded.
    _update: function() {
        if (this.options.tiles) {
            L.TileLayer.prototype._update.call(this);
        }
    }
});

module.exports = function(_, options) {
    return new TileLayer(_, options);
};

},{"./load_tilejson":17,"./url":24,"./util":25}],24:[function(require,module,exports){
'use strict';

var config = require('./config');

// Return the base url of a specific version of Mapbox's API.
//
// `hash`, if provided must be a number and is used to distribute requests
// against multiple `CNAME`s in order to avoid connection limits in browsers
module.exports = {
    isSSL: function() {
        return 'https:' === document.location.protocol || config.FORCE_HTTPS;
    },
    base: function() {
        // By default, use public HTTP urls
        // Support HTTPS if the user has specified HTTPS urls to use, and this
        // page is under HTTPS
        return (this.isSSL() ? config.HTTPS_URLS : config.HTTP_URLS)[0];
    },
    // Requests that contain URLs need a secure flag appended
    // to their URLs so that the server knows to send SSL-ified
    // resource references.
    secureFlag: function(url) {
        if (!this.isSSL()) return url;
        else if (url.match(/(\?|&)secure/)) return url;
        else if (url.indexOf('?') !== -1) return url + '&secure';
        else return url + '?secure';
    },
    // Convert a JSONP url to a JSON URL. (Mapbox TileJSON sometimes hardcodes JSONP.)
    jsonify: function(url) {
        return url.replace(/\.(geo)?jsonp(?=$|\?)/, '.$1json');
    }
};

},{"./config":8}],25:[function(require,module,exports){
'use strict';

module.exports = {
    idUrl: function(_, t) {
        if (_.indexOf('/') == -1) t.loadID(_);
        else t.loadURL(_);
    },
    log: function(_) {
        if (console && typeof console.error === 'function') {
            console.error(_);
        }
    },
    strict: function(_, type) {
        if (typeof _ !== type) {
            throw new Error('Invalid argument: ' + type + ' expected');
        }
    },
    strict_instance: function(_, klass, name) {
        if (!(_ instanceof klass)) {
            throw new Error('Invalid argument: ' + name + ' expected');
        }
    },
    strict_oneof: function(_, values) {
        if (!contains(_, values)) {
            throw new Error('Invalid argument: ' + _ + ' given, valid values are ' +
                values.join(', '));
        }
    },
    strip_tags: function(_) {
        return _.replace(/<[^<]+>/g, '');
    },
    lbounds: function(_) {
        // leaflet-compatible bounds, since leaflet does not do geojson
        return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
    }
};

function contains(item, list) {
    if (!list || !list.length) return false;
    for (var i = 0; i < list.length; i++) {
        if (list[i] == item) return true;
    }
    return false;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9waGlsL1NpdGVzL21hcGJveC9tYXBib3guanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvbm9kZV9tb2R1bGVzL2NvcnNsaXRlL2NvcnNsaXRlLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L25vZGVfbW9kdWxlcy9qc29uMy9saWIvanNvbjMuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvbm9kZV9tb2R1bGVzL211c3RhY2hlL211c3RhY2hlLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L25vZGVfbW9kdWxlcy9zYW5pdGl6ZS1jYWphL2luZGV4LmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L25vZGVfbW9kdWxlcy9zYW5pdGl6ZS1jYWphL3Nhbml0aXplci1idW5kbGUuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvcGFja2FnZS5qc29uIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9jb25maWcuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvc3JjL2ZlYXR1cmVfbGF5ZXIuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvc3JjL2dlb2NvZGVyLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9nZW9jb2Rlcl9jb250cm9sLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9ncmlkLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9ncmlkX2NvbnRyb2wuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvc3JjL2dyaWRfbGF5ZXIuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvc3JjL2luZm9fY29udHJvbC5qcyIsIi9Vc2Vycy9waGlsL1NpdGVzL21hcGJveC9zcmMvbGVnZW5kX2NvbnRyb2wuanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvc3JjL2xvYWRfdGlsZWpzb24uanMiLCIvVXNlcnMvcGhpbC9TaXRlcy9tYXBib3gvc3JjL21hcC5qcyIsIi9Vc2Vycy9waGlsL1NpdGVzL21hcGJveC9zcmMvbWFya2VyLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9yZXF1ZXN0LmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9zaGFyZV9jb250cm9sLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy9zaW1wbGVzdHlsZS5qcyIsIi9Vc2Vycy9waGlsL1NpdGVzL21hcGJveC9zcmMvdGlsZV9sYXllci5qcyIsIi9Vc2Vycy9waGlsL1NpdGVzL21hcGJveC9zcmMvdXJsLmpzIiwiL1VzZXJzL3BoaWwvU2l0ZXMvbWFwYm94L3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Q0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzk0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEhhcmRjb2RlIGltYWdlIHBhdGgsIGJlY2F1c2UgTGVhZmxldCdzIGF1dG9kZXRlY3Rpb25cbi8vIGZhaWxzLCBiZWNhdXNlIG1hcGJveC5qcyBpcyBub3QgbmFtZWQgbGVhZmxldC5qc1xud2luZG93LkwuSWNvbi5EZWZhdWx0LmltYWdlUGF0aCA9ICcvL2FwaS50aWxlcy5tYXBib3guY29tL21hcGJveC5qcy8nICsgJ3YnICtcbiAgICByZXF1aXJlKCcuL3BhY2thZ2UuanNvbicpLnZlcnNpb24gKyAnL2ltYWdlcyc7XG5cbkwubWFwYm94ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVkVSU0lPTjogcmVxdWlyZSgnLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uLFxuICAgIGdlb2NvZGVyOiByZXF1aXJlKCcuL3NyYy9nZW9jb2RlcicpLFxuICAgIG1hcmtlcjogcmVxdWlyZSgnLi9zcmMvbWFya2VyJyksXG4gICAgc2ltcGxlc3R5bGU6IHJlcXVpcmUoJy4vc3JjL3NpbXBsZXN0eWxlJyksXG4gICAgdGlsZUxheWVyOiByZXF1aXJlKCcuL3NyYy90aWxlX2xheWVyJyksXG4gICAgaW5mb0NvbnRyb2w6IHJlcXVpcmUoJy4vc3JjL2luZm9fY29udHJvbCcpLFxuICAgIHNoYXJlQ29udHJvbDogcmVxdWlyZSgnLi9zcmMvc2hhcmVfY29udHJvbCcpLFxuICAgIGxlZ2VuZENvbnRyb2w6IHJlcXVpcmUoJy4vc3JjL2xlZ2VuZF9jb250cm9sJyksXG4gICAgZ2VvY29kZXJDb250cm9sOiByZXF1aXJlKCcuL3NyYy9nZW9jb2Rlcl9jb250cm9sJyksXG4gICAgZ3JpZENvbnRyb2w6IHJlcXVpcmUoJy4vc3JjL2dyaWRfY29udHJvbCcpLFxuICAgIGdyaWRMYXllcjogcmVxdWlyZSgnLi9zcmMvZ3JpZF9sYXllcicpLFxuICAgIGZlYXR1cmVMYXllcjogcmVxdWlyZSgnLi9zcmMvZmVhdHVyZV9sYXllcicpLFxuICAgIG1hcDogcmVxdWlyZSgnLi9zcmMvbWFwJyksXG4gICAgY29uZmlnOiByZXF1aXJlKCcuL3NyYy9jb25maWcnKSxcbiAgICBzYW5pdGl6ZTogcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpLFxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCdtdXN0YWNoZScpLnRvX2h0bWxcbn07XG5cbkwubWFwYm94Lm1hcmtlckxheWVyID0gTC5tYXBib3guZmVhdHVyZUxheWVyO1xuIiwiZnVuY3Rpb24geGhyKHVybCwgY2FsbGJhY2ssIGNvcnMpIHtcbiAgICB2YXIgc2VudCA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cuWE1MSHR0cFJlcXVlc3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhFcnJvcignQnJvd3NlciBub3Qgc3VwcG9ydGVkJykpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29ycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIG0gPSB1cmwubWF0Y2goL15cXHMqaHR0cHM/OlxcL1xcL1teXFwvXSovKTtcbiAgICAgICAgY29ycyA9IG0gJiYgKG1bMF0gIT09IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmRvbWFpbiArXG4gICAgICAgICAgICAgICAgKGxvY2F0aW9uLnBvcnQgPyAnOicgKyBsb2NhdGlvbi5wb3J0IDogJycpKTtcbiAgICB9XG5cbiAgICB2YXIgeDtcblxuICAgIGZ1bmN0aW9uIGlzU3VjY2Vzc2Z1bChzdGF0dXMpIHtcbiAgICAgICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwIHx8IHN0YXR1cyA9PT0gMzA0O1xuICAgIH1cblxuICAgIGlmIChjb3JzICYmIChcbiAgICAgICAgLy8gSUU3LTkgUXVpcmtzICYgQ29tcGF0aWJpbGl0eVxuICAgICAgICB0eXBlb2Ygd2luZG93LlhEb21haW5SZXF1ZXN0ID09PSAnb2JqZWN0JyB8fFxuICAgICAgICAvLyBJRTkgU3RhbmRhcmRzIG1vZGVcbiAgICAgICAgdHlwZW9mIHdpbmRvdy5YRG9tYWluUmVxdWVzdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICkpIHtcbiAgICAgICAgLy8gSUU4LTEwXG4gICAgICAgIHggPSBuZXcgd2luZG93LlhEb21haW5SZXF1ZXN0KCk7XG5cbiAgICAgICAgLy8gRW5zdXJlIGNhbGxiYWNrIGlzIG5ldmVyIGNhbGxlZCBzeW5jaHJvbm91c2x5LCBpLmUuLCBiZWZvcmVcbiAgICAgICAgLy8geC5zZW5kKCkgcmV0dXJucyAodGhpcyBoYXMgYmVlbiBvYnNlcnZlZCBpbiB0aGUgd2lsZCkuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC5qcy9pc3N1ZXMvNDcyXG4gICAgICAgIHZhciBvcmlnaW5hbCA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlbnQpIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuYXBwbHkodGhhdCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRlZCgpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgLy8gWERvbWFpblJlcXVlc3RcbiAgICAgICAgICAgIHguc3RhdHVzID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgICAgICAgICAgaXNTdWNjZXNzZnVsKHguc3RhdHVzKSkgY2FsbGJhY2suY2FsbCh4LCBudWxsLCB4KTtcbiAgICAgICAgZWxzZSBjYWxsYmFjay5jYWxsKHgsIHgsIG51bGwpO1xuICAgIH1cblxuICAgIC8vIEJvdGggYG9ucmVhZHlzdGF0ZWNoYW5nZWAgYW5kIGBvbmxvYWRgIGNhbiBmaXJlLiBgb25yZWFkeXN0YXRlY2hhbmdlYFxuICAgIC8vIGhhcyBbYmVlbiBzdXBwb3J0ZWQgZm9yIGxvbmdlcl0oaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvOTE4MTUwOC8yMjkwMDEpLlxuICAgIGlmICgnb25sb2FkJyBpbiB4KSB7XG4gICAgICAgIHgub25sb2FkID0gbG9hZGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHgub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gcmVhZHlzdGF0ZSgpIHtcbiAgICAgICAgICAgIGlmICh4LnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBsb2FkZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBYTUxIdHRwUmVxdWVzdCBvYmplY3QgYXMgYW4gZXJyb3IgYW5kIHByZXZlbnRcbiAgICAvLyBpdCBmcm9tIGV2ZXIgYmVpbmcgY2FsbGVkIGFnYWluIGJ5IHJlYXNzaWduaW5nIGl0IHRvIGBub29wYFxuICAgIHgub25lcnJvciA9IGZ1bmN0aW9uIGVycm9yKGV2dCkge1xuICAgICAgICAvLyBYRG9tYWluUmVxdWVzdCBwcm92aWRlcyBubyBldnQgcGFyYW1ldGVyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZXZ0IHx8IHRydWUsIG51bGwpO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyB9O1xuICAgIH07XG5cbiAgICAvLyBJRTkgbXVzdCBoYXZlIG9ucHJvZ3Jlc3MgYmUgc2V0IHRvIGEgdW5pcXVlIGZ1bmN0aW9uLlxuICAgIHgub25wcm9ncmVzcyA9IGZ1bmN0aW9uKCkgeyB9O1xuXG4gICAgeC5vbnRpbWVvdXQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBldnQsIG51bGwpO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyB9O1xuICAgIH07XG5cbiAgICB4Lm9uYWJvcnQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBldnQsIG51bGwpO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyB9O1xuICAgIH07XG5cbiAgICAvLyBHRVQgaXMgdGhlIG9ubHkgc3VwcG9ydGVkIEhUVFAgVmVyYiBieSBYRG9tYWluUmVxdWVzdCBhbmQgaXMgdGhlXG4gICAgLy8gb25seSBvbmUgc3VwcG9ydGVkIGhlcmUuXG4gICAgeC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdC4gU2VuZGluZyBkYXRhIGlzIG5vdCBzdXBwb3J0ZWQuXG4gICAgeC5zZW5kKG51bGwpO1xuICAgIHNlbnQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHg7XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgbW9kdWxlLmV4cG9ydHMgPSB4aHI7XG4iLCJ2YXIgZ2xvYmFsPXR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fTsvKiEgSlNPTiB2My4zLjEgfCBodHRwOi8vYmVzdGllanMuZ2l0aHViLmlvL2pzb24zIHwgQ29weXJpZ2h0IDIwMTItMjAxNCwgS2l0IENhbWJyaWRnZSB8IGh0dHA6Ly9raXQubWl0LWxpY2Vuc2Uub3JnICovXG47KGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IHRoZSBgZGVmaW5lYCBmdW5jdGlvbiBleHBvc2VkIGJ5IGFzeW5jaHJvbm91cyBtb2R1bGUgbG9hZGVycy4gVGhlXG4gIC8vIHN0cmljdCBgZGVmaW5lYCBjaGVjayBpcyBuZWNlc3NhcnkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBgci5qc2AuXG4gIHZhciBpc0xvYWRlciA9IHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kO1xuXG4gIC8vIEEgc2V0IG9mIHR5cGVzIHVzZWQgdG8gZGlzdGluZ3Vpc2ggb2JqZWN0cyBmcm9tIHByaW1pdGl2ZXMuXG4gIHZhciBvYmplY3RUeXBlcyA9IHtcbiAgICBcImZ1bmN0aW9uXCI6IHRydWUsXG4gICAgXCJvYmplY3RcIjogdHJ1ZVxuICB9O1xuXG4gIC8vIERldGVjdCB0aGUgYGV4cG9ydHNgIG9iamVjdCBleHBvc2VkIGJ5IENvbW1vbkpTIGltcGxlbWVudGF0aW9ucy5cbiAgdmFyIGZyZWVFeHBvcnRzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGV4cG9ydHNdICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuICAvLyBVc2UgdGhlIGBnbG9iYWxgIG9iamVjdCBleHBvc2VkIGJ5IE5vZGUgKGluY2x1ZGluZyBCcm93c2VyaWZ5IHZpYVxuICAvLyBgaW5zZXJ0LW1vZHVsZS1nbG9iYWxzYCksIE5hcndoYWwsIGFuZCBSaW5nbyBhcyB0aGUgZGVmYXVsdCBjb250ZXh0LFxuICAvLyBhbmQgdGhlIGB3aW5kb3dgIG9iamVjdCBpbiBicm93c2Vycy4gUmhpbm8gZXhwb3J0cyBhIGBnbG9iYWxgIGZ1bmN0aW9uXG4gIC8vIGluc3RlYWQuXG4gIHZhciByb290ID0gb2JqZWN0VHlwZXNbdHlwZW9mIHdpbmRvd10gJiYgd2luZG93IHx8IHRoaXMsXG4gICAgICBmcmVlR2xvYmFsID0gZnJlZUV4cG9ydHMgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIG1vZHVsZV0gJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgdHlwZW9mIGdsb2JhbCA9PSBcIm9iamVjdFwiICYmIGdsb2JhbDtcblxuICBpZiAoZnJlZUdsb2JhbCAmJiAoZnJlZUdsb2JhbFtcImdsb2JhbFwiXSA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsW1wid2luZG93XCJdID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWxbXCJzZWxmXCJdID09PSBmcmVlR2xvYmFsKSkge1xuICAgIHJvb3QgPSBmcmVlR2xvYmFsO1xuICB9XG5cbiAgLy8gUHVibGljOiBJbml0aWFsaXplcyBKU09OIDMgdXNpbmcgdGhlIGdpdmVuIGBjb250ZXh0YCBvYmplY3QsIGF0dGFjaGluZyB0aGVcbiAgLy8gYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgZnVuY3Rpb25zIHRvIHRoZSBzcGVjaWZpZWQgYGV4cG9ydHNgIG9iamVjdC5cbiAgZnVuY3Rpb24gcnVuSW5Db250ZXh0KGNvbnRleHQsIGV4cG9ydHMpIHtcbiAgICBjb250ZXh0IHx8IChjb250ZXh0ID0gcm9vdFtcIk9iamVjdFwiXSgpKTtcbiAgICBleHBvcnRzIHx8IChleHBvcnRzID0gcm9vdFtcIk9iamVjdFwiXSgpKTtcblxuICAgIC8vIE5hdGl2ZSBjb25zdHJ1Y3RvciBhbGlhc2VzLlxuICAgIHZhciBOdW1iZXIgPSBjb250ZXh0W1wiTnVtYmVyXCJdIHx8IHJvb3RbXCJOdW1iZXJcIl0sXG4gICAgICAgIFN0cmluZyA9IGNvbnRleHRbXCJTdHJpbmdcIl0gfHwgcm9vdFtcIlN0cmluZ1wiXSxcbiAgICAgICAgT2JqZWN0ID0gY29udGV4dFtcIk9iamVjdFwiXSB8fCByb290W1wiT2JqZWN0XCJdLFxuICAgICAgICBEYXRlID0gY29udGV4dFtcIkRhdGVcIl0gfHwgcm9vdFtcIkRhdGVcIl0sXG4gICAgICAgIFN5bnRheEVycm9yID0gY29udGV4dFtcIlN5bnRheEVycm9yXCJdIHx8IHJvb3RbXCJTeW50YXhFcnJvclwiXSxcbiAgICAgICAgVHlwZUVycm9yID0gY29udGV4dFtcIlR5cGVFcnJvclwiXSB8fCByb290W1wiVHlwZUVycm9yXCJdLFxuICAgICAgICBNYXRoID0gY29udGV4dFtcIk1hdGhcIl0gfHwgcm9vdFtcIk1hdGhcIl0sXG4gICAgICAgIG5hdGl2ZUpTT04gPSBjb250ZXh0W1wiSlNPTlwiXSB8fCByb290W1wiSlNPTlwiXTtcblxuICAgIC8vIERlbGVnYXRlIHRvIHRoZSBuYXRpdmUgYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgaW1wbGVtZW50YXRpb25zLlxuICAgIGlmICh0eXBlb2YgbmF0aXZlSlNPTiA9PSBcIm9iamVjdFwiICYmIG5hdGl2ZUpTT04pIHtcbiAgICAgIGV4cG9ydHMuc3RyaW5naWZ5ID0gbmF0aXZlSlNPTi5zdHJpbmdpZnk7XG4gICAgICBleHBvcnRzLnBhcnNlID0gbmF0aXZlSlNPTi5wYXJzZTtcbiAgICB9XG5cbiAgICAvLyBDb252ZW5pZW5jZSBhbGlhc2VzLlxuICAgIHZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAgIGdldENsYXNzID0gb2JqZWN0UHJvdG8udG9TdHJpbmcsXG4gICAgICAgIGlzUHJvcGVydHksIGZvckVhY2gsIHVuZGVmO1xuXG4gICAgLy8gVGVzdCB0aGUgYERhdGUjZ2V0VVRDKmAgbWV0aG9kcy4gQmFzZWQgb24gd29yayBieSBAWWFmZmxlLlxuICAgIHZhciBpc0V4dGVuZGVkID0gbmV3IERhdGUoLTM1MDk4MjczMzQ1NzMyOTIpO1xuICAgIHRyeSB7XG4gICAgICAvLyBUaGUgYGdldFVUQ0Z1bGxZZWFyYCwgYE1vbnRoYCwgYW5kIGBEYXRlYCBtZXRob2RzIHJldHVybiBub25zZW5zaWNhbFxuICAgICAgLy8gcmVzdWx0cyBmb3IgY2VydGFpbiBkYXRlcyBpbiBPcGVyYSA+PSAxMC41My5cbiAgICAgIGlzRXh0ZW5kZWQgPSBpc0V4dGVuZGVkLmdldFVUQ0Z1bGxZZWFyKCkgPT0gLTEwOTI1MiAmJiBpc0V4dGVuZGVkLmdldFVUQ01vbnRoKCkgPT09IDAgJiYgaXNFeHRlbmRlZC5nZXRVVENEYXRlKCkgPT09IDEgJiZcbiAgICAgICAgLy8gU2FmYXJpIDwgMi4wLjIgc3RvcmVzIHRoZSBpbnRlcm5hbCBtaWxsaXNlY29uZCB0aW1lIHZhbHVlIGNvcnJlY3RseSxcbiAgICAgICAgLy8gYnV0IGNsaXBzIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGRhdGUgbWV0aG9kcyB0byB0aGUgcmFuZ2Ugb2ZcbiAgICAgICAgLy8gc2lnbmVkIDMyLWJpdCBpbnRlZ2VycyAoWy0yICoqIDMxLCAyICoqIDMxIC0gMV0pLlxuICAgICAgICBpc0V4dGVuZGVkLmdldFVUQ0hvdXJzKCkgPT0gMTAgJiYgaXNFeHRlbmRlZC5nZXRVVENNaW51dGVzKCkgPT0gMzcgJiYgaXNFeHRlbmRlZC5nZXRVVENTZWNvbmRzKCkgPT0gNiAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbGxpc2Vjb25kcygpID09IDcwODtcbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG5cbiAgICAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBuYXRpdmUgYEpTT04uc3RyaW5naWZ5YCBhbmQgYHBhcnNlYFxuICAgIC8vIGltcGxlbWVudGF0aW9ucyBhcmUgc3BlYy1jb21wbGlhbnQuIEJhc2VkIG9uIHdvcmsgYnkgS2VuIFNueWRlci5cbiAgICBmdW5jdGlvbiBoYXMobmFtZSkge1xuICAgICAgaWYgKGhhc1tuYW1lXSAhPT0gdW5kZWYpIHtcbiAgICAgICAgLy8gUmV0dXJuIGNhY2hlZCBmZWF0dXJlIHRlc3QgcmVzdWx0LlxuICAgICAgICByZXR1cm4gaGFzW25hbWVdO1xuICAgICAgfVxuICAgICAgdmFyIGlzU3VwcG9ydGVkO1xuICAgICAgaWYgKG5hbWUgPT0gXCJidWctc3RyaW5nLWNoYXItaW5kZXhcIikge1xuICAgICAgICAvLyBJRSA8PSA3IGRvZXNuJ3Qgc3VwcG9ydCBhY2Nlc3Npbmcgc3RyaW5nIGNoYXJhY3RlcnMgdXNpbmcgc3F1YXJlXG4gICAgICAgIC8vIGJyYWNrZXQgbm90YXRpb24uIElFIDggb25seSBzdXBwb3J0cyB0aGlzIGZvciBwcmltaXRpdmVzLlxuICAgICAgICBpc1N1cHBvcnRlZCA9IFwiYVwiWzBdICE9IFwiYVwiO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09IFwianNvblwiKSB7XG4gICAgICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIGJvdGggYEpTT04uc3RyaW5naWZ5YCBhbmQgYEpTT04ucGFyc2VgIGFyZVxuICAgICAgICAvLyBzdXBwb3J0ZWQuXG4gICAgICAgIGlzU3VwcG9ydGVkID0gaGFzKFwianNvbi1zdHJpbmdpZnlcIikgJiYgaGFzKFwianNvbi1wYXJzZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZSwgc2VyaWFsaXplZCA9ICd7XCJhXCI6WzEsdHJ1ZSxmYWxzZSxudWxsLFwiXFxcXHUwMDAwXFxcXGJcXFxcblxcXFxmXFxcXHJcXFxcdFwiXX0nO1xuICAgICAgICAvLyBUZXN0IGBKU09OLnN0cmluZ2lmeWAuXG4gICAgICAgIGlmIChuYW1lID09IFwianNvbi1zdHJpbmdpZnlcIikge1xuICAgICAgICAgIHZhciBzdHJpbmdpZnkgPSBleHBvcnRzLnN0cmluZ2lmeSwgc3RyaW5naWZ5U3VwcG9ydGVkID0gdHlwZW9mIHN0cmluZ2lmeSA9PSBcImZ1bmN0aW9uXCIgJiYgaXNFeHRlbmRlZDtcbiAgICAgICAgICBpZiAoc3RyaW5naWZ5U3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAvLyBBIHRlc3QgZnVuY3Rpb24gb2JqZWN0IHdpdGggYSBjdXN0b20gYHRvSlNPTmAgbWV0aG9kLlxuICAgICAgICAgICAgKHZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH0pLnRvSlNPTiA9IHZhbHVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgc3RyaW5naWZ5U3VwcG9ydGVkID1cbiAgICAgICAgICAgICAgICAvLyBGaXJlZm94IDMuMWIxIGFuZCBiMiBzZXJpYWxpemUgc3RyaW5nLCBudW1iZXIsIGFuZCBib29sZWFuXG4gICAgICAgICAgICAgICAgLy8gcHJpbWl0aXZlcyBhcyBvYmplY3QgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KDApID09PSBcIjBcIiAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCBiMiwgYW5kIEpTT04gMiBzZXJpYWxpemUgd3JhcHBlZCBwcmltaXRpdmVzIGFzIG9iamVjdFxuICAgICAgICAgICAgICAgIC8vIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgTnVtYmVyKCkpID09PSBcIjBcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgU3RyaW5nKCkpID09ICdcIlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGAsIGB1bmRlZmluZWRgLCBvclxuICAgICAgICAgICAgICAgIC8vIGRvZXMgbm90IGRlZmluZSBhIGNhbm9uaWNhbCBKU09OIHJlcHJlc2VudGF0aW9uICh0aGlzIGFwcGxpZXMgdG9cbiAgICAgICAgICAgICAgICAvLyBvYmplY3RzIHdpdGggYHRvSlNPTmAgcHJvcGVydGllcyBhcyB3ZWxsLCAqdW5sZXNzKiB0aGV5IGFyZSBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5KS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoZ2V0Q2xhc3MpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAgIC8vIElFIDggc2VyaWFsaXplcyBgdW5kZWZpbmVkYCBhcyBgXCJ1bmRlZmluZWRcImAuIFNhZmFyaSA8PSA1LjEuNyBhbmRcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMyBwYXNzIHRoaXMgdGVzdC5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkodW5kZWYpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuNyBhbmQgRkYgMy4xYjMgdGhyb3cgYEVycm9yYHMgYW5kIGBUeXBlRXJyb3JgcyxcbiAgICAgICAgICAgICAgICAvLyByZXNwZWN0aXZlbHksIGlmIHRoZSB2YWx1ZSBpcyBvbWl0dGVkIGVudGlyZWx5LlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSgpID09PSB1bmRlZiAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBub3QgYSBudW1iZXIsXG4gICAgICAgICAgICAgICAgLy8gc3RyaW5nLCBhcnJheSwgb2JqZWN0LCBCb29sZWFuLCBvciBgbnVsbGAgbGl0ZXJhbC4gVGhpcyBhcHBsaWVzIHRvXG4gICAgICAgICAgICAgICAgLy8gb2JqZWN0cyB3aXRoIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzIGFzIHdlbGwsIHVubGVzcyB0aGV5IGFyZSBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyBpbnNpZGUgb2JqZWN0IG9yIGFycmF5IGxpdGVyYWxzLiBZVUkgMy4wLjBiMSBpZ25vcmVzIGN1c3RvbSBgdG9KU09OYFxuICAgICAgICAgICAgICAgIC8vIG1ldGhvZHMgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHZhbHVlKSA9PT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3ZhbHVlXSkgPT0gXCJbMV1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFByb3RvdHlwZSA8PSAxLjYuMSBzZXJpYWxpemVzIGBbdW5kZWZpbmVkXWAgYXMgYFwiW11cImAgaW5zdGVhZCBvZlxuICAgICAgICAgICAgICAgIC8vIGBcIltudWxsXVwiYC5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3VuZGVmXSkgPT0gXCJbbnVsbF1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFlVSSAzLjAuMGIxIGZhaWxzIHRvIHNlcmlhbGl6ZSBgbnVsbGAgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG51bGwpID09IFwibnVsbFwiICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgaGFsdHMgc2VyaWFsaXphdGlvbiBpZiBhbiBhcnJheSBjb250YWlucyBhIGZ1bmN0aW9uOlxuICAgICAgICAgICAgICAgIC8vIGBbMSwgdHJ1ZSwgZ2V0Q2xhc3MsIDFdYCBzZXJpYWxpemVzIGFzIFwiWzEsdHJ1ZSxdLFwiLiBGRiAzLjFiM1xuICAgICAgICAgICAgICAgIC8vIGVsaWRlcyBub24tSlNPTiB2YWx1ZXMgZnJvbSBvYmplY3RzIGFuZCBhcnJheXMsIHVubGVzcyB0aGV5XG4gICAgICAgICAgICAgICAgLy8gZGVmaW5lIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbdW5kZWYsIGdldENsYXNzLCBudWxsXSkgPT0gXCJbbnVsbCxudWxsLG51bGxdXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBTaW1wbGUgc2VyaWFsaXphdGlvbiB0ZXN0LiBGRiAzLjFiMSB1c2VzIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlc1xuICAgICAgICAgICAgICAgIC8vIHdoZXJlIGNoYXJhY3RlciBlc2NhcGUgY29kZXMgYXJlIGV4cGVjdGVkIChlLmcuLCBgXFxiYCA9PiBgXFx1MDAwOGApLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSh7IFwiYVwiOiBbdmFsdWUsIHRydWUsIGZhbHNlLCBudWxsLCBcIlxceDAwXFxiXFxuXFxmXFxyXFx0XCJdIH0pID09IHNlcmlhbGl6ZWQgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSBhbmQgYjIgaWdub3JlIHRoZSBgZmlsdGVyYCBhbmQgYHdpZHRoYCBhcmd1bWVudHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG51bGwsIHZhbHVlKSA9PT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoWzEsIDJdLCBudWxsLCAxKSA9PSBcIltcXG4gMSxcXG4gMlxcbl1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIEpTT04gMiwgUHJvdG90eXBlIDw9IDEuNywgYW5kIG9sZGVyIFdlYktpdCBidWlsZHMgaW5jb3JyZWN0bHlcbiAgICAgICAgICAgICAgICAvLyBzZXJpYWxpemUgZXh0ZW5kZWQgeWVhcnMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKC04LjY0ZTE1KSkgPT0gJ1wiLTI3MTgyMS0wNC0yMFQwMDowMDowMC4wMDBaXCInICYmXG4gICAgICAgICAgICAgICAgLy8gVGhlIG1pbGxpc2Vjb25kcyBhcmUgb3B0aW9uYWwgaW4gRVMgNSwgYnV0IHJlcXVpcmVkIGluIDUuMS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoOC42NGUxNSkpID09ICdcIisyNzU3NjAtMDktMTNUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggPD0gMTEuMCBpbmNvcnJlY3RseSBzZXJpYWxpemVzIHllYXJzIHByaW9yIHRvIDAgYXMgbmVnYXRpdmVcbiAgICAgICAgICAgICAgICAvLyBmb3VyLWRpZ2l0IHllYXJzIGluc3RlYWQgb2Ygc2l4LWRpZ2l0IHllYXJzLiBDcmVkaXRzOiBAWWFmZmxlLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtNjIxOTg3NTUyZTUpKSA9PSAnXCItMDAwMDAxLTAxLTAxVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPD0gNS4xLjUgYW5kIE9wZXJhID49IDEwLjUzIGluY29ycmVjdGx5IHNlcmlhbGl6ZSBtaWxsaXNlY29uZFxuICAgICAgICAgICAgICAgIC8vIHZhbHVlcyBsZXNzIHRoYW4gMTAwMC4gQ3JlZGl0czogQFlhZmZsZS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTEpKSA9PSAnXCIxOTY5LTEyLTMxVDIzOjU5OjU5Ljk5OVpcIic7XG4gICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgc3RyaW5naWZ5U3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlzU3VwcG9ydGVkID0gc3RyaW5naWZ5U3VwcG9ydGVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRlc3QgYEpTT04ucGFyc2VgLlxuICAgICAgICBpZiAobmFtZSA9PSBcImpzb24tcGFyc2VcIikge1xuICAgICAgICAgIHZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2U7XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCBiMiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhIGJhcmUgbGl0ZXJhbCBpcyBwcm92aWRlZC5cbiAgICAgICAgICAgICAgLy8gQ29uZm9ybWluZyBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIGFsc28gY29lcmNlIHRoZSBpbml0aWFsIGFyZ3VtZW50IHRvXG4gICAgICAgICAgICAgIC8vIGEgc3RyaW5nIHByaW9yIHRvIHBhcnNpbmcuXG4gICAgICAgICAgICAgIGlmIChwYXJzZShcIjBcIikgPT09IDAgJiYgIXBhcnNlKGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIC8vIFNpbXBsZSBwYXJzaW5nIHRlc3QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZShzZXJpYWxpemVkKTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyc2VTdXBwb3J0ZWQgPSB2YWx1ZVtcImFcIl0ubGVuZ3RoID09IDUgJiYgdmFsdWVbXCJhXCJdWzBdID09PSAxO1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS4yIGFuZCBGRiAzLjFiMSBhbGxvdyB1bmVzY2FwZWQgdGFicyBpbiBzdHJpbmdzLlxuICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9ICFwYXJzZSgnXCJcXHRcIicpO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gRkYgNC4wIGFuZCA0LjAuMSBhbGxvdyBsZWFkaW5nIGArYCBzaWducyBhbmQgbGVhZGluZ1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGRlY2ltYWwgcG9pbnRzLiBGRiA0LjAsIDQuMC4xLCBhbmQgSUUgOS0xMCBhbHNvIGFsbG93XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY2VydGFpbiBvY3RhbCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMDFcIikgIT09IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChwYXJzZVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEZGIDQuMCwgNC4wLjEsIGFuZCBSaGlubyAxLjdSMy1SNCBhbGxvdyB0cmFpbGluZyBkZWNpbWFsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gcG9pbnRzLiBUaGVzZSBlbnZpcm9ubWVudHMsIGFsb25nIHdpdGggRkYgMy4xYjEgYW5kIDIsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYWxzbyBhbGxvdyB0cmFpbGluZyBjb21tYXMgaW4gSlNPTiBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBwYXJzZShcIjEuXCIpICE9PSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaXNTdXBwb3J0ZWQgPSBwYXJzZVN1cHBvcnRlZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc1tuYW1lXSA9ICEhaXNTdXBwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFoYXMoXCJqc29uXCIpKSB7XG4gICAgICAvLyBDb21tb24gYFtbQ2xhc3NdXWAgbmFtZSBhbGlhc2VzLlxuICAgICAgdmFyIGZ1bmN0aW9uQ2xhc3MgPSBcIltvYmplY3QgRnVuY3Rpb25dXCIsXG4gICAgICAgICAgZGF0ZUNsYXNzID0gXCJbb2JqZWN0IERhdGVdXCIsXG4gICAgICAgICAgbnVtYmVyQ2xhc3MgPSBcIltvYmplY3QgTnVtYmVyXVwiLFxuICAgICAgICAgIHN0cmluZ0NsYXNzID0gXCJbb2JqZWN0IFN0cmluZ11cIixcbiAgICAgICAgICBhcnJheUNsYXNzID0gXCJbb2JqZWN0IEFycmF5XVwiLFxuICAgICAgICAgIGJvb2xlYW5DbGFzcyA9IFwiW29iamVjdCBCb29sZWFuXVwiO1xuXG4gICAgICAvLyBEZXRlY3QgaW5jb21wbGV0ZSBzdXBwb3J0IGZvciBhY2Nlc3Npbmcgc3RyaW5nIGNoYXJhY3RlcnMgYnkgaW5kZXguXG4gICAgICB2YXIgY2hhckluZGV4QnVnZ3kgPSBoYXMoXCJidWctc3RyaW5nLWNoYXItaW5kZXhcIik7XG5cbiAgICAgIC8vIERlZmluZSBhZGRpdGlvbmFsIHV0aWxpdHkgbWV0aG9kcyBpZiB0aGUgYERhdGVgIG1ldGhvZHMgYXJlIGJ1Z2d5LlxuICAgICAgaWYgKCFpc0V4dGVuZGVkKSB7XG4gICAgICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgICAgIC8vIEEgbWFwcGluZyBiZXR3ZWVuIHRoZSBtb250aHMgb2YgdGhlIHllYXIgYW5kIHRoZSBudW1iZXIgb2YgZGF5cyBiZXR3ZWVuXG4gICAgICAgIC8vIEphbnVhcnkgMXN0IGFuZCB0aGUgZmlyc3Qgb2YgdGhlIHJlc3BlY3RpdmUgbW9udGguXG4gICAgICAgIHZhciBNb250aHMgPSBbMCwgMzEsIDU5LCA5MCwgMTIwLCAxNTEsIDE4MSwgMjEyLCAyNDMsIDI3MywgMzA0LCAzMzRdO1xuICAgICAgICAvLyBJbnRlcm5hbDogQ2FsY3VsYXRlcyB0aGUgbnVtYmVyIG9mIGRheXMgYmV0d2VlbiB0aGUgVW5peCBlcG9jaCBhbmQgdGhlXG4gICAgICAgIC8vIGZpcnN0IGRheSBvZiB0aGUgZ2l2ZW4gbW9udGguXG4gICAgICAgIHZhciBnZXREYXkgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgpIHtcbiAgICAgICAgICByZXR1cm4gTW9udGhzW21vbnRoXSArIDM2NSAqICh5ZWFyIC0gMTk3MCkgKyBmbG9vcigoeWVhciAtIDE5NjkgKyAobW9udGggPSArKG1vbnRoID4gMSkpKSAvIDQpIC0gZmxvb3IoKHllYXIgLSAxOTAxICsgbW9udGgpIC8gMTAwKSArIGZsb29yKCh5ZWFyIC0gMTYwMSArIG1vbnRoKSAvIDQwMCk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEludGVybmFsOiBEZXRlcm1pbmVzIGlmIGEgcHJvcGVydHkgaXMgYSBkaXJlY3QgcHJvcGVydHkgb2YgdGhlIGdpdmVuXG4gICAgICAvLyBvYmplY3QuIERlbGVnYXRlcyB0byB0aGUgbmF0aXZlIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIG1ldGhvZC5cbiAgICAgIGlmICghKGlzUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eSkpIHtcbiAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgIHZhciBtZW1iZXJzID0ge30sIGNvbnN0cnVjdG9yO1xuICAgICAgICAgIGlmICgobWVtYmVycy5fX3Byb3RvX18gPSBudWxsLCBtZW1iZXJzLl9fcHJvdG9fXyA9IHtcbiAgICAgICAgICAgIC8vIFRoZSAqcHJvdG8qIHByb3BlcnR5IGNhbm5vdCBiZSBzZXQgbXVsdGlwbGUgdGltZXMgaW4gcmVjZW50XG4gICAgICAgICAgICAvLyB2ZXJzaW9ucyBvZiBGaXJlZm94IGFuZCBTZWFNb25rZXkuXG4gICAgICAgICAgICBcInRvU3RyaW5nXCI6IDFcbiAgICAgICAgICB9LCBtZW1iZXJzKS50b1N0cmluZyAhPSBnZXRDbGFzcykge1xuICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDIuMC4zIGRvZXNuJ3QgaW1wbGVtZW50IGBPYmplY3QjaGFzT3duUHJvcGVydHlgLCBidXRcbiAgICAgICAgICAgIC8vIHN1cHBvcnRzIHRoZSBtdXRhYmxlICpwcm90byogcHJvcGVydHkuXG4gICAgICAgICAgICBpc1Byb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIC8vIENhcHR1cmUgYW5kIGJyZWFrIHRoZSBvYmplY3RncyBwcm90b3R5cGUgY2hhaW4gKHNlZSBzZWN0aW9uIDguNi4yXG4gICAgICAgICAgICAgIC8vIG9mIHRoZSBFUyA1LjEgc3BlYykuIFRoZSBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb24gcHJldmVudHMgYW5cbiAgICAgICAgICAgICAgLy8gdW5zYWZlIHRyYW5zZm9ybWF0aW9uIGJ5IHRoZSBDbG9zdXJlIENvbXBpbGVyLlxuICAgICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSB0aGlzLl9fcHJvdG9fXywgcmVzdWx0ID0gcHJvcGVydHkgaW4gKHRoaXMuX19wcm90b19fID0gbnVsbCwgdGhpcyk7XG4gICAgICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgICAgICAgdGhpcy5fX3Byb3RvX18gPSBvcmlnaW5hbDtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENhcHR1cmUgYSByZWZlcmVuY2UgdG8gdGhlIHRvcC1sZXZlbCBgT2JqZWN0YCBjb25zdHJ1Y3Rvci5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gbWVtYmVycy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSB0byBzaW11bGF0ZSBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpblxuICAgICAgICAgICAgLy8gb3RoZXIgZW52aXJvbm1lbnRzLlxuICAgICAgICAgICAgaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gKHRoaXMuY29uc3RydWN0b3IgfHwgY29uc3RydWN0b3IpLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgIShwcm9wZXJ0eSBpbiBwYXJlbnQgJiYgdGhpc1twcm9wZXJ0eV0gPT09IHBhcmVudFtwcm9wZXJ0eV0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWVtYmVycyA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIGlzUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEludGVybmFsOiBOb3JtYWxpemVzIHRoZSBgZm9yLi4uaW5gIGl0ZXJhdGlvbiBhbGdvcml0aG0gYWNyb3NzXG4gICAgICAvLyBlbnZpcm9ubWVudHMuIEVhY2ggZW51bWVyYXRlZCBrZXkgaXMgeWllbGRlZCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uXG4gICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNpemUgPSAwLCBQcm9wZXJ0aWVzLCBtZW1iZXJzLCBwcm9wZXJ0eTtcblxuICAgICAgICAvLyBUZXN0cyBmb3IgYnVncyBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCdzIGBmb3IuLi5pbmAgYWxnb3JpdGhtLiBUaGVcbiAgICAgICAgLy8gYHZhbHVlT2ZgIHByb3BlcnR5IGluaGVyaXRzIHRoZSBub24tZW51bWVyYWJsZSBmbGFnIGZyb21cbiAgICAgICAgLy8gYE9iamVjdC5wcm90b3R5cGVgIGluIG9sZGVyIHZlcnNpb25zIG9mIElFLCBOZXRzY2FwZSwgYW5kIE1vemlsbGEuXG4gICAgICAgIChQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMudmFsdWVPZiA9IDA7XG4gICAgICAgIH0pLnByb3RvdHlwZS52YWx1ZU9mID0gMDtcblxuICAgICAgICAvLyBJdGVyYXRlIG92ZXIgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGBQcm9wZXJ0aWVzYCBjbGFzcy5cbiAgICAgICAgbWVtYmVycyA9IG5ldyBQcm9wZXJ0aWVzKCk7XG4gICAgICAgIGZvciAocHJvcGVydHkgaW4gbWVtYmVycykge1xuICAgICAgICAgIC8vIElnbm9yZSBhbGwgcHJvcGVydGllcyBpbmhlcml0ZWQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAuXG4gICAgICAgICAgaWYgKGlzUHJvcGVydHkuY2FsbChtZW1iZXJzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgUHJvcGVydGllcyA9IG1lbWJlcnMgPSBudWxsO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgaXRlcmF0aW9uIGFsZ29yaXRobS5cbiAgICAgICAgaWYgKCFzaXplKSB7XG4gICAgICAgICAgLy8gQSBsaXN0IG9mIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICAgIG1lbWJlcnMgPSBbXCJ2YWx1ZU9mXCIsIFwidG9TdHJpbmdcIiwgXCJ0b0xvY2FsZVN0cmluZ1wiLCBcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsIFwiaXNQcm90b3R5cGVPZlwiLCBcImhhc093blByb3BlcnR5XCIsIFwiY29uc3RydWN0b3JcIl07XG4gICAgICAgICAgLy8gSUUgPD0gOCwgTW96aWxsYSAxLjAsIGFuZCBOZXRzY2FwZSA2LjIgaWdub3JlIHNoYWRvd2VkIG5vbi1lbnVtZXJhYmxlXG4gICAgICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5LCBsZW5ndGg7XG4gICAgICAgICAgICB2YXIgaGFzUHJvcGVydHkgPSAhaXNGdW5jdGlvbiAmJiB0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yICE9IFwiZnVuY3Rpb25cIiAmJiBvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0Lmhhc093blByb3BlcnR5XSAmJiBvYmplY3QuaGFzT3duUHJvcGVydHkgfHwgaXNQcm9wZXJ0eTtcbiAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgIC8vIEdlY2tvIDw9IDEuMCBlbnVtZXJhdGVzIHRoZSBgcHJvdG90eXBlYCBwcm9wZXJ0eSBvZiBmdW5jdGlvbnMgdW5kZXJcbiAgICAgICAgICAgICAgLy8gY2VydGFpbiBjb25kaXRpb25zOyBJRSBkb2VzIG5vdC5cbiAgICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiBoYXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNYW51YWxseSBpbnZva2UgdGhlIGNhbGxiYWNrIGZvciBlYWNoIG5vbi1lbnVtZXJhYmxlIHByb3BlcnR5LlxuICAgICAgICAgICAgZm9yIChsZW5ndGggPSBtZW1iZXJzLmxlbmd0aDsgcHJvcGVydHkgPSBtZW1iZXJzWy0tbGVuZ3RoXTsgaGFzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSAmJiBjYWxsYmFjayhwcm9wZXJ0eSkpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZSA9PSAyKSB7XG4gICAgICAgICAgLy8gU2FmYXJpIDw9IDIuMC40IGVudW1lcmF0ZXMgc2hhZG93ZWQgcHJvcGVydGllcyB0d2ljZS5cbiAgICAgICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHNldCBvZiBpdGVyYXRlZCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fSwgaXNGdW5jdGlvbiA9IGdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLCBwcm9wZXJ0eTtcbiAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgIC8vIFN0b3JlIGVhY2ggcHJvcGVydHkgbmFtZSB0byBwcmV2ZW50IGRvdWJsZSBlbnVtZXJhdGlvbi4gVGhlXG4gICAgICAgICAgICAgIC8vIGBwcm90b3R5cGVgIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyBpcyBub3QgZW51bWVyYXRlZCBkdWUgdG8gY3Jvc3MtXG4gICAgICAgICAgICAgIC8vIGVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbiAgICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiAhaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMsIHByb3BlcnR5KSAmJiAobWVtYmVyc1twcm9wZXJ0eV0gPSAxKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vIGJ1Z3MgZGV0ZWN0ZWQ7IHVzZSB0aGUgc3RhbmRhcmQgYGZvci4uLmluYCBhbGdvcml0aG0uXG4gICAgICAgICAgZm9yRWFjaCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgaXNGdW5jdGlvbiA9IGdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLCBwcm9wZXJ0eSwgaXNDb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgIGlmICghKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpICYmICEoaXNDb25zdHJ1Y3RvciA9IHByb3BlcnR5ID09PSBcImNvbnN0cnVjdG9yXCIpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNYW51YWxseSBpbnZva2UgdGhlIGNhbGxiYWNrIGZvciB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSBkdWUgdG9cbiAgICAgICAgICAgIC8vIGNyb3NzLWVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbiAgICAgICAgICAgIGlmIChpc0NvbnN0cnVjdG9yIHx8IGlzUHJvcGVydHkuY2FsbChvYmplY3QsIChwcm9wZXJ0eSA9IFwiY29uc3RydWN0b3JcIikpKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JFYWNoKG9iamVjdCwgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgICAgLy8gUHVibGljOiBTZXJpYWxpemVzIGEgSmF2YVNjcmlwdCBgdmFsdWVgIGFzIGEgSlNPTiBzdHJpbmcuIFRoZSBvcHRpb25hbFxuICAgICAgLy8gYGZpbHRlcmAgYXJndW1lbnQgbWF5IHNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gdGhhdCBhbHRlcnMgaG93IG9iamVjdCBhbmRcbiAgICAgIC8vIGFycmF5IG1lbWJlcnMgYXJlIHNlcmlhbGl6ZWQsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgYW5kIG51bWJlcnMgdGhhdFxuICAgICAgLy8gaW5kaWNhdGVzIHdoaWNoIHByb3BlcnRpZXMgc2hvdWxkIGJlIHNlcmlhbGl6ZWQuIFRoZSBvcHRpb25hbCBgd2lkdGhgXG4gICAgICAvLyBhcmd1bWVudCBtYXkgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIG51bWJlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbiAgICAgIC8vIGxldmVsIG9mIHRoZSBvdXRwdXQuXG4gICAgICBpZiAoIWhhcyhcImpzb24tc3RyaW5naWZ5XCIpKSB7XG4gICAgICAgIC8vIEludGVybmFsOiBBIG1hcCBvZiBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuXG4gICAgICAgIHZhciBFc2NhcGVzID0ge1xuICAgICAgICAgIDkyOiBcIlxcXFxcXFxcXCIsXG4gICAgICAgICAgMzQ6ICdcXFxcXCInLFxuICAgICAgICAgIDg6IFwiXFxcXGJcIixcbiAgICAgICAgICAxMjogXCJcXFxcZlwiLFxuICAgICAgICAgIDEwOiBcIlxcXFxuXCIsXG4gICAgICAgICAgMTM6IFwiXFxcXHJcIixcbiAgICAgICAgICA5OiBcIlxcXFx0XCJcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogQ29udmVydHMgYHZhbHVlYCBpbnRvIGEgemVyby1wYWRkZWQgc3RyaW5nIHN1Y2ggdGhhdCBpdHNcbiAgICAgICAgLy8gbGVuZ3RoIGlzIGF0IGxlYXN0IGVxdWFsIHRvIGB3aWR0aGAuIFRoZSBgd2lkdGhgIG11c3QgYmUgPD0gNi5cbiAgICAgICAgdmFyIGxlYWRpbmdaZXJvZXMgPSBcIjAwMDAwMFwiO1xuICAgICAgICB2YXIgdG9QYWRkZWRTdHJpbmcgPSBmdW5jdGlvbiAod2lkdGgsIHZhbHVlKSB7XG4gICAgICAgICAgLy8gVGhlIGB8fCAwYCBleHByZXNzaW9uIGlzIG5lY2Vzc2FyeSB0byB3b3JrIGFyb3VuZCBhIGJ1ZyBpblxuICAgICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiB3aGVyZSBgMCA9PSAtMGAsIGJ1dCBgU3RyaW5nKC0wKSAhPT0gXCIwXCJgLlxuICAgICAgICAgIHJldHVybiAobGVhZGluZ1plcm9lcyArICh2YWx1ZSB8fCAwKSkuc2xpY2UoLXdpZHRoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogRG91YmxlLXF1b3RlcyBhIHN0cmluZyBgdmFsdWVgLCByZXBsYWNpbmcgYWxsIEFTQ0lJIGNvbnRyb2xcbiAgICAgICAgLy8gY2hhcmFjdGVycyAoY2hhcmFjdGVycyB3aXRoIGNvZGUgdW5pdCB2YWx1ZXMgYmV0d2VlbiAwIGFuZCAzMSkgd2l0aFxuICAgICAgICAvLyB0aGVpciBlc2NhcGVkIGVxdWl2YWxlbnRzLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuICAgICAgICAvLyBgUXVvdGUodmFsdWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuICAgICAgICB2YXIgdW5pY29kZVByZWZpeCA9IFwiXFxcXHUwMFwiO1xuICAgICAgICB2YXIgcXVvdGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gJ1wiJywgaW5kZXggPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGgsIHVzZUNoYXJJbmRleCA9ICFjaGFySW5kZXhCdWdneSB8fCBsZW5ndGggPiAxMDtcbiAgICAgICAgICB2YXIgc3ltYm9scyA9IHVzZUNoYXJJbmRleCAmJiAoY2hhckluZGV4QnVnZ3kgPyB2YWx1ZS5zcGxpdChcIlwiKSA6IHZhbHVlKTtcbiAgICAgICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjaGFyQ29kZSA9IHZhbHVlLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgICAgICAgICAgLy8gSWYgdGhlIGNoYXJhY3RlciBpcyBhIGNvbnRyb2wgY2hhcmFjdGVyLCBhcHBlbmQgaXRzIFVuaWNvZGUgb3JcbiAgICAgICAgICAgIC8vIHNob3J0aGFuZCBlc2NhcGUgc2VxdWVuY2U7IG90aGVyd2lzZSwgYXBwZW5kIHRoZSBjaGFyYWN0ZXIgYXMtaXMuXG4gICAgICAgICAgICBzd2l0Y2ggKGNoYXJDb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgODogY2FzZSA5OiBjYXNlIDEwOiBjYXNlIDEyOiBjYXNlIDEzOiBjYXNlIDM0OiBjYXNlIDkyOlxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBFc2NhcGVzW2NoYXJDb2RlXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPCAzMikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHVuaWNvZGVQcmVmaXggKyB0b1BhZGRlZFN0cmluZygyLCBjaGFyQ29kZS50b1N0cmluZygxNikpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSB1c2VDaGFySW5kZXggPyBzeW1ib2xzW2luZGV4XSA6IHZhbHVlLmNoYXJBdChpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQgKyAnXCInO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZWN1cnNpdmVseSBzZXJpYWxpemVzIGFuIG9iamVjdC4gSW1wbGVtZW50cyB0aGVcbiAgICAgICAgLy8gYFN0cihrZXksIGhvbGRlcilgLCBgSk8odmFsdWUpYCwgYW5kIGBKQSh2YWx1ZSlgIG9wZXJhdGlvbnMuXG4gICAgICAgIHZhciBzZXJpYWxpemUgPSBmdW5jdGlvbiAocHJvcGVydHksIG9iamVjdCwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIGluZGVudGF0aW9uLCBzdGFjaykge1xuICAgICAgICAgIHZhciB2YWx1ZSwgY2xhc3NOYW1lLCB5ZWFyLCBtb250aCwgZGF0ZSwgdGltZSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc2Vjb25kcywgcmVzdWx0cywgZWxlbWVudCwgaW5kZXgsIGxlbmd0aCwgcHJlZml4LCByZXN1bHQ7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIE5lY2Vzc2FyeSBmb3IgaG9zdCBvYmplY3Qgc3VwcG9ydC5cbiAgICAgICAgICAgIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiICYmIHZhbHVlKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gZGF0ZUNsYXNzICYmICFpc1Byb3BlcnR5LmNhbGwodmFsdWUsIFwidG9KU09OXCIpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA+IC0xIC8gMCAmJiB2YWx1ZSA8IDEgLyAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRGF0ZXMgYXJlIHNlcmlhbGl6ZWQgYWNjb3JkaW5nIHRvIHRoZSBgRGF0ZSN0b0pTT05gIG1ldGhvZFxuICAgICAgICAgICAgICAgIC8vIHNwZWNpZmllZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS45LjUuNDQuIFNlZSBzZWN0aW9uIDE1LjkuMS4xNVxuICAgICAgICAgICAgICAgIC8vIGZvciB0aGUgSVNPIDg2MDEgZGF0ZSB0aW1lIHN0cmluZyBmb3JtYXQuXG4gICAgICAgICAgICAgICAgaWYgKGdldERheSkge1xuICAgICAgICAgICAgICAgICAgLy8gTWFudWFsbHkgY29tcHV0ZSB0aGUgeWVhciwgbW9udGgsIGRhdGUsIGhvdXJzLCBtaW51dGVzLFxuICAgICAgICAgICAgICAgICAgLy8gc2Vjb25kcywgYW5kIG1pbGxpc2Vjb25kcyBpZiB0aGUgYGdldFVUQypgIG1ldGhvZHMgYXJlXG4gICAgICAgICAgICAgICAgICAvLyBidWdneS4gQWRhcHRlZCBmcm9tIEBZYWZmbGUncyBgZGF0ZS1zaGltYCBwcm9qZWN0LlxuICAgICAgICAgICAgICAgICAgZGF0ZSA9IGZsb29yKHZhbHVlIC8gODY0ZTUpO1xuICAgICAgICAgICAgICAgICAgZm9yICh5ZWFyID0gZmxvb3IoZGF0ZSAvIDM2NS4yNDI1KSArIDE5NzAgLSAxOyBnZXREYXkoeWVhciArIDEsIDApIDw9IGRhdGU7IHllYXIrKyk7XG4gICAgICAgICAgICAgICAgICBmb3IgKG1vbnRoID0gZmxvb3IoKGRhdGUgLSBnZXREYXkoeWVhciwgMCkpIC8gMzAuNDIpOyBnZXREYXkoeWVhciwgbW9udGggKyAxKSA8PSBkYXRlOyBtb250aCsrKTtcbiAgICAgICAgICAgICAgICAgIGRhdGUgPSAxICsgZGF0ZSAtIGdldERheSh5ZWFyLCBtb250aCk7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgYHRpbWVgIHZhbHVlIHNwZWNpZmllcyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheSAoc2VlIEVTXG4gICAgICAgICAgICAgICAgICAvLyA1LjEgc2VjdGlvbiAxNS45LjEuMikuIFRoZSBmb3JtdWxhIGAoQSAlIEIgKyBCKSAlIEJgIGlzIHVzZWRcbiAgICAgICAgICAgICAgICAgIC8vIHRvIGNvbXB1dGUgYEEgbW9kdWxvIEJgLCBhcyB0aGUgYCVgIG9wZXJhdG9yIGRvZXMgbm90XG4gICAgICAgICAgICAgICAgICAvLyBjb3JyZXNwb25kIHRvIHRoZSBgbW9kdWxvYCBvcGVyYXRpb24gZm9yIG5lZ2F0aXZlIG51bWJlcnMuXG4gICAgICAgICAgICAgICAgICB0aW1lID0gKHZhbHVlICUgODY0ZTUgKyA4NjRlNSkgJSA4NjRlNTtcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBob3VycywgbWludXRlcywgc2Vjb25kcywgYW5kIG1pbGxpc2Vjb25kcyBhcmUgb2J0YWluZWQgYnlcbiAgICAgICAgICAgICAgICAgIC8vIGRlY29tcG9zaW5nIHRoZSB0aW1lIHdpdGhpbiB0aGUgZGF5LiBTZWUgc2VjdGlvbiAxNS45LjEuMTAuXG4gICAgICAgICAgICAgICAgICBob3VycyA9IGZsb29yKHRpbWUgLyAzNmU1KSAlIDI0O1xuICAgICAgICAgICAgICAgICAgbWludXRlcyA9IGZsb29yKHRpbWUgLyA2ZTQpICUgNjA7XG4gICAgICAgICAgICAgICAgICBzZWNvbmRzID0gZmxvb3IodGltZSAvIDFlMykgJSA2MDtcbiAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IHRpbWUgJSAxZTM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHllYXIgPSB2YWx1ZS5nZXRVVENGdWxsWWVhcigpO1xuICAgICAgICAgICAgICAgICAgbW9udGggPSB2YWx1ZS5nZXRVVENNb250aCgpO1xuICAgICAgICAgICAgICAgICAgZGF0ZSA9IHZhbHVlLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgICAgICAgICAgIGhvdXJzID0gdmFsdWUuZ2V0VVRDSG91cnMoKTtcbiAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSB2YWx1ZS5nZXRVVENNaW51dGVzKCk7XG4gICAgICAgICAgICAgICAgICBzZWNvbmRzID0gdmFsdWUuZ2V0VVRDU2Vjb25kcygpO1xuICAgICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gdmFsdWUuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSBleHRlbmRlZCB5ZWFycyBjb3JyZWN0bHkuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAoeWVhciA8PSAwIHx8IHllYXIgPj0gMWU0ID8gKHllYXIgPCAwID8gXCItXCIgOiBcIitcIikgKyB0b1BhZGRlZFN0cmluZyg2LCB5ZWFyIDwgMCA/IC15ZWFyIDogeWVhcikgOiB0b1BhZGRlZFN0cmluZyg0LCB5ZWFyKSkgK1xuICAgICAgICAgICAgICAgICAgXCItXCIgKyB0b1BhZGRlZFN0cmluZygyLCBtb250aCArIDEpICsgXCItXCIgKyB0b1BhZGRlZFN0cmluZygyLCBkYXRlKSArXG4gICAgICAgICAgICAgICAgICAvLyBNb250aHMsIGRhdGVzLCBob3VycywgbWludXRlcywgYW5kIHNlY29uZHMgc2hvdWxkIGhhdmUgdHdvXG4gICAgICAgICAgICAgICAgICAvLyBkaWdpdHM7IG1pbGxpc2Vjb25kcyBzaG91bGQgaGF2ZSB0aHJlZS5cbiAgICAgICAgICAgICAgICAgIFwiVFwiICsgdG9QYWRkZWRTdHJpbmcoMiwgaG91cnMpICsgXCI6XCIgKyB0b1BhZGRlZFN0cmluZygyLCBtaW51dGVzKSArIFwiOlwiICsgdG9QYWRkZWRTdHJpbmcoMiwgc2Vjb25kcykgK1xuICAgICAgICAgICAgICAgICAgLy8gTWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LjAsIGJ1dCByZXF1aXJlZCBpbiA1LjEuXG4gICAgICAgICAgICAgICAgICBcIi5cIiArIHRvUGFkZGVkU3RyaW5nKDMsIG1pbGxpc2Vjb25kcykgKyBcIlpcIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlLnRvSlNPTiA9PSBcImZ1bmN0aW9uXCIgJiYgKChjbGFzc05hbWUgIT0gbnVtYmVyQ2xhc3MgJiYgY2xhc3NOYW1lICE9IHN0cmluZ0NsYXNzICYmIGNsYXNzTmFtZSAhPSBhcnJheUNsYXNzKSB8fCBpc1Byb3BlcnR5LmNhbGwodmFsdWUsIFwidG9KU09OXCIpKSkge1xuICAgICAgICAgICAgICAvLyBQcm90b3R5cGUgPD0gMS42LjEgYWRkcyBub24tc3RhbmRhcmQgYHRvSlNPTmAgbWV0aG9kcyB0byB0aGVcbiAgICAgICAgICAgICAgLy8gYE51bWJlcmAsIGBTdHJpbmdgLCBgRGF0ZWAsIGFuZCBgQXJyYXlgIHByb3RvdHlwZXMuIEpTT04gM1xuICAgICAgICAgICAgICAvLyBpZ25vcmVzIGFsbCBgdG9KU09OYCBtZXRob2RzIG9uIHRoZXNlIG9iamVjdHMgdW5sZXNzIHRoZXkgYXJlXG4gICAgICAgICAgICAgIC8vIGRlZmluZWQgZGlyZWN0bHkgb24gYW4gaW5zdGFuY2UuXG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHJlcGxhY2VtZW50IGZ1bmN0aW9uIHdhcyBwcm92aWRlZCwgY2FsbCBpdCB0byBvYnRhaW4gdGhlIHZhbHVlXG4gICAgICAgICAgICAvLyBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKTtcbiAgICAgICAgICBpZiAoY2xhc3NOYW1lID09IGJvb2xlYW5DbGFzcykge1xuICAgICAgICAgICAgLy8gQm9vbGVhbnMgYXJlIHJlcHJlc2VudGVkIGxpdGVyYWxseS5cbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gbnVtYmVyQ2xhc3MpIHtcbiAgICAgICAgICAgIC8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gYEluZmluaXR5YCBhbmQgYE5hTmAgYXJlIHNlcmlhbGl6ZWQgYXNcbiAgICAgICAgICAgIC8vIGBcIm51bGxcImAuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCA/IFwiXCIgKyB2YWx1ZSA6IFwibnVsbFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzKSB7XG4gICAgICAgICAgICAvLyBTdHJpbmdzIGFyZSBkb3VibGUtcXVvdGVkIGFuZCBlc2NhcGVkLlxuICAgICAgICAgICAgcmV0dXJuIHF1b3RlKFwiXCIgKyB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoaXMgaXMgYSBsaW5lYXIgc2VhcmNoOyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgLy8gaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mIHVuaXF1ZSBuZXN0ZWQgb2JqZWN0cy5cbiAgICAgICAgICAgIGZvciAobGVuZ3RoID0gc3RhY2subGVuZ3RoOyBsZW5ndGgtLTspIHtcbiAgICAgICAgICAgICAgaWYgKHN0YWNrW2xlbmd0aF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ3ljbGljIHN0cnVjdHVyZXMgY2Fubm90IGJlIHNlcmlhbGl6ZWQgYnkgYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIHRoZSBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgICAgICAgICAgc3RhY2sucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IGluZGVudGF0aW9uIGxldmVsIGFuZCBpbmRlbnQgb25lIGFkZGl0aW9uYWwgbGV2ZWwuXG4gICAgICAgICAgICBwcmVmaXggPSBpbmRlbnRhdGlvbjtcbiAgICAgICAgICAgIGluZGVudGF0aW9uICs9IHdoaXRlc3BhY2U7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIGFycmF5IGVsZW1lbnRzLlxuICAgICAgICAgICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBzZXJpYWxpemUoaW5kZXgsIHZhbHVlLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZWxlbWVudCA9PT0gdW5kZWYgPyBcIm51bGxcIiA6IGVsZW1lbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMubGVuZ3RoID8gKHdoaXRlc3BhY2UgPyBcIltcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwiXVwiIDogKFwiW1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwiXVwiKSkgOiBcIltdXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgb2JqZWN0IG1lbWJlcnMuIE1lbWJlcnMgYXJlIHNlbGVjdGVkIGZyb21cbiAgICAgICAgICAgICAgLy8gZWl0aGVyIGEgdXNlci1zcGVjaWZpZWQgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcywgb3IgdGhlIG9iamVjdFxuICAgICAgICAgICAgICAvLyBpdHNlbGYuXG4gICAgICAgICAgICAgIGZvckVhY2gocHJvcGVydGllcyB8fCB2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBzZXJpYWxpemUocHJvcGVydHksIHZhbHVlLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudCAhPT0gdW5kZWYpIHtcbiAgICAgICAgICAgICAgICAgIC8vIEFjY29yZGluZyB0byBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zOiBcIklmIGBnYXBgIHt3aGl0ZXNwYWNlfVxuICAgICAgICAgICAgICAgICAgLy8gaXMgbm90IHRoZSBlbXB0eSBzdHJpbmcsIGxldCBgbWVtYmVyYCB7cXVvdGUocHJvcGVydHkpICsgXCI6XCJ9XG4gICAgICAgICAgICAgICAgICAvLyBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiBgbWVtYmVyYCBhbmQgdGhlIGBzcGFjZWAgY2hhcmFjdGVyLlwiXG4gICAgICAgICAgICAgICAgICAvLyBUaGUgXCJgc3BhY2VgIGNoYXJhY3RlclwiIHJlZmVycyB0byB0aGUgbGl0ZXJhbCBzcGFjZVxuICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBub3QgdGhlIGBzcGFjZWAge3dpZHRofSBhcmd1bWVudCBwcm92aWRlZCB0b1xuICAgICAgICAgICAgICAgICAgLy8gYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIiArICh3aGl0ZXNwYWNlID8gXCIgXCIgOiBcIlwiKSArIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMubGVuZ3RoID8gKHdoaXRlc3BhY2UgPyBcIntcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwifVwiIDogKFwie1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwifVwiKSkgOiBcInt9XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSB0cmF2ZXJzZWQgb2JqZWN0IHN0YWNrLlxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQdWJsaWM6IGBKU09OLnN0cmluZ2lmeWAuIFNlZSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuICAgICAgICBleHBvcnRzLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChzb3VyY2UsIGZpbHRlciwgd2lkdGgpIHtcbiAgICAgICAgICB2YXIgd2hpdGVzcGFjZSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIGNsYXNzTmFtZTtcbiAgICAgICAgICBpZiAob2JqZWN0VHlwZXNbdHlwZW9mIGZpbHRlcl0gJiYgZmlsdGVyKSB7XG4gICAgICAgICAgICBpZiAoKGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwoZmlsdGVyKSkgPT0gZnVuY3Rpb25DbGFzcykge1xuICAgICAgICAgICAgICBjYWxsYmFjayA9IGZpbHRlcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgcHJvcGVydHkgbmFtZXMgYXJyYXkgaW50byBhIG1ha2VzaGlmdCBzZXQuXG4gICAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwLCBsZW5ndGggPSBmaWx0ZXIubGVuZ3RoLCB2YWx1ZTsgaW5kZXggPCBsZW5ndGg7IHZhbHVlID0gZmlsdGVyW2luZGV4KytdLCAoKGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpKSwgY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzIHx8IGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcykgJiYgKHByb3BlcnRpZXNbdmFsdWVdID0gMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgIGlmICgoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh3aWR0aCkpID09IG51bWJlckNsYXNzKSB7XG4gICAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIGB3aWR0aGAgdG8gYW4gaW50ZWdlciBhbmQgY3JlYXRlIGEgc3RyaW5nIGNvbnRhaW5pbmdcbiAgICAgICAgICAgICAgLy8gYHdpZHRoYCBudW1iZXIgb2Ygc3BhY2UgY2hhcmFjdGVycy5cbiAgICAgICAgICAgICAgaWYgKCh3aWR0aCAtPSB3aWR0aCAlIDEpID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAod2hpdGVzcGFjZSA9IFwiXCIsIHdpZHRoID4gMTAgJiYgKHdpZHRoID0gMTApOyB3aGl0ZXNwYWNlLmxlbmd0aCA8IHdpZHRoOyB3aGl0ZXNwYWNlICs9IFwiIFwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MpIHtcbiAgICAgICAgICAgICAgd2hpdGVzcGFjZSA9IHdpZHRoLmxlbmd0aCA8PSAxMCA/IHdpZHRoIDogd2lkdGguc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPcGVyYSA8PSA3LjU0dTIgZGlzY2FyZHMgdGhlIHZhbHVlcyBhc3NvY2lhdGVkIHdpdGggZW1wdHkgc3RyaW5nIGtleXNcbiAgICAgICAgICAvLyAoYFwiXCJgKSBvbmx5IGlmIHRoZXkgYXJlIHVzZWQgZGlyZWN0bHkgd2l0aGluIGFuIG9iamVjdCBtZW1iZXIgbGlzdFxuICAgICAgICAgIC8vIChlLmcuLCBgIShcIlwiIGluIHsgXCJcIjogMX0pYCkuXG4gICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZShcIlwiLCAodmFsdWUgPSB7fSwgdmFsdWVbXCJcIl0gPSBzb3VyY2UsIHZhbHVlKSwgY2FsbGJhY2ssIHByb3BlcnRpZXMsIHdoaXRlc3BhY2UsIFwiXCIsIFtdKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gUHVibGljOiBQYXJzZXMgYSBKU09OIHNvdXJjZSBzdHJpbmcuXG4gICAgICBpZiAoIWhhcyhcImpzb24tcGFyc2VcIikpIHtcbiAgICAgICAgdmFyIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGVzY2FwZWQgY29udHJvbCBjaGFyYWN0ZXJzIGFuZCB0aGVpciB1bmVzY2FwZWRcbiAgICAgICAgLy8gZXF1aXZhbGVudHMuXG4gICAgICAgIHZhciBVbmVzY2FwZXMgPSB7XG4gICAgICAgICAgOTI6IFwiXFxcXFwiLFxuICAgICAgICAgIDM0OiAnXCInLFxuICAgICAgICAgIDQ3OiBcIi9cIixcbiAgICAgICAgICA5ODogXCJcXGJcIixcbiAgICAgICAgICAxMTY6IFwiXFx0XCIsXG4gICAgICAgICAgMTEwOiBcIlxcblwiLFxuICAgICAgICAgIDEwMjogXCJcXGZcIixcbiAgICAgICAgICAxMTQ6IFwiXFxyXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogU3RvcmVzIHRoZSBwYXJzZXIgc3RhdGUuXG4gICAgICAgIHZhciBJbmRleCwgU291cmNlO1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZXNldHMgdGhlIHBhcnNlciBzdGF0ZSBhbmQgdGhyb3dzIGEgYFN5bnRheEVycm9yYC5cbiAgICAgICAgdmFyIGFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgICB0aHJvdyBTeW50YXhFcnJvcigpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZXR1cm5zIHRoZSBuZXh0IHRva2VuLCBvciBgXCIkXCJgIGlmIHRoZSBwYXJzZXIgaGFzIHJlYWNoZWRcbiAgICAgICAgLy8gdGhlIGVuZCBvZiB0aGUgc291cmNlIHN0cmluZy4gQSB0b2tlbiBtYXkgYmUgYSBzdHJpbmcsIG51bWJlciwgYG51bGxgXG4gICAgICAgIC8vIGxpdGVyYWwsIG9yIEJvb2xlYW4gbGl0ZXJhbC5cbiAgICAgICAgdmFyIGxleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gU291cmNlLCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoLCB2YWx1ZSwgYmVnaW4sIHBvc2l0aW9uLCBpc1NpZ25lZCwgY2hhckNvZGU7XG4gICAgICAgICAgd2hpbGUgKEluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSA5OiBjYXNlIDEwOiBjYXNlIDEzOiBjYXNlIDMyOlxuICAgICAgICAgICAgICAgIC8vIFNraXAgd2hpdGVzcGFjZSB0b2tlbnMsIGluY2x1ZGluZyB0YWJzLCBjYXJyaWFnZSByZXR1cm5zLCBsaW5lXG4gICAgICAgICAgICAgICAgLy8gZmVlZHMsIGFuZCBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgMTIzOiBjYXNlIDEyNTogY2FzZSA5MTogY2FzZSA5MzogY2FzZSA1ODogY2FzZSA0NDpcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBhIHB1bmN0dWF0b3IgdG9rZW4gKGB7YCwgYH1gLCBgW2AsIGBdYCwgYDpgLCBvciBgLGApIGF0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjaGFySW5kZXhCdWdneSA/IHNvdXJjZS5jaGFyQXQoSW5kZXgpIDogc291cmNlW0luZGV4XTtcbiAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgICAgICAvLyBgXCJgIGRlbGltaXRzIGEgSlNPTiBzdHJpbmc7IGFkdmFuY2UgdG8gdGhlIG5leHQgY2hhcmFjdGVyIGFuZFxuICAgICAgICAgICAgICAgIC8vIGJlZ2luIHBhcnNpbmcgdGhlIHN0cmluZy4gU3RyaW5nIHRva2VucyBhcmUgcHJlZml4ZWQgd2l0aCB0aGVcbiAgICAgICAgICAgICAgICAvLyBzZW50aW5lbCBgQGAgY2hhcmFjdGVyIHRvIGRpc3Rpbmd1aXNoIHRoZW0gZnJvbSBwdW5jdHVhdG9ycyBhbmRcbiAgICAgICAgICAgICAgICAvLyBlbmQtb2Ytc3RyaW5nIHRva2Vucy5cbiAgICAgICAgICAgICAgICBmb3IgKHZhbHVlID0gXCJAXCIsIEluZGV4Kys7IEluZGV4IDwgbGVuZ3RoOykge1xuICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPCAzMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBVbmVzY2FwZWQgQVNDSUkgY29udHJvbCBjaGFyYWN0ZXJzICh0aG9zZSB3aXRoIGEgY29kZSB1bml0XG4gICAgICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhhbiB0aGUgc3BhY2UgY2hhcmFjdGVyKSBhcmUgbm90IHBlcm1pdHRlZC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPT0gOTIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSByZXZlcnNlIHNvbGlkdXMgKGBcXGApIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYW4gZXNjYXBlZFxuICAgICAgICAgICAgICAgICAgICAvLyBjb250cm9sIGNoYXJhY3RlciAoaW5jbHVkaW5nIGBcImAsIGBcXGAsIGFuZCBgL2ApIG9yIFVuaWNvZGVcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXJDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSA5MjogY2FzZSAzNDogY2FzZSA0NzogY2FzZSA5ODogY2FzZSAxMTY6IGNhc2UgMTEwOiBjYXNlIDEwMjogY2FzZSAxMTQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBVbmVzY2FwZXNbY2hhckNvZGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYFxcdWAgbWFya3MgdGhlIGJlZ2lubmluZyBvZiBhIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIGFuZCB2YWxpZGF0ZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvdXItZGlnaXQgY29kZSBwb2ludC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAocG9zaXRpb24gPSBJbmRleCArIDQ7IEluZGV4IDwgcG9zaXRpb247IEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEEgdmFsaWQgc2VxdWVuY2UgY29tcHJpc2VzIGZvdXIgaGV4ZGlnaXRzIChjYXNlLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnNlbnNpdGl2ZSkgdGhhdCBmb3JtIGEgc2luZ2xlIGhleGFkZWNpbWFsIHZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NyB8fCBjaGFyQ29kZSA+PSA5NyAmJiBjaGFyQ29kZSA8PSAxMDIgfHwgY2hhckNvZGUgPj0gNjUgJiYgY2hhckNvZGUgPD0gNzApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gZnJvbUNoYXJDb2RlKFwiMHhcIiArIHNvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSAzNCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuZXNjYXBlZCBkb3VibGUtcXVvdGUgY2hhcmFjdGVyIG1hcmtzIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgLy8gc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBiZWdpbiA9IEluZGV4O1xuICAgICAgICAgICAgICAgICAgICAvLyBPcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiBjYXNlIHdoZXJlIGEgc3RyaW5nIGlzIHZhbGlkLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY2hhckNvZGUgPj0gMzIgJiYgY2hhckNvZGUgIT0gOTIgJiYgY2hhckNvZGUgIT0gMzQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB0aGUgc3RyaW5nIGFzLWlzLlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSA9PSAzNCkge1xuICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kIHJldHVybiB0aGUgcmV2aXZlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVbnRlcm1pbmF0ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgbnVtYmVycyBhbmQgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgYmVnaW4gPSBJbmRleDtcbiAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBhc3QgdGhlIG5lZ2F0aXZlIHNpZ24sIGlmIG9uZSBpcyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQ1KSB7XG4gICAgICAgICAgICAgICAgICBpc1NpZ25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBhbiBpbnRlZ2VyIG9yIGZsb2F0aW5nLXBvaW50IHZhbHVlLlxuICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nykge1xuICAgICAgICAgICAgICAgICAgLy8gTGVhZGluZyB6ZXJvZXMgYXJlIGludGVycHJldGVkIGFzIG9jdGFsIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQ4ICYmICgoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCArIDEpKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgb2N0YWwgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgaW50ZWdlciBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICBmb3IgKDsgSW5kZXggPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgSW5kZXgrKyk7XG4gICAgICAgICAgICAgICAgICAvLyBGbG9hdHMgY2Fubm90IGNvbnRhaW4gYSBsZWFkaW5nIGRlY2ltYWwgcG9pbnQ7IGhvd2V2ZXIsIHRoaXNcbiAgICAgICAgICAgICAgICAgIC8vIGNhc2UgaXMgYWxyZWFkeSBhY2NvdW50ZWQgZm9yIGJ5IHRoZSBwYXJzZXIuXG4gICAgICAgICAgICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDQ2KSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGRlY2ltYWwgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcG9zaXRpb24gPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgcG9zaXRpb24rKyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PSBJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgdHJhaWxpbmcgZGVjaW1hbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIEluZGV4ID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvLyBQYXJzZSBleHBvbmVudHMuIFRoZSBgZWAgZGVub3RpbmcgdGhlIGV4cG9uZW50IGlzXG4gICAgICAgICAgICAgICAgICAvLyBjYXNlLWluc2Vuc2l0aXZlLlxuICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gMTAxIHx8IGNoYXJDb2RlID09IDY5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNraXAgcGFzdCB0aGUgc2lnbiBmb2xsb3dpbmcgdGhlIGV4cG9uZW50LCBpZiBvbmUgaXNcbiAgICAgICAgICAgICAgICAgICAgLy8gc3BlY2lmaWVkLlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDMgfHwgY2hhckNvZGUgPT0gNDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBleHBvbmVudGlhbCBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICAgIGZvciAocG9zaXRpb24gPSBJbmRleDsgcG9zaXRpb24gPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgcG9zaXRpb24rKyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PSBJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgZW1wdHkgZXhwb25lbnQuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBJbmRleCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLy8gQ29lcmNlIHRoZSBwYXJzZWQgdmFsdWUgdG8gYSBKYXZhU2NyaXB0IG51bWJlci5cbiAgICAgICAgICAgICAgICAgIHJldHVybiArc291cmNlLnNsaWNlKGJlZ2luLCBJbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEEgbmVnYXRpdmUgc2lnbiBtYXkgb25seSBwcmVjZWRlIG51bWJlcnMuXG4gICAgICAgICAgICAgICAgaWYgKGlzU2lnbmVkKSB7XG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBgdHJ1ZWAsIGBmYWxzZWAsIGFuZCBgbnVsbGAgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5zbGljZShJbmRleCwgSW5kZXggKyA0KSA9PSBcInRydWVcIikge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDUpID09IFwiZmFsc2VcIikge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZS5zbGljZShJbmRleCwgSW5kZXggKyA0KSA9PSBcIm51bGxcIikge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVbnJlY29nbml6ZWQgdG9rZW4uXG4gICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmV0dXJuIHRoZSBzZW50aW5lbCBgJGAgY2hhcmFjdGVyIGlmIHRoZSBwYXJzZXIgaGFzIHJlYWNoZWQgdGhlIGVuZFxuICAgICAgICAgIC8vIG9mIHRoZSBzb3VyY2Ugc3RyaW5nLlxuICAgICAgICAgIHJldHVybiBcIiRcIjtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogUGFyc2VzIGEgSlNPTiBgdmFsdWVgIHRva2VuLlxuICAgICAgICB2YXIgZ2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdHMsIGhhc01lbWJlcnM7XG4gICAgICAgICAgaWYgKHZhbHVlID09IFwiJFwiKSB7XG4gICAgICAgICAgICAvLyBVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dC5cbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKChjaGFySW5kZXhCdWdneSA/IHZhbHVlLmNoYXJBdCgwKSA6IHZhbHVlWzBdKSA9PSBcIkBcIikge1xuICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHNlbnRpbmVsIGBAYCBjaGFyYWN0ZXIuXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBhcnNlIG9iamVjdCBhbmQgYXJyYXkgbGl0ZXJhbHMuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJbXCIpIHtcbiAgICAgICAgICAgICAgLy8gUGFyc2VzIGEgSlNPTiBhcnJheSwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgYXJyYXkuXG4gICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yICg7OyBoYXNNZW1iZXJzIHx8IChoYXNNZW1iZXJzID0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgIC8vIEEgY2xvc2luZyBzcXVhcmUgYnJhY2tldCBtYXJrcyB0aGUgZW5kIG9mIHRoZSBhcnJheSBsaXRlcmFsLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBhcnJheSBsaXRlcmFsIGNvbnRhaW5zIGVsZW1lbnRzLCB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRpbmcgdGhlIHByZXZpb3VzIGVsZW1lbnQgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBuZXh0LlxuICAgICAgICAgICAgICAgIGlmIChoYXNNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gYXJyYXkgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggYXJyYXkgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRWxpc2lvbnMgYW5kIGxlYWRpbmcgY29tbWFzIGFyZSBub3QgcGVybWl0dGVkLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGdldCh2YWx1ZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PSBcIntcIikge1xuICAgICAgICAgICAgICAvLyBQYXJzZXMgYSBKU09OIG9iamVjdCwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICAgICAgICAgICByZXN1bHRzID0ge307XG4gICAgICAgICAgICAgIGZvciAoOzsgaGFzTWVtYmVycyB8fCAoaGFzTWVtYmVycyA9IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAvLyBBIGNsb3NpbmcgY3VybHkgYnJhY2UgbWFya3MgdGhlIGVuZCBvZiB0aGUgb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5zIG1lbWJlcnMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGEgY29tbWEgc2VwYXJhdG9yLlxuICAgICAgICAgICAgICAgIGlmIChoYXNNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBgLGAgbXVzdCBzZXBhcmF0ZSBlYWNoIG9iamVjdCBtZW1iZXIuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIExlYWRpbmcgY29tbWFzIGFyZSBub3QgcGVybWl0dGVkLCBvYmplY3QgcHJvcGVydHkgbmFtZXMgbXVzdCBiZVxuICAgICAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZWQgc3RyaW5ncywgYW5kIGEgYDpgIG11c3Qgc2VwYXJhdGUgZWFjaCBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgIC8vIG5hbWUgYW5kIHZhbHVlLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIiB8fCB0eXBlb2YgdmFsdWUgIT0gXCJzdHJpbmdcIiB8fCAoY2hhckluZGV4QnVnZ3kgPyB2YWx1ZS5jaGFyQXQoMCkgOiB2YWx1ZVswXSkgIT0gXCJAXCIgfHwgbGV4KCkgIT0gXCI6XCIpIHtcbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNbdmFsdWUuc2xpY2UoMSldID0gZ2V0KGxleCgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVuZXhwZWN0ZWQgdG9rZW4gZW5jb3VudGVyZWQuXG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFVwZGF0ZXMgYSB0cmF2ZXJzZWQgb2JqZWN0IG1lbWJlci5cbiAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciBlbGVtZW50ID0gd2Fsayhzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjayk7XG4gICAgICAgICAgaWYgKGVsZW1lbnQgPT09IHVuZGVmKSB7XG4gICAgICAgICAgICBkZWxldGUgc291cmNlW3Byb3BlcnR5XTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc291cmNlW3Byb3BlcnR5XSA9IGVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZWN1cnNpdmVseSB0cmF2ZXJzZXMgYSBwYXJzZWQgSlNPTiBvYmplY3QsIGludm9raW5nIHRoZVxuICAgICAgICAvLyBgY2FsbGJhY2tgIGZ1bmN0aW9uIGZvciBlYWNoIHZhbHVlLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuICAgICAgICAvLyBgV2Fsayhob2xkZXIsIG5hbWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4yLlxuICAgICAgICB2YXIgd2FsayA9IGZ1bmN0aW9uIChzb3VyY2UsIHByb3BlcnR5LCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHNvdXJjZVtwcm9wZXJ0eV0sIGxlbmd0aDtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGBmb3JFYWNoYCBjYW4ndCBiZSB1c2VkIHRvIHRyYXZlcnNlIGFuIGFycmF5IGluIE9wZXJhIDw9IDguNTRcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaXRzIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIGltcGxlbWVudGF0aW9uIHJldHVybnMgYGZhbHNlYFxuICAgICAgICAgICAgLy8gZm9yIGFycmF5IGluZGljZXMgKGUuZy4sIGAhWzEsIDIsIDNdLmhhc093blByb3BlcnR5KFwiMFwiKWApLlxuICAgICAgICAgICAgaWYgKGdldENsYXNzLmNhbGwodmFsdWUpID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgZm9yIChsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGxlbmd0aC0tOykge1xuICAgICAgICAgICAgICAgIHVwZGF0ZSh2YWx1ZSwgbGVuZ3RoLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGZvckVhY2godmFsdWUsIGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZSh2YWx1ZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHNvdXJjZSwgcHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQdWJsaWM6IGBKU09OLnBhcnNlYC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICAgIGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAoc291cmNlLCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciByZXN1bHQsIHZhbHVlO1xuICAgICAgICAgIEluZGV4ID0gMDtcbiAgICAgICAgICBTb3VyY2UgPSBcIlwiICsgc291cmNlO1xuICAgICAgICAgIHJlc3VsdCA9IGdldChsZXgoKSk7XG4gICAgICAgICAgLy8gSWYgYSBKU09OIHN0cmluZyBjb250YWlucyBtdWx0aXBsZSB0b2tlbnMsIGl0IGlzIGludmFsaWQuXG4gICAgICAgICAgaWYgKGxleCgpICE9IFwiJFwiKSB7XG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZXNldCB0aGUgcGFyc2VyIHN0YXRlLlxuICAgICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sgJiYgZ2V0Q2xhc3MuY2FsbChjYWxsYmFjaykgPT0gZnVuY3Rpb25DbGFzcyA/IHdhbGsoKHZhbHVlID0ge30sIHZhbHVlW1wiXCJdID0gcmVzdWx0LCB2YWx1ZSksIFwiXCIsIGNhbGxiYWNrKSA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnRzW1wicnVuSW5Db250ZXh0XCJdID0gcnVuSW5Db250ZXh0O1xuICAgIHJldHVybiBleHBvcnRzO1xuICB9XG5cbiAgaWYgKGZyZWVFeHBvcnRzICYmICFpc0xvYWRlcikge1xuICAgIC8vIEV4cG9ydCBmb3IgQ29tbW9uSlMgZW52aXJvbm1lbnRzLlxuICAgIHJ1bkluQ29udGV4dChyb290LCBmcmVlRXhwb3J0cyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRXhwb3J0IGZvciB3ZWIgYnJvd3NlcnMgYW5kIEphdmFTY3JpcHQgZW5naW5lcy5cbiAgICB2YXIgbmF0aXZlSlNPTiA9IHJvb3QuSlNPTixcbiAgICAgICAgcHJldmlvdXNKU09OID0gcm9vdFtcIkpTT04zXCJdLFxuICAgICAgICBpc1Jlc3RvcmVkID0gZmFsc2U7XG5cbiAgICB2YXIgSlNPTjMgPSBydW5JbkNvbnRleHQocm9vdCwgKHJvb3RbXCJKU09OM1wiXSA9IHtcbiAgICAgIC8vIFB1YmxpYzogUmVzdG9yZXMgdGhlIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSBnbG9iYWwgYEpTT05gIG9iamVjdCBhbmRcbiAgICAgIC8vIHJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIGBKU09OM2Agb2JqZWN0LlxuICAgICAgXCJub0NvbmZsaWN0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpc1Jlc3RvcmVkKSB7XG4gICAgICAgICAgaXNSZXN0b3JlZCA9IHRydWU7XG4gICAgICAgICAgcm9vdC5KU09OID0gbmF0aXZlSlNPTjtcbiAgICAgICAgICByb290W1wiSlNPTjNcIl0gPSBwcmV2aW91c0pTT047XG4gICAgICAgICAgbmF0aXZlSlNPTiA9IHByZXZpb3VzSlNPTiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04zO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHJvb3QuSlNPTiA9IHtcbiAgICAgIFwicGFyc2VcIjogSlNPTjMucGFyc2UsXG4gICAgICBcInN0cmluZ2lmeVwiOiBKU09OMy5zdHJpbmdpZnlcbiAgICB9O1xuICB9XG5cbiAgLy8gRXhwb3J0IGZvciBhc3luY2hyb25vdXMgbW9kdWxlIGxvYWRlcnMuXG4gIGlmIChpc0xvYWRlcikge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gSlNPTjM7XG4gICAgfSk7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCIvKiFcbiAqIG11c3RhY2hlLmpzIC0gTG9naWMtbGVzcyB7e211c3RhY2hlfX0gdGVtcGxhdGVzIHdpdGggSmF2YVNjcmlwdFxuICogaHR0cDovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qc1xuICovXG5cbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIGV4cG9ydHMpIHtcbiAgICBmYWN0b3J5KGV4cG9ydHMpOyAvLyBDb21tb25KU1xuICB9IGVsc2Uge1xuICAgIHZhciBtdXN0YWNoZSA9IHt9O1xuICAgIGZhY3RvcnkobXVzdGFjaGUpO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgZGVmaW5lKG11c3RhY2hlKTsgLy8gQU1EXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3QuTXVzdGFjaGUgPSBtdXN0YWNoZTsgLy8gPHNjcmlwdD5cbiAgICB9XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKG11c3RhY2hlKSB7XG5cbiAgdmFyIHdoaXRlUmUgPSAvXFxzKi87XG4gIHZhciBzcGFjZVJlID0gL1xccysvO1xuICB2YXIgbm9uU3BhY2VSZSA9IC9cXFMvO1xuICB2YXIgZXFSZSA9IC9cXHMqPS87XG4gIHZhciBjdXJseVJlID0gL1xccypcXH0vO1xuICB2YXIgdGFnUmUgPSAvI3xcXF58XFwvfD58XFx7fCZ8PXwhLztcblxuICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2lzc3Vlcy5hcGFjaGUub3JnL2ppcmEvYnJvd3NlL0NPVUNIREItNTc3XG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg5XG4gIHZhciBSZWdFeHBfdGVzdCA9IFJlZ0V4cC5wcm90b3R5cGUudGVzdDtcbiAgZnVuY3Rpb24gdGVzdFJlZ0V4cChyZSwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIFJlZ0V4cF90ZXN0LmNhbGwocmUsIHN0cmluZyk7XG4gIH1cblxuICBmdW5jdGlvbiBpc1doaXRlc3BhY2Uoc3RyaW5nKSB7XG4gICAgcmV0dXJuICF0ZXN0UmVnRXhwKG5vblNwYWNlUmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgT2JqZWN0X3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0X3RvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICBmdW5jdGlvbiBpc0Z1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpO1xuICB9XG5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICBcIiZcIjogXCImYW1wO1wiLFxuICAgIFwiPFwiOiBcIiZsdDtcIixcbiAgICBcIj5cIjogXCImZ3Q7XCIsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmIzM5OycsXG4gICAgXCIvXCI6ICcmI3gyRjsnXG4gIH07XG5cbiAgZnVuY3Rpb24gZXNjYXBlSHRtbChzdHJpbmcpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZSgvWyY8PlwiJ1xcL10vZywgZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBlbnRpdHlNYXBbc107XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBTY2FubmVyKHN0cmluZykge1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFpbCA9IHN0cmluZztcbiAgICB0aGlzLnBvcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuZW9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRhaWwgPT09IFwiXCI7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIG1hdGNoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIFJldHVybnMgdGhlIG1hdGNoZWQgdGV4dCBpZiBpdCBjYW4gbWF0Y2gsIHRoZSBlbXB0eSBzdHJpbmcgb3RoZXJ3aXNlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uIChyZSkge1xuICAgIHZhciBtYXRjaCA9IHRoaXMudGFpbC5tYXRjaChyZSk7XG5cbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2guaW5kZXggPT09IDApIHtcbiAgICAgIHZhciBzdHJpbmcgPSBtYXRjaFswXTtcbiAgICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCk7XG4gICAgICB0aGlzLnBvcyArPSBzdHJpbmcubGVuZ3RoO1xuICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gXCJcIjtcbiAgfTtcblxuICAvKipcbiAgICogU2tpcHMgYWxsIHRleHQgdW50aWwgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBjYW4gYmUgbWF0Y2hlZC4gUmV0dXJuc1xuICAgKiB0aGUgc2tpcHBlZCBzdHJpbmcsIHdoaWNoIGlzIHRoZSBlbnRpcmUgdGFpbCBpZiBubyBtYXRjaCBjYW4gYmUgbWFkZS5cbiAgICovXG4gIFNjYW5uZXIucHJvdG90eXBlLnNjYW5VbnRpbCA9IGZ1bmN0aW9uIChyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGFpbC5zZWFyY2gocmUpLCBtYXRjaDtcblxuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICBjYXNlIC0xOlxuICAgICAgbWF0Y2ggPSB0aGlzLnRhaWw7XG4gICAgICB0aGlzLnRhaWwgPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAwOlxuICAgICAgbWF0Y2ggPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1hdGNoID0gdGhpcy50YWlsLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh2aWV3LCBwYXJlbnQpIHtcbiAgICB0aGlzLnZpZXcgPSB2aWV3ID09IG51bGwgPyB7fSA6IHZpZXc7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5fY2FjaGUgPSB7ICcuJzogdGhpcy52aWV3IH07XG4gIH1cblxuICBDb250ZXh0Lm1ha2UgPSBmdW5jdGlvbiAodmlldykge1xuICAgIHJldHVybiAodmlldyBpbnN0YW5jZW9mIENvbnRleHQpID8gdmlldyA6IG5ldyBDb250ZXh0KHZpZXcpO1xuICB9O1xuXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAodmlldykge1xuICAgIHJldHVybiBuZXcgQ29udGV4dCh2aWV3LCB0aGlzKTtcbiAgfTtcblxuICBDb250ZXh0LnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciB2YWx1ZTtcbiAgICBpZiAobmFtZSBpbiB0aGlzLl9jYWNoZSkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9jYWNoZVtuYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuXG4gICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICBpZiAobmFtZS5pbmRleE9mKCcuJykgPiAwKSB7XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0LnZpZXc7XG5cbiAgICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KCcuJyksIGkgPSAwO1xuICAgICAgICAgIHdoaWxlICh2YWx1ZSAhPSBudWxsICYmIGkgPCBuYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVbbmFtZXNbaSsrXV07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dC52aWV3W25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIGJyZWFrO1xuXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnBhcmVudDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2FjaGVbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUuY2FsbCh0aGlzLnZpZXcpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBmdW5jdGlvbiBXcml0ZXIoKSB7XG4gICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gIH1cblxuICBXcml0ZXIucHJvdG90eXBlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgICB0aGlzLl9wYXJ0aWFsQ2FjaGUgPSB7fTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICB2YXIgZm4gPSB0aGlzLl9jYWNoZVt0ZW1wbGF0ZV07XG5cbiAgICBpZiAoIWZuKSB7XG4gICAgICB2YXIgdG9rZW5zID0gbXVzdGFjaGUucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICAgICAgZm4gPSB0aGlzLl9jYWNoZVt0ZW1wbGF0ZV0gPSB0aGlzLmNvbXBpbGVUb2tlbnModG9rZW5zLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuY29tcGlsZVBhcnRpYWwgPSBmdW5jdGlvbiAobmFtZSwgdGVtcGxhdGUsIHRhZ3MpIHtcbiAgICB2YXIgZm4gPSB0aGlzLmNvbXBpbGUodGVtcGxhdGUsIHRhZ3MpO1xuICAgIHRoaXMuX3BhcnRpYWxDYWNoZVtuYW1lXSA9IGZuO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLmdldFBhcnRpYWwgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghKG5hbWUgaW4gdGhpcy5fcGFydGlhbENhY2hlKSAmJiB0aGlzLl9sb2FkUGFydGlhbCkge1xuICAgICAgdGhpcy5jb21waWxlUGFydGlhbChuYW1lLCB0aGlzLl9sb2FkUGFydGlhbChuYW1lKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhcnRpYWxDYWNoZVtuYW1lXTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLmNvbXBpbGVUb2tlbnMgPSBmdW5jdGlvbiAodG9rZW5zLCB0ZW1wbGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgICBpZiAocGFydGlhbHMpIHtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ocGFydGlhbHMpKSB7XG4gICAgICAgICAgc2VsZi5fbG9hZFBhcnRpYWwgPSBwYXJ0aWFscztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHBhcnRpYWxzKSB7XG4gICAgICAgICAgICBzZWxmLmNvbXBpbGVQYXJ0aWFsKG5hbWUsIHBhcnRpYWxzW25hbWVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlbmRlclRva2Vucyh0b2tlbnMsIHNlbGYsIENvbnRleHQubWFrZSh2aWV3KSwgdGVtcGxhdGUpO1xuICAgIH07XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZSh0ZW1wbGF0ZSkodmlldywgcGFydGlhbHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb3ctbGV2ZWwgZnVuY3Rpb24gdGhhdCByZW5kZXJzIHRoZSBnaXZlbiBgdG9rZW5zYCB1c2luZyB0aGUgZ2l2ZW4gYHdyaXRlcmBcbiAgICogYW5kIGBjb250ZXh0YC4gVGhlIGB0ZW1wbGF0ZWAgc3RyaW5nIGlzIG9ubHkgbmVlZGVkIGZvciB0ZW1wbGF0ZXMgdGhhdCB1c2VcbiAgICogaGlnaGVyLW9yZGVyIHNlY3Rpb25zIHRvIGV4dHJhY3QgdGhlIHBvcnRpb24gb2YgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHRoYXRcbiAgICogd2FzIGNvbnRhaW5lZCBpbiB0aGF0IHNlY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiByZW5kZXJUb2tlbnModG9rZW5zLCB3cml0ZXIsIGNvbnRleHQsIHRlbXBsYXRlKSB7XG4gICAgdmFyIGJ1ZmZlciA9ICcnO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJlbmRlciBhbiBhcnRiaXRyYXJ5IHRlbXBsYXRlXG4gICAgLy8gaW4gdGhlIGN1cnJlbnQgY29udGV4dCBieSBoaWdoZXItb3JkZXIgZnVuY3Rpb25zLlxuICAgIGZ1bmN0aW9uIHN1YlJlbmRlcih0ZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIHdyaXRlci5yZW5kZXIodGVtcGxhdGUsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiwgdG9rZW5WYWx1ZSwgdmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRva2Vucy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICB0b2tlblZhbHVlID0gdG9rZW5bMV07XG5cbiAgICAgIHN3aXRjaCAodG9rZW5bMF0pIHtcbiAgICAgIGNhc2UgJyMnOlxuICAgICAgICB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuVmFsdWUpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBqbGVuID0gdmFsdWUubGVuZ3RoOyBqIDwgamxlbjsgKytqKSB7XG4gICAgICAgICAgICAgIGJ1ZmZlciArPSByZW5kZXJUb2tlbnModG9rZW5bNF0sIHdyaXRlciwgY29udGV4dC5wdXNoKHZhbHVlW2pdKSwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGJ1ZmZlciArPSByZW5kZXJUb2tlbnModG9rZW5bNF0sIHdyaXRlciwgY29udGV4dC5wdXNoKHZhbHVlKSwgdGVtcGxhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgIHZhciB0ZXh0ID0gdGVtcGxhdGUgPT0gbnVsbCA/IG51bGwgOiB0ZW1wbGF0ZS5zbGljZSh0b2tlblszXSwgdG9rZW5bNV0pO1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUuY2FsbChjb250ZXh0LnZpZXcsIHRleHQsIHN1YlJlbmRlcik7XG4gICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgIGJ1ZmZlciArPSByZW5kZXJUb2tlbnModG9rZW5bNF0sIHdyaXRlciwgY29udGV4dCwgdGVtcGxhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdeJzpcbiAgICAgICAgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblZhbHVlKTtcblxuICAgICAgICAvLyBVc2UgSmF2YVNjcmlwdCdzIGRlZmluaXRpb24gb2YgZmFsc3kuIEluY2x1ZGUgZW1wdHkgYXJyYXlzLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzE4NlxuICAgICAgICBpZiAoIXZhbHVlIHx8IChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgYnVmZmVyICs9IHJlbmRlclRva2Vucyh0b2tlbls0XSwgd3JpdGVyLCBjb250ZXh0LCB0ZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJz4nOlxuICAgICAgICB2YWx1ZSA9IHdyaXRlci5nZXRQYXJ0aWFsKHRva2VuVmFsdWUpO1xuICAgICAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIGJ1ZmZlciArPSB2YWx1ZShjb250ZXh0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcmJzpcbiAgICAgICAgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblZhbHVlKTtcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblZhbHVlKTtcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIGJ1ZmZlciArPSBtdXN0YWNoZS5lc2NhcGUodmFsdWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICBidWZmZXIgKz0gdG9rZW5WYWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtcyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgaW50byBhIG5lc3RlZCB0cmVlIHN0cnVjdHVyZSB3aGVyZVxuICAgKiB0b2tlbnMgdGhhdCByZXByZXNlbnQgYSBzZWN0aW9uIGhhdmUgdHdvIGFkZGl0aW9uYWwgaXRlbXM6IDEpIGFuIGFycmF5IG9mXG4gICAqIGFsbCB0b2tlbnMgdGhhdCBhcHBlYXIgaW4gdGhhdCBzZWN0aW9uIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsXG4gICAqIHRlbXBsYXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgZW5kIG9mIHRoYXQgc2VjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIG5lc3RUb2tlbnModG9rZW5zKSB7XG4gICAgdmFyIHRyZWUgPSBbXTtcbiAgICB2YXIgY29sbGVjdG9yID0gdHJlZTtcbiAgICB2YXIgc2VjdGlvbnMgPSBbXTtcblxuICAgIHZhciB0b2tlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG9rZW5zLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgIHN3aXRjaCAodG9rZW5bMF0pIHtcbiAgICAgIGNhc2UgJyMnOlxuICAgICAgY2FzZSAnXic6XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbGxlY3RvciA9IHRva2VuWzRdID0gW107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIHZhciBzZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG4gICAgICAgIHNlY3Rpb25bNV0gPSB0b2tlblsyXTtcbiAgICAgICAgY29sbGVjdG9yID0gc2VjdGlvbnMubGVuZ3RoID4gMCA/IHNlY3Rpb25zW3NlY3Rpb25zLmxlbmd0aCAtIDFdWzRdIDogdHJlZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyZWU7XG4gIH1cblxuICAvKipcbiAgICogQ29tYmluZXMgdGhlIHZhbHVlcyBvZiBjb25zZWN1dGl2ZSB0ZXh0IHRva2VucyBpbiB0aGUgZ2l2ZW4gYHRva2Vuc2AgYXJyYXlcbiAgICogdG8gYSBzaW5nbGUgdG9rZW4uXG4gICAqL1xuICBmdW5jdGlvbiBzcXVhc2hUb2tlbnModG9rZW5zKSB7XG4gICAgdmFyIHNxdWFzaGVkVG9rZW5zID0gW107XG5cbiAgICB2YXIgdG9rZW4sIGxhc3RUb2tlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG9rZW5zLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW5bMF0gPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4gJiYgbGFzdFRva2VuWzBdID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW5bMV0gKz0gdG9rZW5bMV07XG4gICAgICAgICAgbGFzdFRva2VuWzNdID0gdG9rZW5bM107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFzdFRva2VuID0gdG9rZW47XG4gICAgICAgICAgc3F1YXNoZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3F1YXNoZWRUb2tlbnM7XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGVUYWdzKHRhZ3MpIHtcbiAgICByZXR1cm4gW1xuICAgICAgbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAodGFnc1swXSkgKyBcIlxcXFxzKlwiKSxcbiAgICAgIG5ldyBSZWdFeHAoXCJcXFxccypcIiArIGVzY2FwZVJlZ0V4cCh0YWdzWzFdKSlcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEJyZWFrcyB1cCB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBzdHJpbmcgaW50byBhIHRyZWUgb2YgdG9rZW4gb2JqZWN0cy4gSWZcbiAgICogYHRhZ3NgIGlzIGdpdmVuIGhlcmUgaXQgbXVzdCBiZSBhbiBhcnJheSB3aXRoIHR3byBzdHJpbmcgdmFsdWVzOiB0aGVcbiAgICogb3BlbmluZyBhbmQgY2xvc2luZyB0YWdzIHVzZWQgaW4gdGhlIHRlbXBsYXRlIChlLmcuIFtcIjwlXCIsIFwiJT5cIl0pLiBPZlxuICAgKiBjb3Vyc2UsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBtdXN0YWNoZXMgKGkuZS4gTXVzdGFjaGUudGFncykuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZSB8fCAnJztcbiAgICB0YWdzID0gdGFncyB8fCBtdXN0YWNoZS50YWdzO1xuXG4gICAgaWYgKHR5cGVvZiB0YWdzID09PSAnc3RyaW5nJykgdGFncyA9IHRhZ3Muc3BsaXQoc3BhY2VSZSk7XG4gICAgaWYgKHRhZ3MubGVuZ3RoICE9PSAyKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdGFnczogJyArIHRhZ3Muam9pbignLCAnKSk7XG5cbiAgICB2YXIgdGFnUmVzID0gZXNjYXBlVGFncyh0YWdzKTtcbiAgICB2YXIgc2Nhbm5lciA9IG5ldyBTY2FubmVyKHRlbXBsYXRlKTtcblxuICAgIHZhciBzZWN0aW9ucyA9IFtdOyAgICAgLy8gU3RhY2sgdG8gaG9sZCBzZWN0aW9uIHRva2Vuc1xuICAgIHZhciB0b2tlbnMgPSBbXTsgICAgICAgLy8gQnVmZmVyIHRvIGhvbGQgdGhlIHRva2Vuc1xuICAgIHZhciBzcGFjZXMgPSBbXTsgICAgICAgLy8gSW5kaWNlcyBvZiB3aGl0ZXNwYWNlIHRva2VucyBvbiB0aGUgY3VycmVudCBsaW5lXG4gICAgdmFyIGhhc1RhZyA9IGZhbHNlOyAgICAvLyBJcyB0aGVyZSBhIHt7dGFnfX0gb24gdGhlIGN1cnJlbnQgbGluZT9cbiAgICB2YXIgbm9uU3BhY2UgPSBmYWxzZTsgIC8vIElzIHRoZXJlIGEgbm9uLXNwYWNlIGNoYXIgb24gdGhlIGN1cnJlbnQgbGluZT9cblxuICAgIC8vIFN0cmlwcyBhbGwgd2hpdGVzcGFjZSB0b2tlbnMgYXJyYXkgZm9yIHRoZSBjdXJyZW50IGxpbmVcbiAgICAvLyBpZiB0aGVyZSB3YXMgYSB7eyN0YWd9fSBvbiBpdCBhbmQgb3RoZXJ3aXNlIG9ubHkgc3BhY2UuXG4gICAgZnVuY3Rpb24gc3RyaXBTcGFjZSgpIHtcbiAgICAgIGlmIChoYXNUYWcgJiYgIW5vblNwYWNlKSB7XG4gICAgICAgIHdoaWxlIChzcGFjZXMubGVuZ3RoKSB7XG4gICAgICAgICAgZGVsZXRlIHRva2Vuc1tzcGFjZXMucG9wKCldO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgaGFzVGFnID0gZmFsc2U7XG4gICAgICBub25TcGFjZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBzdGFydCwgdHlwZSwgdmFsdWUsIGNociwgdG9rZW4sIG9wZW5TZWN0aW9uO1xuICAgIHdoaWxlICghc2Nhbm5lci5lb3MoKSkge1xuICAgICAgc3RhcnQgPSBzY2FubmVyLnBvcztcblxuICAgICAgLy8gTWF0Y2ggYW55IHRleHQgYmV0d2VlbiB0YWdzLlxuICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbCh0YWdSZXNbMF0pO1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgIGNociA9IHZhbHVlLmNoYXJBdChpKTtcblxuICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UoY2hyKSkge1xuICAgICAgICAgICAgc3BhY2VzLnB1c2godG9rZW5zLmxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0b2tlbnMucHVzaChbJ3RleHQnLCBjaHIsIHN0YXJ0LCBzdGFydCArIDFdKTtcbiAgICAgICAgICBzdGFydCArPSAxO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHdoaXRlc3BhY2Ugb24gdGhlIGN1cnJlbnQgbGluZS5cbiAgICAgICAgICBpZiAoY2hyID09ICdcXG4nKSBzdHJpcFNwYWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIG9wZW5pbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4odGFnUmVzWzBdKSkgYnJlYWs7XG4gICAgICBoYXNUYWcgPSB0cnVlO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB0eXBlLlxuICAgICAgdHlwZSA9IHNjYW5uZXIuc2Nhbih0YWdSZSkgfHwgJ25hbWUnO1xuICAgICAgc2Nhbm5lci5zY2FuKHdoaXRlUmUpO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB2YWx1ZS5cbiAgICAgIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChlcVJlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGVxUmUpO1xuICAgICAgICBzY2FubmVyLnNjYW5VbnRpbCh0YWdSZXNbMV0pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAneycpIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKCd9JyArIHRhZ3NbMV0pKSk7XG4gICAgICAgIHNjYW5uZXIuc2NhbihjdXJseVJlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuVW50aWwodGFnUmVzWzFdKTtcbiAgICAgICAgdHlwZSA9ICcmJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwodGFnUmVzWzFdKTtcbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIGNsb3NpbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4odGFnUmVzWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCB0YWcgYXQgJyArIHNjYW5uZXIucG9zKTtcblxuICAgICAgdG9rZW4gPSBbdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvc107XG4gICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG5cbiAgICAgIGlmICh0eXBlID09PSAnIycgfHwgdHlwZSA9PT0gJ14nKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnLycpIHtcbiAgICAgICAgLy8gQ2hlY2sgc2VjdGlvbiBuZXN0aW5nLlxuICAgICAgICBvcGVuU2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuICAgICAgICBpZiAoIW9wZW5TZWN0aW9uKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbm9wZW5lZCBzZWN0aW9uIFwiJyArIHZhbHVlICsgJ1wiIGF0ICcgKyBzdGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wZW5TZWN0aW9uWzFdICE9PSB2YWx1ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgc2VjdGlvbiBcIicgKyBvcGVuU2VjdGlvblsxXSArICdcIiBhdCAnICsgc3RhcnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICduYW1lJyB8fCB0eXBlID09PSAneycgfHwgdHlwZSA9PT0gJyYnKSB7XG4gICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJz0nKSB7XG4gICAgICAgIC8vIFNldCB0aGUgdGFncyBmb3IgdGhlIG5leHQgdGltZSBhcm91bmQuXG4gICAgICAgIHRhZ3MgPSB2YWx1ZS5zcGxpdChzcGFjZVJlKTtcbiAgICAgICAgaWYgKHRhZ3MubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRhZ3MgYXQgJyArIHN0YXJ0ICsgJzogJyArIHRhZ3Muam9pbignLCAnKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGFnUmVzID0gZXNjYXBlVGFncyh0YWdzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG9wZW4gc2VjdGlvbnMgd2hlbiB3ZSdyZSBkb25lLlxuICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG4gICAgaWYgKG9wZW5TZWN0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHNjYW5uZXIucG9zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmVzdFRva2VucyhzcXVhc2hUb2tlbnModG9rZW5zKSk7XG4gIH1cblxuICBtdXN0YWNoZS5uYW1lID0gXCJtdXN0YWNoZS5qc1wiO1xuICBtdXN0YWNoZS52ZXJzaW9uID0gXCIwLjcuM1wiO1xuICBtdXN0YWNoZS50YWdzID0gW1wie3tcIiwgXCJ9fVwiXTtcblxuICBtdXN0YWNoZS5TY2FubmVyID0gU2Nhbm5lcjtcbiAgbXVzdGFjaGUuQ29udGV4dCA9IENvbnRleHQ7XG4gIG11c3RhY2hlLldyaXRlciA9IFdyaXRlcjtcblxuICBtdXN0YWNoZS5wYXJzZSA9IHBhcnNlVGVtcGxhdGU7XG5cbiAgLy8gRXhwb3J0IHRoZSBlc2NhcGluZyBmdW5jdGlvbiBzbyB0aGF0IHRoZSB1c2VyIG1heSBvdmVycmlkZSBpdC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8yNDRcbiAgbXVzdGFjaGUuZXNjYXBlID0gZXNjYXBlSHRtbDtcblxuICAvLyBBbGwgTXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGFuZCBwYXJ0aWFscyBpbiB0aGUgZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5jbGVhckNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLmNsZWFyQ2FjaGUoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ29tcGlsZXMgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgdG8gYSByZXVzYWJsZSBmdW5jdGlvbiB1c2luZyB0aGUgZGVmYXVsdFxuICAgKiB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5jb21waWxlID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIuY29tcGlsZSh0ZW1wbGF0ZSwgdGFncyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbXBpbGVzIHRoZSBwYXJ0aWFsIHdpdGggdGhlIGdpdmVuIGBuYW1lYCBhbmQgYHRlbXBsYXRlYCB0byBhIHJldXNhYmxlXG4gICAqIGZ1bmN0aW9uIHVzaW5nIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNvbXBpbGVQYXJ0aWFsID0gZnVuY3Rpb24gKG5hbWUsIHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIuY29tcGlsZVBhcnRpYWwobmFtZSwgdGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb21waWxlcyB0aGUgZ2l2ZW4gYXJyYXkgb2YgdG9rZW5zICh0aGUgb3V0cHV0IG9mIGEgcGFyc2UpIHRvIGEgcmV1c2FibGVcbiAgICogZnVuY3Rpb24gdXNpbmcgdGhlIGRlZmF1bHQgd3JpdGVyLlxuICAgKi9cbiAgbXVzdGFjaGUuY29tcGlsZVRva2VucyA9IGZ1bmN0aW9uICh0b2tlbnMsIHRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIuY29tcGlsZVRva2Vucyh0b2tlbnMsIHRlbXBsYXRlKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgYHRlbXBsYXRlYCB3aXRoIHRoZSBnaXZlbiBgdmlld2AgYW5kIGBwYXJ0aWFsc2AgdXNpbmcgdGhlXG4gICAqIGRlZmF1bHQgd3JpdGVyLlxuICAgKi9cbiAgbXVzdGFjaGUucmVuZGVyID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpO1xuICB9O1xuXG4gIC8vIFRoaXMgaXMgaGVyZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCAwLjQueC5cbiAgbXVzdGFjaGUudG9faHRtbCA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIHNlbmQpIHtcbiAgICB2YXIgcmVzdWx0ID0gbXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihzZW5kKSkge1xuICAgICAgc2VuZChyZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcblxufSkpO1xuIiwidmFyIGh0bWxfc2FuaXRpemUgPSByZXF1aXJlKCcuL3Nhbml0aXplci1idW5kbGUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFfKSByZXR1cm4gJyc7XG4gICAgcmV0dXJuIGh0bWxfc2FuaXRpemUoXywgY2xlYW5VcmwsIGNsZWFuSWQpO1xufTtcblxuLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjU1MTA3XG5mdW5jdGlvbiBjbGVhblVybCh1cmwpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKC9eaHR0cHM/Ly50ZXN0KHVybC5nZXRTY2hlbWUoKSkpIHJldHVybiB1cmwudG9TdHJpbmcoKTtcbiAgICBpZiAoJ2RhdGEnID09IHVybC5nZXRTY2hlbWUoKSAmJiAvXmltYWdlLy50ZXN0KHVybC5nZXRQYXRoKCkpKSB7XG4gICAgICAgIHJldHVybiB1cmwudG9TdHJpbmcoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNsZWFuSWQoaWQpIHsgcmV0dXJuIGlkOyB9XG4iLCJcbi8vIENvcHlyaWdodCAoQykgMjAxMCBHb29nbGUgSW5jLlxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8qKlxuICogQGZpbGVvdmVydmlld1xuICogSW1wbGVtZW50cyBSRkMgMzk4NiBmb3IgcGFyc2luZy9mb3JtYXR0aW5nIFVSSXMuXG4gKlxuICogQGF1dGhvciBtaWtlc2FtdWVsQGdtYWlsLmNvbVxuICogXFxAcHJvdmlkZXMgVVJJXG4gKiBcXEBvdmVycmlkZXMgd2luZG93XG4gKi9cblxudmFyIFVSSSA9IChmdW5jdGlvbiAoKSB7XG5cbi8qKlxuICogY3JlYXRlcyBhIHVyaSBmcm9tIHRoZSBzdHJpbmcgZm9ybS4gIFRoZSBwYXJzZXIgaXMgcmVsYXhlZCwgc28gc3BlY2lhbFxuICogY2hhcmFjdGVycyB0aGF0IGFyZW4ndCBlc2NhcGVkIGJ1dCBkb24ndCBjYXVzZSBhbWJpZ3VpdGllcyB3aWxsIG5vdCBjYXVzZVxuICogcGFyc2UgZmFpbHVyZXMuXG4gKlxuICogQHJldHVybiB7VVJJfG51bGx9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHVyaVN0cikge1xuICB2YXIgbSA9ICgnJyArIHVyaVN0cikubWF0Y2goVVJJX1JFXyk7XG4gIGlmICghbSkgeyByZXR1cm4gbnVsbDsgfVxuICByZXR1cm4gbmV3IFVSSShcbiAgICAgIG51bGxJZkFic2VudChtWzFdKSxcbiAgICAgIG51bGxJZkFic2VudChtWzJdKSxcbiAgICAgIG51bGxJZkFic2VudChtWzNdKSxcbiAgICAgIG51bGxJZkFic2VudChtWzRdKSxcbiAgICAgIG51bGxJZkFic2VudChtWzVdKSxcbiAgICAgIG51bGxJZkFic2VudChtWzZdKSxcbiAgICAgIG51bGxJZkFic2VudChtWzddKSk7XG59XG5cblxuLyoqXG4gKiBjcmVhdGVzIGEgdXJpIGZyb20gdGhlIGdpdmVuIHBhcnRzLlxuICpcbiAqIEBwYXJhbSBzY2hlbWUge3N0cmluZ30gYW4gdW5lbmNvZGVkIHNjaGVtZSBzdWNoIGFzIFwiaHR0cFwiIG9yIG51bGxcbiAqIEBwYXJhbSBjcmVkZW50aWFscyB7c3RyaW5nfSB1bmVuY29kZWQgdXNlciBjcmVkZW50aWFscyBvciBudWxsXG4gKiBAcGFyYW0gZG9tYWluIHtzdHJpbmd9IGFuIHVuZW5jb2RlZCBkb21haW4gbmFtZSBvciBudWxsXG4gKiBAcGFyYW0gcG9ydCB7bnVtYmVyfSBhIHBvcnQgbnVtYmVyIGluIFsxLCAzMjc2OF0uXG4gKiAgICAtMSBpbmRpY2F0ZXMgbm8gcG9ydCwgYXMgZG9lcyBudWxsLlxuICogQHBhcmFtIHBhdGgge3N0cmluZ30gYW4gdW5lbmNvZGVkIHBhdGhcbiAqIEBwYXJhbSBxdWVyeSB7QXJyYXkuPHN0cmluZz58c3RyaW5nfG51bGx9IGEgbGlzdCBvZiB1bmVuY29kZWQgY2dpXG4gKiAgIHBhcmFtZXRlcnMgd2hlcmUgZXZlbiB2YWx1ZXMgYXJlIGtleXMgYW5kIG9kZHMgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzXG4gKiAgIG9yIGFuIHVuZW5jb2RlZCBxdWVyeS5cbiAqIEBwYXJhbSBmcmFnbWVudCB7c3RyaW5nfSBhbiB1bmVuY29kZWQgZnJhZ21lbnQgd2l0aG91dCB0aGUgXCIjXCIgb3IgbnVsbC5cbiAqIEByZXR1cm4ge1VSSX1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKHNjaGVtZSwgY3JlZGVudGlhbHMsIGRvbWFpbiwgcG9ydCwgcGF0aCwgcXVlcnksIGZyYWdtZW50KSB7XG4gIHZhciB1cmkgPSBuZXcgVVJJKFxuICAgICAgZW5jb2RlSWZFeGlzdHMyKHNjaGVtZSwgVVJJX0RJU0FMTE9XRURfSU5fU0NIRU1FX09SX0NSRURFTlRJQUxTXyksXG4gICAgICBlbmNvZGVJZkV4aXN0czIoXG4gICAgICAgICAgY3JlZGVudGlhbHMsIFVSSV9ESVNBTExPV0VEX0lOX1NDSEVNRV9PUl9DUkVERU5USUFMU18pLFxuICAgICAgZW5jb2RlSWZFeGlzdHMoZG9tYWluKSxcbiAgICAgIHBvcnQgPiAwID8gcG9ydC50b1N0cmluZygpIDogbnVsbCxcbiAgICAgIGVuY29kZUlmRXhpc3RzMihwYXRoLCBVUklfRElTQUxMT1dFRF9JTl9QQVRIXyksXG4gICAgICBudWxsLFxuICAgICAgZW5jb2RlSWZFeGlzdHMoZnJhZ21lbnQpKTtcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgcXVlcnkpIHtcbiAgICAgIHVyaS5zZXRSYXdRdWVyeShxdWVyeS5yZXBsYWNlKC9bXj8mPTAtOUEtWmEtel9cXC1+LiVdL2csIGVuY29kZU9uZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cmkuc2V0QWxsUGFyYW1ldGVycyhxdWVyeSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB1cmk7XG59XG5mdW5jdGlvbiBlbmNvZGVJZkV4aXN0cyh1bmVzY2FwZWRQYXJ0KSB7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgdW5lc2NhcGVkUGFydCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodW5lc2NhcGVkUGFydCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuLyoqXG4gKiBpZiB1bmVzY2FwZWRQYXJ0IGlzIG5vbiBudWxsLCB0aGVuIGVzY2FwZXMgYW55IGNoYXJhY3RlcnMgaW4gaXQgdGhhdCBhcmVuJ3RcbiAqIHZhbGlkIGNoYXJhY3RlcnMgaW4gYSB1cmwgYW5kIGFsc28gZXNjYXBlcyBhbnkgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXRcbiAqIGFwcGVhciBpbiBleHRyYS5cbiAqXG4gKiBAcGFyYW0gdW5lc2NhcGVkUGFydCB7c3RyaW5nfVxuICogQHBhcmFtIGV4dHJhIHtSZWdFeHB9IGEgY2hhcmFjdGVyIHNldCBvZiBjaGFyYWN0ZXJzIGluIFtcXDAxLVxcMTc3XS5cbiAqIEByZXR1cm4ge3N0cmluZ3xudWxsfSBudWxsIGlmZiB1bmVzY2FwZWRQYXJ0ID09IG51bGwuXG4gKi9cbmZ1bmN0aW9uIGVuY29kZUlmRXhpc3RzMih1bmVzY2FwZWRQYXJ0LCBleHRyYSkge1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHVuZXNjYXBlZFBhcnQpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHVuZXNjYXBlZFBhcnQpLnJlcGxhY2UoZXh0cmEsIGVuY29kZU9uZSk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuLyoqIGNvbnZlcnRzIGEgY2hhcmFjdGVyIGluIFtcXDAxLVxcMTc3XSB0byBpdHMgdXJsIGVuY29kZWQgZXF1aXZhbGVudC4gKi9cbmZ1bmN0aW9uIGVuY29kZU9uZShjaCkge1xuICB2YXIgbiA9IGNoLmNoYXJDb2RlQXQoMCk7XG4gIHJldHVybiAnJScgKyAnMDEyMzQ1Njc4OUFCQ0RFRicuY2hhckF0KChuID4+IDQpICYgMHhmKSArXG4gICAgICAnMDEyMzQ1Njc4OUFCQ0RFRicuY2hhckF0KG4gJiAweGYpO1xufVxuXG4vKipcbiAqIHtAdXBkb2NcbiAqICAkIG5vcm1QYXRoKCdmb28vLi9iYXInKVxuICogICMgJ2Zvby9iYXInXG4gKiAgJCBub3JtUGF0aCgnLi9mb28nKVxuICogICMgJ2ZvbydcbiAqICAkIG5vcm1QYXRoKCdmb28vLicpXG4gKiAgIyAnZm9vJ1xuICogICQgbm9ybVBhdGgoJ2Zvby8vYmFyJylcbiAqICAjICdmb28vYmFyJ1xuICogfVxuICovXG5mdW5jdGlvbiBub3JtUGF0aChwYXRoKSB7XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoLyhefFxcLylcXC4oPzpcXC98JCkvZywgJyQxJykucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpO1xufVxuXG52YXIgUEFSRU5UX0RJUkVDVE9SWV9IQU5ETEVSID0gbmV3IFJlZ0V4cChcbiAgICAnJ1xuICAgIC8vIEEgcGF0aCBicmVha1xuICAgICsgJygvfF4pJ1xuICAgIC8vIGZvbGxvd2VkIGJ5IGEgbm9uIC4uIHBhdGggZWxlbWVudFxuICAgIC8vIChjYW5ub3QgYmUgLiBiZWNhdXNlIG5vcm1QYXRoIGlzIHVzZWQgcHJpb3IgdG8gdGhpcyBSZWdFeHApXG4gICAgKyAnKD86W14uL11bXi9dKnxcXFxcLnsyLH0oPzpbXi4vXVteL10qKXxcXFxcLnszLH1bXi9dKiknXG4gICAgLy8gZm9sbG93ZWQgYnkgLi4gZm9sbG93ZWQgYnkgYSBwYXRoIGJyZWFrLlxuICAgICsgJy9cXFxcLlxcXFwuKD86L3wkKScpO1xuXG52YXIgUEFSRU5UX0RJUkVDVE9SWV9IQU5ETEVSX1JFID0gbmV3IFJlZ0V4cChQQVJFTlRfRElSRUNUT1JZX0hBTkRMRVIpO1xuXG52YXIgRVhUUkFfUEFSRU5UX1BBVEhTX1JFID0gL14oPzpcXC5cXC5cXC8pKig/OlxcLlxcLiQpPy87XG5cbi8qKlxuICogTm9ybWFsaXplcyBpdHMgaW5wdXQgcGF0aCBhbmQgY29sbGFwc2VzIGFsbCAuIGFuZCAuLiBzZXF1ZW5jZXMgZXhjZXB0IGZvclxuICogLi4gc2VxdWVuY2VzIHRoYXQgd291bGQgdGFrZSBpdCBhYm92ZSB0aGUgcm9vdCBvZiB0aGUgY3VycmVudCBwYXJlbnRcbiAqIGRpcmVjdG9yeS5cbiAqIHtAdXBkb2NcbiAqICAkIGNvbGxhcHNlX2RvdHMoJ2Zvby8uLi9iYXInKVxuICogICMgJ2JhcidcbiAqICAkIGNvbGxhcHNlX2RvdHMoJ2Zvby8uL2JhcicpXG4gKiAgIyAnZm9vL2JhcidcbiAqICAkIGNvbGxhcHNlX2RvdHMoJ2Zvby8uLi9iYXIvLi8uLi8uLi9iYXonKVxuICogICMgJ2JheidcbiAqICAkIGNvbGxhcHNlX2RvdHMoJy4uL2ZvbycpXG4gKiAgIyAnLi4vZm9vJ1xuICogICQgY29sbGFwc2VfZG90cygnLi4vZm9vJykucmVwbGFjZShFWFRSQV9QQVJFTlRfUEFUSFNfUkUsICcnKVxuICogICMgJ2ZvbydcbiAqIH1cbiAqL1xuZnVuY3Rpb24gY29sbGFwc2VfZG90cyhwYXRoKSB7XG4gIGlmIChwYXRoID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gIHZhciBwID0gbm9ybVBhdGgocGF0aCk7XG4gIC8vIE9ubHkgLy4uLyBsZWZ0IHRvIGZsYXR0ZW5cbiAgdmFyIHIgPSBQQVJFTlRfRElSRUNUT1JZX0hBTkRMRVJfUkU7XG4gIC8vIFdlIHJlcGxhY2Ugd2l0aCAkMSB3aGljaCBtYXRjaGVzIGEgLyBiZWZvcmUgdGhlIC4uIGJlY2F1c2UgdGhpc1xuICAvLyBndWFyYW50ZWVzIHRoYXQ6XG4gIC8vICgxKSB3ZSBoYXZlIGF0IG1vc3QgMSAvIGJldHdlZW4gdGhlIGFkamFjZW50IHBsYWNlLFxuICAvLyAoMikgYWx3YXlzIGhhdmUgYSBzbGFzaCBpZiB0aGVyZSBpcyBhIHByZWNlZGluZyBwYXRoIHNlY3Rpb24sIGFuZFxuICAvLyAoMykgd2UgbmV2ZXIgdHVybiBhIHJlbGF0aXZlIHBhdGggaW50byBhbiBhYnNvbHV0ZSBwYXRoLlxuICBmb3IgKHZhciBxOyAocSA9IHAucmVwbGFjZShyLCAnJDEnKSkgIT0gcDsgcCA9IHEpIHt9O1xuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiByZXNvbHZlcyBhIHJlbGF0aXZlIHVybCBzdHJpbmcgdG8gYSBiYXNlIHVyaS5cbiAqIEByZXR1cm4ge1VSSX1cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZShiYXNlVXJpLCByZWxhdGl2ZVVyaSkge1xuICAvLyB0aGVyZSBhcmUgc2V2ZXJhbCBraW5kcyBvZiByZWxhdGl2ZSB1cmxzOlxuICAvLyAxLiAvL2ZvbyAtIHJlcGxhY2VzIGV2ZXJ5dGhpbmcgZnJvbSB0aGUgZG9tYWluIG9uLiAgZm9vIGlzIGEgZG9tYWluIG5hbWVcbiAgLy8gMi4gZm9vIC0gcmVwbGFjZXMgdGhlIGxhc3QgcGFydCBvZiB0aGUgcGF0aCwgdGhlIHdob2xlIHF1ZXJ5IGFuZCBmcmFnbWVudFxuICAvLyAzLiAvZm9vIC0gcmVwbGFjZXMgdGhlIHRoZSBwYXRoLCB0aGUgcXVlcnkgYW5kIGZyYWdtZW50XG4gIC8vIDQuID9mb28gLSByZXBsYWNlIHRoZSBxdWVyeSBhbmQgZnJhZ21lbnRcbiAgLy8gNS4gI2ZvbyAtIHJlcGxhY2UgdGhlIGZyYWdtZW50IG9ubHlcblxuICB2YXIgYWJzb2x1dGVVcmkgPSBiYXNlVXJpLmNsb25lKCk7XG4gIC8vIHdlIHNhdGlzZnkgdGhlc2UgY29uZGl0aW9ucyBieSBsb29raW5nIGZvciB0aGUgZmlyc3QgcGFydCBvZiByZWxhdGl2ZVVyaVxuICAvLyB0aGF0IGlzIG5vdCBibGFuayBhbmQgYXBwbHlpbmcgZGVmYXVsdHMgdG8gdGhlIHJlc3RcblxuICB2YXIgb3ZlcnJpZGRlbiA9IHJlbGF0aXZlVXJpLmhhc1NjaGVtZSgpO1xuXG4gIGlmIChvdmVycmlkZGVuKSB7XG4gICAgYWJzb2x1dGVVcmkuc2V0UmF3U2NoZW1lKHJlbGF0aXZlVXJpLmdldFJhd1NjaGVtZSgpKTtcbiAgfSBlbHNlIHtcbiAgICBvdmVycmlkZGVuID0gcmVsYXRpdmVVcmkuaGFzQ3JlZGVudGlhbHMoKTtcbiAgfVxuXG4gIGlmIChvdmVycmlkZGVuKSB7XG4gICAgYWJzb2x1dGVVcmkuc2V0UmF3Q3JlZGVudGlhbHMocmVsYXRpdmVVcmkuZ2V0UmF3Q3JlZGVudGlhbHMoKSk7XG4gIH0gZWxzZSB7XG4gICAgb3ZlcnJpZGRlbiA9IHJlbGF0aXZlVXJpLmhhc0RvbWFpbigpO1xuICB9XG5cbiAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICBhYnNvbHV0ZVVyaS5zZXRSYXdEb21haW4ocmVsYXRpdmVVcmkuZ2V0UmF3RG9tYWluKCkpO1xuICB9IGVsc2Uge1xuICAgIG92ZXJyaWRkZW4gPSByZWxhdGl2ZVVyaS5oYXNQb3J0KCk7XG4gIH1cblxuICB2YXIgcmF3UGF0aCA9IHJlbGF0aXZlVXJpLmdldFJhd1BhdGgoKTtcbiAgdmFyIHNpbXBsaWZpZWRQYXRoID0gY29sbGFwc2VfZG90cyhyYXdQYXRoKTtcbiAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICBhYnNvbHV0ZVVyaS5zZXRQb3J0KHJlbGF0aXZlVXJpLmdldFBvcnQoKSk7XG4gICAgc2ltcGxpZmllZFBhdGggPSBzaW1wbGlmaWVkUGF0aFxuICAgICAgICAmJiBzaW1wbGlmaWVkUGF0aC5yZXBsYWNlKEVYVFJBX1BBUkVOVF9QQVRIU19SRSwgJycpO1xuICB9IGVsc2Uge1xuICAgIG92ZXJyaWRkZW4gPSAhIXJhd1BhdGg7XG4gICAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICAgIC8vIHJlc29sdmUgcGF0aCBwcm9wZXJseVxuICAgICAgaWYgKHNpbXBsaWZpZWRQYXRoLmNoYXJDb2RlQXQoMCkgIT09IDB4MmYgLyogLyAqLykgeyAgLy8gcGF0aCBpcyByZWxhdGl2ZVxuICAgICAgICB2YXIgYWJzUmF3UGF0aCA9IGNvbGxhcHNlX2RvdHMoYWJzb2x1dGVVcmkuZ2V0UmF3UGF0aCgpIHx8ICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoRVhUUkFfUEFSRU5UX1BBVEhTX1JFLCAnJyk7XG4gICAgICAgIHZhciBzbGFzaCA9IGFic1Jhd1BhdGgubGFzdEluZGV4T2YoJy8nKSArIDE7XG4gICAgICAgIHNpbXBsaWZpZWRQYXRoID0gY29sbGFwc2VfZG90cyhcbiAgICAgICAgICAgIChzbGFzaCA/IGFic1Jhd1BhdGguc3Vic3RyaW5nKDAsIHNsYXNoKSA6ICcnKVxuICAgICAgICAgICAgKyBjb2xsYXBzZV9kb3RzKHJhd1BhdGgpKVxuICAgICAgICAgICAgLnJlcGxhY2UoRVhUUkFfUEFSRU5UX1BBVEhTX1JFLCAnJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpbXBsaWZpZWRQYXRoID0gc2ltcGxpZmllZFBhdGhcbiAgICAgICAgICAmJiBzaW1wbGlmaWVkUGF0aC5yZXBsYWNlKEVYVFJBX1BBUkVOVF9QQVRIU19SRSwgJycpO1xuICAgICAgaWYgKHNpbXBsaWZpZWRQYXRoICE9PSByYXdQYXRoKSB7XG4gICAgICAgIGFic29sdXRlVXJpLnNldFJhd1BhdGgoc2ltcGxpZmllZFBhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChvdmVycmlkZGVuKSB7XG4gICAgYWJzb2x1dGVVcmkuc2V0UmF3UGF0aChzaW1wbGlmaWVkUGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgb3ZlcnJpZGRlbiA9IHJlbGF0aXZlVXJpLmhhc1F1ZXJ5KCk7XG4gIH1cblxuICBpZiAob3ZlcnJpZGRlbikge1xuICAgIGFic29sdXRlVXJpLnNldFJhd1F1ZXJ5KHJlbGF0aXZlVXJpLmdldFJhd1F1ZXJ5KCkpO1xuICB9IGVsc2Uge1xuICAgIG92ZXJyaWRkZW4gPSByZWxhdGl2ZVVyaS5oYXNGcmFnbWVudCgpO1xuICB9XG5cbiAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICBhYnNvbHV0ZVVyaS5zZXRSYXdGcmFnbWVudChyZWxhdGl2ZVVyaS5nZXRSYXdGcmFnbWVudCgpKTtcbiAgfVxuXG4gIHJldHVybiBhYnNvbHV0ZVVyaTtcbn1cblxuLyoqXG4gKiBhIG11dGFibGUgVVJJLlxuICpcbiAqIFRoaXMgY2xhc3MgY29udGFpbnMgc2V0dGVycyBhbmQgZ2V0dGVycyBmb3IgdGhlIHBhcnRzIG9mIHRoZSBVUkkuXG4gKiBUaGUgPHR0PmdldFhZWjwvdHQ+Lzx0dD5zZXRYWVo8L3R0PiBtZXRob2RzIHJldHVybiB0aGUgZGVjb2RlZCBwYXJ0IC0tIHNvXG4gKiA8Y29kZT51cmkucGFyc2UoJy9mb28lMjBiYXInKS5nZXRQYXRoKCk8L2NvZGU+IHdpbGwgcmV0dXJuIHRoZSBkZWNvZGVkIHBhdGgsXG4gKiA8dHQ+L2ZvbyBiYXI8L3R0Pi5cbiAqXG4gKiA8cD5UaGUgcmF3IHZlcnNpb25zIG9mIGZpZWxkcyBhcmUgYXZhaWxhYmxlIHRvby5cbiAqIDxjb2RlPnVyaS5wYXJzZSgnL2ZvbyUyMGJhcicpLmdldFJhd1BhdGgoKTwvY29kZT4gd2lsbCByZXR1cm4gdGhlIHJhdyBwYXRoLFxuICogPHR0Pi9mb28lMjBiYXI8L3R0Pi4gIFVzZSB0aGUgcmF3IHNldHRlcnMgd2l0aCBjYXJlLCBzaW5jZVxuICogPGNvZGU+VVJJOjp0b1N0cmluZzwvY29kZT4gaXMgbm90IGd1YXJhbnRlZWQgdG8gcmV0dXJuIGEgdmFsaWQgdXJsIGlmIGFcbiAqIHJhdyBzZXR0ZXIgd2FzIHVzZWQuXG4gKlxuICogPHA+QWxsIHNldHRlcnMgcmV0dXJuIDx0dD50aGlzPC90dD4gYW5kIHNvIG1heSBiZSBjaGFpbmVkLCBhIGxhXG4gKiA8Y29kZT51cmkucGFyc2UoJy9mb28nKS5zZXRGcmFnbWVudCgncGFydCcpLnRvU3RyaW5nKCk8L2NvZGU+LlxuICpcbiAqIDxwPllvdSBzaG91bGQgbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5IC0tIHBsZWFzZSBwcmVmZXIgdGhlIGZhY3RvcnlcbiAqIGZ1bmN0aW9ucyB7QGxpbmsgdXJpLnBhcnNlfSwge0BsaW5rIHVyaS5jcmVhdGV9LCB7QGxpbmsgdXJpLnJlc29sdmV9XG4gKiBpbnN0ZWFkLjwvcD5cbiAqXG4gKiA8cD5UaGUgcGFyYW1ldGVycyBhcmUgYWxsIHJhdyAoYXNzdW1lZCB0byBiZSBwcm9wZXJseSBlc2NhcGVkKSBwYXJ0cywgYW5kXG4gKiBhbnkgKGJ1dCBub3QgYWxsKSBtYXkgYmUgbnVsbC4gIFVuZGVmaW5lZCBpcyBub3QgYWxsb3dlZC48L3A+XG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFVSSShcbiAgICByYXdTY2hlbWUsXG4gICAgcmF3Q3JlZGVudGlhbHMsIHJhd0RvbWFpbiwgcG9ydCxcbiAgICByYXdQYXRoLCByYXdRdWVyeSwgcmF3RnJhZ21lbnQpIHtcbiAgdGhpcy5zY2hlbWVfID0gcmF3U2NoZW1lO1xuICB0aGlzLmNyZWRlbnRpYWxzXyA9IHJhd0NyZWRlbnRpYWxzO1xuICB0aGlzLmRvbWFpbl8gPSByYXdEb21haW47XG4gIHRoaXMucG9ydF8gPSBwb3J0O1xuICB0aGlzLnBhdGhfID0gcmF3UGF0aDtcbiAgdGhpcy5xdWVyeV8gPSByYXdRdWVyeTtcbiAgdGhpcy5mcmFnbWVudF8gPSByYXdGcmFnbWVudDtcbiAgLyoqXG4gICAqIEB0eXBlIHtBcnJheXxudWxsfVxuICAgKi9cbiAgdGhpcy5wYXJhbUNhY2hlXyA9IG51bGw7XG59XG5cbi8qKiByZXR1cm5zIHRoZSBzdHJpbmcgZm9ybSBvZiB0aGUgdXJsLiAqL1xuVVJJLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdO1xuICBpZiAobnVsbCAhPT0gdGhpcy5zY2hlbWVfKSB7IG91dC5wdXNoKHRoaXMuc2NoZW1lXywgJzonKTsgfVxuICBpZiAobnVsbCAhPT0gdGhpcy5kb21haW5fKSB7XG4gICAgb3V0LnB1c2goJy8vJyk7XG4gICAgaWYgKG51bGwgIT09IHRoaXMuY3JlZGVudGlhbHNfKSB7IG91dC5wdXNoKHRoaXMuY3JlZGVudGlhbHNfLCAnQCcpOyB9XG4gICAgb3V0LnB1c2godGhpcy5kb21haW5fKTtcbiAgICBpZiAobnVsbCAhPT0gdGhpcy5wb3J0XykgeyBvdXQucHVzaCgnOicsIHRoaXMucG9ydF8udG9TdHJpbmcoKSk7IH1cbiAgfVxuICBpZiAobnVsbCAhPT0gdGhpcy5wYXRoXykgeyBvdXQucHVzaCh0aGlzLnBhdGhfKTsgfVxuICBpZiAobnVsbCAhPT0gdGhpcy5xdWVyeV8pIHsgb3V0LnB1c2goJz8nLCB0aGlzLnF1ZXJ5Xyk7IH1cbiAgaWYgKG51bGwgIT09IHRoaXMuZnJhZ21lbnRfKSB7IG91dC5wdXNoKCcjJywgdGhpcy5mcmFnbWVudF8pOyB9XG4gIHJldHVybiBvdXQuam9pbignJyk7XG59O1xuXG5VUkkucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFVSSSh0aGlzLnNjaGVtZV8sIHRoaXMuY3JlZGVudGlhbHNfLCB0aGlzLmRvbWFpbl8sIHRoaXMucG9ydF8sXG4gICAgICAgICAgICAgICAgIHRoaXMucGF0aF8sIHRoaXMucXVlcnlfLCB0aGlzLmZyYWdtZW50Xyk7XG59O1xuXG5VUkkucHJvdG90eXBlLmdldFNjaGVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gSFRNTDUgc3BlYyBkb2VzIG5vdCByZXF1aXJlIHRoZSBzY2hlbWUgdG8gYmUgbG93ZXJjYXNlZCBidXRcbiAgLy8gYWxsIGNvbW1vbiBicm93c2VycyBleGNlcHQgU2FmYXJpIGxvd2VyY2FzZSB0aGUgc2NoZW1lLlxuICByZXR1cm4gdGhpcy5zY2hlbWVfICYmIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLnNjaGVtZV8pLnRvTG93ZXJDYXNlKCk7XG59O1xuVVJJLnByb3RvdHlwZS5nZXRSYXdTY2hlbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnNjaGVtZV87XG59O1xuVVJJLnByb3RvdHlwZS5zZXRTY2hlbWUgPSBmdW5jdGlvbiAobmV3U2NoZW1lKSB7XG4gIHRoaXMuc2NoZW1lXyA9IGVuY29kZUlmRXhpc3RzMihcbiAgICAgIG5ld1NjaGVtZSwgVVJJX0RJU0FMTE9XRURfSU5fU0NIRU1FX09SX0NSRURFTlRJQUxTXyk7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuc2V0UmF3U2NoZW1lID0gZnVuY3Rpb24gKG5ld1NjaGVtZSkge1xuICB0aGlzLnNjaGVtZV8gPSBuZXdTY2hlbWUgPyBuZXdTY2hlbWUgOiBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLmhhc1NjaGVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG51bGwgIT09IHRoaXMuc2NoZW1lXztcbn07XG5cblxuVVJJLnByb3RvdHlwZS5nZXRDcmVkZW50aWFscyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY3JlZGVudGlhbHNfICYmIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLmNyZWRlbnRpYWxzXyk7XG59O1xuVVJJLnByb3RvdHlwZS5nZXRSYXdDcmVkZW50aWFscyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY3JlZGVudGlhbHNfO1xufTtcblVSSS5wcm90b3R5cGUuc2V0Q3JlZGVudGlhbHMgPSBmdW5jdGlvbiAobmV3Q3JlZGVudGlhbHMpIHtcbiAgdGhpcy5jcmVkZW50aWFsc18gPSBlbmNvZGVJZkV4aXN0czIoXG4gICAgICBuZXdDcmVkZW50aWFscywgVVJJX0RJU0FMTE9XRURfSU5fU0NIRU1FX09SX0NSRURFTlRJQUxTXyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5zZXRSYXdDcmVkZW50aWFscyA9IGZ1bmN0aW9uIChuZXdDcmVkZW50aWFscykge1xuICB0aGlzLmNyZWRlbnRpYWxzXyA9IG5ld0NyZWRlbnRpYWxzID8gbmV3Q3JlZGVudGlhbHMgOiBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLmhhc0NyZWRlbnRpYWxzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbnVsbCAhPT0gdGhpcy5jcmVkZW50aWFsc187XG59O1xuXG5cblVSSS5wcm90b3R5cGUuZ2V0RG9tYWluID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5kb21haW5fICYmIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLmRvbWFpbl8pO1xufTtcblVSSS5wcm90b3R5cGUuZ2V0UmF3RG9tYWluID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5kb21haW5fO1xufTtcblVSSS5wcm90b3R5cGUuc2V0RG9tYWluID0gZnVuY3Rpb24gKG5ld0RvbWFpbikge1xuICByZXR1cm4gdGhpcy5zZXRSYXdEb21haW4obmV3RG9tYWluICYmIGVuY29kZVVSSUNvbXBvbmVudChuZXdEb21haW4pKTtcbn07XG5VUkkucHJvdG90eXBlLnNldFJhd0RvbWFpbiA9IGZ1bmN0aW9uIChuZXdEb21haW4pIHtcbiAgdGhpcy5kb21haW5fID0gbmV3RG9tYWluID8gbmV3RG9tYWluIDogbnVsbDtcbiAgLy8gTWFpbnRhaW4gdGhlIGludmFyaWFudCB0aGF0IHBhdGhzIG11c3Qgc3RhcnQgd2l0aCBhIHNsYXNoIHdoZW4gdGhlIFVSSVxuICAvLyBpcyBub3QgcGF0aC1yZWxhdGl2ZS5cbiAgcmV0dXJuIHRoaXMuc2V0UmF3UGF0aCh0aGlzLnBhdGhfKTtcbn07XG5VUkkucHJvdG90eXBlLmhhc0RvbWFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG51bGwgIT09IHRoaXMuZG9tYWluXztcbn07XG5cblxuVVJJLnByb3RvdHlwZS5nZXRQb3J0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5wb3J0XyAmJiBkZWNvZGVVUklDb21wb25lbnQodGhpcy5wb3J0Xyk7XG59O1xuVVJJLnByb3RvdHlwZS5zZXRQb3J0ID0gZnVuY3Rpb24gKG5ld1BvcnQpIHtcbiAgaWYgKG5ld1BvcnQpIHtcbiAgICBuZXdQb3J0ID0gTnVtYmVyKG5ld1BvcnQpO1xuICAgIGlmIChuZXdQb3J0ICE9PSAobmV3UG9ydCAmIDB4ZmZmZikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmFkIHBvcnQgbnVtYmVyICcgKyBuZXdQb3J0KTtcbiAgICB9XG4gICAgdGhpcy5wb3J0XyA9ICcnICsgbmV3UG9ydDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnBvcnRfID0gbnVsbDtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLmhhc1BvcnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBudWxsICE9PSB0aGlzLnBvcnRfO1xufTtcblxuXG5VUkkucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnBhdGhfICYmIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLnBhdGhfKTtcbn07XG5VUkkucHJvdG90eXBlLmdldFJhd1BhdGggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnBhdGhfO1xufTtcblVSSS5wcm90b3R5cGUuc2V0UGF0aCA9IGZ1bmN0aW9uIChuZXdQYXRoKSB7XG4gIHJldHVybiB0aGlzLnNldFJhd1BhdGgoZW5jb2RlSWZFeGlzdHMyKG5ld1BhdGgsIFVSSV9ESVNBTExPV0VEX0lOX1BBVEhfKSk7XG59O1xuVVJJLnByb3RvdHlwZS5zZXRSYXdQYXRoID0gZnVuY3Rpb24gKG5ld1BhdGgpIHtcbiAgaWYgKG5ld1BhdGgpIHtcbiAgICBuZXdQYXRoID0gU3RyaW5nKG5ld1BhdGgpO1xuICAgIHRoaXMucGF0aF8gPSBcbiAgICAgIC8vIFBhdGhzIG11c3Qgc3RhcnQgd2l0aCAnLycgdW5sZXNzIHRoaXMgaXMgYSBwYXRoLXJlbGF0aXZlIFVSTC5cbiAgICAgICghdGhpcy5kb21haW5fIHx8IC9eXFwvLy50ZXN0KG5ld1BhdGgpKSA/IG5ld1BhdGggOiAnLycgKyBuZXdQYXRoO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGF0aF8gPSBudWxsO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuaGFzUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG51bGwgIT09IHRoaXMucGF0aF87XG59O1xuXG5cblVSSS5wcm90b3R5cGUuZ2V0UXVlcnkgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIEZyb20gaHR0cDovL3d3dy53My5vcmcvQWRkcmVzc2luZy9VUkwvNF9VUklfUmVjb21tZW50YXRpb25zLmh0bWxcbiAgLy8gV2l0aGluIHRoZSBxdWVyeSBzdHJpbmcsIHRoZSBwbHVzIHNpZ24gaXMgcmVzZXJ2ZWQgYXMgc2hvcnRoYW5kIG5vdGF0aW9uXG4gIC8vIGZvciBhIHNwYWNlLlxuICByZXR1cm4gdGhpcy5xdWVyeV8gJiYgZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMucXVlcnlfKS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcbn07XG5VUkkucHJvdG90eXBlLmdldFJhd1F1ZXJ5ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5xdWVyeV87XG59O1xuVVJJLnByb3RvdHlwZS5zZXRRdWVyeSA9IGZ1bmN0aW9uIChuZXdRdWVyeSkge1xuICB0aGlzLnBhcmFtQ2FjaGVfID0gbnVsbDtcbiAgdGhpcy5xdWVyeV8gPSBlbmNvZGVJZkV4aXN0cyhuZXdRdWVyeSk7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuc2V0UmF3UXVlcnkgPSBmdW5jdGlvbiAobmV3UXVlcnkpIHtcbiAgdGhpcy5wYXJhbUNhY2hlXyA9IG51bGw7XG4gIHRoaXMucXVlcnlfID0gbmV3UXVlcnkgPyBuZXdRdWVyeSA6IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuaGFzUXVlcnkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBudWxsICE9PSB0aGlzLnF1ZXJ5Xztcbn07XG5cbi8qKlxuICogc2V0cyB0aGUgcXVlcnkgZ2l2ZW4gYSBsaXN0IG9mIHN0cmluZ3Mgb2YgdGhlIGZvcm1cbiAqIFsga2V5MCwgdmFsdWUwLCBrZXkxLCB2YWx1ZTEsIC4uLiBdLlxuICpcbiAqIDxwPjxjb2RlPnVyaS5zZXRBbGxQYXJhbWV0ZXJzKFsnYScsICdiJywgJ2MnLCAnZCddKS5nZXRRdWVyeSgpPC9jb2RlPlxuICogd2lsbCB5aWVsZCA8Y29kZT4nYT1iJmM9ZCc8L2NvZGU+LlxuICovXG5VUkkucHJvdG90eXBlLnNldEFsbFBhcmFtZXRlcnMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIGlmICh0eXBlb2YgcGFyYW1zID09PSAnb2JqZWN0Jykge1xuICAgIGlmICghKHBhcmFtcyBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAmJiAocGFyYW1zIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGFyYW1zKSAhPT0gJ1tvYmplY3QgQXJyYXldJykpIHtcbiAgICAgIHZhciBuZXdQYXJhbXMgPSBbXTtcbiAgICAgIHZhciBpID0gLTE7XG4gICAgICBmb3IgKHZhciBrIGluIHBhcmFtcykge1xuICAgICAgICB2YXIgdiA9IHBhcmFtc1trXTtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygdikge1xuICAgICAgICAgIG5ld1BhcmFtc1srK2ldID0gaztcbiAgICAgICAgICBuZXdQYXJhbXNbKytpXSA9IHY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBhcmFtcyA9IG5ld1BhcmFtcztcbiAgICB9XG4gIH1cbiAgdGhpcy5wYXJhbUNhY2hlXyA9IG51bGw7XG4gIHZhciBxdWVyeUJ1ZiA9IFtdO1xuICB2YXIgc2VwYXJhdG9yID0gJyc7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgcGFyYW1zLmxlbmd0aDspIHtcbiAgICB2YXIgayA9IHBhcmFtc1tqKytdO1xuICAgIHZhciB2ID0gcGFyYW1zW2orK107XG4gICAgcXVlcnlCdWYucHVzaChzZXBhcmF0b3IsIGVuY29kZVVSSUNvbXBvbmVudChrLnRvU3RyaW5nKCkpKTtcbiAgICBzZXBhcmF0b3IgPSAnJic7XG4gICAgaWYgKHYpIHtcbiAgICAgIHF1ZXJ5QnVmLnB1c2goJz0nLCBlbmNvZGVVUklDb21wb25lbnQodi50b1N0cmluZygpKSk7XG4gICAgfVxuICB9XG4gIHRoaXMucXVlcnlfID0gcXVlcnlCdWYuam9pbignJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblVSSS5wcm90b3R5cGUuY2hlY2tQYXJhbWV0ZXJDYWNoZV8gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5wYXJhbUNhY2hlXykge1xuICAgIHZhciBxID0gdGhpcy5xdWVyeV87XG4gICAgaWYgKCFxKSB7XG4gICAgICB0aGlzLnBhcmFtQ2FjaGVfID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjZ2lQYXJhbXMgPSBxLnNwbGl0KC9bJlxcP10vKTtcbiAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgIHZhciBrID0gLTE7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNnaVBhcmFtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbSA9IGNnaVBhcmFtc1tpXS5tYXRjaCgvXihbXj1dKikoPzo9KC4qKSk/JC8pO1xuICAgICAgICAvLyBGcm9tIGh0dHA6Ly93d3cudzMub3JnL0FkZHJlc3NpbmcvVVJMLzRfVVJJX1JlY29tbWVudGF0aW9ucy5odG1sXG4gICAgICAgIC8vIFdpdGhpbiB0aGUgcXVlcnkgc3RyaW5nLCB0aGUgcGx1cyBzaWduIGlzIHJlc2VydmVkIGFzIHNob3J0aGFuZFxuICAgICAgICAvLyBub3RhdGlvbiBmb3IgYSBzcGFjZS5cbiAgICAgICAgb3V0Wysra10gPSBkZWNvZGVVUklDb21wb25lbnQobVsxXSkucmVwbGFjZSgvXFwrL2csICcgJyk7XG4gICAgICAgIG91dFsrK2tdID0gZGVjb2RlVVJJQ29tcG9uZW50KG1bMl0gfHwgJycpLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJhbUNhY2hlXyA9IG91dDtcbiAgICB9XG4gIH1cbn07XG4vKipcbiAqIHNldHMgdGhlIHZhbHVlcyBvZiB0aGUgbmFtZWQgY2dpIHBhcmFtZXRlcnMuXG4gKlxuICogPHA+U28sIDxjb2RlPnVyaS5wYXJzZSgnZm9vP2E9YiZjPWQmZT1mJykuc2V0UGFyYW1ldGVyVmFsdWVzKCdjJywgWyduZXcnXSlcbiAqIDwvY29kZT4geWllbGRzIDx0dD5mb28/YT1iJmM9bmV3JmU9ZjwvdHQ+LjwvcD5cbiAqXG4gKiBAcGFyYW0ga2V5IHtzdHJpbmd9XG4gKiBAcGFyYW0gdmFsdWVzIHtBcnJheS48c3RyaW5nPn0gdGhlIG5ldyB2YWx1ZXMuICBJZiB2YWx1ZXMgaXMgYSBzaW5nbGUgc3RyaW5nXG4gKiAgIHRoZW4gaXQgd2lsbCBiZSB0cmVhdGVkIGFzIHRoZSBzb2xlIHZhbHVlLlxuICovXG5VUkkucHJvdG90eXBlLnNldFBhcmFtZXRlclZhbHVlcyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlcykge1xuICAvLyBiZSBuaWNlIGFuZCBhdm9pZCBzdWJ0bGUgYnVncyB3aGVyZSBbXSBvcGVyYXRvciBvbiBzdHJpbmcgcGVyZm9ybXMgY2hhckF0XG4gIC8vIG9uIHNvbWUgYnJvd3NlcnMgYW5kIGNyYXNoZXMgb24gSUVcbiAgaWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWVzID0gWyB2YWx1ZXMgXTtcbiAgfVxuXG4gIHRoaXMuY2hlY2tQYXJhbWV0ZXJDYWNoZV8oKTtcbiAgdmFyIG5ld1ZhbHVlSW5kZXggPSAwO1xuICB2YXIgcGMgPSB0aGlzLnBhcmFtQ2FjaGVfO1xuICB2YXIgcGFyYW1zID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBrID0gMDsgaSA8IHBjLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgaWYgKGtleSA9PT0gcGNbaV0pIHtcbiAgICAgIGlmIChuZXdWYWx1ZUluZGV4IDwgdmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBwYXJhbXMucHVzaChrZXksIHZhbHVlc1tuZXdWYWx1ZUluZGV4KytdKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1zLnB1c2gocGNbaV0sIHBjW2kgKyAxXSk7XG4gICAgfVxuICB9XG4gIHdoaWxlIChuZXdWYWx1ZUluZGV4IDwgdmFsdWVzLmxlbmd0aCkge1xuICAgIHBhcmFtcy5wdXNoKGtleSwgdmFsdWVzW25ld1ZhbHVlSW5kZXgrK10pO1xuICB9XG4gIHRoaXMuc2V0QWxsUGFyYW1ldGVycyhwYXJhbXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLnJlbW92ZVBhcmFtZXRlciA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuc2V0UGFyYW1ldGVyVmFsdWVzKGtleSwgW10pO1xufTtcbi8qKlxuICogcmV0dXJucyB0aGUgcGFyYW1ldGVycyBzcGVjaWZpZWQgaW4gdGhlIHF1ZXJ5IHBhcnQgb2YgdGhlIHVyaSBhcyBhIGxpc3Qgb2ZcbiAqIGtleXMgYW5kIHZhbHVlcyBsaWtlIFsga2V5MCwgdmFsdWUwLCBrZXkxLCB2YWx1ZTEsIC4uLiBdLlxuICpcbiAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fVxuICovXG5VUkkucHJvdG90eXBlLmdldEFsbFBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY2hlY2tQYXJhbWV0ZXJDYWNoZV8oKTtcbiAgcmV0dXJuIHRoaXMucGFyYW1DYWNoZV8uc2xpY2UoMCwgdGhpcy5wYXJhbUNhY2hlXy5sZW5ndGgpO1xufTtcbi8qKlxuICogcmV0dXJucyB0aGUgdmFsdWU8Yj5zPC9iPiBmb3IgYSBnaXZlbiBjZ2kgcGFyYW1ldGVyIGFzIGEgbGlzdCBvZiBkZWNvZGVkXG4gKiBxdWVyeSBwYXJhbWV0ZXIgdmFsdWVzLlxuICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59XG4gKi9cblVSSS5wcm90b3R5cGUuZ2V0UGFyYW1ldGVyVmFsdWVzID0gZnVuY3Rpb24gKHBhcmFtTmFtZVVuZXNjYXBlZCkge1xuICB0aGlzLmNoZWNrUGFyYW1ldGVyQ2FjaGVfKCk7XG4gIHZhciB2YWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcmFtQ2FjaGVfLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgaWYgKHBhcmFtTmFtZVVuZXNjYXBlZCA9PT0gdGhpcy5wYXJhbUNhY2hlX1tpXSkge1xuICAgICAgdmFsdWVzLnB1c2godGhpcy5wYXJhbUNhY2hlX1tpICsgMV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufTtcbi8qKlxuICogcmV0dXJucyBhIG1hcCBvZiBjZ2kgcGFyYW1ldGVyIG5hbWVzIHRvIChub24tZW1wdHkpIGxpc3RzIG9mIHZhbHVlcy5cbiAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLEFycmF5LjxzdHJpbmc+Pn1cbiAqL1xuVVJJLnByb3RvdHlwZS5nZXRQYXJhbWV0ZXJNYXAgPSBmdW5jdGlvbiAocGFyYW1OYW1lVW5lc2NhcGVkKSB7XG4gIHRoaXMuY2hlY2tQYXJhbWV0ZXJDYWNoZV8oKTtcbiAgdmFyIHBhcmFtTWFwID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJhbUNhY2hlXy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHZhciBrZXkgPSB0aGlzLnBhcmFtQ2FjaGVfW2krK10sXG4gICAgICB2YWx1ZSA9IHRoaXMucGFyYW1DYWNoZV9baSsrXTtcbiAgICBpZiAoIShrZXkgaW4gcGFyYW1NYXApKSB7XG4gICAgICBwYXJhbU1hcFtrZXldID0gW3ZhbHVlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1NYXBba2V5XS5wdXNoKHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcmFtTWFwO1xufTtcbi8qKlxuICogcmV0dXJucyB0aGUgZmlyc3QgdmFsdWUgZm9yIGEgZ2l2ZW4gY2dpIHBhcmFtZXRlciBvciBudWxsIGlmIHRoZSBnaXZlblxuICogcGFyYW1ldGVyIG5hbWUgZG9lcyBub3QgYXBwZWFyIGluIHRoZSBxdWVyeSBzdHJpbmcuXG4gKiBJZiB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWUgZG9lcyBhcHBlYXIsIGJ1dCBoYXMgbm8gJzx0dD49PC90dD4nIGZvbGxvd2luZ1xuICogaXQsIHRoZW4gdGhlIGVtcHR5IHN0cmluZyB3aWxsIGJlIHJldHVybmVkLlxuICogQHJldHVybiB7c3RyaW5nfG51bGx9XG4gKi9cblVSSS5wcm90b3R5cGUuZ2V0UGFyYW1ldGVyVmFsdWUgPSBmdW5jdGlvbiAocGFyYW1OYW1lVW5lc2NhcGVkKSB7XG4gIHRoaXMuY2hlY2tQYXJhbWV0ZXJDYWNoZV8oKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcmFtQ2FjaGVfLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgaWYgKHBhcmFtTmFtZVVuZXNjYXBlZCA9PT0gdGhpcy5wYXJhbUNhY2hlX1tpXSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyYW1DYWNoZV9baSArIDFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cblVSSS5wcm90b3R5cGUuZ2V0RnJhZ21lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmZyYWdtZW50XyAmJiBkZWNvZGVVUklDb21wb25lbnQodGhpcy5mcmFnbWVudF8pO1xufTtcblVSSS5wcm90b3R5cGUuZ2V0UmF3RnJhZ21lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmZyYWdtZW50Xztcbn07XG5VUkkucHJvdG90eXBlLnNldEZyYWdtZW50ID0gZnVuY3Rpb24gKG5ld0ZyYWdtZW50KSB7XG4gIHRoaXMuZnJhZ21lbnRfID0gbmV3RnJhZ21lbnQgPyBlbmNvZGVVUklDb21wb25lbnQobmV3RnJhZ21lbnQpIDogbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuVVJJLnByb3RvdHlwZS5zZXRSYXdGcmFnbWVudCA9IGZ1bmN0aW9uIChuZXdGcmFnbWVudCkge1xuICB0aGlzLmZyYWdtZW50XyA9IG5ld0ZyYWdtZW50ID8gbmV3RnJhZ21lbnQgOiBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5VUkkucHJvdG90eXBlLmhhc0ZyYWdtZW50ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbnVsbCAhPT0gdGhpcy5mcmFnbWVudF87XG59O1xuXG5mdW5jdGlvbiBudWxsSWZBYnNlbnQobWF0Y2hQYXJ0KSB7XG4gIHJldHVybiAoJ3N0cmluZycgPT0gdHlwZW9mIG1hdGNoUGFydCkgJiYgKG1hdGNoUGFydC5sZW5ndGggPiAwKVxuICAgICAgICAgPyBtYXRjaFBhcnRcbiAgICAgICAgIDogbnVsbDtcbn1cblxuXG5cblxuLyoqXG4gKiBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYnJlYWtpbmcgYSBVUkkgaW50byBpdHMgY29tcG9uZW50IHBhcnRzLlxuICpcbiAqIDxwPmh0dHA6Ly93d3cuZ2Jpdi5jb20vcHJvdG9jb2xzL3VyaS9yZmMvcmZjMzk4Ni5odG1sI1JGQzIyMzQgc2F5c1xuICogQXMgdGhlIFwiZmlyc3QtbWF0Y2gtd2luc1wiIGFsZ29yaXRobSBpcyBpZGVudGljYWwgdG8gdGhlIFwiZ3JlZWR5XCJcbiAqIGRpc2FtYmlndWF0aW9uIG1ldGhvZCB1c2VkIGJ5IFBPU0lYIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGl0IGlzIG5hdHVyYWwgYW5kXG4gKiBjb21tb25wbGFjZSB0byB1c2UgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIHBhcnNpbmcgdGhlIHBvdGVudGlhbCBmaXZlXG4gKiBjb21wb25lbnRzIG9mIGEgVVJJIHJlZmVyZW5jZS5cbiAqXG4gKiA8cD5UaGUgZm9sbG93aW5nIGxpbmUgaXMgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYnJlYWtpbmctZG93biBhXG4gKiB3ZWxsLWZvcm1lZCBVUkkgcmVmZXJlbmNlIGludG8gaXRzIGNvbXBvbmVudHMuXG4gKlxuICogPHByZT5cbiAqIF4oKFteOi8/I10rKTopPygvLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT9cbiAqICAxMiAgICAgICAgICAgIDMgIDQgICAgICAgICAgNSAgICAgICA2ICA3ICAgICAgICA4IDlcbiAqIDwvcHJlPlxuICpcbiAqIDxwPlRoZSBudW1iZXJzIGluIHRoZSBzZWNvbmQgbGluZSBhYm92ZSBhcmUgb25seSB0byBhc3Npc3QgcmVhZGFiaWxpdHk7IHRoZXlcbiAqIGluZGljYXRlIHRoZSByZWZlcmVuY2UgcG9pbnRzIGZvciBlYWNoIHN1YmV4cHJlc3Npb24gKGkuZS4sIGVhY2ggcGFpcmVkXG4gKiBwYXJlbnRoZXNpcykuIFdlIHJlZmVyIHRvIHRoZSB2YWx1ZSBtYXRjaGVkIGZvciBzdWJleHByZXNzaW9uIDxuPiBhcyAkPG4+LlxuICogRm9yIGV4YW1wbGUsIG1hdGNoaW5nIHRoZSBhYm92ZSBleHByZXNzaW9uIHRvXG4gKiA8cHJlPlxuICogICAgIGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHJlc3VsdHMgaW4gdGhlIGZvbGxvd2luZyBzdWJleHByZXNzaW9uIG1hdGNoZXM6XG4gKiA8cHJlPlxuICogICAgJDEgPSBodHRwOlxuICogICAgJDIgPSBodHRwXG4gKiAgICAkMyA9IC8vd3d3Lmljcy51Y2kuZWR1XG4gKiAgICAkNCA9IHd3dy5pY3MudWNpLmVkdVxuICogICAgJDUgPSAvcHViL2lldGYvdXJpL1xuICogICAgJDYgPSA8dW5kZWZpbmVkPlxuICogICAgJDcgPSA8dW5kZWZpbmVkPlxuICogICAgJDggPSAjUmVsYXRlZFxuICogICAgJDkgPSBSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHdoZXJlIDx1bmRlZmluZWQ+IGluZGljYXRlcyB0aGF0IHRoZSBjb21wb25lbnQgaXMgbm90IHByZXNlbnQsIGFzIGlzIHRoZVxuICogY2FzZSBmb3IgdGhlIHF1ZXJ5IGNvbXBvbmVudCBpbiB0aGUgYWJvdmUgZXhhbXBsZS4gVGhlcmVmb3JlLCB3ZSBjYW5cbiAqIGRldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlIGZpdmUgY29tcG9uZW50cyBhc1xuICogPHByZT5cbiAqICAgIHNjaGVtZSAgICA9ICQyXG4gKiAgICBhdXRob3JpdHkgPSAkNFxuICogICAgcGF0aCAgICAgID0gJDVcbiAqICAgIHF1ZXJ5ICAgICA9ICQ3XG4gKiAgICBmcmFnbWVudCAgPSAkOVxuICogPC9wcmU+XG4gKlxuICogPHA+bXNhbXVlbDogSSBoYXZlIG1vZGlmaWVkIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gc2xpZ2h0bHkgdG8gZXhwb3NlIHRoZVxuICogY3JlZGVudGlhbHMsIGRvbWFpbiwgYW5kIHBvcnQgc2VwYXJhdGVseSBmcm9tIHRoZSBhdXRob3JpdHkuXG4gKiBUaGUgbW9kaWZpZWQgdmVyc2lvbiB5aWVsZHNcbiAqIDxwcmU+XG4gKiAgICAkMSA9IGh0dHAgICAgICAgICAgICAgIHNjaGVtZVxuICogICAgJDIgPSA8dW5kZWZpbmVkPiAgICAgICBjcmVkZW50aWFscyAtXFxcbiAqICAgICQzID0gd3d3Lmljcy51Y2kuZWR1ICAgZG9tYWluICAgICAgIHwgYXV0aG9yaXR5XG4gKiAgICAkNCA9IDx1bmRlZmluZWQ+ICAgICAgIHBvcnQgICAgICAgIC0vXG4gKiAgICAkNSA9IC9wdWIvaWV0Zi91cmkvICAgIHBhdGhcbiAqICAgICQ2ID0gPHVuZGVmaW5lZD4gICAgICAgcXVlcnkgd2l0aG91dCA/XG4gKiAgICAkNyA9IFJlbGF0ZWQgICAgICAgICAgIGZyYWdtZW50IHdpdGhvdXQgI1xuICogPC9wcmU+XG4gKi9cbnZhciBVUklfUkVfID0gbmV3IFJlZ0V4cChcbiAgICAgIFwiXlwiICtcbiAgICAgIFwiKD86XCIgK1xuICAgICAgICBcIihbXjovPyNdKylcIiArICAgICAgICAgLy8gc2NoZW1lXG4gICAgICBcIjopP1wiICtcbiAgICAgIFwiKD86Ly9cIiArXG4gICAgICAgIFwiKD86KFteLz8jXSopQCk/XCIgKyAgICAvLyBjcmVkZW50aWFsc1xuICAgICAgICBcIihbXi8/IzpAXSopXCIgKyAgICAgICAgLy8gZG9tYWluXG4gICAgICAgIFwiKD86OihbMC05XSspKT9cIiArICAgICAvLyBwb3J0XG4gICAgICBcIik/XCIgK1xuICAgICAgXCIoW14/I10rKT9cIiArICAgICAgICAgICAgLy8gcGF0aFxuICAgICAgXCIoPzpcXFxcPyhbXiNdKikpP1wiICsgICAgICAvLyBxdWVyeVxuICAgICAgXCIoPzojKC4qKSk/XCIgKyAgICAgICAgICAgLy8gZnJhZ21lbnRcbiAgICAgIFwiJFwiXG4gICAgICApO1xuXG52YXIgVVJJX0RJU0FMTE9XRURfSU5fU0NIRU1FX09SX0NSRURFTlRJQUxTXyA9IC9bI1xcL1xcP0BdL2c7XG52YXIgVVJJX0RJU0FMTE9XRURfSU5fUEFUSF8gPSAvW1xcI1xcP10vZztcblxuVVJJLnBhcnNlID0gcGFyc2U7XG5VUkkuY3JlYXRlID0gY3JlYXRlO1xuVVJJLnJlc29sdmUgPSByZXNvbHZlO1xuVVJJLmNvbGxhcHNlX2RvdHMgPSBjb2xsYXBzZV9kb3RzOyAgLy8gVmlzaWJsZSBmb3IgdGVzdGluZy5cblxuLy8gbGlnaHR3ZWlnaHQgc3RyaW5nLWJhc2VkIGFwaSBmb3IgbG9hZE1vZHVsZU1ha2VyXG5VUkkudXRpbHMgPSB7XG4gIG1pbWVUeXBlT2Y6IGZ1bmN0aW9uICh1cmkpIHtcbiAgICB2YXIgdXJpT2JqID0gcGFyc2UodXJpKTtcbiAgICBpZiAoL1xcLmh0bWwkLy50ZXN0KHVyaU9iai5nZXRQYXRoKCkpKSB7XG4gICAgICByZXR1cm4gJ3RleHQvaHRtbCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XG4gICAgfVxuICB9LFxuICByZXNvbHZlOiBmdW5jdGlvbiAoYmFzZSwgdXJpKSB7XG4gICAgaWYgKGJhc2UpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHBhcnNlKGJhc2UpLCBwYXJzZSh1cmkpKS50b1N0cmluZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJycgKyB1cmk7XG4gICAgfVxuICB9XG59O1xuXG5cbnJldHVybiBVUkk7XG59KSgpO1xuXG4vLyBDb3B5cmlnaHQgR29vZ2xlIEluYy5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5jZSBWZXJzaW9uIDIuMFxuLy8gQXV0b2dlbmVyYXRlZCBhdCBNb24gRmViIDI1IDEzOjA1OjQyIEVTVCAyMDEzXG4vLyBAb3ZlcnJpZGVzIHdpbmRvd1xuLy8gQHByb3ZpZGVzIGh0bWw0XG52YXIgaHRtbDQgPSB7fTtcbmh0bWw0LmF0eXBlID0ge1xuICAnTk9ORSc6IDAsXG4gICdVUkknOiAxLFxuICAnVVJJX0ZSQUdNRU5UJzogMTEsXG4gICdTQ1JJUFQnOiAyLFxuICAnU1RZTEUnOiAzLFxuICAnSFRNTCc6IDEyLFxuICAnSUQnOiA0LFxuICAnSURSRUYnOiA1LFxuICAnSURSRUZTJzogNixcbiAgJ0dMT0JBTF9OQU1FJzogNyxcbiAgJ0xPQ0FMX05BTUUnOiA4LFxuICAnQ0xBU1NFUyc6IDksXG4gICdGUkFNRV9UQVJHRVQnOiAxMCxcbiAgJ01FRElBX1FVRVJZJzogMTNcbn07XG5odG1sNFsgJ2F0eXBlJyBdID0gaHRtbDQuYXR5cGU7XG5odG1sNC5BVFRSSUJTID0ge1xuICAnKjo6Y2xhc3MnOiA5LFxuICAnKjo6ZGlyJzogMCxcbiAgJyo6OmRyYWdnYWJsZSc6IDAsXG4gICcqOjpoaWRkZW4nOiAwLFxuICAnKjo6aWQnOiA0LFxuICAnKjo6aW5lcnQnOiAwLFxuICAnKjo6aXRlbXByb3AnOiAwLFxuICAnKjo6aXRlbXJlZic6IDYsXG4gICcqOjppdGVtc2NvcGUnOiAwLFxuICAnKjo6bGFuZyc6IDAsXG4gICcqOjpvbmJsdXInOiAyLFxuICAnKjo6b25jaGFuZ2UnOiAyLFxuICAnKjo6b25jbGljayc6IDIsXG4gICcqOjpvbmRibGNsaWNrJzogMixcbiAgJyo6Om9uZm9jdXMnOiAyLFxuICAnKjo6b25rZXlkb3duJzogMixcbiAgJyo6Om9ua2V5cHJlc3MnOiAyLFxuICAnKjo6b25rZXl1cCc6IDIsXG4gICcqOjpvbmxvYWQnOiAyLFxuICAnKjo6b25tb3VzZWRvd24nOiAyLFxuICAnKjo6b25tb3VzZW1vdmUnOiAyLFxuICAnKjo6b25tb3VzZW91dCc6IDIsXG4gICcqOjpvbm1vdXNlb3Zlcic6IDIsXG4gICcqOjpvbm1vdXNldXAnOiAyLFxuICAnKjo6b25yZXNldCc6IDIsXG4gICcqOjpvbnNjcm9sbCc6IDIsXG4gICcqOjpvbnNlbGVjdCc6IDIsXG4gICcqOjpvbnN1Ym1pdCc6IDIsXG4gICcqOjpvbnVubG9hZCc6IDIsXG4gICcqOjpzcGVsbGNoZWNrJzogMCxcbiAgJyo6OnN0eWxlJzogMyxcbiAgJyo6OnRpdGxlJzogMCxcbiAgJyo6OnRyYW5zbGF0ZSc6IDAsXG4gICdhOjphY2Nlc3NrZXknOiAwLFxuICAnYTo6Y29vcmRzJzogMCxcbiAgJ2E6OmhyZWYnOiAxLFxuICAnYTo6aHJlZmxhbmcnOiAwLFxuICAnYTo6bmFtZSc6IDcsXG4gICdhOjpvbmJsdXInOiAyLFxuICAnYTo6b25mb2N1cyc6IDIsXG4gICdhOjpzaGFwZSc6IDAsXG4gICdhOjp0YWJpbmRleCc6IDAsXG4gICdhOjp0YXJnZXQnOiAxMCxcbiAgJ2E6OnR5cGUnOiAwLFxuICAnYXJlYTo6YWNjZXNza2V5JzogMCxcbiAgJ2FyZWE6OmFsdCc6IDAsXG4gICdhcmVhOjpjb29yZHMnOiAwLFxuICAnYXJlYTo6aHJlZic6IDEsXG4gICdhcmVhOjpub2hyZWYnOiAwLFxuICAnYXJlYTo6b25ibHVyJzogMixcbiAgJ2FyZWE6Om9uZm9jdXMnOiAyLFxuICAnYXJlYTo6c2hhcGUnOiAwLFxuICAnYXJlYTo6dGFiaW5kZXgnOiAwLFxuICAnYXJlYTo6dGFyZ2V0JzogMTAsXG4gICdhdWRpbzo6Y29udHJvbHMnOiAwLFxuICAnYXVkaW86Omxvb3AnOiAwLFxuICAnYXVkaW86Om1lZGlhZ3JvdXAnOiA1LFxuICAnYXVkaW86Om11dGVkJzogMCxcbiAgJ2F1ZGlvOjpwcmVsb2FkJzogMCxcbiAgJ2Jkbzo6ZGlyJzogMCxcbiAgJ2Jsb2NrcXVvdGU6OmNpdGUnOiAxLFxuICAnYnI6OmNsZWFyJzogMCxcbiAgJ2J1dHRvbjo6YWNjZXNza2V5JzogMCxcbiAgJ2J1dHRvbjo6ZGlzYWJsZWQnOiAwLFxuICAnYnV0dG9uOjpuYW1lJzogOCxcbiAgJ2J1dHRvbjo6b25ibHVyJzogMixcbiAgJ2J1dHRvbjo6b25mb2N1cyc6IDIsXG4gICdidXR0b246OnRhYmluZGV4JzogMCxcbiAgJ2J1dHRvbjo6dHlwZSc6IDAsXG4gICdidXR0b246OnZhbHVlJzogMCxcbiAgJ2NhbnZhczo6aGVpZ2h0JzogMCxcbiAgJ2NhbnZhczo6d2lkdGgnOiAwLFxuICAnY2FwdGlvbjo6YWxpZ24nOiAwLFxuICAnY29sOjphbGlnbic6IDAsXG4gICdjb2w6OmNoYXInOiAwLFxuICAnY29sOjpjaGFyb2ZmJzogMCxcbiAgJ2NvbDo6c3Bhbic6IDAsXG4gICdjb2w6OnZhbGlnbic6IDAsXG4gICdjb2w6OndpZHRoJzogMCxcbiAgJ2NvbGdyb3VwOjphbGlnbic6IDAsXG4gICdjb2xncm91cDo6Y2hhcic6IDAsXG4gICdjb2xncm91cDo6Y2hhcm9mZic6IDAsXG4gICdjb2xncm91cDo6c3Bhbic6IDAsXG4gICdjb2xncm91cDo6dmFsaWduJzogMCxcbiAgJ2NvbGdyb3VwOjp3aWR0aCc6IDAsXG4gICdjb21tYW5kOjpjaGVja2VkJzogMCxcbiAgJ2NvbW1hbmQ6OmNvbW1hbmQnOiA1LFxuICAnY29tbWFuZDo6ZGlzYWJsZWQnOiAwLFxuICAnY29tbWFuZDo6aWNvbic6IDEsXG4gICdjb21tYW5kOjpsYWJlbCc6IDAsXG4gICdjb21tYW5kOjpyYWRpb2dyb3VwJzogMCxcbiAgJ2NvbW1hbmQ6OnR5cGUnOiAwLFxuICAnZGF0YTo6dmFsdWUnOiAwLFxuICAnZGVsOjpjaXRlJzogMSxcbiAgJ2RlbDo6ZGF0ZXRpbWUnOiAwLFxuICAnZGV0YWlsczo6b3Blbic6IDAsXG4gICdkaXI6OmNvbXBhY3QnOiAwLFxuICAnZGl2OjphbGlnbic6IDAsXG4gICdkbDo6Y29tcGFjdCc6IDAsXG4gICdmaWVsZHNldDo6ZGlzYWJsZWQnOiAwLFxuICAnZm9udDo6Y29sb3InOiAwLFxuICAnZm9udDo6ZmFjZSc6IDAsXG4gICdmb250OjpzaXplJzogMCxcbiAgJ2Zvcm06OmFjY2VwdCc6IDAsXG4gICdmb3JtOjphY3Rpb24nOiAxLFxuICAnZm9ybTo6YXV0b2NvbXBsZXRlJzogMCxcbiAgJ2Zvcm06OmVuY3R5cGUnOiAwLFxuICAnZm9ybTo6bWV0aG9kJzogMCxcbiAgJ2Zvcm06Om5hbWUnOiA3LFxuICAnZm9ybTo6bm92YWxpZGF0ZSc6IDAsXG4gICdmb3JtOjpvbnJlc2V0JzogMixcbiAgJ2Zvcm06Om9uc3VibWl0JzogMixcbiAgJ2Zvcm06OnRhcmdldCc6IDEwLFxuICAnaDE6OmFsaWduJzogMCxcbiAgJ2gyOjphbGlnbic6IDAsXG4gICdoMzo6YWxpZ24nOiAwLFxuICAnaDQ6OmFsaWduJzogMCxcbiAgJ2g1OjphbGlnbic6IDAsXG4gICdoNjo6YWxpZ24nOiAwLFxuICAnaHI6OmFsaWduJzogMCxcbiAgJ2hyOjpub3NoYWRlJzogMCxcbiAgJ2hyOjpzaXplJzogMCxcbiAgJ2hyOjp3aWR0aCc6IDAsXG4gICdpZnJhbWU6OmFsaWduJzogMCxcbiAgJ2lmcmFtZTo6ZnJhbWVib3JkZXInOiAwLFxuICAnaWZyYW1lOjpoZWlnaHQnOiAwLFxuICAnaWZyYW1lOjptYXJnaW5oZWlnaHQnOiAwLFxuICAnaWZyYW1lOjptYXJnaW53aWR0aCc6IDAsXG4gICdpZnJhbWU6OndpZHRoJzogMCxcbiAgJ2ltZzo6YWxpZ24nOiAwLFxuICAnaW1nOjphbHQnOiAwLFxuICAnaW1nOjpib3JkZXInOiAwLFxuICAnaW1nOjpoZWlnaHQnOiAwLFxuICAnaW1nOjpoc3BhY2UnOiAwLFxuICAnaW1nOjppc21hcCc6IDAsXG4gICdpbWc6Om5hbWUnOiA3LFxuICAnaW1nOjpzcmMnOiAxLFxuICAnaW1nOjp1c2VtYXAnOiAxMSxcbiAgJ2ltZzo6dnNwYWNlJzogMCxcbiAgJ2ltZzo6d2lkdGgnOiAwLFxuICAnaW5wdXQ6OmFjY2VwdCc6IDAsXG4gICdpbnB1dDo6YWNjZXNza2V5JzogMCxcbiAgJ2lucHV0OjphbGlnbic6IDAsXG4gICdpbnB1dDo6YWx0JzogMCxcbiAgJ2lucHV0OjphdXRvY29tcGxldGUnOiAwLFxuICAnaW5wdXQ6OmNoZWNrZWQnOiAwLFxuICAnaW5wdXQ6OmRpc2FibGVkJzogMCxcbiAgJ2lucHV0OjppbnB1dG1vZGUnOiAwLFxuICAnaW5wdXQ6OmlzbWFwJzogMCxcbiAgJ2lucHV0OjpsaXN0JzogNSxcbiAgJ2lucHV0OjptYXgnOiAwLFxuICAnaW5wdXQ6Om1heGxlbmd0aCc6IDAsXG4gICdpbnB1dDo6bWluJzogMCxcbiAgJ2lucHV0OjptdWx0aXBsZSc6IDAsXG4gICdpbnB1dDo6bmFtZSc6IDgsXG4gICdpbnB1dDo6b25ibHVyJzogMixcbiAgJ2lucHV0OjpvbmNoYW5nZSc6IDIsXG4gICdpbnB1dDo6b25mb2N1cyc6IDIsXG4gICdpbnB1dDo6b25zZWxlY3QnOiAyLFxuICAnaW5wdXQ6OnBsYWNlaG9sZGVyJzogMCxcbiAgJ2lucHV0OjpyZWFkb25seSc6IDAsXG4gICdpbnB1dDo6cmVxdWlyZWQnOiAwLFxuICAnaW5wdXQ6OnNpemUnOiAwLFxuICAnaW5wdXQ6OnNyYyc6IDEsXG4gICdpbnB1dDo6c3RlcCc6IDAsXG4gICdpbnB1dDo6dGFiaW5kZXgnOiAwLFxuICAnaW5wdXQ6OnR5cGUnOiAwLFxuICAnaW5wdXQ6OnVzZW1hcCc6IDExLFxuICAnaW5wdXQ6OnZhbHVlJzogMCxcbiAgJ2luczo6Y2l0ZSc6IDEsXG4gICdpbnM6OmRhdGV0aW1lJzogMCxcbiAgJ2xhYmVsOjphY2Nlc3NrZXknOiAwLFxuICAnbGFiZWw6OmZvcic6IDUsXG4gICdsYWJlbDo6b25ibHVyJzogMixcbiAgJ2xhYmVsOjpvbmZvY3VzJzogMixcbiAgJ2xlZ2VuZDo6YWNjZXNza2V5JzogMCxcbiAgJ2xlZ2VuZDo6YWxpZ24nOiAwLFxuICAnbGk6OnR5cGUnOiAwLFxuICAnbGk6OnZhbHVlJzogMCxcbiAgJ21hcDo6bmFtZSc6IDcsXG4gICdtZW51Ojpjb21wYWN0JzogMCxcbiAgJ21lbnU6OmxhYmVsJzogMCxcbiAgJ21lbnU6OnR5cGUnOiAwLFxuICAnbWV0ZXI6OmhpZ2gnOiAwLFxuICAnbWV0ZXI6Omxvdyc6IDAsXG4gICdtZXRlcjo6bWF4JzogMCxcbiAgJ21ldGVyOjptaW4nOiAwLFxuICAnbWV0ZXI6OnZhbHVlJzogMCxcbiAgJ29sOjpjb21wYWN0JzogMCxcbiAgJ29sOjpyZXZlcnNlZCc6IDAsXG4gICdvbDo6c3RhcnQnOiAwLFxuICAnb2w6OnR5cGUnOiAwLFxuICAnb3B0Z3JvdXA6OmRpc2FibGVkJzogMCxcbiAgJ29wdGdyb3VwOjpsYWJlbCc6IDAsXG4gICdvcHRpb246OmRpc2FibGVkJzogMCxcbiAgJ29wdGlvbjo6bGFiZWwnOiAwLFxuICAnb3B0aW9uOjpzZWxlY3RlZCc6IDAsXG4gICdvcHRpb246OnZhbHVlJzogMCxcbiAgJ291dHB1dDo6Zm9yJzogNixcbiAgJ291dHB1dDo6bmFtZSc6IDgsXG4gICdwOjphbGlnbic6IDAsXG4gICdwcmU6OndpZHRoJzogMCxcbiAgJ3Byb2dyZXNzOjptYXgnOiAwLFxuICAncHJvZ3Jlc3M6Om1pbic6IDAsXG4gICdwcm9ncmVzczo6dmFsdWUnOiAwLFxuICAncTo6Y2l0ZSc6IDEsXG4gICdzZWxlY3Q6OmF1dG9jb21wbGV0ZSc6IDAsXG4gICdzZWxlY3Q6OmRpc2FibGVkJzogMCxcbiAgJ3NlbGVjdDo6bXVsdGlwbGUnOiAwLFxuICAnc2VsZWN0OjpuYW1lJzogOCxcbiAgJ3NlbGVjdDo6b25ibHVyJzogMixcbiAgJ3NlbGVjdDo6b25jaGFuZ2UnOiAyLFxuICAnc2VsZWN0OjpvbmZvY3VzJzogMixcbiAgJ3NlbGVjdDo6cmVxdWlyZWQnOiAwLFxuICAnc2VsZWN0OjpzaXplJzogMCxcbiAgJ3NlbGVjdDo6dGFiaW5kZXgnOiAwLFxuICAnc291cmNlOjp0eXBlJzogMCxcbiAgJ3RhYmxlOjphbGlnbic6IDAsXG4gICd0YWJsZTo6Ymdjb2xvcic6IDAsXG4gICd0YWJsZTo6Ym9yZGVyJzogMCxcbiAgJ3RhYmxlOjpjZWxscGFkZGluZyc6IDAsXG4gICd0YWJsZTo6Y2VsbHNwYWNpbmcnOiAwLFxuICAndGFibGU6OmZyYW1lJzogMCxcbiAgJ3RhYmxlOjpydWxlcyc6IDAsXG4gICd0YWJsZTo6c3VtbWFyeSc6IDAsXG4gICd0YWJsZTo6d2lkdGgnOiAwLFxuICAndGJvZHk6OmFsaWduJzogMCxcbiAgJ3Rib2R5OjpjaGFyJzogMCxcbiAgJ3Rib2R5OjpjaGFyb2ZmJzogMCxcbiAgJ3Rib2R5Ojp2YWxpZ24nOiAwLFxuICAndGQ6OmFiYnInOiAwLFxuICAndGQ6OmFsaWduJzogMCxcbiAgJ3RkOjpheGlzJzogMCxcbiAgJ3RkOjpiZ2NvbG9yJzogMCxcbiAgJ3RkOjpjaGFyJzogMCxcbiAgJ3RkOjpjaGFyb2ZmJzogMCxcbiAgJ3RkOjpjb2xzcGFuJzogMCxcbiAgJ3RkOjpoZWFkZXJzJzogNixcbiAgJ3RkOjpoZWlnaHQnOiAwLFxuICAndGQ6Om5vd3JhcCc6IDAsXG4gICd0ZDo6cm93c3Bhbic6IDAsXG4gICd0ZDo6c2NvcGUnOiAwLFxuICAndGQ6OnZhbGlnbic6IDAsXG4gICd0ZDo6d2lkdGgnOiAwLFxuICAndGV4dGFyZWE6OmFjY2Vzc2tleSc6IDAsXG4gICd0ZXh0YXJlYTo6YXV0b2NvbXBsZXRlJzogMCxcbiAgJ3RleHRhcmVhOjpjb2xzJzogMCxcbiAgJ3RleHRhcmVhOjpkaXNhYmxlZCc6IDAsXG4gICd0ZXh0YXJlYTo6aW5wdXRtb2RlJzogMCxcbiAgJ3RleHRhcmVhOjpuYW1lJzogOCxcbiAgJ3RleHRhcmVhOjpvbmJsdXInOiAyLFxuICAndGV4dGFyZWE6Om9uY2hhbmdlJzogMixcbiAgJ3RleHRhcmVhOjpvbmZvY3VzJzogMixcbiAgJ3RleHRhcmVhOjpvbnNlbGVjdCc6IDIsXG4gICd0ZXh0YXJlYTo6cGxhY2Vob2xkZXInOiAwLFxuICAndGV4dGFyZWE6OnJlYWRvbmx5JzogMCxcbiAgJ3RleHRhcmVhOjpyZXF1aXJlZCc6IDAsXG4gICd0ZXh0YXJlYTo6cm93cyc6IDAsXG4gICd0ZXh0YXJlYTo6dGFiaW5kZXgnOiAwLFxuICAndGV4dGFyZWE6OndyYXAnOiAwLFxuICAndGZvb3Q6OmFsaWduJzogMCxcbiAgJ3Rmb290OjpjaGFyJzogMCxcbiAgJ3Rmb290OjpjaGFyb2ZmJzogMCxcbiAgJ3Rmb290Ojp2YWxpZ24nOiAwLFxuICAndGg6OmFiYnInOiAwLFxuICAndGg6OmFsaWduJzogMCxcbiAgJ3RoOjpheGlzJzogMCxcbiAgJ3RoOjpiZ2NvbG9yJzogMCxcbiAgJ3RoOjpjaGFyJzogMCxcbiAgJ3RoOjpjaGFyb2ZmJzogMCxcbiAgJ3RoOjpjb2xzcGFuJzogMCxcbiAgJ3RoOjpoZWFkZXJzJzogNixcbiAgJ3RoOjpoZWlnaHQnOiAwLFxuICAndGg6Om5vd3JhcCc6IDAsXG4gICd0aDo6cm93c3Bhbic6IDAsXG4gICd0aDo6c2NvcGUnOiAwLFxuICAndGg6OnZhbGlnbic6IDAsXG4gICd0aDo6d2lkdGgnOiAwLFxuICAndGhlYWQ6OmFsaWduJzogMCxcbiAgJ3RoZWFkOjpjaGFyJzogMCxcbiAgJ3RoZWFkOjpjaGFyb2ZmJzogMCxcbiAgJ3RoZWFkOjp2YWxpZ24nOiAwLFxuICAndHI6OmFsaWduJzogMCxcbiAgJ3RyOjpiZ2NvbG9yJzogMCxcbiAgJ3RyOjpjaGFyJzogMCxcbiAgJ3RyOjpjaGFyb2ZmJzogMCxcbiAgJ3RyOjp2YWxpZ24nOiAwLFxuICAndHJhY2s6OmRlZmF1bHQnOiAwLFxuICAndHJhY2s6OmtpbmQnOiAwLFxuICAndHJhY2s6OmxhYmVsJzogMCxcbiAgJ3RyYWNrOjpzcmNsYW5nJzogMCxcbiAgJ3VsOjpjb21wYWN0JzogMCxcbiAgJ3VsOjp0eXBlJzogMCxcbiAgJ3ZpZGVvOjpjb250cm9scyc6IDAsXG4gICd2aWRlbzo6aGVpZ2h0JzogMCxcbiAgJ3ZpZGVvOjpsb29wJzogMCxcbiAgJ3ZpZGVvOjptZWRpYWdyb3VwJzogNSxcbiAgJ3ZpZGVvOjptdXRlZCc6IDAsXG4gICd2aWRlbzo6cG9zdGVyJzogMSxcbiAgJ3ZpZGVvOjpwcmVsb2FkJzogMCxcbiAgJ3ZpZGVvOjp3aWR0aCc6IDBcbn07XG5odG1sNFsgJ0FUVFJJQlMnIF0gPSBodG1sNC5BVFRSSUJTO1xuaHRtbDQuZWZsYWdzID0ge1xuICAnT1BUSU9OQUxfRU5EVEFHJzogMSxcbiAgJ0VNUFRZJzogMixcbiAgJ0NEQVRBJzogNCxcbiAgJ1JDREFUQSc6IDgsXG4gICdVTlNBRkUnOiAxNixcbiAgJ0ZPTERBQkxFJzogMzIsXG4gICdTQ1JJUFQnOiA2NCxcbiAgJ1NUWUxFJzogMTI4LFxuICAnVklSVFVBTElaRUQnOiAyNTZcbn07XG5odG1sNFsgJ2VmbGFncycgXSA9IGh0bWw0LmVmbGFncztcbmh0bWw0LkVMRU1FTlRTID0ge1xuICAnYSc6IDAsXG4gICdhYmJyJzogMCxcbiAgJ2Fjcm9ueW0nOiAwLFxuICAnYWRkcmVzcyc6IDAsXG4gICdhcHBsZXQnOiAyNzIsXG4gICdhcmVhJzogMixcbiAgJ2FydGljbGUnOiAwLFxuICAnYXNpZGUnOiAwLFxuICAnYXVkaW8nOiAwLFxuICAnYic6IDAsXG4gICdiYXNlJzogMjc0LFxuICAnYmFzZWZvbnQnOiAyNzQsXG4gICdiZGknOiAwLFxuICAnYmRvJzogMCxcbiAgJ2JpZyc6IDAsXG4gICdibG9ja3F1b3RlJzogMCxcbiAgJ2JvZHknOiAzMDUsXG4gICdicic6IDIsXG4gICdidXR0b24nOiAwLFxuICAnY2FudmFzJzogMCxcbiAgJ2NhcHRpb24nOiAwLFxuICAnY2VudGVyJzogMCxcbiAgJ2NpdGUnOiAwLFxuICAnY29kZSc6IDAsXG4gICdjb2wnOiAyLFxuICAnY29sZ3JvdXAnOiAxLFxuICAnY29tbWFuZCc6IDIsXG4gICdkYXRhJzogMCxcbiAgJ2RhdGFsaXN0JzogMCxcbiAgJ2RkJzogMSxcbiAgJ2RlbCc6IDAsXG4gICdkZXRhaWxzJzogMCxcbiAgJ2Rmbic6IDAsXG4gICdkaWFsb2cnOiAyNzIsXG4gICdkaXInOiAwLFxuICAnZGl2JzogMCxcbiAgJ2RsJzogMCxcbiAgJ2R0JzogMSxcbiAgJ2VtJzogMCxcbiAgJ2ZpZWxkc2V0JzogMCxcbiAgJ2ZpZ2NhcHRpb24nOiAwLFxuICAnZmlndXJlJzogMCxcbiAgJ2ZvbnQnOiAwLFxuICAnZm9vdGVyJzogMCxcbiAgJ2Zvcm0nOiAwLFxuICAnZnJhbWUnOiAyNzQsXG4gICdmcmFtZXNldCc6IDI3MixcbiAgJ2gxJzogMCxcbiAgJ2gyJzogMCxcbiAgJ2gzJzogMCxcbiAgJ2g0JzogMCxcbiAgJ2g1JzogMCxcbiAgJ2g2JzogMCxcbiAgJ2hlYWQnOiAzMDUsXG4gICdoZWFkZXInOiAwLFxuICAnaGdyb3VwJzogMCxcbiAgJ2hyJzogMixcbiAgJ2h0bWwnOiAzMDUsXG4gICdpJzogMCxcbiAgJ2lmcmFtZSc6IDQsXG4gICdpbWcnOiAyLFxuICAnaW5wdXQnOiAyLFxuICAnaW5zJzogMCxcbiAgJ2lzaW5kZXgnOiAyNzQsXG4gICdrYmQnOiAwLFxuICAna2V5Z2VuJzogMjc0LFxuICAnbGFiZWwnOiAwLFxuICAnbGVnZW5kJzogMCxcbiAgJ2xpJzogMSxcbiAgJ2xpbmsnOiAyNzQsXG4gICdtYXAnOiAwLFxuICAnbWFyayc6IDAsXG4gICdtZW51JzogMCxcbiAgJ21ldGEnOiAyNzQsXG4gICdtZXRlcic6IDAsXG4gICduYXYnOiAwLFxuICAnbm9icic6IDAsXG4gICdub2VtYmVkJzogMjc2LFxuICAnbm9mcmFtZXMnOiAyNzYsXG4gICdub3NjcmlwdCc6IDI3NixcbiAgJ29iamVjdCc6IDI3MixcbiAgJ29sJzogMCxcbiAgJ29wdGdyb3VwJzogMCxcbiAgJ29wdGlvbic6IDEsXG4gICdvdXRwdXQnOiAwLFxuICAncCc6IDEsXG4gICdwYXJhbSc6IDI3NCxcbiAgJ3ByZSc6IDAsXG4gICdwcm9ncmVzcyc6IDAsXG4gICdxJzogMCxcbiAgJ3MnOiAwLFxuICAnc2FtcCc6IDAsXG4gICdzY3JpcHQnOiA4NCxcbiAgJ3NlY3Rpb24nOiAwLFxuICAnc2VsZWN0JzogMCxcbiAgJ3NtYWxsJzogMCxcbiAgJ3NvdXJjZSc6IDIsXG4gICdzcGFuJzogMCxcbiAgJ3N0cmlrZSc6IDAsXG4gICdzdHJvbmcnOiAwLFxuICAnc3R5bGUnOiAxNDgsXG4gICdzdWInOiAwLFxuICAnc3VtbWFyeSc6IDAsXG4gICdzdXAnOiAwLFxuICAndGFibGUnOiAwLFxuICAndGJvZHknOiAxLFxuICAndGQnOiAxLFxuICAndGV4dGFyZWEnOiA4LFxuICAndGZvb3QnOiAxLFxuICAndGgnOiAxLFxuICAndGhlYWQnOiAxLFxuICAndGltZSc6IDAsXG4gICd0aXRsZSc6IDI4MCxcbiAgJ3RyJzogMSxcbiAgJ3RyYWNrJzogMixcbiAgJ3R0JzogMCxcbiAgJ3UnOiAwLFxuICAndWwnOiAwLFxuICAndmFyJzogMCxcbiAgJ3ZpZGVvJzogMCxcbiAgJ3dicic6IDJcbn07XG5odG1sNFsgJ0VMRU1FTlRTJyBdID0gaHRtbDQuRUxFTUVOVFM7XG5odG1sNC5FTEVNRU5UX0RPTV9JTlRFUkZBQ0VTID0ge1xuICAnYSc6ICdIVE1MQW5jaG9yRWxlbWVudCcsXG4gICdhYmJyJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2Fjcm9ueW0nOiAnSFRNTEVsZW1lbnQnLFxuICAnYWRkcmVzcyc6ICdIVE1MRWxlbWVudCcsXG4gICdhcHBsZXQnOiAnSFRNTEFwcGxldEVsZW1lbnQnLFxuICAnYXJlYSc6ICdIVE1MQXJlYUVsZW1lbnQnLFxuICAnYXJ0aWNsZSc6ICdIVE1MRWxlbWVudCcsXG4gICdhc2lkZSc6ICdIVE1MRWxlbWVudCcsXG4gICdhdWRpbyc6ICdIVE1MQXVkaW9FbGVtZW50JyxcbiAgJ2InOiAnSFRNTEVsZW1lbnQnLFxuICAnYmFzZSc6ICdIVE1MQmFzZUVsZW1lbnQnLFxuICAnYmFzZWZvbnQnOiAnSFRNTEJhc2VGb250RWxlbWVudCcsXG4gICdiZGknOiAnSFRNTEVsZW1lbnQnLFxuICAnYmRvJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2JpZyc6ICdIVE1MRWxlbWVudCcsXG4gICdibG9ja3F1b3RlJzogJ0hUTUxRdW90ZUVsZW1lbnQnLFxuICAnYm9keSc6ICdIVE1MQm9keUVsZW1lbnQnLFxuICAnYnInOiAnSFRNTEJSRWxlbWVudCcsXG4gICdidXR0b24nOiAnSFRNTEJ1dHRvbkVsZW1lbnQnLFxuICAnY2FudmFzJzogJ0hUTUxDYW52YXNFbGVtZW50JyxcbiAgJ2NhcHRpb24nOiAnSFRNTFRhYmxlQ2FwdGlvbkVsZW1lbnQnLFxuICAnY2VudGVyJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2NpdGUnOiAnSFRNTEVsZW1lbnQnLFxuICAnY29kZSc6ICdIVE1MRWxlbWVudCcsXG4gICdjb2wnOiAnSFRNTFRhYmxlQ29sRWxlbWVudCcsXG4gICdjb2xncm91cCc6ICdIVE1MVGFibGVDb2xFbGVtZW50JyxcbiAgJ2NvbW1hbmQnOiAnSFRNTENvbW1hbmRFbGVtZW50JyxcbiAgJ2RhdGEnOiAnSFRNTEVsZW1lbnQnLFxuICAnZGF0YWxpc3QnOiAnSFRNTERhdGFMaXN0RWxlbWVudCcsXG4gICdkZCc6ICdIVE1MRWxlbWVudCcsXG4gICdkZWwnOiAnSFRNTE1vZEVsZW1lbnQnLFxuICAnZGV0YWlscyc6ICdIVE1MRGV0YWlsc0VsZW1lbnQnLFxuICAnZGZuJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2RpYWxvZyc6ICdIVE1MRGlhbG9nRWxlbWVudCcsXG4gICdkaXInOiAnSFRNTERpcmVjdG9yeUVsZW1lbnQnLFxuICAnZGl2JzogJ0hUTUxEaXZFbGVtZW50JyxcbiAgJ2RsJzogJ0hUTUxETGlzdEVsZW1lbnQnLFxuICAnZHQnOiAnSFRNTEVsZW1lbnQnLFxuICAnZW0nOiAnSFRNTEVsZW1lbnQnLFxuICAnZmllbGRzZXQnOiAnSFRNTEZpZWxkU2V0RWxlbWVudCcsXG4gICdmaWdjYXB0aW9uJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2ZpZ3VyZSc6ICdIVE1MRWxlbWVudCcsXG4gICdmb250JzogJ0hUTUxGb250RWxlbWVudCcsXG4gICdmb290ZXInOiAnSFRNTEVsZW1lbnQnLFxuICAnZm9ybSc6ICdIVE1MRm9ybUVsZW1lbnQnLFxuICAnZnJhbWUnOiAnSFRNTEZyYW1lRWxlbWVudCcsXG4gICdmcmFtZXNldCc6ICdIVE1MRnJhbWVTZXRFbGVtZW50JyxcbiAgJ2gxJzogJ0hUTUxIZWFkaW5nRWxlbWVudCcsXG4gICdoMic6ICdIVE1MSGVhZGluZ0VsZW1lbnQnLFxuICAnaDMnOiAnSFRNTEhlYWRpbmdFbGVtZW50JyxcbiAgJ2g0JzogJ0hUTUxIZWFkaW5nRWxlbWVudCcsXG4gICdoNSc6ICdIVE1MSGVhZGluZ0VsZW1lbnQnLFxuICAnaDYnOiAnSFRNTEhlYWRpbmdFbGVtZW50JyxcbiAgJ2hlYWQnOiAnSFRNTEhlYWRFbGVtZW50JyxcbiAgJ2hlYWRlcic6ICdIVE1MRWxlbWVudCcsXG4gICdoZ3JvdXAnOiAnSFRNTEVsZW1lbnQnLFxuICAnaHInOiAnSFRNTEhSRWxlbWVudCcsXG4gICdodG1sJzogJ0hUTUxIdG1sRWxlbWVudCcsXG4gICdpJzogJ0hUTUxFbGVtZW50JyxcbiAgJ2lmcmFtZSc6ICdIVE1MSUZyYW1lRWxlbWVudCcsXG4gICdpbWcnOiAnSFRNTEltYWdlRWxlbWVudCcsXG4gICdpbnB1dCc6ICdIVE1MSW5wdXRFbGVtZW50JyxcbiAgJ2lucyc6ICdIVE1MTW9kRWxlbWVudCcsXG4gICdpc2luZGV4JzogJ0hUTUxVbmtub3duRWxlbWVudCcsXG4gICdrYmQnOiAnSFRNTEVsZW1lbnQnLFxuICAna2V5Z2VuJzogJ0hUTUxLZXlnZW5FbGVtZW50JyxcbiAgJ2xhYmVsJzogJ0hUTUxMYWJlbEVsZW1lbnQnLFxuICAnbGVnZW5kJzogJ0hUTUxMZWdlbmRFbGVtZW50JyxcbiAgJ2xpJzogJ0hUTUxMSUVsZW1lbnQnLFxuICAnbGluayc6ICdIVE1MTGlua0VsZW1lbnQnLFxuICAnbWFwJzogJ0hUTUxNYXBFbGVtZW50JyxcbiAgJ21hcmsnOiAnSFRNTEVsZW1lbnQnLFxuICAnbWVudSc6ICdIVE1MTWVudUVsZW1lbnQnLFxuICAnbWV0YSc6ICdIVE1MTWV0YUVsZW1lbnQnLFxuICAnbWV0ZXInOiAnSFRNTE1ldGVyRWxlbWVudCcsXG4gICduYXYnOiAnSFRNTEVsZW1lbnQnLFxuICAnbm9icic6ICdIVE1MRWxlbWVudCcsXG4gICdub2VtYmVkJzogJ0hUTUxFbGVtZW50JyxcbiAgJ25vZnJhbWVzJzogJ0hUTUxFbGVtZW50JyxcbiAgJ25vc2NyaXB0JzogJ0hUTUxFbGVtZW50JyxcbiAgJ29iamVjdCc6ICdIVE1MT2JqZWN0RWxlbWVudCcsXG4gICdvbCc6ICdIVE1MT0xpc3RFbGVtZW50JyxcbiAgJ29wdGdyb3VwJzogJ0hUTUxPcHRHcm91cEVsZW1lbnQnLFxuICAnb3B0aW9uJzogJ0hUTUxPcHRpb25FbGVtZW50JyxcbiAgJ291dHB1dCc6ICdIVE1MT3V0cHV0RWxlbWVudCcsXG4gICdwJzogJ0hUTUxQYXJhZ3JhcGhFbGVtZW50JyxcbiAgJ3BhcmFtJzogJ0hUTUxQYXJhbUVsZW1lbnQnLFxuICAncHJlJzogJ0hUTUxQcmVFbGVtZW50JyxcbiAgJ3Byb2dyZXNzJzogJ0hUTUxQcm9ncmVzc0VsZW1lbnQnLFxuICAncSc6ICdIVE1MUXVvdGVFbGVtZW50JyxcbiAgJ3MnOiAnSFRNTEVsZW1lbnQnLFxuICAnc2FtcCc6ICdIVE1MRWxlbWVudCcsXG4gICdzY3JpcHQnOiAnSFRNTFNjcmlwdEVsZW1lbnQnLFxuICAnc2VjdGlvbic6ICdIVE1MRWxlbWVudCcsXG4gICdzZWxlY3QnOiAnSFRNTFNlbGVjdEVsZW1lbnQnLFxuICAnc21hbGwnOiAnSFRNTEVsZW1lbnQnLFxuICAnc291cmNlJzogJ0hUTUxTb3VyY2VFbGVtZW50JyxcbiAgJ3NwYW4nOiAnSFRNTFNwYW5FbGVtZW50JyxcbiAgJ3N0cmlrZSc6ICdIVE1MRWxlbWVudCcsXG4gICdzdHJvbmcnOiAnSFRNTEVsZW1lbnQnLFxuICAnc3R5bGUnOiAnSFRNTFN0eWxlRWxlbWVudCcsXG4gICdzdWInOiAnSFRNTEVsZW1lbnQnLFxuICAnc3VtbWFyeSc6ICdIVE1MRWxlbWVudCcsXG4gICdzdXAnOiAnSFRNTEVsZW1lbnQnLFxuICAndGFibGUnOiAnSFRNTFRhYmxlRWxlbWVudCcsXG4gICd0Ym9keSc6ICdIVE1MVGFibGVTZWN0aW9uRWxlbWVudCcsXG4gICd0ZCc6ICdIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQnLFxuICAndGV4dGFyZWEnOiAnSFRNTFRleHRBcmVhRWxlbWVudCcsXG4gICd0Zm9vdCc6ICdIVE1MVGFibGVTZWN0aW9uRWxlbWVudCcsXG4gICd0aCc6ICdIVE1MVGFibGVIZWFkZXJDZWxsRWxlbWVudCcsXG4gICd0aGVhZCc6ICdIVE1MVGFibGVTZWN0aW9uRWxlbWVudCcsXG4gICd0aW1lJzogJ0hUTUxUaW1lRWxlbWVudCcsXG4gICd0aXRsZSc6ICdIVE1MVGl0bGVFbGVtZW50JyxcbiAgJ3RyJzogJ0hUTUxUYWJsZVJvd0VsZW1lbnQnLFxuICAndHJhY2snOiAnSFRNTFRyYWNrRWxlbWVudCcsXG4gICd0dCc6ICdIVE1MRWxlbWVudCcsXG4gICd1JzogJ0hUTUxFbGVtZW50JyxcbiAgJ3VsJzogJ0hUTUxVTGlzdEVsZW1lbnQnLFxuICAndmFyJzogJ0hUTUxFbGVtZW50JyxcbiAgJ3ZpZGVvJzogJ0hUTUxWaWRlb0VsZW1lbnQnLFxuICAnd2JyJzogJ0hUTUxFbGVtZW50J1xufTtcbmh0bWw0WyAnRUxFTUVOVF9ET01fSU5URVJGQUNFUycgXSA9IGh0bWw0LkVMRU1FTlRfRE9NX0lOVEVSRkFDRVM7XG5odG1sNC51ZWZmZWN0cyA9IHtcbiAgJ05PVF9MT0FERUQnOiAwLFxuICAnU0FNRV9ET0NVTUVOVCc6IDEsXG4gICdORVdfRE9DVU1FTlQnOiAyXG59O1xuaHRtbDRbICd1ZWZmZWN0cycgXSA9IGh0bWw0LnVlZmZlY3RzO1xuaHRtbDQuVVJJRUZGRUNUUyA9IHtcbiAgJ2E6OmhyZWYnOiAyLFxuICAnYXJlYTo6aHJlZic6IDIsXG4gICdibG9ja3F1b3RlOjpjaXRlJzogMCxcbiAgJ2NvbW1hbmQ6Omljb24nOiAxLFxuICAnZGVsOjpjaXRlJzogMCxcbiAgJ2Zvcm06OmFjdGlvbic6IDIsXG4gICdpbWc6OnNyYyc6IDEsXG4gICdpbnB1dDo6c3JjJzogMSxcbiAgJ2luczo6Y2l0ZSc6IDAsXG4gICdxOjpjaXRlJzogMCxcbiAgJ3ZpZGVvOjpwb3N0ZXInOiAxXG59O1xuaHRtbDRbICdVUklFRkZFQ1RTJyBdID0gaHRtbDQuVVJJRUZGRUNUUztcbmh0bWw0Lmx0eXBlcyA9IHtcbiAgJ1VOU0FOREJPWEVEJzogMixcbiAgJ1NBTkRCT1hFRCc6IDEsXG4gICdEQVRBJzogMFxufTtcbmh0bWw0WyAnbHR5cGVzJyBdID0gaHRtbDQubHR5cGVzO1xuaHRtbDQuTE9BREVSVFlQRVMgPSB7XG4gICdhOjpocmVmJzogMixcbiAgJ2FyZWE6OmhyZWYnOiAyLFxuICAnYmxvY2txdW90ZTo6Y2l0ZSc6IDIsXG4gICdjb21tYW5kOjppY29uJzogMSxcbiAgJ2RlbDo6Y2l0ZSc6IDIsXG4gICdmb3JtOjphY3Rpb24nOiAyLFxuICAnaW1nOjpzcmMnOiAxLFxuICAnaW5wdXQ6OnNyYyc6IDEsXG4gICdpbnM6OmNpdGUnOiAyLFxuICAncTo6Y2l0ZSc6IDIsXG4gICd2aWRlbzo6cG9zdGVyJzogMVxufTtcbmh0bWw0WyAnTE9BREVSVFlQRVMnIF0gPSBodG1sNC5MT0FERVJUWVBFUztcblxuLy8gQ29weXJpZ2h0IChDKSAyMDA2IEdvb2dsZSBJbmMuXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiBBbiBIVE1MIHNhbml0aXplciB0aGF0IGNhbiBzYXRpc2Z5IGEgdmFyaWV0eSBvZiBzZWN1cml0eSBwb2xpY2llcy5cbiAqXG4gKiA8cD5cbiAqIFRoZSBIVE1MIHNhbml0aXplciBpcyBidWlsdCBhcm91bmQgYSBTQVggcGFyc2VyIGFuZCBIVE1MIGVsZW1lbnQgYW5kXG4gKiBhdHRyaWJ1dGVzIHNjaGVtYXMuXG4gKlxuICogSWYgdGhlIGNzc3BhcnNlciBpcyBsb2FkZWQsIGlubGluZSBzdHlsZXMgYXJlIHNhbml0aXplZCB1c2luZyB0aGVcbiAqIGNzcyBwcm9wZXJ0eSBhbmQgdmFsdWUgc2NoZW1hcy4gIEVsc2UgdGhleSBhcmUgcmVtb3ZlIGR1cmluZ1xuICogc2FuaXRpemF0aW9uLlxuICpcbiAqIElmIGl0IGV4aXN0cywgdXNlcyBwYXJzZUNzc0RlY2xhcmF0aW9ucywgc2FuaXRpemVDc3NQcm9wZXJ0eSwgIGNzc1NjaGVtYVxuICpcbiAqIEBhdXRob3IgbWlrZXNhbXVlbEBnbWFpbC5jb21cbiAqIEBhdXRob3IgamFzdmlyQGdtYWlsLmNvbVxuICogXFxAcmVxdWlyZXMgaHRtbDQsIFVSSVxuICogXFxAb3ZlcnJpZGVzIHdpbmRvd1xuICogXFxAcHJvdmlkZXMgaHRtbCwgaHRtbF9zYW5pdGl6ZVxuICovXG5cbi8vIFRoZSBUdXJraXNoIGkgc2VlbXMgdG8gYmUgYSBub24taXNzdWUsIGJ1dCBhYm9ydCBpbiBjYXNlIGl0IGlzLlxuaWYgKCdJJy50b0xvd2VyQ2FzZSgpICE9PSAnaScpIHsgdGhyb3cgJ0kvaSBwcm9ibGVtJzsgfVxuXG4vKipcbiAqIFxcQG5hbWVzcGFjZVxuICovXG52YXIgaHRtbCA9IChmdW5jdGlvbihodG1sNCkge1xuXG4gIC8vIEZvciBjbG9zdXJlIGNvbXBpbGVyXG4gIHZhciBwYXJzZUNzc0RlY2xhcmF0aW9ucywgc2FuaXRpemVDc3NQcm9wZXJ0eSwgY3NzU2NoZW1hO1xuICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cpIHtcbiAgICBwYXJzZUNzc0RlY2xhcmF0aW9ucyA9IHdpbmRvd1sncGFyc2VDc3NEZWNsYXJhdGlvbnMnXTtcbiAgICBzYW5pdGl6ZUNzc1Byb3BlcnR5ID0gd2luZG93WydzYW5pdGl6ZUNzc1Byb3BlcnR5J107XG4gICAgY3NzU2NoZW1hID0gd2luZG93Wydjc3NTY2hlbWEnXTtcbiAgfVxuXG4gIC8vIFRoZSBrZXlzIG9mIHRoaXMgb2JqZWN0IG11c3QgYmUgJ3F1b3RlZCcgb3IgSlNDb21waWxlciB3aWxsIG1hbmdsZSB0aGVtIVxuICAvLyBUaGlzIGlzIGEgcGFydGlhbCBsaXN0IC0tIGxvb2t1cEVudGl0eSgpIHVzZXMgdGhlIGhvc3QgYnJvd3NlcidzIHBhcnNlclxuICAvLyAod2hlbiBhdmFpbGFibGUpIHRvIGltcGxlbWVudCBmdWxsIGVudGl0eSBsb29rdXAuXG4gIC8vIE5vdGUgdGhhdCBlbnRpdGllcyBhcmUgaW4gZ2VuZXJhbCBjYXNlLXNlbnNpdGl2ZTsgdGhlIHVwcGVyY2FzZSBvbmVzIGFyZVxuICAvLyBleHBsaWNpdGx5IGRlZmluZWQgYnkgSFRNTDUgKHByZXN1bWFibHkgYXMgY29tcGF0aWJpbGl0eSkuXG4gIHZhciBFTlRJVElFUyA9IHtcbiAgICAnbHQnOiAnPCcsXG4gICAgJ0xUJzogJzwnLFxuICAgICdndCc6ICc+JyxcbiAgICAnR1QnOiAnPicsXG4gICAgJ2FtcCc6ICcmJyxcbiAgICAnQU1QJzogJyYnLFxuICAgICdxdW90JzogJ1wiJyxcbiAgICAnYXBvcyc6ICdcXCcnLFxuICAgICduYnNwJzogJ1xcMjQwJ1xuICB9O1xuXG4gIC8vIFBhdHRlcm5zIGZvciB0eXBlcyBvZiBlbnRpdHkvY2hhcmFjdGVyIHJlZmVyZW5jZSBuYW1lcy5cbiAgdmFyIGRlY2ltYWxFc2NhcGVSZSA9IC9eIyhcXGQrKSQvO1xuICB2YXIgaGV4RXNjYXBlUmUgPSAvXiN4KFswLTlBLUZhLWZdKykkLztcbiAgLy8gY29udGFpbnMgZXZlcnkgZW50aXR5IHBlciBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDExL1dELWh0bWw1LTIwMTEwMTEzL25hbWVkLWNoYXJhY3Rlci1yZWZlcmVuY2VzLmh0bWxcbiAgdmFyIHNhZmVFbnRpdHlOYW1lUmUgPSAvXltBLVphLXpdW0EtemEtejAtOV0rJC87XG4gIC8vIFVzZWQgYXMgYSBob29rIHRvIGludm9rZSB0aGUgYnJvd3NlcidzIGVudGl0eSBwYXJzaW5nLiA8dGV4dGFyZWE+IGlzIHVzZWRcbiAgLy8gYmVjYXVzZSBpdHMgY29udGVudCBpcyBwYXJzZWQgZm9yIGVudGl0aWVzIGJ1dCBub3QgdGFncy5cbiAgLy8gVE9ETyhrcHJlaWQpOiBUaGlzIHJldHJpZXZhbCBpcyBhIGtsdWRnZSBhbmQgbGVhZHMgdG8gc2lsZW50IGxvc3Mgb2ZcbiAgLy8gZnVuY3Rpb25hbGl0eSBpZiB0aGUgZG9jdW1lbnQgaXNuJ3QgYXZhaWxhYmxlLlxuICB2YXIgZW50aXR5TG9va3VwRWxlbWVudCA9XG4gICAgICAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cgJiYgd2luZG93Wydkb2N1bWVudCddKVxuICAgICAgICAgID8gd2luZG93Wydkb2N1bWVudCddLmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJykgOiBudWxsO1xuICAvKipcbiAgICogRGVjb2RlcyBhbiBIVE1MIGVudGl0eS5cbiAgICpcbiAgICoge1xcQHVwZG9jXG4gICAqICQgbG9va3VwRW50aXR5KCdsdCcpXG4gICAqICMgJzwnXG4gICAqICQgbG9va3VwRW50aXR5KCdHVCcpXG4gICAqICMgJz4nXG4gICAqICQgbG9va3VwRW50aXR5KCdhbXAnKVxuICAgKiAjICcmJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgnbmJzcCcpXG4gICAqICMgJ1xceEEwJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgnYXBvcycpXG4gICAqICMgXCInXCJcbiAgICogJCBsb29rdXBFbnRpdHkoJ3F1b3QnKVxuICAgKiAjICdcIidcbiAgICogJCBsb29rdXBFbnRpdHkoJyN4YScpXG4gICAqICMgJ1xcbidcbiAgICogJCBsb29rdXBFbnRpdHkoJyMxMCcpXG4gICAqICMgJ1xcbidcbiAgICogJCBsb29rdXBFbnRpdHkoJyN4MGEnKVxuICAgKiAjICdcXG4nXG4gICAqICQgbG9va3VwRW50aXR5KCcjMDEwJylcbiAgICogIyAnXFxuJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgnI3gwMEEnKVxuICAgKiAjICdcXG4nXG4gICAqICQgbG9va3VwRW50aXR5KCdQaScpICAgICAgLy8gS25vd24gZmFpbHVyZVxuICAgKiAjICdcXHUwM0EwJ1xuICAgKiAkIGxvb2t1cEVudGl0eSgncGknKSAgICAgIC8vIEtub3duIGZhaWx1cmVcbiAgICogIyAnXFx1MDNDMCdcbiAgICogfVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgY29udGVudCBiZXR3ZWVuIHRoZSAnJicgYW5kIHRoZSAnOycuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gYSBzaW5nbGUgdW5pY29kZSBjb2RlLXBvaW50IGFzIGEgc3RyaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gbG9va3VwRW50aXR5KG5hbWUpIHtcbiAgICAvLyBUT0RPOiBlbnRpdHkgbG9va3VwIGFzIHNwZWNpZmllZCBieSBIVE1MNSBhY3R1YWxseSBkZXBlbmRzIG9uIHRoZVxuICAgIC8vIHByZXNlbmNlIG9mIHRoZSBcIjtcIi5cbiAgICBpZiAoRU5USVRJRVMuaGFzT3duUHJvcGVydHkobmFtZSkpIHsgcmV0dXJuIEVOVElUSUVTW25hbWVdOyB9XG4gICAgdmFyIG0gPSBuYW1lLm1hdGNoKGRlY2ltYWxFc2NhcGVSZSk7XG4gICAgaWYgKG0pIHtcbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG1bMV0sIDEwKSk7XG4gICAgfSBlbHNlIGlmICghIShtID0gbmFtZS5tYXRjaChoZXhFc2NhcGVSZSkpKSB7XG4gICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChtWzFdLCAxNikpO1xuICAgIH0gZWxzZSBpZiAoZW50aXR5TG9va3VwRWxlbWVudCAmJiBzYWZlRW50aXR5TmFtZVJlLnRlc3QobmFtZSkpIHtcbiAgICAgIGVudGl0eUxvb2t1cEVsZW1lbnQuaW5uZXJIVE1MID0gJyYnICsgbmFtZSArICc7JztcbiAgICAgIHZhciB0ZXh0ID0gZW50aXR5TG9va3VwRWxlbWVudC50ZXh0Q29udGVudDtcbiAgICAgIEVOVElUSUVTW25hbWVdID0gdGV4dDtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyYnICsgbmFtZSArICc7JztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGVPbmVFbnRpdHkoXywgbmFtZSkge1xuICAgIHJldHVybiBsb29rdXBFbnRpdHkobmFtZSk7XG4gIH1cblxuICB2YXIgbnVsUmUgPSAvXFwwL2c7XG4gIGZ1bmN0aW9uIHN0cmlwTlVMcyhzKSB7XG4gICAgcmV0dXJuIHMucmVwbGFjZShudWxSZSwgJycpO1xuICB9XG5cbiAgdmFyIEVOVElUWV9SRV8xID0gLyYoI1swLTldK3wjW3hYXVswLTlBLUZhLWZdK3xcXHcrKTsvZztcbiAgdmFyIEVOVElUWV9SRV8yID0gL14oI1swLTldK3wjW3hYXVswLTlBLUZhLWZdK3xcXHcrKTsvO1xuICAvKipcbiAgICogVGhlIHBsYWluIHRleHQgb2YgYSBjaHVuayBvZiBIVE1MIENEQVRBIHdoaWNoIHBvc3NpYmx5IGNvbnRhaW5pbmcuXG4gICAqXG4gICAqIHtcXEB1cGRvY1xuICAgKiAkIHVuZXNjYXBlRW50aXRpZXMoJycpXG4gICAqICMgJydcbiAgICogJCB1bmVzY2FwZUVudGl0aWVzKCdoZWxsbyBXb3JsZCEnKVxuICAgKiAjICdoZWxsbyBXb3JsZCEnXG4gICAqICQgdW5lc2NhcGVFbnRpdGllcygnMSAmbHQ7IDIgJmFtcDsmQU1QOyA0ICZndDsgMyYjMTA7JylcbiAgICogIyAnMSA8IDIgJiYgNCA+IDNcXG4nXG4gICAqICQgdW5lc2NhcGVFbnRpdGllcygnJmx0OyZsdCA8LSB1bmZpbmlzaGVkIGVudGl0eSZndDsnKVxuICAgKiAjICc8Jmx0IDwtIHVuZmluaXNoZWQgZW50aXR5PidcbiAgICogJCB1bmVzY2FwZUVudGl0aWVzKCcvZm9vP2Jhcj1iYXomY29weT10cnVlJykgIC8vICYgb2Z0ZW4gdW5lc2NhcGVkIGluIFVSTFNcbiAgICogIyAnL2Zvbz9iYXI9YmF6JmNvcHk9dHJ1ZSdcbiAgICogJCB1bmVzY2FwZUVudGl0aWVzKCdwaT0mcGk7JiN4M2MwOywgUGk9JlBpO1xcdTAzQTAnKSAvLyBGSVhNRToga25vd24gZmFpbHVyZVxuICAgKiAjICdwaT1cXHUwM0MwXFx1MDNjMCwgUGk9XFx1MDNBMFxcdTAzQTAnXG4gICAqIH1cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHMgYSBjaHVuayBvZiBIVE1MIENEQVRBLiAgSXQgbXVzdCBub3Qgc3RhcnQgb3IgZW5kIGluc2lkZVxuICAgKiAgICAgYW4gSFRNTCBlbnRpdHkuXG4gICAqL1xuICBmdW5jdGlvbiB1bmVzY2FwZUVudGl0aWVzKHMpIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKEVOVElUWV9SRV8xLCBkZWNvZGVPbmVFbnRpdHkpO1xuICB9XG5cbiAgdmFyIGFtcFJlID0gLyYvZztcbiAgdmFyIGxvb3NlQW1wUmUgPSAvJihbXmEteiNdfCMoPzpbXjAtOXhdfHgoPzpbXjAtOWEtZl18JCl8JCl8JCkvZ2k7XG4gIHZhciBsdFJlID0gL1s8XS9nO1xuICB2YXIgZ3RSZSA9IC8+L2c7XG4gIHZhciBxdW90UmUgPSAvXFxcIi9nO1xuXG4gIC8qKlxuICAgKiBFc2NhcGVzIEhUTUwgc3BlY2lhbCBjaGFyYWN0ZXJzIGluIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAqXG4gICAqIHtcXEB1cGRvY1xuICAgKiAkIGVzY2FwZUF0dHJpYignJylcbiAgICogIyAnJ1xuICAgKiAkIGVzY2FwZUF0dHJpYignXCI8PCY9PSY+PlwiJykgIC8vIERvIG5vdCBqdXN0IGVzY2FwZSB0aGUgZmlyc3Qgb2NjdXJyZW5jZS5cbiAgICogIyAnJiMzNDsmbHQ7Jmx0OyZhbXA7JiM2MTsmIzYxOyZhbXA7Jmd0OyZndDsmIzM0OydcbiAgICogJCBlc2NhcGVBdHRyaWIoJ0hlbGxvIDxXb3JsZD4hJylcbiAgICogIyAnSGVsbG8gJmx0O1dvcmxkJmd0OyEnXG4gICAqIH1cbiAgICovXG4gIGZ1bmN0aW9uIGVzY2FwZUF0dHJpYihzKSB7XG4gICAgcmV0dXJuICgnJyArIHMpLnJlcGxhY2UoYW1wUmUsICcmYW1wOycpLnJlcGxhY2UobHRSZSwgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZShndFJlLCAnJmd0OycpLnJlcGxhY2UocXVvdFJlLCAnJiMzNDsnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc2NhcGUgZW50aXRpZXMgaW4gUkNEQVRBIHRoYXQgY2FuIGJlIGVzY2FwZWQgd2l0aG91dCBjaGFuZ2luZyB0aGUgbWVhbmluZy5cbiAgICoge1xcQHVwZG9jXG4gICAqICQgbm9ybWFsaXplUkNEYXRhKCcxIDwgMiAmJmFtcDsgMyA+IDQgJmFtcDsmIDUgJmx0OyA3JjgnKVxuICAgKiAjICcxICZsdDsgMiAmYW1wOyZhbXA7IDMgJmd0OyA0ICZhbXA7JmFtcDsgNSAmbHQ7IDcmYW1wOzgnXG4gICAqIH1cbiAgICovXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVJDRGF0YShyY2RhdGEpIHtcbiAgICByZXR1cm4gcmNkYXRhXG4gICAgICAgIC5yZXBsYWNlKGxvb3NlQW1wUmUsICcmYW1wOyQxJylcbiAgICAgICAgLnJlcGxhY2UobHRSZSwgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZShndFJlLCAnJmd0OycpO1xuICB9XG5cbiAgLy8gVE9ETyhmZWxpeDhhKTogdmFsaWRhdGUgc2FuaXRpemVyIHJlZ2V4cyBhZ2FpbnN0IHRoZSBIVE1MNSBncmFtbWFyIGF0XG4gIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3N5bnRheC5odG1sXG4gIC8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3BhcnNpbmcuaHRtbFxuICAvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90b2tlbml6YXRpb24uaHRtbFxuICAvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90cmVlLWNvbnN0cnVjdGlvbi5odG1sXG5cbiAgLy8gV2UgaW5pdGlhbGx5IHNwbGl0IGlucHV0IHNvIHRoYXQgcG90ZW50aWFsbHkgbWVhbmluZ2Z1bCBjaGFyYWN0ZXJzXG4gIC8vIGxpa2UgJzwnIGFuZCAnPicgYXJlIHNlcGFyYXRlIHRva2VucywgdXNpbmcgYSBmYXN0IGR1bWIgcHJvY2VzcyB0aGF0XG4gIC8vIGlnbm9yZXMgcXVvdGluZy4gIFRoZW4gd2Ugd2FsayB0aGF0IHRva2VuIHN0cmVhbSwgYW5kIHdoZW4gd2Ugc2VlIGFcbiAgLy8gJzwnIHRoYXQncyB0aGUgc3RhcnQgb2YgYSB0YWcsIHdlIHVzZSBBVFRSX1JFIHRvIGV4dHJhY3QgdGFnXG4gIC8vIGF0dHJpYnV0ZXMgZnJvbSB0aGUgbmV4dCB0b2tlbi4gIFRoYXQgdG9rZW4gd2lsbCBuZXZlciBoYXZlIGEgJz4nXG4gIC8vIGNoYXJhY3Rlci4gIEhvd2V2ZXIsIGl0IG1pZ2h0IGhhdmUgYW4gdW5iYWxhbmNlZCBxdW90ZSBjaGFyYWN0ZXIsIGFuZFxuICAvLyB3aGVuIHdlIHNlZSB0aGF0LCB3ZSBjb21iaW5lIGFkZGl0aW9uYWwgdG9rZW5zIHRvIGJhbGFuY2UgdGhlIHF1b3RlLlxuXG4gIHZhciBBVFRSX1JFID0gbmV3IFJlZ0V4cChcbiAgICAnXlxcXFxzKicgK1xuICAgICcoWy0uOlxcXFx3XSspJyArICAgICAgICAgICAgIC8vIDEgPSBBdHRyaWJ1dGUgbmFtZVxuICAgICcoPzonICsgKFxuICAgICAgJ1xcXFxzKig9KVxcXFxzKicgKyAgICAgICAgICAgLy8gMiA9IElzIHRoZXJlIGEgdmFsdWU/XG4gICAgICAnKCcgKyAoICAgICAgICAgICAgICAgICAgIC8vIDMgPSBBdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgLy8gVE9ETyhmZWxpeDhhKTogbWF5YmUgdXNlIGJhY2tyZWYgdG8gbWF0Y2ggcXVvdGVzXG4gICAgICAgICcoXFxcIilbXlxcXCJdKihcXFwifCQpJyArICAgIC8vIDQsIDUgPSBEb3VibGUtcXVvdGVkIHN0cmluZ1xuICAgICAgICAnfCcgK1xuICAgICAgICAnKFxcJylbXlxcJ10qKFxcJ3wkKScgKyAgICAvLyA2LCA3ID0gU2luZ2xlLXF1b3RlZCBzdHJpbmdcbiAgICAgICAgJ3wnICtcbiAgICAgICAgLy8gUG9zaXRpdmUgbG9va2FoZWFkIHRvIHByZXZlbnQgaW50ZXJwcmV0YXRpb24gb2ZcbiAgICAgICAgLy8gPGZvbyBhPSBiPWM+IGFzIDxmb28gYT0nYj1jJz5cbiAgICAgICAgLy8gVE9ETyhmZWxpeDhhKTogbWlnaHQgYmUgYWJsZSB0byBkcm9wIHRoaXMgY2FzZVxuICAgICAgICAnKD89W2Etel1bLVxcXFx3XSpcXFxccyo9KScgK1xuICAgICAgICAnfCcgK1xuICAgICAgICAvLyBVbnF1b3RlZCB2YWx1ZSB0aGF0IGlzbid0IGFuIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgIC8vIChzaW5jZSB3ZSBkaWRuJ3QgbWF0Y2ggdGhlIHBvc2l0aXZlIGxvb2thaGVhZCBhYm92ZSlcbiAgICAgICAgJ1teXFxcIlxcJ1xcXFxzXSonICkgK1xuICAgICAgJyknICkgK1xuICAgICcpPycsXG4gICAgJ2knKTtcblxuICAvLyBmYWxzZSBvbiBJRTw9OCwgdHJ1ZSBvbiBtb3N0IG90aGVyIGJyb3dzZXJzXG4gIHZhciBzcGxpdFdpbGxDYXB0dXJlID0gKCdhLGInLnNwbGl0KC8oLCkvKS5sZW5ndGggPT09IDMpO1xuXG4gIC8vIGJpdG1hc2sgZm9yIHRhZ3Mgd2l0aCBzcGVjaWFsIHBhcnNpbmcsIGxpa2UgPHNjcmlwdD4gYW5kIDx0ZXh0YXJlYT5cbiAgdmFyIEVGTEFHU19URVhUID0gaHRtbDQuZWZsYWdzWydDREFUQSddIHwgaHRtbDQuZWZsYWdzWydSQ0RBVEEnXTtcblxuICAvKipcbiAgICogR2l2ZW4gYSBTQVgtbGlrZSBldmVudCBoYW5kbGVyLCBwcm9kdWNlIGEgZnVuY3Rpb24gdGhhdCBmZWVkcyB0aG9zZVxuICAgKiBldmVudHMgYW5kIGEgcGFyYW1ldGVyIHRvIHRoZSBldmVudCBoYW5kbGVyLlxuICAgKlxuICAgKiBUaGUgZXZlbnQgaGFuZGxlciBoYXMgdGhlIGZvcm06e0Bjb2RlXG4gICAqIHtcbiAgICogICAvLyBOYW1lIGlzIGFuIHVwcGVyLWNhc2UgSFRNTCB0YWcgbmFtZS4gIEF0dHJpYnMgaXMgYW4gYXJyYXkgb2ZcbiAgICogICAvLyBhbHRlcm5hdGluZyB1cHBlci1jYXNlIGF0dHJpYnV0ZSBuYW1lcywgYW5kIGF0dHJpYnV0ZSB2YWx1ZXMuICBUaGVcbiAgICogICAvLyBhdHRyaWJzIGFycmF5IGlzIHJldXNlZCBieSB0aGUgcGFyc2VyLiAgUGFyYW0gaXMgdGhlIHZhbHVlIHBhc3NlZCB0b1xuICAgKiAgIC8vIHRoZSBzYXhQYXJzZXIuXG4gICAqICAgc3RhcnRUYWc6IGZ1bmN0aW9uIChuYW1lLCBhdHRyaWJzLCBwYXJhbSkgeyAuLi4gfSxcbiAgICogICBlbmRUYWc6ICAgZnVuY3Rpb24gKG5hbWUsIHBhcmFtKSB7IC4uLiB9LFxuICAgKiAgIHBjZGF0YTogICBmdW5jdGlvbiAodGV4dCwgcGFyYW0pIHsgLi4uIH0sXG4gICAqICAgcmNkYXRhOiAgIGZ1bmN0aW9uICh0ZXh0LCBwYXJhbSkgeyAuLi4gfSxcbiAgICogICBjZGF0YTogICAgZnVuY3Rpb24gKHRleHQsIHBhcmFtKSB7IC4uLiB9LFxuICAgKiAgIHN0YXJ0RG9jOiBmdW5jdGlvbiAocGFyYW0pIHsgLi4uIH0sXG4gICAqICAgZW5kRG9jOiAgIGZ1bmN0aW9uIChwYXJhbSkgeyAuLi4gfVxuICAgKiB9fVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gaGFuZGxlciBhIHJlY29yZCBjb250YWluaW5nIGV2ZW50IGhhbmRsZXJzLlxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbihzdHJpbmcsIE9iamVjdCl9IEEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIGNodW5rIG9mIEhUTUxcbiAgICogICAgIGFuZCBhIHBhcmFtZXRlci4gIFRoZSBwYXJhbWV0ZXIgaXMgcGFzc2VkIG9uIHRvIHRoZSBoYW5kbGVyIG1ldGhvZHMuXG4gICAqL1xuICBmdW5jdGlvbiBtYWtlU2F4UGFyc2VyKGhhbmRsZXIpIHtcbiAgICAvLyBBY2NlcHQgcXVvdGVkIG9yIHVucXVvdGVkIGtleXMgKENsb3N1cmUgY29tcGF0KVxuICAgIHZhciBoY29weSA9IHtcbiAgICAgIGNkYXRhOiBoYW5kbGVyLmNkYXRhIHx8IGhhbmRsZXJbJ2NkYXRhJ10sXG4gICAgICBjb21tZW50OiBoYW5kbGVyLmNvbW1lbnQgfHwgaGFuZGxlclsnY29tbWVudCddLFxuICAgICAgZW5kRG9jOiBoYW5kbGVyLmVuZERvYyB8fCBoYW5kbGVyWydlbmREb2MnXSxcbiAgICAgIGVuZFRhZzogaGFuZGxlci5lbmRUYWcgfHwgaGFuZGxlclsnZW5kVGFnJ10sXG4gICAgICBwY2RhdGE6IGhhbmRsZXIucGNkYXRhIHx8IGhhbmRsZXJbJ3BjZGF0YSddLFxuICAgICAgcmNkYXRhOiBoYW5kbGVyLnJjZGF0YSB8fCBoYW5kbGVyWydyY2RhdGEnXSxcbiAgICAgIHN0YXJ0RG9jOiBoYW5kbGVyLnN0YXJ0RG9jIHx8IGhhbmRsZXJbJ3N0YXJ0RG9jJ10sXG4gICAgICBzdGFydFRhZzogaGFuZGxlci5zdGFydFRhZyB8fCBoYW5kbGVyWydzdGFydFRhZyddXG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oaHRtbFRleHQsIHBhcmFtKSB7XG4gICAgICByZXR1cm4gcGFyc2UoaHRtbFRleHQsIGhjb3B5LCBwYXJhbSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFBhcnNpbmcgc3RyYXRlZ3kgaXMgdG8gc3BsaXQgaW5wdXQgaW50byBwYXJ0cyB0aGF0IG1pZ2h0IGJlIGxleGljYWxseVxuICAvLyBtZWFuaW5nZnVsIChldmVyeSBcIj5cIiBiZWNvbWVzIGEgc2VwYXJhdGUgcGFydCksIGFuZCB0aGVuIHJlY29tYmluZVxuICAvLyBwYXJ0cyBpZiB3ZSBkaXNjb3ZlciB0aGV5J3JlIGluIGEgZGlmZmVyZW50IGNvbnRleHQuXG5cbiAgLy8gVE9ETyhmZWxpeDhhKTogU2lnbmlmaWNhbnQgcGVyZm9ybWFuY2UgcmVncmVzc2lvbnMgZnJvbSAtbGVnYWN5LFxuICAvLyB0ZXN0ZWQgb25cbiAgLy8gICAgQ2hyb21lIDE4LjBcbiAgLy8gICAgRmlyZWZveCAxMS4wXG4gIC8vICAgIElFIDYsIDcsIDgsIDlcbiAgLy8gICAgT3BlcmEgMTEuNjFcbiAgLy8gICAgU2FmYXJpIDUuMS4zXG4gIC8vIE1hbnkgb2YgdGhlc2UgYXJlIHVudXN1YWwgcGF0dGVybnMgdGhhdCBhcmUgbGluZWFybHkgc2xvd2VyIGFuZCBzdGlsbFxuICAvLyBwcmV0dHkgZmFzdCAoZWcgMW1zIHRvIDVtcyksIHNvIG5vdCBuZWNlc3NhcmlseSB3b3J0aCBmaXhpbmcuXG5cbiAgLy8gVE9ETyhmZWxpeDhhKTogXCI8c2NyaXB0PiAmJiAmJiAmJiAuLi4gPFxcL3NjcmlwdD5cIiBpcyBzbG93ZXIgb24gYWxsXG4gIC8vIGJyb3dzZXJzLiAgVGhlIGhvdHNwb3QgaXMgaHRtbFNwbGl0LlxuXG4gIC8vIFRPRE8oZmVsaXg4YSk6IFwiPHAgdGl0bGU9Jz4+Pj4uLi4nPjxcXC9wPlwiIGlzIHNsb3dlciBvbiBhbGwgYnJvd3NlcnMuXG4gIC8vIFRoaXMgaXMgcGFydGx5IGh0bWxTcGxpdCwgYnV0IHRoZSBob3RzcG90IGlzIHBhcnNlVGFnQW5kQXR0cnMuXG5cbiAgLy8gVE9ETyhmZWxpeDhhKTogXCI8YT48XFwvYT48YT48XFwvYT4uLi5cIiBpcyBzbG93ZXIgb24gSUU5LlxuICAvLyBcIjxhPjE8XFwvYT48YT4xPFxcL2E+Li4uXCIgaXMgZmFzdGVyLCBcIjxhPjxcXC9hPjI8YT48XFwvYT4yLi4uXCIgaXMgZmFzdGVyLlxuXG4gIC8vIFRPRE8oZmVsaXg4YSk6IFwiPHA8cDxwLi4uXCIgaXMgc2xvd2VyIG9uIElFWzYtOF1cblxuICB2YXIgY29udGludWF0aW9uTWFya2VyID0ge307XG4gIGZ1bmN0aW9uIHBhcnNlKGh0bWxUZXh0LCBoYW5kbGVyLCBwYXJhbSkge1xuICAgIHZhciBtLCBwLCB0YWdOYW1lO1xuICAgIHZhciBwYXJ0cyA9IGh0bWxTcGxpdChodG1sVGV4dCk7XG4gICAgdmFyIHN0YXRlID0ge1xuICAgICAgbm9Nb3JlR1Q6IGZhbHNlLFxuICAgICAgbm9Nb3JlRW5kQ29tbWVudHM6IGZhbHNlXG4gICAgfTtcbiAgICBwYXJzZUNQUyhoYW5kbGVyLCBwYXJ0cywgMCwgc3RhdGUsIHBhcmFtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBpbml0aWFsLCBzdGF0ZSwgcGFyYW0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcGFyc2VDUFMoaCwgcGFydHMsIGluaXRpYWwsIHN0YXRlLCBwYXJhbSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlQ1BTKGgsIHBhcnRzLCBpbml0aWFsLCBzdGF0ZSwgcGFyYW0pIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGguc3RhcnREb2MgJiYgaW5pdGlhbCA9PSAwKSB7IGguc3RhcnREb2MocGFyYW0pOyB9XG4gICAgICB2YXIgbSwgcCwgdGFnTmFtZTtcbiAgICAgIGZvciAodmFyIHBvcyA9IGluaXRpYWwsIGVuZCA9IHBhcnRzLmxlbmd0aDsgcG9zIDwgZW5kOykge1xuICAgICAgICB2YXIgY3VycmVudCA9IHBhcnRzW3BvcysrXTtcbiAgICAgICAgdmFyIG5leHQgPSBwYXJ0c1twb3NdO1xuICAgICAgICBzd2l0Y2ggKGN1cnJlbnQpIHtcbiAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgaWYgKEVOVElUWV9SRV8yLnRlc3QobmV4dCkpIHtcbiAgICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgICBoLnBjZGF0YSgnJicgKyBuZXh0LCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChoLnBjZGF0YSkgeyBoLnBjZGF0YShcIiZhbXA7XCIsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc8XFwvJzpcbiAgICAgICAgICBpZiAobSA9IC9eKFstXFx3Ol0rKVteXFwnXFxcIl0qLy5leGVjKG5leHQpKSB7XG4gICAgICAgICAgICBpZiAobVswXS5sZW5ndGggPT09IG5leHQubGVuZ3RoICYmIHBhcnRzW3BvcyArIDFdID09PSAnPicpIHtcbiAgICAgICAgICAgICAgLy8gZmFzdCBjYXNlLCBubyBhdHRyaWJ1dGUgcGFyc2luZyBuZWVkZWRcbiAgICAgICAgICAgICAgcG9zICs9IDI7XG4gICAgICAgICAgICAgIHRhZ05hbWUgPSBtWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgIGlmIChoLmVuZFRhZykge1xuICAgICAgICAgICAgICAgIGguZW5kVGFnKHRhZ05hbWUsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gc2xvdyBjYXNlLCBuZWVkIHRvIHBhcnNlIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgLy8gVE9ETyhmZWxpeDhhKTogZG8gd2UgcmVhbGx5IGNhcmUgYWJvdXQgbWlzcGFyc2luZyB0aGlzP1xuICAgICAgICAgICAgICBwb3MgPSBwYXJzZUVuZFRhZyhcbiAgICAgICAgICAgICAgICBwYXJ0cywgcG9zLCBoLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLCBzdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgICBoLnBjZGF0YSgnJmx0Oy8nLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgaWYgKG0gPSAvXihbLVxcdzpdKylcXHMqXFwvPy8uZXhlYyhuZXh0KSkge1xuICAgICAgICAgICAgaWYgKG1bMF0ubGVuZ3RoID09PSBuZXh0Lmxlbmd0aCAmJiBwYXJ0c1twb3MgKyAxXSA9PT0gJz4nKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgY2FzZSwgbm8gYXR0cmlidXRlIHBhcnNpbmcgbmVlZGVkXG4gICAgICAgICAgICAgIHBvcyArPSAyO1xuICAgICAgICAgICAgICB0YWdOYW1lID0gbVsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICBpZiAoaC5zdGFydFRhZykge1xuICAgICAgICAgICAgICAgIGguc3RhcnRUYWcodGFnTmFtZSwgW10sIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyB0YWdzIGxpa2UgPHNjcmlwdD4gYW5kIDx0ZXh0YXJlYT4gaGF2ZSBzcGVjaWFsIHBhcnNpbmdcbiAgICAgICAgICAgICAgdmFyIGVmbGFncyA9IGh0bWw0LkVMRU1FTlRTW3RhZ05hbWVdO1xuICAgICAgICAgICAgICBpZiAoZWZsYWdzICYgRUZMQUdTX1RFWFQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnID0geyBuYW1lOiB0YWdOYW1lLCBuZXh0OiBwb3MsIGVmbGFnczogZWZsYWdzIH07XG4gICAgICAgICAgICAgICAgcG9zID0gcGFyc2VUZXh0KFxuICAgICAgICAgICAgICAgICAgcGFydHMsIHRhZywgaCwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlciwgc3RhdGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBzbG93IGNhc2UsIG5lZWQgdG8gcGFyc2UgYXR0cmlidXRlc1xuICAgICAgICAgICAgICBwb3MgPSBwYXJzZVN0YXJ0VGFnKFxuICAgICAgICAgICAgICAgIHBhcnRzLCBwb3MsIGgsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsIHN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICAgIGgucGNkYXRhKCcmbHQ7JywgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzxcXCEtLSc6XG4gICAgICAgICAgLy8gVGhlIHBhdGhvbG9naWNhbCBjYXNlIGlzIG4gY29waWVzIG9mICc8XFwhLS0nIHdpdGhvdXQgJy0tPicsIGFuZFxuICAgICAgICAgIC8vIHJlcGVhdGVkIGZhaWx1cmUgdG8gZmluZCAnLS0+JyBpcyBxdWFkcmF0aWMuICBXZSBhdm9pZCB0aGF0IGJ5XG4gICAgICAgICAgLy8gcmVtZW1iZXJpbmcgd2hlbiBzZWFyY2ggZm9yICctLT4nIGZhaWxzLlxuICAgICAgICAgIGlmICghc3RhdGUubm9Nb3JlRW5kQ29tbWVudHMpIHtcbiAgICAgICAgICAgIC8vIEEgY29tbWVudCA8XFwhLS14LS0+IGlzIHNwbGl0IGludG8gdGhyZWUgdG9rZW5zOlxuICAgICAgICAgICAgLy8gICAnPFxcIS0tJywgJ3gtLScsICc+J1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBmaW5kIHRoZSBuZXh0ICc+JyB0b2tlbiB0aGF0IGhhcyBhIHByZWNlZGluZyAnLS0nLlxuICAgICAgICAgICAgLy8gcG9zIGlzIGF0IHRoZSAneC0tJy5cbiAgICAgICAgICAgIGZvciAocCA9IHBvcyArIDE7IHAgPCBlbmQ7IHArKykge1xuICAgICAgICAgICAgICBpZiAocGFydHNbcF0gPT09ICc+JyAmJiAvLS0kLy50ZXN0KHBhcnRzW3AgLSAxXSkpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwIDwgZW5kKSB7XG4gICAgICAgICAgICAgIGlmIChoLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tbWVudCA9IHBhcnRzLnNsaWNlKHBvcywgcCkuam9pbignJyk7XG4gICAgICAgICAgICAgICAgaC5jb21tZW50KFxuICAgICAgICAgICAgICAgICAgY29tbWVudC5zdWJzdHIoMCwgY29tbWVudC5sZW5ndGggLSAyKSwgcGFyYW0sXG4gICAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcCArIDEsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBvcyA9IHAgKyAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RhdGUubm9Nb3JlRW5kQ29tbWVudHMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RhdGUubm9Nb3JlRW5kQ29tbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgICBoLnBjZGF0YSgnJmx0OyEtLScsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsXG4gICAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc8XFwhJzpcbiAgICAgICAgICBpZiAoIS9eXFx3Ly50ZXN0KG5leHQpKSB7XG4gICAgICAgICAgICBpZiAoaC5wY2RhdGEpIHtcbiAgICAgICAgICAgICAgaC5wY2RhdGEoJyZsdDshJywgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2ltaWxhciB0byBub01vcmVFbmRDb21tZW50IGxvZ2ljXG4gICAgICAgICAgICBpZiAoIXN0YXRlLm5vTW9yZUdUKSB7XG4gICAgICAgICAgICAgIGZvciAocCA9IHBvcyArIDE7IHAgPCBlbmQ7IHArKykge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1twXSA9PT0gJz4nKSB7IGJyZWFrOyB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHAgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICBwb3MgPSBwICsgMTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5ub01vcmVHVCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGF0ZS5ub01vcmVHVCkge1xuICAgICAgICAgICAgICBpZiAoaC5wY2RhdGEpIHtcbiAgICAgICAgICAgICAgICBoLnBjZGF0YSgnJmx0OyEnLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzw/JzpcbiAgICAgICAgICAvLyBzaW1pbGFyIHRvIG5vTW9yZUVuZENvbW1lbnQgbG9naWNcbiAgICAgICAgICBpZiAoIXN0YXRlLm5vTW9yZUdUKSB7XG4gICAgICAgICAgICBmb3IgKHAgPSBwb3MgKyAxOyBwIDwgZW5kOyBwKyspIHtcbiAgICAgICAgICAgICAgaWYgKHBhcnRzW3BdID09PSAnPicpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwIDwgZW5kKSB7XG4gICAgICAgICAgICAgIHBvcyA9IHAgKyAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RhdGUubm9Nb3JlR1QgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RhdGUubm9Nb3JlR1QpIHtcbiAgICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgICBoLnBjZGF0YSgnJmx0Oz8nLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwb3MsIHN0YXRlLCBwYXJhbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgaWYgKGgucGNkYXRhKSB7XG4gICAgICAgICAgICBoLnBjZGF0YShcIiZndDtcIiwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmIChoLnBjZGF0YSkge1xuICAgICAgICAgICAgaC5wY2RhdGEoY3VycmVudCwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICAgICAgY29udGludWF0aW9uTWFrZXIoaCwgcGFydHMsIHBvcywgc3RhdGUsIHBhcmFtKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaC5lbmREb2MpIHsgaC5lbmREb2MocGFyYW0pOyB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgIT09IGNvbnRpbnVhdGlvbk1hcmtlcikgeyB0aHJvdyBlOyB9XG4gICAgfVxuICB9XG5cbiAgLy8gU3BsaXQgc3RyIGludG8gcGFydHMgZm9yIHRoZSBodG1sIHBhcnNlci5cbiAgZnVuY3Rpb24gaHRtbFNwbGl0KHN0cikge1xuICAgIC8vIGNhbid0IGhvaXN0IHRoaXMgb3V0IG9mIHRoZSBmdW5jdGlvbiBiZWNhdXNlIG9mIHRoZSByZS5leGVjIGxvb3AuXG4gICAgdmFyIHJlID0gLyg8XFwvfDxcXCEtLXw8WyE/XXxbJjw+XSkvZztcbiAgICBzdHIgKz0gJyc7XG4gICAgaWYgKHNwbGl0V2lsbENhcHR1cmUpIHtcbiAgICAgIHJldHVybiBzdHIuc3BsaXQocmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcGFydHMgPSBbXTtcbiAgICAgIHZhciBsYXN0UG9zID0gMDtcbiAgICAgIHZhciBtO1xuICAgICAgd2hpbGUgKChtID0gcmUuZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xuICAgICAgICBwYXJ0cy5wdXNoKHN0ci5zdWJzdHJpbmcobGFzdFBvcywgbS5pbmRleCkpO1xuICAgICAgICBwYXJ0cy5wdXNoKG1bMF0pO1xuICAgICAgICBsYXN0UG9zID0gbS5pbmRleCArIG1bMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcGFydHMucHVzaChzdHIuc3Vic3RyaW5nKGxhc3RQb3MpKTtcbiAgICAgIHJldHVybiBwYXJ0cztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUVuZFRhZyhwYXJ0cywgcG9zLCBoLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLCBzdGF0ZSkge1xuICAgIHZhciB0YWcgPSBwYXJzZVRhZ0FuZEF0dHJzKHBhcnRzLCBwb3MpO1xuICAgIC8vIGRyb3AgdW5jbG9zZWQgdGFnc1xuICAgIGlmICghdGFnKSB7IHJldHVybiBwYXJ0cy5sZW5ndGg7IH1cbiAgICBpZiAoaC5lbmRUYWcpIHtcbiAgICAgIGguZW5kVGFnKHRhZy5uYW1lLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcG9zLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhZy5uZXh0O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTdGFydFRhZyhwYXJ0cywgcG9zLCBoLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLCBzdGF0ZSkge1xuICAgIHZhciB0YWcgPSBwYXJzZVRhZ0FuZEF0dHJzKHBhcnRzLCBwb3MpO1xuICAgIC8vIGRyb3AgdW5jbG9zZWQgdGFnc1xuICAgIGlmICghdGFnKSB7IHJldHVybiBwYXJ0cy5sZW5ndGg7IH1cbiAgICBpZiAoaC5zdGFydFRhZykge1xuICAgICAgaC5zdGFydFRhZyh0YWcubmFtZSwgdGFnLmF0dHJzLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgdGFnLm5leHQsIHN0YXRlLCBwYXJhbSkpO1xuICAgIH1cbiAgICAvLyB0YWdzIGxpa2UgPHNjcmlwdD4gYW5kIDx0ZXh0YXJlYT4gaGF2ZSBzcGVjaWFsIHBhcnNpbmdcbiAgICBpZiAodGFnLmVmbGFncyAmIEVGTEFHU19URVhUKSB7XG4gICAgICByZXR1cm4gcGFyc2VUZXh0KHBhcnRzLCB0YWcsIGgsIHBhcmFtLCBjb250aW51YXRpb25NYXJrZXIsIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRhZy5uZXh0O1xuICAgIH1cbiAgfVxuXG4gIHZhciBlbmRUYWdSZSA9IHt9O1xuXG4gIC8vIFRhZ3MgbGlrZSA8c2NyaXB0PiBhbmQgPHRleHRhcmVhPiBhcmUgZmxhZ2dlZCBhcyBDREFUQSBvciBSQ0RBVEEsXG4gIC8vIHdoaWNoIG1lYW5zIGV2ZXJ5dGhpbmcgaXMgdGV4dCB1bnRpbCB3ZSBzZWUgdGhlIGNvcnJlY3QgY2xvc2luZyB0YWcuXG4gIGZ1bmN0aW9uIHBhcnNlVGV4dChwYXJ0cywgdGFnLCBoLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLCBzdGF0ZSkge1xuICAgIHZhciBlbmQgPSBwYXJ0cy5sZW5ndGg7XG4gICAgaWYgKCFlbmRUYWdSZS5oYXNPd25Qcm9wZXJ0eSh0YWcubmFtZSkpIHtcbiAgICAgIGVuZFRhZ1JlW3RhZy5uYW1lXSA9IG5ldyBSZWdFeHAoJ14nICsgdGFnLm5hbWUgKyAnKD86W1xcXFxzXFxcXC9dfCQpJywgJ2knKTtcbiAgICB9XG4gICAgdmFyIHJlID0gZW5kVGFnUmVbdGFnLm5hbWVdO1xuICAgIHZhciBmaXJzdCA9IHRhZy5uZXh0O1xuICAgIHZhciBwID0gdGFnLm5leHQgKyAxO1xuICAgIGZvciAoOyBwIDwgZW5kOyBwKyspIHtcbiAgICAgIGlmIChwYXJ0c1twIC0gMV0gPT09ICc8XFwvJyAmJiByZS50ZXN0KHBhcnRzW3BdKSkgeyBicmVhazsgfVxuICAgIH1cbiAgICBpZiAocCA8IGVuZCkgeyBwIC09IDE7IH1cbiAgICB2YXIgYnVmID0gcGFydHMuc2xpY2UoZmlyc3QsIHApLmpvaW4oJycpO1xuICAgIGlmICh0YWcuZWZsYWdzICYgaHRtbDQuZWZsYWdzWydDREFUQSddKSB7XG4gICAgICBpZiAoaC5jZGF0YSkge1xuICAgICAgICBoLmNkYXRhKGJ1ZiwgcGFyYW0sIGNvbnRpbnVhdGlvbk1hcmtlcixcbiAgICAgICAgICBjb250aW51YXRpb25NYWtlcihoLCBwYXJ0cywgcCwgc3RhdGUsIHBhcmFtKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWcuZWZsYWdzICYgaHRtbDQuZWZsYWdzWydSQ0RBVEEnXSkge1xuICAgICAgaWYgKGgucmNkYXRhKSB7XG4gICAgICAgIGgucmNkYXRhKG5vcm1hbGl6ZVJDRGF0YShidWYpLCBwYXJhbSwgY29udGludWF0aW9uTWFya2VyLFxuICAgICAgICAgIGNvbnRpbnVhdGlvbk1ha2VyKGgsIHBhcnRzLCBwLCBzdGF0ZSwgcGFyYW0pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdidWcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICAvLyBhdCB0aGlzIHBvaW50LCBwYXJ0c1twb3MtMV0gaXMgZWl0aGVyIFwiPFwiIG9yIFwiPFxcL1wiLlxuICBmdW5jdGlvbiBwYXJzZVRhZ0FuZEF0dHJzKHBhcnRzLCBwb3MpIHtcbiAgICB2YXIgbSA9IC9eKFstXFx3Ol0rKS8uZXhlYyhwYXJ0c1twb3NdKTtcbiAgICB2YXIgdGFnID0ge307XG4gICAgdGFnLm5hbWUgPSBtWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgdGFnLmVmbGFncyA9IGh0bWw0LkVMRU1FTlRTW3RhZy5uYW1lXTtcbiAgICB2YXIgYnVmID0gcGFydHNbcG9zXS5zdWJzdHIobVswXS5sZW5ndGgpO1xuICAgIC8vIEZpbmQgdGhlIG5leHQgJz4nLiAgV2Ugb3B0aW1pc3RpY2FsbHkgYXNzdW1lIHRoaXMgJz4nIGlzIG5vdCBpbiBhXG4gICAgLy8gcXVvdGVkIGNvbnRleHQsIGFuZCBmdXJ0aGVyIGRvd24gd2UgZml4IHRoaW5ncyB1cCBpZiBpdCB0dXJucyBvdXQgdG9cbiAgICAvLyBiZSBxdW90ZWQuXG4gICAgdmFyIHAgPSBwb3MgKyAxO1xuICAgIHZhciBlbmQgPSBwYXJ0cy5sZW5ndGg7XG4gICAgZm9yICg7IHAgPCBlbmQ7IHArKykge1xuICAgICAgaWYgKHBhcnRzW3BdID09PSAnPicpIHsgYnJlYWs7IH1cbiAgICAgIGJ1ZiArPSBwYXJ0c1twXTtcbiAgICB9XG4gICAgaWYgKGVuZCA8PSBwKSB7IHJldHVybiB2b2lkIDA7IH1cbiAgICB2YXIgYXR0cnMgPSBbXTtcbiAgICB3aGlsZSAoYnVmICE9PSAnJykge1xuICAgICAgbSA9IEFUVFJfUkUuZXhlYyhidWYpO1xuICAgICAgaWYgKCFtKSB7XG4gICAgICAgIC8vIE5vIGF0dHJpYnV0ZSBmb3VuZDogc2tpcCBnYXJiYWdlXG4gICAgICAgIGJ1ZiA9IGJ1Zi5yZXBsYWNlKC9eW1xcc1xcU11bXmEtelxcc10qLywgJycpO1xuXG4gICAgICB9IGVsc2UgaWYgKChtWzRdICYmICFtWzVdKSB8fCAobVs2XSAmJiAhbVs3XSkpIHtcbiAgICAgICAgLy8gVW50ZXJtaW5hdGVkIHF1b3RlOiBzbHVycCB0byB0aGUgbmV4dCB1bnF1b3RlZCAnPidcbiAgICAgICAgdmFyIHF1b3RlID0gbVs0XSB8fCBtWzZdO1xuICAgICAgICB2YXIgc2F3UXVvdGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGFidWYgPSBbYnVmLCBwYXJ0c1twKytdXTtcbiAgICAgICAgZm9yICg7IHAgPCBlbmQ7IHArKykge1xuICAgICAgICAgIGlmIChzYXdRdW90ZSkge1xuICAgICAgICAgICAgaWYgKHBhcnRzW3BdID09PSAnPicpIHsgYnJlYWs7IH1cbiAgICAgICAgICB9IGVsc2UgaWYgKDAgPD0gcGFydHNbcF0uaW5kZXhPZihxdW90ZSkpIHtcbiAgICAgICAgICAgIHNhd1F1b3RlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWJ1Zi5wdXNoKHBhcnRzW3BdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTbHVycCBmYWlsZWQ6IGxvc2UgdGhlIGdhcmJhZ2VcbiAgICAgICAgaWYgKGVuZCA8PSBwKSB7IGJyZWFrOyB9XG4gICAgICAgIC8vIE90aGVyd2lzZSByZXRyeSBhdHRyaWJ1dGUgcGFyc2luZ1xuICAgICAgICBidWYgPSBhYnVmLmpvaW4oJycpO1xuICAgICAgICBjb250aW51ZTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBhbiBhdHRyaWJ1dGVcbiAgICAgICAgdmFyIGFOYW1lID0gbVsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB2YXIgYVZhbHVlID0gbVsyXSA/IGRlY29kZVZhbHVlKG1bM10pIDogJyc7XG4gICAgICAgIGF0dHJzLnB1c2goYU5hbWUsIGFWYWx1ZSk7XG4gICAgICAgIGJ1ZiA9IGJ1Zi5zdWJzdHIobVswXS5sZW5ndGgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0YWcuYXR0cnMgPSBhdHRycztcbiAgICB0YWcubmV4dCA9IHAgKyAxO1xuICAgIHJldHVybiB0YWc7XG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGVWYWx1ZSh2KSB7XG4gICAgdmFyIHEgPSB2LmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKHEgPT09IDB4MjIgfHwgcSA9PT0gMHgyNykgeyAvLyBcIiBvciAnXG4gICAgICB2ID0gdi5zdWJzdHIoMSwgdi5sZW5ndGggLSAyKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZXNjYXBlRW50aXRpZXMoc3RyaXBOVUxzKHYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBzdHJpcHMgdW5zYWZlIHRhZ3MgYW5kIGF0dHJpYnV0ZXMgZnJvbSBodG1sLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZywgQXJyYXkuPHN0cmluZz4pOiA/QXJyYXkuPHN0cmluZz59IHRhZ1BvbGljeVxuICAgKiAgICAgQSBmdW5jdGlvbiB0aGF0IHRha2VzICh0YWdOYW1lLCBhdHRyaWJzW10pLCB3aGVyZSB0YWdOYW1lIGlzIGEga2V5IGluXG4gICAqICAgICBodG1sNC5FTEVNRU5UUyBhbmQgYXR0cmlicyBpcyBhbiBhcnJheSBvZiBhbHRlcm5hdGluZyBhdHRyaWJ1dGUgbmFtZXNcbiAgICogICAgIGFuZCB2YWx1ZXMuICBJdCBzaG91bGQgcmV0dXJuIGEgcmVjb3JkIChhcyBmb2xsb3dzKSwgb3IgbnVsbCB0byBkZWxldGVcbiAgICogICAgIHRoZSBlbGVtZW50LiAgSXQncyBva2F5IGZvciB0YWdQb2xpY3kgdG8gbW9kaWZ5IHRoZSBhdHRyaWJzIGFycmF5LFxuICAgKiAgICAgYnV0IHRoZSBzYW1lIGFycmF5IGlzIHJldXNlZCwgc28gaXQgc2hvdWxkIG5vdCBiZSBoZWxkIGJldHdlZW4gY2FsbHMuXG4gICAqICAgICBSZWNvcmQga2V5czpcbiAgICogICAgICAgIGF0dHJpYnM6IChyZXF1aXJlZCkgU2FuaXRpemVkIGF0dHJpYnV0ZXMgYXJyYXkuXG4gICAqICAgICAgICB0YWdOYW1lOiBSZXBsYWNlbWVudCB0YWcgbmFtZS5cbiAgICogQHJldHVybiB7ZnVuY3Rpb24oc3RyaW5nLCBBcnJheSl9IEEgZnVuY3Rpb24gdGhhdCBzYW5pdGl6ZXMgYSBzdHJpbmcgb2ZcbiAgICogICAgIEhUTUwgYW5kIGFwcGVuZHMgcmVzdWx0IHN0cmluZ3MgdG8gdGhlIHNlY29uZCBhcmd1bWVudCwgYW4gYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBtYWtlSHRtbFNhbml0aXplcih0YWdQb2xpY3kpIHtcbiAgICB2YXIgc3RhY2s7XG4gICAgdmFyIGlnbm9yaW5nO1xuICAgIHZhciBlbWl0ID0gZnVuY3Rpb24gKHRleHQsIG91dCkge1xuICAgICAgaWYgKCFpZ25vcmluZykgeyBvdXQucHVzaCh0ZXh0KTsgfVxuICAgIH07XG4gICAgcmV0dXJuIG1ha2VTYXhQYXJzZXIoe1xuICAgICAgJ3N0YXJ0RG9jJzogZnVuY3Rpb24oXykge1xuICAgICAgICBzdGFjayA9IFtdO1xuICAgICAgICBpZ25vcmluZyA9IGZhbHNlO1xuICAgICAgfSxcbiAgICAgICdzdGFydFRhZyc6IGZ1bmN0aW9uKHRhZ05hbWVPcmlnLCBhdHRyaWJzLCBvdXQpIHtcbiAgICAgICAgaWYgKGlnbm9yaW5nKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAoIWh0bWw0LkVMRU1FTlRTLmhhc093blByb3BlcnR5KHRhZ05hbWVPcmlnKSkgeyByZXR1cm47IH1cbiAgICAgICAgdmFyIGVmbGFnc09yaWcgPSBodG1sNC5FTEVNRU5UU1t0YWdOYW1lT3JpZ107XG4gICAgICAgIGlmIChlZmxhZ3NPcmlnICYgaHRtbDQuZWZsYWdzWydGT0xEQUJMRSddKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlY2lzaW9uID0gdGFnUG9saWN5KHRhZ05hbWVPcmlnLCBhdHRyaWJzKTtcbiAgICAgICAgaWYgKCFkZWNpc2lvbikge1xuICAgICAgICAgIGlnbm9yaW5nID0gIShlZmxhZ3NPcmlnICYgaHRtbDQuZWZsYWdzWydFTVBUWSddKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlY2lzaW9uICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGFnUG9saWN5IGRpZCBub3QgcmV0dXJuIG9iamVjdCAob2xkIEFQST8pJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCdhdHRyaWJzJyBpbiBkZWNpc2lvbikge1xuICAgICAgICAgIGF0dHJpYnMgPSBkZWNpc2lvblsnYXR0cmlicyddO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGFnUG9saWN5IGdhdmUgbm8gYXR0cmlicycpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlZmxhZ3NSZXA7XG4gICAgICAgIHZhciB0YWdOYW1lUmVwO1xuICAgICAgICBpZiAoJ3RhZ05hbWUnIGluIGRlY2lzaW9uKSB7XG4gICAgICAgICAgdGFnTmFtZVJlcCA9IGRlY2lzaW9uWyd0YWdOYW1lJ107XG4gICAgICAgICAgZWZsYWdzUmVwID0gaHRtbDQuRUxFTUVOVFNbdGFnTmFtZVJlcF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFnTmFtZVJlcCA9IHRhZ05hbWVPcmlnO1xuICAgICAgICAgIGVmbGFnc1JlcCA9IGVmbGFnc09yaWc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyhtaWtlc2FtdWVsKTogcmVseWluZyBvbiB0YWdQb2xpY3kgbm90IHRvIGluc2VydCB1bnNhZmVcbiAgICAgICAgLy8gYXR0cmlidXRlIG5hbWVzLlxuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYW4gb3B0aW9uYWwtZW5kLXRhZyBlbGVtZW50IGFuZCBlaXRoZXIgdGhpcyBlbGVtZW50IG9yIGl0c1xuICAgICAgICAvLyBwcmV2aW91cyBsaWtlIHNpYmxpbmcgd2FzIHJld3JpdHRlbiwgdGhlbiBpbnNlcnQgYSBjbG9zZSB0YWcgdG9cbiAgICAgICAgLy8gcHJlc2VydmUgc3RydWN0dXJlLlxuICAgICAgICBpZiAoZWZsYWdzT3JpZyAmIGh0bWw0LmVmbGFnc1snT1BUSU9OQUxfRU5EVEFHJ10pIHtcbiAgICAgICAgICB2YXIgb25TdGFjayA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIGlmIChvblN0YWNrICYmIG9uU3RhY2sub3JpZyA9PT0gdGFnTmFtZU9yaWcgJiZcbiAgICAgICAgICAgICAgKG9uU3RhY2sucmVwICE9PSB0YWdOYW1lUmVwIHx8IHRhZ05hbWVPcmlnICE9PSB0YWdOYW1lUmVwKSkge1xuICAgICAgICAgICAgICAgIG91dC5wdXNoKCc8XFwvJywgb25TdGFjay5yZXAsICc+Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEoZWZsYWdzT3JpZyAmIGh0bWw0LmVmbGFnc1snRU1QVFknXSkpIHtcbiAgICAgICAgICBzdGFjay5wdXNoKHtvcmlnOiB0YWdOYW1lT3JpZywgcmVwOiB0YWdOYW1lUmVwfSk7XG4gICAgICAgIH1cblxuICAgICAgICBvdXQucHVzaCgnPCcsIHRhZ05hbWVSZXApO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGF0dHJpYnMubGVuZ3RoOyBpIDwgbjsgaSArPSAyKSB7XG4gICAgICAgICAgdmFyIGF0dHJpYk5hbWUgPSBhdHRyaWJzW2ldLFxuICAgICAgICAgICAgICB2YWx1ZSA9IGF0dHJpYnNbaSArIDFdO1xuICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBvdXQucHVzaCgnICcsIGF0dHJpYk5hbWUsICc9XCInLCBlc2NhcGVBdHRyaWIodmFsdWUpLCAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb3V0LnB1c2goJz4nKTtcblxuICAgICAgICBpZiAoKGVmbGFnc09yaWcgJiBodG1sNC5lZmxhZ3NbJ0VNUFRZJ10pXG4gICAgICAgICAgICAmJiAhKGVmbGFnc1JlcCAmIGh0bWw0LmVmbGFnc1snRU1QVFknXSkpIHtcbiAgICAgICAgICAvLyByZXBsYWNlbWVudCBpcyBub24tZW1wdHksIHN5bnRoZXNpemUgZW5kIHRhZ1xuICAgICAgICAgIG91dC5wdXNoKCc8XFwvJywgdGFnTmFtZVJlcCwgJz4nKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdlbmRUYWcnOiBmdW5jdGlvbih0YWdOYW1lLCBvdXQpIHtcbiAgICAgICAgaWYgKGlnbm9yaW5nKSB7XG4gICAgICAgICAgaWdub3JpbmcgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFodG1sNC5FTEVNRU5UUy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkgeyByZXR1cm47IH1cbiAgICAgICAgdmFyIGVmbGFncyA9IGh0bWw0LkVMRU1FTlRTW3RhZ05hbWVdO1xuICAgICAgICBpZiAoIShlZmxhZ3MgJiAoaHRtbDQuZWZsYWdzWydFTVBUWSddIHwgaHRtbDQuZWZsYWdzWydGT0xEQUJMRSddKSkpIHtcbiAgICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgICAgaWYgKGVmbGFncyAmIGh0bWw0LmVmbGFnc1snT1BUSU9OQUxfRU5EVEFHJ10pIHtcbiAgICAgICAgICAgIGZvciAoaW5kZXggPSBzdGFjay5sZW5ndGg7IC0taW5kZXggPj0gMDspIHtcbiAgICAgICAgICAgICAgdmFyIHN0YWNrRWxPcmlnVGFnID0gc3RhY2tbaW5kZXhdLm9yaWc7XG4gICAgICAgICAgICAgIGlmIChzdGFja0VsT3JpZ1RhZyA9PT0gdGFnTmFtZSkgeyBicmVhazsgfVxuICAgICAgICAgICAgICBpZiAoIShodG1sNC5FTEVNRU5UU1tzdGFja0VsT3JpZ1RhZ10gJlxuICAgICAgICAgICAgICAgICAgICBodG1sNC5lZmxhZ3NbJ09QVElPTkFMX0VORFRBRyddKSkge1xuICAgICAgICAgICAgICAgIC8vIERvbid0IHBvcCBub24gb3B0aW9uYWwgZW5kIHRhZ3MgbG9va2luZyBmb3IgYSBtYXRjaC5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChpbmRleCA9IHN0YWNrLmxlbmd0aDsgLS1pbmRleCA+PSAwOykge1xuICAgICAgICAgICAgICBpZiAoc3RhY2tbaW5kZXhdLm9yaWcgPT09IHRhZ05hbWUpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGluZGV4IDwgMCkgeyByZXR1cm47IH0gIC8vIE5vdCBvcGVuZWQuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IHN0YWNrLmxlbmd0aDsgLS1pID4gaW5kZXg7KSB7XG4gICAgICAgICAgICB2YXIgc3RhY2tFbFJlcFRhZyA9IHN0YWNrW2ldLnJlcDtcbiAgICAgICAgICAgIGlmICghKGh0bWw0LkVMRU1FTlRTW3N0YWNrRWxSZXBUYWddICZcbiAgICAgICAgICAgICAgICAgIGh0bWw0LmVmbGFnc1snT1BUSU9OQUxfRU5EVEFHJ10pKSB7XG4gICAgICAgICAgICAgIG91dC5wdXNoKCc8XFwvJywgc3RhY2tFbFJlcFRhZywgJz4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGluZGV4IDwgc3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICB0YWdOYW1lID0gc3RhY2tbaW5kZXhdLnJlcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RhY2subGVuZ3RoID0gaW5kZXg7XG4gICAgICAgICAgb3V0LnB1c2goJzxcXC8nLCB0YWdOYW1lLCAnPicpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ3BjZGF0YSc6IGVtaXQsXG4gICAgICAncmNkYXRhJzogZW1pdCxcbiAgICAgICdjZGF0YSc6IGVtaXQsXG4gICAgICAnZW5kRG9jJzogZnVuY3Rpb24ob3V0KSB7XG4gICAgICAgIGZvciAoOyBzdGFjay5sZW5ndGg7IHN0YWNrLmxlbmd0aC0tKSB7XG4gICAgICAgICAgb3V0LnB1c2goJzxcXC8nLCBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5yZXAsICc+Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciBBTExPV0VEX1VSSV9TQ0hFTUVTID0gL14oPzpodHRwcz98bWFpbHRvfGRhdGEpJC9pO1xuXG4gIGZ1bmN0aW9uIHNhZmVVcmkodXJpLCBlZmZlY3QsIGx0eXBlLCBoaW50cywgbmFpdmVVcmlSZXdyaXRlcikge1xuICAgIGlmICghbmFpdmVVcmlSZXdyaXRlcikgeyByZXR1cm4gbnVsbDsgfVxuICAgIHRyeSB7XG4gICAgICB2YXIgcGFyc2VkID0gVVJJLnBhcnNlKCcnICsgdXJpKTtcbiAgICAgIGlmIChwYXJzZWQpIHtcbiAgICAgICAgaWYgKCFwYXJzZWQuaGFzU2NoZW1lKCkgfHxcbiAgICAgICAgICAgIEFMTE9XRURfVVJJX1NDSEVNRVMudGVzdChwYXJzZWQuZ2V0U2NoZW1lKCkpKSB7XG4gICAgICAgICAgdmFyIHNhZmUgPSBuYWl2ZVVyaVJld3JpdGVyKHBhcnNlZCwgZWZmZWN0LCBsdHlwZSwgaGludHMpO1xuICAgICAgICAgIHJldHVybiBzYWZlID8gc2FmZS50b1N0cmluZygpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZyhsb2dnZXIsIHRhZ05hbWUsIGF0dHJpYk5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgIGlmICghYXR0cmliTmFtZSkge1xuICAgICAgbG9nZ2VyKHRhZ05hbWUgKyBcIiByZW1vdmVkXCIsIHtcbiAgICAgICAgY2hhbmdlOiBcInJlbW92ZWRcIixcbiAgICAgICAgdGFnTmFtZTogdGFnTmFtZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgIHZhciBjaGFuZ2VkID0gXCJjaGFuZ2VkXCI7XG4gICAgICBpZiAob2xkVmFsdWUgJiYgIW5ld1ZhbHVlKSB7XG4gICAgICAgIGNoYW5nZWQgPSBcInJlbW92ZWRcIjtcbiAgICAgIH0gZWxzZSBpZiAoIW9sZFZhbHVlICYmIG5ld1ZhbHVlKSAge1xuICAgICAgICBjaGFuZ2VkID0gXCJhZGRlZFwiO1xuICAgICAgfVxuICAgICAgbG9nZ2VyKHRhZ05hbWUgKyBcIi5cIiArIGF0dHJpYk5hbWUgKyBcIiBcIiArIGNoYW5nZWQsIHtcbiAgICAgICAgY2hhbmdlOiBjaGFuZ2VkLFxuICAgICAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgICAgICBhdHRyaWJOYW1lOiBhdHRyaWJOYW1lLFxuICAgICAgICBvbGRWYWx1ZTogb2xkVmFsdWUsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbG9va3VwQXR0cmlidXRlKG1hcCwgdGFnTmFtZSwgYXR0cmliTmFtZSkge1xuICAgIHZhciBhdHRyaWJLZXk7XG4gICAgYXR0cmliS2V5ID0gdGFnTmFtZSArICc6OicgKyBhdHRyaWJOYW1lO1xuICAgIGlmIChtYXAuaGFzT3duUHJvcGVydHkoYXR0cmliS2V5KSkge1xuICAgICAgcmV0dXJuIG1hcFthdHRyaWJLZXldO1xuICAgIH1cbiAgICBhdHRyaWJLZXkgPSAnKjo6JyArIGF0dHJpYk5hbWU7XG4gICAgaWYgKG1hcC5oYXNPd25Qcm9wZXJ0eShhdHRyaWJLZXkpKSB7XG4gICAgICByZXR1cm4gbWFwW2F0dHJpYktleV07XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0QXR0cmlidXRlVHlwZSh0YWdOYW1lLCBhdHRyaWJOYW1lKSB7XG4gICAgcmV0dXJuIGxvb2t1cEF0dHJpYnV0ZShodG1sNC5BVFRSSUJTLCB0YWdOYW1lLCBhdHRyaWJOYW1lKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRMb2FkZXJUeXBlKHRhZ05hbWUsIGF0dHJpYk5hbWUpIHtcbiAgICByZXR1cm4gbG9va3VwQXR0cmlidXRlKGh0bWw0LkxPQURFUlRZUEVTLCB0YWdOYW1lLCBhdHRyaWJOYW1lKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRVcmlFZmZlY3QodGFnTmFtZSwgYXR0cmliTmFtZSkge1xuICAgIHJldHVybiBsb29rdXBBdHRyaWJ1dGUoaHRtbDQuVVJJRUZGRUNUUywgdGFnTmFtZSwgYXR0cmliTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogU2FuaXRpemVzIGF0dHJpYnV0ZXMgb24gYW4gSFRNTCB0YWcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdOYW1lIEFuIEhUTUwgdGFnIG5hbWUgaW4gbG93ZXJjYXNlLlxuICAgKiBAcGFyYW0ge0FycmF5Ljw/c3RyaW5nPn0gYXR0cmlicyBBbiBhcnJheSBvZiBhbHRlcm5hdGluZyBuYW1lcyBhbmQgdmFsdWVzLlxuICAgKiBAcGFyYW0gez9mdW5jdGlvbig/c3RyaW5nKTogP3N0cmluZ30gb3B0X25haXZlVXJpUmV3cml0ZXIgQSB0cmFuc2Zvcm0gdG9cbiAgICogICAgIGFwcGx5IHRvIFVSSSBhdHRyaWJ1dGVzOyBpdCBjYW4gcmV0dXJuIGEgbmV3IHN0cmluZyB2YWx1ZSwgb3IgbnVsbCB0b1xuICAgKiAgICAgZGVsZXRlIHRoZSBhdHRyaWJ1dGUuICBJZiB1bnNwZWNpZmllZCwgVVJJIGF0dHJpYnV0ZXMgYXJlIGRlbGV0ZWQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oP3N0cmluZyk6ID9zdHJpbmd9IG9wdF9ubVRva2VuUG9saWN5IEEgdHJhbnNmb3JtIHRvIGFwcGx5XG4gICAqICAgICB0byBhdHRyaWJ1dGVzIGNvbnRhaW5pbmcgSFRNTCBuYW1lcywgZWxlbWVudCBJRHMsIGFuZCBzcGFjZS1zZXBhcmF0ZWRcbiAgICogICAgIGxpc3RzIG9mIGNsYXNzZXM7IGl0IGNhbiByZXR1cm4gYSBuZXcgc3RyaW5nIHZhbHVlLCBvciBudWxsIHRvIGRlbGV0ZVxuICAgKiAgICAgdGhlIGF0dHJpYnV0ZS4gIElmIHVuc3BlY2lmaWVkLCB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBrZXB0IHVuY2hhbmdlZC5cbiAgICogQHJldHVybiB7QXJyYXkuPD9zdHJpbmc+fSBUaGUgc2FuaXRpemVkIGF0dHJpYnV0ZXMgYXMgYSBsaXN0IG9mIGFsdGVybmF0aW5nXG4gICAqICAgICBuYW1lcyBhbmQgdmFsdWVzLCB3aGVyZSBhIG51bGwgdmFsdWUgbWVhbnMgdG8gb21pdCB0aGUgYXR0cmlidXRlLlxuICAgKi9cbiAgZnVuY3Rpb24gc2FuaXRpemVBdHRyaWJzKHRhZ05hbWUsIGF0dHJpYnMsXG4gICAgb3B0X25haXZlVXJpUmV3cml0ZXIsIG9wdF9ubVRva2VuUG9saWN5LCBvcHRfbG9nZ2VyKSB7XG4gICAgLy8gVE9ETyhmZWxpeDhhKTogaXQncyBvYm5veGlvdXMgdGhhdCBkb21hZG8gZHVwbGljYXRlcyBtdWNoIG9mIHRoaXNcbiAgICAvLyBUT0RPKGZlbGl4OGEpOiBtYXliZSBjb25zaXN0ZW50bHkgZW5mb3JjZSBjb25zdHJhaW50cyBsaWtlIHRhcmdldD1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJpYnMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIHZhciBhdHRyaWJOYW1lID0gYXR0cmlic1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IGF0dHJpYnNbaSArIDFdO1xuICAgICAgdmFyIG9sZFZhbHVlID0gdmFsdWU7XG4gICAgICB2YXIgYXR5cGUgPSBudWxsLCBhdHRyaWJLZXk7XG4gICAgICBpZiAoKGF0dHJpYktleSA9IHRhZ05hbWUgKyAnOjonICsgYXR0cmliTmFtZSxcbiAgICAgICAgICAgaHRtbDQuQVRUUklCUy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJLZXkpKSB8fFxuICAgICAgICAgIChhdHRyaWJLZXkgPSAnKjo6JyArIGF0dHJpYk5hbWUsXG4gICAgICAgICAgIGh0bWw0LkFUVFJJQlMuaGFzT3duUHJvcGVydHkoYXR0cmliS2V5KSkpIHtcbiAgICAgICAgYXR5cGUgPSBodG1sNC5BVFRSSUJTW2F0dHJpYktleV07XG4gICAgICB9XG4gICAgICBpZiAoYXR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgc3dpdGNoIChhdHlwZSkge1xuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ05PTkUnXTogYnJlYWs7XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnU0NSSVBUJ106XG4gICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ1NUWUxFJ106XG4gICAgICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBwYXJzZUNzc0RlY2xhcmF0aW9ucykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgIGlmIChvcHRfbG9nZ2VyKSB7XG4gICAgICAgICAgICAgICAgbG9nKG9wdF9sb2dnZXIsIHRhZ05hbWUsIGF0dHJpYk5hbWUsIG9sZFZhbHVlLCB2YWx1ZSk7XG5cdCAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2FuaXRpemVkRGVjbGFyYXRpb25zID0gW107XG4gICAgICAgICAgICBwYXJzZUNzc0RlY2xhcmF0aW9ucyhcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbjogZnVuY3Rpb24gKHByb3BlcnR5LCB0b2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vcm1Qcm9wID0gcHJvcGVydHkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjaGVtYSA9IGNzc1NjaGVtYVtub3JtUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2NoZW1hKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNhbml0aXplQ3NzUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtUHJvcCwgc2NoZW1hLCB0b2tlbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRfbmFpdmVVcmlSZXdyaXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNhZmVVcmkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCwgaHRtbDQudWVmZmVjdHMuU0FNRV9ET0NVTUVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDQubHR5cGVzLlNBTkRCT1hFRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVFlQRVwiOiBcIkNTU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ1NTX1BST1BcIjogbm9ybVByb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgb3B0X25haXZlVXJpUmV3cml0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBzYW5pdGl6ZWREZWNsYXJhdGlvbnMucHVzaChwcm9wZXJ0eSArICc6ICcgKyB0b2tlbnMuam9pbignICcpKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhbHVlID0gc2FuaXRpemVkRGVjbGFyYXRpb25zLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICBzYW5pdGl6ZWREZWNsYXJhdGlvbnMuam9pbignIDsgJykgOiBudWxsO1xuICAgICAgICAgICAgaWYgKG9wdF9sb2dnZXIpIHtcbiAgICAgICAgICAgICAgbG9nKG9wdF9sb2dnZXIsIHRhZ05hbWUsIGF0dHJpYk5hbWUsIG9sZFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydJRCddOlxuICAgICAgICAgIGNhc2UgaHRtbDQuYXR5cGVbJ0lEUkVGJ106XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnSURSRUZTJ106XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnR0xPQkFMX05BTUUnXTpcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydMT0NBTF9OQU1FJ106XG4gICAgICAgICAgY2FzZSBodG1sNC5hdHlwZVsnQ0xBU1NFUyddOlxuICAgICAgICAgICAgdmFsdWUgPSBvcHRfbm1Ub2tlblBvbGljeSA/IG9wdF9ubVRva2VuUG9saWN5KHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICAgICAgaWYgKG9wdF9sb2dnZXIpIHtcbiAgICAgICAgICAgICAgbG9nKG9wdF9sb2dnZXIsIHRhZ05hbWUsIGF0dHJpYk5hbWUsIG9sZFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydVUkknXTpcbiAgICAgICAgICAgIHZhbHVlID0gc2FmZVVyaSh2YWx1ZSxcbiAgICAgICAgICAgICAgZ2V0VXJpRWZmZWN0KHRhZ05hbWUsIGF0dHJpYk5hbWUpLFxuICAgICAgICAgICAgICBnZXRMb2FkZXJUeXBlKHRhZ05hbWUsIGF0dHJpYk5hbWUpLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJUWVBFXCI6IFwiTUFSS1VQXCIsXG4gICAgICAgICAgICAgICAgXCJYTUxfQVRUUlwiOiBhdHRyaWJOYW1lLFxuICAgICAgICAgICAgICAgIFwiWE1MX1RBR1wiOiB0YWdOYW1lXG4gICAgICAgICAgICAgIH0sIG9wdF9uYWl2ZVVyaVJld3JpdGVyKTtcbiAgICAgICAgICAgICAgaWYgKG9wdF9sb2dnZXIpIHtcbiAgICAgICAgICAgICAgbG9nKG9wdF9sb2dnZXIsIHRhZ05hbWUsIGF0dHJpYk5hbWUsIG9sZFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGh0bWw0LmF0eXBlWydVUklfRlJBR01FTlQnXTpcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAnIycgPT09IHZhbHVlLmNoYXJBdCgwKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygxKTsgIC8vIHJlbW92ZSB0aGUgbGVhZGluZyAnIydcbiAgICAgICAgICAgICAgdmFsdWUgPSBvcHRfbm1Ub2tlblBvbGljeSA/IG9wdF9ubVRva2VuUG9saWN5KHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gJyMnICsgdmFsdWU7ICAvLyByZXN0b3JlIHRoZSBsZWFkaW5nICcjJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAob3B0X2xvZ2dlcikge1xuICAgICAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgYXR0cmliTmFtZSwgb2xkVmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgIGlmIChvcHRfbG9nZ2VyKSB7XG4gICAgICAgICAgbG9nKG9wdF9sb2dnZXIsIHRhZ05hbWUsIGF0dHJpYk5hbWUsIG9sZFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGF0dHJpYnNbaSArIDFdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBhdHRyaWJzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB0YWcgcG9saWN5IHRoYXQgb21pdHMgYWxsIHRhZ3MgbWFya2VkIFVOU0FGRSBpbiBodG1sNC1kZWZzLmpzXG4gICAqIGFuZCBhcHBsaWVzIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBzYW5pdGl6ZXIgd2l0aCB0aGUgc3VwcGxpZWQgcG9saWN5IGZvclxuICAgKiBVUkkgYXR0cmlidXRlcyBhbmQgTk1UT0tFTiBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gez9mdW5jdGlvbig/c3RyaW5nKTogP3N0cmluZ30gb3B0X25haXZlVXJpUmV3cml0ZXIgQSB0cmFuc2Zvcm0gdG9cbiAgICogICAgIGFwcGx5IHRvIFVSSSBhdHRyaWJ1dGVzLiAgSWYgbm90IGdpdmVuLCBVUkkgYXR0cmlidXRlcyBhcmUgZGVsZXRlZC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbig/c3RyaW5nKTogP3N0cmluZ30gb3B0X25tVG9rZW5Qb2xpY3kgQSB0cmFuc2Zvcm0gdG8gYXBwbHlcbiAgICogICAgIHRvIGF0dHJpYnV0ZXMgY29udGFpbmluZyBIVE1MIG5hbWVzLCBlbGVtZW50IElEcywgYW5kIHNwYWNlLXNlcGFyYXRlZFxuICAgKiAgICAgbGlzdHMgb2YgY2xhc3Nlcy4gIElmIG5vdCBnaXZlbiwgc3VjaCBhdHRyaWJ1dGVzIGFyZSBsZWZ0IHVuY2hhbmdlZC5cbiAgICogQHJldHVybiB7ZnVuY3Rpb24oc3RyaW5nLCBBcnJheS48P3N0cmluZz4pfSBBIHRhZ1BvbGljeSBzdWl0YWJsZSBmb3JcbiAgICogICAgIHBhc3NpbmcgdG8gaHRtbC5zYW5pdGl6ZS5cbiAgICovXG4gIGZ1bmN0aW9uIG1ha2VUYWdQb2xpY3koXG4gICAgb3B0X25haXZlVXJpUmV3cml0ZXIsIG9wdF9ubVRva2VuUG9saWN5LCBvcHRfbG9nZ2VyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHRhZ05hbWUsIGF0dHJpYnMpIHtcbiAgICAgIGlmICghKGh0bWw0LkVMRU1FTlRTW3RhZ05hbWVdICYgaHRtbDQuZWZsYWdzWydVTlNBRkUnXSkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnYXR0cmlicyc6IHNhbml0aXplQXR0cmlicyh0YWdOYW1lLCBhdHRyaWJzLFxuICAgICAgICAgICAgb3B0X25haXZlVXJpUmV3cml0ZXIsIG9wdF9ubVRva2VuUG9saWN5LCBvcHRfbG9nZ2VyKVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wdF9sb2dnZXIpIHtcbiAgICAgICAgICBsb2cob3B0X2xvZ2dlciwgdGFnTmFtZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyBIVE1MIHRhZ3MgYW5kIGF0dHJpYnV0ZXMgYWNjb3JkaW5nIHRvIGEgZ2l2ZW4gcG9saWN5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRIdG1sIFRoZSBIVE1MIHRvIHNhbml0aXplLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZywgQXJyYXkuPD9zdHJpbmc+KX0gdGFnUG9saWN5IEEgZnVuY3Rpb24gdGhhdFxuICAgKiAgICAgZGVjaWRlcyB3aGljaCB0YWdzIHRvIGFjY2VwdCBhbmQgc2FuaXRpemVzIHRoZWlyIGF0dHJpYnV0ZXMgKHNlZVxuICAgKiAgICAgbWFrZUh0bWxTYW5pdGl6ZXIgYWJvdmUgZm9yIGRldGFpbHMpLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzYW5pdGl6ZWQgSFRNTC5cbiAgICovXG4gIGZ1bmN0aW9uIHNhbml0aXplV2l0aFBvbGljeShpbnB1dEh0bWwsIHRhZ1BvbGljeSkge1xuICAgIHZhciBvdXRwdXRBcnJheSA9IFtdO1xuICAgIG1ha2VIdG1sU2FuaXRpemVyKHRhZ1BvbGljeSkoaW5wdXRIdG1sLCBvdXRwdXRBcnJheSk7XG4gICAgcmV0dXJuIG91dHB1dEFycmF5LmpvaW4oJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0cmlwcyB1bnNhZmUgdGFncyBhbmQgYXR0cmlidXRlcyBmcm9tIEhUTUwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dEh0bWwgVGhlIEhUTUwgdG8gc2FuaXRpemUuXG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9uKD9zdHJpbmcpOiA/c3RyaW5nfSBvcHRfbmFpdmVVcmlSZXdyaXRlciBBIHRyYW5zZm9ybSB0b1xuICAgKiAgICAgYXBwbHkgdG8gVVJJIGF0dHJpYnV0ZXMuICBJZiBub3QgZ2l2ZW4sIFVSSSBhdHRyaWJ1dGVzIGFyZSBkZWxldGVkLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKD9zdHJpbmcpOiA/c3RyaW5nfSBvcHRfbm1Ub2tlblBvbGljeSBBIHRyYW5zZm9ybSB0byBhcHBseVxuICAgKiAgICAgdG8gYXR0cmlidXRlcyBjb250YWluaW5nIEhUTUwgbmFtZXMsIGVsZW1lbnQgSURzLCBhbmQgc3BhY2Utc2VwYXJhdGVkXG4gICAqICAgICBsaXN0cyBvZiBjbGFzc2VzLiAgSWYgbm90IGdpdmVuLCBzdWNoIGF0dHJpYnV0ZXMgYXJlIGxlZnQgdW5jaGFuZ2VkLlxuICAgKi9cbiAgZnVuY3Rpb24gc2FuaXRpemUoaW5wdXRIdG1sLFxuICAgIG9wdF9uYWl2ZVVyaVJld3JpdGVyLCBvcHRfbm1Ub2tlblBvbGljeSwgb3B0X2xvZ2dlcikge1xuICAgIHZhciB0YWdQb2xpY3kgPSBtYWtlVGFnUG9saWN5KFxuICAgICAgb3B0X25haXZlVXJpUmV3cml0ZXIsIG9wdF9ubVRva2VuUG9saWN5LCBvcHRfbG9nZ2VyKTtcbiAgICByZXR1cm4gc2FuaXRpemVXaXRoUG9saWN5KGlucHV0SHRtbCwgdGFnUG9saWN5KTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBib3RoIHF1b3RlZCBhbmQgdW5xdW90ZWQgbmFtZXMgZm9yIENsb3N1cmUgbGlua2FnZS5cbiAgdmFyIGh0bWwgPSB7fTtcbiAgaHRtbC5lc2NhcGVBdHRyaWIgPSBodG1sWydlc2NhcGVBdHRyaWInXSA9IGVzY2FwZUF0dHJpYjtcbiAgaHRtbC5tYWtlSHRtbFNhbml0aXplciA9IGh0bWxbJ21ha2VIdG1sU2FuaXRpemVyJ10gPSBtYWtlSHRtbFNhbml0aXplcjtcbiAgaHRtbC5tYWtlU2F4UGFyc2VyID0gaHRtbFsnbWFrZVNheFBhcnNlciddID0gbWFrZVNheFBhcnNlcjtcbiAgaHRtbC5tYWtlVGFnUG9saWN5ID0gaHRtbFsnbWFrZVRhZ1BvbGljeSddID0gbWFrZVRhZ1BvbGljeTtcbiAgaHRtbC5ub3JtYWxpemVSQ0RhdGEgPSBodG1sWydub3JtYWxpemVSQ0RhdGEnXSA9IG5vcm1hbGl6ZVJDRGF0YTtcbiAgaHRtbC5zYW5pdGl6ZSA9IGh0bWxbJ3Nhbml0aXplJ10gPSBzYW5pdGl6ZTtcbiAgaHRtbC5zYW5pdGl6ZUF0dHJpYnMgPSBodG1sWydzYW5pdGl6ZUF0dHJpYnMnXSA9IHNhbml0aXplQXR0cmlicztcbiAgaHRtbC5zYW5pdGl6ZVdpdGhQb2xpY3kgPSBodG1sWydzYW5pdGl6ZVdpdGhQb2xpY3knXSA9IHNhbml0aXplV2l0aFBvbGljeTtcbiAgaHRtbC51bmVzY2FwZUVudGl0aWVzID0gaHRtbFsndW5lc2NhcGVFbnRpdGllcyddID0gdW5lc2NhcGVFbnRpdGllcztcbiAgcmV0dXJuIGh0bWw7XG59KShodG1sNCk7XG5cbnZhciBodG1sX3Nhbml0aXplID0gaHRtbFsnc2FuaXRpemUnXTtcblxuLy8gTG9vc2VuIHJlc3RyaWN0aW9ucyBvZiBDYWphJ3Ncbi8vIGh0bWwtc2FuaXRpemVyIHRvIGFsbG93IGZvciBzdHlsaW5nXG5odG1sNC5BVFRSSUJTWycqOjpzdHlsZSddID0gMDtcbmh0bWw0LkVMRU1FTlRTWydzdHlsZSddID0gMDtcbmh0bWw0LkFUVFJJQlNbJ2E6OnRhcmdldCddID0gMDtcbmh0bWw0LkVMRU1FTlRTWyd2aWRlbyddID0gMDtcbmh0bWw0LkFUVFJJQlNbJ3ZpZGVvOjpzcmMnXSA9IDA7XG5odG1sNC5BVFRSSUJTWyd2aWRlbzo6cG9zdGVyJ10gPSAwO1xuaHRtbDQuQVRUUklCU1sndmlkZW86OmNvbnRyb2xzJ10gPSAwO1xuaHRtbDQuRUxFTUVOVFNbJ2F1ZGlvJ10gPSAwO1xuaHRtbDQuQVRUUklCU1snYXVkaW86OnNyYyddID0gMDtcbmh0bWw0LkFUVFJJQlNbJ3ZpZGVvOjphdXRvcGxheSddID0gMDtcbmh0bWw0LkFUVFJJQlNbJ3ZpZGVvOjpjb250cm9scyddID0gMDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBodG1sX3Nhbml0aXplO1xufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImF1dGhvclwiOiBcIk1hcGJveFwiLFxuICBcIm5hbWVcIjogXCJtYXBib3guanNcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIm1hcGJveCBqYXZhc2NyaXB0IGFwaVwiLFxuICBcInZlcnNpb25cIjogXCIxLjYuMlwiLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cDovL21hcGJveC5jb20vXCIsXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQ6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3guanMuZ2l0XCJcbiAgfSxcbiAgXCJtYWluXCI6IFwiaW5kZXguanNcIixcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibGVhZmxldFwiOiBcIjAuNy4yXCIsXG4gICAgXCJtdXN0YWNoZVwiOiBcIjAuNy4zXCIsXG4gICAgXCJjb3JzbGl0ZVwiOiBcIjAuMC41XCIsXG4gICAgXCJqc29uM1wiOiBcIjMuMy4xXCIsXG4gICAgXCJzYW5pdGl6ZS1jYWphXCI6IFwiMC4wLjBcIlxuICB9LFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwidGVzdFwiOiBcImpzaGludCBzcmMvKi5qcyAmJiBtb2NoYS1waGFudG9tanMgdGVzdC9pbmRleC5odG1sXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibGVhZmxldC1oYXNoXCI6IFwiMC4yLjFcIixcbiAgICBcImxlYWZsZXQtZnVsbHNjcmVlblwiOiBcIjAuMC4wXCIsXG4gICAgXCJ1Z2xpZnktanNcIjogXCIyLjQuOFwiLFxuICAgIFwibW9jaGFcIjogXCIxLjE3LjFcIixcbiAgICBcImV4cGVjdC5qc1wiOiBcIjAuMy4xXCIsXG4gICAgXCJzaW5vblwiOiBcIjEuOC4yXCIsXG4gICAgXCJtb2NoYS1waGFudG9tanNcIjogXCIzLjEuNlwiLFxuICAgIFwiaGFwcGVuXCI6IFwiMC4xLjNcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCIzLjIzLjFcIixcbiAgICBcImpzaGludFwiOiBcIjIuNC40XCIsXG4gICAgXCJjbGVhbi1jc3NcIjogXCJ+Mi4wLjdcIixcbiAgICBcIm1pbmltaXN0XCI6IFwiMC4wLjVcIixcbiAgICBcIm1hcmtlZFwiOiBcIn4wLjMuMFwiXG4gIH0sXG4gIFwib3B0aW9uYWxEZXBlbmRlbmNpZXNcIjoge30sXG4gIFwiZW5naW5lc1wiOiB7XG4gICAgXCJub2RlXCI6IFwiKlwiXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBIVFRQX1VSTFM6IFtcbiAgICAgICAgJ2h0dHA6Ly9hLnRpbGVzLm1hcGJveC5jb20vdjMvJyxcbiAgICAgICAgJ2h0dHA6Ly9iLnRpbGVzLm1hcGJveC5jb20vdjMvJ10sXG5cbiAgICBGT1JDRV9IVFRQUzogZmFsc2UsXG5cbiAgICBIVFRQU19VUkxTOiBbXG4gICAgICAgICdodHRwczovL2EudGlsZXMubWFwYm94LmNvbS92My8nLFxuICAgICAgICAnaHR0cHM6Ly9iLnRpbGVzLm1hcGJveC5jb20vdjMvJ11cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgdXJsaGVscGVyID0gcmVxdWlyZSgnLi91cmwnKSxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgnLi9yZXF1ZXN0JyksXG4gICAgbWFya2VyID0gcmVxdWlyZSgnLi9tYXJrZXInKSxcbiAgICBzaW1wbGVzdHlsZSA9IHJlcXVpcmUoJy4vc2ltcGxlc3R5bGUnKTtcblxuLy8gIyBmZWF0dXJlTGF5ZXJcbi8vXG4vLyBBIGxheWVyIG9mIGZlYXR1cmVzLCBsb2FkZWQgZnJvbSBNYXBib3ggb3IgZWxzZS4gQWRkcyB0aGUgYWJpbGl0eVxuLy8gdG8gcmVzZXQgZmVhdHVyZXMsIGZpbHRlciB0aGVtLCBhbmQgbG9hZCB0aGVtIGZyb20gYSBHZW9KU09OIFVSTC5cbnZhciBGZWF0dXJlTGF5ZXIgPSBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICAgIHNhbml0aXplcjogcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpLFxuICAgICAgICBzdHlsZTogc2ltcGxlc3R5bGUuc3R5bGVcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oXywgb3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fbGF5ZXJzID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZiBfID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdXRpbC5pZFVybChfLCB0aGlzKTtcbiAgICAgICAgLy8gamF2YXNjcmlwdCBvYmplY3Qgb2YgVGlsZUpTT04gZGF0YVxuICAgICAgICB9IGVsc2UgaWYgKF8gJiYgdHlwZW9mIF8gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aGlzLnNldEdlb0pTT04oXyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0R2VvSlNPTjogZnVuY3Rpb24oXykge1xuICAgICAgICB0aGlzLl9nZW9qc29uID0gXztcbiAgICAgICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplKF8pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZ2V0R2VvSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9qc29uO1xuICAgIH0sXG5cbiAgICBsb2FkVVJMOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlcXVlc3QgJiYgJ2Fib3J0JyBpbiB0aGlzLl9yZXF1ZXN0KSB0aGlzLl9yZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHVybCA9IHVybGhlbHBlci5qc29uaWZ5KHVybCk7XG4gICAgICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0KHVybCwgTC5iaW5kKGZ1bmN0aW9uKGVyciwganNvbikge1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZXJyICYmIGVyci50eXBlICE9PSAnYWJvcnQnKSB7XG4gICAgICAgICAgICAgICAgdXRpbC5sb2coJ2NvdWxkIG5vdCBsb2FkIGZlYXR1cmVzIGF0ICcgKyB1cmwpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgnZXJyb3InLCB7ZXJyb3I6IGVycn0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChqc29uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRHZW9KU09OKGpzb24pO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgncmVhZHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgbG9hZElEOiBmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkVVJMKHVybGhlbHBlci5iYXNlKCkgKyBpZCArICcvbWFya2Vycy5nZW9qc29uJyk7XG4gICAgfSxcblxuICAgIHNldEZpbHRlcjogZnVuY3Rpb24oXykge1xuICAgICAgICB0aGlzLm9wdGlvbnMuZmlsdGVyID0gXztcbiAgICAgICAgaWYgKHRoaXMuX2dlb2pzb24pIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxpemUodGhpcy5fZ2VvanNvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGdldEZpbHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZmlsdGVyO1xuICAgIH0sXG5cbiAgICBfaW5pdGlhbGl6ZTogZnVuY3Rpb24oanNvbikge1xuICAgICAgICB2YXIgZmVhdHVyZXMgPSBMLlV0aWwuaXNBcnJheShqc29uKSA/IGpzb24gOiBqc29uLmZlYXR1cmVzLFxuICAgICAgICAgICAgaSwgbGVuO1xuXG4gICAgICAgIGlmIChmZWF0dXJlcykge1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gZmVhdHVyZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGFkZCB0aGlzIGlmIGdlb21ldHJ5IG9yIGdlb21ldHJpZXMgYXJlIHNldCBhbmQgbm90IG51bGxcbiAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZXNbaV0uZ2VvbWV0cmllcyB8fCBmZWF0dXJlc1tpXS5nZW9tZXRyeSB8fCBmZWF0dXJlc1tpXS5mZWF0dXJlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsaXplKGZlYXR1cmVzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZpbHRlcihqc29uKSkge1xuXG4gICAgICAgICAgICB2YXIgbGF5ZXIgPSBMLkdlb0pTT04uZ2VvbWV0cnlUb0xheWVyKGpzb24sIG1hcmtlci5zdHlsZSksXG4gICAgICAgICAgICAgICAgcG9wdXBIdG1sID0gbWFya2VyLmNyZWF0ZVBvcHVwKGpzb24sIHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIpO1xuXG4gICAgICAgICAgICBpZiAoJ3NldFN0eWxlJyBpbiBsYXllcikge1xuICAgICAgICAgICAgICAgIGxheWVyLnNldFN0eWxlKHNpbXBsZXN0eWxlLnN0eWxlKGpzb24pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGF5ZXIuZmVhdHVyZSA9IGpzb247XG5cbiAgICAgICAgICAgIGlmIChwb3B1cEh0bWwpIHtcbiAgICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAocG9wdXBIdG1sLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlQnV0dG9uOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKGxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEZlYXR1cmVMYXllcihfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgdXJsaGVscGVyID0gcmVxdWlyZSgnLi91cmwnKSxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgnLi9yZXF1ZXN0Jyk7XG5cbi8vIExvdy1sZXZlbCBnZW9jb2RpbmcgaW50ZXJmYWNlIC0gd3JhcHMgc3BlY2lmaWMgQVBJIGNhbGxzIGFuZCB0aGVpclxuLy8gcmV0dXJuIHZhbHVlcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oXykge1xuXG4gICAgdmFyIGdlb2NvZGVyID0ge30sIHVybDtcblxuICAgIGdlb2NvZGVyLmdldFVSTCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgZ2VvY29kZXIuc2V0VVJMID0gZnVuY3Rpb24oXykge1xuICAgICAgICB1cmwgPSB1cmxoZWxwZXIuanNvbmlmeShfKTtcbiAgICAgICAgcmV0dXJuIGdlb2NvZGVyO1xuICAgIH07XG5cbiAgICBnZW9jb2Rlci5zZXRJRCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgdXRpbC5zdHJpY3QoXywgJ3N0cmluZycpO1xuICAgICAgICBnZW9jb2Rlci5zZXRVUkwodXJsaGVscGVyLmJhc2UoKSArIF8gKyAnL2dlb2NvZGUve3F1ZXJ5fS5qc29uJyk7XG4gICAgICAgIHJldHVybiBnZW9jb2RlcjtcbiAgICB9O1xuXG4gICAgZ2VvY29kZXIuc2V0VGlsZUpTT04gPSBmdW5jdGlvbihfKSB7XG4gICAgICAgIHV0aWwuc3RyaWN0KF8sICdvYmplY3QnKTtcbiAgICAgICAgZ2VvY29kZXIuc2V0VVJMKF8uZ2VvY29kZXIpO1xuICAgICAgICByZXR1cm4gZ2VvY29kZXI7XG4gICAgfTtcblxuICAgIGdlb2NvZGVyLnF1ZXJ5VVJMID0gZnVuY3Rpb24oXykge1xuICAgICAgICBpZiAoIWdlb2NvZGVyLmdldFVSTCgpKSB0aHJvdyBuZXcgRXJyb3IoJ0dlb2NvZGluZyBtYXAgSUQgbm90IHNldCcpO1xuICAgICAgICBpZiAodHlwZW9mIF8gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgXy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBhcnRzW2ldID0gZW5jb2RlVVJJQ29tcG9uZW50KF9baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEwuVXRpbC50ZW1wbGF0ZShnZW9jb2Rlci5nZXRVUkwoKSwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBwYXJ0cy5qb2luKCc7JylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEwuVXRpbC50ZW1wbGF0ZShnZW9jb2Rlci5nZXRVUkwoKSwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBlbmNvZGVVUklDb21wb25lbnQoXylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGdlb2NvZGVyLnF1ZXJ5ID0gZnVuY3Rpb24oXywgY2FsbGJhY2spIHtcbiAgICAgICAgdXRpbC5zdHJpY3QoY2FsbGJhY2ssICdmdW5jdGlvbicpO1xuICAgICAgICByZXF1ZXN0KGdlb2NvZGVyLnF1ZXJ5VVJMKF8pLCBmdW5jdGlvbihlcnIsIGpzb24pIHtcbiAgICAgICAgICAgIGlmIChqc29uICYmIChqc29uLmxlbmd0aCB8fCBqc29uLnJlc3VsdHMpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0czoganNvbi5sZW5ndGggPyBqc29uIDoganNvbi5yZXN1bHRzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKGpzb24ucmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICByZXMubGF0bG5nID0gW2pzb24ucmVzdWx0c1swXVswXS5sYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlc3VsdHNbMF1bMF0ubG9uXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGpzb24ucmVzdWx0cyAmJiBqc29uLnJlc3VsdHNbMF1bMF0uYm91bmRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvdW5kcyA9IGpzb24ucmVzdWx0c1swXVswXS5ib3VuZHM7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5sYm91bmRzID0gdXRpbC5sYm91bmRzKHJlcy5ib3VuZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXMpO1xuICAgICAgICAgICAgfSBlbHNlIGNhbGxiYWNrKGVyciB8fCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdlb2NvZGVyO1xuICAgIH07XG5cbiAgICAvLyBhIHJldmVyc2UgZ2VvY29kZTpcbiAgICAvL1xuICAgIC8vICBnZW9jb2Rlci5yZXZlcnNlUXVlcnkoWzgwLCAyMF0pXG4gICAgZ2VvY29kZXIucmV2ZXJzZVF1ZXJ5ID0gZnVuY3Rpb24oXywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHEgPSAnJztcblxuICAgICAgICAvLyBzb3J0IHRocm91Z2ggZGlmZmVyZW50IHdheXMgcGVvcGxlIHJlcHJlc2VudCBsYXQgYW5kIGxvbiBwYWlyc1xuICAgICAgICBmdW5jdGlvbiBub3JtYWxpemUoeCkge1xuICAgICAgICAgICAgaWYgKHgubGF0ICE9PSB1bmRlZmluZWQgJiYgeC5sbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LmxuZyArICcsJyArIHgubGF0O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh4LmxhdCAhPT0gdW5kZWZpbmVkICYmIHgubG9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5sb24gKyAnLCcgKyB4LmxhdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHhbMF0gKyAnLCcgKyB4WzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ubGVuZ3RoICYmIF9bMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgcHRzID0gW107IGkgPCBfLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcHRzLnB1c2gobm9ybWFsaXplKF9baV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEgPSBwdHMuam9pbignOycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcSA9IG5vcm1hbGl6ZShfKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QoZ2VvY29kZXIucXVlcnlVUkwocSksIGZ1bmN0aW9uKGVyciwganNvbikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBqc29uKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdlb2NvZGVyO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIF8gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChfLmluZGV4T2YoJy8nKSA9PSAtMSkgZ2VvY29kZXIuc2V0SUQoXyk7XG4gICAgICAgIGVsc2UgZ2VvY29kZXIuc2V0VVJMKF8pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIF8gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGdlb2NvZGVyLnNldFRpbGVKU09OKF8pO1xuICAgIH1cblxuICAgIHJldHVybiBnZW9jb2Rlcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW9jb2RlciA9IHJlcXVpcmUoJy4vZ2VvY29kZXInKTtcblxudmFyIEdlb2NvZGVyQ29udHJvbCA9IEwuQ29udHJvbC5leHRlbmQoe1xuICAgIGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICAgICAgcG9pbnRab29tOiAxNixcbiAgICAgICAga2VlcE9wZW46IGZhbHNlXG4gICAgfSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICAgICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZ2VvY29kZXIgPSBnZW9jb2RlcihfKTtcbiAgICB9LFxuXG4gICAgc2V0VVJMOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHRoaXMuZ2VvY29kZXIuc2V0VVJMKF8pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZ2V0VVJMOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvY29kZXIuZ2V0VVJMKCk7XG4gICAgfSxcblxuICAgIHNldElEOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHRoaXMuZ2VvY29kZXIuc2V0SUQoXyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBzZXRUaWxlSlNPTjogZnVuY3Rpb24oXykge1xuICAgICAgICB0aGlzLmdlb2NvZGVyLnNldFRpbGVKU09OKF8pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3RvZ2dsZTogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZSkgTC5Eb21FdmVudC5zdG9wKGUpO1xuICAgICAgICBpZiAoTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2FjdGl2ZScpKSB7XG4gICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLl9yZXN1bHRzLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5faW5wdXQuYmx1cigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5faW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9jbG9zZUlmT3BlbjogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2FjdGl2ZScpICYmXG4gICAgICAgICAgICAhdGhpcy5vcHRpb25zLmtlZXBPcGVuKSB7XG4gICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLl9yZXN1bHRzLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5faW5wdXQuYmx1cigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uQWRkOiBmdW5jdGlvbihtYXApIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtY29udHJvbC1tYXBib3gtZ2VvY29kZXIgbGVhZmxldC1iYXIgbGVhZmxldC1jb250cm9sJyksXG4gICAgICAgICAgICBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdsZWFmbGV0LWNvbnRyb2wtbWFwYm94LWdlb2NvZGVyLXRvZ2dsZSBtYXBib3gtaWNvbiBtYXBib3gtaWNvbi1nZW9jb2RlcicsIGNvbnRhaW5lciksXG4gICAgICAgICAgICByZXN1bHRzID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtY29udHJvbC1tYXBib3gtZ2VvY29kZXItcmVzdWx0cycsIGNvbnRhaW5lciksXG4gICAgICAgICAgICB3cmFwID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtY29udHJvbC1tYXBib3gtZ2VvY29kZXItd3JhcCcsIGNvbnRhaW5lciksXG4gICAgICAgICAgICBmb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScsICdsZWFmbGV0LWNvbnRyb2wtbWFwYm94LWdlb2NvZGVyLWZvcm0nLCB3cmFwKSxcbiAgICAgICAgICAgIGlucHV0ICA9IEwuRG9tVXRpbC5jcmVhdGUoJ2lucHV0JywgJycsIGZvcm0pO1xuXG4gICAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgICAgbGluay5pbm5lckhUTUwgPSAnJm5ic3A7JztcblxuICAgICAgICBpbnB1dC50eXBlID0gJ3RleHQnO1xuICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgJ1NlYXJjaCcpO1xuXG4gICAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoZm9ybSwgJ3N1Ym1pdCcsIHRoaXMuX2dlb2NvZGUsIHRoaXMpO1xuICAgICAgICBMLkRvbUV2ZW50LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKGNvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuICAgICAgICB0aGlzLl9yZXN1bHRzID0gcmVzdWx0cztcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fZm9ybSA9IGZvcm07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5rZWVwT3Blbikge1xuICAgICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKGNvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWFwLm9uKCdjbGljaycsIHRoaXMuX2Nsb3NlSWZPcGVuLCB0aGlzKTtcbiAgICAgICAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIobGluaywgJ2NsaWNrJywgdGhpcy5fdG9nZ2xlLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfSxcblxuICAgIF9nZW9jb2RlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdzZWFyY2hpbmcnKTtcblxuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICB2YXIgb25sb2FkID0gTC5iaW5kKGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ3NlYXJjaGluZycpO1xuICAgICAgICAgICAgaWYgKGVyciB8fCAhcmVzcCB8fCAhcmVzcC5yZXN1bHRzIHx8ICFyZXNwLnJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdlcnJvcicsIHtlcnJvcjogZXJyfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc3VsdHMuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3AucmVzdWx0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJlKCdhdXRvc2VsZWN0JywgeyBkYXRhOiByZXNwIH0pO1xuICAgICAgICAgICAgICAgICAgICBjaG9vc2VSZXN1bHQocmVzcC5yZXN1bHRzWzBdWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VJZk9wZW4oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IE1hdGgubWluKHJlc3AucmVzdWx0cy5sZW5ndGgsIDUpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZXNwLnJlc3VsdHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5yZXN1bHRzW2ldW2pdLm5hbWUpIG5hbWUucHVzaChyZXNwLnJlc3VsdHNbaV1bal0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5hbWUubGVuZ3RoKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJycsIHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgci5pbm5lckhUTUwgPSBuYW1lLmpvaW4oJywgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByLmhyZWYgPSAnIyc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIChMLmJpbmQoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihyLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob29zZVJlc3VsdChyZXN1bHRbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMLkRvbUV2ZW50LnN0b3AoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgnc2VsZWN0JywgeyBkYXRhOiByZXN1bHQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSkocmVzcC5yZXN1bHRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5yZXN1bHRzLmxlbmd0aCA+IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdXRvZiA9IEwuRG9tVXRpbC5jcmVhdGUoJ3NwYW4nLCAnJywgdGhpcy5fcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRvZi5pbm5lckhUTUwgPSAnVG9wIDUgb2YgJyArIHJlc3AucmVzdWx0cy5sZW5ndGggKyAnICByZXN1bHRzJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ2ZvdW5kJywgcmVzcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHZhciBjaG9vc2VSZXN1bHQgPSBMLmJpbmQoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmJvdW5kcykge1xuICAgICAgICAgICAgICAgIHZhciBfID0gcmVzdWx0LmJvdW5kcztcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXAuZml0Qm91bmRzKEwubGF0TG5nQm91bmRzKFtbX1sxXSwgX1swXV0sIFtfWzNdLCBfWzJdXV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LmxhdCAhPT0gdW5kZWZpbmVkICYmIHJlc3VsdC5sb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRWaWV3KFtyZXN1bHQubGF0LCByZXN1bHQubG9uXSwgKG1hcC5nZXRab29tKCkgPT09IHVuZGVmaW5lZCkgP1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9pbnRab29tIDpcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5tYXgobWFwLmdldFpvb20oKSwgdGhpcy5vcHRpb25zLnBvaW50Wm9vbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmdlb2NvZGVyLnF1ZXJ5KHRoaXMuX2lucHV0LnZhbHVlLCBvbmxvYWQpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEdlb2NvZGVyQ29udHJvbChfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHV0ZkRlY29kZShjKSB7XG4gICAgaWYgKGMgPj0gOTMpIGMtLTtcbiAgICBpZiAoYyA+PSAzNSkgYy0tO1xuICAgIHJldHVybiBjIC0gMzI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgICAgICB2YXIgaWR4ID0gdXRmRGVjb2RlKGRhdGEuZ3JpZFt5XS5jaGFyQ29kZUF0KHgpKSxcbiAgICAgICAgICAgIGtleSA9IGRhdGEua2V5c1tpZHhdO1xuICAgICAgICByZXR1cm4gZGF0YS5kYXRhW2tleV07XG4gICAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgTXVzdGFjaGUgPSByZXF1aXJlKCdtdXN0YWNoZScpO1xuXG52YXIgR3JpZENvbnRyb2wgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgcGlubmFibGU6IHRydWUsXG4gICAgICAgIGZvbGxvdzogZmFsc2UsXG4gICAgICAgIHNhbml0aXplcjogcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpLFxuICAgICAgICB0b3VjaFRlYXNlcjogdHJ1ZSxcbiAgICAgICAgbG9jYXRpb246IHRydWVcbiAgICB9LFxuXG4gICAgX2N1cnJlbnRDb250ZW50OiAnJyxcblxuICAgIC8vIHBpbm5lZCBtZWFucyB0aGF0IHRoaXMgY29udHJvbCBpcyBvbiBhIGZlYXR1cmUgYW5kIHRoZSB1c2VyIGhhcyBsaWtlbHlcbiAgICAvLyBjbGlja2VkLiBwaW5uZWQgd2lsbCBub3QgYmVjb21lIGZhbHNlIHVubGVzcyB0aGUgdXNlciBjbGlja3Mgb2ZmXG4gICAgLy8gb2YgdGhlIGZlYXR1cmUgb250byBhbm90aGVyIG9yIGNsaWNrcyB4XG4gICAgX3Bpbm5lZDogZmFsc2UsXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB1dGlsLnN0cmljdF9pbnN0YW5jZShfLCBMLkNsYXNzLCAnTC5tYXBib3guZ3JpZExheWVyJyk7XG4gICAgICAgIHRoaXMuX2xheWVyID0gXztcbiAgICB9LFxuXG4gICAgc2V0VGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICAgIHV0aWwuc3RyaWN0KHRlbXBsYXRlLCAnc3RyaW5nJyk7XG4gICAgICAgIHRoaXMub3B0aW9ucy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3RlbXBsYXRlOiBmdW5jdGlvbihmb3JtYXQsIGRhdGEpIHtcbiAgICAgICAgaWYgKCFkYXRhKSByZXR1cm47XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZSB8fCB0aGlzLl9sYXllci5nZXRUaWxlSlNPTigpLnRlbXBsYXRlO1xuICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHZhciBkID0ge307XG4gICAgICAgICAgICBkWydfXycgKyBmb3JtYXQgKyAnX18nXSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNhbml0aXplcihcbiAgICAgICAgICAgICAgICBNdXN0YWNoZS50b19odG1sKHRlbXBsYXRlLCBMLmV4dGVuZChkLCBkYXRhKSkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIGNoYW5nZSB0aGUgY29udGVudCBvZiB0aGUgdG9vbHRpcCBIVE1MIGlmIGl0IGhhcyBjaGFuZ2VkLCBvdGhlcndpc2VcbiAgICAvLyBub29wXG4gICAgX3Nob3c6IGZ1bmN0aW9uKGNvbnRlbnQsIG8pIHtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09IHRoaXMuX2N1cnJlbnRDb250ZW50KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fY3VycmVudENvbnRlbnQgPSBjb250ZW50O1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9sbG93KSB7XG4gICAgICAgICAgICB0aGlzLl9wb3B1cC5zZXRDb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgLnNldExhdExuZyhvLmxhdExuZyk7XG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwLl9wb3B1cCAhPT0gdGhpcy5fcG9wdXApIHRoaXMuX3BvcHVwLm9wZW5Pbih0aGlzLl9tYXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgdGhpcy5fY29udGVudFdyYXBwZXIuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fcGlubmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRDb250ZW50ID0gJyc7XG5cbiAgICAgICAgdGhpcy5fbWFwLmNsb3NlUG9wdXAoKTtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuX2NvbnRlbnRXcmFwcGVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdjbG9zYWJsZScpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfbW91c2VvdmVyOiBmdW5jdGlvbihvKSB7XG4gICAgICAgIGlmIChvLmRhdGEpIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ21hcC1jbGlja2FibGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ21hcC1jbGlja2FibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9waW5uZWQpIHJldHVybjtcblxuICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX3RlbXBsYXRlKCd0ZWFzZXInLCBvLmRhdGEpO1xuICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2hvdyhjb250ZW50LCBvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9tb3VzZW1vdmU6IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bpbm5lZCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb2xsb3cpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9wb3B1cC5zZXRMYXRMbmcoby5sYXRMbmcpO1xuICAgIH0sXG5cbiAgICBfbmF2aWdhdGVUbzogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIHdpbmRvdy50b3AubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICB9LFxuXG4gICAgX2NsaWNrOiBmdW5jdGlvbihvKSB7XG5cbiAgICAgICAgdmFyIGxvY2F0aW9uX2Zvcm1hdHRlZCA9IHRoaXMuX3RlbXBsYXRlKCdsb2NhdGlvbicsIG8uZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9jYXRpb24gJiYgbG9jYXRpb25fZm9ybWF0dGVkICYmXG4gICAgICAgICAgICBsb2NhdGlvbl9mb3JtYXR0ZWQuc2VhcmNoKC9eaHR0cHM/Oi8pID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGVUbyh0aGlzLl90ZW1wbGF0ZSgnbG9jYXRpb24nLCBvLmRhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBpbm5hYmxlKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl90ZW1wbGF0ZSgnZnVsbCcsIG8uZGF0YSk7XG5cbiAgICAgICAgaWYgKCFjb250ZW50ICYmIHRoaXMub3B0aW9ucy50b3VjaFRlYXNlciAmJiBMLkJyb3dzZXIudG91Y2gpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl90ZW1wbGF0ZSgndGVhc2VyJywgby5kYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnY2xvc2FibGUnKTtcbiAgICAgICAgICAgIHRoaXMuX3Bpbm5lZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zaG93KGNvbnRlbnQsIG8pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Bpbm5lZCkge1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2Nsb3NhYmxlJyk7XG4gICAgICAgICAgICB0aGlzLl9waW5uZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9vblBvcHVwQ2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jdXJyZW50Q29udGVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3Bpbm5lZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBfY3JlYXRlQ2xvc2VidXR0b246IGZ1bmN0aW9uKGNvbnRhaW5lciwgZm4pIHtcbiAgICAgICAgdmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJ2Nsb3NlJywgY29udGFpbmVyKTtcblxuICAgICAgICBsaW5rLmlubmVySFRNTCA9ICdjbG9zZSc7XG4gICAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgICAgbGluay50aXRsZSA9ICdjbG9zZSc7XG5cbiAgICAgICAgTC5Eb21FdmVudFxuICAgICAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGZuLCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gbGluaztcbiAgICB9LFxuXG4gICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9tYXAgPSBtYXA7XG5cbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LWNvbnRyb2wtZ3JpZCBtYXAtdG9vbHRpcCcsXG4gICAgICAgICAgICBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUpLFxuICAgICAgICAgICAgY29udGVudFdyYXBwZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwLXRvb2x0aXAtY29udGVudCcpO1xuXG4gICAgICAgIC8vIGhpZGUgdGhlIGNvbnRhaW5lciBlbGVtZW50IGluaXRpYWxseVxuICAgICAgICBjb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2xvc2VidXR0b24oY29udGFpbmVyLCB0aGlzLmhpZGUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGVudFdyYXBwZXIpO1xuXG4gICAgICAgIHRoaXMuX2NvbnRlbnRXcmFwcGVyID0gY29udGVudFdyYXBwZXI7XG4gICAgICAgIHRoaXMuX3BvcHVwID0gbmV3IEwuUG9wdXAoeyBhdXRvUGFuOiBmYWxzZSwgY2xvc2VPbkNsaWNrOiBmYWxzZSB9KTtcblxuICAgICAgICBtYXAub24oJ3BvcHVwY2xvc2UnLCB0aGlzLl9vblBvcHVwQ2xvc2UsIHRoaXMpO1xuXG4gICAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgICAgIC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbihjb250YWluZXIpXG4gICAgICAgICAgICAvLyBhbGxvdyBwZW9wbGUgdG8gc2Nyb2xsIHRvb2x0aXBzIHdpdGggbW91c2V3aGVlbFxuICAgICAgICAgICAgLmFkZExpc3RlbmVyKGNvbnRhaW5lciwgJ21vdXNld2hlZWwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG5cbiAgICAgICAgdGhpcy5fbGF5ZXJcbiAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgdGhpcy5fbW91c2VvdmVyLCB0aGlzKVxuICAgICAgICAgICAgLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZW1vdmUsIHRoaXMpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgdGhpcy5fY2xpY2ssIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG5cbiAgICAgICAgbWFwLm9mZigncG9wdXBjbG9zZScsIHRoaXMuX29uUG9wdXBDbG9zZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fbGF5ZXJcbiAgICAgICAgICAgIC5vZmYoJ21vdXNlb3ZlcicsIHRoaXMuX21vdXNlb3ZlciwgdGhpcylcbiAgICAgICAgICAgIC5vZmYoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlbW92ZSwgdGhpcylcbiAgICAgICAgICAgIC5vZmYoJ2NsaWNrJywgdGhpcy5fY2xpY2ssIHRoaXMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEdyaWRDb250cm9sKF8sIG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICB1cmwgPSByZXF1aXJlKCcuL3VybCcpLFxuICAgIHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKSxcbiAgICBncmlkID0gcmVxdWlyZSgnLi9ncmlkJyk7XG5cbi8vIGZvcmtlZCBmcm9tIGRhbnplbC9MLlVURkdyaWRcbnZhciBHcmlkTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZCh7XG4gICAgaW5jbHVkZXM6IFtMLk1peGluLkV2ZW50cywgcmVxdWlyZSgnLi9sb2FkX3RpbGVqc29uJyldLFxuXG4gICAgb3B0aW9uczoge1xuICAgICAgICB0ZW1wbGF0ZTogZnVuY3Rpb24oKSB7IHJldHVybiAnJzsgfVxuICAgIH0sXG5cbiAgICBfbW91c2VPbjogbnVsbCxcbiAgICBfdGlsZWpzb246IHt9LFxuICAgIF9jYWNoZToge30sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9sb2FkVGlsZUpTT04oXyk7XG4gICAgfSxcblxuICAgIF9zZXRUaWxlSlNPTjogZnVuY3Rpb24oanNvbikge1xuICAgICAgICB1dGlsLnN0cmljdChqc29uLCAnb2JqZWN0Jyk7XG5cbiAgICAgICAgTC5leHRlbmQodGhpcy5vcHRpb25zLCB7XG4gICAgICAgICAgICBncmlkczoganNvbi5ncmlkcyxcbiAgICAgICAgICAgIG1pblpvb206IGpzb24ubWluem9vbSxcbiAgICAgICAgICAgIG1heFpvb206IGpzb24ubWF4em9vbSxcbiAgICAgICAgICAgIGJvdW5kczoganNvbi5ib3VuZHMgJiYgdXRpbC5sYm91bmRzKGpzb24uYm91bmRzKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl90aWxlanNvbiA9IGpzb247XG4gICAgICAgIHRoaXMuX2NhY2hlID0ge307XG4gICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBnZXRUaWxlSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aWxlanNvbjtcbiAgICB9LFxuXG4gICAgYWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX21hcCAmJiB0aGlzLm9wdGlvbnMuZ3JpZHMgJiYgdGhpcy5vcHRpb25zLmdyaWRzLmxlbmd0aCk7XG4gICAgfSxcblxuICAgIGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIG9uQWRkOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuICAgICAgICB0aGlzLl91cGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9tYXBcbiAgICAgICAgICAgIC5vbignY2xpY2snLCB0aGlzLl9jbGljaywgdGhpcylcbiAgICAgICAgICAgIC5vbignbW91c2Vtb3ZlJywgdGhpcy5fbW92ZSwgdGhpcylcbiAgICAgICAgICAgIC5vbignbW92ZWVuZCcsIHRoaXMuX3VwZGF0ZSwgdGhpcyk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbWFwXG4gICAgICAgICAgICAub2ZmKCdjbGljaycsIHRoaXMuX2NsaWNrLCB0aGlzKVxuICAgICAgICAgICAgLm9mZignbW91c2Vtb3ZlJywgdGhpcy5fbW92ZSwgdGhpcylcbiAgICAgICAgICAgIC5vZmYoJ21vdmVlbmQnLCB0aGlzLl91cGRhdGUsIHRoaXMpO1xuICAgIH0sXG5cbiAgICBnZXREYXRhOiBmdW5jdGlvbihsYXRsbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghdGhpcy5hY3RpdmUoKSkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXAsXG4gICAgICAgICAgICBwb2ludCA9IG1hcC5wcm9qZWN0KGxhdGxuZy53cmFwKCkpLFxuICAgICAgICAgICAgdGlsZVNpemUgPSAyNTYsXG4gICAgICAgICAgICByZXNvbHV0aW9uID0gNCxcbiAgICAgICAgICAgIHggPSBNYXRoLmZsb29yKHBvaW50LnggLyB0aWxlU2l6ZSksXG4gICAgICAgICAgICB5ID0gTWF0aC5mbG9vcihwb2ludC55IC8gdGlsZVNpemUpLFxuICAgICAgICAgICAgbWF4ID0gbWFwLm9wdGlvbnMuY3JzLnNjYWxlKG1hcC5nZXRab29tKCkpIC8gdGlsZVNpemU7XG5cbiAgICAgICAgeCA9ICh4ICsgbWF4KSAlIG1heDtcbiAgICAgICAgeSA9ICh5ICsgbWF4KSAlIG1heDtcblxuICAgICAgICB0aGlzLl9nZXRUaWxlKG1hcC5nZXRab29tKCksIHgsIHksIGZ1bmN0aW9uKGdyaWQpIHtcbiAgICAgICAgICAgIHZhciBncmlkWCA9IE1hdGguZmxvb3IoKHBvaW50LnggLSAoeCAqIHRpbGVTaXplKSkgLyByZXNvbHV0aW9uKSxcbiAgICAgICAgICAgICAgICBncmlkWSA9IE1hdGguZmxvb3IoKHBvaW50LnkgLSAoeSAqIHRpbGVTaXplKSkgLyByZXNvbHV0aW9uKTtcblxuICAgICAgICAgICAgY2FsbGJhY2soZ3JpZChncmlkWCwgZ3JpZFkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9jbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLmdldERhdGEoZS5sYXRsbmcsIEwuYmluZChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGxhdExuZzogZS5sYXRsbmcsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgX21vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5nZXREYXRhKGUubGF0bG5nLCBMLmJpbmQoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKGRhdGEgIT09IHRoaXMuX21vdXNlT24pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbW91c2VPbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ21vdXNlb3V0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0TG5nOiBlLmxhdGxuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuX21vdXNlT25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdtb3VzZW92ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgIGxhdExuZzogZS5sYXRsbmcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX21vdXNlT24gPSBkYXRhO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ21vdXNlbW92ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgbGF0TG5nOiBlLmxhdGxuZyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIF9nZXRUaWxlVVJMOiBmdW5jdGlvbih0aWxlUG9pbnQpIHtcbiAgICAgICAgdmFyIHVybHMgPSB0aGlzLm9wdGlvbnMuZ3JpZHMsXG4gICAgICAgICAgICBpbmRleCA9ICh0aWxlUG9pbnQueCArIHRpbGVQb2ludC55KSAlIHVybHMubGVuZ3RoLFxuICAgICAgICAgICAgdXJsID0gdXJsc1tpbmRleF07XG5cbiAgICAgICAgcmV0dXJuIEwuVXRpbC50ZW1wbGF0ZSh1cmwsIHRpbGVQb2ludCk7XG4gICAgfSxcblxuICAgIC8vIExvYWQgdXAgYWxsIHJlcXVpcmVkIGpzb24gZ3JpZCBmaWxlc1xuICAgIF91cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKCkpIHJldHVybjtcblxuICAgICAgICB2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldFBpeGVsQm91bmRzKCksXG4gICAgICAgICAgICB6ID0gdGhpcy5fbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgIHRpbGVTaXplID0gMjU2O1xuXG4gICAgICAgIGlmICh6ID4gdGhpcy5vcHRpb25zLm1heFpvb20gfHwgeiA8IHRoaXMub3B0aW9ucy5taW5ab29tKSByZXR1cm47XG5cbiAgICAgICAgdmFyIG53VGlsZVBvaW50ID0gbmV3IEwuUG9pbnQoXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcihib3VuZHMubWluLnggLyB0aWxlU2l6ZSksXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcihib3VuZHMubWluLnkgLyB0aWxlU2l6ZSkpLFxuICAgICAgICAgICAgc2VUaWxlUG9pbnQgPSBuZXcgTC5Qb2ludChcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yKGJvdW5kcy5tYXgueCAvIHRpbGVTaXplKSxcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yKGJvdW5kcy5tYXgueSAvIHRpbGVTaXplKSksXG4gICAgICAgICAgICBtYXggPSB0aGlzLl9tYXAub3B0aW9ucy5jcnMuc2NhbGUoeikgLyB0aWxlU2l6ZTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gbndUaWxlUG9pbnQueDsgeCA8PSBzZVRpbGVQb2ludC54OyB4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBud1RpbGVQb2ludC55OyB5IDw9IHNlVGlsZVBvaW50Lnk7IHkrKykge1xuICAgICAgICAgICAgICAgIC8vIHggd3JhcHBlZFxuICAgICAgICAgICAgICAgIHZhciB4dyA9ICh4ICsgbWF4KSAlIG1heCwgeXcgPSAoeSArIG1heCkgJSBtYXg7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0VGlsZSh6LCB4dywgeXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRUaWxlOiBmdW5jdGlvbih6LCB4LCB5LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIga2V5ID0geiArICdfJyArIHggKyAnXycgKyB5LFxuICAgICAgICAgICAgdGlsZVBvaW50ID0gTC5wb2ludCh4LCB5KTtcblxuICAgICAgICB0aWxlUG9pbnQueiA9IHo7XG5cbiAgICAgICAgaWYgKCF0aGlzLl90aWxlU2hvdWxkQmVMb2FkZWQodGlsZVBvaW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleSBpbiB0aGlzLl9jYWNoZSkge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFjaykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2NhY2hlW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzLl9jYWNoZVtrZXldKTsgLy8gQWxyZWFkeSBsb2FkZWRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVba2V5XS5wdXNoKGNhbGxiYWNrKTsgLy8gUGVuZGluZ1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jYWNoZVtrZXldID0gW107XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZVtrZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdCh0aGlzLl9nZXRUaWxlVVJMKHRpbGVQb2ludCksIEwuYmluZChmdW5jdGlvbihlcnIsIGpzb24pIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWNoZVtrZXldO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVba2V5XSA9IGdyaWQoanNvbik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrc1tpXSh0aGlzLl9jYWNoZVtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICBfdGlsZVNob3VsZEJlTG9hZGVkOiBmdW5jdGlvbih0aWxlUG9pbnQpIHtcbiAgICAgICAgaWYgKHRpbGVQb2ludC56ID4gdGhpcy5vcHRpb25zLm1heFpvb20gfHwgdGlsZVBvaW50LnogPCB0aGlzLm9wdGlvbnMubWluWm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ib3VuZHMpIHtcbiAgICAgICAgICAgIHZhciB0aWxlU2l6ZSA9IDI1NixcbiAgICAgICAgICAgICAgICBud1BvaW50ID0gdGlsZVBvaW50Lm11bHRpcGx5QnkodGlsZVNpemUpLFxuICAgICAgICAgICAgICAgIHNlUG9pbnQgPSBud1BvaW50LmFkZChuZXcgTC5Qb2ludCh0aWxlU2l6ZSwgdGlsZVNpemUpKSxcbiAgICAgICAgICAgICAgICBudyA9IHRoaXMuX21hcC51bnByb2plY3QobndQb2ludCksXG4gICAgICAgICAgICAgICAgc2UgPSB0aGlzLl9tYXAudW5wcm9qZWN0KHNlUG9pbnQpLFxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBMLkxhdExuZ0JvdW5kcyhbbncsIHNlXSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmJvdW5kcy5pbnRlcnNlY3RzKGJvdW5kcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBHcmlkTGF5ZXIoXywgb3B0aW9ucyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW5mb0NvbnRyb2wgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgICBvcHRpb25zOiB7XG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tcmlnaHQnLFxuICAgICAgICBzYW5pdGl6ZXI6IHJlcXVpcmUoJ3Nhbml0aXplLWNhamEnKVxuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5faW5mbyA9IHt9O1xuICAgIH0sXG5cbiAgICBvbkFkZDogZnVuY3Rpb24obWFwKSB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdtYXBib3gtY29udHJvbC1pbmZvIG1hcGJveC1zbWFsbCcpO1xuICAgICAgICB0aGlzLl9jb250ZW50ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ21hcC1pbmZvLWNvbnRhaW5lcicsIHRoaXMuX2NvbnRhaW5lcik7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9PT0gJ2JvdHRvbXJpZ2h0JyB8fFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID09PSAndG9wcmlnaHQnKSB7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXIuY2xhc3NOYW1lICs9ICcgbWFwYm94LWNvbnRyb2wtaW5mby1yaWdodCc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnbWFwYm94LWluZm8tdG9nZ2xlIG1hcGJveC1pY29uIG1hcGJveC1pY29uLWluZm8nLCB0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBsaW5rLmhyZWYgPSAnIyc7XG5cbiAgICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihsaW5rLCAnY2xpY2snLCB0aGlzLl9zaG93SW5mbywgdGhpcyk7XG4gICAgICAgIEwuRG9tRXZlbnQuZGlzYWJsZUNsaWNrUHJvcGFnYXRpb24odGhpcy5fY29udGFpbmVyKTtcblxuICAgICAgICBmb3IgKHZhciBpIGluIG1hcC5fbGF5ZXJzKSB7XG4gICAgICAgICAgICBpZiAobWFwLl9sYXllcnNbaV0uZ2V0QXR0cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEluZm8obWFwLl9sYXllcnNbaV0uZ2V0QXR0cmlidXRpb24oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBtYXBcbiAgICAgICAgICAgIC5vbignbW92ZWVuZCcsIHRoaXMuX2VkaXRMaW5rLCB0aGlzKVxuICAgICAgICAgICAgLm9uKCdsYXllcmFkZCcsIHRoaXMuX29uTGF5ZXJBZGQsIHRoaXMpXG4gICAgICAgICAgICAub24oJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllclJlbW92ZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXI7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgbWFwXG4gICAgICAgICAgICAub2ZmKCdtb3ZlZW5kJywgdGhpcy5fZWRpdExpbmssIHRoaXMpXG4gICAgICAgICAgICAub2ZmKCdsYXllcmFkZCcsIHRoaXMuX29uTGF5ZXJBZGQsIHRoaXMpXG4gICAgICAgICAgICAub2ZmKCdsYXllcnJlbW92ZScsIHRoaXMuX29uTGF5ZXJSZW1vdmUsIHRoaXMpO1xuICAgIH0sXG5cbiAgICBhZGRJbmZvOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5faW5mb1t0ZXh0XSkgdGhpcy5faW5mb1t0ZXh0XSA9IDA7XG4gICAgICAgIHRoaXMuX2luZm9bdGV4dF0gPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlKCk7XG4gICAgfSxcblxuICAgIHJlbW92ZUluZm86IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGlmICh0aGlzLl9pbmZvW3RleHRdKSB0aGlzLl9pbmZvW3RleHRdID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGUoKTtcbiAgICB9LFxuXG4gICAgX3Nob3dJbmZvOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG4gICAgICAgIGlmICh0aGlzLl9hY3RpdmUgPT09IHRydWUpIHJldHVybiB0aGlzLl9oaWRlY29udGVudCgpO1xuXG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgfSxcblxuICAgIF9oaWRlY29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NvbnRlbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5fbWFwKSB7IHJldHVybiB0aGlzOyB9XG4gICAgICAgIHRoaXMuX2NvbnRlbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIHZhciBoaWRlID0gJ25vbmUnO1xuICAgICAgICB2YXIgaW5mbyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5faW5mbykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2luZm8uaGFzT3duUHJvcGVydHkoaSkgJiYgdGhpcy5faW5mb1tpXSkge1xuICAgICAgICAgICAgICAgIGluZm8ucHVzaCh0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGkpKTtcbiAgICAgICAgICAgICAgICBoaWRlID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NvbnRlbnQuaW5uZXJIVE1MICs9IGluZm8uam9pbignIHwgJyk7XG4gICAgICAgIHRoaXMuX2VkaXRMaW5rKCk7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHJlc3VsdHMgaW4gX2luZm8gdGhlbiBoaWRlIHRoaXMuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gaGlkZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9lZGl0TGluazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5fY29udGVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxpbmsgPSB0aGlzLl9jb250ZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21hcGJveC1pbXByb3ZlLW1hcCcpO1xuICAgICAgICBpZiAobGluay5sZW5ndGggJiYgdGhpcy5fbWFwLl9sb2FkZWQpIHtcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCkud3JhcCgpO1xuICAgICAgICAgICAgdmFyIHRpbGVqc29uID0gdGhpcy5fdGlsZWpzb24gfHwgdGhpcy5fbWFwLl90aWxlanNvbiB8fCB7fTtcbiAgICAgICAgICAgIHZhciBpZCA9IHRpbGVqc29uLmlkIHx8ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmsubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsaW5rW2ldLmhyZWYgPSBsaW5rW2ldLmhyZWYuc3BsaXQoJyMnKVswXSArICcjJyArIGlkICsgJy8nICtcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyLmxuZy50b0ZpeGVkKDMpICsgJy8nICtcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyLmxhdC50b0ZpeGVkKDMpICsgJy8nICtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFwLmdldFpvb20oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfb25MYXllckFkZDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5sYXllci5nZXRBdHRyaWJ1dGlvbiAmJiBlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkSW5mbyhlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKCdvbicgaW4gZS5sYXllciAmJiBlLmxheWVyLmdldEF0dHJpYnV0aW9uKSB7XG4gICAgICAgICAgICBlLmxheWVyLm9uKCdyZWFkeScsIEwuYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEluZm8oZS5sYXllci5nZXRBdHRyaWJ1dGlvbigpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfb25MYXllclJlbW92ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlSW5mbyhlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgSW5mb0NvbnRyb2wob3B0aW9ucyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTGVnZW5kQ29udHJvbCA9IEwuQ29udHJvbC5leHRlbmQoe1xuXG4gICAgb3B0aW9uczoge1xuICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbXJpZ2h0JyxcbiAgICAgICAgc2FuaXRpemVyOiByZXF1aXJlKCdzYW5pdGl6ZS1jYWphJylcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xlZ2VuZHMgPSB7fTtcbiAgICB9LFxuXG4gICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwLWxlZ2VuZHMgd2F4LWxlZ2VuZHMnKTtcbiAgICAgICAgTC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLl9jb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXI7XG4gICAgfSxcblxuICAgIGFkZExlZ2VuZDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICBpZiAoIXRleHQpIHsgcmV0dXJuIHRoaXM7IH1cblxuICAgICAgICBpZiAoIXRoaXMuX2xlZ2VuZHNbdGV4dF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xlZ2VuZHNbdGV4dF0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGVnZW5kc1t0ZXh0XSsrO1xuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlKCk7XG4gICAgfSxcblxuICAgIHJlbW92ZUxlZ2VuZDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICBpZiAoIXRleHQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICAgICAgaWYgKHRoaXMuX2xlZ2VuZHNbdGV4dF0pIHRoaXMuX2xlZ2VuZHNbdGV4dF0tLTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuIHRoaXM7IH1cblxuICAgICAgICB0aGlzLl9jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIHZhciBoaWRlID0gJ25vbmUnO1xuXG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5fbGVnZW5kcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xlZ2VuZHMuaGFzT3duUHJvcGVydHkoaSkgJiYgdGhpcy5fbGVnZW5kc1tpXSkge1xuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbWFwLWxlZ2VuZCB3YXgtbGVnZW5kJywgdGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLnNhbml0aXplcihpKTtcbiAgICAgICAgICAgICAgICBoaWRlID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhpZGUgdGhlIGNvbnRyb2wgZW50aXJlbHkgdW5sZXNzIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBsZWdlbmQ7XG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGVyZSB3aWxsIGJlIGEgc21hbGwgZ3JleSBibGVtaXNoIG9uIHRoZSBtYXAuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gaGlkZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMZWdlbmRDb250cm9sKG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKSxcbiAgICB1cmwgPSByZXF1aXJlKCcuL3VybCcpLFxuICAgIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgX2xvYWRUaWxlSlNPTjogZnVuY3Rpb24oXykge1xuICAgICAgICBpZiAodHlwZW9mIF8gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoXy5pbmRleE9mKCcvJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBfID0gdXJsLmJhc2UoKSArIF8gKyAnLmpzb24nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXF1ZXN0KHVybC5zZWN1cmVGbGFnKF8pLCBMLmJpbmQoZnVuY3Rpb24oZXJyLCBqc29uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB1dGlsLmxvZygnY291bGQgbm90IGxvYWQgVGlsZUpTT04gYXQgJyArIF8pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ2Vycm9yJywge2Vycm9yOiBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VGlsZUpTT04oanNvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgncmVhZHknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXyAmJiB0eXBlb2YgXyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFRpbGVKU09OKF8pO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICB0aWxlTGF5ZXIgPSByZXF1aXJlKCcuL3RpbGVfbGF5ZXInKSxcbiAgICBmZWF0dXJlTGF5ZXIgPSByZXF1aXJlKCcuL2ZlYXR1cmVfbGF5ZXInKSxcbiAgICBncmlkTGF5ZXIgPSByZXF1aXJlKCcuL2dyaWRfbGF5ZXInKSxcbiAgICBncmlkQ29udHJvbCA9IHJlcXVpcmUoJy4vZ3JpZF9jb250cm9sJyksXG4gICAgaW5mb0NvbnRyb2wgPSByZXF1aXJlKCcuL2luZm9fY29udHJvbCcpLFxuICAgIHNoYXJlQ29udHJvbCA9IHJlcXVpcmUoJy4vc2hhcmVfY29udHJvbCcpLFxuICAgIGxlZ2VuZENvbnRyb2wgPSByZXF1aXJlKCcuL2xlZ2VuZF9jb250cm9sJyk7XG5cbnZhciBMTWFwID0gTC5NYXAuZXh0ZW5kKHtcbiAgICBpbmNsdWRlczogW3JlcXVpcmUoJy4vbG9hZF90aWxlanNvbicpXSxcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgdGlsZUxheWVyOiB7fSxcbiAgICAgICAgZmVhdHVyZUxheWVyOiB7fSxcbiAgICAgICAgZ3JpZExheWVyOiB7fSxcbiAgICAgICAgbGVnZW5kQ29udHJvbDoge30sXG4gICAgICAgIGdyaWRDb250cm9sOiB7fSxcbiAgICAgICAgaW5mb0NvbnRyb2w6IHt9LFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlLFxuICAgICAgICBzaGFyZUNvbnRyb2w6IGZhbHNlXG4gICAgfSxcblxuICAgIF90aWxlanNvbjoge30sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihlbGVtZW50LCBfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuTWFwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgZWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gZGlzYWJsZSB0aGUgZGVmYXVsdCAnTGVhZmxldCcgdGV4dFxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGlvbkNvbnRyb2wpIHRoaXMuYXR0cmlidXRpb25Db250cm9sLnNldFByZWZpeCgnJyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aWxlTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZUxheWVyID0gdGlsZUxheWVyKHVuZGVmaW5lZCwgdGhpcy5vcHRpb25zLnRpbGVMYXllcik7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKHRoaXMudGlsZUxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmVhdHVyZUxheWVyID09PSBmYWxzZSB8fCB0aGlzLm9wdGlvbnMubWFya2VyTGF5ZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZmVhdHVyZUxheWVyID0gdGhpcy5vcHRpb25zLm1hcmtlckxheWVyID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLm1hcmtlckxheWVyKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZmVhdHVyZUxheWVyID0gdGhpcy5vcHRpb25zLm1hcmtlckxheWVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mZWF0dXJlTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZmVhdHVyZUxheWVyID0gdGhpcy5tYXJrZXJMYXllciA9XG4gICAgICAgICAgICAgICAgZmVhdHVyZUxheWVyKHVuZGVmaW5lZCwgdGhpcy5vcHRpb25zLmZlYXR1cmVMYXllcik7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKHRoaXMuZmVhdHVyZUxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ3JpZExheWVyKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRMYXllciA9IGdyaWRMYXllcih1bmRlZmluZWQsIHRoaXMub3B0aW9ucy5ncmlkTGF5ZXIpO1xuICAgICAgICAgICAgdGhpcy5hZGRMYXllcih0aGlzLmdyaWRMYXllcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdyaWRMYXllciAmJiB0aGlzLm9wdGlvbnMuZ3JpZENvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZENvbnRyb2wgPSBncmlkQ29udHJvbCh0aGlzLmdyaWRMYXllciwgdGhpcy5vcHRpb25zLmdyaWRDb250cm9sKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29udHJvbCh0aGlzLmdyaWRDb250cm9sKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5mb0NvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuaW5mb0NvbnRyb2wgPSBpbmZvQ29udHJvbCh0aGlzLm9wdGlvbnMuaW5mb0NvbnRyb2wpO1xuICAgICAgICAgICAgdGhpcy5hZGRDb250cm9sKHRoaXMuaW5mb0NvbnRyb2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sZWdlbmRDb250cm9sKSB7XG4gICAgICAgICAgICB0aGlzLmxlZ2VuZENvbnRyb2wgPSBsZWdlbmRDb250cm9sKHRoaXMub3B0aW9ucy5sZWdlbmRDb250cm9sKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29udHJvbCh0aGlzLmxlZ2VuZENvbnRyb2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaGFyZUNvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcmVDb250cm9sID0gc2hhcmVDb250cm9sKHVuZGVmaW5lZCwgdGhpcy5vcHRpb25zLnNoYXJlQ29udHJvbCk7XG4gICAgICAgICAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5zaGFyZUNvbnRyb2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZFRpbGVKU09OKF8pO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgY2VydGFpbiBwcm9wZXJ0aWVzIG9uICdyZWFkeScgZXZlbnRcbiAgICBhZGRMYXllcjogZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgICAgaWYgKCdvbicgaW4gbGF5ZXIpIHsgbGF5ZXIub24oJ3JlYWR5JywgTC5iaW5kKGZ1bmN0aW9uKCkgeyB0aGlzLl91cGRhdGVMYXllcihsYXllcik7IH0sIHRoaXMpKTsgfVxuICAgICAgICByZXR1cm4gTC5NYXAucHJvdG90eXBlLmFkZExheWVyLmNhbGwodGhpcywgbGF5ZXIpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgYSBqYXZhc2NyaXB0IG9iamVjdCBvZiB0aWxlanNvbiBkYXRhIHRvIGNvbmZpZ3VyZSB0aGlzIGxheWVyXG4gICAgX3NldFRpbGVKU09OOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHRoaXMuX3RpbGVqc29uID0gXztcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShfKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGdldFRpbGVKU09OOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbGVqc29uO1xuICAgIH0sXG5cbiAgICBfaW5pdGlhbGl6ZTogZnVuY3Rpb24oanNvbikge1xuICAgICAgICBpZiAodGhpcy50aWxlTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZUxheWVyLl9zZXRUaWxlSlNPTihqc29uKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUxheWVyKHRoaXMudGlsZUxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmZlYXR1cmVMYXllciAmJiAhdGhpcy5mZWF0dXJlTGF5ZXIuZ2V0R2VvSlNPTigpICYmIGpzb24uZGF0YSAmJiBqc29uLmRhdGFbMF0pIHtcbiAgICAgICAgICAgIHRoaXMuZmVhdHVyZUxheWVyLmxvYWRVUkwoanNvbi5kYXRhWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRMYXllcikge1xuICAgICAgICAgICAgdGhpcy5ncmlkTGF5ZXIuX3NldFRpbGVKU09OKGpzb24pO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTGF5ZXIodGhpcy5ncmlkTGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW5mb0NvbnRyb2wgJiYganNvbi5hdHRyaWJ1dGlvbikge1xuICAgICAgICAgICAgdGhpcy5pbmZvQ29udHJvbC5hZGRJbmZvKGpzb24uYXR0cmlidXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGVnZW5kQ29udHJvbCAmJiBqc29uLmxlZ2VuZCkge1xuICAgICAgICAgICAgdGhpcy5sZWdlbmRDb250cm9sLmFkZExlZ2VuZChqc29uLmxlZ2VuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zaGFyZUNvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcmVDb250cm9sLl9zZXRUaWxlSlNPTihqc29uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fbG9hZGVkICYmIGpzb24uY2VudGVyKSB7XG4gICAgICAgICAgICB2YXIgem9vbSA9IGpzb24uY2VudGVyWzJdLFxuICAgICAgICAgICAgICAgIGNlbnRlciA9IEwubGF0TG5nKGpzb24uY2VudGVyWzFdLCBqc29uLmNlbnRlclswXSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVMYXllcjogZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgICAgaWYgKCFsYXllci5vcHRpb25zKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuaW5mb0NvbnRyb2wgJiYgdGhpcy5fbG9hZGVkKSB7XG4gICAgICAgICAgICB0aGlzLmluZm9Db250cm9sLmFkZEluZm8obGF5ZXIub3B0aW9ucy5pbmZvQ29udHJvbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGlvbkNvbnRyb2wgJiYgdGhpcy5fbG9hZGVkICYmIGxheWVyLmdldEF0dHJpYnV0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0aW9uQ29udHJvbC5hZGRBdHRyaWJ1dGlvbihsYXllci5nZXRBdHRyaWJ1dGlvbigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKEwuc3RhbXAobGF5ZXIpIGluIHRoaXMuX3pvb21Cb3VuZExheWVycykgJiZcbiAgICAgICAgICAgICAgICAobGF5ZXIub3B0aW9ucy5tYXhab29tIHx8IGxheWVyLm9wdGlvbnMubWluWm9vbSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3pvb21Cb3VuZExheWVyc1tMLnN0YW1wKGxheWVyKV0gPSBsYXllcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVpvb21MZXZlbHMoKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50LCBfLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMTWFwKGVsZW1lbnQsIF8sIG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHVybCA9IHJlcXVpcmUoJy4vdXJsJyksXG4gICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICAgIHNhbml0aXplID0gcmVxdWlyZSgnc2FuaXRpemUtY2FqYScpO1xuXG4vLyBtYXBib3gtcmVsYXRlZCBtYXJrZXJzIGZ1bmN0aW9uYWxpdHlcbi8vIHByb3ZpZGUgYW4gaWNvbiBmcm9tIG1hcGJveCdzIHNpbXBsZS1zdHlsZSBzcGVjIGFuZCBob3N0ZWQgbWFya2Vyc1xuLy8gc2VydmljZVxuZnVuY3Rpb24gaWNvbihmcCkge1xuICAgIGZwID0gZnAgfHwge307XG5cbiAgICB2YXIgc2l6ZXMgPSB7XG4gICAgICAgICAgICBzbWFsbDogWzIwLCA1MF0sXG4gICAgICAgICAgICBtZWRpdW06IFszMCwgNzBdLFxuICAgICAgICAgICAgbGFyZ2U6IFszNSwgOTBdXG4gICAgICAgIH0sXG4gICAgICAgIHNpemUgPSBmcFsnbWFya2VyLXNpemUnXSB8fCAnbWVkaXVtJyxcbiAgICAgICAgc3ltYm9sID0gKGZwWydtYXJrZXItc3ltYm9sJ10pID8gJy0nICsgZnBbJ21hcmtlci1zeW1ib2wnXSA6ICcnLFxuICAgICAgICBjb2xvciA9IChmcFsnbWFya2VyLWNvbG9yJ10gfHwgJzdlN2U3ZScpLnJlcGxhY2UoJyMnLCAnJyk7XG5cbiAgICByZXR1cm4gTC5pY29uKHtcbiAgICAgICAgaWNvblVybDogdXJsLmJhc2UoKSArICdtYXJrZXIvJyArXG4gICAgICAgICAgICAncGluLScgKyBzaXplLmNoYXJBdCgwKSArIHN5bWJvbCArICcrJyArIGNvbG9yICtcbiAgICAgICAgICAgIC8vIGRldGVjdCBhbmQgdXNlIHJldGluYSBtYXJrZXJzLCB3aGljaCBhcmUgeDIgcmVzb2x1dGlvblxuICAgICAgICAgICAgKChMLkJyb3dzZXIucmV0aW5hKSA/ICdAMngnIDogJycpICsgJy5wbmcnLFxuICAgICAgICBpY29uU2l6ZTogc2l6ZXNbc2l6ZV0sXG4gICAgICAgIGljb25BbmNob3I6IFtzaXplc1tzaXplXVswXSAvIDIsIHNpemVzW3NpemVdWzFdIC8gMl0sXG4gICAgICAgIHBvcHVwQW5jaG9yOiBbMCwgLXNpemVzW3NpemVdWzFdIC8gMl1cbiAgICB9KTtcbn1cblxuLy8gYSBmYWN0b3J5IHRoYXQgcHJvdmlkZXMgbWFya2VycyBmb3IgTGVhZmxldCBmcm9tIE1hcGJveCdzXG4vLyBbc2ltcGxlLXN0eWxlIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvc2ltcGxlc3R5bGUtc3BlYylcbi8vIGFuZCBbTWFya2VycyBBUEldKGh0dHA6Ly9tYXBib3guY29tL2RldmVsb3BlcnMvYXBpLyNtYXJrZXJzKS5cbmZ1bmN0aW9uIHN0eWxlKGYsIGxhdGxvbikge1xuICAgIHJldHVybiBMLm1hcmtlcihsYXRsb24sIHtcbiAgICAgICAgaWNvbjogaWNvbihmLnByb3BlcnRpZXMpLFxuICAgICAgICB0aXRsZTogdXRpbC5zdHJpcF90YWdzKFxuICAgICAgICAgICAgc2FuaXRpemUoKGYucHJvcGVydGllcyAmJiBmLnByb3BlcnRpZXMudGl0bGUpIHx8ICcnKSlcbiAgICB9KTtcbn1cblxuLy8gU2FuaXRpemUgYW5kIGZvcm1hdCBwcm9wZXJ0aWVzIG9mIGEgR2VvSlNPTiBGZWF0dXJlIG9iamVjdCBpbiBvcmRlclxuLy8gdG8gZm9ybSB0aGUgSFRNTCBzdHJpbmcgdXNlZCBhcyB0aGUgYXJndW1lbnQgZm9yIGBMLmNyZWF0ZVBvcHVwYFxuZnVuY3Rpb24gY3JlYXRlUG9wdXAoZiwgc2FuaXRpemVyKSB7XG4gICAgaWYgKCFmIHx8ICFmLnByb3BlcnRpZXMpIHJldHVybiAnJztcbiAgICB2YXIgcG9wdXAgPSAnJztcblxuICAgIGlmIChmLnByb3BlcnRpZXMudGl0bGUpIHtcbiAgICAgICAgcG9wdXAgKz0gJzxkaXYgY2xhc3M9XCJtYXJrZXItdGl0bGVcIj4nICsgZi5wcm9wZXJ0aWVzLnRpdGxlICsgJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgaWYgKGYucHJvcGVydGllcy5kZXNjcmlwdGlvbikge1xuICAgICAgICBwb3B1cCArPSAnPGRpdiBjbGFzcz1cIm1hcmtlci1kZXNjcmlwdGlvblwiPicgKyBmLnByb3BlcnRpZXMuZGVzY3JpcHRpb24gKyAnPC9kaXY+JztcbiAgICB9XG5cbiAgICByZXR1cm4gKHNhbml0aXplciB8fCBzYW5pdGl6ZSkocG9wdXApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpY29uOiBpY29uLFxuICAgIHN0eWxlOiBzdHlsZSxcbiAgICBjcmVhdGVQb3B1cDogY3JlYXRlUG9wdXBcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb3JzbGl0ZSA9IHJlcXVpcmUoJ2NvcnNsaXRlJyksXG4gICAgSlNPTjMgPSByZXF1aXJlKCdqc29uMycpLFxuICAgIHN0cmljdCA9IHJlcXVpcmUoJy4vdXRpbCcpLnN0cmljdDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgc3RyaWN0KHVybCwgJ3N0cmluZycpO1xuICAgIHN0cmljdChjYWxsYmFjaywgJ2Z1bmN0aW9uJyk7XG4gICAgcmV0dXJuIGNvcnNsaXRlKHVybCwgb25sb2FkKTtcbiAgICBmdW5jdGlvbiBvbmxvYWQoZXJyLCByZXNwKSB7XG4gICAgICAgIGlmICghZXJyICYmIHJlc3ApIHtcbiAgICAgICAgICAgIC8vIGhhcmRjb2RlZCBncmlkIHJlc3BvbnNlXG4gICAgICAgICAgICBpZiAocmVzcC5yZXNwb25zZVRleHRbMF0gPT0gJ2cnKSB7XG4gICAgICAgICAgICAgICAgcmVzcCA9IEpTT04zLnBhcnNlKHJlc3AucmVzcG9uc2VUZXh0XG4gICAgICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcoNSwgcmVzcC5yZXNwb25zZVRleHQubGVuZ3RoIC0gMikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwID0gSlNPTjMucGFyc2UocmVzcC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKGVyciwgcmVzcCk7XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHVybCA9IHJlcXVpcmUoJy4vdXJsJyk7XG5cbnZhciBTaGFyZUNvbnRyb2wgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgICBpbmNsdWRlczogW3JlcXVpcmUoJy4vbG9hZF90aWxlanNvbicpXSxcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICAgICAgdXJsOiAnJ1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fbG9hZFRpbGVKU09OKF8pO1xuICAgIH0sXG5cbiAgICBfc2V0VGlsZUpTT046IGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgdGhpcy5fdGlsZWpzb24gPSBqc29uO1xuICAgIH0sXG5cbiAgICBvbkFkZDogZnVuY3Rpb24obWFwKSB7XG4gICAgICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5fdXJsID0gdXJsO1xuXG4gICAgICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1jb250cm9sLW1hcGJveC1zaGFyZSBsZWFmbGV0LWJhcicpO1xuICAgICAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnbWFwYm94LXNoYXJlIG1hcGJveC1pY29uIG1hcGJveC1pY29uLXNoYXJlJywgY29udGFpbmVyKTtcbiAgICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICAgIHRoaXMuX21vZGFsID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ21hcGJveC1tb2RhbCcsIHRoaXMuX21hcC5fY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5fbWFzayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdtYXBib3gtbW9kYWwtbWFzaycsIHRoaXMuX21vZGFsKTtcbiAgICAgICAgdGhpcy5fY29udGVudCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdtYXBib3gtbW9kYWwtY29udGVudCcsIHRoaXMuX21vZGFsKTtcblxuICAgICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGxpbmssICdjbGljaycsIHRoaXMuX3NoYXJlQ2xpY2ssIHRoaXMpO1xuICAgICAgICBMLkRvbUV2ZW50LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKGNvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZWRvd24nLCB0aGlzLl9jbGlja091dCwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9LFxuXG4gICAgX2NsaWNrT3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLl9zaGFyaW5nKSB7XG4gICAgICAgICAgICBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX21vZGFsLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLl9jb250ZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5fc2hhcmluZyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX3NoYXJlQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgTC5Eb21FdmVudC5zdG9wKGUpO1xuICAgICAgICBpZiAodGhpcy5fc2hhcmluZykgcmV0dXJuIHRoaXMuX2NsaWNrT3V0KGUpO1xuXG4gICAgICAgIHZhciB0aWxlanNvbiA9IHRoaXMuX3RpbGVqc29uIHx8IHRoaXMuX21hcC5fdGlsZWpzb24gfHwge30sXG4gICAgICAgICAgICB1cmwgPSBlbmNvZGVVUklDb21wb25lbnQodGhpcy5vcHRpb25zLnVybCB8fCB0aWxlanNvbi53ZWJwYWdlIHx8IHdpbmRvdy5sb2NhdGlvbiksXG4gICAgICAgICAgICBuYW1lID0gZW5jb2RlVVJJQ29tcG9uZW50KHRpbGVqc29uLm5hbWUpLFxuICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLl91cmwuYmFzZSgpICsgdGlsZWpzb24uaWQgKyAnLycgKyB0aGlzLl9tYXAuZ2V0Q2VudGVyKCkubG5nICsgJywnICsgdGhpcy5fbWFwLmdldENlbnRlcigpLmxhdCArICcsJyArIHRoaXMuX21hcC5nZXRab29tKCkgKyAnLzYwMHg2MDAucG5nJyxcbiAgICAgICAgICAgIGVtYmVkID0gdGhpcy5fdXJsLmJhc2UoKSArIHRpbGVqc29uLmlkICsgJy5odG1sP3NlY3VyZScsXG4gICAgICAgICAgICB0d2l0dGVyID0gJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3N0YXR1cz0nICsgbmFtZSArICcgJyArIHVybCxcbiAgICAgICAgICAgIGZhY2Vib29rID0gJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIucGhwP3U9JyArIHVybCArICcmdD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRpbGVqc29uLm5hbWUpLFxuICAgICAgICAgICAgcGludGVyZXN0ID0gJy8vd3d3LnBpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdXJsICsgJyZtZWRpYT0nICsgaW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyB0aWxlanNvbi5uYW1lLFxuICAgICAgICAgICAgc2hhcmUgPSAoXCI8aDM+U2hhcmUgdGhpcyBtYXA8L2gzPlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8ZGl2IGNsYXNzPSdtYXBib3gtc2hhcmUtYnV0dG9ucyc+PGEgY2xhc3M9J21hcGJveC1idXR0b24gbWFwYm94LWJ1dHRvbi1pY29uIG1hcGJveC1pY29uLWZhY2Vib29rJyB0YXJnZXQ9J19ibGFuaycgaHJlZj0ne3tmYWNlYm9va319Jz5GYWNlYm9vazwvYT5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGEgY2xhc3M9J21hcGJveC1idXR0b24gbWFwYm94LWJ1dHRvbi1pY29uIG1hcGJveC1pY29uLXR3aXR0ZXInIHRhcmdldD0nX2JsYW5rJyBocmVmPSd7e3R3aXR0ZXJ9fSc+VHdpdHRlcjwvYT5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGEgY2xhc3M9J21hcGJveC1idXR0b24gbWFwYm94LWJ1dHRvbi1pY29uIG1hcGJveC1pY29uLXBpbnRlcmVzdCcgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9J3t7cGludGVyZXN0fX0nPlBpbnRlcmVzdDwvYT48L2Rpdj5cIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJ3t7dHdpdHRlcn19JywgdHdpdHRlcilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJ3t7ZmFjZWJvb2t9fScsIGZhY2Vib29rKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgne3twaW50ZXJlc3R9fScsIHBpbnRlcmVzdCksXG4gICAgICAgICAgICBlbWJlZFZhbHVlID0gJzxpZnJhbWUgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiNTAwcHhcIiBmcmFtZUJvcmRlcj1cIjBcIiBzcmM9XCJ7e2VtYmVkfX1cIj48L2lmcmFtZT4nLnJlcGxhY2UoJ3t7ZW1iZWR9fScsIGVtYmVkKSxcbiAgICAgICAgICAgIGVtYmVkTGFiZWwgPSAnQ29weSBhbmQgcGFzdGUgdGhpcyA8c3Ryb25nPkhUTUwgY29kZTwvc3Ryb25nPiBpbnRvIGRvY3VtZW50cyB0byBlbWJlZCB0aGlzIG1hcCBvbiB3ZWIgcGFnZXMuJztcblxuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fbW9kYWwsICdhY3RpdmUnKTtcblxuICAgICAgICB0aGlzLl9zaGFyaW5nID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ21hcGJveC1tb2RhbC1ib2R5JywgdGhpcy5fY29udGVudCk7XG4gICAgICAgIHRoaXMuX3NoYXJpbmcuaW5uZXJIVE1MID0gc2hhcmU7XG5cbiAgICAgICAgdmFyIGlucHV0ID0gTC5Eb21VdGlsLmNyZWF0ZSgnaW5wdXQnLCAnbWFwYm94LWVtYmVkJywgdGhpcy5fc2hhcmluZyk7XG4gICAgICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgICAgIGlucHV0LnZhbHVlID0gZW1iZWRWYWx1ZTtcblxuICAgICAgICB2YXIgbGFiZWwgPSBMLkRvbVV0aWwuY3JlYXRlKCdsYWJlbCcsICdtYXBib3gtZW1iZWQtZGVzY3JpcHRpb24nLCB0aGlzLl9zaGFyaW5nKTtcbiAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gZW1iZWRMYWJlbDtcblxuICAgICAgICB2YXIgY2xvc2UgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJ2xlYWZsZXQtcG9wdXAtY2xvc2UtYnV0dG9uJywgdGhpcy5fc2hhcmluZyk7XG4gICAgICAgIGNsb3NlLmhyZWYgPSAnIyc7XG5cbiAgICAgICAgTC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLl9zaGFyaW5nKTtcbiAgICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjbG9zZSwgJ2NsaWNrJywgdGhpcy5fY2xpY2tPdXQsIHRoaXMpO1xuICAgICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGlucHV0LCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnRhcmdldC5mb2N1cygpO1xuICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKF8sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFNoYXJlQ29udHJvbChfLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBzaW1wbGVzdHlsZSBzcGVjIGZvciBwb2x5Z29uIGFuZCBsaW5lc3RyaW5nIGZlYXR1cmVzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L3NpbXBsZXN0eWxlLXNwZWNcbnZhciBkZWZhdWx0cyA9IHtcbiAgICBzdHJva2U6ICcjNTU1NTU1JyxcbiAgICAnc3Ryb2tlLXdpZHRoJzogMixcbiAgICAnc3Ryb2tlLW9wYWNpdHknOiAxLFxuICAgIGZpbGw6ICcjNTU1NTU1JyxcbiAgICAnZmlsbC1vcGFjaXR5JzogMC41XG59O1xuXG52YXIgbWFwcGluZyA9IFtcbiAgICBbJ3N0cm9rZScsICdjb2xvciddLFxuICAgIFsnc3Ryb2tlLXdpZHRoJywgJ3dlaWdodCddLFxuICAgIFsnc3Ryb2tlLW9wYWNpdHknLCAnb3BhY2l0eSddLFxuICAgIFsnZmlsbCcsICdmaWxsQ29sb3InXSxcbiAgICBbJ2ZpbGwtb3BhY2l0eScsICdmaWxsT3BhY2l0eSddXG5dO1xuXG5mdW5jdGlvbiBmYWxsYmFjayhhLCBiKSB7XG4gICAgdmFyIGMgPSB7fTtcbiAgICBmb3IgKHZhciBrIGluIGIpIHtcbiAgICAgICAgaWYgKGFba10gPT09IHVuZGVmaW5lZCkgY1trXSA9IGJba107XG4gICAgICAgIGVsc2UgY1trXSA9IGFba107XG4gICAgfVxuICAgIHJldHVybiBjO1xufVxuXG5mdW5jdGlvbiByZW1hcChhKSB7XG4gICAgdmFyIGQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcHBpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZFttYXBwaW5nW2ldWzFdXSA9IGFbbWFwcGluZ1tpXVswXV07XG4gICAgfVxuICAgIHJldHVybiBkO1xufVxuXG5mdW5jdGlvbiBzdHlsZShmZWF0dXJlKSB7XG4gICAgcmV0dXJuIHJlbWFwKGZhbGxiYWNrKGZlYXR1cmUucHJvcGVydGllcyB8fCB7fSwgZGVmYXVsdHMpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3R5bGU6IHN0eWxlLFxuICAgIGRlZmF1bHRzOiBkZWZhdWx0c1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICB1cmwgPSByZXF1aXJlKCcuL3VybCcpO1xuXG52YXIgVGlsZUxheWVyID0gTC5UaWxlTGF5ZXIuZXh0ZW5kKHtcbiAgICBpbmNsdWRlczogW3JlcXVpcmUoJy4vbG9hZF90aWxlanNvbicpXSxcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgZm9ybWF0OiAncG5nJ1xuICAgIH0sXG5cbiAgICAvLyBodHRwOi8vbWFwYm94LmNvbS9kZXZlbG9wZXJzL2FwaS8jaW1hZ2VfcXVhbGl0eVxuICAgIGZvcm1hdHM6IFtcbiAgICAgICAgJ3BuZycsXG4gICAgICAgIC8vIFBOR1xuICAgICAgICAncG5nMzInLCAncG5nNjQnLCAncG5nMTI4JywgJ3BuZzI1NicsXG4gICAgICAgIC8vIEpQR1xuICAgICAgICAnanBnNzAnLCAnanBnODAnLCAnanBnOTAnXSxcblxuICAgIHNjYWxlUHJlZml4OiAnQDJ4LicsXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgICAgIEwuVGlsZUxheWVyLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgdW5kZWZpbmVkLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl90aWxlanNvbiA9IHt9O1xuXG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGV0ZWN0UmV0aW5hICYmXG4gICAgICAgICAgICBMLkJyb3dzZXIucmV0aW5hICYmIG9wdGlvbnMucmV0aW5hVmVyc2lvbikge1xuICAgICAgICAgICAgXyA9IG9wdGlvbnMucmV0aW5hVmVyc2lvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZm9ybWF0KSB7XG4gICAgICAgICAgICB1dGlsLnN0cmljdF9vbmVvZihvcHRpb25zLmZvcm1hdCwgdGhpcy5mb3JtYXRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvYWRUaWxlSlNPTihfKTtcbiAgICB9LFxuXG4gICAgc2V0Rm9ybWF0OiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHV0aWwuc3RyaWN0KF8sICdzdHJpbmcnKTtcbiAgICAgICAgdGhpcy5vcHRpb25zLmZvcm1hdCA9IF87XG4gICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfYXV0b1NjYWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucyAmJlxuICAgICAgICAgICAgTC5Ccm93c2VyLnJldGluYSAmJlxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRldGVjdFJldGluYSAmJlxuICAgICAgICAgICAgKCF0aGlzLm9wdGlvbnMucmV0aW5hVmVyc2lvbikgJiZcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hdXRvc2NhbGU7XG4gICAgfSxcblxuICAgIC8vIGRpc2FibGUgdGhlIHNldFVybCBmdW5jdGlvbiwgd2hpY2ggaXMgbm90IGF2YWlsYWJsZSBvbiBtYXBib3ggdGlsZWxheWVyc1xuICAgIHNldFVybDogbnVsbCxcblxuICAgIF9zZXRUaWxlSlNPTjogZnVuY3Rpb24oanNvbikge1xuICAgICAgICB1dGlsLnN0cmljdChqc29uLCAnb2JqZWN0Jyk7XG5cbiAgICAgICAgTC5leHRlbmQodGhpcy5vcHRpb25zLCB7XG4gICAgICAgICAgICB0aWxlczoganNvbi50aWxlcyxcbiAgICAgICAgICAgIGF0dHJpYnV0aW9uOiBqc29uLmF0dHJpYnV0aW9uLFxuICAgICAgICAgICAgbWluWm9vbToganNvbi5taW56b29tIHx8IDAsXG4gICAgICAgICAgICBtYXhab29tOiBqc29uLm1heHpvb20gfHwgMTgsXG4gICAgICAgICAgICBhdXRvc2NhbGU6IGpzb24uYXV0b3NjYWxlIHx8IGZhbHNlLFxuICAgICAgICAgICAgdG1zOiBqc29uLnNjaGVtZSA9PT0gJ3RtcycsXG4gICAgICAgICAgICBib3VuZHM6IGpzb24uYm91bmRzICYmIHV0aWwubGJvdW5kcyhqc29uLmJvdW5kcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fdGlsZWpzb24gPSBqc29uO1xuICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZ2V0VGlsZUpTT046IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGlsZWpzb247XG4gICAgfSxcblxuICAgIC8vIHRoaXMgaXMgYW4gZXhjZXB0aW9uIHRvIG1hcGJveC5qcyBuYW1pbmcgcnVsZXMgYmVjYXVzZSBpdCdzIGNhbGxlZFxuICAgIC8vIGJ5IGBMLm1hcGBcbiAgICBnZXRUaWxlVXJsOiBmdW5jdGlvbih0aWxlUG9pbnQpIHtcbiAgICAgICAgdmFyIHRpbGVzID0gdGhpcy5vcHRpb25zLnRpbGVzLFxuICAgICAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKE1hdGguYWJzKHRpbGVQb2ludC54ICsgdGlsZVBvaW50LnkpICUgdGlsZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIHVybCA9IHRpbGVzW2luZGV4XTtcblxuICAgICAgICB2YXIgdGVtcGxhdGVkID0gTC5VdGlsLnRlbXBsYXRlKHVybCwgdGlsZVBvaW50KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVkLnJlcGxhY2UoJy5wbmcnLFxuICAgICAgICAgICAgICAgICh0aGlzLl9hdXRvU2NhbGUoKSA/IHRoaXMuc2NhbGVQcmVmaXggOiAnLicpICsgdGhpcy5vcHRpb25zLmZvcm1hdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gVGlsZUpTT04uVGlsZUxheWVycyBhcmUgYWRkZWQgdG8gdGhlIG1hcCBpbW1lZGlhdGVseSwgc28gdGhhdCB0aGV5IGdldFxuICAgIC8vIHRoZSBkZXNpcmVkIHotaW5kZXgsIGJ1dCBkbyBub3QgdXBkYXRlIHVudGlsIHRoZSBUaWxlSlNPTiBoYXMgYmVlbiBsb2FkZWQuXG4gICAgX3VwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGlsZXMpIHtcbiAgICAgICAgICAgIEwuVGlsZUxheWVyLnByb3RvdHlwZS5fdXBkYXRlLmNhbGwodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihfLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBUaWxlTGF5ZXIoXywgb3B0aW9ucyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxuLy8gUmV0dXJuIHRoZSBiYXNlIHVybCBvZiBhIHNwZWNpZmljIHZlcnNpb24gb2YgTWFwYm94J3MgQVBJLlxuLy9cbi8vIGBoYXNoYCwgaWYgcHJvdmlkZWQgbXVzdCBiZSBhIG51bWJlciBhbmQgaXMgdXNlZCB0byBkaXN0cmlidXRlIHJlcXVlc3RzXG4vLyBhZ2FpbnN0IG11bHRpcGxlIGBDTkFNRWBzIGluIG9yZGVyIHRvIGF2b2lkIGNvbm5lY3Rpb24gbGltaXRzIGluIGJyb3dzZXJzXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpc1NTTDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnaHR0cHM6JyA9PT0gZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgfHwgY29uZmlnLkZPUkNFX0hUVFBTO1xuICAgIH0sXG4gICAgYmFzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIHVzZSBwdWJsaWMgSFRUUCB1cmxzXG4gICAgICAgIC8vIFN1cHBvcnQgSFRUUFMgaWYgdGhlIHVzZXIgaGFzIHNwZWNpZmllZCBIVFRQUyB1cmxzIHRvIHVzZSwgYW5kIHRoaXNcbiAgICAgICAgLy8gcGFnZSBpcyB1bmRlciBIVFRQU1xuICAgICAgICByZXR1cm4gKHRoaXMuaXNTU0woKSA/IGNvbmZpZy5IVFRQU19VUkxTIDogY29uZmlnLkhUVFBfVVJMUylbMF07XG4gICAgfSxcbiAgICAvLyBSZXF1ZXN0cyB0aGF0IGNvbnRhaW4gVVJMcyBuZWVkIGEgc2VjdXJlIGZsYWcgYXBwZW5kZWRcbiAgICAvLyB0byB0aGVpciBVUkxzIHNvIHRoYXQgdGhlIHNlcnZlciBrbm93cyB0byBzZW5kIFNTTC1pZmllZFxuICAgIC8vIHJlc291cmNlIHJlZmVyZW5jZXMuXG4gICAgc2VjdXJlRmxhZzogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1NTTCgpKSByZXR1cm4gdXJsO1xuICAgICAgICBlbHNlIGlmICh1cmwubWF0Y2goLyhcXD98JilzZWN1cmUvKSkgcmV0dXJuIHVybDtcbiAgICAgICAgZWxzZSBpZiAodXJsLmluZGV4T2YoJz8nKSAhPT0gLTEpIHJldHVybiB1cmwgKyAnJnNlY3VyZSc7XG4gICAgICAgIGVsc2UgcmV0dXJuIHVybCArICc/c2VjdXJlJztcbiAgICB9LFxuICAgIC8vIENvbnZlcnQgYSBKU09OUCB1cmwgdG8gYSBKU09OIFVSTC4gKE1hcGJveCBUaWxlSlNPTiBzb21ldGltZXMgaGFyZGNvZGVzIEpTT05QLilcbiAgICBqc29uaWZ5OiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC4oZ2VvKT9qc29ucCg/PSR8XFw/KS8sICcuJDFqc29uJyk7XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaWRVcmw6IGZ1bmN0aW9uKF8sIHQpIHtcbiAgICAgICAgaWYgKF8uaW5kZXhPZignLycpID09IC0xKSB0LmxvYWRJRChfKTtcbiAgICAgICAgZWxzZSB0LmxvYWRVUkwoXyk7XG4gICAgfSxcbiAgICBsb2c6IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgaWYgKGNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHN0cmljdDogZnVuY3Rpb24oXywgdHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIF8gIT09IHR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudDogJyArIHR5cGUgKyAnIGV4cGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHN0cmljdF9pbnN0YW5jZTogZnVuY3Rpb24oXywga2xhc3MsIG5hbWUpIHtcbiAgICAgICAgaWYgKCEoXyBpbnN0YW5jZW9mIGtsYXNzKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50OiAnICsgbmFtZSArICcgZXhwZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc3RyaWN0X29uZW9mOiBmdW5jdGlvbihfLCB2YWx1ZXMpIHtcbiAgICAgICAgaWYgKCFjb250YWlucyhfLCB2YWx1ZXMpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnQ6ICcgKyBfICsgJyBnaXZlbiwgdmFsaWQgdmFsdWVzIGFyZSAnICtcbiAgICAgICAgICAgICAgICB2YWx1ZXMuam9pbignLCAnKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHN0cmlwX3RhZ3M6IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgcmV0dXJuIF8ucmVwbGFjZSgvPFtePF0rPi9nLCAnJyk7XG4gICAgfSxcbiAgICBsYm91bmRzOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIC8vIGxlYWZsZXQtY29tcGF0aWJsZSBib3VuZHMsIHNpbmNlIGxlYWZsZXQgZG9lcyBub3QgZG8gZ2VvanNvblxuICAgICAgICByZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKFtbX1sxXSwgX1swXV0sIFtfWzNdLCBfWzJdXV0pO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGNvbnRhaW5zKGl0ZW0sIGxpc3QpIHtcbiAgICBpZiAoIWxpc3QgfHwgIWxpc3QubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChsaXN0W2ldID09IGl0ZW0pIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG4iXX0=
