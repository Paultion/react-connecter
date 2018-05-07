'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uniqid = require('uniqid');

var _uniqid2 = _interopRequireDefault(_uniqid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('connect-store');

/**
 * @param store
 * @returns {string[]}
 */
var getMethods = function getMethods(store) {
  var methods = Object.getOwnPropertyNames(store).filter(function (k) {
    return !/^_/.test(k) && typeof Object.getOwnPropertyDescriptor(store, k).value === 'function';
  });
  if (Object.getPrototypeOf(store).constructor.name !== 'Object') {
    var parentMethods = getMethods(Object.getPrototypeOf(store));
    parentMethods.forEach(function (method) {
      if (!methods.includes(method)) methods.push(method);
    });
  }
  return methods;
};

exports.default = function (View, store) {
  var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!View) return null;
  if (!store) return _react2.default.createElement(View, { data: {}, actions: {}, props: props });

  if (!store._views) {
    store._views = [];
    store._components = [];
  }

  if (store._views.includes(View)) return store._components[store._views.findIndex(View)];

  var hasMounted = store._components.length > 0;

  var getKeys = function getKeys(store) {
    return Object.getOwnPropertyNames(store).filter(function (k) {
      return !/^_/.test(k);
    });
  };
  var keys = getKeys(store);

  var methods = getMethods(store);

  var getState = function getState(_) {
    return keys.reduce(function (state, key) {
      state[key] = store[key];
      store['_' + key] = store[key];
      return state;
    }, {});
  };

  var key = _uniqid2.default.time();

  var Connector = function (_Component) {
    _inherits(Connector, _Component);

    function Connector(props) {
      _classCallCheck(this, Connector);

      // start sync queue
      var _this = _possibleConstructorReturn(this, (Connector.__proto__ || Object.getPrototypeOf(Connector)).call(this, props));

      _this.state = getState();
      _this._syncQueue = [];
      _this._interval = setInterval(function (_) {
        if (_this._syncQueue.length > 0) {
          try {
            _this.setState(Object.assign.apply(Object, _toConsumableArray(_this._syncQueue)));
          } catch (error) {
            console.error(error);
          }
          _this._syncQueue = [];
        }
      });

      // Define getters/setters
      function defineGettersSetters(store, keys) {
        var _this2 = this;

        Object.defineProperties(store, keys.reduce(function (memo, key) {
          var setter = store.__lookupSetter__(key);
          var privateKey = '_' + key;
          var connector = _this2;
          // if (['Object', 'Array'].includes(store[key] && store[key].constructor.name)) {
          //   defineGettersSetters.call(this, store, getKeys(store[key]));
          // }
          // console.log(key, '=111=')
          // console.log(store[key], '=222=')
          memo[key] = {
            set: function set(value) {
              setter && setter.bind(this)(value);
              this[privateKey] = value;
              connector._syncQueue.push(_defineProperty({}, key, value));
            },
            get: function get() {
              return this[privateKey];
            }
          };
          return memo;
        }, {}));
      }

      defineGettersSetters.call(_this, store, keys);
      console.log(store);

      // Transform actions
      _this._actions = methods.reduce(function (memo, method) {
        if (['constructor', 'destroy', 'willLoad', 'load'].includes(method)) return memo;
        var actionName = 'on' + method.slice(0, 1).toUpperCase() + method.slice(1);
        memo[actionName] = function () {
          store[method].apply(store, arguments);
        };
        return memo;
      }, {});
      return _this;
    }

    _createClass(Connector, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        !hasMounted && store.willLoad && store.willLoad();
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        !hasMounted && store.load && store.load();
      }
    }, {
      key: 'componentWillUpdate',
      value: function componentWillUpdate() {
        !hasMounted && store.willUpdate && store.willUpdate();
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate() {
        !hasMounted && store.update && store.update();
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        clearInterval(this._interval);
        this._syncQueue = [];
        this._actions = null;
        if (!hasMounted) {
          store._components = null;
          store.destroy && store.destroy();
        }
      }
    }, {
      key: 'render',
      value: function render() {
        debug('Render View:' + (View.name || 'Anonymous') + ':' + key + ' connected Store:' + store.constructor.name);
        return _react2.default.createElement(View, _extends({ data: this.state, actions: this._actions }, props));
      }
    }]);

    return Connector;
  }(_react.Component);

  var component = _react2.default.createElement(Connector, { key: key });

  store._views.push(View);
  store._components.push(component);
  return component;
};