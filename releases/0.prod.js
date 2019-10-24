exports.ids = [0];
exports.modules = {

/***/ "./src/ValClient.js":
/*!**************************!*\
  !*** ./src/ValClient.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = __webpack_require__(/*! discord.js */ "discord.js"),
    Client = _require.Client; // const Loaders = require('./loaders')
//TODO: use object instead of array for commands


module.exports =
/*#__PURE__*/
function (_Client) {
  _inherits(ValClient, _Client);

  function ValClient() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ValClient);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ValClient).call(this, options));

    _this.initialiseLoaders(); //TODO: add initialise loaders


    return _this;
  }

  _createClass(ValClient, [{
    key: "login",
    value: function () {
      var _login = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var token,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                token = _args.length > 0 && _args[0] !== undefined ? _args[0] : process.env.AUTH_TOKEN;
                _context.prev = 1;
                _context.next = 4;
                return _get(_getPrototypeOf(ValClient.prototype), "login", this).call(this, token);

              case 4:
                _context.next = 9;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context["catch"](1);
                this.setTimeout(this.login, 5000);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 6]]);
      }));

      function login() {
        return _login.apply(this, arguments);
      }

      return login;
    }()
  }, {
    key: "runCommand",
    value: function () {
      var _runCommand = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(command, context, args) {
        var deepSubcmd, verify;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(context.guild && !command.hidden)) {
                  _context2.next = 7;
                  break;
                }

                deepSubcmd = function deepSubcmd(c, a) {
                  var _a = _slicedToArray(a, 1),
                      arg = _a[0];

                  var cmd = c.subcommands ? c.subcommands.find(function (s) {
                    return s.name.toLowerCase() === arg || s.aliases && s.aliases.includes(arg);
                  }) : null;
                  return cmd ? deepSubcmd(cmd, a.slice(1)) : c;
                };

                _context2.next = 4;
                return this.modules.commandRules.verifyCommand(deepSubcmd(command, args), context);

              case 4:
                verify = _context2.sent;

                if (verify) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return");

              case 7:
                return _context2.abrupt("return", command._run(context, args)["catch"](this.logError));

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function runCommand(_x, _x2, _x3) {
        return _runCommand.apply(this, arguments);
      }

      return runCommand;
    }() // async initializeLoaders () {
    //   //Load loaders from file
    //   for (const name in Loaders) {
    //     const loader = new Loaders[name](this)
    //     let success = false
    //     try {
    //       success = await loader.load()
    //     } catch (e) {
    //       this.logError(e)
    //     } finally {
    //       if (!success && loader.critical) process.exit(1)
    //     }
    //   }
    // }

  }]);

  return ValClient;
}(Client);

/***/ })

};;
//# sourceMappingURL=0.prod.js.map