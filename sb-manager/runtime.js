var Jm = Object.create;
var ko = Object.defineProperty;
var eh = Object.getOwnPropertyDescriptor;
var th = Object.getOwnPropertyNames;
var rh = Object.getPrototypeOf, nh = Object.prototype.hasOwnProperty;
var a = (e, t) => ko(e, "name", { value: t, configurable: !0 }), br = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy <
"u" ? new Proxy(e, {
  get: (t, r) => (typeof require < "u" ? require : t)[r]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var K = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var oh = (e, t, r, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let i of th(t))
      !nh.call(e, i) && i !== r && ko(e, i, { get: () => t[i], enumerable: !(n = eh(t, i)) || n.enumerable });
  return e;
};
var Fe = (e, t, r) => (r = e != null ? Jm(rh(e)) : {}, oh(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? ko(r, "default", { value: e, enumerable: !0 }) : r,
  e
));

// ../node_modules/prop-types/lib/ReactPropTypesSecret.js
var Is = K((jE, bs) => {
  "use strict";
  var ah = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  bs.exports = ah;
});

// ../node_modules/prop-types/factoryWithThrowingShims.js
var Es = K((UE, ws) => {
  "use strict";
  var sh = Is();
  function Ss() {
  }
  a(Ss, "emptyFunction");
  function xs() {
  }
  a(xs, "emptyFunctionWithReset");
  xs.resetWarningCache = Ss;
  ws.exports = function() {
    function e(n, i, o, s, u, c) {
      if (c !== sh) {
        var p = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. \
Read more at http://fb.me/use-check-prop-types"
        );
        throw p.name = "Invariant Violation", p;
      }
    }
    a(e, "shim"), e.isRequired = e;
    function t() {
      return e;
    }
    a(t, "getShim");
    var r = {
      array: e,
      bigint: e,
      bool: e,
      func: e,
      number: e,
      object: e,
      string: e,
      symbol: e,
      any: e,
      arrayOf: t,
      element: e,
      elementType: e,
      instanceOf: t,
      node: e,
      objectOf: t,
      oneOf: t,
      oneOfType: t,
      shape: t,
      exact: t,
      checkPropTypes: xs,
      resetWarningCache: Ss
    };
    return r.PropTypes = r, r;
  };
});

// ../node_modules/prop-types/index.js
var Lo = K((QE, Cs) => {
  Cs.exports = Es()();
  var GE, YE;
});

// ../node_modules/react-fast-compare/index.js
var _s = K((XE, Ts) => {
  var lh = typeof Element < "u", uh = typeof Map == "function", ch = typeof Set == "function", ph = typeof ArrayBuffer == "function" && !!ArrayBuffer.
  isView;
  function Xr(e, t) {
    if (e === t) return !0;
    if (e && t && typeof e == "object" && typeof t == "object") {
      if (e.constructor !== t.constructor) return !1;
      var r, n, i;
      if (Array.isArray(e)) {
        if (r = e.length, r != t.length) return !1;
        for (n = r; n-- !== 0; )
          if (!Xr(e[n], t[n])) return !1;
        return !0;
      }
      var o;
      if (uh && e instanceof Map && t instanceof Map) {
        if (e.size !== t.size) return !1;
        for (o = e.entries(); !(n = o.next()).done; )
          if (!t.has(n.value[0])) return !1;
        for (o = e.entries(); !(n = o.next()).done; )
          if (!Xr(n.value[1], t.get(n.value[0]))) return !1;
        return !0;
      }
      if (ch && e instanceof Set && t instanceof Set) {
        if (e.size !== t.size) return !1;
        for (o = e.entries(); !(n = o.next()).done; )
          if (!t.has(n.value[0])) return !1;
        return !0;
      }
      if (ph && ArrayBuffer.isView(e) && ArrayBuffer.isView(t)) {
        if (r = e.length, r != t.length) return !1;
        for (n = r; n-- !== 0; )
          if (e[n] !== t[n]) return !1;
        return !0;
      }
      if (e.constructor === RegExp) return e.source === t.source && e.flags === t.flags;
      if (e.valueOf !== Object.prototype.valueOf && typeof e.valueOf == "function" && typeof t.valueOf == "function") return e.valueOf() ===
      t.valueOf();
      if (e.toString !== Object.prototype.toString && typeof e.toString == "function" && typeof t.toString == "function") return e.toString() ===
      t.toString();
      if (i = Object.keys(e), r = i.length, r !== Object.keys(t).length) return !1;
      for (n = r; n-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(t, i[n])) return !1;
      if (lh && e instanceof Element) return !1;
      for (n = r; n-- !== 0; )
        if (!((i[n] === "_owner" || i[n] === "__v" || i[n] === "__o") && e.$$typeof) && !Xr(e[i[n]], t[i[n]]))
          return !1;
      return !0;
    }
    return e !== e && t !== t;
  }
  a(Xr, "equal");
  Ts.exports = /* @__PURE__ */ a(function(t, r) {
    try {
      return Xr(t, r);
    } catch (n) {
      if ((n.message || "").match(/stack|recursion/i))
        return console.warn("react-fast-compare cannot handle circular refs"), !1;
      throw n;
    }
  }, "isEqual");
});

// ../node_modules/invariant/browser.js
var Os = K((JE, ks) => {
  "use strict";
  var dh = /* @__PURE__ */ a(function(e, t, r, n, i, o, s, u) {
    if (!e) {
      var c;
      if (t === void 0)
        c = new Error(
          "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."
        );
      else {
        var p = [r, n, i, o, s, u], d = 0;
        c = new Error(
          t.replace(/%s/g, function() {
            return p[d++];
          })
        ), c.name = "Invariant Violation";
      }
      throw c.framesToPop = 1, c;
    }
  }, "invariant");
  ks.exports = dh;
});

// ../node_modules/shallowequal/index.js
var As = K((tC, Ps) => {
  Ps.exports = /* @__PURE__ */ a(function(t, r, n, i) {
    var o = n ? n.call(i, t, r) : void 0;
    if (o !== void 0)
      return !!o;
    if (t === r)
      return !0;
    if (typeof t != "object" || !t || typeof r != "object" || !r)
      return !1;
    var s = Object.keys(t), u = Object.keys(r);
    if (s.length !== u.length)
      return !1;
    for (var c = Object.prototype.hasOwnProperty.bind(r), p = 0; p < s.length; p++) {
      var d = s[p];
      if (!c(d))
        return !1;
      var h = t[d], f = r[d];
      if (o = n ? n.call(i, h, f, d) : void 0, o === !1 || o === void 0 && h !== f)
        return !1;
    }
    return !0;
  }, "shallowEqual");
});

// ../node_modules/lodash/isObject.js
var Sn = K((PP, Jl) => {
  function fg(e) {
    var t = typeof e;
    return e != null && (t == "object" || t == "function");
  }
  a(fg, "isObject");
  Jl.exports = fg;
});

// ../node_modules/lodash/_freeGlobal.js
var tu = K((MP, eu) => {
  var mg = typeof global == "object" && global && global.Object === Object && global;
  eu.exports = mg;
});

// ../node_modules/lodash/_root.js
var Zo = K((DP, ru) => {
  var hg = tu(), gg = typeof self == "object" && self && self.Object === Object && self, yg = hg || gg || Function("return this")();
  ru.exports = yg;
});

// ../node_modules/lodash/now.js
var ou = K((LP, nu) => {
  var vg = Zo(), bg = /* @__PURE__ */ a(function() {
    return vg.Date.now();
  }, "now");
  nu.exports = bg;
});

// ../node_modules/lodash/_trimmedEndIndex.js
var au = K((FP, iu) => {
  var Ig = /\s/;
  function Sg(e) {
    for (var t = e.length; t-- && Ig.test(e.charAt(t)); )
      ;
    return t;
  }
  a(Sg, "trimmedEndIndex");
  iu.exports = Sg;
});

// ../node_modules/lodash/_baseTrim.js
var lu = K((BP, su) => {
  var xg = au(), wg = /^\s+/;
  function Eg(e) {
    return e && e.slice(0, xg(e) + 1).replace(wg, "");
  }
  a(Eg, "baseTrim");
  su.exports = Eg;
});

// ../node_modules/lodash/_Symbol.js
var Jo = K((zP, uu) => {
  var Cg = Zo(), Tg = Cg.Symbol;
  uu.exports = Tg;
});

// ../node_modules/lodash/_getRawTag.js
var fu = K(($P, du) => {
  var cu = Jo(), pu = Object.prototype, _g = pu.hasOwnProperty, kg = pu.toString, _r = cu ? cu.toStringTag : void 0;
  function Og(e) {
    var t = _g.call(e, _r), r = e[_r];
    try {
      e[_r] = void 0;
      var n = !0;
    } catch {
    }
    var i = kg.call(e);
    return n && (t ? e[_r] = r : delete e[_r]), i;
  }
  a(Og, "getRawTag");
  du.exports = Og;
});

// ../node_modules/lodash/_objectToString.js
var hu = K((KP, mu) => {
  var Pg = Object.prototype, Ag = Pg.toString;
  function Mg(e) {
    return Ag.call(e);
  }
  a(Mg, "objectToString");
  mu.exports = Mg;
});

// ../node_modules/lodash/_baseGetTag.js
var bu = K((jP, vu) => {
  var gu = Jo(), Dg = fu(), Lg = hu(), Ng = "[object Null]", Fg = "[object Undefined]", yu = gu ? gu.toStringTag : void 0;
  function Hg(e) {
    return e == null ? e === void 0 ? Fg : Ng : yu && yu in Object(e) ? Dg(e) : Lg(e);
  }
  a(Hg, "baseGetTag");
  vu.exports = Hg;
});

// ../node_modules/lodash/isObjectLike.js
var Su = K((qP, Iu) => {
  function Bg(e) {
    return e != null && typeof e == "object";
  }
  a(Bg, "isObjectLike");
  Iu.exports = Bg;
});

// ../node_modules/lodash/isSymbol.js
var wu = K((YP, xu) => {
  var Rg = bu(), zg = Su(), $g = "[object Symbol]";
  function Wg(e) {
    return typeof e == "symbol" || zg(e) && Rg(e) == $g;
  }
  a(Wg, "isSymbol");
  xu.exports = Wg;
});

// ../node_modules/lodash/toNumber.js
var _u = K((XP, Tu) => {
  var Kg = lu(), Eu = Sn(), Vg = wu(), Cu = NaN, jg = /^[-+]0x[0-9a-f]+$/i, Ug = /^0b[01]+$/i, qg = /^0o[0-7]+$/i, Gg = parseInt;
  function Yg(e) {
    if (typeof e == "number")
      return e;
    if (Vg(e))
      return Cu;
    if (Eu(e)) {
      var t = typeof e.valueOf == "function" ? e.valueOf() : e;
      e = Eu(t) ? t + "" : t;
    }
    if (typeof e != "string")
      return e === 0 ? e : +e;
    e = Kg(e);
    var r = Ug.test(e);
    return r || qg.test(e) ? Gg(e.slice(2), r ? 2 : 8) : jg.test(e) ? Cu : +e;
  }
  a(Yg, "toNumber");
  Tu.exports = Yg;
});

// ../node_modules/lodash/debounce.js
var ti = K((JP, Ou) => {
  var Qg = Sn(), ei = ou(), ku = _u(), Xg = "Expected a function", Zg = Math.max, Jg = Math.min;
  function ey(e, t, r) {
    var n, i, o, s, u, c, p = 0, d = !1, h = !1, f = !0;
    if (typeof e != "function")
      throw new TypeError(Xg);
    t = ku(t) || 0, Qg(r) && (d = !!r.leading, h = "maxWait" in r, o = h ? Zg(ku(r.maxWait) || 0, t) : o, f = "trailing" in r ? !!r.trailing :
    f);
    function b(T) {
      var _ = n, k = i;
      return n = i = void 0, p = T, s = e.apply(k, _), s;
    }
    a(b, "invokeFunc");
    function m(T) {
      return p = T, u = setTimeout(C, t), d ? b(T) : s;
    }
    a(m, "leadingEdge");
    function v(T) {
      var _ = T - c, k = T - p, w = t - _;
      return h ? Jg(w, o - k) : w;
    }
    a(v, "remainingWait");
    function S(T) {
      var _ = T - c, k = T - p;
      return c === void 0 || _ >= t || _ < 0 || h && k >= o;
    }
    a(S, "shouldInvoke");
    function C() {
      var T = ei();
      if (S(T))
        return g(T);
      u = setTimeout(C, v(T));
    }
    a(C, "timerExpired");
    function g(T) {
      return u = void 0, f && n ? b(T) : (n = i = void 0, s);
    }
    a(g, "trailingEdge");
    function y() {
      u !== void 0 && clearTimeout(u), p = 0, n = c = i = u = void 0;
    }
    a(y, "cancel");
    function I() {
      return u === void 0 ? s : g(ei());
    }
    a(I, "flush");
    function E() {
      var T = ei(), _ = S(T);
      if (n = arguments, i = this, c = T, _) {
        if (u === void 0)
          return m(c);
        if (h)
          return clearTimeout(u), u = setTimeout(C, t), b(c);
      }
      return u === void 0 && (u = setTimeout(C, t)), s;
    }
    return a(E, "debounced"), E.cancel = y, E.flush = I, E;
  }
  a(ey, "debounce");
  Ou.exports = ey;
});

// ../node_modules/lodash/throttle.js
var Au = K((tA, Pu) => {
  var ty = ti(), ry = Sn(), ny = "Expected a function";
  function oy(e, t, r) {
    var n = !0, i = !0;
    if (typeof e != "function")
      throw new TypeError(ny);
    return ry(r) && (n = "leading" in r ? !!r.leading : n, i = "trailing" in r ? !!r.trailing : i), ty(e, t, {
      leading: n,
      maxWait: t,
      trailing: i
    });
  }
  a(oy, "throttle");
  Pu.exports = oy;
});

// ../node_modules/memoizerific/memoizerific.js
var xn = K((Mu, ri) => {
  (function(e) {
    if (typeof Mu == "object" && typeof ri < "u")
      ri.exports = e();
    else if (typeof define == "function" && define.amd)
      define([], e);
    else {
      var t;
      typeof window < "u" ? t = window : typeof global < "u" ? t = global : typeof self < "u" ? t = self : t = this, t.memoizerific = e();
    }
  })(function() {
    var e, t, r;
    return (/* @__PURE__ */ a(function n(i, o, s) {
      function u(d, h) {
        if (!o[d]) {
          if (!i[d]) {
            var f = typeof br == "function" && br;
            if (!h && f) return f(d, !0);
            if (c) return c(d, !0);
            var b = new Error("Cannot find module '" + d + "'");
            throw b.code = "MODULE_NOT_FOUND", b;
          }
          var m = o[d] = { exports: {} };
          i[d][0].call(m.exports, function(v) {
            var S = i[d][1][v];
            return u(S || v);
          }, m, m.exports, n, i, o, s);
        }
        return o[d].exports;
      }
      a(u, "s");
      for (var c = typeof br == "function" && br, p = 0; p < s.length; p++) u(s[p]);
      return u;
    }, "e"))({ 1: [function(n, i, o) {
      i.exports = function(s) {
        if (typeof Map != "function" || s) {
          var u = n("./similar");
          return new u();
        } else
          return /* @__PURE__ */ new Map();
      };
    }, { "./similar": 2 }], 2: [function(n, i, o) {
      function s() {
        return this.list = [], this.lastItem = void 0, this.size = 0, this;
      }
      a(s, "Similar"), s.prototype.get = function(u) {
        var c;
        if (this.lastItem && this.isEqual(this.lastItem.key, u))
          return this.lastItem.val;
        if (c = this.indexOf(u), c >= 0)
          return this.lastItem = this.list[c], this.list[c].val;
      }, s.prototype.set = function(u, c) {
        var p;
        return this.lastItem && this.isEqual(this.lastItem.key, u) ? (this.lastItem.val = c, this) : (p = this.indexOf(u), p >= 0 ? (this.lastItem =
        this.list[p], this.list[p].val = c, this) : (this.lastItem = { key: u, val: c }, this.list.push(this.lastItem), this.size++, this));
      }, s.prototype.delete = function(u) {
        var c;
        if (this.lastItem && this.isEqual(this.lastItem.key, u) && (this.lastItem = void 0), c = this.indexOf(u), c >= 0)
          return this.size--, this.list.splice(c, 1)[0];
      }, s.prototype.has = function(u) {
        var c;
        return this.lastItem && this.isEqual(this.lastItem.key, u) ? !0 : (c = this.indexOf(u), c >= 0 ? (this.lastItem = this.list[c], !0) :
        !1);
      }, s.prototype.forEach = function(u, c) {
        var p;
        for (p = 0; p < this.size; p++)
          u.call(c || this, this.list[p].val, this.list[p].key, this);
      }, s.prototype.indexOf = function(u) {
        var c;
        for (c = 0; c < this.size; c++)
          if (this.isEqual(this.list[c].key, u))
            return c;
        return -1;
      }, s.prototype.isEqual = function(u, c) {
        return u === c || u !== u && c !== c;
      }, i.exports = s;
    }, {}], 3: [function(n, i, o) {
      var s = n("map-or-similar");
      i.exports = function(d) {
        var h = new s(!1), f = [];
        return function(b) {
          var m = /* @__PURE__ */ a(function() {
            var v = h, S, C, g = arguments.length - 1, y = Array(g + 1), I = !0, E;
            if ((m.numArgs || m.numArgs === 0) && m.numArgs !== g + 1)
              throw new Error("Memoizerific functions should always be called with the same number of arguments");
            for (E = 0; E < g; E++) {
              if (y[E] = {
                cacheItem: v,
                arg: arguments[E]
              }, v.has(arguments[E])) {
                v = v.get(arguments[E]);
                continue;
              }
              I = !1, S = new s(!1), v.set(arguments[E], S), v = S;
            }
            return I && (v.has(arguments[g]) ? C = v.get(arguments[g]) : I = !1), I || (C = b.apply(null, arguments), v.set(arguments[g], C)),
            d > 0 && (y[g] = {
              cacheItem: v,
              arg: arguments[g]
            }, I ? u(f, y) : f.push(y), f.length > d && c(f.shift())), m.wasMemoized = I, m.numArgs = g + 1, C;
          }, "memoizerific");
          return m.limit = d, m.wasMemoized = !1, m.cache = h, m.lru = f, m;
        };
      };
      function u(d, h) {
        var f = d.length, b = h.length, m, v, S;
        for (v = 0; v < f; v++) {
          for (m = !0, S = 0; S < b; S++)
            if (!p(d[v][S].arg, h[S].arg)) {
              m = !1;
              break;
            }
          if (m)
            break;
        }
        d.push(d.splice(v, 1)[0]);
      }
      a(u, "moveToMostRecentLru");
      function c(d) {
        var h = d.length, f = d[h - 1], b, m;
        for (f.cacheItem.delete(f.arg), m = h - 2; m >= 0 && (f = d[m], b = f.cacheItem.get(f.arg), !b || !b.size); m--)
          f.cacheItem.delete(f.arg);
      }
      a(c, "removeCachedResult");
      function p(d, h) {
        return d === h || d !== d && h !== h;
      }
      a(p, "isEqual");
    }, { "map-or-similar": 1 }] }, {}, [3])(3);
  });
});

// ../node_modules/downshift/node_modules/react-is/cjs/react-is.production.min.js
var Ju = K((de) => {
  "use strict";
  var ai = Symbol.for("react.element"), si = Symbol.for("react.portal"), Tn = Symbol.for("react.fragment"), _n = Symbol.for("react.strict_mo\
de"), kn = Symbol.for("react.profiler"), On = Symbol.for("react.provider"), Pn = Symbol.for("react.context"), wy = Symbol.for("react.server_\
context"), An = Symbol.for("react.forward_ref"), Mn = Symbol.for("react.suspense"), Dn = Symbol.for("react.suspense_list"), Ln = Symbol.for(
  "react.memo"), Nn = Symbol.for("react.lazy"), Ey = Symbol.for("react.offscreen"), Zu;
  Zu = Symbol.for("react.module.reference");
  function je(e) {
    if (typeof e == "object" && e !== null) {
      var t = e.$$typeof;
      switch (t) {
        case ai:
          switch (e = e.type, e) {
            case Tn:
            case kn:
            case _n:
            case Mn:
            case Dn:
              return e;
            default:
              switch (e = e && e.$$typeof, e) {
                case wy:
                case Pn:
                case An:
                case Nn:
                case Ln:
                case On:
                  return e;
                default:
                  return t;
              }
          }
        case si:
          return t;
      }
    }
  }
  a(je, "v");
  de.ContextConsumer = Pn;
  de.ContextProvider = On;
  de.Element = ai;
  de.ForwardRef = An;
  de.Fragment = Tn;
  de.Lazy = Nn;
  de.Memo = Ln;
  de.Portal = si;
  de.Profiler = kn;
  de.StrictMode = _n;
  de.Suspense = Mn;
  de.SuspenseList = Dn;
  de.isAsyncMode = function() {
    return !1;
  };
  de.isConcurrentMode = function() {
    return !1;
  };
  de.isContextConsumer = function(e) {
    return je(e) === Pn;
  };
  de.isContextProvider = function(e) {
    return je(e) === On;
  };
  de.isElement = function(e) {
    return typeof e == "object" && e !== null && e.$$typeof === ai;
  };
  de.isForwardRef = function(e) {
    return je(e) === An;
  };
  de.isFragment = function(e) {
    return je(e) === Tn;
  };
  de.isLazy = function(e) {
    return je(e) === Nn;
  };
  de.isMemo = function(e) {
    return je(e) === Ln;
  };
  de.isPortal = function(e) {
    return je(e) === si;
  };
  de.isProfiler = function(e) {
    return je(e) === kn;
  };
  de.isStrictMode = function(e) {
    return je(e) === _n;
  };
  de.isSuspense = function(e) {
    return je(e) === Mn;
  };
  de.isSuspenseList = function(e) {
    return je(e) === Dn;
  };
  de.isValidElementType = function(e) {
    return typeof e == "string" || typeof e == "function" || e === Tn || e === kn || e === _n || e === Mn || e === Dn || e === Ey || typeof e ==
    "object" && e !== null && (e.$$typeof === Nn || e.$$typeof === Ln || e.$$typeof === On || e.$$typeof === Pn || e.$$typeof === An || e.$$typeof ===
    Zu || e.getModuleId !== void 0);
  };
  de.typeOf = je;
});

// ../node_modules/downshift/node_modules/react-is/index.js
var tc = K((SM, ec) => {
  "use strict";
  ec.exports = Ju();
});

// ../node_modules/fuse.js/dist/fuse.js
var up = K((Mr, Zi) => {
  (function(e, t) {
    typeof Mr == "object" && typeof Zi == "object" ? Zi.exports = t() : typeof define == "function" && define.amd ? define("Fuse", [], t) : typeof Mr ==
    "object" ? Mr.Fuse = t() : e.Fuse = t();
  })(Mr, function() {
    return function(e) {
      var t = {};
      function r(n) {
        if (t[n]) return t[n].exports;
        var i = t[n] = { i: n, l: !1, exports: {} };
        return e[n].call(i.exports, i, i.exports, r), i.l = !0, i.exports;
      }
      return a(r, "r"), r.m = e, r.c = t, r.d = function(n, i, o) {
        r.o(n, i) || Object.defineProperty(n, i, { enumerable: !0, get: o });
      }, r.r = function(n) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(
        n, "__esModule", { value: !0 });
      }, r.t = function(n, i) {
        if (1 & i && (n = r(n)), 8 & i || 4 & i && typeof n == "object" && n && n.__esModule) return n;
        var o = /* @__PURE__ */ Object.create(null);
        if (r.r(o), Object.defineProperty(o, "default", { enumerable: !0, value: n }), 2 & i && typeof n != "string") for (var s in n) r.d(o,
        s, (function(u) {
          return n[u];
        }).bind(null, s));
        return o;
      }, r.n = function(n) {
        var i = n && n.__esModule ? function() {
          return n.default;
        } : function() {
          return n;
        };
        return r.d(i, "a", i), i;
      }, r.o = function(n, i) {
        return Object.prototype.hasOwnProperty.call(n, i);
      }, r.p = "", r(r.s = 0);
    }([function(e, t, r) {
      function n(d) {
        return (n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(h) {
          return typeof h;
        } : function(h) {
          return h && typeof Symbol == "function" && h.constructor === Symbol && h !== Symbol.prototype ? "symbol" : typeof h;
        })(d);
      }
      a(n, "n");
      function i(d, h) {
        for (var f = 0; f < h.length; f++) {
          var b = h[f];
          b.enumerable = b.enumerable || !1, b.configurable = !0, "value" in b && (b.writable = !0), Object.defineProperty(d, b.key, b);
        }
      }
      a(i, "o");
      var o = r(1), s = r(7), u = s.get, c = (s.deepValue, s.isArray), p = function() {
        function d(m, v) {
          var S = v.location, C = S === void 0 ? 0 : S, g = v.distance, y = g === void 0 ? 100 : g, I = v.threshold, E = I === void 0 ? 0.6 :
          I, T = v.maxPatternLength, _ = T === void 0 ? 32 : T, k = v.caseSensitive, w = k !== void 0 && k, O = v.tokenSeparator, P = O === void 0 ?
          / +/g : O, D = v.findAllMatches, L = D !== void 0 && D, M = v.minMatchCharLength, W = M === void 0 ? 1 : M, Z = v.id, G = Z === void 0 ?
          null : Z, R = v.keys, z = R === void 0 ? [] : R, H = v.shouldSort, te = H === void 0 || H, B = v.getFn, N = B === void 0 ? u : B, F = v.
          sortFn, $ = F === void 0 ? function(fe, xe) {
            return fe.score - xe.score;
          } : F, Q = v.tokenize, re = Q !== void 0 && Q, ee = v.matchAllTokens, le = ee !== void 0 && ee, se = v.includeMatches, pe = se !==
          void 0 && se, ce = v.includeScore, Se = ce !== void 0 && ce, ye = v.verbose, Ae = ye !== void 0 && ye;
          (function(fe, xe) {
            if (!(fe instanceof xe)) throw new TypeError("Cannot call a class as a function");
          })(this, d), this.options = { location: C, distance: y, threshold: E, maxPatternLength: _, isCaseSensitive: w, tokenSeparator: P, findAllMatches: L,
          minMatchCharLength: W, id: G, keys: z, includeMatches: pe, includeScore: Se, shouldSort: te, getFn: N, sortFn: $, verbose: Ae, tokenize: re,
          matchAllTokens: le }, this.setCollection(m), this._processKeys(z);
        }
        a(d, "e");
        var h, f, b;
        return h = d, (f = [{ key: "setCollection", value: /* @__PURE__ */ a(function(m) {
          return this.list = m, m;
        }, "value") }, { key: "_processKeys", value: /* @__PURE__ */ a(function(m) {
          if (this._keyWeights = {}, this._keyNames = [], m.length && typeof m[0] == "string") for (var v = 0, S = m.length; v < S; v += 1) {
            var C = m[v];
            this._keyWeights[C] = 1, this._keyNames.push(C);
          }
          else {
            for (var g = null, y = null, I = 0, E = 0, T = m.length; E < T; E += 1) {
              var _ = m[E];
              if (!_.hasOwnProperty("name")) throw new Error('Missing "name" property in key object');
              var k = _.name;
              if (this._keyNames.push(k), !_.hasOwnProperty("weight")) throw new Error('Missing "weight" property in key object');
              var w = _.weight;
              if (w < 0 || w > 1) throw new Error('"weight" property in key must bein the range of [0, 1)');
              y = y == null ? w : Math.max(y, w), g = g == null ? w : Math.min(g, w), this._keyWeights[k] = w, I += w;
            }
            if (I > 1) throw new Error("Total of weights cannot exceed 1");
          }
        }, "value") }, { key: "search", value: /* @__PURE__ */ a(function(m) {
          var v = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { limit: !1 };
          this._log(`---------
Search pattern: "`.concat(m, '"'));
          var S = this._prepareSearchers(m), C = S.tokenSearchers, g = S.fullSearcher, y = this._search(C, g);
          return this._computeScore(y), this.options.shouldSort && this._sort(y), v.limit && typeof v.limit == "number" && (y = y.slice(0, v.
          limit)), this._format(y);
        }, "value") }, { key: "_prepareSearchers", value: /* @__PURE__ */ a(function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", v = [];
          if (this.options.tokenize) for (var S = m.split(this.options.tokenSeparator), C = 0, g = S.length; C < g; C += 1) v.push(new o(S[C],
          this.options));
          return { tokenSearchers: v, fullSearcher: new o(m, this.options) };
        }, "value") }, { key: "_search", value: /* @__PURE__ */ a(function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], v = arguments.length > 1 ? arguments[1] : void 0, S = this.
          list, C = {}, g = [];
          if (typeof S[0] == "string") {
            for (var y = 0, I = S.length; y < I; y += 1) this._analyze({ key: "", value: S[y], record: y, index: y }, { resultMap: C, results: g,
            tokenSearchers: m, fullSearcher: v });
            return g;
          }
          for (var E = 0, T = S.length; E < T; E += 1) for (var _ = S[E], k = 0, w = this._keyNames.length; k < w; k += 1) {
            var O = this._keyNames[k];
            this._analyze({ key: O, value: this.options.getFn(_, O), record: _, index: E }, { resultMap: C, results: g, tokenSearchers: m, fullSearcher: v });
          }
          return g;
        }, "value") }, { key: "_analyze", value: /* @__PURE__ */ a(function(m, v) {
          var S = this, C = m.key, g = m.arrayIndex, y = g === void 0 ? -1 : g, I = m.value, E = m.record, T = m.index, _ = v.tokenSearchers,
          k = _ === void 0 ? [] : _, w = v.fullSearcher, O = v.resultMap, P = O === void 0 ? {} : O, D = v.results, L = D === void 0 ? [] : D;
          (/* @__PURE__ */ a(function M(W, Z, G, R) {
            if (Z != null) {
              if (typeof Z == "string") {
                var z = !1, H = -1, te = 0;
                S._log(`
Key: `.concat(C === "" ? "--" : C));
                var B = w.search(Z);
                if (S._log('Full text: "'.concat(Z, '", score: ').concat(B.score)), S.options.tokenize) {
                  for (var N = Z.split(S.options.tokenSeparator), F = N.length, $ = [], Q = 0, re = k.length; Q < re; Q += 1) {
                    var ee = k[Q];
                    S._log(`
Pattern: "`.concat(ee.pattern, '"'));
                    for (var le = !1, se = 0; se < F; se += 1) {
                      var pe = N[se], ce = ee.search(pe), Se = {};
                      ce.isMatch ? (Se[pe] = ce.score, z = !0, le = !0, $.push(ce.score)) : (Se[pe] = 1, S.options.matchAllTokens || $.push(
                      1)), S._log('Token: "'.concat(pe, '", score: ').concat(Se[pe]));
                    }
                    le && (te += 1);
                  }
                  H = $[0];
                  for (var ye = $.length, Ae = 1; Ae < ye; Ae += 1) H += $[Ae];
                  H /= ye, S._log("Token score average:", H);
                }
                var fe = B.score;
                H > -1 && (fe = (fe + H) / 2), S._log("Score average:", fe);
                var xe = !S.options.tokenize || !S.options.matchAllTokens || te >= k.length;
                if (S._log(`
Check Matches: `.concat(xe)), (z || B.isMatch) && xe) {
                  var Te = { key: C, arrayIndex: W, value: Z, score: fe };
                  S.options.includeMatches && (Te.matchedIndices = B.matchedIndices);
                  var Ne = P[R];
                  Ne ? Ne.output.push(Te) : (P[R] = { item: G, output: [Te] }, L.push(P[R]));
                }
              } else if (c(Z)) for (var Je = 0, Me = Z.length; Je < Me; Je += 1) M(Je, Z[Je], G, R);
            }
          }, "e"))(y, I, E, T);
        }, "value") }, { key: "_computeScore", value: /* @__PURE__ */ a(function(m) {
          this._log(`

Computing score:
`);
          for (var v = this._keyWeights, S = !!Object.keys(v).length, C = 0, g = m.length; C < g; C += 1) {
            for (var y = m[C], I = y.output, E = I.length, T = 1, _ = 0; _ < E; _ += 1) {
              var k = I[_], w = k.key, O = S ? v[w] : 1, P = k.score === 0 && v && v[w] > 0 ? Number.EPSILON : k.score;
              T *= Math.pow(P, O);
            }
            y.score = T, this._log(y);
          }
        }, "value") }, { key: "_sort", value: /* @__PURE__ */ a(function(m) {
          this._log(`

Sorting....`), m.sort(this.options.sortFn);
        }, "value") }, { key: "_format", value: /* @__PURE__ */ a(function(m) {
          var v = [];
          if (this.options.verbose) {
            var S = [];
            this._log(`

Output:

`, JSON.stringify(m, function(k, w) {
              if (n(w) === "object" && w !== null) {
                if (S.indexOf(w) !== -1) return;
                S.push(w);
              }
              return w;
            }, 2)), S = null;
          }
          var C = [];
          this.options.includeMatches && C.push(function(k, w) {
            var O = k.output;
            w.matches = [];
            for (var P = 0, D = O.length; P < D; P += 1) {
              var L = O[P];
              if (L.matchedIndices.length !== 0) {
                var M = { indices: L.matchedIndices, value: L.value };
                L.key && (M.key = L.key), L.hasOwnProperty("arrayIndex") && L.arrayIndex > -1 && (M.arrayIndex = L.arrayIndex), w.matches.push(
                M);
              }
            }
          }), this.options.includeScore && C.push(function(k, w) {
            w.score = k.score;
          });
          for (var g = 0, y = m.length; g < y; g += 1) {
            var I = m[g];
            if (this.options.id && (I.item = this.options.getFn(I.item, this.options.id)[0]), C.length) {
              for (var E = { item: I.item }, T = 0, _ = C.length; T < _; T += 1) C[T](I, E);
              v.push(E);
            } else v.push(I.item);
          }
          return v;
        }, "value") }, { key: "_log", value: /* @__PURE__ */ a(function() {
          var m;
          this.options.verbose && (m = console).log.apply(m, arguments);
        }, "value") }]) && i(h.prototype, f), b && i(h, b), d;
      }();
      e.exports = p;
    }, function(e, t, r) {
      function n(c, p) {
        for (var d = 0; d < p.length; d++) {
          var h = p[d];
          h.enumerable = h.enumerable || !1, h.configurable = !0, "value" in h && (h.writable = !0), Object.defineProperty(c, h.key, h);
        }
      }
      a(n, "n");
      var i = r(2), o = r(3), s = r(6), u = function() {
        function c(f, b) {
          var m = b.location, v = m === void 0 ? 0 : m, S = b.distance, C = S === void 0 ? 100 : S, g = b.threshold, y = g === void 0 ? 0.6 :
          g, I = b.maxPatternLength, E = I === void 0 ? 32 : I, T = b.isCaseSensitive, _ = T !== void 0 && T, k = b.tokenSeparator, w = k ===
          void 0 ? / +/g : k, O = b.findAllMatches, P = O !== void 0 && O, D = b.minMatchCharLength, L = D === void 0 ? 1 : D, M = b.includeMatches,
          W = M !== void 0 && M;
          (function(Z, G) {
            if (!(Z instanceof G)) throw new TypeError("Cannot call a class as a function");
          })(this, c), this.options = { location: v, distance: C, threshold: y, maxPatternLength: E, isCaseSensitive: _, tokenSeparator: w, findAllMatches: P,
          includeMatches: W, minMatchCharLength: L }, this.pattern = _ ? f : f.toLowerCase(), this.pattern.length <= E && (this.patternAlphabet =
          s(this.pattern));
        }
        a(c, "e");
        var p, d, h;
        return p = c, (d = [{ key: "search", value: /* @__PURE__ */ a(function(f) {
          var b = this.options, m = b.isCaseSensitive, v = b.includeMatches;
          if (m || (f = f.toLowerCase()), this.pattern === f) {
            var S = { isMatch: !0, score: 0 };
            return v && (S.matchedIndices = [[0, f.length - 1]]), S;
          }
          var C = this.options, g = C.maxPatternLength, y = C.tokenSeparator;
          if (this.pattern.length > g) return i(f, this.pattern, y);
          var I = this.options, E = I.location, T = I.distance, _ = I.threshold, k = I.findAllMatches, w = I.minMatchCharLength;
          return o(f, this.pattern, this.patternAlphabet, { location: E, distance: T, threshold: _, findAllMatches: k, minMatchCharLength: w,
          includeMatches: v });
        }, "value") }]) && n(p.prototype, d), h && n(p, h), c;
      }();
      e.exports = u;
    }, function(e, t) {
      var r = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
      e.exports = function(n, i) {
        var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : / +/g, s = new RegExp(i.replace(r, "\\$&").replace(o, "|")),
        u = n.match(s), c = !!u, p = [];
        if (c) for (var d = 0, h = u.length; d < h; d += 1) {
          var f = u[d];
          p.push([n.indexOf(f), f.length - 1]);
        }
        return { score: c ? 0.5 : 1, isMatch: c, matchedIndices: p };
      };
    }, function(e, t, r) {
      var n = r(4), i = r(5);
      e.exports = function(o, s, u, c) {
        for (var p = c.location, d = p === void 0 ? 0 : p, h = c.distance, f = h === void 0 ? 100 : h, b = c.threshold, m = b === void 0 ? 0.6 :
        b, v = c.findAllMatches, S = v !== void 0 && v, C = c.minMatchCharLength, g = C === void 0 ? 1 : C, y = c.includeMatches, I = y !== void 0 &&
        y, E = d, T = o.length, _ = m, k = o.indexOf(s, E), w = s.length, O = [], P = 0; P < T; P += 1) O[P] = 0;
        if (k !== -1) {
          var D = n(s, { errors: 0, currentLocation: k, expectedLocation: E, distance: f });
          if (_ = Math.min(D, _), (k = o.lastIndexOf(s, E + w)) !== -1) {
            var L = n(s, { errors: 0, currentLocation: k, expectedLocation: E, distance: f });
            _ = Math.min(L, _);
          }
        }
        k = -1;
        for (var M = [], W = 1, Z = w + T, G = 1 << (w <= 31 ? w - 1 : 30), R = 0; R < w; R += 1) {
          for (var z = 0, H = Z; z < H; )
            n(s, { errors: R, currentLocation: E + H, expectedLocation: E, distance: f }) <= _ ? z = H : Z = H, H = Math.floor((Z - z) / 2 +
            z);
          Z = H;
          var te = Math.max(1, E - H + 1), B = S ? T : Math.min(E + H, T) + w, N = Array(B + 2);
          N[B + 1] = (1 << R) - 1;
          for (var F = B; F >= te; F -= 1) {
            var $ = F - 1, Q = u[o.charAt($)];
            if (Q && (O[$] = 1), N[F] = (N[F + 1] << 1 | 1) & Q, R !== 0 && (N[F] |= (M[F + 1] | M[F]) << 1 | 1 | M[F + 1]), N[F] & G && (W =
            n(s, { errors: R, currentLocation: $, expectedLocation: E, distance: f })) <= _) {
              if (_ = W, (k = $) <= E) break;
              te = Math.max(1, 2 * E - k);
            }
          }
          if (n(s, { errors: R + 1, currentLocation: E, expectedLocation: E, distance: f }) > _) break;
          M = N;
        }
        var re = { isMatch: k >= 0, score: W === 0 ? 1e-3 : W };
        return I && (re.matchedIndices = i(O, g)), re;
      };
    }, function(e, t) {
      e.exports = function(r, n) {
        var i = n.errors, o = i === void 0 ? 0 : i, s = n.currentLocation, u = s === void 0 ? 0 : s, c = n.expectedLocation, p = c === void 0 ?
        0 : c, d = n.distance, h = d === void 0 ? 100 : d, f = o / r.length, b = Math.abs(p - u);
        return h ? f + b / h : b ? 1 : f;
      };
    }, function(e, t) {
      e.exports = function() {
        for (var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], n = arguments.length > 1 && arguments[1] !== void 0 ?
        arguments[1] : 1, i = [], o = -1, s = -1, u = 0, c = r.length; u < c; u += 1) {
          var p = r[u];
          p && o === -1 ? o = u : p || o === -1 || ((s = u - 1) - o + 1 >= n && i.push([o, s]), o = -1);
        }
        return r[u - 1] && u - o >= n && i.push([o, u - 1]), i;
      };
    }, function(e, t) {
      e.exports = function(r) {
        for (var n = {}, i = r.length, o = 0; o < i; o += 1) n[r.charAt(o)] = 0;
        for (var s = 0; s < i; s += 1) n[r.charAt(s)] |= 1 << i - s - 1;
        return n;
      };
    }, function(e, t) {
      var r = /* @__PURE__ */ a(function(s) {
        return Array.isArray ? Array.isArray(s) : Object.prototype.toString.call(s) === "[object Array]";
      }, "r"), n = /* @__PURE__ */ a(function(s) {
        return s == null ? "" : function(u) {
          if (typeof u == "string") return u;
          var c = u + "";
          return c == "0" && 1 / u == -1 / 0 ? "-0" : c;
        }(s);
      }, "n"), i = /* @__PURE__ */ a(function(s) {
        return typeof s == "string";
      }, "o"), o = /* @__PURE__ */ a(function(s) {
        return typeof s == "number";
      }, "i");
      e.exports = { get: /* @__PURE__ */ a(function(s, u) {
        var c = [];
        return (/* @__PURE__ */ a(function p(d, h) {
          if (h) {
            var f = h.indexOf("."), b = h, m = null;
            f !== -1 && (b = h.slice(0, f), m = h.slice(f + 1));
            var v = d[b];
            if (v != null) if (m || !i(v) && !o(v)) if (r(v)) for (var S = 0, C = v.length; S < C; S += 1) p(v[S], m);
            else m && p(v, m);
            else c.push(n(v));
          } else c.push(d);
        }, "e"))(s, u), c;
      }, "get"), isArray: r, isString: i, isNum: o, toString: n };
    }]);
  });
});

// ../node_modules/store2/dist/store2.js
var Up = K((no, oo) => {
  (function(e, t) {
    var r = {
      version: "2.14.2",
      areas: {},
      apis: {},
      nsdelim: ".",
      // utilities
      inherit: /* @__PURE__ */ a(function(i, o) {
        for (var s in i)
          o.hasOwnProperty(s) || Object.defineProperty(o, s, Object.getOwnPropertyDescriptor(i, s));
        return o;
      }, "inherit"),
      stringify: /* @__PURE__ */ a(function(i, o) {
        return i === void 0 || typeof i == "function" ? i + "" : JSON.stringify(i, o || r.replace);
      }, "stringify"),
      parse: /* @__PURE__ */ a(function(i, o) {
        try {
          return JSON.parse(i, o || r.revive);
        } catch {
          return i;
        }
      }, "parse"),
      // extension hooks
      fn: /* @__PURE__ */ a(function(i, o) {
        r.storeAPI[i] = o;
        for (var s in r.apis)
          r.apis[s][i] = o;
      }, "fn"),
      get: /* @__PURE__ */ a(function(i, o) {
        return i.getItem(o);
      }, "get"),
      set: /* @__PURE__ */ a(function(i, o, s) {
        i.setItem(o, s);
      }, "set"),
      remove: /* @__PURE__ */ a(function(i, o) {
        i.removeItem(o);
      }, "remove"),
      key: /* @__PURE__ */ a(function(i, o) {
        return i.key(o);
      }, "key"),
      length: /* @__PURE__ */ a(function(i) {
        return i.length;
      }, "length"),
      clear: /* @__PURE__ */ a(function(i) {
        i.clear();
      }, "clear"),
      // core functions
      Store: /* @__PURE__ */ a(function(i, o, s) {
        var u = r.inherit(r.storeAPI, function(p, d, h) {
          return arguments.length === 0 ? u.getAll() : typeof d == "function" ? u.transact(p, d, h) : d !== void 0 ? u.set(p, d, h) : typeof p ==
          "string" || typeof p == "number" ? u.get(p) : typeof p == "function" ? u.each(p) : p ? u.setAll(p, d) : u.clear();
        });
        u._id = i;
        try {
          var c = "__store2_test";
          o.setItem(c, "ok"), u._area = o, o.removeItem(c);
        } catch {
          u._area = r.storage("fake");
        }
        return u._ns = s || "", r.areas[i] || (r.areas[i] = u._area), r.apis[u._ns + u._id] || (r.apis[u._ns + u._id] = u), u;
      }, "Store"),
      storeAPI: {
        // admin functions
        area: /* @__PURE__ */ a(function(i, o) {
          var s = this[i];
          return (!s || !s.area) && (s = r.Store(i, o, this._ns), this[i] || (this[i] = s)), s;
        }, "area"),
        namespace: /* @__PURE__ */ a(function(i, o, s) {
          if (s = s || this._delim || r.nsdelim, !i)
            return this._ns ? this._ns.substring(0, this._ns.length - s.length) : "";
          var u = i, c = this[u];
          if ((!c || !c.namespace) && (c = r.Store(this._id, this._area, this._ns + u + s), c._delim = s, this[u] || (this[u] = c), !o))
            for (var p in r.areas)
              c.area(p, r.areas[p]);
          return c;
        }, "namespace"),
        isFake: /* @__PURE__ */ a(function(i) {
          return i ? (this._real = this._area, this._area = r.storage("fake")) : i === !1 && (this._area = this._real || this._area), this._area.
          name === "fake";
        }, "isFake"),
        toString: /* @__PURE__ */ a(function() {
          return "store" + (this._ns ? "." + this.namespace() : "") + "[" + this._id + "]";
        }, "toString"),
        // storage functions
        has: /* @__PURE__ */ a(function(i) {
          return this._area.has ? this._area.has(this._in(i)) : this._in(i) in this._area;
        }, "has"),
        size: /* @__PURE__ */ a(function() {
          return this.keys().length;
        }, "size"),
        each: /* @__PURE__ */ a(function(i, o) {
          for (var s = 0, u = r.length(this._area); s < u; s++) {
            var c = this._out(r.key(this._area, s));
            if (c !== void 0 && i.call(this, c, this.get(c), o) === !1)
              break;
            u > r.length(this._area) && (u--, s--);
          }
          return o || this;
        }, "each"),
        keys: /* @__PURE__ */ a(function(i) {
          return this.each(function(o, s, u) {
            u.push(o);
          }, i || []);
        }, "keys"),
        get: /* @__PURE__ */ a(function(i, o) {
          var s = r.get(this._area, this._in(i)), u;
          return typeof o == "function" && (u = o, o = null), s !== null ? r.parse(s, u) : o ?? s;
        }, "get"),
        getAll: /* @__PURE__ */ a(function(i) {
          return this.each(function(o, s, u) {
            u[o] = s;
          }, i || {});
        }, "getAll"),
        transact: /* @__PURE__ */ a(function(i, o, s) {
          var u = this.get(i, s), c = o(u);
          return this.set(i, c === void 0 ? u : c), this;
        }, "transact"),
        set: /* @__PURE__ */ a(function(i, o, s) {
          var u = this.get(i), c;
          return u != null && s === !1 ? o : (typeof s == "function" && (c = s, s = void 0), r.set(this._area, this._in(i), r.stringify(o, c),
          s) || u);
        }, "set"),
        setAll: /* @__PURE__ */ a(function(i, o) {
          var s, u;
          for (var c in i)
            u = i[c], this.set(c, u, o) !== u && (s = !0);
          return s;
        }, "setAll"),
        add: /* @__PURE__ */ a(function(i, o, s) {
          var u = this.get(i);
          if (u instanceof Array)
            o = u.concat(o);
          else if (u !== null) {
            var c = typeof u;
            if (c === typeof o && c === "object") {
              for (var p in o)
                u[p] = o[p];
              o = u;
            } else
              o = u + o;
          }
          return r.set(this._area, this._in(i), r.stringify(o, s)), o;
        }, "add"),
        remove: /* @__PURE__ */ a(function(i, o) {
          var s = this.get(i, o);
          return r.remove(this._area, this._in(i)), s;
        }, "remove"),
        clear: /* @__PURE__ */ a(function() {
          return this._ns ? this.each(function(i) {
            r.remove(this._area, this._in(i));
          }, 1) : r.clear(this._area), this;
        }, "clear"),
        clearAll: /* @__PURE__ */ a(function() {
          var i = this._area;
          for (var o in r.areas)
            r.areas.hasOwnProperty(o) && (this._area = r.areas[o], this.clear());
          return this._area = i, this;
        }, "clearAll"),
        // internal use functions
        _in: /* @__PURE__ */ a(function(i) {
          return typeof i != "string" && (i = r.stringify(i)), this._ns ? this._ns + i : i;
        }, "_in"),
        _out: /* @__PURE__ */ a(function(i) {
          return this._ns ? i && i.indexOf(this._ns) === 0 ? i.substring(this._ns.length) : void 0 : (
            // so each() knows to skip it
            i
          );
        }, "_out")
      },
      // end _.storeAPI
      storage: /* @__PURE__ */ a(function(i) {
        return r.inherit(r.storageAPI, { items: {}, name: i });
      }, "storage"),
      storageAPI: {
        length: 0,
        has: /* @__PURE__ */ a(function(i) {
          return this.items.hasOwnProperty(i);
        }, "has"),
        key: /* @__PURE__ */ a(function(i) {
          var o = 0;
          for (var s in this.items)
            if (this.has(s) && i === o++)
              return s;
        }, "key"),
        setItem: /* @__PURE__ */ a(function(i, o) {
          this.has(i) || this.length++, this.items[i] = o;
        }, "setItem"),
        removeItem: /* @__PURE__ */ a(function(i) {
          this.has(i) && (delete this.items[i], this.length--);
        }, "removeItem"),
        getItem: /* @__PURE__ */ a(function(i) {
          return this.has(i) ? this.items[i] : null;
        }, "getItem"),
        clear: /* @__PURE__ */ a(function() {
          for (var i in this.items)
            this.removeItem(i);
        }, "clear")
      }
      // end _.storageAPI
    }, n = (
      // safely set this up (throws error in IE10/32bit mode for local files)
      r.Store("local", function() {
        try {
          return localStorage;
        } catch {
        }
      }())
    );
    n.local = n, n._ = r, n.area("session", function() {
      try {
        return sessionStorage;
      } catch {
      }
    }()), n.area("page", r.storage("page")), typeof t == "function" && t.amd !== void 0 ? t("store2", [], function() {
      return n;
    }) : typeof oo < "u" && oo.exports ? oo.exports = n : (e.store && (r.conflict = e.store), e.store = n);
  })(no, no && no.define);
});

// ../node_modules/toggle-selection/index.js
var ld = K((EN, sd) => {
  sd.exports = function() {
    var e = document.getSelection();
    if (!e.rangeCount)
      return function() {
      };
    for (var t = document.activeElement, r = [], n = 0; n < e.rangeCount; n++)
      r.push(e.getRangeAt(n));
    switch (t.tagName.toUpperCase()) {
      case "INPUT":
      case "TEXTAREA":
        t.blur();
        break;
      default:
        t = null;
        break;
    }
    return e.removeAllRanges(), function() {
      e.type === "Caret" && e.removeAllRanges(), e.rangeCount || r.forEach(function(i) {
        e.addRange(i);
      }), t && t.focus();
    };
  };
});

// ../node_modules/copy-to-clipboard/index.js
var pd = K((CN, cd) => {
  "use strict";
  var wb = ld(), ud = {
    "text/plain": "Text",
    "text/html": "Url",
    default: "Text"
  }, Eb = "Copy to clipboard: #{key}, Enter";
  function Cb(e) {
    var t = (/mac os x/i.test(navigator.userAgent) ? "\u2318" : "Ctrl") + "+C";
    return e.replace(/#{\s*key\s*}/g, t);
  }
  a(Cb, "format");
  function Tb(e, t) {
    var r, n, i, o, s, u, c = !1;
    t || (t = {}), r = t.debug || !1;
    try {
      i = wb(), o = document.createRange(), s = document.getSelection(), u = document.createElement("span"), u.textContent = e, u.ariaHidden =
      "true", u.style.all = "unset", u.style.position = "fixed", u.style.top = 0, u.style.clip = "rect(0, 0, 0, 0)", u.style.whiteSpace = "p\
re", u.style.webkitUserSelect = "text", u.style.MozUserSelect = "text", u.style.msUserSelect = "text", u.style.userSelect = "text", u.addEventListener(
      "copy", function(d) {
        if (d.stopPropagation(), t.format)
          if (d.preventDefault(), typeof d.clipboardData > "u") {
            r && console.warn("unable to use e.clipboardData"), r && console.warn("trying IE specific stuff"), window.clipboardData.clearData();
            var h = ud[t.format] || ud.default;
            window.clipboardData.setData(h, e);
          } else
            d.clipboardData.clearData(), d.clipboardData.setData(t.format, e);
        t.onCopy && (d.preventDefault(), t.onCopy(d.clipboardData));
      }), document.body.appendChild(u), o.selectNodeContents(u), s.addRange(o);
      var p = document.execCommand("copy");
      if (!p)
        throw new Error("copy command was unsuccessful");
      c = !0;
    } catch (d) {
      r && console.error("unable to copy using execCommand: ", d), r && console.warn("trying IE specific stuff");
      try {
        window.clipboardData.setData(t.format || "text", e), t.onCopy && t.onCopy(window.clipboardData), c = !0;
      } catch (h) {
        r && console.error("unable to copy using clipboardData: ", h), r && console.error("falling back to prompt"), n = Cb("message" in t ?
        t.message : Eb), window.prompt(n, e);
      }
    } finally {
      s && (typeof s.removeRange == "function" ? s.removeRange(o) : s.removeAllRanges()), u && document.body.removeChild(u), i();
    }
    return c;
  }
  a(Tb, "copy");
  cd.exports = Tb;
});

// ../node_modules/es-errors/index.js
var wd = K((hF, xd) => {
  "use strict";
  xd.exports = Error;
});

// ../node_modules/es-errors/eval.js
var Cd = K((gF, Ed) => {
  "use strict";
  Ed.exports = EvalError;
});

// ../node_modules/es-errors/range.js
var _d = K((yF, Td) => {
  "use strict";
  Td.exports = RangeError;
});

// ../node_modules/es-errors/ref.js
var Od = K((vF, kd) => {
  "use strict";
  kd.exports = ReferenceError;
});

// ../node_modules/es-errors/syntax.js
var ia = K((bF, Pd) => {
  "use strict";
  Pd.exports = SyntaxError;
});

// ../node_modules/es-errors/type.js
var sr = K((IF, Ad) => {
  "use strict";
  Ad.exports = TypeError;
});

// ../node_modules/es-errors/uri.js
var Dd = K((SF, Md) => {
  "use strict";
  Md.exports = URIError;
});

// ../node_modules/has-symbols/shams.js
var Nd = K((xF, Ld) => {
  "use strict";
  Ld.exports = /* @__PURE__ */ a(function() {
    if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
      return !1;
    if (typeof Symbol.iterator == "symbol")
      return !0;
    var t = {}, r = Symbol("test"), n = Object(r);
    if (typeof r == "string" || Object.prototype.toString.call(r) !== "[object Symbol]" || Object.prototype.toString.call(n) !== "[object Sy\
mbol]")
      return !1;
    var i = 42;
    t[r] = i;
    for (r in t)
      return !1;
    if (typeof Object.keys == "function" && Object.keys(t).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(
    t).length !== 0)
      return !1;
    var o = Object.getOwnPropertySymbols(t);
    if (o.length !== 1 || o[0] !== r || !Object.prototype.propertyIsEnumerable.call(t, r))
      return !1;
    if (typeof Object.getOwnPropertyDescriptor == "function") {
      var s = Object.getOwnPropertyDescriptor(t, r);
      if (s.value !== i || s.enumerable !== !0)
        return !1;
    }
    return !0;
  }, "hasSymbols");
});

// ../node_modules/has-symbols/index.js
var Bd = K((EF, Hd) => {
  "use strict";
  var Fd = typeof Symbol < "u" && Symbol, $b = Nd();
  Hd.exports = /* @__PURE__ */ a(function() {
    return typeof Fd != "function" || typeof Symbol != "function" || typeof Fd("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 :
    $b();
  }, "hasNativeSymbols");
});

// ../node_modules/has-proto/index.js
var zd = K((TF, Rd) => {
  "use strict";
  var aa = {
    __proto__: null,
    foo: {}
  }, Wb = Object;
  Rd.exports = /* @__PURE__ */ a(function() {
    return { __proto__: aa }.foo === aa.foo && !(aa instanceof Wb);
  }, "hasProto");
});

// ../node_modules/function-bind/implementation.js
var Kd = K((kF, Wd) => {
  "use strict";
  var Kb = "Function.prototype.bind called on incompatible ", Vb = Object.prototype.toString, jb = Math.max, Ub = "[object Function]", $d = /* @__PURE__ */ a(
  function(t, r) {
    for (var n = [], i = 0; i < t.length; i += 1)
      n[i] = t[i];
    for (var o = 0; o < r.length; o += 1)
      n[o + t.length] = r[o];
    return n;
  }, "concatty"), qb = /* @__PURE__ */ a(function(t, r) {
    for (var n = [], i = r || 0, o = 0; i < t.length; i += 1, o += 1)
      n[o] = t[i];
    return n;
  }, "slicy"), Gb = /* @__PURE__ */ a(function(e, t) {
    for (var r = "", n = 0; n < e.length; n += 1)
      r += e[n], n + 1 < e.length && (r += t);
    return r;
  }, "joiny");
  Wd.exports = /* @__PURE__ */ a(function(t) {
    var r = this;
    if (typeof r != "function" || Vb.apply(r) !== Ub)
      throw new TypeError(Kb + r);
    for (var n = qb(arguments, 1), i, o = /* @__PURE__ */ a(function() {
      if (this instanceof i) {
        var d = r.apply(
          this,
          $d(n, arguments)
        );
        return Object(d) === d ? d : this;
      }
      return r.apply(
        t,
        $d(n, arguments)
      );
    }, "binder"), s = jb(0, r.length - n.length), u = [], c = 0; c < s; c++)
      u[c] = "$" + c;
    if (i = Function("binder", "return function (" + Gb(u, ",") + "){ return binder.apply(this,arguments); }")(o), r.prototype) {
      var p = /* @__PURE__ */ a(function() {
      }, "Empty");
      p.prototype = r.prototype, i.prototype = new p(), p.prototype = null;
    }
    return i;
  }, "bind");
});

// ../node_modules/function-bind/index.js
var lo = K((PF, Vd) => {
  "use strict";
  var Yb = Kd();
  Vd.exports = Function.prototype.bind || Yb;
});

// ../node_modules/hasown/index.js
var Ud = K((AF, jd) => {
  "use strict";
  var Qb = Function.prototype.call, Xb = Object.prototype.hasOwnProperty, Zb = lo();
  jd.exports = Zb.call(Qb, Xb);
});

// ../node_modules/get-intrinsic/index.js
var Ft = K((MF, Xd) => {
  "use strict";
  var oe, Jb = wd(), e0 = Cd(), t0 = _d(), r0 = Od(), pr = ia(), cr = sr(), n0 = Dd(), Qd = Function, sa = /* @__PURE__ */ a(function(e) {
    try {
      return Qd('"use strict"; return (' + e + ").constructor;")();
    } catch {
    }
  }, "getEvalledConstructor"), Lt = Object.getOwnPropertyDescriptor;
  if (Lt)
    try {
      Lt({}, "");
    } catch {
      Lt = null;
    }
  var la = /* @__PURE__ */ a(function() {
    throw new cr();
  }, "throwTypeError"), o0 = Lt ? function() {
    try {
      return arguments.callee, la;
    } catch {
      try {
        return Lt(arguments, "callee").get;
      } catch {
        return la;
      }
    }
  }() : la, lr = Bd()(), i0 = zd()(), Pe = Object.getPrototypeOf || (i0 ? function(e) {
    return e.__proto__;
  } : null), ur = {}, a0 = typeof Uint8Array > "u" || !Pe ? oe : Pe(Uint8Array), Nt = {
    __proto__: null,
    "%AggregateError%": typeof AggregateError > "u" ? oe : AggregateError,
    "%Array%": Array,
    "%ArrayBuffer%": typeof ArrayBuffer > "u" ? oe : ArrayBuffer,
    "%ArrayIteratorPrototype%": lr && Pe ? Pe([][Symbol.iterator]()) : oe,
    "%AsyncFromSyncIteratorPrototype%": oe,
    "%AsyncFunction%": ur,
    "%AsyncGenerator%": ur,
    "%AsyncGeneratorFunction%": ur,
    "%AsyncIteratorPrototype%": ur,
    "%Atomics%": typeof Atomics > "u" ? oe : Atomics,
    "%BigInt%": typeof BigInt > "u" ? oe : BigInt,
    "%BigInt64Array%": typeof BigInt64Array > "u" ? oe : BigInt64Array,
    "%BigUint64Array%": typeof BigUint64Array > "u" ? oe : BigUint64Array,
    "%Boolean%": Boolean,
    "%DataView%": typeof DataView > "u" ? oe : DataView,
    "%Date%": Date,
    "%decodeURI%": decodeURI,
    "%decodeURIComponent%": decodeURIComponent,
    "%encodeURI%": encodeURI,
    "%encodeURIComponent%": encodeURIComponent,
    "%Error%": Jb,
    "%eval%": eval,
    // eslint-disable-line no-eval
    "%EvalError%": e0,
    "%Float32Array%": typeof Float32Array > "u" ? oe : Float32Array,
    "%Float64Array%": typeof Float64Array > "u" ? oe : Float64Array,
    "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? oe : FinalizationRegistry,
    "%Function%": Qd,
    "%GeneratorFunction%": ur,
    "%Int8Array%": typeof Int8Array > "u" ? oe : Int8Array,
    "%Int16Array%": typeof Int16Array > "u" ? oe : Int16Array,
    "%Int32Array%": typeof Int32Array > "u" ? oe : Int32Array,
    "%isFinite%": isFinite,
    "%isNaN%": isNaN,
    "%IteratorPrototype%": lr && Pe ? Pe(Pe([][Symbol.iterator]())) : oe,
    "%JSON%": typeof JSON == "object" ? JSON : oe,
    "%Map%": typeof Map > "u" ? oe : Map,
    "%MapIteratorPrototype%": typeof Map > "u" || !lr || !Pe ? oe : Pe((/* @__PURE__ */ new Map())[Symbol.iterator]()),
    "%Math%": Math,
    "%Number%": Number,
    "%Object%": Object,
    "%parseFloat%": parseFloat,
    "%parseInt%": parseInt,
    "%Promise%": typeof Promise > "u" ? oe : Promise,
    "%Proxy%": typeof Proxy > "u" ? oe : Proxy,
    "%RangeError%": t0,
    "%ReferenceError%": r0,
    "%Reflect%": typeof Reflect > "u" ? oe : Reflect,
    "%RegExp%": RegExp,
    "%Set%": typeof Set > "u" ? oe : Set,
    "%SetIteratorPrototype%": typeof Set > "u" || !lr || !Pe ? oe : Pe((/* @__PURE__ */ new Set())[Symbol.iterator]()),
    "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? oe : SharedArrayBuffer,
    "%String%": String,
    "%StringIteratorPrototype%": lr && Pe ? Pe(""[Symbol.iterator]()) : oe,
    "%Symbol%": lr ? Symbol : oe,
    "%SyntaxError%": pr,
    "%ThrowTypeError%": o0,
    "%TypedArray%": a0,
    "%TypeError%": cr,
    "%Uint8Array%": typeof Uint8Array > "u" ? oe : Uint8Array,
    "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? oe : Uint8ClampedArray,
    "%Uint16Array%": typeof Uint16Array > "u" ? oe : Uint16Array,
    "%Uint32Array%": typeof Uint32Array > "u" ? oe : Uint32Array,
    "%URIError%": n0,
    "%WeakMap%": typeof WeakMap > "u" ? oe : WeakMap,
    "%WeakRef%": typeof WeakRef > "u" ? oe : WeakRef,
    "%WeakSet%": typeof WeakSet > "u" ? oe : WeakSet
  };
  if (Pe)
    try {
      null.error;
    } catch (e) {
      qd = Pe(Pe(e)), Nt["%Error.prototype%"] = qd;
    }
  var qd, s0 = /* @__PURE__ */ a(function e(t) {
    var r;
    if (t === "%AsyncFunction%")
      r = sa("async function () {}");
    else if (t === "%GeneratorFunction%")
      r = sa("function* () {}");
    else if (t === "%AsyncGeneratorFunction%")
      r = sa("async function* () {}");
    else if (t === "%AsyncGenerator%") {
      var n = e("%AsyncGeneratorFunction%");
      n && (r = n.prototype);
    } else if (t === "%AsyncIteratorPrototype%") {
      var i = e("%AsyncGenerator%");
      i && Pe && (r = Pe(i.prototype));
    }
    return Nt[t] = r, r;
  }, "doEval"), Gd = {
    __proto__: null,
    "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
    "%ArrayPrototype%": ["Array", "prototype"],
    "%ArrayProto_entries%": ["Array", "prototype", "entries"],
    "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
    "%ArrayProto_keys%": ["Array", "prototype", "keys"],
    "%ArrayProto_values%": ["Array", "prototype", "values"],
    "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
    "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
    "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
    "%BooleanPrototype%": ["Boolean", "prototype"],
    "%DataViewPrototype%": ["DataView", "prototype"],
    "%DatePrototype%": ["Date", "prototype"],
    "%ErrorPrototype%": ["Error", "prototype"],
    "%EvalErrorPrototype%": ["EvalError", "prototype"],
    "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
    "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
    "%FunctionPrototype%": ["Function", "prototype"],
    "%Generator%": ["GeneratorFunction", "prototype"],
    "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
    "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
    "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
    "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
    "%JSONParse%": ["JSON", "parse"],
    "%JSONStringify%": ["JSON", "stringify"],
    "%MapPrototype%": ["Map", "prototype"],
    "%NumberPrototype%": ["Number", "prototype"],
    "%ObjectPrototype%": ["Object", "prototype"],
    "%ObjProto_toString%": ["Object", "prototype", "toString"],
    "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
    "%PromisePrototype%": ["Promise", "prototype"],
    "%PromiseProto_then%": ["Promise", "prototype", "then"],
    "%Promise_all%": ["Promise", "all"],
    "%Promise_reject%": ["Promise", "reject"],
    "%Promise_resolve%": ["Promise", "resolve"],
    "%RangeErrorPrototype%": ["RangeError", "prototype"],
    "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
    "%RegExpPrototype%": ["RegExp", "prototype"],
    "%SetPrototype%": ["Set", "prototype"],
    "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
    "%StringPrototype%": ["String", "prototype"],
    "%SymbolPrototype%": ["Symbol", "prototype"],
    "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
    "%TypedArrayPrototype%": ["TypedArray", "prototype"],
    "%TypeErrorPrototype%": ["TypeError", "prototype"],
    "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
    "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
    "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
    "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
    "%URIErrorPrototype%": ["URIError", "prototype"],
    "%WeakMapPrototype%": ["WeakMap", "prototype"],
    "%WeakSetPrototype%": ["WeakSet", "prototype"]
  }, Hr = lo(), uo = Ud(), l0 = Hr.call(Function.call, Array.prototype.concat), u0 = Hr.call(Function.apply, Array.prototype.splice), Yd = Hr.
  call(Function.call, String.prototype.replace), co = Hr.call(Function.call, String.prototype.slice), c0 = Hr.call(Function.call, RegExp.prototype.
  exec), p0 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, d0 = /\\(\\)?/g, f0 = /* @__PURE__ */ a(
  function(t) {
    var r = co(t, 0, 1), n = co(t, -1);
    if (r === "%" && n !== "%")
      throw new pr("invalid intrinsic syntax, expected closing `%`");
    if (n === "%" && r !== "%")
      throw new pr("invalid intrinsic syntax, expected opening `%`");
    var i = [];
    return Yd(t, p0, function(o, s, u, c) {
      i[i.length] = u ? Yd(c, d0, "$1") : s || o;
    }), i;
  }, "stringToPath"), m0 = /* @__PURE__ */ a(function(t, r) {
    var n = t, i;
    if (uo(Gd, n) && (i = Gd[n], n = "%" + i[0] + "%"), uo(Nt, n)) {
      var o = Nt[n];
      if (o === ur && (o = s0(n)), typeof o > "u" && !r)
        throw new cr("intrinsic " + t + " exists, but is not available. Please file an issue!");
      return {
        alias: i,
        name: n,
        value: o
      };
    }
    throw new pr("intrinsic " + t + " does not exist!");
  }, "getBaseIntrinsic");
  Xd.exports = /* @__PURE__ */ a(function(t, r) {
    if (typeof t != "string" || t.length === 0)
      throw new cr("intrinsic name must be a non-empty string");
    if (arguments.length > 1 && typeof r != "boolean")
      throw new cr('"allowMissing" argument must be a boolean');
    if (c0(/^%?[^%]*%?$/, t) === null)
      throw new pr("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
    var n = f0(t), i = n.length > 0 ? n[0] : "", o = m0("%" + i + "%", r), s = o.name, u = o.value, c = !1, p = o.alias;
    p && (i = p[0], u0(n, l0([0, 1], p)));
    for (var d = 1, h = !0; d < n.length; d += 1) {
      var f = n[d], b = co(f, 0, 1), m = co(f, -1);
      if ((b === '"' || b === "'" || b === "`" || m === '"' || m === "'" || m === "`") && b !== m)
        throw new pr("property names with quotes must have matching quotes");
      if ((f === "constructor" || !h) && (c = !0), i += "." + f, s = "%" + i + "%", uo(Nt, s))
        u = Nt[s];
      else if (u != null) {
        if (!(f in u)) {
          if (!r)
            throw new cr("base intrinsic for " + t + " exists, but the property is not available.");
          return;
        }
        if (Lt && d + 1 >= n.length) {
          var v = Lt(u, f);
          h = !!v, h && "get" in v && !("originalValue" in v.get) ? u = v.get : u = u[f];
        } else
          h = uo(u, f), u = u[f];
        h && !c && (Nt[s] = u);
      }
    }
    return u;
  }, "GetIntrinsic");
});

// ../node_modules/es-define-property/index.js
var fo = K((LF, Zd) => {
  "use strict";
  var h0 = Ft(), po = h0("%Object.defineProperty%", !0) || !1;
  if (po)
    try {
      po({}, "a", { value: 1 });
    } catch {
      po = !1;
    }
  Zd.exports = po;
});

// ../node_modules/gopd/index.js
var ua = K((NF, Jd) => {
  "use strict";
  var g0 = Ft(), mo = g0("%Object.getOwnPropertyDescriptor%", !0);
  if (mo)
    try {
      mo([], "length");
    } catch {
      mo = null;
    }
  Jd.exports = mo;
});

// ../node_modules/define-data-property/index.js
var nf = K((FF, rf) => {
  "use strict";
  var ef = fo(), y0 = ia(), dr = sr(), tf = ua();
  rf.exports = /* @__PURE__ */ a(function(t, r, n) {
    if (!t || typeof t != "object" && typeof t != "function")
      throw new dr("`obj` must be an object or a function`");
    if (typeof r != "string" && typeof r != "symbol")
      throw new dr("`property` must be a string or a symbol`");
    if (arguments.length > 3 && typeof arguments[3] != "boolean" && arguments[3] !== null)
      throw new dr("`nonEnumerable`, if provided, must be a boolean or null");
    if (arguments.length > 4 && typeof arguments[4] != "boolean" && arguments[4] !== null)
      throw new dr("`nonWritable`, if provided, must be a boolean or null");
    if (arguments.length > 5 && typeof arguments[5] != "boolean" && arguments[5] !== null)
      throw new dr("`nonConfigurable`, if provided, must be a boolean or null");
    if (arguments.length > 6 && typeof arguments[6] != "boolean")
      throw new dr("`loose`, if provided, must be a boolean");
    var i = arguments.length > 3 ? arguments[3] : null, o = arguments.length > 4 ? arguments[4] : null, s = arguments.length > 5 ? arguments[5] :
    null, u = arguments.length > 6 ? arguments[6] : !1, c = !!tf && tf(t, r);
    if (ef)
      ef(t, r, {
        configurable: s === null && c ? c.configurable : !s,
        enumerable: i === null && c ? c.enumerable : !i,
        value: n,
        writable: o === null && c ? c.writable : !o
      });
    else if (u || !i && !o && !s)
      t[r] = n;
    else
      throw new y0("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
  }, "defineDataProperty");
});

// ../node_modules/has-property-descriptors/index.js
var sf = K((BF, af) => {
  "use strict";
  var ca = fo(), of = /* @__PURE__ */ a(function() {
    return !!ca;
  }, "hasPropertyDescriptors");
  of.hasArrayLengthDefineBug = /* @__PURE__ */ a(function() {
    if (!ca)
      return null;
    try {
      return ca([], "length", { value: 1 }).length !== 1;
    } catch {
      return !0;
    }
  }, "hasArrayLengthDefineBug");
  af.exports = of;
});

// ../node_modules/set-function-length/index.js
var df = K((zF, pf) => {
  "use strict";
  var v0 = Ft(), lf = nf(), b0 = sf()(), uf = ua(), cf = sr(), I0 = v0("%Math.floor%");
  pf.exports = /* @__PURE__ */ a(function(t, r) {
    if (typeof t != "function")
      throw new cf("`fn` is not a function");
    if (typeof r != "number" || r < 0 || r > 4294967295 || I0(r) !== r)
      throw new cf("`length` must be a positive 32-bit integer");
    var n = arguments.length > 2 && !!arguments[2], i = !0, o = !0;
    if ("length" in t && uf) {
      var s = uf(t, "length");
      s && !s.configurable && (i = !1), s && !s.writable && (o = !1);
    }
    return (i || o || !n) && (b0 ? lf(
      /** @type {Parameters<define>[0]} */
      t,
      "length",
      r,
      !0,
      !0
    ) : lf(
      /** @type {Parameters<define>[0]} */
      t,
      "length",
      r
    )), t;
  }, "setFunctionLength");
});

// ../node_modules/call-bind/index.js
var vf = K((WF, ho) => {
  "use strict";
  var pa = lo(), go = Ft(), S0 = df(), x0 = sr(), hf = go("%Function.prototype.apply%"), gf = go("%Function.prototype.call%"), yf = go("%Ref\
lect.apply%", !0) || pa.call(gf, hf), ff = fo(), w0 = go("%Math.max%");
  ho.exports = /* @__PURE__ */ a(function(t) {
    if (typeof t != "function")
      throw new x0("a function is required");
    var r = yf(pa, gf, arguments);
    return S0(
      r,
      1 + w0(0, t.length - (arguments.length - 1)),
      !0
    );
  }, "callBind");
  var mf = /* @__PURE__ */ a(function() {
    return yf(pa, hf, arguments);
  }, "applyBind");
  ff ? ff(ho.exports, "apply", { value: mf }) : ho.exports.apply = mf;
});

// ../node_modules/call-bind/callBound.js
var xf = K((VF, Sf) => {
  "use strict";
  var bf = Ft(), If = vf(), E0 = If(bf("String.prototype.indexOf"));
  Sf.exports = /* @__PURE__ */ a(function(t, r) {
    var n = bf(t, !!r);
    return typeof n == "function" && E0(t, ".prototype.") > -1 ? If(n) : n;
  }, "callBoundIntrinsic");
});

// (disabled):../node_modules/object-inspect/util.inspect
var wf = K(() => {
});

// ../node_modules/object-inspect/index.js
var Kf = K((GF, Wf) => {
  var Sa = typeof Map == "function" && Map.prototype, da = Object.getOwnPropertyDescriptor && Sa ? Object.getOwnPropertyDescriptor(Map.prototype,
  "size") : null, vo = Sa && da && typeof da.get == "function" ? da.get : null, Ef = Sa && Map.prototype.forEach, xa = typeof Set == "functi\
on" && Set.prototype, fa = Object.getOwnPropertyDescriptor && xa ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null, bo = xa &&
  fa && typeof fa.get == "function" ? fa.get : null, Cf = xa && Set.prototype.forEach, C0 = typeof WeakMap == "function" && WeakMap.prototype,
  Rr = C0 ? WeakMap.prototype.has : null, T0 = typeof WeakSet == "function" && WeakSet.prototype, zr = T0 ? WeakSet.prototype.has : null, _0 = typeof WeakRef ==
  "function" && WeakRef.prototype, Tf = _0 ? WeakRef.prototype.deref : null, k0 = Boolean.prototype.valueOf, O0 = Object.prototype.toString,
  P0 = Function.prototype.toString, A0 = String.prototype.match, wa = String.prototype.slice, bt = String.prototype.replace, M0 = String.prototype.
  toUpperCase, _f = String.prototype.toLowerCase, Ff = RegExp.prototype.test, kf = Array.prototype.concat, nt = Array.prototype.join, D0 = Array.
  prototype.slice, Of = Math.floor, ga = typeof BigInt == "function" ? BigInt.prototype.valueOf : null, ma = Object.getOwnPropertySymbols, ya = typeof Symbol ==
  "function" && typeof Symbol.iterator == "symbol" ? Symbol.prototype.toString : null, fr = typeof Symbol == "function" && typeof Symbol.iterator ==
  "object", Le = typeof Symbol == "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === fr || !0) ? Symbol.toStringTag : null, Hf = Object.
  prototype.propertyIsEnumerable, Pf = (typeof Reflect == "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.
  prototype ? function(e) {
    return e.__proto__;
  } : null);
  function Af(e, t) {
    if (e === 1 / 0 || e === -1 / 0 || e !== e || e && e > -1e3 && e < 1e3 || Ff.call(/e/, t))
      return t;
    var r = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof e == "number") {
      var n = e < 0 ? -Of(-e) : Of(e);
      if (n !== e) {
        var i = String(n), o = wa.call(t, i.length + 1);
        return bt.call(i, r, "$&_") + "." + bt.call(bt.call(o, /([0-9]{3})/g, "$&_"), /_$/, "");
      }
    }
    return bt.call(t, r, "$&_");
  }
  a(Af, "addNumericSeparator");
  var va = wf(), Mf = va.custom, Df = Rf(Mf) ? Mf : null;
  Wf.exports = /* @__PURE__ */ a(function e(t, r, n, i) {
    var o = r || {};
    if (vt(o, "quoteStyle") && o.quoteStyle !== "single" && o.quoteStyle !== "double")
      throw new TypeError('option "quoteStyle" must be "single" or "double"');
    if (vt(o, "maxStringLength") && (typeof o.maxStringLength == "number" ? o.maxStringLength < 0 && o.maxStringLength !== 1 / 0 : o.maxStringLength !==
    null))
      throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    var s = vt(o, "customInspect") ? o.customInspect : !0;
    if (typeof s != "boolean" && s !== "symbol")
      throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
    if (vt(o, "indent") && o.indent !== null && o.indent !== "	" && !(parseInt(o.indent, 10) === o.indent && o.indent > 0))
      throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    if (vt(o, "numericSeparator") && typeof o.numericSeparator != "boolean")
      throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    var u = o.numericSeparator;
    if (typeof t > "u")
      return "undefined";
    if (t === null)
      return "null";
    if (typeof t == "boolean")
      return t ? "true" : "false";
    if (typeof t == "string")
      return $f(t, o);
    if (typeof t == "number") {
      if (t === 0)
        return 1 / 0 / t > 0 ? "0" : "-0";
      var c = String(t);
      return u ? Af(t, c) : c;
    }
    if (typeof t == "bigint") {
      var p = String(t) + "n";
      return u ? Af(t, p) : p;
    }
    var d = typeof o.depth > "u" ? 5 : o.depth;
    if (typeof n > "u" && (n = 0), n >= d && d > 0 && typeof t == "object")
      return ba(t) ? "[Array]" : "[Object]";
    var h = X0(o, n);
    if (typeof i > "u")
      i = [];
    else if (zf(i, t) >= 0)
      return "[Circular]";
    function f(L, M, W) {
      if (M && (i = D0.call(i), i.push(M)), W) {
        var Z = {
          depth: o.depth
        };
        return vt(o, "quoteStyle") && (Z.quoteStyle = o.quoteStyle), e(L, Z, n + 1, i);
      }
      return e(L, o, n + 1, i);
    }
    if (a(f, "inspect"), typeof t == "function" && !Lf(t)) {
      var b = W0(t), m = yo(t, f);
      return "[Function" + (b ? ": " + b : " (anonymous)") + "]" + (m.length > 0 ? " { " + nt.call(m, ", ") + " }" : "");
    }
    if (Rf(t)) {
      var v = fr ? bt.call(String(t), /^(Symbol\(.*\))_[^)]*$/, "$1") : ya.call(t);
      return typeof t == "object" && !fr ? Br(v) : v;
    }
    if (G0(t)) {
      for (var S = "<" + _f.call(String(t.nodeName)), C = t.attributes || [], g = 0; g < C.length; g++)
        S += " " + C[g].name + "=" + Bf(L0(C[g].value), "double", o);
      return S += ">", t.childNodes && t.childNodes.length && (S += "..."), S += "</" + _f.call(String(t.nodeName)) + ">", S;
    }
    if (ba(t)) {
      if (t.length === 0)
        return "[]";
      var y = yo(t, f);
      return h && !Q0(y) ? "[" + Ia(y, h) + "]" : "[ " + nt.call(y, ", ") + " ]";
    }
    if (F0(t)) {
      var I = yo(t, f);
      return !("cause" in Error.prototype) && "cause" in t && !Hf.call(t, "cause") ? "{ [" + String(t) + "] " + nt.call(kf.call("[cause]: " +
      f(t.cause), I), ", ") + " }" : I.length === 0 ? "[" + String(t) + "]" : "{ [" + String(t) + "] " + nt.call(I, ", ") + " }";
    }
    if (typeof t == "object" && s) {
      if (Df && typeof t[Df] == "function" && va)
        return va(t, { depth: d - n });
      if (s !== "symbol" && typeof t.inspect == "function")
        return t.inspect();
    }
    if (K0(t)) {
      var E = [];
      return Ef && Ef.call(t, function(L, M) {
        E.push(f(M, t, !0) + " => " + f(L, t));
      }), Nf("Map", vo.call(t), E, h);
    }
    if (U0(t)) {
      var T = [];
      return Cf && Cf.call(t, function(L) {
        T.push(f(L, t));
      }), Nf("Set", bo.call(t), T, h);
    }
    if (V0(t))
      return ha("WeakMap");
    if (q0(t))
      return ha("WeakSet");
    if (j0(t))
      return ha("WeakRef");
    if (B0(t))
      return Br(f(Number(t)));
    if (z0(t))
      return Br(f(ga.call(t)));
    if (R0(t))
      return Br(k0.call(t));
    if (H0(t))
      return Br(f(String(t)));
    if (typeof window < "u" && t === window)
      return "{ [object Window] }";
    if (t === global)
      return "{ [object globalThis] }";
    if (!N0(t) && !Lf(t)) {
      var _ = yo(t, f), k = Pf ? Pf(t) === Object.prototype : t instanceof Object || t.constructor === Object, w = t instanceof Object ? "" :
      "null prototype", O = !k && Le && Object(t) === t && Le in t ? wa.call(It(t), 8, -1) : w ? "Object" : "", P = k || typeof t.constructor !=
      "function" ? "" : t.constructor.name ? t.constructor.name + " " : "", D = P + (O || w ? "[" + nt.call(kf.call([], O || [], w || []), "\
: ") + "] " : "");
      return _.length === 0 ? D + "{}" : h ? D + "{" + Ia(_, h) + "}" : D + "{ " + nt.call(_, ", ") + " }";
    }
    return String(t);
  }, "inspect_");
  function Bf(e, t, r) {
    var n = (r.quoteStyle || t) === "double" ? '"' : "'";
    return n + e + n;
  }
  a(Bf, "wrapQuotes");
  function L0(e) {
    return bt.call(String(e), /"/g, "&quot;");
  }
  a(L0, "quote");
  function ba(e) {
    return It(e) === "[object Array]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(ba, "isArray");
  function N0(e) {
    return It(e) === "[object Date]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(N0, "isDate");
  function Lf(e) {
    return It(e) === "[object RegExp]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(Lf, "isRegExp");
  function F0(e) {
    return It(e) === "[object Error]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(F0, "isError");
  function H0(e) {
    return It(e) === "[object String]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(H0, "isString");
  function B0(e) {
    return It(e) === "[object Number]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(B0, "isNumber");
  function R0(e) {
    return It(e) === "[object Boolean]" && (!Le || !(typeof e == "object" && Le in e));
  }
  a(R0, "isBoolean");
  function Rf(e) {
    if (fr)
      return e && typeof e == "object" && e instanceof Symbol;
    if (typeof e == "symbol")
      return !0;
    if (!e || typeof e != "object" || !ya)
      return !1;
    try {
      return ya.call(e), !0;
    } catch {
    }
    return !1;
  }
  a(Rf, "isSymbol");
  function z0(e) {
    if (!e || typeof e != "object" || !ga)
      return !1;
    try {
      return ga.call(e), !0;
    } catch {
    }
    return !1;
  }
  a(z0, "isBigInt");
  var $0 = Object.prototype.hasOwnProperty || function(e) {
    return e in this;
  };
  function vt(e, t) {
    return $0.call(e, t);
  }
  a(vt, "has");
  function It(e) {
    return O0.call(e);
  }
  a(It, "toStr");
  function W0(e) {
    if (e.name)
      return e.name;
    var t = A0.call(P0.call(e), /^function\s*([\w$]+)/);
    return t ? t[1] : null;
  }
  a(W0, "nameOf");
  function zf(e, t) {
    if (e.indexOf)
      return e.indexOf(t);
    for (var r = 0, n = e.length; r < n; r++)
      if (e[r] === t)
        return r;
    return -1;
  }
  a(zf, "indexOf");
  function K0(e) {
    if (!vo || !e || typeof e != "object")
      return !1;
    try {
      vo.call(e);
      try {
        bo.call(e);
      } catch {
        return !0;
      }
      return e instanceof Map;
    } catch {
    }
    return !1;
  }
  a(K0, "isMap");
  function V0(e) {
    if (!Rr || !e || typeof e != "object")
      return !1;
    try {
      Rr.call(e, Rr);
      try {
        zr.call(e, zr);
      } catch {
        return !0;
      }
      return e instanceof WeakMap;
    } catch {
    }
    return !1;
  }
  a(V0, "isWeakMap");
  function j0(e) {
    if (!Tf || !e || typeof e != "object")
      return !1;
    try {
      return Tf.call(e), !0;
    } catch {
    }
    return !1;
  }
  a(j0, "isWeakRef");
  function U0(e) {
    if (!bo || !e || typeof e != "object")
      return !1;
    try {
      bo.call(e);
      try {
        vo.call(e);
      } catch {
        return !0;
      }
      return e instanceof Set;
    } catch {
    }
    return !1;
  }
  a(U0, "isSet");
  function q0(e) {
    if (!zr || !e || typeof e != "object")
      return !1;
    try {
      zr.call(e, zr);
      try {
        Rr.call(e, Rr);
      } catch {
        return !0;
      }
      return e instanceof WeakSet;
    } catch {
    }
    return !1;
  }
  a(q0, "isWeakSet");
  function G0(e) {
    return !e || typeof e != "object" ? !1 : typeof HTMLElement < "u" && e instanceof HTMLElement ? !0 : typeof e.nodeName == "string" && typeof e.
    getAttribute == "function";
  }
  a(G0, "isElement");
  function $f(e, t) {
    if (e.length > t.maxStringLength) {
      var r = e.length - t.maxStringLength, n = "... " + r + " more character" + (r > 1 ? "s" : "");
      return $f(wa.call(e, 0, t.maxStringLength), t) + n;
    }
    var i = bt.call(bt.call(e, /(['\\])/g, "\\$1"), /[\x00-\x1f]/g, Y0);
    return Bf(i, "single", t);
  }
  a($f, "inspectString");
  function Y0(e) {
    var t = e.charCodeAt(0), r = {
      8: "b",
      9: "t",
      10: "n",
      12: "f",
      13: "r"
    }[t];
    return r ? "\\" + r : "\\x" + (t < 16 ? "0" : "") + M0.call(t.toString(16));
  }
  a(Y0, "lowbyte");
  function Br(e) {
    return "Object(" + e + ")";
  }
  a(Br, "markBoxed");
  function ha(e) {
    return e + " { ? }";
  }
  a(ha, "weakCollectionOf");
  function Nf(e, t, r, n) {
    var i = n ? Ia(r, n) : nt.call(r, ", ");
    return e + " (" + t + ") {" + i + "}";
  }
  a(Nf, "collectionOf");
  function Q0(e) {
    for (var t = 0; t < e.length; t++)
      if (zf(e[t], `
`) >= 0)
        return !1;
    return !0;
  }
  a(Q0, "singleLineValues");
  function X0(e, t) {
    var r;
    if (e.indent === "	")
      r = "	";
    else if (typeof e.indent == "number" && e.indent > 0)
      r = nt.call(Array(e.indent + 1), " ");
    else
      return null;
    return {
      base: r,
      prev: nt.call(Array(t + 1), r)
    };
  }
  a(X0, "getIndent");
  function Ia(e, t) {
    if (e.length === 0)
      return "";
    var r = `
` + t.prev + t.base;
    return r + nt.call(e, "," + r) + `
` + t.prev;
  }
  a(Ia, "indentedJoin");
  function yo(e, t) {
    var r = ba(e), n = [];
    if (r) {
      n.length = e.length;
      for (var i = 0; i < e.length; i++)
        n[i] = vt(e, i) ? t(e[i], e) : "";
    }
    var o = typeof ma == "function" ? ma(e) : [], s;
    if (fr) {
      s = {};
      for (var u = 0; u < o.length; u++)
        s["$" + o[u]] = o[u];
    }
    for (var c in e)
      vt(e, c) && (r && String(Number(c)) === c && c < e.length || fr && s["$" + c] instanceof Symbol || (Ff.call(/[^\w$]/, c) ? n.push(t(c,
      e) + ": " + t(e[c], e)) : n.push(c + ": " + t(e[c], e))));
    if (typeof ma == "function")
      for (var p = 0; p < o.length; p++)
        Hf.call(e, o[p]) && n.push("[" + t(o[p]) + "]: " + t(e[o[p]], e));
    return n;
  }
  a(yo, "arrObjKeys");
});

// ../node_modules/side-channel/index.js
var Uf = K((QF, jf) => {
  "use strict";
  var Vf = Ft(), mr = xf(), Z0 = Kf(), J0 = sr(), Io = Vf("%WeakMap%", !0), So = Vf("%Map%", !0), eI = mr("WeakMap.prototype.get", !0), tI = mr(
  "WeakMap.prototype.set", !0), rI = mr("WeakMap.prototype.has", !0), nI = mr("Map.prototype.get", !0), oI = mr("Map.prototype.set", !0), iI = mr(
  "Map.prototype.has", !0), Ea = /* @__PURE__ */ a(function(e, t) {
    for (var r = e, n; (n = r.next) !== null; r = n)
      if (n.key === t)
        return r.next = n.next, n.next = /** @type {NonNullable<typeof list.next>} */
        e.next, e.next = n, n;
  }, "listGetNode"), aI = /* @__PURE__ */ a(function(e, t) {
    var r = Ea(e, t);
    return r && r.value;
  }, "listGet"), sI = /* @__PURE__ */ a(function(e, t, r) {
    var n = Ea(e, t);
    n ? n.value = r : e.next = /** @type {import('.').ListNode<typeof value>} */
    {
      // eslint-disable-line no-param-reassign, no-extra-parens
      key: t,
      next: e.next,
      value: r
    };
  }, "listSet"), lI = /* @__PURE__ */ a(function(e, t) {
    return !!Ea(e, t);
  }, "listHas");
  jf.exports = /* @__PURE__ */ a(function() {
    var t, r, n, i = {
      assert: /* @__PURE__ */ a(function(o) {
        if (!i.has(o))
          throw new J0("Side channel does not contain " + Z0(o));
      }, "assert"),
      get: /* @__PURE__ */ a(function(o) {
        if (Io && o && (typeof o == "object" || typeof o == "function")) {
          if (t)
            return eI(t, o);
        } else if (So) {
          if (r)
            return nI(r, o);
        } else if (n)
          return aI(n, o);
      }, "get"),
      has: /* @__PURE__ */ a(function(o) {
        if (Io && o && (typeof o == "object" || typeof o == "function")) {
          if (t)
            return rI(t, o);
        } else if (So) {
          if (r)
            return iI(r, o);
        } else if (n)
          return lI(n, o);
        return !1;
      }, "has"),
      set: /* @__PURE__ */ a(function(o, s) {
        Io && o && (typeof o == "object" || typeof o == "function") ? (t || (t = new Io()), tI(t, o, s)) : So ? (r || (r = new So()), oI(r, o,
        s)) : (n || (n = { key: {}, next: null }), sI(n, o, s));
      }, "set")
    };
    return i;
  }, "getSideChannel");
});

// ../node_modules/qs/lib/formats.js
var xo = K((ZF, qf) => {
  "use strict";
  var uI = String.prototype.replace, cI = /%20/g, Ca = {
    RFC1738: "RFC1738",
    RFC3986: "RFC3986"
  };
  qf.exports = {
    default: Ca.RFC3986,
    formatters: {
      RFC1738: /* @__PURE__ */ a(function(e) {
        return uI.call(e, cI, "+");
      }, "RFC1738"),
      RFC3986: /* @__PURE__ */ a(function(e) {
        return String(e);
      }, "RFC3986")
    },
    RFC1738: Ca.RFC1738,
    RFC3986: Ca.RFC3986
  };
});

// ../node_modules/qs/lib/utils.js
var ka = K((e5, Yf) => {
  "use strict";
  var pI = xo(), Ta = Object.prototype.hasOwnProperty, Ht = Array.isArray, ot = function() {
    for (var e = [], t = 0; t < 256; ++t)
      e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
    return e;
  }(), dI = /* @__PURE__ */ a(function(t) {
    for (; t.length > 1; ) {
      var r = t.pop(), n = r.obj[r.prop];
      if (Ht(n)) {
        for (var i = [], o = 0; o < n.length; ++o)
          typeof n[o] < "u" && i.push(n[o]);
        r.obj[r.prop] = i;
      }
    }
  }, "compactQueue"), Gf = /* @__PURE__ */ a(function(t, r) {
    for (var n = r && r.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, i = 0; i < t.length; ++i)
      typeof t[i] < "u" && (n[i] = t[i]);
    return n;
  }, "arrayToObject"), fI = /* @__PURE__ */ a(function e(t, r, n) {
    if (!r)
      return t;
    if (typeof r != "object") {
      if (Ht(t))
        t.push(r);
      else if (t && typeof t == "object")
        (n && (n.plainObjects || n.allowPrototypes) || !Ta.call(Object.prototype, r)) && (t[r] = !0);
      else
        return [t, r];
      return t;
    }
    if (!t || typeof t != "object")
      return [t].concat(r);
    var i = t;
    return Ht(t) && !Ht(r) && (i = Gf(t, n)), Ht(t) && Ht(r) ? (r.forEach(function(o, s) {
      if (Ta.call(t, s)) {
        var u = t[s];
        u && typeof u == "object" && o && typeof o == "object" ? t[s] = e(u, o, n) : t.push(o);
      } else
        t[s] = o;
    }), t) : Object.keys(r).reduce(function(o, s) {
      var u = r[s];
      return Ta.call(o, s) ? o[s] = e(o[s], u, n) : o[s] = u, o;
    }, i);
  }, "merge"), mI = /* @__PURE__ */ a(function(t, r) {
    return Object.keys(r).reduce(function(n, i) {
      return n[i] = r[i], n;
    }, t);
  }, "assignSingleSource"), hI = /* @__PURE__ */ a(function(e, t, r) {
    var n = e.replace(/\+/g, " ");
    if (r === "iso-8859-1")
      return n.replace(/%[0-9a-f]{2}/gi, unescape);
    try {
      return decodeURIComponent(n);
    } catch {
      return n;
    }
  }, "decode"), _a = 1024, gI = /* @__PURE__ */ a(function(t, r, n, i, o) {
    if (t.length === 0)
      return t;
    var s = t;
    if (typeof t == "symbol" ? s = Symbol.prototype.toString.call(t) : typeof t != "string" && (s = String(t)), n === "iso-8859-1")
      return escape(s).replace(/%u[0-9a-f]{4}/gi, function(b) {
        return "%26%23" + parseInt(b.slice(2), 16) + "%3B";
      });
    for (var u = "", c = 0; c < s.length; c += _a) {
      for (var p = s.length >= _a ? s.slice(c, c + _a) : s, d = [], h = 0; h < p.length; ++h) {
        var f = p.charCodeAt(h);
        if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === pI.RFC1738 &&
        (f === 40 || f === 41)) {
          d[d.length] = p.charAt(h);
          continue;
        }
        if (f < 128) {
          d[d.length] = ot[f];
          continue;
        }
        if (f < 2048) {
          d[d.length] = ot[192 | f >> 6] + ot[128 | f & 63];
          continue;
        }
        if (f < 55296 || f >= 57344) {
          d[d.length] = ot[224 | f >> 12] + ot[128 | f >> 6 & 63] + ot[128 | f & 63];
          continue;
        }
        h += 1, f = 65536 + ((f & 1023) << 10 | p.charCodeAt(h) & 1023), d[d.length] = ot[240 | f >> 18] + ot[128 | f >> 12 & 63] + ot[128 |
        f >> 6 & 63] + ot[128 | f & 63];
      }
      u += d.join("");
    }
    return u;
  }, "encode"), yI = /* @__PURE__ */ a(function(t) {
    for (var r = [{ obj: { o: t }, prop: "o" }], n = [], i = 0; i < r.length; ++i)
      for (var o = r[i], s = o.obj[o.prop], u = Object.keys(s), c = 0; c < u.length; ++c) {
        var p = u[c], d = s[p];
        typeof d == "object" && d !== null && n.indexOf(d) === -1 && (r.push({ obj: s, prop: p }), n.push(d));
      }
    return dI(r), t;
  }, "compact"), vI = /* @__PURE__ */ a(function(t) {
    return Object.prototype.toString.call(t) === "[object RegExp]";
  }, "isRegExp"), bI = /* @__PURE__ */ a(function(t) {
    return !t || typeof t != "object" ? !1 : !!(t.constructor && t.constructor.isBuffer && t.constructor.isBuffer(t));
  }, "isBuffer"), II = /* @__PURE__ */ a(function(t, r) {
    return [].concat(t, r);
  }, "combine"), SI = /* @__PURE__ */ a(function(t, r) {
    if (Ht(t)) {
      for (var n = [], i = 0; i < t.length; i += 1)
        n.push(r(t[i]));
      return n;
    }
    return r(t);
  }, "maybeMap");
  Yf.exports = {
    arrayToObject: Gf,
    assign: mI,
    combine: II,
    compact: yI,
    decode: hI,
    encode: gI,
    isBuffer: bI,
    isRegExp: vI,
    maybeMap: SI,
    merge: fI
  };
});

// ../node_modules/qs/lib/stringify.js
var tm = K((r5, em) => {
  "use strict";
  var Xf = Uf(), wo = ka(), $r = xo(), xI = Object.prototype.hasOwnProperty, Zf = {
    brackets: /* @__PURE__ */ a(function(t) {
      return t + "[]";
    }, "brackets"),
    comma: "comma",
    indices: /* @__PURE__ */ a(function(t, r) {
      return t + "[" + r + "]";
    }, "indices"),
    repeat: /* @__PURE__ */ a(function(t) {
      return t;
    }, "repeat")
  }, it = Array.isArray, wI = Array.prototype.push, Jf = /* @__PURE__ */ a(function(e, t) {
    wI.apply(e, it(t) ? t : [t]);
  }, "pushToArray"), EI = Date.prototype.toISOString, Qf = $r.default, Ce = {
    addQueryPrefix: !1,
    allowDots: !1,
    allowEmptyArrays: !1,
    arrayFormat: "indices",
    charset: "utf-8",
    charsetSentinel: !1,
    delimiter: "&",
    encode: !0,
    encodeDotInKeys: !1,
    encoder: wo.encode,
    encodeValuesOnly: !1,
    format: Qf,
    formatter: $r.formatters[Qf],
    // deprecated
    indices: !1,
    serializeDate: /* @__PURE__ */ a(function(t) {
      return EI.call(t);
    }, "serializeDate"),
    skipNulls: !1,
    strictNullHandling: !1
  }, CI = /* @__PURE__ */ a(function(t) {
    return typeof t == "string" || typeof t == "number" || typeof t == "boolean" || typeof t == "symbol" || typeof t == "bigint";
  }, "isNonNullishPrimitive"), Oa = {}, TI = /* @__PURE__ */ a(function e(t, r, n, i, o, s, u, c, p, d, h, f, b, m, v, S, C, g) {
    for (var y = t, I = g, E = 0, T = !1; (I = I.get(Oa)) !== void 0 && !T; ) {
      var _ = I.get(t);
      if (E += 1, typeof _ < "u") {
        if (_ === E)
          throw new RangeError("Cyclic object value");
        T = !0;
      }
      typeof I.get(Oa) > "u" && (E = 0);
    }
    if (typeof d == "function" ? y = d(r, y) : y instanceof Date ? y = b(y) : n === "comma" && it(y) && (y = wo.maybeMap(y, function(H) {
      return H instanceof Date ? b(H) : H;
    })), y === null) {
      if (s)
        return p && !S ? p(r, Ce.encoder, C, "key", m) : r;
      y = "";
    }
    if (CI(y) || wo.isBuffer(y)) {
      if (p) {
        var k = S ? r : p(r, Ce.encoder, C, "key", m);
        return [v(k) + "=" + v(p(y, Ce.encoder, C, "value", m))];
      }
      return [v(r) + "=" + v(String(y))];
    }
    var w = [];
    if (typeof y > "u")
      return w;
    var O;
    if (n === "comma" && it(y))
      S && p && (y = wo.maybeMap(y, p)), O = [{ value: y.length > 0 ? y.join(",") || null : void 0 }];
    else if (it(d))
      O = d;
    else {
      var P = Object.keys(y);
      O = h ? P.sort(h) : P;
    }
    var D = c ? r.replace(/\./g, "%2E") : r, L = i && it(y) && y.length === 1 ? D + "[]" : D;
    if (o && it(y) && y.length === 0)
      return L + "[]";
    for (var M = 0; M < O.length; ++M) {
      var W = O[M], Z = typeof W == "object" && typeof W.value < "u" ? W.value : y[W];
      if (!(u && Z === null)) {
        var G = f && c ? W.replace(/\./g, "%2E") : W, R = it(y) ? typeof n == "function" ? n(L, G) : L : L + (f ? "." + G : "[" + G + "]");
        g.set(t, E);
        var z = Xf();
        z.set(Oa, g), Jf(w, e(
          Z,
          R,
          n,
          i,
          o,
          s,
          u,
          c,
          n === "comma" && S && it(y) ? null : p,
          d,
          h,
          f,
          b,
          m,
          v,
          S,
          C,
          z
        ));
      }
    }
    return w;
  }, "stringify"), _I = /* @__PURE__ */ a(function(t) {
    if (!t)
      return Ce;
    if (typeof t.allowEmptyArrays < "u" && typeof t.allowEmptyArrays != "boolean")
      throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (typeof t.encodeDotInKeys < "u" && typeof t.encodeDotInKeys != "boolean")
      throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (t.encoder !== null && typeof t.encoder < "u" && typeof t.encoder != "function")
      throw new TypeError("Encoder has to be a function.");
    var r = t.charset || Ce.charset;
    if (typeof t.charset < "u" && t.charset !== "utf-8" && t.charset !== "iso-8859-1")
      throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var n = $r.default;
    if (typeof t.format < "u") {
      if (!xI.call($r.formatters, t.format))
        throw new TypeError("Unknown format option provided.");
      n = t.format;
    }
    var i = $r.formatters[n], o = Ce.filter;
    (typeof t.filter == "function" || it(t.filter)) && (o = t.filter);
    var s;
    if (t.arrayFormat in Zf ? s = t.arrayFormat : "indices" in t ? s = t.indices ? "indices" : "repeat" : s = Ce.arrayFormat, "commaRoundTri\
p" in t && typeof t.commaRoundTrip != "boolean")
      throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var u = typeof t.allowDots > "u" ? t.encodeDotInKeys === !0 ? !0 : Ce.allowDots : !!t.allowDots;
    return {
      addQueryPrefix: typeof t.addQueryPrefix == "boolean" ? t.addQueryPrefix : Ce.addQueryPrefix,
      allowDots: u,
      allowEmptyArrays: typeof t.allowEmptyArrays == "boolean" ? !!t.allowEmptyArrays : Ce.allowEmptyArrays,
      arrayFormat: s,
      charset: r,
      charsetSentinel: typeof t.charsetSentinel == "boolean" ? t.charsetSentinel : Ce.charsetSentinel,
      commaRoundTrip: t.commaRoundTrip,
      delimiter: typeof t.delimiter > "u" ? Ce.delimiter : t.delimiter,
      encode: typeof t.encode == "boolean" ? t.encode : Ce.encode,
      encodeDotInKeys: typeof t.encodeDotInKeys == "boolean" ? t.encodeDotInKeys : Ce.encodeDotInKeys,
      encoder: typeof t.encoder == "function" ? t.encoder : Ce.encoder,
      encodeValuesOnly: typeof t.encodeValuesOnly == "boolean" ? t.encodeValuesOnly : Ce.encodeValuesOnly,
      filter: o,
      format: n,
      formatter: i,
      serializeDate: typeof t.serializeDate == "function" ? t.serializeDate : Ce.serializeDate,
      skipNulls: typeof t.skipNulls == "boolean" ? t.skipNulls : Ce.skipNulls,
      sort: typeof t.sort == "function" ? t.sort : null,
      strictNullHandling: typeof t.strictNullHandling == "boolean" ? t.strictNullHandling : Ce.strictNullHandling
    };
  }, "normalizeStringifyOptions");
  em.exports = function(e, t) {
    var r = e, n = _I(t), i, o;
    typeof n.filter == "function" ? (o = n.filter, r = o("", r)) : it(n.filter) && (o = n.filter, i = o);
    var s = [];
    if (typeof r != "object" || r === null)
      return "";
    var u = Zf[n.arrayFormat], c = u === "comma" && n.commaRoundTrip;
    i || (i = Object.keys(r)), n.sort && i.sort(n.sort);
    for (var p = Xf(), d = 0; d < i.length; ++d) {
      var h = i[d];
      n.skipNulls && r[h] === null || Jf(s, TI(
        r[h],
        h,
        u,
        c,
        n.allowEmptyArrays,
        n.strictNullHandling,
        n.skipNulls,
        n.encodeDotInKeys,
        n.encode ? n.encoder : null,
        n.filter,
        n.sort,
        n.allowDots,
        n.serializeDate,
        n.format,
        n.formatter,
        n.encodeValuesOnly,
        n.charset,
        p
      ));
    }
    var f = s.join(n.delimiter), b = n.addQueryPrefix === !0 ? "?" : "";
    return n.charsetSentinel && (n.charset === "iso-8859-1" ? b += "utf8=%26%2310003%3B&" : b += "utf8=%E2%9C%93&"), f.length > 0 ? b + f : "";
  };
});

// ../node_modules/qs/lib/parse.js
var om = K((o5, nm) => {
  "use strict";
  var hr = ka(), Pa = Object.prototype.hasOwnProperty, kI = Array.isArray, Ie = {
    allowDots: !1,
    allowEmptyArrays: !1,
    allowPrototypes: !1,
    allowSparse: !1,
    arrayLimit: 20,
    charset: "utf-8",
    charsetSentinel: !1,
    comma: !1,
    decodeDotInKeys: !1,
    decoder: hr.decode,
    delimiter: "&",
    depth: 5,
    duplicates: "combine",
    ignoreQueryPrefix: !1,
    interpretNumericEntities: !1,
    parameterLimit: 1e3,
    parseArrays: !0,
    plainObjects: !1,
    strictNullHandling: !1
  }, OI = /* @__PURE__ */ a(function(e) {
    return e.replace(/&#(\d+);/g, function(t, r) {
      return String.fromCharCode(parseInt(r, 10));
    });
  }, "interpretNumericEntities"), rm = /* @__PURE__ */ a(function(e, t) {
    return e && typeof e == "string" && t.comma && e.indexOf(",") > -1 ? e.split(",") : e;
  }, "parseArrayValue"), PI = "utf8=%26%2310003%3B", AI = "utf8=%E2%9C%93", MI = /* @__PURE__ */ a(function(t, r) {
    var n = { __proto__: null }, i = r.ignoreQueryPrefix ? t.replace(/^\?/, "") : t;
    i = i.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    var o = r.parameterLimit === 1 / 0 ? void 0 : r.parameterLimit, s = i.split(r.delimiter, o), u = -1, c, p = r.charset;
    if (r.charsetSentinel)
      for (c = 0; c < s.length; ++c)
        s[c].indexOf("utf8=") === 0 && (s[c] === AI ? p = "utf-8" : s[c] === PI && (p = "iso-8859-1"), u = c, c = s.length);
    for (c = 0; c < s.length; ++c)
      if (c !== u) {
        var d = s[c], h = d.indexOf("]="), f = h === -1 ? d.indexOf("=") : h + 1, b, m;
        f === -1 ? (b = r.decoder(d, Ie.decoder, p, "key"), m = r.strictNullHandling ? null : "") : (b = r.decoder(d.slice(0, f), Ie.decoder,
        p, "key"), m = hr.maybeMap(
          rm(d.slice(f + 1), r),
          function(S) {
            return r.decoder(S, Ie.decoder, p, "value");
          }
        )), m && r.interpretNumericEntities && p === "iso-8859-1" && (m = OI(m)), d.indexOf("[]=") > -1 && (m = kI(m) ? [m] : m);
        var v = Pa.call(n, b);
        v && r.duplicates === "combine" ? n[b] = hr.combine(n[b], m) : (!v || r.duplicates === "last") && (n[b] = m);
      }
    return n;
  }, "parseQueryStringValues"), DI = /* @__PURE__ */ a(function(e, t, r, n) {
    for (var i = n ? t : rm(t, r), o = e.length - 1; o >= 0; --o) {
      var s, u = e[o];
      if (u === "[]" && r.parseArrays)
        s = r.allowEmptyArrays && (i === "" || r.strictNullHandling && i === null) ? [] : [].concat(i);
      else {
        s = r.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        var c = u.charAt(0) === "[" && u.charAt(u.length - 1) === "]" ? u.slice(1, -1) : u, p = r.decodeDotInKeys ? c.replace(/%2E/g, ".") :
        c, d = parseInt(p, 10);
        !r.parseArrays && p === "" ? s = { 0: i } : !isNaN(d) && u !== p && String(d) === p && d >= 0 && r.parseArrays && d <= r.arrayLimit ?
        (s = [], s[d] = i) : p !== "__proto__" && (s[p] = i);
      }
      i = s;
    }
    return i;
  }, "parseObject"), LI = /* @__PURE__ */ a(function(t, r, n, i) {
    if (t) {
      var o = n.allowDots ? t.replace(/\.([^.[]+)/g, "[$1]") : t, s = /(\[[^[\]]*])/, u = /(\[[^[\]]*])/g, c = n.depth > 0 && s.exec(o), p = c ?
      o.slice(0, c.index) : o, d = [];
      if (p) {
        if (!n.plainObjects && Pa.call(Object.prototype, p) && !n.allowPrototypes)
          return;
        d.push(p);
      }
      for (var h = 0; n.depth > 0 && (c = u.exec(o)) !== null && h < n.depth; ) {
        if (h += 1, !n.plainObjects && Pa.call(Object.prototype, c[1].slice(1, -1)) && !n.allowPrototypes)
          return;
        d.push(c[1]);
      }
      return c && d.push("[" + o.slice(c.index) + "]"), DI(d, r, n, i);
    }
  }, "parseQueryStringKeys"), NI = /* @__PURE__ */ a(function(t) {
    if (!t)
      return Ie;
    if (typeof t.allowEmptyArrays < "u" && typeof t.allowEmptyArrays != "boolean")
      throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (typeof t.decodeDotInKeys < "u" && typeof t.decodeDotInKeys != "boolean")
      throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
    if (t.decoder !== null && typeof t.decoder < "u" && typeof t.decoder != "function")
      throw new TypeError("Decoder has to be a function.");
    if (typeof t.charset < "u" && t.charset !== "utf-8" && t.charset !== "iso-8859-1")
      throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var r = typeof t.charset > "u" ? Ie.charset : t.charset, n = typeof t.duplicates > "u" ? Ie.duplicates : t.duplicates;
    if (n !== "combine" && n !== "first" && n !== "last")
      throw new TypeError("The duplicates option must be either combine, first, or last");
    var i = typeof t.allowDots > "u" ? t.decodeDotInKeys === !0 ? !0 : Ie.allowDots : !!t.allowDots;
    return {
      allowDots: i,
      allowEmptyArrays: typeof t.allowEmptyArrays == "boolean" ? !!t.allowEmptyArrays : Ie.allowEmptyArrays,
      allowPrototypes: typeof t.allowPrototypes == "boolean" ? t.allowPrototypes : Ie.allowPrototypes,
      allowSparse: typeof t.allowSparse == "boolean" ? t.allowSparse : Ie.allowSparse,
      arrayLimit: typeof t.arrayLimit == "number" ? t.arrayLimit : Ie.arrayLimit,
      charset: r,
      charsetSentinel: typeof t.charsetSentinel == "boolean" ? t.charsetSentinel : Ie.charsetSentinel,
      comma: typeof t.comma == "boolean" ? t.comma : Ie.comma,
      decodeDotInKeys: typeof t.decodeDotInKeys == "boolean" ? t.decodeDotInKeys : Ie.decodeDotInKeys,
      decoder: typeof t.decoder == "function" ? t.decoder : Ie.decoder,
      delimiter: typeof t.delimiter == "string" || hr.isRegExp(t.delimiter) ? t.delimiter : Ie.delimiter,
      // eslint-disable-next-line no-implicit-coercion, no-extra-parens
      depth: typeof t.depth == "number" || t.depth === !1 ? +t.depth : Ie.depth,
      duplicates: n,
      ignoreQueryPrefix: t.ignoreQueryPrefix === !0,
      interpretNumericEntities: typeof t.interpretNumericEntities == "boolean" ? t.interpretNumericEntities : Ie.interpretNumericEntities,
      parameterLimit: typeof t.parameterLimit == "number" ? t.parameterLimit : Ie.parameterLimit,
      parseArrays: t.parseArrays !== !1,
      plainObjects: typeof t.plainObjects == "boolean" ? t.plainObjects : Ie.plainObjects,
      strictNullHandling: typeof t.strictNullHandling == "boolean" ? t.strictNullHandling : Ie.strictNullHandling
    };
  }, "normalizeParseOptions");
  nm.exports = function(e, t) {
    var r = NI(t);
    if (e === "" || e === null || typeof e > "u")
      return r.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
    for (var n = typeof e == "string" ? MI(e, r) : e, i = r.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, o = Object.keys(n), s = 0; s <
    o.length; ++s) {
      var u = o[s], c = LI(u, n[u], r, typeof e == "string");
      i = hr.merge(i, c, r);
    }
    return r.allowSparse === !0 ? i : hr.compact(i);
  };
});

// ../node_modules/qs/lib/index.js
var am = K((a5, im) => {
  "use strict";
  var FI = tm(), HI = om(), BI = xo();
  im.exports = {
    formats: BI,
    parse: HI,
    stringify: FI
  };
});

// ../node_modules/@storybook/global/dist/index.mjs
var ae = (() => {
  let e;
  return typeof window < "u" ? e = window : typeof globalThis < "u" ? e = globalThis : typeof global < "u" ? e = global : typeof self < "u" ?
  e = self : e = {}, e;
})();

// global-externals:@storybook/core/manager-api
var _x = __STORYBOOK_API__, { ActiveTabs: kx, Consumer: he, ManagerContext: Ox, Provider: Ua, RequestResponseError: Px, addons: Ge, combineParameters: Ax,
controlOrMetaKey: Mx, controlOrMetaSymbol: Dx, eventMatchesShortcut: Lx, eventToShortcut: qa, experimental_requestResponse: jr, isMacLike: Nx,
isShortcutTaken: Fx, keyToSymbol: Hx, merge: Ur, mockChannel: Bx, optionOrAltSymbol: Rx, shortcutMatchesShortcut: Ga, shortcutToHumanString: Ye,
types: ve, useAddonState: zx, useArgTypes: $x, useArgs: Wx, useChannel: Kx, useGlobalTypes: Vx, useGlobals: jx, useParameter: Ux, useSharedState: qx,
useStoryPrepared: Gx, useStorybookApi: me, useStorybookState: et } = __STORYBOOK_API__;

// global-externals:@storybook/core/channels
var Qx = __STORYBOOK_CHANNELS__, { Channel: Xx, PostMessageTransport: Zx, WebsocketTransport: Jx, createBrowserChannel: Ya } = __STORYBOOK_CHANNELS__;

// global-externals:@storybook/core/core-events
var tw = __STORYBOOK_CORE_EVENTS__, { ARGTYPES_INFO_REQUEST: Qa, ARGTYPES_INFO_RESPONSE: Xa, CHANNEL_CREATED: Za, CHANNEL_WS_DISCONNECT: rw,
CONFIG_ERROR: nw, CREATE_NEW_STORYFILE_REQUEST: Ja, CREATE_NEW_STORYFILE_RESPONSE: es, CURRENT_STORY_WAS_SET: ow, DOCS_PREPARED: iw, DOCS_RENDERED: aw,
FILE_COMPONENT_SEARCH_REQUEST: ts, FILE_COMPONENT_SEARCH_RESPONSE: qr, FORCE_REMOUNT: Oo, FORCE_RE_RENDER: sw, GLOBALS_UPDATED: lw, NAVIGATE_URL: uw,
PLAY_FUNCTION_THREW_EXCEPTION: cw, PRELOAD_ENTRIES: xt, PREVIEW_BUILDER_PROGRESS: rs, PREVIEW_KEYDOWN: pw, REGISTER_SUBSCRIPTION: dw, REQUEST_WHATS_NEW_DATA: fw,
RESET_STORY_ARGS: mw, RESULT_WHATS_NEW_DATA: hw, SAVE_STORY_REQUEST: ns, SAVE_STORY_RESPONSE: os, SELECT_STORY: gw, SET_CONFIG: yw, SET_CURRENT_STORY: is,
SET_GLOBALS: vw, SET_INDEX: bw, SET_STORIES: Iw, SET_WHATS_NEW_CACHE: Sw, SHARED_STATE_CHANGED: xw, SHARED_STATE_SET: ww, STORIES_COLLAPSE_ALL: Po,
STORIES_EXPAND_ALL: Ao, STORY_ARGS_UPDATED: Ew, STORY_CHANGED: Cw, STORY_ERRORED: Tw, STORY_INDEX_INVALIDATED: _w, STORY_MISSING: kw, STORY_PREPARED: Ow,
STORY_RENDERED: Pw, STORY_RENDER_PHASE_CHANGED: Aw, STORY_SPECIFIED: Mw, STORY_THREW_EXCEPTION: Dw, STORY_UNCHANGED: Lw, TELEMETRY_ERROR: Nw,
TOGGLE_WHATS_NEW_NOTIFICATIONS: Fw, UNHANDLED_ERRORS_WHILE_PLAYING: Hw, UPDATE_GLOBALS: Bw, UPDATE_QUERY_PARAMS: Rw, UPDATE_STORY_ARGS: zw } = __STORYBOOK_CORE_EVENTS__;

// src/manager/provider.ts
var Mo = class Mo {
  getElements(t) {
    throw new Error("Provider.getElements() is not implemented!");
  }
  handleAPI(t) {
    throw new Error("Provider.handleAPI() is not implemented!");
  }
  getConfig() {
    return console.error("Provider.getConfig() is not implemented!"), {};
  }
};
a(Mo, "Provider");
var wt = Mo;

// global-externals:react-dom/client
var Vw = __REACT_DOM_CLIENT__, { createRoot: as, hydrateRoot: jw } = __REACT_DOM_CLIENT__;

// global-externals:react
var l = __REACT__, { Children: qw, Component: He, Fragment: _e, Profiler: Gw, PureComponent: Yw, StrictMode: Qw, Suspense: Xw, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Zw,
cloneElement: ss, createContext: Gr, createElement: Jw, createFactory: eE, createRef: tE, forwardRef: ls, isValidElement: rE, lazy: nE, memo: Ir,
startTransition: oE, unstable_act: iE, useCallback: A, useContext: us, useDebugValue: aE, useDeferredValue: cs, useEffect: V, useId: sE, useImperativeHandle: lE,
useInsertionEffect: uE, useLayoutEffect: Wt, useMemo: j, useReducer: Kt, useRef: X, useState: J, useSyncExternalStore: cE, useTransition: ps,
version: pE } = __REACT__;

// global-externals:@storybook/core/router
var dE = __STORYBOOK_ROUTER__, { BaseLocationProvider: fE, DEEPLY_EQUAL: mE, Link: Yr, Location: Qr, LocationProvider: ds, Match: fs, Route: Sr,
buildArgsParam: hE, deepDiff: gE, getMatch: yE, parsePath: vE, queryFromLocation: bE, queryFromString: IE, stringifyQuery: SE, useNavigate: ms } = __STORYBOOK_ROUTER__;

// global-externals:@storybook/core/theming
var wE = __STORYBOOK_THEMING__, { CacheProvider: EE, ClassNames: CE, Global: Vt, ThemeProvider: Do, background: TE, color: _E, convert: kE, create: OE,
createCache: PE, createGlobal: hs, createReset: AE, css: ME, darken: DE, ensure: gs, ignoreSsrWarning: LE, isPropValid: NE, jsx: FE, keyframes: xr,
lighten: HE, styled: x, themes: BE, typography: RE, useTheme: Re, withTheme: ys } = __STORYBOOK_THEMING__;

// global-externals:@storybook/core/manager-errors
var $E = __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__, { Category: WE, ProviderDoesNotExtendBaseProviderError: vs, UncaughtManagerError: KE } = __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__;

// ../node_modules/react-helmet-async/lib/index.module.js
var ne = Fe(Lo()), Bs = Fe(_s()), Ro = Fe(Os()), Rs = Fe(As());
function be() {
  return be = Object.assign || function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, be.apply(this, arguments);
}
a(be, "a");
function Ko(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, zo(e, t);
}
a(Ko, "s");
function zo(e, t) {
  return zo = Object.setPrototypeOf || function(r, n) {
    return r.__proto__ = n, r;
  }, zo(e, t);
}
a(zo, "c");
function Ms(e, t) {
  if (e == null) return {};
  var r, n, i = {}, o = Object.keys(e);
  for (n = 0; n < o.length; n++) t.indexOf(r = o[n]) >= 0 || (i[r] = e[r]);
  return i;
}
a(Ms, "u");
var Y = { BASE: "base", BODY: "body", HEAD: "head", HTML: "html", LINK: "link", META: "meta", NOSCRIPT: "noscript", SCRIPT: "script", STYLE: "\
style", TITLE: "title", FRAGMENT: "Symbol(react.fragment)" }, fh = { rel: ["amphtml", "canonical", "alternate"] }, mh = { type: ["applicatio\
n/ld+json"] }, hh = { charset: "", name: ["robots", "description"], property: ["og:type", "og:title", "og:url", "og:image", "og:image:alt", "\
og:description", "twitter:url", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt", "twitter:card", "twitter:site"] },
Ds = Object.keys(Y).map(function(e) {
  return Y[e];
}), en = { accesskey: "accessKey", charset: "charSet", class: "className", contenteditable: "contentEditable", contextmenu: "contextMenu", "\
http-equiv": "httpEquiv", itemprop: "itemProp", tabindex: "tabIndex" }, gh = Object.keys(en).reduce(function(e, t) {
  return e[en[t]] = t, e;
}, {}), Ut = /* @__PURE__ */ a(function(e, t) {
  for (var r = e.length - 1; r >= 0; r -= 1) {
    var n = e[r];
    if (Object.prototype.hasOwnProperty.call(n, t)) return n[t];
  }
  return null;
}, "T"), yh = /* @__PURE__ */ a(function(e) {
  var t = Ut(e, Y.TITLE), r = Ut(e, "titleTemplate");
  if (Array.isArray(t) && (t = t.join("")), r && t) return r.replace(/%s/g, function() {
    return t;
  });
  var n = Ut(e, "defaultTitle");
  return t || n || void 0;
}, "g"), vh = /* @__PURE__ */ a(function(e) {
  return Ut(e, "onChangeClientState") || function() {
  };
}, "b"), No = /* @__PURE__ */ a(function(e, t) {
  return t.filter(function(r) {
    return r[e] !== void 0;
  }).map(function(r) {
    return r[e];
  }).reduce(function(r, n) {
    return be({}, r, n);
  }, {});
}, "v"), bh = /* @__PURE__ */ a(function(e, t) {
  return t.filter(function(r) {
    return r[Y.BASE] !== void 0;
  }).map(function(r) {
    return r[Y.BASE];
  }).reverse().reduce(function(r, n) {
    if (!r.length) for (var i = Object.keys(n), o = 0; o < i.length; o += 1) {
      var s = i[o].toLowerCase();
      if (e.indexOf(s) !== -1 && n[s]) return r.concat(n);
    }
    return r;
  }, []);
}, "A"), wr = /* @__PURE__ */ a(function(e, t, r) {
  var n = {};
  return r.filter(function(i) {
    return !!Array.isArray(i[e]) || (i[e] !== void 0 && console && typeof console.warn == "function" && console.warn("Helmet: " + e + ' shou\
ld be of type "Array". Instead found type "' + typeof i[e] + '"'), !1);
  }).map(function(i) {
    return i[e];
  }).reverse().reduce(function(i, o) {
    var s = {};
    o.filter(function(h) {
      for (var f, b = Object.keys(h), m = 0; m < b.length; m += 1) {
        var v = b[m], S = v.toLowerCase();
        t.indexOf(S) === -1 || f === "rel" && h[f].toLowerCase() === "canonical" || S === "rel" && h[S].toLowerCase() === "stylesheet" || (f =
        S), t.indexOf(v) === -1 || v !== "innerHTML" && v !== "cssText" && v !== "itemprop" || (f = v);
      }
      if (!f || !h[f]) return !1;
      var C = h[f].toLowerCase();
      return n[f] || (n[f] = {}), s[f] || (s[f] = {}), !n[f][C] && (s[f][C] = !0, !0);
    }).reverse().forEach(function(h) {
      return i.push(h);
    });
    for (var u = Object.keys(s), c = 0; c < u.length; c += 1) {
      var p = u[c], d = be({}, n[p], s[p]);
      n[p] = d;
    }
    return i;
  }, []).reverse();
}, "C"), Ih = /* @__PURE__ */ a(function(e, t) {
  if (Array.isArray(e) && e.length) {
    for (var r = 0; r < e.length; r += 1) if (e[r][t]) return !0;
  }
  return !1;
}, "O"), zs = /* @__PURE__ */ a(function(e) {
  return Array.isArray(e) ? e.join("") : e;
}, "S"), Fo = /* @__PURE__ */ a(function(e, t) {
  return Array.isArray(e) ? e.reduce(function(r, n) {
    return function(i, o) {
      for (var s = Object.keys(i), u = 0; u < s.length; u += 1) if (o[s[u]] && o[s[u]].includes(i[s[u]])) return !0;
      return !1;
    }(n, t) ? r.priority.push(n) : r.default.push(n), r;
  }, { priority: [], default: [] }) : { default: e };
}, "E"), Ls = /* @__PURE__ */ a(function(e, t) {
  var r;
  return be({}, e, ((r = {})[t] = void 0, r));
}, "I"), Sh = [Y.NOSCRIPT, Y.SCRIPT, Y.STYLE], Ho = /* @__PURE__ */ a(function(e, t) {
  return t === void 0 && (t = !0), t === !1 ? String(e) : String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(
  /"/g, "&quot;").replace(/'/g, "&#x27;");
}, "w"), Ns = /* @__PURE__ */ a(function(e) {
  return Object.keys(e).reduce(function(t, r) {
    var n = e[r] !== void 0 ? r + '="' + e[r] + '"' : "" + r;
    return t ? t + " " + n : n;
  }, "");
}, "x"), Fs = /* @__PURE__ */ a(function(e, t) {
  return t === void 0 && (t = {}), Object.keys(e).reduce(function(r, n) {
    return r[en[n] || n] = e[n], r;
  }, t);
}, "L"), Jr = /* @__PURE__ */ a(function(e, t) {
  return t.map(function(r, n) {
    var i, o = ((i = { key: n })["data-rh"] = !0, i);
    return Object.keys(r).forEach(function(s) {
      var u = en[s] || s;
      u === "innerHTML" || u === "cssText" ? o.dangerouslySetInnerHTML = { __html: r.innerHTML || r.cssText } : o[u] = r[s];
    }), l.createElement(e, o);
  });
}, "j"), Ke = /* @__PURE__ */ a(function(e, t, r) {
  switch (e) {
    case Y.TITLE:
      return { toComponent: /* @__PURE__ */ a(function() {
        return i = t.titleAttributes, (o = { key: n = t.title })["data-rh"] = !0, s = Fs(i, o), [l.createElement(Y.TITLE, s, n)];
        var n, i, o, s;
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return function(n, i, o, s) {
          var u = Ns(o), c = zs(i);
          return u ? "<" + n + ' data-rh="true" ' + u + ">" + Ho(c, s) + "</" + n + ">" : "<" + n + ' data-rh="true">' + Ho(c, s) + "</" + n +
          ">";
        }(e, t.title, t.titleAttributes, r);
      }, "toString") };
    case "bodyAttributes":
    case "htmlAttributes":
      return { toComponent: /* @__PURE__ */ a(function() {
        return Fs(t);
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return Ns(t);
      }, "toString") };
    default:
      return { toComponent: /* @__PURE__ */ a(function() {
        return Jr(e, t);
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return function(n, i, o) {
          return i.reduce(function(s, u) {
            var c = Object.keys(u).filter(function(h) {
              return !(h === "innerHTML" || h === "cssText");
            }).reduce(function(h, f) {
              var b = u[f] === void 0 ? f : f + '="' + Ho(u[f], o) + '"';
              return h ? h + " " + b : b;
            }, ""), p = u.innerHTML || u.cssText || "", d = Sh.indexOf(n) === -1;
            return s + "<" + n + ' data-rh="true" ' + c + (d ? "/>" : ">" + p + "</" + n + ">");
          }, "");
        }(e, t, r);
      }, "toString") };
  }
}, "M"), $o = /* @__PURE__ */ a(function(e) {
  var t = e.baseTag, r = e.bodyAttributes, n = e.encode, i = e.htmlAttributes, o = e.noscriptTags, s = e.styleTags, u = e.title, c = u === void 0 ?
  "" : u, p = e.titleAttributes, d = e.linkTags, h = e.metaTags, f = e.scriptTags, b = { toComponent: /* @__PURE__ */ a(function() {
  }, "toComponent"), toString: /* @__PURE__ */ a(function() {
    return "";
  }, "toString") };
  if (e.prioritizeSeoTags) {
    var m = function(v) {
      var S = v.linkTags, C = v.scriptTags, g = v.encode, y = Fo(v.metaTags, hh), I = Fo(S, fh), E = Fo(C, mh);
      return { priorityMethods: { toComponent: /* @__PURE__ */ a(function() {
        return [].concat(Jr(Y.META, y.priority), Jr(Y.LINK, I.priority), Jr(Y.SCRIPT, E.priority));
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return Ke(Y.META, y.priority, g) + " " + Ke(Y.LINK, I.priority, g) + " " + Ke(Y.SCRIPT, E.priority, g);
      }, "toString") }, metaTags: y.default, linkTags: I.default, scriptTags: E.default };
    }(e);
    b = m.priorityMethods, d = m.linkTags, h = m.metaTags, f = m.scriptTags;
  }
  return { priority: b, base: Ke(Y.BASE, t, n), bodyAttributes: Ke("bodyAttributes", r, n), htmlAttributes: Ke("htmlAttributes", i, n), link: Ke(
  Y.LINK, d, n), meta: Ke(Y.META, h, n), noscript: Ke(Y.NOSCRIPT, o, n), script: Ke(Y.SCRIPT, f, n), style: Ke(Y.STYLE, s, n), title: Ke(Y.TITLE,
  { title: c, titleAttributes: p }, n) };
}, "k"), Zr = [], Wo = /* @__PURE__ */ a(function(e, t) {
  var r = this;
  t === void 0 && (t = typeof document < "u"), this.instances = [], this.value = { setHelmet: /* @__PURE__ */ a(function(n) {
    r.context.helmet = n;
  }, "setHelmet"), helmetInstances: { get: /* @__PURE__ */ a(function() {
    return r.canUseDOM ? Zr : r.instances;
  }, "get"), add: /* @__PURE__ */ a(function(n) {
    (r.canUseDOM ? Zr : r.instances).push(n);
  }, "add"), remove: /* @__PURE__ */ a(function(n) {
    var i = (r.canUseDOM ? Zr : r.instances).indexOf(n);
    (r.canUseDOM ? Zr : r.instances).splice(i, 1);
  }, "remove") } }, this.context = e, this.canUseDOM = t, t || (e.helmet = $o({ baseTag: [], bodyAttributes: {}, encodeSpecialCharacters: !0,
  htmlAttributes: {}, linkTags: [], metaTags: [], noscriptTags: [], scriptTags: [], styleTags: [], title: "", titleAttributes: {} }));
}, "N"), $s = l.createContext({}), xh = ne.default.shape({ setHelmet: ne.default.func, helmetInstances: ne.default.shape({ get: ne.default.func,
add: ne.default.func, remove: ne.default.func }) }), wh = typeof document < "u", dt = /* @__PURE__ */ function(e) {
  function t(r) {
    var n;
    return (n = e.call(this, r) || this).helmetData = new Wo(n.props.context, t.canUseDOM), n;
  }
  return a(t, "r"), Ko(t, e), t.prototype.render = function() {
    return l.createElement($s.Provider, { value: this.helmetData.value }, this.props.children);
  }, t;
}(He);
dt.canUseDOM = wh, dt.propTypes = { context: ne.default.shape({ helmet: ne.default.shape() }), children: ne.default.node.isRequired }, dt.defaultProps =
{ context: {} }, dt.displayName = "HelmetProvider";
var jt = /* @__PURE__ */ a(function(e, t) {
  var r, n = document.head || document.querySelector(Y.HEAD), i = n.querySelectorAll(e + "[data-rh]"), o = [].slice.call(i), s = [];
  return t && t.length && t.forEach(function(u) {
    var c = document.createElement(e);
    for (var p in u) Object.prototype.hasOwnProperty.call(u, p) && (p === "innerHTML" ? c.innerHTML = u.innerHTML : p === "cssText" ? c.styleSheet ?
    c.styleSheet.cssText = u.cssText : c.appendChild(document.createTextNode(u.cssText)) : c.setAttribute(p, u[p] === void 0 ? "" : u[p]));
    c.setAttribute("data-rh", "true"), o.some(function(d, h) {
      return r = h, c.isEqualNode(d);
    }) ? o.splice(r, 1) : s.push(c);
  }), o.forEach(function(u) {
    return u.parentNode.removeChild(u);
  }), s.forEach(function(u) {
    return n.appendChild(u);
  }), { oldTags: o, newTags: s };
}, "Y"), Bo = /* @__PURE__ */ a(function(e, t) {
  var r = document.getElementsByTagName(e)[0];
  if (r) {
    for (var n = r.getAttribute("data-rh"), i = n ? n.split(",") : [], o = [].concat(i), s = Object.keys(t), u = 0; u < s.length; u += 1) {
      var c = s[u], p = t[c] || "";
      r.getAttribute(c) !== p && r.setAttribute(c, p), i.indexOf(c) === -1 && i.push(c);
      var d = o.indexOf(c);
      d !== -1 && o.splice(d, 1);
    }
    for (var h = o.length - 1; h >= 0; h -= 1) r.removeAttribute(o[h]);
    i.length === o.length ? r.removeAttribute("data-rh") : r.getAttribute("data-rh") !== s.join(",") && r.setAttribute("data-rh", s.join(","));
  }
}, "B"), Hs = /* @__PURE__ */ a(function(e, t) {
  var r = e.baseTag, n = e.htmlAttributes, i = e.linkTags, o = e.metaTags, s = e.noscriptTags, u = e.onChangeClientState, c = e.scriptTags, p = e.
  styleTags, d = e.title, h = e.titleAttributes;
  Bo(Y.BODY, e.bodyAttributes), Bo(Y.HTML, n), function(v, S) {
    v !== void 0 && document.title !== v && (document.title = zs(v)), Bo(Y.TITLE, S);
  }(d, h);
  var f = { baseTag: jt(Y.BASE, r), linkTags: jt(Y.LINK, i), metaTags: jt(Y.META, o), noscriptTags: jt(Y.NOSCRIPT, s), scriptTags: jt(Y.SCRIPT,
  c), styleTags: jt(Y.STYLE, p) }, b = {}, m = {};
  Object.keys(f).forEach(function(v) {
    var S = f[v], C = S.newTags, g = S.oldTags;
    C.length && (b[v] = C), g.length && (m[v] = f[v].oldTags);
  }), t && t(), u(e, b, m);
}, "K"), Er = null, tn = /* @__PURE__ */ function(e) {
  function t() {
    for (var n, i = arguments.length, o = new Array(i), s = 0; s < i; s++) o[s] = arguments[s];
    return (n = e.call.apply(e, [this].concat(o)) || this).rendered = !1, n;
  }
  a(t, "e"), Ko(t, e);
  var r = t.prototype;
  return r.shouldComponentUpdate = function(n) {
    return !(0, Rs.default)(n, this.props);
  }, r.componentDidUpdate = function() {
    this.emitChange();
  }, r.componentWillUnmount = function() {
    this.props.context.helmetInstances.remove(this), this.emitChange();
  }, r.emitChange = function() {
    var n, i, o = this.props.context, s = o.setHelmet, u = null, c = (n = o.helmetInstances.get().map(function(p) {
      var d = be({}, p.props);
      return delete d.context, d;
    }), { baseTag: bh(["href"], n), bodyAttributes: No("bodyAttributes", n), defer: Ut(n, "defer"), encode: Ut(n, "encodeSpecialCharacters"),
    htmlAttributes: No("htmlAttributes", n), linkTags: wr(Y.LINK, ["rel", "href"], n), metaTags: wr(Y.META, ["name", "charset", "http-equiv",
    "property", "itemprop"], n), noscriptTags: wr(Y.NOSCRIPT, ["innerHTML"], n), onChangeClientState: vh(n), scriptTags: wr(Y.SCRIPT, ["src",
    "innerHTML"], n), styleTags: wr(Y.STYLE, ["cssText"], n), title: yh(n), titleAttributes: No("titleAttributes", n), prioritizeSeoTags: Ih(
    n, "prioritizeSeoTags") });
    dt.canUseDOM ? (i = c, Er && cancelAnimationFrame(Er), i.defer ? Er = requestAnimationFrame(function() {
      Hs(i, function() {
        Er = null;
      });
    }) : (Hs(i), Er = null)) : $o && (u = $o(c)), s(u);
  }, r.init = function() {
    this.rendered || (this.rendered = !0, this.props.context.helmetInstances.add(this), this.emitChange());
  }, r.render = function() {
    return this.init(), null;
  }, t;
}(He);
tn.propTypes = { context: xh.isRequired }, tn.displayName = "HelmetDispatcher";
var Eh = ["children"], Ch = ["children"], Cr = /* @__PURE__ */ function(e) {
  function t() {
    return e.apply(this, arguments) || this;
  }
  a(t, "r"), Ko(t, e);
  var r = t.prototype;
  return r.shouldComponentUpdate = function(n) {
    return !(0, Bs.default)(Ls(this.props, "helmetData"), Ls(n, "helmetData"));
  }, r.mapNestedChildrenToProps = function(n, i) {
    if (!i) return null;
    switch (n.type) {
      case Y.SCRIPT:
      case Y.NOSCRIPT:
        return { innerHTML: i };
      case Y.STYLE:
        return { cssText: i };
      default:
        throw new Error("<" + n.type + " /> elements are self-closing and can not contain children. Refer to our API for more information.");
    }
  }, r.flattenArrayTypeChildren = function(n) {
    var i, o = n.child, s = n.arrayTypeChildren;
    return be({}, s, ((i = {})[o.type] = [].concat(s[o.type] || [], [be({}, n.newChildProps, this.mapNestedChildrenToProps(o, n.nestedChildren))]),
    i));
  }, r.mapObjectTypeChildren = function(n) {
    var i, o, s = n.child, u = n.newProps, c = n.newChildProps, p = n.nestedChildren;
    switch (s.type) {
      case Y.TITLE:
        return be({}, u, ((i = {})[s.type] = p, i.titleAttributes = be({}, c), i));
      case Y.BODY:
        return be({}, u, { bodyAttributes: be({}, c) });
      case Y.HTML:
        return be({}, u, { htmlAttributes: be({}, c) });
      default:
        return be({}, u, ((o = {})[s.type] = be({}, c), o));
    }
  }, r.mapArrayTypeChildrenToProps = function(n, i) {
    var o = be({}, i);
    return Object.keys(n).forEach(function(s) {
      var u;
      o = be({}, o, ((u = {})[s] = n[s], u));
    }), o;
  }, r.warnOnInvalidChildren = function(n, i) {
    return (0, Ro.default)(Ds.some(function(o) {
      return n.type === o;
    }), typeof n.type == "function" ? "You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to o\
ur API for more information." : "Only elements types " + Ds.join(", ") + " are allowed. Helmet does not support rendering <" + n.type + "> e\
lements. Refer to our API for more information."), (0, Ro.default)(!i || typeof i == "string" || Array.isArray(i) && !i.some(function(o) {
      return typeof o != "string";
    }), "Helmet expects a string as a child of <" + n.type + ">. Did you forget to wrap your children in braces? ( <" + n.type + ">{``}</" +
    n.type + "> ) Refer to our API for more information."), !0;
  }, r.mapChildrenToProps = function(n, i) {
    var o = this, s = {};
    return l.Children.forEach(n, function(u) {
      if (u && u.props) {
        var c = u.props, p = c.children, d = Ms(c, Eh), h = Object.keys(d).reduce(function(b, m) {
          return b[gh[m] || m] = d[m], b;
        }, {}), f = u.type;
        switch (typeof f == "symbol" ? f = f.toString() : o.warnOnInvalidChildren(u, p), f) {
          case Y.FRAGMENT:
            i = o.mapChildrenToProps(p, i);
            break;
          case Y.LINK:
          case Y.META:
          case Y.NOSCRIPT:
          case Y.SCRIPT:
          case Y.STYLE:
            s = o.flattenArrayTypeChildren({ child: u, arrayTypeChildren: s, newChildProps: h, nestedChildren: p });
            break;
          default:
            i = o.mapObjectTypeChildren({ child: u, newProps: i, newChildProps: h, nestedChildren: p });
        }
      }
    }), this.mapArrayTypeChildrenToProps(s, i);
  }, r.render = function() {
    var n = this.props, i = n.children, o = Ms(n, Ch), s = be({}, o), u = o.helmetData;
    return i && (s = this.mapChildrenToProps(i, s)), !u || u instanceof Wo || (u = new Wo(u.context, u.instances)), u ? /* @__PURE__ */ l.createElement(
    tn, be({}, s, { context: u.value, helmetData: void 0 })) : /* @__PURE__ */ l.createElement($s.Consumer, null, function(c) {
      return l.createElement(tn, be({}, s, { context: c }));
    });
  }, t;
}(He);
Cr.propTypes = { base: ne.default.object, bodyAttributes: ne.default.object, children: ne.default.oneOfType([ne.default.arrayOf(ne.default.node),
ne.default.node]), defaultTitle: ne.default.string, defer: ne.default.bool, encodeSpecialCharacters: ne.default.bool, htmlAttributes: ne.default.
object, link: ne.default.arrayOf(ne.default.object), meta: ne.default.arrayOf(ne.default.object), noscript: ne.default.arrayOf(ne.default.object),
onChangeClientState: ne.default.func, script: ne.default.arrayOf(ne.default.object), style: ne.default.arrayOf(ne.default.object), title: ne.default.
string, titleAttributes: ne.default.object, titleTemplate: ne.default.string, prioritizeSeoTags: ne.default.bool, helmetData: ne.default.object },
Cr.defaultProps = { defer: !0, encodeSpecialCharacters: !0, prioritizeSeoTags: !1 }, Cr.displayName = "Helmet";

// global-externals:@storybook/core/types
var aC = __STORYBOOK_TYPES__, { Addon_TypesEnum: ke } = __STORYBOOK_TYPES__;

// global-externals:@storybook/core/components
var lC = __STORYBOOK_COMPONENTS__, { A: uC, ActionBar: cC, AddonPanel: pC, Badge: Ws, Bar: dC, Blockquote: fC, Button: we, ClipboardCode: mC,
Code: hC, DL: gC, Div: yC, DocumentWrapper: vC, EmptyTabContent: Ks, ErrorFormatter: Vs, FlexBar: bC, Form: rn, H1: IC, H2: SC, H3: xC, H4: wC,
H5: EC, H6: CC, HR: TC, IconButton: ie, IconButtonSkeleton: _C, Icons: js, Img: kC, LI: OC, Link: De, ListItem: PC, Loader: nn, Modal: Et, OL: AC,
P: MC, Placeholder: DC, Pre: LC, ResetWrapper: NC, ScrollArea: on, Separator: qt, Spaced: at, Span: FC, StorybookIcon: HC, StorybookLogo: an,
Symbols: BC, SyntaxHighlighter: RC, TT: zC, TabBar: sn, TabButton: ln, TabWrapper: $C, Table: WC, Tabs: Us, TabsState: KC, TooltipLinkList: Gt,
TooltipMessage: VC, TooltipNote: un, UL: jC, WithTooltip: ze, WithTooltipPure: UC, Zoom: qs, codeCommon: qC, components: GC, createCopyToClipboardFunction: YC,
getStoryHref: Yt, icons: QC, interleaveSeparators: XC, nameSpaceClassNames: ZC, resetComponents: JC, withReset: eT } = __STORYBOOK_COMPONENTS__;

// src/manager/components/sidebar/Brand.tsx
var Th = x(an)(({ theme: e }) => ({
  width: "auto",
  height: "22px !important",
  display: "block",
  color: e.base === "light" ? e.color.defaultText : e.color.lightest
})), _h = x.img({
  display: "block",
  maxWidth: "150px",
  maxHeight: "100px"
}), Gs = x.a(({ theme: e }) => ({
  display: "inline-block",
  height: "100%",
  margin: "-3px -4px",
  padding: "2px 3px",
  border: "1px solid transparent",
  borderRadius: 3,
  color: "inherit",
  textDecoration: "none",
  "&:focus": {
    outline: 0,
    borderColor: e.color.secondary
  }
})), Ys = ys(({ theme: e }) => {
  let { title: t = "Storybook", url: r = "./", image: n, target: i } = e.brand, o = i || (r === "./" ? "" : "_blank");
  if (n === null)
    return t === null ? null : r ? /* @__PURE__ */ l.createElement(Gs, { href: r, target: o, dangerouslySetInnerHTML: { __html: t } }) : /* @__PURE__ */ l.
    createElement("div", { dangerouslySetInnerHTML: { __html: t } });
  let s = n ? /* @__PURE__ */ l.createElement(_h, { src: n, alt: t }) : /* @__PURE__ */ l.createElement(Th, { alt: t });
  return r ? /* @__PURE__ */ l.createElement(Gs, { title: t, href: r, target: o }, s) : /* @__PURE__ */ l.createElement("div", null, s);
});

// ../node_modules/@babel/runtime/helpers/esm/extends.js
function U() {
  return U = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, U.apply(null, arguments);
}
a(U, "_extends");

// ../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function Qs(e) {
  if (e === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
a(Qs, "_assertThisInitialized");

// ../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function ft(e, t) {
  return ft = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, n) {
    return r.__proto__ = n, r;
  }, ft(e, t);
}
a(ft, "_setPrototypeOf");

// ../node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
function Qt(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, ft(e, t);
}
a(Qt, "_inheritsLoose");

// ../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function cn(e) {
  return cn = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, cn(e);
}
a(cn, "_getPrototypeOf");

// ../node_modules/@babel/runtime/helpers/esm/isNativeFunction.js
function Xs(e) {
  try {
    return Function.toString.call(e).indexOf("[native code]") !== -1;
  } catch {
    return typeof e == "function";
  }
}
a(Xs, "_isNativeFunction");

// ../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
function Vo() {
  try {
    var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch {
  }
  return (Vo = /* @__PURE__ */ a(function() {
    return !!e;
  }, "_isNativeReflectConstruct"))();
}
a(Vo, "_isNativeReflectConstruct");

// ../node_modules/@babel/runtime/helpers/esm/construct.js
function Zs(e, t, r) {
  if (Vo()) return Reflect.construct.apply(null, arguments);
  var n = [null];
  n.push.apply(n, t);
  var i = new (e.bind.apply(e, n))();
  return r && ft(i, r.prototype), i;
}
a(Zs, "_construct");

// ../node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js
function pn(e) {
  var t = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
  return pn = /* @__PURE__ */ a(function(n) {
    if (n === null || !Xs(n)) return n;
    if (typeof n != "function") throw new TypeError("Super expression must either be null or a function");
    if (t !== void 0) {
      if (t.has(n)) return t.get(n);
      t.set(n, i);
    }
    function i() {
      return Zs(n, arguments, cn(this).constructor);
    }
    return a(i, "Wrapper"), i.prototype = Object.create(n.prototype, {
      constructor: {
        value: i,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), ft(i, n);
  }, "_wrapNativeSuper"), pn(e);
}
a(pn, "_wrapNativeSuper");

// ../node_modules/polished/dist/polished.esm.js
var Zt = /* @__PURE__ */ function(e) {
  Qt(t, e);
  function t(r) {
    var n;
    if (1)
      n = e.call(this, "An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#" + r +
      " for more information.") || this;
    else
      for (var i, o, s; s < i; s++)
        ;
    return Qs(n);
  }
  return a(t, "PolishedError"), t;
}(/* @__PURE__ */ pn(Error));
function jo(e) {
  return Math.round(e * 255);
}
a(jo, "colorToInt");
function kh(e, t, r) {
  return jo(e) + "," + jo(t) + "," + jo(r);
}
a(kh, "convertToInt");
function Js(e, t, r, n) {
  if (n === void 0 && (n = kh), t === 0)
    return n(r, r, r);
  var i = (e % 360 + 360) % 360 / 60, o = (1 - Math.abs(2 * r - 1)) * t, s = o * (1 - Math.abs(i % 2 - 1)), u = 0, c = 0, p = 0;
  i >= 0 && i < 1 ? (u = o, c = s) : i >= 1 && i < 2 ? (u = s, c = o) : i >= 2 && i < 3 ? (c = o, p = s) : i >= 3 && i < 4 ? (c = s, p = o) :
  i >= 4 && i < 5 ? (u = s, p = o) : i >= 5 && i < 6 && (u = o, p = s);
  var d = r - o / 2, h = u + d, f = c + d, b = p + d;
  return n(h, f, b);
}
a(Js, "hslToRgb");
var el = {
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "00ffff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "0000ff",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "00ffff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "ff00ff",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "639",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32"
};
function Oh(e) {
  if (typeof e != "string") return e;
  var t = e.toLowerCase();
  return el[t] ? "#" + el[t] : e;
}
a(Oh, "nameToHex");
var Ph = /^#[a-fA-F0-9]{6}$/, Ah = /^#[a-fA-F0-9]{8}$/, Mh = /^#[a-fA-F0-9]{3}$/, Dh = /^#[a-fA-F0-9]{4}$/, Uo = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i,
Lh = /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i, Nh = /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i,
Fh = /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
function nl(e) {
  if (typeof e != "string")
    throw new Zt(3);
  var t = Oh(e);
  if (t.match(Ph))
    return {
      red: parseInt("" + t[1] + t[2], 16),
      green: parseInt("" + t[3] + t[4], 16),
      blue: parseInt("" + t[5] + t[6], 16)
    };
  if (t.match(Ah)) {
    var r = parseFloat((parseInt("" + t[7] + t[8], 16) / 255).toFixed(2));
    return {
      red: parseInt("" + t[1] + t[2], 16),
      green: parseInt("" + t[3] + t[4], 16),
      blue: parseInt("" + t[5] + t[6], 16),
      alpha: r
    };
  }
  if (t.match(Mh))
    return {
      red: parseInt("" + t[1] + t[1], 16),
      green: parseInt("" + t[2] + t[2], 16),
      blue: parseInt("" + t[3] + t[3], 16)
    };
  if (t.match(Dh)) {
    var n = parseFloat((parseInt("" + t[4] + t[4], 16) / 255).toFixed(2));
    return {
      red: parseInt("" + t[1] + t[1], 16),
      green: parseInt("" + t[2] + t[2], 16),
      blue: parseInt("" + t[3] + t[3], 16),
      alpha: n
    };
  }
  var i = Uo.exec(t);
  if (i)
    return {
      red: parseInt("" + i[1], 10),
      green: parseInt("" + i[2], 10),
      blue: parseInt("" + i[3], 10)
    };
  var o = Lh.exec(t.substring(0, 50));
  if (o)
    return {
      red: parseInt("" + o[1], 10),
      green: parseInt("" + o[2], 10),
      blue: parseInt("" + o[3], 10),
      alpha: parseFloat("" + o[4]) > 1 ? parseFloat("" + o[4]) / 100 : parseFloat("" + o[4])
    };
  var s = Nh.exec(t);
  if (s) {
    var u = parseInt("" + s[1], 10), c = parseInt("" + s[2], 10) / 100, p = parseInt("" + s[3], 10) / 100, d = "rgb(" + Js(u, c, p) + ")", h = Uo.
    exec(d);
    if (!h)
      throw new Zt(4, t, d);
    return {
      red: parseInt("" + h[1], 10),
      green: parseInt("" + h[2], 10),
      blue: parseInt("" + h[3], 10)
    };
  }
  var f = Fh.exec(t.substring(0, 50));
  if (f) {
    var b = parseInt("" + f[1], 10), m = parseInt("" + f[2], 10) / 100, v = parseInt("" + f[3], 10) / 100, S = "rgb(" + Js(b, m, v) + ")", C = Uo.
    exec(S);
    if (!C)
      throw new Zt(4, t, S);
    return {
      red: parseInt("" + C[1], 10),
      green: parseInt("" + C[2], 10),
      blue: parseInt("" + C[3], 10),
      alpha: parseFloat("" + f[4]) > 1 ? parseFloat("" + f[4]) / 100 : parseFloat("" + f[4])
    };
  }
  throw new Zt(5);
}
a(nl, "parseToRgb");
var Hh = /* @__PURE__ */ a(function(t) {
  return t.length === 7 && t[1] === t[2] && t[3] === t[4] && t[5] === t[6] ? "#" + t[1] + t[3] + t[5] : t;
}, "reduceHexValue"), tl = Hh;
function Xt(e) {
  var t = e.toString(16);
  return t.length === 1 ? "0" + t : t;
}
a(Xt, "numberToHex");
function rl(e, t, r) {
  if (typeof e == "number" && typeof t == "number" && typeof r == "number")
    return tl("#" + Xt(e) + Xt(t) + Xt(r));
  if (typeof e == "object" && t === void 0 && r === void 0)
    return tl("#" + Xt(e.red) + Xt(e.green) + Xt(e.blue));
  throw new Zt(6);
}
a(rl, "rgb");
function qo(e, t, r, n) {
  if (typeof e == "string" && typeof t == "number") {
    var i = nl(e);
    return "rgba(" + i.red + "," + i.green + "," + i.blue + "," + t + ")";
  } else {
    if (typeof e == "number" && typeof t == "number" && typeof r == "number" && typeof n == "number")
      return n >= 1 ? rl(e, t, r) : "rgba(" + e + "," + t + "," + r + "," + n + ")";
    if (typeof e == "object" && t === void 0 && r === void 0 && n === void 0)
      return e.alpha >= 1 ? rl(e.red, e.green, e.blue) : "rgba(" + e.red + "," + e.green + "," + e.blue + "," + e.alpha + ")";
  }
  throw new Zt(7);
}
a(qo, "rgba");
function ol(e, t, r) {
  return /* @__PURE__ */ a(function() {
    var i = r.concat(Array.prototype.slice.call(arguments));
    return i.length >= t ? e.apply(this, i) : ol(e, t, i);
  }, "fn");
}
a(ol, "curried");
function Bh(e) {
  return ol(e, e.length, []);
}
a(Bh, "curry");
function Rh(e, t, r) {
  return Math.max(e, Math.min(t, r));
}
a(Rh, "guard");
function zh(e, t) {
  if (t === "transparent") return t;
  var r = nl(t), n = typeof r.alpha == "number" ? r.alpha : 1, i = U({}, r, {
    alpha: Rh(0, 1, +(n * 100 - parseFloat(e) * 100).toFixed(2) / 100)
  });
  return qo(i);
}
a(zh, "transparentize");
var $h = /* @__PURE__ */ Bh(zh), ge = $h;

// global-externals:@storybook/icons
var $T = __STORYBOOK_ICONS__, { AccessibilityAltIcon: WT, AccessibilityIcon: KT, AddIcon: VT, AdminIcon: jT, AlertAltIcon: UT, AlertIcon: dn,
AlignLeftIcon: qT, AlignRightIcon: GT, AppleIcon: YT, ArrowDownIcon: QT, ArrowLeftIcon: il, ArrowRightIcon: XT, ArrowSolidDownIcon: ZT, ArrowSolidLeftIcon: JT,
ArrowSolidRightIcon: e_, ArrowSolidUpIcon: t_, ArrowUpIcon: r_, AzureDevOpsIcon: n_, BackIcon: o_, BasketIcon: i_, BatchAcceptIcon: a_, BatchDenyIcon: s_,
BeakerIcon: l_, BellIcon: u_, BitbucketIcon: c_, BoldIcon: p_, BookIcon: d_, BookmarkHollowIcon: f_, BookmarkIcon: m_, BottomBarIcon: fn, BottomBarToggleIcon: al,
BoxIcon: h_, BranchIcon: g_, BrowserIcon: y_, ButtonIcon: v_, CPUIcon: b_, CalendarIcon: I_, CameraIcon: S_, CategoryIcon: x_, CertificateIcon: w_,
ChangedIcon: E_, ChatIcon: C_, CheckIcon: tt, ChevronDownIcon: Jt, ChevronLeftIcon: T_, ChevronRightIcon: sl, ChevronSmallDownIcon: __, ChevronSmallLeftIcon: k_,
ChevronSmallRightIcon: O_, ChevronSmallUpIcon: P_, ChevronUpIcon: A_, ChromaticIcon: M_, ChromeIcon: D_, CircleHollowIcon: L_, CircleIcon: ll,
ClearIcon: N_, CloseAltIcon: mn, CloseIcon: Qe, CloudHollowIcon: F_, CloudIcon: H_, CogIcon: Go, CollapseIcon: ul, CommandIcon: B_, CommentAddIcon: R_,
CommentIcon: z_, CommentsIcon: $_, CommitIcon: W_, CompassIcon: K_, ComponentDrivenIcon: V_, ComponentIcon: Yo, ContrastIcon: j_, ControlsIcon: U_,
CopyIcon: q_, CreditIcon: G_, CrossIcon: Y_, DashboardIcon: Q_, DatabaseIcon: X_, DeleteIcon: Z_, DiamondIcon: J_, DirectionIcon: e1, DiscordIcon: t1,
DocChartIcon: r1, DocListIcon: n1, DocumentIcon: er, DownloadIcon: o1, DragIcon: i1, EditIcon: a1, EllipsisIcon: s1, EmailIcon: l1, ExpandAltIcon: cl,
ExpandIcon: pl, EyeCloseIcon: dl, EyeIcon: fl, FaceHappyIcon: u1, FaceNeutralIcon: c1, FaceSadIcon: p1, FacebookIcon: d1, FailedIcon: f1, FastForwardIcon: m1,
FigmaIcon: h1, FilterIcon: g1, FlagIcon: y1, FolderIcon: v1, FormIcon: b1, GDriveIcon: I1, GithubIcon: hn, GitlabIcon: S1, GlobeIcon: Qo, GoogleIcon: x1,
GraphBarIcon: w1, GraphLineIcon: E1, GraphqlIcon: C1, GridAltIcon: T1, GridIcon: _1, GrowIcon: k1, HeartHollowIcon: O1, HeartIcon: ml, HomeIcon: P1,
HourglassIcon: A1, InfoIcon: hl, ItalicIcon: M1, JumpToIcon: D1, KeyIcon: L1, LightningIcon: gl, LightningOffIcon: N1, LinkBrokenIcon: F1, LinkIcon: yl,
LinkedinIcon: H1, LinuxIcon: B1, ListOrderedIcon: R1, ListUnorderedIcon: z1, LocationIcon: $1, LockIcon: gn, MarkdownIcon: W1, MarkupIcon: K1,
MediumIcon: V1, MemoryIcon: j1, MenuIcon: yn, MergeIcon: U1, MirrorIcon: q1, MobileIcon: G1, MoonIcon: Y1, NutIcon: Q1, OutboxIcon: X1, OutlineIcon: Z1,
PaintBrushIcon: J1, PaperClipIcon: ek, ParagraphIcon: tk, PassedIcon: rk, PhoneIcon: nk, PhotoDragIcon: ok, PhotoIcon: ik, PinAltIcon: ak, PinIcon: sk,
PlayBackIcon: lk, PlayIcon: uk, PlayNextIcon: ck, PlusIcon: vl, PointerDefaultIcon: pk, PointerHandIcon: dk, PowerIcon: fk, PrintIcon: mk, ProceedIcon: hk,
ProfileIcon: gk, PullRequestIcon: yk, QuestionIcon: vk, RSSIcon: bk, RedirectIcon: Ik, ReduxIcon: Sk, RefreshIcon: xk, ReplyIcon: wk, RepoIcon: Ek,
RequestChangeIcon: Ck, RewindIcon: Tk, RulerIcon: _k, SearchIcon: vn, ShareAltIcon: Ct, ShareIcon: kk, ShieldIcon: Ok, SideBySideIcon: Pk, SidebarAltIcon: bn,
SidebarAltToggleIcon: Ak, SidebarIcon: Mk, SidebarToggleIcon: Dk, SpeakerIcon: Lk, StackedIcon: Nk, StarHollowIcon: Fk, StarIcon: Hk, StickerIcon: Bk,
StopAltIcon: Rk, StopIcon: zk, StorybookIcon: bl, StructureIcon: $k, SubtractIcon: Wk, SunIcon: Kk, SupportIcon: Vk, SwitchAltIcon: jk, SyncIcon: tr,
TabletIcon: Uk, ThumbsUpIcon: qk, TimeIcon: Il, TimerIcon: Gk, TransferIcon: Yk, TrashIcon: Sl, TwitterIcon: Qk, TypeIcon: Xk, UbuntuIcon: Zk,
UndoIcon: Jk, UnfoldIcon: eO, UnlockIcon: tO, UnpinIcon: rO, UploadIcon: nO, UserAddIcon: oO, UserAltIcon: iO, UserIcon: aO, UsersIcon: sO, VSCodeIcon: lO,
VerifiedIcon: uO, VideoIcon: cO, WandIcon: xl, WatchIcon: pO, WindowsIcon: dO, WrenchIcon: fO, YoutubeIcon: mO, ZoomIcon: wl, ZoomOutIcon: El,
ZoomResetIcon: Cl, iconList: hO } = __STORYBOOK_ICONS__;

// src/manager/components/hooks/useMedia.tsx
function Tl(e) {
  let t = /* @__PURE__ */ a((o) => typeof window < "u" ? window.matchMedia(o).matches : !1, "getMatches"), [r, n] = J(t(e));
  function i() {
    n(t(e));
  }
  return a(i, "handleChange"), V(() => {
    let o = window.matchMedia(e);
    return i(), o.addEventListener("change", i), () => {
      o.removeEventListener("change", i);
    };
  }, [e]), r;
}
a(Tl, "useMediaQuery");

// src/manager/constants.ts
var st = "@media (min-width: 600px)";

// src/manager/components/layout/LayoutProvider.tsx
var _l = Gr({
  isMobileMenuOpen: !1,
  setMobileMenuOpen: /* @__PURE__ */ a(() => {
  }, "setMobileMenuOpen"),
  isMobileAboutOpen: !1,
  setMobileAboutOpen: /* @__PURE__ */ a(() => {
  }, "setMobileAboutOpen"),
  isMobilePanelOpen: !1,
  setMobilePanelOpen: /* @__PURE__ */ a(() => {
  }, "setMobilePanelOpen"),
  isDesktop: !1,
  isMobile: !1
}), kl = /* @__PURE__ */ a(({ children: e }) => {
  let [t, r] = J(!1), [n, i] = J(!1), [o, s] = J(!1), u = Tl(`(min-width: ${600}px)`), c = !u, p = j(
    () => ({
      isMobileMenuOpen: t,
      setMobileMenuOpen: r,
      isMobileAboutOpen: n,
      setMobileAboutOpen: i,
      isMobilePanelOpen: o,
      setMobilePanelOpen: s,
      isDesktop: u,
      isMobile: c
    }),
    [
      t,
      r,
      n,
      i,
      o,
      s,
      u,
      c
    ]
  );
  return /* @__PURE__ */ l.createElement(_l.Provider, { value: p }, e);
}, "LayoutProvider"), Ee = /* @__PURE__ */ a(() => us(_l), "useLayout");

// src/manager/components/sidebar/Menu.tsx
var Ol = x(ie)(({ highlighted: e, theme: t }) => ({
  position: "relative",
  overflow: "visible",
  marginTop: 0,
  zIndex: 1,
  ...e && {
    "&:before, &:after": {
      content: '""',
      position: "absolute",
      top: 6,
      right: 6,
      width: 5,
      height: 5,
      zIndex: 2,
      borderRadius: "50%",
      background: t.background.app,
      border: `1px solid ${t.background.app}`,
      boxShadow: `0 0 0 2px ${t.background.app}`
    },
    "&:after": {
      background: t.color.positive,
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: `0 0 0 2px ${t.background.app}`
    },
    "&:hover:after, &:focus-visible:after": {
      boxShadow: `0 0 0 2px ${ge(0.88, t.color.secondary)}`
    }
  }
})), Wh = x.div({
  display: "flex",
  gap: 4
}), Kh = /* @__PURE__ */ a(({ menu: e, onHide: t }) => {
  let r = j(() => e.map(({ onClick: n, ...i }) => ({
    ...i,
    onClick: /* @__PURE__ */ a((o, s) => {
      n && n(o, s), t();
    }, "onClick")
  })), [e, t]);
  return /* @__PURE__ */ l.createElement(Gt, { links: r });
}, "SidebarMenuList"), Pl = /* @__PURE__ */ a(({ menu: e, isHighlighted: t, onClick: r }) => {
  let [n, i] = J(!1), { isMobile: o, setMobileMenuOpen: s } = Ee();
  return o ? /* @__PURE__ */ l.createElement(Wh, null, /* @__PURE__ */ l.createElement(
    Ol,
    {
      title: "About Storybook",
      "aria-label": "About Storybook",
      highlighted: t,
      active: !1,
      onClick: r
    },
    /* @__PURE__ */ l.createElement(Go, null)
  ), /* @__PURE__ */ l.createElement(
    ie,
    {
      title: "Close menu",
      "aria-label": "Close menu",
      onClick: () => s(!1)
    },
    /* @__PURE__ */ l.createElement(Qe, null)
  )) : /* @__PURE__ */ l.createElement(
    ze,
    {
      placement: "top",
      closeOnOutsideClick: !0,
      tooltip: ({ onHide: u }) => /* @__PURE__ */ l.createElement(Kh, { onHide: u, menu: e }),
      onVisibleChange: i
    },
    /* @__PURE__ */ l.createElement(
      Ol,
      {
        title: "Shortcuts",
        "aria-label": "Shortcuts",
        highlighted: t,
        active: n
      },
      /* @__PURE__ */ l.createElement(Go, null)
    )
  );
}, "SidebarMenu");

// src/manager/components/sidebar/Heading.tsx
var Vh = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  fontWeight: e.typography.weight.bold,
  color: e.color.defaultText,
  marginRight: 20,
  display: "flex",
  width: "100%",
  alignItems: "center",
  minHeight: 22,
  "& > * > *": {
    maxWidth: "100%"
  },
  "& > *": {
    maxWidth: "100%",
    height: "auto",
    display: "block",
    flex: "1 1 auto"
  }
})), jh = x.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "relative",
  minHeight: 42,
  paddingLeft: 8
}), Uh = x(we)(({ theme: e }) => ({
  display: "none",
  "@media (min-width: 600px)": {
    display: "block",
    position: "absolute",
    fontSize: e.typography.size.s1,
    zIndex: 3,
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    wordWrap: "normal",
    opacity: 0,
    transition: "opacity 150ms ease-out",
    "&:focus": {
      width: "100%",
      height: "inherit",
      padding: "10px 15px",
      margin: 0,
      clip: "unset",
      overflow: "unset",
      opacity: 1
    }
  }
})), Al = /* @__PURE__ */ a(({
  menuHighlighted: e = !1,
  menu: t,
  skipLinkHref: r,
  extra: n,
  isLoading: i,
  onMenuClick: o,
  ...s
}) => /* @__PURE__ */ l.createElement(jh, { ...s }, r && /* @__PURE__ */ l.createElement(Uh, { asChild: !0 }, /* @__PURE__ */ l.createElement(
"a", { href: r, tabIndex: 0 }, "Skip to canvas")), /* @__PURE__ */ l.createElement(Vh, null, /* @__PURE__ */ l.createElement(Ys, null)), i ?
null : n.map(({ id: u, render: c }) => /* @__PURE__ */ l.createElement(c, { key: u })), /* @__PURE__ */ l.createElement(Pl, { menu: t, isHighlighted: e,
onClick: o })), "Heading");

// global-externals:@storybook/core/client-logger
var $O = __STORYBOOK_CLIENT_LOGGER__, { deprecate: WO, logger: Ml, once: KO, pretty: VO } = __STORYBOOK_CLIENT_LOGGER__;

// src/manager/components/sidebar/Loader.tsx
var Dl = [0, 0, 1, 1, 2, 3, 3, 3, 1, 1, 1, 2, 2, 2, 3], qh = x.div(
  {
    cursor: "progress",
    fontSize: 13,
    height: "16px",
    marginTop: 4,
    marginBottom: 4,
    alignItems: "center",
    overflow: "hidden"
  },
  ({ depth: e = 0 }) => ({
    marginLeft: e * 15,
    maxWidth: 85 - e * 5
  }),
  ({ theme: e }) => e.animation.inlineGlow,
  ({ theme: e }) => ({
    background: e.appBorderColor
  })
), Tr = x.div({
  display: "flex",
  flexDirection: "column",
  paddingLeft: 20,
  paddingRight: 20
}), Ll = /* @__PURE__ */ a(({ size: e }) => {
  let t = Math.ceil(e / Dl.length), r = Array.from(Array(t)).fill(Dl).flat().slice(0, e);
  return /* @__PURE__ */ l.createElement(_e, null, r.map((n, i) => /* @__PURE__ */ l.createElement(qh, { depth: n, key: i })));
}, "Loader");

// src/manager/components/sidebar/RefBlocks.tsx
var { window: Nl } = ae, Gh = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  lineHeight: "20px",
  margin: 0
})), Xo = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  lineHeight: "20px",
  margin: 0,
  code: {
    fontSize: e.typography.size.s1
  },
  ul: {
    paddingLeft: 20,
    marginTop: 8,
    marginBottom: 8
  }
})), Yh = x.pre(
  {
    width: 420,
    boxSizing: "border-box",
    borderRadius: 8,
    overflow: "auto",
    whiteSpace: "pre"
  },
  ({ theme: e }) => ({
    color: e.color.dark
  })
), Fl = /* @__PURE__ */ a(({ loginUrl: e, id: t }) => {
  let [r, n] = J(!1), i = A(() => {
    Nl.document.location.reload();
  }, []), o = A((s) => {
    s.preventDefault();
    let u = Nl.open(e, `storybook_auth_${t}`, "resizable,scrollbars"), c = setInterval(() => {
      u ? u.closed && (clearInterval(c), n(!0)) : (Ml.error("unable to access loginUrl window"), clearInterval(c));
    }, 1e3);
  }, []);
  return /* @__PURE__ */ l.createElement(Tr, null, /* @__PURE__ */ l.createElement(at, null, r ? /* @__PURE__ */ l.createElement(_e, null, /* @__PURE__ */ l.
  createElement(Xo, null, "Authentication on ", /* @__PURE__ */ l.createElement("strong", null, e), " concluded. Refresh the page to fetch t\
his Storybook."), /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(we, { small: !0, gray: !0, onClick: i }, /* @__PURE__ */ l.
  createElement(tr, null), "Refresh now"))) : /* @__PURE__ */ l.createElement(_e, null, /* @__PURE__ */ l.createElement(Xo, null, "Sign in t\
o browse this Storybook."), /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(we, { small: !0, gray: !0, onClick: o },
  /* @__PURE__ */ l.createElement(gn, null), "Sign in")))));
}, "AuthBlock"), Hl = /* @__PURE__ */ a(({ error: e }) => /* @__PURE__ */ l.createElement(Tr, null, /* @__PURE__ */ l.createElement(at, null,
/* @__PURE__ */ l.createElement(Gh, null, "Oh no! Something went wrong loading this Storybook.", /* @__PURE__ */ l.createElement("br", null),
/* @__PURE__ */ l.createElement(
  ze,
  {
    tooltip: /* @__PURE__ */ l.createElement(Yh, null, /* @__PURE__ */ l.createElement(Vs, { error: e }))
  },
  /* @__PURE__ */ l.createElement(De, { isButton: !0 }, "View error ", /* @__PURE__ */ l.createElement(Jt, null))
), " ", /* @__PURE__ */ l.createElement(De, { withArrow: !0, href: "https://storybook.js.org/docs", cancel: !1, target: "_blank" }, "View do\
cs")))), "ErrorBlock"), Qh = x(at)({
  display: "flex"
}), Xh = x(at)({
  flex: 1
}), Bl = /* @__PURE__ */ a(({ isMain: e }) => /* @__PURE__ */ l.createElement(Tr, null, /* @__PURE__ */ l.createElement(Qh, { col: 1 }, /* @__PURE__ */ l.
createElement(Xh, null, /* @__PURE__ */ l.createElement(Xo, null, e ? /* @__PURE__ */ l.createElement(l.Fragment, null, "Oh no! Your Storybo\
ok is empty. Possible reasons why:", /* @__PURE__ */ l.createElement("ul", null, /* @__PURE__ */ l.createElement("li", null, "The glob speci\
fied in ", /* @__PURE__ */ l.createElement("code", null, "main.js"), " isn't correct."), /* @__PURE__ */ l.createElement("li", null, "No sto\
ries are defined in your story files."), /* @__PURE__ */ l.createElement("li", null, "You're using filter-functions, and all stories are fil\
tered away.")), " ") : /* @__PURE__ */ l.createElement(l.Fragment, null, "This composed storybook is empty, maybe you're using filter-functi\
ons, and all stories are filtered away."))))), "EmptyBlock"), Rl = /* @__PURE__ */ a(({ isMain: e }) => /* @__PURE__ */ l.createElement(Tr, null,
/* @__PURE__ */ l.createElement(Ll, { size: e ? 17 : 5 })), "LoaderBlock");

// src/manager/components/sidebar/RefIndicator.tsx
var { document: Zh, window: Jh } = ae, eg = x.aside(({ theme: e }) => ({
  height: 16,
  display: "flex",
  alignItems: "center",
  "& > * + *": {
    marginLeft: e.layoutMargin
  }
})), tg = x.button(({ theme: e }) => ({
  height: 20,
  width: 20,
  padding: 0,
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  outline: "none",
  border: "1px solid transparent",
  borderRadius: "100%",
  cursor: "pointer",
  color: e.base === "light" ? ge(0.3, e.color.defaultText) : ge(0.6, e.color.defaultText),
  "&:hover": {
    color: e.barSelectedColor
  },
  "&:focus": {
    color: e.barSelectedColor,
    borderColor: e.color.secondary
  },
  svg: {
    height: 10,
    width: 10,
    transition: "all 150ms ease-out",
    color: "inherit"
  }
})), rr = x.span(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold
})), nr = x.a(({ theme: e }) => ({
  textDecoration: "none",
  lineHeight: "16px",
  padding: 15,
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  color: e.color.defaultText,
  "&:not(:last-child)": {
    borderBottom: `1px solid ${e.appBorderColor}`
  },
  "&:hover": {
    background: e.background.hoverable,
    color: e.color.darker
  },
  "&:link": {
    color: e.color.darker
  },
  "&:active": {
    color: e.color.darker
  },
  "&:focus": {
    color: e.color.darker
  },
  "& > *": {
    flex: 1
  },
  "& > svg": {
    marginTop: 3,
    width: 16,
    height: 16,
    marginRight: 10,
    flex: "unset"
  }
})), rg = x.div({
  width: 280,
  boxSizing: "border-box",
  borderRadius: 8,
  overflow: "hidden"
}), ng = x.div(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  fontSize: e.typography.size.s1,
  fontWeight: e.typography.weight.regular,
  color: e.base === "light" ? ge(0.3, e.color.defaultText) : ge(0.6, e.color.defaultText),
  "& > * + *": {
    marginLeft: 4
  },
  svg: {
    height: 10,
    width: 10
  }
})), og = /* @__PURE__ */ a(({ url: e, versions: t }) => {
  let r = j(() => {
    let n = Object.entries(t).find(([i, o]) => o === e);
    return n && n[0] ? n[0] : "current";
  }, [e, t]);
  return /* @__PURE__ */ l.createElement(ng, null, /* @__PURE__ */ l.createElement("span", null, r), /* @__PURE__ */ l.createElement(Jt, null));
}, "CurrentVersion"), zl = l.memo(
  ls(
    ({ state: e, ...t }, r) => {
      let n = me(), i = j(() => Object.values(t.index || {}), [t.index]), o = j(
        () => i.filter((u) => u.type === "component").length,
        [i]
      ), s = j(
        () => i.filter((u) => u.type === "docs" || u.type === "story").length,
        [i]
      );
      return /* @__PURE__ */ l.createElement(eg, { ref: r }, /* @__PURE__ */ l.createElement(
        ze,
        {
          placement: "bottom-start",
          trigger: "click",
          closeOnOutsideClick: !0,
          tooltip: /* @__PURE__ */ l.createElement(rg, null, /* @__PURE__ */ l.createElement(at, { row: 0 }, e === "loading" && /* @__PURE__ */ l.
          createElement(ug, { url: t.url }), (e === "error" || e === "empty") && /* @__PURE__ */ l.createElement(lg, { url: t.url }), e === "\
ready" && /* @__PURE__ */ l.createElement(ig, { url: t.url, componentCount: o, leafCount: s }), e === "auth" && /* @__PURE__ */ l.createElement(
          ag, { ...t }), t.type === "auto-inject" && e !== "error" && /* @__PURE__ */ l.createElement(cg, null), e !== "loading" && /* @__PURE__ */ l.
          createElement(sg, null)))
        },
        /* @__PURE__ */ l.createElement(tg, { "data-action": "toggle-indicator", "aria-label": "toggle indicator" }, /* @__PURE__ */ l.createElement(
        Qo, null))
      ), t.versions && Object.keys(t.versions).length ? /* @__PURE__ */ l.createElement(
        ze,
        {
          placement: "bottom-start",
          trigger: "click",
          closeOnOutsideClick: !0,
          tooltip: (u) => /* @__PURE__ */ l.createElement(
            Gt,
            {
              links: Object.entries(t.versions).map(([c, p]) => ({
                icon: p === t.url ? "check" : void 0,
                id: c,
                title: c,
                href: p,
                onClick: /* @__PURE__ */ a((d, h) => {
                  d.preventDefault(), n.changeRefVersion(t.id, h.href), u.onHide();
                }, "onClick")
              }))
            }
          )
        },
        /* @__PURE__ */ l.createElement(og, { url: t.url, versions: t.versions })
      ) : null);
    }
  )
), ig = /* @__PURE__ */ a(({ url: e, componentCount: t, leafCount: r }) => {
  let n = Re();
  return /* @__PURE__ */ l.createElement(nr, { href: e.replace(/\/?$/, "/index.html"), target: "_blank" }, /* @__PURE__ */ l.createElement(Qo,
  { color: n.color.secondary }), /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(rr, null, "View external Story\
book"), /* @__PURE__ */ l.createElement("div", null, "Explore ", t, " components and ", r, " stories in a new browser tab.")));
}, "ReadyMessage"), ag = /* @__PURE__ */ a(({ loginUrl: e, id: t }) => {
  let r = Re(), n = A((i) => {
    i.preventDefault();
    let o = Jh.open(e, `storybook_auth_${t}`, "resizable,scrollbars"), s = setInterval(() => {
      o ? o.closed && (clearInterval(s), Zh.location.reload()) : clearInterval(s);
    }, 1e3);
  }, []);
  return /* @__PURE__ */ l.createElement(nr, { onClick: n }, /* @__PURE__ */ l.createElement(gn, { color: r.color.gold }), /* @__PURE__ */ l.
  createElement("div", null, /* @__PURE__ */ l.createElement(rr, null, "Log in required"), /* @__PURE__ */ l.createElement("div", null, "You\
 need to authenticate to view this Storybook's components.")));
}, "LoginRequiredMessage"), sg = /* @__PURE__ */ a(() => {
  let e = Re();
  return /* @__PURE__ */ l.createElement(
    nr,
    {
      href: "https://storybook.js.org/docs/react/sharing/storybook-composition",
      target: "_blank"
    },
    /* @__PURE__ */ l.createElement(er, { color: e.color.green }),
    /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(rr, null, "Read Composition docs"), /* @__PURE__ */ l.createElement(
    "div", null, "Learn how to combine multiple Storybooks into one."))
  );
}, "ReadDocsMessage"), lg = /* @__PURE__ */ a(({ url: e }) => {
  let t = Re();
  return /* @__PURE__ */ l.createElement(nr, { href: e.replace(/\/?$/, "/index.html"), target: "_blank" }, /* @__PURE__ */ l.createElement(dn,
  { color: t.color.negative }), /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(rr, null, "Something went wrong"),
  /* @__PURE__ */ l.createElement("div", null, "This external Storybook didn't load. Debug it in a new tab now.")));
}, "ErrorOccurredMessage"), ug = /* @__PURE__ */ a(({ url: e }) => {
  let t = Re();
  return /* @__PURE__ */ l.createElement(nr, { href: e.replace(/\/?$/, "/index.html"), target: "_blank" }, /* @__PURE__ */ l.createElement(Il,
  { color: t.color.secondary }), /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(rr, null, "Please wait"), /* @__PURE__ */ l.
  createElement("div", null, "This Storybook is loading.")));
}, "LoadingMessage"), cg = /* @__PURE__ */ a(() => {
  let e = Re();
  return /* @__PURE__ */ l.createElement(
    nr,
    {
      href: "https://storybook.js.org/docs/react/sharing/storybook-composition#improve-your-storybook-composition",
      target: "_blank"
    },
    /* @__PURE__ */ l.createElement(gl, { color: e.color.gold }),
    /* @__PURE__ */ l.createElement("div", null, /* @__PURE__ */ l.createElement(rr, null, "Reduce lag"), /* @__PURE__ */ l.createElement("d\
iv", null, "Learn how to speed up Composition performance."))
  );
}, "PerformanceDegradedMessage");

// src/manager/components/sidebar/IconSymbols.tsx
var pg = x.svg`
  position: absolute;
  width: 0;
  height: 0;
  display: inline-block;
  shape-rendering: inherit;
  vertical-align: middle;
`, $l = "icon--group", Wl = "icon--component", Kl = "icon--document", Vl = "icon--story", jl = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(
pg, { "data-chromatic": "ignore" }, /* @__PURE__ */ l.createElement("symbol", { id: $l }, /* @__PURE__ */ l.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.586 3.504l-1.5-1.5H1v9h12v-7.5H6.586zm.414-1L5.793 1.297a1 1 0 00-.707-.293H.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v\
-8.5a.5.5 0 00-.5-.5H7z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ l.createElement("symbol", { id: Wl }, /* @__PURE__ */ l.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3.5 1.004a2.5 2.5 0 00-2.5 2.5v7a2.5 2.5 0 002.5 2.5h7a2.5 2.5 0 002.5-2.5v-7a2.5 2.5 0 00-2.5-2.5h-7zm8.5 5.5H7.5v-4.5h3a1.5 1.5 0\
 011.5 1.5v3zm0 1v3a1.5 1.5 0 01-1.5 1.5h-3v-4.5H12zm-5.5 4.5v-4.5H2v3a1.5 1.5 0 001.5 1.5h3zM2 6.504h4.5v-4.5h-3a1.5 1.5 0 00-1.5 1.5v3z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ l.createElement("symbol", { id: Kl }, /* @__PURE__ */ l.createElement(
  "path",
  {
    d: "M4 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zM4.5 7.5a.5.5 0 000 1h5a.5.5 0 000-1h-5zM4 10.5a.5.5 0 01.5-.5h5a.5.5 0 010 \
1h-5a.5.5 0 01-.5-.5z",
    fill: "currentColor"
  }
), /* @__PURE__ */ l.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M1.5 0a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V3.207a.5.5 0 00-.146-.353L10.146.146A.5.5 0 009.793 0H1.5zM2 1h7.5v2a.5.5 0\
 00.5.5h2V13H2V1z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ l.createElement("symbol", { id: Vl }, /* @__PURE__ */ l.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3.5 0h7a.5.5 0 01.5.5v13a.5.5 0 01-.454.498.462.462 0 01-.371-.118L7 11.159l-3.175 2.72a.46.46 0 01-.379.118A.5.5 0 013 13.5V.5a.5.\
5 0 01.5-.5zM4 12.413l2.664-2.284a.454.454 0 01.377-.128.498.498 0 01.284.12L10 12.412V1H4v11.413z",
    fill: "currentColor"
  }
))), "IconSymbols"), lt = /* @__PURE__ */ a(({ type: e }) => e === "group" ? /* @__PURE__ */ l.createElement("use", { xlinkHref: `#${$l}` }) :
e === "component" ? /* @__PURE__ */ l.createElement("use", { xlinkHref: `#${Wl}` }) : e === "document" ? /* @__PURE__ */ l.createElement("us\
e", { xlinkHref: `#${Kl}` }) : e === "story" ? /* @__PURE__ */ l.createElement("use", { xlinkHref: `#${Vl}` }) : null, "UseSymbol");

// src/manager/components/sidebar/components/CollapseIcon.tsx
var dg = x.div(({ theme: e, isExpanded: t }) => ({
  width: 8,
  height: 8,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: ge(0.4, e.textMutedColor),
  transform: t ? "rotateZ(90deg)" : "none",
  transition: "transform .1s ease-out"
})), Tt = /* @__PURE__ */ a(({ isExpanded: e }) => /* @__PURE__ */ l.createElement(dg, { isExpanded: e }, /* @__PURE__ */ l.createElement("s\
vg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "8", fill: "none" }, /* @__PURE__ */ l.createElement(
  "path",
  {
    fill: "#73828C",
    fillRule: "evenodd",
    d: "M1.896 7.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 1 0-.708.708L5.043 4 1.896 7.146Z",
    clipRule: "evenodd"
  }
))), "CollapseIcon");

// src/manager/components/sidebar/TreeNode.tsx
var mt = x.svg(
  ({ theme: e, type: t }) => ({
    width: 14,
    height: 14,
    flex: "0 0 auto",
    color: t === "group" ? e.base === "dark" ? e.color.primary : e.color.ultraviolet : t === "component" ? e.color.secondary : t === "docume\
nt" ? e.base === "dark" ? e.color.gold : "#ff8300" : t === "story" ? e.color.seafoam : "currentColor"
  })
), Ul = x.button(({ theme: e, depth: t = 0, isExpandable: r = !1 }) => ({
  width: "100%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "start",
  textAlign: "left",
  paddingLeft: `${(r ? 8 : 22) + t * 18}px`,
  color: "inherit",
  fontSize: `${e.typography.size.s2}px`,
  background: "transparent",
  minHeight: 28,
  borderRadius: 4,
  gap: 6,
  paddingTop: 5,
  paddingBottom: 4,
  "&:hover, &:focus": {
    background: ge(0.93, e.color.secondary),
    outline: "none"
  }
})), ql = x.a(({ theme: e, depth: t = 0 }) => ({
  cursor: "pointer",
  color: "inherit",
  display: "flex",
  gap: 6,
  flex: 1,
  alignItems: "start",
  paddingLeft: `${22 + t * 18}px`,
  paddingTop: 5,
  paddingBottom: 4,
  fontSize: `${e.typography.size.s2}px`,
  textDecoration: "none",
  overflowWrap: "break-word",
  wordWrap: "break-word",
  wordBreak: "break-word"
})), Gl = x.div(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 16,
  marginBottom: 4,
  fontSize: `${e.typography.size.s1 - 1}px`,
  fontWeight: e.typography.weight.bold,
  lineHeight: "16px",
  minHeight: 28,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: e.textMutedColor
})), In = x.div({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 2
}), Yl = l.memo(/* @__PURE__ */ a(function({
  children: t,
  isExpanded: r = !1,
  isExpandable: n = !1,
  ...i
}) {
  return /* @__PURE__ */ l.createElement(Ul, { isExpandable: n, tabIndex: -1, ...i }, /* @__PURE__ */ l.createElement(In, null, n && /* @__PURE__ */ l.
  createElement(Tt, { isExpanded: r }), /* @__PURE__ */ l.createElement(mt, { viewBox: "0 0 14 14", width: "14", height: "14", type: "group" },
  /* @__PURE__ */ l.createElement(lt, { type: "group" }))), t);
}, "GroupNode")), Ql = l.memo(
  /* @__PURE__ */ a(function({ theme: t, children: r, isExpanded: n, isExpandable: i, isSelected: o, ...s }) {
    return /* @__PURE__ */ l.createElement(Ul, { isExpandable: i, tabIndex: -1, ...s }, /* @__PURE__ */ l.createElement(In, null, i && /* @__PURE__ */ l.
    createElement(Tt, { isExpanded: n }), /* @__PURE__ */ l.createElement(mt, { viewBox: "0 0 14 14", width: "12", height: "12", type: "comp\
onent" }, /* @__PURE__ */ l.createElement(lt, { type: "component" }))), r);
  }, "ComponentNode")
), Xl = l.memo(
  /* @__PURE__ */ a(function({ theme: t, children: r, docsMode: n, ...i }) {
    return /* @__PURE__ */ l.createElement(ql, { tabIndex: -1, ...i }, /* @__PURE__ */ l.createElement(In, null, /* @__PURE__ */ l.createElement(
    mt, { viewBox: "0 0 14 14", width: "12", height: "12", type: "document" }, /* @__PURE__ */ l.createElement(lt, { type: "document" }))), r);
  }, "DocumentNode")
), Zl = l.memo(/* @__PURE__ */ a(function({
  theme: t,
  children: r,
  ...n
}) {
  return /* @__PURE__ */ l.createElement(ql, { tabIndex: -1, ...n }, /* @__PURE__ */ l.createElement(In, null, /* @__PURE__ */ l.createElement(
  mt, { viewBox: "0 0 14 14", width: "12", height: "12", type: "story" }, /* @__PURE__ */ l.createElement(lt, { type: "story" }))), r);
}, "StoryNode"));

// src/manager/components/sidebar/useExpanded.ts
var Wu = Fe(Au(), 1);

// src/manager/keybinding.ts
var iy = {
  // event.code => event.key
  Space: " ",
  Slash: "/",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowUp",
  ArrowRight: "ArrowRight",
  ArrowDown: "ArrowDown",
  Escape: "Escape",
  Enter: "Enter"
}, ay = { alt: !1, ctrl: !1, meta: !1, shift: !1 }, ht = /* @__PURE__ */ a((e, t) => {
  let { alt: r, ctrl: n, meta: i, shift: o } = e === !1 ? ay : e;
  return !(typeof r == "boolean" && r !== t.altKey || typeof n == "boolean" && n !== t.ctrlKey || typeof i == "boolean" && i !== t.metaKey ||
  typeof o == "boolean" && o !== t.shiftKey);
}, "matchesModifiers"), Ve = /* @__PURE__ */ a((e, t) => t.code ? t.code === e : t.key === iy[e], "matchesKeyCode");

// src/manager/utils/tree.ts
var or = Fe(xn(), 1);
var { document: Nu, window: sy } = ae, wn = /* @__PURE__ */ a((e, t) => !t || t === rt ? e : `${t}_${e}`, "createId"), Fu = /* @__PURE__ */ a(
(e, t) => `${Nu.location.pathname}?path=/${e.type}/${wn(e.id, t)}`, "getLink");
var Du = (0, or.default)(1e3)((e, t) => t[e]), ly = (0, or.default)(1e3)((e, t) => {
  let r = Du(e, t);
  return r && r.type !== "root" ? Du(r.parent, t) : void 0;
}), Hu = (0, or.default)(1e3)((e, t) => {
  let r = ly(e, t);
  return r ? [r, ...Hu(r.id, t)] : [];
}), kr = (0, or.default)(1e3)(
  (e, t) => Hu(t, e).map((r) => r.id)
), gt = (0, or.default)(1e3)((e, t, r) => {
  let n = e[t];
  return (n.type === "story" || n.type === "docs" ? [] : n.children).reduce((o, s) => {
    let u = e[s];
    return !u || r && (u.type === "story" || u.type === "docs") || o.push(s, ...gt(e, s, r)), o;
  }, []);
});
function Bu(e, t) {
  let r = e.type !== "root" && e.parent ? t.index[e.parent] : null;
  return r ? [...Bu(r, t), r.name] : t.id === rt ? [] : [t.title || t.id];
}
a(Bu, "getPath");
var ni = /* @__PURE__ */ a((e, t) => ({ ...e, refId: t.id, path: Bu(e, t) }), "searchItem");
function Ru(e, t, r) {
  let n = t + r % e.length;
  return n < 0 && (n = e.length + n), n >= e.length && (n -= e.length), n;
}
a(Ru, "cycle");
var _t = /* @__PURE__ */ a((e, t = !1) => {
  if (!e) return;
  let { top: r, bottom: n } = e.getBoundingClientRect();
  r >= 0 && n <= (sy.innerHeight || Nu.documentElement.clientHeight) || e.scrollIntoView({ block: t ? "center" : "nearest" });
}, "scrollIntoView"), zu = /* @__PURE__ */ a((e, t, r, n) => {
  switch (!0) {
    case t:
      return "auth";
    case r:
      return "error";
    case e:
      return "loading";
    case n:
      return "empty";
    default:
      return "ready";
  }
}, "getStateType"), kt = /* @__PURE__ */ a((e, t) => !e || !t ? !1 : e === t ? !0 : kt(e.parentElement || void 0, t), "isAncestor"), Lu = /* @__PURE__ */ a(
(e) => e.replaceAll(/(\s|-|_)/gi, ""), "removeNoiseFromName"), $u = /* @__PURE__ */ a((e, t) => Lu(e) === Lu(t), "isStoryHoistable");

// src/manager/components/sidebar/useExpanded.ts
var { document: oi } = ae, uy = /* @__PURE__ */ a(({
  refId: e,
  data: t,
  initialExpanded: r,
  highlightedRef: n,
  rootIds: i
}) => {
  let o = n.current?.refId === e ? kr(t, n.current?.itemId) : [];
  return [...i, ...o].reduce(
    // @ts-expect-error (non strict)
    (s, u) => Object.assign(s, { [u]: u in r ? r[u] : !0 }),
    {}
  );
}, "initializeExpanded"), cy = /* @__PURE__ */ a(() => {
}, "noop"), Ku = /* @__PURE__ */ a(({
  containerRef: e,
  isBrowsing: t,
  refId: r,
  data: n,
  initialExpanded: i,
  rootIds: o,
  highlightedRef: s,
  setHighlightedItemId: u,
  selectedStoryId: c,
  onSelectStoryId: p
}) => {
  let d = me(), [h, f] = Kt(
    (g, { ids: y, value: I }) => y.reduce((E, T) => Object.assign(E, { [T]: I }), { ...g }),
    // @ts-expect-error (non strict)
    { refId: r, data: n, highlightedRef: s, rootIds: o, initialExpanded: i },
    uy
  ), b = A(
    (g) => e.current?.querySelector(`[data-item-id="${g}"]`),
    [e]
  ), m = A(
    (g) => {
      u(g.getAttribute("data-item-id")), _t(g);
    },
    [u]
  ), v = A(
    ({ ids: g, value: y }) => {
      if (f({ ids: g, value: y }), g.length === 1) {
        let I = e.current?.querySelector(
          `[data-item-id="${g[0]}"][data-ref-id="${r}"]`
        );
        I && m(I);
      }
    },
    [e, m, r]
  );
  V(() => {
    f({ ids: kr(n, c), value: !0 });
  }, [n, c]);
  let S = A(() => {
    let g = Object.keys(n).filter((y) => !o.includes(y));
    f({ ids: g, value: !1 });
  }, [n, o]), C = A(() => {
    f({ ids: Object.keys(n), value: !0 });
  }, [n]);
  return V(() => d ? (d.on(Po, S), d.on(Ao, C), () => {
    d.off(Po, S), d.off(Ao, C);
  }) : cy, [d, S, C]), V(() => {
    let g = oi.getElementById("storybook-explorer-menu"), y = (0, Wu.default)((I) => {
      let E = s.current?.refId === r && s.current?.itemId;
      if (!t || !e.current || !E || I.repeat || !ht(!1, I)) return;
      let T = Ve("Enter", I), _ = Ve("Space", I), k = Ve("ArrowLeft", I), w = Ve("ArrowRight", I);
      if (!(T || _ || k || w)) return;
      let O = b(E);
      if (!O || O.getAttribute("data-ref-id") !== r) return;
      let P = I.target;
      if (!kt(g, P) && !kt(P, g)) return;
      if (P.hasAttribute("data-action")) {
        if (T || _) return;
        P.blur();
      }
      let D = O.getAttribute("data-nodetype");
      (T || _) && ["component", "story", "document"].includes(D) && p(E);
      let L = O.getAttribute("aria-expanded");
      if (k) {
        if (L === "true") {
          f({ ids: [E], value: !1 });
          return;
        }
        let M = O.getAttribute("data-parent-id"), W = M && b(M);
        if (W && W.getAttribute("data-highlightable") === "true") {
          m(W);
          return;
        }
        f({ ids: gt(n, E, !0), value: !1 });
        return;
      }
      w && (L === "false" ? v({ ids: [E], value: !0 }) : L === "true" && v({ ids: gt(n, E, !0), value: !0 }));
    }, 60);
    return oi.addEventListener("keydown", y), () => oi.removeEventListener("keydown", y);
  }, [
    e,
    t,
    r,
    n,
    s,
    u,
    p
  ]), [h, v];
}, "useExpanded");

// src/manager/utils/status.tsx
var En = x(ll)({
  // specificity hack
  "&&&": {
    width: 6,
    height: 6
  }
}), py = x(En)(({ theme: { animation: e, color: t, base: r } }) => ({
  // specificity hack
  animation: `${e.glow} 1.5s ease-in-out infinite`,
  color: r === "light" ? t.mediumdark : t.darker
})), dy = ["unknown", "pending", "success", "warn", "error"], ir = {
  unknown: [null, null],
  pending: [/* @__PURE__ */ l.createElement(py, { key: "icon" }), "currentColor"],
  success: [/* @__PURE__ */ l.createElement(En, { key: "icon", style: { color: "green" } }), "currentColor"],
  warn: [/* @__PURE__ */ l.createElement(En, { key: "icon", style: { color: "orange" } }), "#A15C20"],
  error: [/* @__PURE__ */ l.createElement(En, { key: "icon", style: { color: "red" } }), "brown"]
}, Or = /* @__PURE__ */ a((e) => dy.reduce(
  (t, r) => e.includes(r) ? r : t,
  "unknown"
), "getHighestStatus");
function Cn(e, t) {
  return Object.values(e).reduce((r, n) => {
    if (n.type === "group" || n.type === "component") {
      let i = gt(e, n.id, !1).map((s) => e[s]).filter((s) => s.type === "story"), o = Or(
        // @ts-expect-error (non strict)
        i.flatMap((s) => Object.values(t?.[s.id] || {})).map((s) => s.status)
      );
      o && (r[n.id] = o);
    }
    return r;
  }, {});
}
a(Cn, "getGroupStatus");

// src/manager/components/sidebar/Tree.tsx
var fy = x.div((e) => ({
  marginTop: e.hasOrphans ? 20 : 0,
  marginBottom: 20
})), my = x.button(
  ({ theme: e, height: t, width: r }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: r || 20,
    height: t || 20,
    boxSizing: "border-box",
    margin: 0,
    marginLeft: "auto",
    padding: 0,
    outline: 0,
    lineHeight: "normal",
    background: "none",
    border: "1px solid transparent",
    borderRadius: "100%",
    cursor: "pointer",
    transition: "all 150ms ease-out",
    color: e.base === "light" ? ge(0.3, e.color.defaultText) : ge(0.6, e.color.defaultText),
    "&:hover": {
      color: e.color.secondary
    },
    "&:focus": {
      color: e.color.secondary,
      borderColor: e.color.secondary,
      "&:not(:focus-visible)": {
        borderColor: "transparent"
      }
    },
    svg: {
      width: 10,
      height: 10
    }
  })
), hy = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  padding: "0px 8px",
  borderRadius: 4,
  transition: "color 150ms, box-shadow 150ms",
  gap: 6,
  alignItems: "center",
  cursor: "pointer",
  height: 28,
  "&:hover, &:focus": {
    outline: "none",
    background: ge(0.93, e.color.secondary)
  }
})), gy = x.div(({ theme: e }) => ({
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingRight: 20,
  color: e.color.defaultText,
  background: "transparent",
  minHeight: 28,
  borderRadius: 4,
  "&:hover, &:focus": {
    outline: "none",
    background: ge(0.93, e.color.secondary)
  },
  '&[data-selected="true"]': {
    color: e.color.lightest,
    background: e.color.secondary,
    fontWeight: e.typography.weight.bold,
    "&:hover, &:focus": {
      background: e.color.secondary
    },
    svg: { color: e.color.lightest }
  },
  a: { color: "currentColor" }
})), yy = x(we)(({ theme: e }) => ({
  display: "none",
  "@media (min-width: 600px)": {
    display: "block",
    fontSize: "10px",
    overflow: "hidden",
    width: 1,
    height: "20px",
    boxSizing: "border-box",
    opacity: 0,
    padding: 0,
    "&:focus": {
      opacity: 1,
      padding: "5px 10px",
      background: "white",
      color: e.color.secondary,
      width: "auto"
    }
  }
})), Vu = l.memo(/* @__PURE__ */ a(function({
  item: t,
  status: r,
  refId: n,
  docsMode: i,
  isOrphan: o,
  isDisplayed: s,
  isSelected: u,
  isFullyExpanded: c,
  color: p,
  setFullyExpanded: d,
  isExpanded: h,
  setExpanded: f,
  onSelectStoryId: b,
  api: m
}) {
  let { isDesktop: v, isMobile: S, setMobileMenuOpen: C } = Ee();
  if (!s)
    return null;
  let g = wn(t.id, n);
  if (t.type === "story" || t.type === "docs") {
    let y = t.type === "docs" ? Xl : Zl, I = Or(Object.values(r || {}).map((_) => _.status)), [E, T] = ir[I];
    return /* @__PURE__ */ l.createElement(
      gy,
      {
        "data-selected": u,
        "data-ref-id": n,
        "data-item-id": t.id,
        "data-parent-id": t.parent,
        "data-nodetype": t.type === "docs" ? "document" : "story",
        "data-highlightable": s,
        className: "sidebar-item"
      },
      /* @__PURE__ */ l.createElement(
        y,
        {
          style: u ? {} : { color: T },
          key: g,
          href: Fu(t, n),
          id: g,
          depth: o ? t.depth : t.depth - 1,
          onClick: (_) => {
            _.preventDefault(), b(t.id), S && C(!1);
          },
          ...t.type === "docs" && { docsMode: i }
        },
        t.renderLabel?.(t, m) || t.name
      ),
      u && /* @__PURE__ */ l.createElement(yy, { asChild: !0 }, /* @__PURE__ */ l.createElement("a", { href: "#storybook-preview-wrapper" },
      "Skip to canvas")),
      E ? /* @__PURE__ */ l.createElement(
        ze,
        {
          placement: "top",
          style: { display: "flex" },
          tooltip: () => /* @__PURE__ */ l.createElement(
            Gt,
            {
              links: Object.entries(r || {}).map(([_, k]) => ({
                id: _,
                title: k.title,
                description: k.description,
                right: ir[k.status][0]
              }))
            }
          ),
          closeOnOutsideClick: !0
        },
        /* @__PURE__ */ l.createElement(my, { type: "button", height: 22 }, E)
      ) : null
    );
  }
  if (t.type === "root")
    return /* @__PURE__ */ l.createElement(
      Gl,
      {
        key: g,
        id: g,
        className: "sidebar-subheading",
        "data-ref-id": n,
        "data-item-id": t.id,
        "data-nodetype": "root"
      },
      /* @__PURE__ */ l.createElement(
        hy,
        {
          type: "button",
          "data-action": "collapse-root",
          onClick: (y) => {
            y.preventDefault(), f({ ids: [t.id], value: !h });
          },
          "aria-expanded": h
        },
        /* @__PURE__ */ l.createElement(Tt, { isExpanded: h }),
        t.renderLabel?.(t, m) || t.name
      ),
      h && /* @__PURE__ */ l.createElement(
        ie,
        {
          className: "sidebar-subheading-action",
          "aria-label": c ? "Expand" : "Collapse",
          "data-action": "expand-all",
          "data-expanded": c,
          onClick: (y) => {
            y.preventDefault(), d();
          }
        },
        c ? /* @__PURE__ */ l.createElement(ul, null) : /* @__PURE__ */ l.createElement(cl, null)
      )
    );
  if (t.type === "component" || t.type === "group") {
    let y = t.type === "component" ? Ql : Yl;
    return /* @__PURE__ */ l.createElement(
      y,
      {
        key: g,
        id: g,
        style: p ? { color: p } : {},
        className: "sidebar-item",
        "data-ref-id": n,
        "data-item-id": t.id,
        "data-parent-id": t.parent,
        "data-nodetype": t.type === "component" ? "component" : "group",
        "data-highlightable": s,
        "aria-controls": t.children && t.children[0],
        "aria-expanded": h,
        depth: o ? t.depth : t.depth - 1,
        isComponent: t.type === "component",
        isExpandable: t.children && t.children.length > 0,
        isExpanded: h,
        onClick: (I) => {
          I.preventDefault(), f({ ids: [t.id], value: !h }), t.type === "component" && !h && v && b(t.id);
        },
        onMouseEnter: () => {
          t.type === "component" && m.emit(xt, {
            ids: [t.children[0]],
            options: { target: n }
          });
        }
      },
      t.renderLabel?.(t, m) || t.name
    );
  }
  return null;
}, "Node")), vy = l.memo(/* @__PURE__ */ a(function({
  setExpanded: t,
  isFullyExpanded: r,
  expandableDescendants: n,
  ...i
}) {
  let o = A(
    () => t({ ids: n, value: !r }),
    [t, r, n]
  );
  return /* @__PURE__ */ l.createElement(
    Vu,
    {
      ...i,
      setExpanded: t,
      isFullyExpanded: r,
      setFullyExpanded: o
    }
  );
}, "Root")), ju = l.memo(/* @__PURE__ */ a(function({
  isBrowsing: t,
  isMain: r,
  refId: n,
  data: i,
  status: o,
  docsMode: s,
  highlightedRef: u,
  setHighlightedItemId: c,
  selectedStoryId: p,
  onSelectStoryId: d
}) {
  let h = X(null), f = me(), [b, m, v] = j(
    () => Object.keys(i).reduce(
      (w, O) => {
        let P = i[O];
        return P.type === "root" ? w[0].push(O) : P.parent || w[1].push(O), P.type === "root" && P.startCollapsed && (w[2][O] = !1), w;
      },
      [[], [], {}]
    ),
    [i]
  ), { expandableDescendants: S } = j(() => [...m, ...b].reduce(
    (w, O) => (w.expandableDescendants[O] = gt(i, O, !1).filter(
      (P) => !["story", "docs"].includes(i[P].type)
    ), w),
    { orphansFirst: [], expandableDescendants: {} }
  ), [i, b, m]), C = j(() => Object.keys(i).filter((w) => {
    let O = i[w];
    if (O.type !== "component") return !1;
    let { children: P = [], name: D } = O;
    if (P.length !== 1) return !1;
    let L = i[P[0]];
    return L.type === "docs" ? !0 : L.type === "story" ? $u(L.name, D) : !1;
  }), [i]), g = j(
    () => Object.keys(i).filter((w) => !C.includes(w)),
    [C]
  ), y = j(() => C.reduce(
    (w, O) => {
      let { children: P, parent: D, name: L } = i[O], [M] = P;
      if (D) {
        let W = [...i[D].children];
        W[W.indexOf(O)] = M, w[D] = { ...i[D], children: W };
      }
      return w[M] = {
        ...i[M],
        name: L,
        parent: D,
        depth: i[M].depth - 1
      }, w;
    },
    { ...i }
  ), [i]), I = j(() => g.reduce(
    (w, O) => Object.assign(w, { [O]: kr(y, O) }),
    {}
  ), [g, y]), [E, T] = Ku({
    // @ts-expect-error (non strict)
    containerRef: h,
    isBrowsing: t,
    refId: n,
    data: y,
    initialExpanded: v,
    rootIds: b,
    highlightedRef: u,
    setHighlightedItemId: c,
    selectedStoryId: p,
    onSelectStoryId: d
  }), _ = j(() => Cn(y, o), [y, o]), k = j(() => g.map((w) => {
    let O = y[w], P = wn(w, n);
    if (O.type === "root") {
      let M = S[O.id], W = M.every((Z) => E[Z]);
      return (
        // @ts-expect-error (TODO)
        /* @__PURE__ */ l.createElement(
          vy,
          {
            key: P,
            item: O,
            refId: n,
            isOrphan: !1,
            isDisplayed: !0,
            isSelected: p === w,
            isExpanded: !!E[w],
            setExpanded: T,
            isFullyExpanded: W,
            expandableDescendants: M,
            onSelectStoryId: d
          }
        )
      );
    }
    let D = !O.parent || I[w].every((M) => E[M]), L = _[w] ? ir[_[w]][1] : null;
    return /* @__PURE__ */ l.createElement(
      Vu,
      {
        api: f,
        key: P,
        item: O,
        status: o?.[w],
        refId: n,
        color: L,
        docsMode: s,
        isOrphan: m.some((M) => w === M || w.startsWith(`${M}-`)),
        isDisplayed: D,
        isSelected: p === w,
        isExpanded: !!E[w],
        setExpanded: T,
        onSelectStoryId: d
      }
    );
  }), [
    I,
    f,
    y,
    g,
    s,
    S,
    E,
    _,
    d,
    m,
    n,
    p,
    T,
    o
  ]);
  return /* @__PURE__ */ l.createElement(fy, { ref: h, hasOrphans: r && m.length > 0 }, /* @__PURE__ */ l.createElement(jl, null), k);
}, "Tree"));

// src/manager/components/sidebar/Refs.tsx
var by = x.div(({ isMain: e }) => ({
  position: "relative",
  marginTop: e ? void 0 : 0
})), Iy = x.div(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold,
  fontSize: e.typography.size.s2,
  // Similar to ListItem.tsx
  textDecoration: "none",
  lineHeight: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "transparent",
  width: "100%",
  marginTop: 20,
  paddingTop: 16,
  paddingBottom: 12,
  borderTop: `1px solid ${e.appBorderColor}`,
  color: e.base === "light" ? e.color.defaultText : ge(0.2, e.color.defaultText)
})), Sy = x.div({
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
  overflow: "hidden",
  marginLeft: 2
}), xy = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  padding: "0px 8px",
  gap: 6,
  alignItems: "center",
  cursor: "pointer",
  overflow: "hidden",
  "&:focus": {
    borderColor: e.color.secondary,
    "span:first-of-type": {
      borderLeftColor: e.color.secondary
    }
  }
})), Uu = l.memo(
  /* @__PURE__ */ a(function(t) {
    let { docsOptions: r } = et(), n = me(), {
      index: i,
      id: o,
      title: s = o,
      isLoading: u,
      isBrowsing: c,
      selectedStoryId: p,
      highlightedRef: d,
      setHighlighted: h,
      loginUrl: f,
      type: b,
      expanded: m = !0,
      indexError: v,
      previewInitialized: S
    } = t, C = j(() => i ? Object.keys(i).length : 0, [i]), g = X(null), y = o === rt, E = u || (b === "auto-inject" && !S || b === "server-\
checked") || b === "unknown", w = zu(E, !!f && C === 0, !!v, !E && C === 0), [O, P] = J(m);
    V(() => {
      i && p && i[p] && P(!0);
    }, [P, i, p]);
    let D = A(() => P((W) => !W), [P]), L = A(
      (W) => h({ itemId: W, refId: o }),
      [h]
    ), M = A(
      // @ts-expect-error (non strict)
      (W) => n && n.selectStory(W, void 0, { ref: !y && o }),
      [n, y, o]
    );
    return /* @__PURE__ */ l.createElement(l.Fragment, null, y || /* @__PURE__ */ l.createElement(
      Iy,
      {
        "aria-label": `${O ? "Hide" : "Show"} ${s} stories`,
        "aria-expanded": O
      },
      /* @__PURE__ */ l.createElement(xy, { "data-action": "collapse-ref", onClick: D }, /* @__PURE__ */ l.createElement(Tt, { isExpanded: O }),
      /* @__PURE__ */ l.createElement(Sy, { title: s }, s)),
      /* @__PURE__ */ l.createElement(zl, { ...t, state: w, ref: g })
    ), O && /* @__PURE__ */ l.createElement(by, { "data-title": s, isMain: y }, w === "auth" && /* @__PURE__ */ l.createElement(Fl, { id: o,
    loginUrl: f }), w === "error" && /* @__PURE__ */ l.createElement(Hl, { error: v }), w === "loading" && /* @__PURE__ */ l.createElement(Rl,
    { isMain: y }), w === "empty" && /* @__PURE__ */ l.createElement(Bl, { isMain: y }), w === "ready" && /* @__PURE__ */ l.createElement(
      ju,
      {
        status: t.status,
        isBrowsing: c,
        isMain: y,
        refId: o,
        data: i,
        docsMode: r.docsMode,
        selectedStoryId: p,
        onSelectStoryId: M,
        highlightedRef: d,
        setHighlightedItemId: L
      }
    )));
  }, "Ref")
);

// src/manager/components/sidebar/useHighlighted.ts
var { document: ii, window: qu } = ae, Gu = /* @__PURE__ */ a((e) => e ? { itemId: e.storyId, refId: e.refId } : null, "fromSelection"), Yu = /* @__PURE__ */ a(
({
  containerRef: e,
  isLoading: t,
  isBrowsing: r,
  dataset: n,
  selected: i
}) => {
  let o = Gu(i), s = X(o), [u, c] = J(o), p = me(), d = A(
    (f) => {
      s.current = f, c(f);
    },
    [s]
  ), h = A(
    (f, b = !1) => {
      let m = f.getAttribute("data-item-id"), v = f.getAttribute("data-ref-id");
      !m || !v || (d({ itemId: m, refId: v }), _t(f, b));
    },
    [d]
  );
  return V(() => {
    let f = Gu(i);
    if (d(f), f) {
      let { itemId: b, refId: m } = f;
      setTimeout(() => {
        _t(
          // @ts-expect-error (non strict)
          e.current?.querySelector(`[data-item-id="${b}"][data-ref-id="${m}"]`),
          !0
          // make sure it's clearly visible by centering it
        );
      }, 0);
    }
  }, [n, s, e, i]), V(() => {
    let f = ii.getElementById("storybook-explorer-menu"), b, m = /* @__PURE__ */ a((v) => {
      if (t || !r || !e.current || !ht(!1, v)) return;
      let S = Ve("ArrowUp", v), C = Ve("ArrowDown", v);
      if (!(S || C)) return;
      let g = qu.requestAnimationFrame(() => {
        qu.cancelAnimationFrame(b), b = g;
        let y = v.target;
        if (!kt(f, y) && !kt(y, f)) return;
        y.hasAttribute("data-action") && y.blur();
        let I = Array.from(
          e.current.querySelectorAll("[data-highlightable=true]")
        ), E = I.findIndex(
          (k) => k.getAttribute("data-item-id") === s.current?.itemId && k.getAttribute("data-ref-id") === s.current?.refId
        ), T = Ru(I, E, S ? -1 : 1), _ = S ? T === I.length - 1 : T === 0;
        if (h(I[T], _), I[T].getAttribute("data-nodetype") === "component") {
          let { itemId: k, refId: w } = s.current, O = p.resolveStory(k, w === "storybook_internal" ? void 0 : w);
          O.type === "component" && p.emit(xt, {
            // @ts-expect-error (non strict)
            ids: [O.children[0]],
            options: { target: w }
          });
        }
      });
    }, "navigateTree");
    return ii.addEventListener("keydown", m), () => ii.removeEventListener("keydown", m);
  }, [t, r, s, h]), [u, d, s];
}, "useHighlighted");

// src/manager/components/sidebar/HighlightStyles.tsx
var Qu = /* @__PURE__ */ a(({ refId: e, itemId: t }) => /* @__PURE__ */ l.createElement(
  Vt,
  {
    styles: ({ color: r }) => {
      let n = ge(0.85, r.secondary);
      return {
        [`[data-ref-id="${e}"][data-item-id="${t}"]:not([data-selected="true"])`]: {
          '&[data-nodetype="component"], &[data-nodetype="group"]': {
            background: n,
            "&:hover, &:focus": { background: n }
          },
          '&[data-nodetype="story"], &[data-nodetype="document"]': {
            color: r.defaultText,
            background: n,
            "&:hover, &:focus": { background: n }
          }
        }
      };
    }
  }
), "HighlightStyles");

// src/manager/components/sidebar/Explorer.tsx
var Xu = l.memo(/* @__PURE__ */ a(function({
  isLoading: t,
  isBrowsing: r,
  dataset: n,
  selected: i
}) {
  let o = X(null), [s, u, c] = Yu({
    // @ts-expect-error (non strict)
    containerRef: o,
    isLoading: t,
    isBrowsing: r,
    dataset: n,
    selected: i
  });
  return /* @__PURE__ */ l.createElement(
    "div",
    {
      ref: o,
      id: "storybook-explorer-tree",
      "data-highlighted-ref-id": s?.refId,
      "data-highlighted-item-id": s?.itemId
    },
    s && /* @__PURE__ */ l.createElement(Qu, { ...s }),
    n.entries.map(([p, d]) => /* @__PURE__ */ l.createElement(
      Uu,
      {
        ...d,
        key: p,
        isLoading: t,
        isBrowsing: r,
        selectedStoryId: i?.refId === d.id ? i.storyId : null,
        highlightedRef: c,
        setHighlighted: u
      }
    ))
  );
}, "Explorer"));

// ../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
function Oe(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e) if ({}.hasOwnProperty.call(e, n)) {
    if (t.indexOf(n) >= 0) continue;
    r[n] = e[n];
  }
  return r;
}
a(Oe, "_objectWithoutPropertiesLoose");

// ../node_modules/downshift/dist/downshift.esm.js
var q = Fe(Lo());
var Ty = Fe(tc());

// ../node_modules/compute-scroll-into-view/dist/index.js
var rc = /* @__PURE__ */ a((e) => typeof e == "object" && e != null && e.nodeType === 1, "t"), nc = /* @__PURE__ */ a((e, t) => (!t || e !==
"hidden") && e !== "visible" && e !== "clip", "e"), li = /* @__PURE__ */ a((e, t) => {
  if (e.clientHeight < e.scrollHeight || e.clientWidth < e.scrollWidth) {
    let r = getComputedStyle(e, null);
    return nc(r.overflowY, t) || nc(r.overflowX, t) || ((n) => {
      let i = ((o) => {
        if (!o.ownerDocument || !o.ownerDocument.defaultView) return null;
        try {
          return o.ownerDocument.defaultView.frameElement;
        } catch {
          return null;
        }
      })(n);
      return !!i && (i.clientHeight < n.scrollHeight || i.clientWidth < n.scrollWidth);
    })(e);
  }
  return !1;
}, "n"), Fn = /* @__PURE__ */ a((e, t, r, n, i, o, s, u) => o < e && s > t || o > e && s < t ? 0 : o <= e && u <= r || s >= t && u >= r ? o -
e - n : s > t && u < r || o < e && u > r ? s - t + i : 0, "o"), Cy = /* @__PURE__ */ a((e) => {
  let t = e.parentElement;
  return t ?? (e.getRootNode().host || null);
}, "l"), oc = /* @__PURE__ */ a((e, t) => {
  var r, n, i, o;
  if (typeof document > "u") return [];
  let { scrollMode: s, block: u, inline: c, boundary: p, skipOverflowHiddenElements: d } = t, h = typeof p == "function" ? p : (Z) => Z !== p;
  if (!rc(e)) throw new TypeError("Invalid target");
  let f = document.scrollingElement || document.documentElement, b = [], m = e;
  for (; rc(m) && h(m); ) {
    if (m = Cy(m), m === f) {
      b.push(m);
      break;
    }
    m != null && m === document.body && li(m) && !li(document.documentElement) || m != null && li(m, d) && b.push(m);
  }
  let v = (n = (r = window.visualViewport) == null ? void 0 : r.width) != null ? n : innerWidth, S = (o = (i = window.visualViewport) == null ?
  void 0 : i.height) != null ? o : innerHeight, { scrollX: C, scrollY: g } = window, { height: y, width: I, top: E, right: T, bottom: _, left: k } = e.
  getBoundingClientRect(), { top: w, right: O, bottom: P, left: D } = ((Z) => {
    let G = window.getComputedStyle(Z);
    return { top: parseFloat(G.scrollMarginTop) || 0, right: parseFloat(G.scrollMarginRight) || 0, bottom: parseFloat(G.scrollMarginBottom) ||
    0, left: parseFloat(G.scrollMarginLeft) || 0 };
  })(e), L = u === "start" || u === "nearest" ? E - w : u === "end" ? _ + P : E + y / 2 - w + P, M = c === "center" ? k + I / 2 - D + O : c ===
  "end" ? T + O : k - D, W = [];
  for (let Z = 0; Z < b.length; Z++) {
    let G = b[Z], { height: R, width: z, top: H, right: te, bottom: B, left: N } = G.getBoundingClientRect();
    if (s === "if-needed" && E >= 0 && k >= 0 && _ <= S && T <= v && E >= H && _ <= B && k >= N && T <= te) return W;
    let F = getComputedStyle(G), $ = parseInt(F.borderLeftWidth, 10), Q = parseInt(F.borderTopWidth, 10), re = parseInt(F.borderRightWidth, 10),
    ee = parseInt(F.borderBottomWidth, 10), le = 0, se = 0, pe = "offsetWidth" in G ? G.offsetWidth - G.clientWidth - $ - re : 0, ce = "offs\
etHeight" in G ? G.offsetHeight - G.clientHeight - Q - ee : 0, Se = "offsetWidth" in G ? G.offsetWidth === 0 ? 0 : z / G.offsetWidth : 0, ye = "\
offsetHeight" in G ? G.offsetHeight === 0 ? 0 : R / G.offsetHeight : 0;
    if (f === G) le = u === "start" ? L : u === "end" ? L - S : u === "nearest" ? Fn(g, g + S, S, Q, ee, g + L, g + L + y, y) : L - S / 2, se =
    c === "start" ? M : c === "center" ? M - v / 2 : c === "end" ? M - v : Fn(C, C + v, v, $, re, C + M, C + M + I, I), le = Math.max(0, le +
    g), se = Math.max(0, se + C);
    else {
      le = u === "start" ? L - H - Q : u === "end" ? L - B + ee + ce : u === "nearest" ? Fn(H, B, R, Q, ee + ce, L, L + y, y) : L - (H + R /
      2) + ce / 2, se = c === "start" ? M - N - $ : c === "center" ? M - (N + z / 2) + pe / 2 : c === "end" ? M - te + re + pe : Fn(N, te, z,
      $, re + pe, M, M + I, I);
      let { scrollLeft: Ae, scrollTop: fe } = G;
      le = ye === 0 ? 0 : Math.max(0, Math.min(fe + le / ye, G.scrollHeight - R / ye + ce)), se = Se === 0 ? 0 : Math.max(0, Math.min(Ae + se /
      Se, G.scrollWidth - z / Se + pe)), L += fe - le, M += Ae - se;
    }
    W.push({ el: G, top: le, left: se });
  }
  return W;
}, "r");

// ../node_modules/tslib/tslib.es6.mjs
var Ot = /* @__PURE__ */ a(function() {
  return Ot = Object.assign || /* @__PURE__ */ a(function(t) {
    for (var r, n = 1, i = arguments.length; n < i; n++) {
      r = arguments[n];
      for (var o in r) Object.prototype.hasOwnProperty.call(r, o) && (t[o] = r[o]);
    }
    return t;
  }, "__assign"), Ot.apply(this, arguments);
}, "__assign");

// ../node_modules/downshift/dist/downshift.esm.js
var _y = 0;
function ic(e) {
  return typeof e == "function" ? e : Be;
}
a(ic, "cbToCb");
function Be() {
}
a(Be, "noop");
function dc(e, t) {
  if (e) {
    var r = oc(e, {
      boundary: t,
      block: "nearest",
      scrollMode: "if-needed"
    });
    r.forEach(function(n) {
      var i = n.el, o = n.top, s = n.left;
      i.scrollTop = o, i.scrollLeft = s;
    });
  }
}
a(dc, "scrollIntoView");
function ac(e, t, r) {
  var n = e === t || t instanceof r.Node && e.contains && e.contains(t);
  return n;
}
a(ac, "isOrContainsNode");
function Gn(e, t) {
  var r;
  function n() {
    r && clearTimeout(r);
  }
  a(n, "cancel");
  function i() {
    for (var o = arguments.length, s = new Array(o), u = 0; u < o; u++)
      s[u] = arguments[u];
    n(), r = setTimeout(function() {
      r = null, e.apply(void 0, s);
    }, t);
  }
  return a(i, "wrapper"), i.cancel = n, i;
}
a(Gn, "debounce");
function ue() {
  for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
    t[r] = arguments[r];
  return function(n) {
    for (var i = arguments.length, o = new Array(i > 1 ? i - 1 : 0), s = 1; s < i; s++)
      o[s - 1] = arguments[s];
    return t.some(function(u) {
      return u && u.apply(void 0, [n].concat(o)), n.preventDownshiftDefault || n.hasOwnProperty("nativeEvent") && n.nativeEvent.preventDownshiftDefault;
    });
  };
}
a(ue, "callAllEventHandlers");
function Xe() {
  for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
    t[r] = arguments[r];
  return function(n) {
    t.forEach(function(i) {
      typeof i == "function" ? i(n) : i && (i.current = n);
    });
  };
}
a(Xe, "handleRefs");
function fc() {
  return String(_y++);
}
a(fc, "generateId");
function ky(e) {
  var t = e.isOpen, r = e.resultCount, n = e.previousResultCount;
  return t ? r ? r !== n ? r + " result" + (r === 1 ? " is" : "s are") + " available, use up and down arrow keys to navigate. Press Enter ke\
y to select." : "" : "No results are available." : "";
}
a(ky, "getA11yStatusMessage");
function sc(e, t) {
  return e = Array.isArray(e) ? (
    /* istanbul ignore next (preact) */
    e[0]
  ) : e, !e && t ? t : e;
}
a(sc, "unwrapArray");
function Oy(e) {
  return typeof e.type == "string";
}
a(Oy, "isDOMElement");
function Py(e) {
  return e.props;
}
a(Py, "getElementProps");
var Ay = ["highlightedIndex", "inputValue", "isOpen", "selectedItem", "type"];
function Hn(e) {
  e === void 0 && (e = {});
  var t = {};
  return Ay.forEach(function(r) {
    e.hasOwnProperty(r) && (t[r] = e[r]);
  }), t;
}
a(Hn, "pickState");
function Ar(e, t) {
  return !e || !t ? e : Object.keys(e).reduce(function(r, n) {
    return r[n] = Wn(t, n) ? t[n] : e[n], r;
  }, {});
}
a(Ar, "getState");
function Wn(e, t) {
  return e[t] !== void 0;
}
a(Wn, "isControlledProp");
function ar(e) {
  var t = e.key, r = e.keyCode;
  return r >= 37 && r <= 40 && t.indexOf("Arrow") !== 0 ? "Arrow" + t : t;
}
a(ar, "normalizeArrowKey");
function Ze(e, t, r, n, i) {
  i === void 0 && (i = !1);
  var o = r.length;
  if (o === 0)
    return -1;
  var s = o - 1;
  (typeof e != "number" || e < 0 || e > s) && (e = t > 0 ? -1 : s + 1);
  var u = e + t;
  u < 0 ? u = i ? s : 0 : u > s && (u = i ? 0 : s);
  var c = yt(u, t < 0, r, n, i);
  return c === -1 ? e >= o ? -1 : e : c;
}
a(Ze, "getHighlightedIndex");
function yt(e, t, r, n, i) {
  i === void 0 && (i = !1);
  var o = r.length;
  if (t) {
    for (var s = e; s >= 0; s--)
      if (!n(r[s], s))
        return s;
  } else
    for (var u = e; u < o; u++)
      if (!n(r[u], u))
        return u;
  return i ? yt(t ? o - 1 : 0, t, r, n) : -1;
}
a(yt, "getNonDisabledIndex");
function Kn(e, t, r, n) {
  return n === void 0 && (n = !0), r && t.some(function(i) {
    return i && (ac(i, e, r) || n && ac(i, r.document.activeElement, r));
  });
}
a(Kn, "targetWithinDownshift");
var My = Gn(function(e) {
  mc(e).textContent = "";
}, 500);
function mc(e) {
  var t = e.getElementById("a11y-status-message");
  return t || (t = e.createElement("div"), t.setAttribute("id", "a11y-status-message"), t.setAttribute("role", "status"), t.setAttribute("ar\
ia-live", "polite"), t.setAttribute("aria-relevant", "additions text"), Object.assign(t.style, {
    border: "0",
    clip: "rect(0 0 0 0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute",
    width: "1px"
  }), e.body.appendChild(t), t);
}
a(mc, "getStatusDiv");
function hc(e, t) {
  if (!(!e || !t)) {
    var r = mc(t);
    r.textContent = e, My(t);
  }
}
a(hc, "setStatus");
function Dy(e) {
  var t = e?.getElementById("a11y-status-message");
  t && t.remove();
}
a(Dy, "cleanupStatusDiv");
var gc = 0, yc = 1, vc = 2, Bn = 3, Rn = 4, bc = 5, Ic = 6, Sc = 7, xc = 8, wc = 9, Ec = 10, Cc = 11, Tc = 12, _c = 13, kc = 14, Oc = 15, Pc = 16,
Ly = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  unknown: gc,
  mouseUp: yc,
  itemMouseEnter: vc,
  keyDownArrowUp: Bn,
  keyDownArrowDown: Rn,
  keyDownEscape: bc,
  keyDownEnter: Ic,
  keyDownHome: Sc,
  keyDownEnd: xc,
  clickItem: wc,
  blurInput: Ec,
  changeInput: Cc,
  keyDownSpaceButton: Tc,
  clickButton: _c,
  blurButton: kc,
  controlledPropUpdatedSelectedItem: Oc,
  touchEnd: Pc
}), Ny = ["refKey", "ref"], Fy = ["onClick", "onPress", "onKeyDown", "onKeyUp", "onBlur"], Hy = ["onKeyDown", "onBlur", "onChange", "onInput",
"onChangeText"], By = ["refKey", "ref"], Ry = ["onMouseMove", "onMouseDown", "onClick", "onPress", "index", "item"], zy = /* @__PURE__ */ function() {
  var e = /* @__PURE__ */ function(t) {
    function r(i) {
      var o;
      o = t.call(this, i) || this, o.id = o.props.id || "downshift-" + fc(), o.menuId = o.props.menuId || o.id + "-menu", o.labelId = o.props.
      labelId || o.id + "-label", o.inputId = o.props.inputId || o.id + "-input", o.getItemId = o.props.getItemId || function(g) {
        return o.id + "-item-" + g;
      }, o.items = [], o.itemCount = null, o.previousResultCount = 0, o.timeoutIds = [], o.internalSetTimeout = function(g, y) {
        var I = setTimeout(function() {
          o.timeoutIds = o.timeoutIds.filter(function(E) {
            return E !== I;
          }), g();
        }, y);
        o.timeoutIds.push(I);
      }, o.setItemCount = function(g) {
        o.itemCount = g;
      }, o.unsetItemCount = function() {
        o.itemCount = null;
      }, o.isItemDisabled = function(g, y) {
        var I = o.getItemNodeFromIndex(y);
        return I && I.hasAttribute("disabled");
      }, o.setHighlightedIndex = function(g, y) {
        g === void 0 && (g = o.props.defaultHighlightedIndex), y === void 0 && (y = {}), y = Hn(y), o.internalSetState(U({
          highlightedIndex: g
        }, y));
      }, o.clearSelection = function(g) {
        o.internalSetState({
          selectedItem: null,
          inputValue: "",
          highlightedIndex: o.props.defaultHighlightedIndex,
          isOpen: o.props.defaultIsOpen
        }, g);
      }, o.selectItem = function(g, y, I) {
        y = Hn(y), o.internalSetState(U({
          isOpen: o.props.defaultIsOpen,
          highlightedIndex: o.props.defaultHighlightedIndex,
          selectedItem: g,
          inputValue: o.props.itemToString(g)
        }, y), I);
      }, o.selectItemAtIndex = function(g, y, I) {
        var E = o.items[g];
        E != null && o.selectItem(E, y, I);
      }, o.selectHighlightedItem = function(g, y) {
        return o.selectItemAtIndex(o.getState().highlightedIndex, g, y);
      }, o.internalSetState = function(g, y) {
        var I, E, T = {}, _ = typeof g == "function";
        return !_ && g.hasOwnProperty("inputValue") && o.props.onInputValueChange(g.inputValue, U({}, o.getStateAndHelpers(), g)), o.setState(
        function(k) {
          var w;
          k = o.getState(k);
          var O = _ ? g(k) : g;
          O = o.props.stateReducer(k, O), I = O.hasOwnProperty("selectedItem");
          var P = {};
          return I && O.selectedItem !== k.selectedItem && (E = O.selectedItem), (w = O).type || (w.type = gc), Object.keys(O).forEach(function(D) {
            k[D] !== O[D] && (T[D] = O[D]), D !== "type" && (O[D], Wn(o.props, D) || (P[D] = O[D]));
          }), _ && O.hasOwnProperty("inputValue") && o.props.onInputValueChange(O.inputValue, U({}, o.getStateAndHelpers(), O)), P;
        }, function() {
          ic(y)();
          var k = Object.keys(T).length > 1;
          k && o.props.onStateChange(T, o.getStateAndHelpers()), I && o.props.onSelect(g.selectedItem, o.getStateAndHelpers()), E !== void 0 &&
          o.props.onChange(E, o.getStateAndHelpers()), o.props.onUserAction(T, o.getStateAndHelpers());
        });
      }, o.rootRef = function(g) {
        return o._rootNode = g;
      }, o.getRootProps = function(g, y) {
        var I, E = g === void 0 ? {} : g, T = E.refKey, _ = T === void 0 ? "ref" : T, k = E.ref, w = Oe(E, Ny), O = y === void 0 ? {} : y, P = O.
        suppressRefError, D = P === void 0 ? !1 : P;
        o.getRootProps.called = !0, o.getRootProps.refKey = _, o.getRootProps.suppressRefError = D;
        var L = o.getState(), M = L.isOpen;
        return U((I = {}, I[_] = Xe(k, o.rootRef), I.role = "combobox", I["aria-expanded"] = M, I["aria-haspopup"] = "listbox", I["aria-owns"] =
        M ? o.menuId : void 0, I["aria-labelledby"] = o.labelId, I), w);
      }, o.keyDownHandlers = {
        ArrowDown: /* @__PURE__ */ a(function(y) {
          var I = this;
          if (y.preventDefault(), this.getState().isOpen) {
            var E = y.shiftKey ? 5 : 1;
            this.moveHighlightedIndex(E, {
              type: Rn
            });
          } else
            this.internalSetState({
              isOpen: !0,
              type: Rn
            }, function() {
              var T = I.getItemCount();
              if (T > 0) {
                var _ = I.getState(), k = _.highlightedIndex, w = Ze(k, 1, {
                  length: T
                }, I.isItemDisabled, !0);
                I.setHighlightedIndex(w, {
                  type: Rn
                });
              }
            });
        }, "ArrowDown"),
        ArrowUp: /* @__PURE__ */ a(function(y) {
          var I = this;
          if (y.preventDefault(), this.getState().isOpen) {
            var E = y.shiftKey ? -5 : -1;
            this.moveHighlightedIndex(E, {
              type: Bn
            });
          } else
            this.internalSetState({
              isOpen: !0,
              type: Bn
            }, function() {
              var T = I.getItemCount();
              if (T > 0) {
                var _ = I.getState(), k = _.highlightedIndex, w = Ze(k, -1, {
                  length: T
                }, I.isItemDisabled, !0);
                I.setHighlightedIndex(w, {
                  type: Bn
                });
              }
            });
        }, "ArrowUp"),
        Enter: /* @__PURE__ */ a(function(y) {
          if (y.which !== 229) {
            var I = this.getState(), E = I.isOpen, T = I.highlightedIndex;
            if (E && T != null) {
              y.preventDefault();
              var _ = this.items[T], k = this.getItemNodeFromIndex(T);
              if (_ == null || k && k.hasAttribute("disabled"))
                return;
              this.selectHighlightedItem({
                type: Ic
              });
            }
          }
        }, "Enter"),
        Escape: /* @__PURE__ */ a(function(y) {
          y.preventDefault(), this.reset(U({
            type: bc
          }, !this.state.isOpen && {
            selectedItem: null,
            inputValue: ""
          }));
        }, "Escape")
      }, o.buttonKeyDownHandlers = U({}, o.keyDownHandlers, {
        " ": /* @__PURE__ */ a(function(y) {
          y.preventDefault(), this.toggleMenu({
            type: Tc
          });
        }, "_")
      }), o.inputKeyDownHandlers = U({}, o.keyDownHandlers, {
        Home: /* @__PURE__ */ a(function(y) {
          var I = this.getState(), E = I.isOpen;
          if (E) {
            y.preventDefault();
            var T = this.getItemCount();
            if (!(T <= 0 || !E)) {
              var _ = yt(0, !1, {
                length: T
              }, this.isItemDisabled);
              this.setHighlightedIndex(_, {
                type: Sc
              });
            }
          }
        }, "Home"),
        End: /* @__PURE__ */ a(function(y) {
          var I = this.getState(), E = I.isOpen;
          if (E) {
            y.preventDefault();
            var T = this.getItemCount();
            if (!(T <= 0 || !E)) {
              var _ = yt(T - 1, !0, {
                length: T
              }, this.isItemDisabled);
              this.setHighlightedIndex(_, {
                type: xc
              });
            }
          }
        }, "End")
      }), o.getToggleButtonProps = function(g) {
        var y = g === void 0 ? {} : g, I = y.onClick;
        y.onPress;
        var E = y.onKeyDown, T = y.onKeyUp, _ = y.onBlur, k = Oe(y, Fy), w = o.getState(), O = w.isOpen, P = {
          onClick: ue(I, o.buttonHandleClick),
          onKeyDown: ue(E, o.buttonHandleKeyDown),
          onKeyUp: ue(T, o.buttonHandleKeyUp),
          onBlur: ue(_, o.buttonHandleBlur)
        }, D = k.disabled ? {} : P;
        return U({
          type: "button",
          role: "button",
          "aria-label": O ? "close menu" : "open menu",
          "aria-haspopup": !0,
          "data-toggle": !0
        }, D, k);
      }, o.buttonHandleKeyUp = function(g) {
        g.preventDefault();
      }, o.buttonHandleKeyDown = function(g) {
        var y = ar(g);
        o.buttonKeyDownHandlers[y] && o.buttonKeyDownHandlers[y].call(o, g);
      }, o.buttonHandleClick = function(g) {
        if (g.preventDefault(), o.props.environment) {
          var y = o.props.environment.document, I = y.body, E = y.activeElement;
          I && I === E && g.target.focus();
        }
        o.internalSetTimeout(function() {
          return o.toggleMenu({
            type: _c
          });
        });
      }, o.buttonHandleBlur = function(g) {
        var y = g.target;
        o.internalSetTimeout(function() {
          if (!(o.isMouseDown || !o.props.environment)) {
            var I = o.props.environment.document.activeElement;
            (I == null || I.id !== o.inputId) && I !== y && o.reset({
              type: kc
            });
          }
        });
      }, o.getLabelProps = function(g) {
        return U({
          htmlFor: o.inputId,
          id: o.labelId
        }, g);
      }, o.getInputProps = function(g) {
        var y = g === void 0 ? {} : g, I = y.onKeyDown, E = y.onBlur, T = y.onChange, _ = y.onInput;
        y.onChangeText;
        var k = Oe(y, Hy), w, O = {};
        w = "onChange";
        var P = o.getState(), D = P.inputValue, L = P.isOpen, M = P.highlightedIndex;
        if (!k.disabled) {
          var W;
          O = (W = {}, W[w] = ue(T, _, o.inputHandleChange), W.onKeyDown = ue(I, o.inputHandleKeyDown), W.onBlur = ue(E, o.inputHandleBlur),
          W);
        }
        return U({
          "aria-autocomplete": "list",
          "aria-activedescendant": L && typeof M == "number" && M >= 0 ? o.getItemId(M) : void 0,
          "aria-controls": L ? o.menuId : void 0,
          "aria-labelledby": k && k["aria-label"] ? void 0 : o.labelId,
          // https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
          // revert back since autocomplete="nope" is ignored on latest Chrome and Opera
          autoComplete: "off",
          value: D,
          id: o.inputId
        }, O, k);
      }, o.inputHandleKeyDown = function(g) {
        var y = ar(g);
        y && o.inputKeyDownHandlers[y] && o.inputKeyDownHandlers[y].call(o, g);
      }, o.inputHandleChange = function(g) {
        o.internalSetState({
          type: Cc,
          isOpen: !0,
          inputValue: g.target.value,
          highlightedIndex: o.props.defaultHighlightedIndex
        });
      }, o.inputHandleBlur = function() {
        o.internalSetTimeout(function() {
          var g;
          if (!(o.isMouseDown || !o.props.environment)) {
            var y = o.props.environment.document.activeElement, I = (y == null || (g = y.dataset) == null ? void 0 : g.toggle) && o._rootNode &&
            o._rootNode.contains(y);
            I || o.reset({
              type: Ec
            });
          }
        });
      }, o.menuRef = function(g) {
        o._menuNode = g;
      }, o.getMenuProps = function(g, y) {
        var I, E = g === void 0 ? {} : g, T = E.refKey, _ = T === void 0 ? "ref" : T, k = E.ref, w = Oe(E, By), O = y === void 0 ? {} : y, P = O.
        suppressRefError, D = P === void 0 ? !1 : P;
        return o.getMenuProps.called = !0, o.getMenuProps.refKey = _, o.getMenuProps.suppressRefError = D, U((I = {}, I[_] = Xe(k, o.menuRef),
        I.role = "listbox", I["aria-labelledby"] = w && w["aria-label"] ? void 0 : o.labelId, I.id = o.menuId, I), w);
      }, o.getItemProps = function(g) {
        var y, I = g === void 0 ? {} : g, E = I.onMouseMove, T = I.onMouseDown, _ = I.onClick;
        I.onPress;
        var k = I.index, w = I.item, O = w === void 0 ? (
          /* istanbul ignore next */
          void 0
        ) : w, P = Oe(I, Ry);
        k === void 0 ? (o.items.push(O), k = o.items.indexOf(O)) : o.items[k] = O;
        var D = "onClick", L = _, M = (y = {
          // onMouseMove is used over onMouseEnter here. onMouseMove
          // is only triggered on actual mouse movement while onMouseEnter
          // can fire on DOM changes, interrupting keyboard navigation
          onMouseMove: ue(E, function() {
            k !== o.getState().highlightedIndex && (o.setHighlightedIndex(k, {
              type: vc
            }), o.avoidScrolling = !0, o.internalSetTimeout(function() {
              return o.avoidScrolling = !1;
            }, 250));
          }),
          onMouseDown: ue(T, function(Z) {
            Z.preventDefault();
          })
        }, y[D] = ue(L, function() {
          o.selectItemAtIndex(k, {
            type: wc
          });
        }), y), W = P.disabled ? {
          onMouseDown: M.onMouseDown
        } : M;
        return U({
          id: o.getItemId(k),
          role: "option",
          "aria-selected": o.getState().highlightedIndex === k
        }, W, P);
      }, o.clearItems = function() {
        o.items = [];
      }, o.reset = function(g, y) {
        g === void 0 && (g = {}), g = Hn(g), o.internalSetState(function(I) {
          var E = I.selectedItem;
          return U({
            isOpen: o.props.defaultIsOpen,
            highlightedIndex: o.props.defaultHighlightedIndex,
            inputValue: o.props.itemToString(E)
          }, g);
        }, y);
      }, o.toggleMenu = function(g, y) {
        g === void 0 && (g = {}), g = Hn(g), o.internalSetState(function(I) {
          var E = I.isOpen;
          return U({
            isOpen: !E
          }, E && {
            highlightedIndex: o.props.defaultHighlightedIndex
          }, g);
        }, function() {
          var I = o.getState(), E = I.isOpen, T = I.highlightedIndex;
          E && o.getItemCount() > 0 && typeof T == "number" && o.setHighlightedIndex(T, g), ic(y)();
        });
      }, o.openMenu = function(g) {
        o.internalSetState({
          isOpen: !0
        }, g);
      }, o.closeMenu = function(g) {
        o.internalSetState({
          isOpen: !1
        }, g);
      }, o.updateStatus = Gn(function() {
        var g;
        if ((g = o.props) != null && (g = g.environment) != null && g.document) {
          var y = o.getState(), I = o.items[y.highlightedIndex], E = o.getItemCount(), T = o.props.getA11yStatusMessage(U({
            itemToString: o.props.itemToString,
            previousResultCount: o.previousResultCount,
            resultCount: E,
            highlightedItem: I
          }, y));
          o.previousResultCount = E, hc(T, o.props.environment.document);
        }
      }, 200);
      var s = o.props, u = s.defaultHighlightedIndex, c = s.initialHighlightedIndex, p = c === void 0 ? u : c, d = s.defaultIsOpen, h = s.initialIsOpen,
      f = h === void 0 ? d : h, b = s.initialInputValue, m = b === void 0 ? "" : b, v = s.initialSelectedItem, S = v === void 0 ? null : v, C = o.
      getState({
        highlightedIndex: p,
        isOpen: f,
        inputValue: m,
        selectedItem: S
      });
      return C.selectedItem != null && o.props.initialInputValue === void 0 && (C.inputValue = o.props.itemToString(C.selectedItem)), o.state =
      C, o;
    }
    a(r, "Downshift"), Qt(r, t);
    var n = r.prototype;
    return n.internalClearTimeouts = /* @__PURE__ */ a(function() {
      this.timeoutIds.forEach(function(o) {
        clearTimeout(o);
      }), this.timeoutIds = [];
    }, "internalClearTimeouts"), n.getState = /* @__PURE__ */ a(function(o) {
      return o === void 0 && (o = this.state), Ar(o, this.props);
    }, "getState$1"), n.getItemCount = /* @__PURE__ */ a(function() {
      var o = this.items.length;
      return this.itemCount != null ? o = this.itemCount : this.props.itemCount !== void 0 && (o = this.props.itemCount), o;
    }, "getItemCount"), n.getItemNodeFromIndex = /* @__PURE__ */ a(function(o) {
      return this.props.environment ? this.props.environment.document.getElementById(this.getItemId(o)) : null;
    }, "getItemNodeFromIndex"), n.scrollHighlightedItemIntoView = /* @__PURE__ */ a(function() {
      {
        var o = this.getItemNodeFromIndex(this.getState().highlightedIndex);
        this.props.scrollIntoView(o, this._menuNode);
      }
    }, "scrollHighlightedItemIntoView"), n.moveHighlightedIndex = /* @__PURE__ */ a(function(o, s) {
      var u = this.getItemCount(), c = this.getState(), p = c.highlightedIndex;
      if (u > 0) {
        var d = Ze(p, o, {
          length: u
        }, this.isItemDisabled, !0);
        this.setHighlightedIndex(d, s);
      }
    }, "moveHighlightedIndex"), n.getStateAndHelpers = /* @__PURE__ */ a(function() {
      var o = this.getState(), s = o.highlightedIndex, u = o.inputValue, c = o.selectedItem, p = o.isOpen, d = this.props.itemToString, h = this.
      id, f = this.getRootProps, b = this.getToggleButtonProps, m = this.getLabelProps, v = this.getMenuProps, S = this.getInputProps, C = this.
      getItemProps, g = this.openMenu, y = this.closeMenu, I = this.toggleMenu, E = this.selectItem, T = this.selectItemAtIndex, _ = this.selectHighlightedItem,
      k = this.setHighlightedIndex, w = this.clearSelection, O = this.clearItems, P = this.reset, D = this.setItemCount, L = this.unsetItemCount,
      M = this.internalSetState;
      return {
        // prop getters
        getRootProps: f,
        getToggleButtonProps: b,
        getLabelProps: m,
        getMenuProps: v,
        getInputProps: S,
        getItemProps: C,
        // actions
        reset: P,
        openMenu: g,
        closeMenu: y,
        toggleMenu: I,
        selectItem: E,
        selectItemAtIndex: T,
        selectHighlightedItem: _,
        setHighlightedIndex: k,
        clearSelection: w,
        clearItems: O,
        setItemCount: D,
        unsetItemCount: L,
        setState: M,
        // props
        itemToString: d,
        // derived
        id: h,
        // state
        highlightedIndex: s,
        inputValue: u,
        isOpen: p,
        selectedItem: c
      };
    }, "getStateAndHelpers"), n.componentDidMount = /* @__PURE__ */ a(function() {
      var o = this;
      if (!this.props.environment)
        this.cleanup = function() {
          o.internalClearTimeouts();
        };
      else {
        var s = /* @__PURE__ */ a(function() {
          o.isMouseDown = !0;
        }, "onMouseDown"), u = /* @__PURE__ */ a(function(b) {
          o.isMouseDown = !1;
          var m = Kn(b.target, [o._rootNode, o._menuNode], o.props.environment);
          !m && o.getState().isOpen && o.reset({
            type: yc
          }, function() {
            return o.props.onOuterClick(o.getStateAndHelpers());
          });
        }, "onMouseUp"), c = /* @__PURE__ */ a(function() {
          o.isTouchMove = !1;
        }, "onTouchStart"), p = /* @__PURE__ */ a(function() {
          o.isTouchMove = !0;
        }, "onTouchMove"), d = /* @__PURE__ */ a(function(b) {
          var m = Kn(b.target, [o._rootNode, o._menuNode], o.props.environment, !1);
          !o.isTouchMove && !m && o.getState().isOpen && o.reset({
            type: Pc
          }, function() {
            return o.props.onOuterClick(o.getStateAndHelpers());
          });
        }, "onTouchEnd"), h = this.props.environment;
        h.addEventListener("mousedown", s), h.addEventListener("mouseup", u), h.addEventListener("touchstart", c), h.addEventListener("touch\
move", p), h.addEventListener("touchend", d), this.cleanup = function() {
          o.internalClearTimeouts(), o.updateStatus.cancel(), h.removeEventListener("mousedown", s), h.removeEventListener("mouseup", u), h.
          removeEventListener("touchstart", c), h.removeEventListener("touchmove", p), h.removeEventListener("touchend", d);
        };
      }
    }, "componentDidMount"), n.shouldScroll = /* @__PURE__ */ a(function(o, s) {
      var u = this.props.highlightedIndex === void 0 ? this.getState() : this.props, c = u.highlightedIndex, p = s.highlightedIndex === void 0 ?
      o : s, d = p.highlightedIndex, h = c && this.getState().isOpen && !o.isOpen, f = c !== d;
      return h || f;
    }, "shouldScroll"), n.componentDidUpdate = /* @__PURE__ */ a(function(o, s) {
      Wn(this.props, "selectedItem") && this.props.selectedItemChanged(o.selectedItem, this.props.selectedItem) && this.internalSetState({
        type: Oc,
        inputValue: this.props.itemToString(this.props.selectedItem)
      }), !this.avoidScrolling && this.shouldScroll(s, o) && this.scrollHighlightedItemIntoView(), this.updateStatus();
    }, "componentDidUpdate"), n.componentWillUnmount = /* @__PURE__ */ a(function() {
      this.cleanup();
    }, "componentWillUnmount"), n.render = /* @__PURE__ */ a(function() {
      var o = sc(this.props.children, Be);
      this.clearItems(), this.getRootProps.called = !1, this.getRootProps.refKey = void 0, this.getRootProps.suppressRefError = void 0, this.
      getMenuProps.called = !1, this.getMenuProps.refKey = void 0, this.getMenuProps.suppressRefError = void 0, this.getLabelProps.called = !1,
      this.getInputProps.called = !1;
      var s = sc(o(this.getStateAndHelpers()));
      if (!s)
        return null;
      if (this.getRootProps.called || this.props.suppressRefError)
        return s;
      if (Oy(s))
        return /* @__PURE__ */ ss(s, this.getRootProps(Py(s)));
    }, "render"), r;
  }(He);
  return e.defaultProps = {
    defaultHighlightedIndex: null,
    defaultIsOpen: !1,
    getA11yStatusMessage: ky,
    itemToString: /* @__PURE__ */ a(function(r) {
      return r == null ? "" : String(r);
    }, "itemToString"),
    onStateChange: Be,
    onInputValueChange: Be,
    onUserAction: Be,
    onChange: Be,
    onSelect: Be,
    onOuterClick: Be,
    selectedItemChanged: /* @__PURE__ */ a(function(r, n) {
      return r !== n;
    }, "selectedItemChanged"),
    environment: (
      /* istanbul ignore next (ssr) */
      typeof window > "u" ? void 0 : window
    ),
    stateReducer: /* @__PURE__ */ a(function(r, n) {
      return n;
    }, "stateReducer"),
    suppressRefError: !1,
    scrollIntoView: dc
  }, e.stateChangeTypes = Ly, e;
}(), Mt = zy;
var Ac = {
  highlightedIndex: -1,
  isOpen: !1,
  selectedItem: null,
  inputValue: ""
};
function $y(e, t, r) {
  var n = e.props, i = e.type, o = {};
  Object.keys(t).forEach(function(s) {
    Wy(s, e, t, r), r[s] !== t[s] && (o[s] = r[s]);
  }), n.onStateChange && Object.keys(o).length && n.onStateChange(U({
    type: i
  }, o));
}
a($y, "callOnChangeProps");
function Wy(e, t, r, n) {
  var i = t.props, o = t.type, s = "on" + pi(e) + "Change";
  i[s] && n[e] !== void 0 && n[e] !== r[e] && i[s](U({
    type: o
  }, n));
}
a(Wy, "invokeOnChangeHandler");
function Ky(e, t) {
  return t.changes;
}
a(Ky, "stateReducer");
var lc = Gn(function(e, t) {
  hc(e, t);
}, 200), Vy = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u" ? Wt : V, Mc = "useId" in l ?
/* @__PURE__ */ a(function(t) {
  var r = t.id, n = t.labelId, i = t.menuId, o = t.getItemId, s = t.toggleButtonId, u = t.inputId, c = "downshift-" + l.useId();
  r || (r = c);
  var p = X({
    labelId: n || r + "-label",
    menuId: i || r + "-menu",
    getItemId: o || function(d) {
      return r + "-item-" + d;
    },
    toggleButtonId: s || r + "-toggle-button",
    inputId: u || r + "-input"
  });
  return p.current;
}, "useElementIds") : /* @__PURE__ */ a(function(t) {
  var r = t.id, n = r === void 0 ? "downshift-" + fc() : r, i = t.labelId, o = t.menuId, s = t.getItemId, u = t.toggleButtonId, c = t.inputId,
  p = X({
    labelId: i || n + "-label",
    menuId: o || n + "-menu",
    getItemId: s || function(d) {
      return n + "-item-" + d;
    },
    toggleButtonId: u || n + "-toggle-button",
    inputId: c || n + "-input"
  });
  return p.current;
}, "useElementIds");
function ci(e, t, r, n) {
  var i, o;
  if (e === void 0) {
    if (t === void 0)
      throw new Error(n);
    i = r[t], o = t;
  } else
    o = t === void 0 ? r.indexOf(e) : t, i = e;
  return [i, o];
}
a(ci, "getItemAndIndex");
function jy(e) {
  return /^\S{1}$/.test(e);
}
a(jy, "isAcceptedCharacterKey");
function pi(e) {
  return "" + e.slice(0, 1).toUpperCase() + e.slice(1);
}
a(pi, "capitalizeString");
function Yn(e) {
  var t = X(e);
  return t.current = e, t;
}
a(Yn, "useLatestRef");
function Dc(e, t, r, n) {
  var i = X(), o = X(), s = A(function(b, m) {
    o.current = m, b = Ar(b, m.props);
    var v = e(b, m), S = m.props.stateReducer(b, U({}, m, {
      changes: v
    }));
    return S;
  }, [e]), u = Kt(s, t, r), c = u[0], p = u[1], d = Yn(t), h = A(function(b) {
    return p(U({
      props: d.current
    }, b));
  }, [d]), f = o.current;
  return V(function() {
    var b = Ar(i.current, f?.props), m = f && i.current && !n(b, c);
    m && $y(f, b, c), i.current = c;
  }, [c, f, n]), [c, h];
}
a(Dc, "useEnhancedReducer");
function Lc(e, t, r, n) {
  var i = Dc(e, t, r, n), o = i[0], s = i[1];
  return [Ar(o, t), s];
}
a(Lc, "useControlledReducer$1");
var Pr = {
  itemToString: /* @__PURE__ */ a(function(t) {
    return t ? String(t) : "";
  }, "itemToString"),
  itemToKey: /* @__PURE__ */ a(function(t) {
    return t;
  }, "itemToKey"),
  stateReducer: Ky,
  scrollIntoView: dc,
  environment: (
    /* istanbul ignore next (ssr) */
    typeof window > "u" ? void 0 : window
  )
};
function $e(e, t, r) {
  r === void 0 && (r = Ac);
  var n = e["default" + pi(t)];
  return n !== void 0 ? n : r[t];
}
a($e, "getDefaultValue$1");
function Pt(e, t, r) {
  r === void 0 && (r = Ac);
  var n = e[t];
  if (n !== void 0)
    return n;
  var i = e["initial" + pi(t)];
  return i !== void 0 ? i : $e(e, t, r);
}
a(Pt, "getInitialValue$1");
function Nc(e) {
  var t = Pt(e, "selectedItem"), r = Pt(e, "isOpen"), n = Pt(e, "highlightedIndex"), i = Pt(e, "inputValue");
  return {
    highlightedIndex: n < 0 && t && r ? e.items.findIndex(function(o) {
      return e.itemToKey(o) === e.itemToKey(t);
    }) : n,
    isOpen: r,
    selectedItem: t,
    inputValue: i
  };
}
a(Nc, "getInitialState$2");
function At(e, t, r) {
  var n = e.items, i = e.initialHighlightedIndex, o = e.defaultHighlightedIndex, s = e.isItemDisabled, u = e.itemToKey, c = t.selectedItem, p = t.
  highlightedIndex;
  return n.length === 0 ? -1 : i !== void 0 && p === i && !s(n[i]) ? i : o !== void 0 && !s(n[o]) ? o : c ? n.findIndex(function(d) {
    return u(c) === u(d);
  }) : r < 0 && !s(n[n.length - 1]) ? n.length - 1 : r > 0 && !s(n[0]) ? 0 : -1;
}
a(At, "getHighlightedIndexOnOpen");
function Fc(e, t, r) {
  var n = X({
    isMouseDown: !1,
    isTouchMove: !1,
    isTouchEnd: !1
  });
  return V(function() {
    if (!e)
      return Be;
    var i = t.map(function(d) {
      return d.current;
    });
    function o() {
      n.current.isTouchEnd = !1, n.current.isMouseDown = !0;
    }
    a(o, "onMouseDown");
    function s(d) {
      n.current.isMouseDown = !1, Kn(d.target, i, e) || r();
    }
    a(s, "onMouseUp");
    function u() {
      n.current.isTouchEnd = !1, n.current.isTouchMove = !1;
    }
    a(u, "onTouchStart");
    function c() {
      n.current.isTouchMove = !0;
    }
    a(c, "onTouchMove");
    function p(d) {
      n.current.isTouchEnd = !0, !n.current.isTouchMove && !Kn(d.target, i, e, !1) && r();
    }
    return a(p, "onTouchEnd"), e.addEventListener("mousedown", o), e.addEventListener("mouseup", s), e.addEventListener("touchstart", u), e.
    addEventListener("touchmove", c), e.addEventListener("touchend", p), /* @__PURE__ */ a(function() {
      e.removeEventListener("mousedown", o), e.removeEventListener("mouseup", s), e.removeEventListener("touchstart", u), e.removeEventListener(
      "touchmove", c), e.removeEventListener("touchend", p);
    }, "cleanup");
  }, [e, r]), n.current;
}
a(Fc, "useMouseAndTouchTracker");
var di = /* @__PURE__ */ a(function() {
  return Be;
}, "useGetterPropsCalledChecker");
function fi(e, t, r, n) {
  n === void 0 && (n = {});
  var i = n.document, o = Qn();
  V(function() {
    if (!(!e || o || !i)) {
      var s = e(t);
      lc(s, i);
    }
  }, r), V(function() {
    return function() {
      lc.cancel(), Dy(i);
    };
  }, [i]);
}
a(fi, "useA11yMessageStatus");
function Hc(e) {
  var t = e.highlightedIndex, r = e.isOpen, n = e.itemRefs, i = e.getItemNodeFromIndex, o = e.menuElement, s = e.scrollIntoView, u = X(!0);
  return Vy(function() {
    t < 0 || !r || !Object.keys(n.current).length || (u.current === !1 ? u.current = !0 : s(i(t), o));
  }, [t]), u;
}
a(Hc, "useScrollIntoView");
var mi = Be;
function Vn(e, t, r) {
  var n;
  r === void 0 && (r = !0);
  var i = ((n = e.items) == null ? void 0 : n.length) && t >= 0;
  return U({
    isOpen: !1,
    highlightedIndex: -1
  }, i && U({
    selectedItem: e.items[t],
    isOpen: $e(e, "isOpen"),
    highlightedIndex: $e(e, "highlightedIndex")
  }, r && {
    inputValue: e.itemToString(e.items[t])
  }));
}
a(Vn, "getChangesOnSelection");
function Bc(e, t) {
  return e.isOpen === t.isOpen && e.inputValue === t.inputValue && e.highlightedIndex === t.highlightedIndex && e.selectedItem === t.selectedItem;
}
a(Bc, "isDropdownsStateEqual");
function Qn() {
  var e = l.useRef(!0);
  return l.useEffect(function() {
    return e.current = !1, function() {
      e.current = !0;
    };
  }, []), e.current;
}
a(Qn, "useIsInitialMount");
var zn = {
  environment: q.default.shape({
    addEventListener: q.default.func.isRequired,
    removeEventListener: q.default.func.isRequired,
    document: q.default.shape({
      createElement: q.default.func.isRequired,
      getElementById: q.default.func.isRequired,
      activeElement: q.default.any.isRequired,
      body: q.default.any.isRequired
    }).isRequired,
    Node: q.default.func.isRequired
  }),
  itemToString: q.default.func,
  itemToKey: q.default.func,
  stateReducer: q.default.func
}, Rc = U({}, zn, {
  getA11yStatusMessage: q.default.func,
  highlightedIndex: q.default.number,
  defaultHighlightedIndex: q.default.number,
  initialHighlightedIndex: q.default.number,
  isOpen: q.default.bool,
  defaultIsOpen: q.default.bool,
  initialIsOpen: q.default.bool,
  selectedItem: q.default.any,
  initialSelectedItem: q.default.any,
  defaultSelectedItem: q.default.any,
  id: q.default.string,
  labelId: q.default.string,
  menuId: q.default.string,
  getItemId: q.default.func,
  toggleButtonId: q.default.string,
  onSelectedItemChange: q.default.func,
  onHighlightedIndexChange: q.default.func,
  onStateChange: q.default.func,
  onIsOpenChange: q.default.func,
  scrollIntoView: q.default.func
});
function zc(e, t, r) {
  var n = t.type, i = t.props, o;
  switch (n) {
    case r.ItemMouseMove:
      o = {
        highlightedIndex: t.disabled ? -1 : t.index
      };
      break;
    case r.MenuMouseLeave:
      o = {
        highlightedIndex: -1
      };
      break;
    case r.ToggleButtonClick:
    case r.FunctionToggleMenu:
      o = {
        isOpen: !e.isOpen,
        highlightedIndex: e.isOpen ? -1 : At(i, e, 0)
      };
      break;
    case r.FunctionOpenMenu:
      o = {
        isOpen: !0,
        highlightedIndex: At(i, e, 0)
      };
      break;
    case r.FunctionCloseMenu:
      o = {
        isOpen: !1
      };
      break;
    case r.FunctionSetHighlightedIndex:
      o = {
        highlightedIndex: t.highlightedIndex
      };
      break;
    case r.FunctionSetInputValue:
      o = {
        inputValue: t.inputValue
      };
      break;
    case r.FunctionReset:
      o = {
        highlightedIndex: $e(i, "highlightedIndex"),
        isOpen: $e(i, "isOpen"),
        selectedItem: $e(i, "selectedItem"),
        inputValue: $e(i, "inputValue")
      };
      break;
    default:
      throw new Error("Reducer called without proper action type.");
  }
  return U({}, e, o);
}
a(zc, "downshiftCommonReducer");
function Uy(e) {
  for (var t = e.keysSoFar, r = e.highlightedIndex, n = e.items, i = e.itemToString, o = e.isItemDisabled, s = t.toLowerCase(), u = 0; u < n.
  length; u++) {
    var c = (u + r + (t.length < 2 ? 1 : 0)) % n.length, p = n[c];
    if (p !== void 0 && i(p).toLowerCase().startsWith(s) && !o(p, c))
      return c;
  }
  return r;
}
a(Uy, "getItemIndexByCharacterKey");
var MM = Ot(Ot({}, Rc), { items: q.default.array.isRequired, isItemDisabled: q.default.func }), qy = Ot(Ot({}, Pr), { isItemDisabled: /* @__PURE__ */ a(
function() {
  return !1;
}, "isItemDisabled") }), Gy = Be, $n = 0, hi = 1, gi = 2, jn = 3, yi = 4, vi = 5, bi = 6, Ii = 7, Si = 8, xi = 9, wi = 10, Un = 11, $c = 12,
Wc = 13, Ei = 14, Kc = 15, Vc = 16, jc = 17, Uc = 18, Ci = 19, ui = 20, qc = 21, Gc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ToggleButtonClick: $n,
  ToggleButtonKeyDownArrowDown: hi,
  ToggleButtonKeyDownArrowUp: gi,
  ToggleButtonKeyDownCharacter: jn,
  ToggleButtonKeyDownEscape: yi,
  ToggleButtonKeyDownHome: vi,
  ToggleButtonKeyDownEnd: bi,
  ToggleButtonKeyDownEnter: Ii,
  ToggleButtonKeyDownSpaceButton: Si,
  ToggleButtonKeyDownPageUp: xi,
  ToggleButtonKeyDownPageDown: wi,
  ToggleButtonBlur: Un,
  MenuMouseLeave: $c,
  ItemMouseMove: Wc,
  ItemClick: Ei,
  FunctionToggleMenu: Kc,
  FunctionOpenMenu: Vc,
  FunctionCloseMenu: jc,
  FunctionSetHighlightedIndex: Uc,
  FunctionSelectItem: Ci,
  FunctionSetInputValue: ui,
  FunctionReset: qc
});
function Yy(e, t) {
  var r, n = t.type, i = t.props, o = t.altKey, s;
  switch (n) {
    case Ei:
      s = {
        isOpen: $e(i, "isOpen"),
        highlightedIndex: $e(i, "highlightedIndex"),
        selectedItem: i.items[t.index]
      };
      break;
    case jn:
      {
        var u = t.key, c = "" + e.inputValue + u, p = !e.isOpen && e.selectedItem ? i.items.findIndex(function(b) {
          return i.itemToKey(b) === i.itemToKey(e.selectedItem);
        }) : e.highlightedIndex, d = Uy({
          keysSoFar: c,
          highlightedIndex: p,
          items: i.items,
          itemToString: i.itemToString,
          isItemDisabled: i.isItemDisabled
        });
        s = {
          inputValue: c,
          highlightedIndex: d,
          isOpen: !0
        };
      }
      break;
    case hi:
      {
        var h = e.isOpen ? Ze(e.highlightedIndex, 1, i.items, i.isItemDisabled) : o && e.selectedItem == null ? -1 : At(i, e, 1);
        s = {
          highlightedIndex: h,
          isOpen: !0
        };
      }
      break;
    case gi:
      if (e.isOpen && o)
        s = Vn(i, e.highlightedIndex, !1);
      else {
        var f = e.isOpen ? Ze(e.highlightedIndex, -1, i.items, i.isItemDisabled) : At(i, e, -1);
        s = {
          highlightedIndex: f,
          isOpen: !0
        };
      }
      break;
    case Ii:
    case Si:
      s = Vn(i, e.highlightedIndex, !1);
      break;
    case vi:
      s = {
        highlightedIndex: yt(0, !1, i.items, i.isItemDisabled),
        isOpen: !0
      };
      break;
    case bi:
      s = {
        highlightedIndex: yt(i.items.length - 1, !0, i.items, i.isItemDisabled),
        isOpen: !0
      };
      break;
    case xi:
      s = {
        highlightedIndex: Ze(e.highlightedIndex, -10, i.items, i.isItemDisabled)
      };
      break;
    case wi:
      s = {
        highlightedIndex: Ze(e.highlightedIndex, 10, i.items, i.isItemDisabled)
      };
      break;
    case yi:
      s = {
        isOpen: !1,
        highlightedIndex: -1
      };
      break;
    case Un:
      s = U({
        isOpen: !1,
        highlightedIndex: -1
      }, e.highlightedIndex >= 0 && ((r = i.items) == null ? void 0 : r.length) && {
        selectedItem: i.items[e.highlightedIndex]
      });
      break;
    case Ci:
      s = {
        selectedItem: t.selectedItem
      };
      break;
    default:
      return zc(e, t, Gc);
  }
  return U({}, e, s);
}
a(Yy, "downshiftSelectReducer");
var Qy = ["onClick"], Xy = ["onMouseLeave", "refKey", "ref"], Zy = ["onBlur", "onClick", "onPress", "onKeyDown", "refKey", "ref"], Jy = ["it\
em", "index", "onMouseMove", "onClick", "onMouseDown", "onPress", "refKey", "disabled", "ref"];
Yc.stateChangeTypes = Gc;
function Yc(e) {
  e === void 0 && (e = {}), Gy(e, Yc);
  var t = U({}, qy, e), r = t.scrollIntoView, n = t.environment, i = t.getA11yStatusMessage, o = Lc(Yy, t, Nc, Bc), s = o[0], u = o[1], c = s.
  isOpen, p = s.highlightedIndex, d = s.selectedItem, h = s.inputValue, f = X(null), b = X(null), m = X({}), v = X(null), S = Mc(t), C = Yn(
  {
    state: s,
    props: t
  }), g = A(function(R) {
    return m.current[S.getItemId(R)];
  }, [S]);
  fi(i, s, [c, p, d, h], n);
  var y = Hc({
    menuElement: b.current,
    highlightedIndex: p,
    isOpen: c,
    itemRefs: m,
    scrollIntoView: r,
    getItemNodeFromIndex: g
  });
  V(function() {
    return v.current = Gn(function(R) {
      R({
        type: ui,
        inputValue: ""
      });
    }, 500), function() {
      v.current.cancel();
    };
  }, []), V(function() {
    h && v.current(u);
  }, [u, h]), mi({
    props: t,
    state: s
  }), V(function() {
    var R = Pt(t, "isOpen");
    R && f.current && f.current.focus();
  }, []);
  var I = Fc(n, [f, b], A(/* @__PURE__ */ a(function() {
    C.current.state.isOpen && u({
      type: Un
    });
  }, "handleBlur"), [u, C])), E = di("getMenuProps", "getToggleButtonProps");
  V(function() {
    c || (m.current = {});
  }, [c]);
  var T = j(function() {
    return {
      ArrowDown: /* @__PURE__ */ a(function(z) {
        z.preventDefault(), u({
          type: hi,
          altKey: z.altKey
        });
      }, "ArrowDown"),
      ArrowUp: /* @__PURE__ */ a(function(z) {
        z.preventDefault(), u({
          type: gi,
          altKey: z.altKey
        });
      }, "ArrowUp"),
      Home: /* @__PURE__ */ a(function(z) {
        z.preventDefault(), u({
          type: vi
        });
      }, "Home"),
      End: /* @__PURE__ */ a(function(z) {
        z.preventDefault(), u({
          type: bi
        });
      }, "End"),
      Escape: /* @__PURE__ */ a(function() {
        C.current.state.isOpen && u({
          type: yi
        });
      }, "Escape"),
      Enter: /* @__PURE__ */ a(function(z) {
        z.preventDefault(), u({
          type: C.current.state.isOpen ? Ii : $n
        });
      }, "Enter"),
      PageUp: /* @__PURE__ */ a(function(z) {
        C.current.state.isOpen && (z.preventDefault(), u({
          type: xi
        }));
      }, "PageUp"),
      PageDown: /* @__PURE__ */ a(function(z) {
        C.current.state.isOpen && (z.preventDefault(), u({
          type: wi
        }));
      }, "PageDown"),
      " ": /* @__PURE__ */ a(function(z) {
        z.preventDefault();
        var H = C.current.state;
        if (!H.isOpen) {
          u({
            type: $n
          });
          return;
        }
        H.inputValue ? u({
          type: jn,
          key: " "
        }) : u({
          type: Si
        });
      }, "_")
    };
  }, [u, C]), _ = A(function() {
    u({
      type: Kc
    });
  }, [u]), k = A(function() {
    u({
      type: jc
    });
  }, [u]), w = A(function() {
    u({
      type: Vc
    });
  }, [u]), O = A(function(R) {
    u({
      type: Uc,
      highlightedIndex: R
    });
  }, [u]), P = A(function(R) {
    u({
      type: Ci,
      selectedItem: R
    });
  }, [u]), D = A(function() {
    u({
      type: qc
    });
  }, [u]), L = A(function(R) {
    u({
      type: ui,
      inputValue: R
    });
  }, [u]), M = A(function(R) {
    var z = R === void 0 ? {} : R, H = z.onClick, te = Oe(z, Qy), B = /* @__PURE__ */ a(function() {
      var F;
      (F = f.current) == null || F.focus();
    }, "labelHandleClick");
    return U({
      id: S.labelId,
      htmlFor: S.toggleButtonId,
      onClick: ue(H, B)
    }, te);
  }, [S]), W = A(function(R, z) {
    var H, te = R === void 0 ? {} : R, B = te.onMouseLeave, N = te.refKey, F = N === void 0 ? "ref" : N, $ = te.ref, Q = Oe(te, Xy), re = z ===
    void 0 ? {} : z, ee = re.suppressRefError, le = ee === void 0 ? !1 : ee, se = /* @__PURE__ */ a(function() {
      u({
        type: $c
      });
    }, "menuHandleMouseLeave");
    return E("getMenuProps", le, F, b), U((H = {}, H[F] = Xe($, function(pe) {
      b.current = pe;
    }), H.id = S.menuId, H.role = "listbox", H["aria-labelledby"] = Q && Q["aria-label"] ? void 0 : "" + S.labelId, H.onMouseLeave = ue(B, se),
    H), Q);
  }, [u, E, S]), Z = A(function(R, z) {
    var H, te = R === void 0 ? {} : R, B = te.onBlur, N = te.onClick;
    te.onPress;
    var F = te.onKeyDown, $ = te.refKey, Q = $ === void 0 ? "ref" : $, re = te.ref, ee = Oe(te, Zy), le = z === void 0 ? {} : z, se = le.suppressRefError,
    pe = se === void 0 ? !1 : se, ce = C.current.state, Se = /* @__PURE__ */ a(function() {
      u({
        type: $n
      });
    }, "toggleButtonHandleClick"), ye = /* @__PURE__ */ a(function() {
      ce.isOpen && !I.isMouseDown && u({
        type: Un
      });
    }, "toggleButtonHandleBlur"), Ae = /* @__PURE__ */ a(function(Te) {
      var Ne = ar(Te);
      Ne && T[Ne] ? T[Ne](Te) : jy(Ne) && u({
        type: jn,
        key: Ne
      });
    }, "toggleButtonHandleKeyDown"), fe = U((H = {}, H[Q] = Xe(re, function(xe) {
      f.current = xe;
    }), H["aria-activedescendant"] = ce.isOpen && ce.highlightedIndex > -1 ? S.getItemId(ce.highlightedIndex) : "", H["aria-controls"] = S.menuId,
    H["aria-expanded"] = C.current.state.isOpen, H["aria-haspopup"] = "listbox", H["aria-labelledby"] = ee && ee["aria-label"] ? void 0 : "" +
    S.labelId, H.id = S.toggleButtonId, H.role = "combobox", H.tabIndex = 0, H.onBlur = ue(B, ye), H), ee);
    return ee.disabled || (fe.onClick = ue(N, Se), fe.onKeyDown = ue(F, Ae)), E("getToggleButtonProps", pe, Q, f), fe;
  }, [u, S, C, I, E, T]), G = A(function(R) {
    var z, H = R === void 0 ? {} : R, te = H.item, B = H.index, N = H.onMouseMove, F = H.onClick, $ = H.onMouseDown;
    H.onPress;
    var Q = H.refKey, re = Q === void 0 ? "ref" : Q, ee = H.disabled, le = H.ref, se = Oe(H, Jy);
    ee !== void 0 && console.warn('Passing "disabled" as an argument to getItemProps is not supported anymore. Please use the isItemDisabled\
 prop from useSelect.');
    var pe = C.current, ce = pe.state, Se = pe.props, ye = ci(te, B, Se.items, "Pass either item or index to getItemProps!"), Ae = ye[0], fe = ye[1],
    xe = Se.isItemDisabled(Ae, fe), Te = /* @__PURE__ */ a(function() {
      I.isTouchEnd || fe === ce.highlightedIndex || (y.current = !1, u({
        type: Wc,
        index: fe,
        disabled: xe
      }));
    }, "itemHandleMouseMove"), Ne = /* @__PURE__ */ a(function() {
      u({
        type: Ei,
        index: fe
      });
    }, "itemHandleClick"), Je = /* @__PURE__ */ a(function(vr) {
      return vr.preventDefault();
    }, "itemHandleMouseDown"), Me = U((z = {}, z[re] = Xe(le, function(Ue) {
      Ue && (m.current[S.getItemId(fe)] = Ue);
    }), z["aria-disabled"] = xe, z["aria-selected"] = "" + (Ae === ce.selectedItem), z.id = S.getItemId(fe), z.role = "option", z), se);
    return xe || (Me.onClick = ue(F, Ne)), Me.onMouseMove = ue(N, Te), Me.onMouseDown = ue($, Je), Me;
  }, [C, S, I, y, u]);
  return {
    // prop getters.
    getToggleButtonProps: Z,
    getLabelProps: M,
    getMenuProps: W,
    getItemProps: G,
    // actions.
    toggleMenu: _,
    openMenu: w,
    closeMenu: k,
    setHighlightedIndex: O,
    selectItem: P,
    reset: D,
    setInputValue: L,
    // state.
    highlightedIndex: p,
    isOpen: c,
    selectedItem: d,
    inputValue: h
  };
}
a(Yc, "useSelect");
var Ti = 0, _i = 1, ki = 2, Oi = 3, Pi = 4, Ai = 5, Mi = 6, Di = 7, Li = 8, qn = 9, Ni = 10, Qc = 11, Xc = 12, Fi = 13, Zc = 14, Jc = 15, ep = 16,
tp = 17, rp = 18, Hi = 19, np = 20, op = 21, Bi = 22, ip = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  InputKeyDownArrowDown: Ti,
  InputKeyDownArrowUp: _i,
  InputKeyDownEscape: ki,
  InputKeyDownHome: Oi,
  InputKeyDownEnd: Pi,
  InputKeyDownPageUp: Ai,
  InputKeyDownPageDown: Mi,
  InputKeyDownEnter: Di,
  InputChange: Li,
  InputBlur: qn,
  InputClick: Ni,
  MenuMouseLeave: Qc,
  ItemMouseMove: Xc,
  ItemClick: Fi,
  ToggleButtonClick: Zc,
  FunctionToggleMenu: Jc,
  FunctionOpenMenu: ep,
  FunctionCloseMenu: tp,
  FunctionSetHighlightedIndex: rp,
  FunctionSelectItem: Hi,
  FunctionSetInputValue: np,
  FunctionReset: op,
  ControlledPropUpdatedSelectedItem: Bi
});
function ev(e) {
  var t = Nc(e), r = t.selectedItem, n = t.inputValue;
  return n === "" && r && e.defaultInputValue === void 0 && e.initialInputValue === void 0 && e.inputValue === void 0 && (n = e.itemToString(
  r)), U({}, t, {
    inputValue: n
  });
}
a(ev, "getInitialState$1");
var DM = U({}, Rc, {
  items: q.default.array.isRequired,
  isItemDisabled: q.default.func,
  inputValue: q.default.string,
  defaultInputValue: q.default.string,
  initialInputValue: q.default.string,
  inputId: q.default.string,
  onInputValueChange: q.default.func
});
function tv(e, t, r, n) {
  var i = X(), o = Dc(e, t, r, n), s = o[0], u = o[1], c = Qn();
  return V(function() {
    if (Wn(t, "selectedItem")) {
      if (!c) {
        var p = t.itemToKey(t.selectedItem) !== t.itemToKey(i.current);
        p && u({
          type: Bi,
          inputValue: t.itemToString(t.selectedItem)
        });
      }
      i.current = s.selectedItem === i.current ? t.selectedItem : s.selectedItem;
    }
  }, [s.selectedItem, t.selectedItem]), [Ar(s, t), u];
}
a(tv, "useControlledReducer");
var rv = Be, nv = U({}, Pr, {
  isItemDisabled: /* @__PURE__ */ a(function() {
    return !1;
  }, "isItemDisabled")
});
function ov(e, t) {
  var r, n = t.type, i = t.props, o = t.altKey, s;
  switch (n) {
    case Fi:
      s = {
        isOpen: $e(i, "isOpen"),
        highlightedIndex: $e(i, "highlightedIndex"),
        selectedItem: i.items[t.index],
        inputValue: i.itemToString(i.items[t.index])
      };
      break;
    case Ti:
      e.isOpen ? s = {
        highlightedIndex: Ze(e.highlightedIndex, 1, i.items, i.isItemDisabled, !0)
      } : s = {
        highlightedIndex: o && e.selectedItem == null ? -1 : At(i, e, 1),
        isOpen: i.items.length >= 0
      };
      break;
    case _i:
      e.isOpen ? o ? s = Vn(i, e.highlightedIndex) : s = {
        highlightedIndex: Ze(e.highlightedIndex, -1, i.items, i.isItemDisabled, !0)
      } : s = {
        highlightedIndex: At(i, e, -1),
        isOpen: i.items.length >= 0
      };
      break;
    case Di:
      s = Vn(i, e.highlightedIndex);
      break;
    case ki:
      s = U({
        isOpen: !1,
        highlightedIndex: -1
      }, !e.isOpen && {
        selectedItem: null,
        inputValue: ""
      });
      break;
    case Ai:
      s = {
        highlightedIndex: Ze(e.highlightedIndex, -10, i.items, i.isItemDisabled, !0)
      };
      break;
    case Mi:
      s = {
        highlightedIndex: Ze(e.highlightedIndex, 10, i.items, i.isItemDisabled, !0)
      };
      break;
    case Oi:
      s = {
        highlightedIndex: yt(0, !1, i.items, i.isItemDisabled)
      };
      break;
    case Pi:
      s = {
        highlightedIndex: yt(i.items.length - 1, !0, i.items, i.isItemDisabled)
      };
      break;
    case qn:
      s = U({
        isOpen: !1,
        highlightedIndex: -1
      }, e.highlightedIndex >= 0 && ((r = i.items) == null ? void 0 : r.length) && t.selectItem && {
        selectedItem: i.items[e.highlightedIndex],
        inputValue: i.itemToString(i.items[e.highlightedIndex])
      });
      break;
    case Li:
      s = {
        isOpen: !0,
        highlightedIndex: $e(i, "highlightedIndex"),
        inputValue: t.inputValue
      };
      break;
    case Ni:
      s = {
        isOpen: !e.isOpen,
        highlightedIndex: e.isOpen ? -1 : At(i, e, 0)
      };
      break;
    case Hi:
      s = {
        selectedItem: t.selectedItem,
        inputValue: i.itemToString(t.selectedItem)
      };
      break;
    case Bi:
      s = {
        inputValue: t.inputValue
      };
      break;
    default:
      return zc(e, t, ip);
  }
  return U({}, e, s);
}
a(ov, "downshiftUseComboboxReducer");
var iv = ["onMouseLeave", "refKey", "ref"], av = ["item", "index", "refKey", "ref", "onMouseMove", "onMouseDown", "onClick", "onPress", "dis\
abled"], sv = ["onClick", "onPress", "refKey", "ref"], lv = ["onKeyDown", "onChange", "onInput", "onBlur", "onChangeText", "onClick", "refKe\
y", "ref"];
ap.stateChangeTypes = ip;
function ap(e) {
  e === void 0 && (e = {}), rv(e, ap);
  var t = U({}, nv, e), r = t.items, n = t.scrollIntoView, i = t.environment, o = t.getA11yStatusMessage, s = tv(ov, t, ev, Bc), u = s[0], c = s[1],
  p = u.isOpen, d = u.highlightedIndex, h = u.selectedItem, f = u.inputValue, b = X(null), m = X({}), v = X(null), S = X(null), C = Qn(), g = Mc(
  t), y = X(), I = Yn({
    state: u,
    props: t
  }), E = A(function(B) {
    return m.current[g.getItemId(B)];
  }, [g]);
  fi(o, u, [p, d, h, f], i);
  var T = Hc({
    menuElement: b.current,
    highlightedIndex: d,
    isOpen: p,
    itemRefs: m,
    scrollIntoView: n,
    getItemNodeFromIndex: E
  });
  mi({
    props: t,
    state: u
  }), V(function() {
    var B = Pt(t, "isOpen");
    B && v.current && v.current.focus();
  }, []), V(function() {
    C || (y.current = r.length);
  });
  var _ = Fc(i, [S, b, v], A(/* @__PURE__ */ a(function() {
    I.current.state.isOpen && c({
      type: qn,
      selectItem: !1
    });
  }, "handleBlur"), [c, I])), k = di("getInputProps", "getMenuProps");
  V(function() {
    p || (m.current = {});
  }, [p]), V(function() {
    var B;
    !p || !(i != null && i.document) || !(v != null && (B = v.current) != null && B.focus) || i.document.activeElement !== v.current && v.current.
    focus();
  }, [p, i]);
  var w = j(function() {
    return {
      ArrowDown: /* @__PURE__ */ a(function(N) {
        N.preventDefault(), c({
          type: Ti,
          altKey: N.altKey
        });
      }, "ArrowDown"),
      ArrowUp: /* @__PURE__ */ a(function(N) {
        N.preventDefault(), c({
          type: _i,
          altKey: N.altKey
        });
      }, "ArrowUp"),
      Home: /* @__PURE__ */ a(function(N) {
        I.current.state.isOpen && (N.preventDefault(), c({
          type: Oi
        }));
      }, "Home"),
      End: /* @__PURE__ */ a(function(N) {
        I.current.state.isOpen && (N.preventDefault(), c({
          type: Pi
        }));
      }, "End"),
      Escape: /* @__PURE__ */ a(function(N) {
        var F = I.current.state;
        (F.isOpen || F.inputValue || F.selectedItem || F.highlightedIndex > -1) && (N.preventDefault(), c({
          type: ki
        }));
      }, "Escape"),
      Enter: /* @__PURE__ */ a(function(N) {
        var F = I.current.state;
        !F.isOpen || N.which === 229 || (N.preventDefault(), c({
          type: Di
        }));
      }, "Enter"),
      PageUp: /* @__PURE__ */ a(function(N) {
        I.current.state.isOpen && (N.preventDefault(), c({
          type: Ai
        }));
      }, "PageUp"),
      PageDown: /* @__PURE__ */ a(function(N) {
        I.current.state.isOpen && (N.preventDefault(), c({
          type: Mi
        }));
      }, "PageDown")
    };
  }, [c, I]), O = A(function(B) {
    return U({
      id: g.labelId,
      htmlFor: g.inputId
    }, B);
  }, [g]), P = A(function(B, N) {
    var F, $ = B === void 0 ? {} : B, Q = $.onMouseLeave, re = $.refKey, ee = re === void 0 ? "ref" : re, le = $.ref, se = Oe($, iv), pe = N ===
    void 0 ? {} : N, ce = pe.suppressRefError, Se = ce === void 0 ? !1 : ce;
    return k("getMenuProps", Se, ee, b), U((F = {}, F[ee] = Xe(le, function(ye) {
      b.current = ye;
    }), F.id = g.menuId, F.role = "listbox", F["aria-labelledby"] = se && se["aria-label"] ? void 0 : "" + g.labelId, F.onMouseLeave = ue(Q,
    function() {
      c({
        type: Qc
      });
    }), F), se);
  }, [c, k, g]), D = A(function(B) {
    var N, F, $ = B === void 0 ? {} : B, Q = $.item, re = $.index, ee = $.refKey, le = ee === void 0 ? "ref" : ee, se = $.ref, pe = $.onMouseMove,
    ce = $.onMouseDown, Se = $.onClick;
    $.onPress;
    var ye = $.disabled, Ae = Oe($, av);
    ye !== void 0 && console.warn('Passing "disabled" as an argument to getItemProps is not supported anymore. Please use the isItemDisabled\
 prop from useCombobox.');
    var fe = I.current, xe = fe.props, Te = fe.state, Ne = ci(Q, re, xe.items, "Pass either item or index to getItemProps!"), Je = Ne[0], Me = Ne[1],
    Ue = xe.isItemDisabled(Je, Me), vr = "onClick", Vr = Se, ct = /* @__PURE__ */ a(function() {
      _.isTouchEnd || Me === Te.highlightedIndex || (T.current = !1, c({
        type: Xc,
        index: Me,
        disabled: Ue
      }));
    }, "itemHandleMouseMove"), St = /* @__PURE__ */ a(function() {
      c({
        type: Fi,
        index: Me
      });
    }, "itemHandleClick"), pt = /* @__PURE__ */ a(function(Zm) {
      return Zm.preventDefault();
    }, "itemHandleMouseDown");
    return U((N = {}, N[le] = Xe(se, function(qe) {
      qe && (m.current[g.getItemId(Me)] = qe);
    }), N["aria-disabled"] = Ue, N["aria-selected"] = "" + (Me === Te.highlightedIndex), N.id = g.getItemId(Me), N.role = "option", N), !Ue &&
    (F = {}, F[vr] = ue(Vr, St), F), {
      onMouseMove: ue(pe, ct),
      onMouseDown: ue(ce, pt)
    }, Ae);
  }, [c, g, I, _, T]), L = A(function(B) {
    var N, F = B === void 0 ? {} : B, $ = F.onClick;
    F.onPress;
    var Q = F.refKey, re = Q === void 0 ? "ref" : Q, ee = F.ref, le = Oe(F, sv), se = I.current.state, pe = /* @__PURE__ */ a(function() {
      c({
        type: Zc
      });
    }, "toggleButtonHandleClick");
    return U((N = {}, N[re] = Xe(ee, function(ce) {
      S.current = ce;
    }), N["aria-controls"] = g.menuId, N["aria-expanded"] = se.isOpen, N.id = g.toggleButtonId, N.tabIndex = -1, N), !le.disabled && U({}, {
      onClick: ue($, pe)
    }), le);
  }, [c, I, g]), M = A(function(B, N) {
    var F, $ = B === void 0 ? {} : B, Q = $.onKeyDown, re = $.onChange, ee = $.onInput, le = $.onBlur;
    $.onChangeText;
    var se = $.onClick, pe = $.refKey, ce = pe === void 0 ? "ref" : pe, Se = $.ref, ye = Oe($, lv), Ae = N === void 0 ? {} : N, fe = Ae.suppressRefError,
    xe = fe === void 0 ? !1 : fe;
    k("getInputProps", xe, ce, v);
    var Te = I.current.state, Ne = /* @__PURE__ */ a(function(pt) {
      var qe = ar(pt);
      qe && w[qe] && w[qe](pt);
    }, "inputHandleKeyDown"), Je = /* @__PURE__ */ a(function(pt) {
      c({
        type: Li,
        inputValue: pt.target.value
      });
    }, "inputHandleChange"), Me = /* @__PURE__ */ a(function(pt) {
      if (i != null && i.document && Te.isOpen && !_.isMouseDown) {
        var qe = pt.relatedTarget === null && i.document.activeElement !== i.document.body;
        c({
          type: qn,
          selectItem: !qe
        });
      }
    }, "inputHandleBlur"), Ue = /* @__PURE__ */ a(function() {
      c({
        type: Ni
      });
    }, "inputHandleClick"), vr = "onChange", Vr = {};
    if (!ye.disabled) {
      var ct;
      Vr = (ct = {}, ct[vr] = ue(re, ee, Je), ct.onKeyDown = ue(Q, Ne), ct.onBlur = ue(le, Me), ct.onClick = ue(se, Ue), ct);
    }
    return U((F = {}, F[ce] = Xe(Se, function(St) {
      v.current = St;
    }), F["aria-activedescendant"] = Te.isOpen && Te.highlightedIndex > -1 ? g.getItemId(Te.highlightedIndex) : "", F["aria-autocomplete"] =
    "list", F["aria-controls"] = g.menuId, F["aria-expanded"] = Te.isOpen, F["aria-labelledby"] = ye && ye["aria-label"] ? void 0 : g.labelId,
    F.autoComplete = "off", F.id = g.inputId, F.role = "combobox", F.value = Te.inputValue, F), Vr, ye);
  }, [c, g, i, w, I, _, k]), W = A(function() {
    c({
      type: Jc
    });
  }, [c]), Z = A(function() {
    c({
      type: tp
    });
  }, [c]), G = A(function() {
    c({
      type: ep
    });
  }, [c]), R = A(function(B) {
    c({
      type: rp,
      highlightedIndex: B
    });
  }, [c]), z = A(function(B) {
    c({
      type: Hi,
      selectedItem: B
    });
  }, [c]), H = A(function(B) {
    c({
      type: np,
      inputValue: B
    });
  }, [c]), te = A(function() {
    c({
      type: op
    });
  }, [c]);
  return {
    // prop getters.
    getItemProps: D,
    getLabelProps: O,
    getMenuProps: P,
    getInputProps: M,
    getToggleButtonProps: L,
    // actions.
    toggleMenu: W,
    openMenu: G,
    closeMenu: Z,
    setHighlightedIndex: R,
    setInputValue: H,
    selectItem: z,
    reset: te,
    // state.
    highlightedIndex: d,
    isOpen: p,
    selectedItem: h,
    inputValue: f
  };
}
a(ap, "useCombobox");
var sp = {
  activeIndex: -1,
  selectedItems: []
};
function uc(e, t) {
  return Pt(e, t, sp);
}
a(uc, "getInitialValue");
function cc(e, t) {
  return $e(e, t, sp);
}
a(cc, "getDefaultValue");
function uv(e) {
  var t = uc(e, "activeIndex"), r = uc(e, "selectedItems");
  return {
    activeIndex: t,
    selectedItems: r
  };
}
a(uv, "getInitialState");
function pc(e) {
  if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey)
    return !1;
  var t = e.target;
  return !(t instanceof HTMLInputElement && // if element is a text input
  t.value !== "" && // and we have text in it
  // and cursor is either not at the start or is currently highlighting text.
  (t.selectionStart !== 0 || t.selectionEnd !== 0));
}
a(pc, "isKeyDownOperationPermitted");
function cv(e, t) {
  return e.selectedItems === t.selectedItems && e.activeIndex === t.activeIndex;
}
a(cv, "isStateEqual");
var LM = {
  stateReducer: zn.stateReducer,
  itemToKey: zn.itemToKey,
  environment: zn.environment,
  selectedItems: q.default.array,
  initialSelectedItems: q.default.array,
  defaultSelectedItems: q.default.array,
  getA11yStatusMessage: q.default.func,
  activeIndex: q.default.number,
  initialActiveIndex: q.default.number,
  defaultActiveIndex: q.default.number,
  onActiveIndexChange: q.default.func,
  onSelectedItemsChange: q.default.func,
  keyNavigationNext: q.default.string,
  keyNavigationPrevious: q.default.string
}, pv = {
  itemToKey: Pr.itemToKey,
  stateReducer: Pr.stateReducer,
  environment: Pr.environment,
  keyNavigationNext: "ArrowRight",
  keyNavigationPrevious: "ArrowLeft"
}, dv = Be, Ri = 0, zi = 1, $i = 2, Wi = 3, Ki = 4, Vi = 5, ji = 6, Ui = 7, qi = 8, Gi = 9, Yi = 10, Qi = 11, Xi = 12, fv = /* @__PURE__ */ Object.
freeze({
  __proto__: null,
  SelectedItemClick: Ri,
  SelectedItemKeyDownDelete: zi,
  SelectedItemKeyDownBackspace: $i,
  SelectedItemKeyDownNavigationNext: Wi,
  SelectedItemKeyDownNavigationPrevious: Ki,
  DropdownKeyDownNavigationPrevious: Vi,
  DropdownKeyDownBackspace: ji,
  DropdownClick: Ui,
  FunctionAddSelectedItem: qi,
  FunctionRemoveSelectedItem: Gi,
  FunctionSetSelectedItems: Yi,
  FunctionSetActiveIndex: Qi,
  FunctionReset: Xi
});
function mv(e, t) {
  var r = t.type, n = t.index, i = t.props, o = t.selectedItem, s = e.activeIndex, u = e.selectedItems, c;
  switch (r) {
    case Ri:
      c = {
        activeIndex: n
      };
      break;
    case Ki:
      c = {
        activeIndex: s - 1 < 0 ? 0 : s - 1
      };
      break;
    case Wi:
      c = {
        activeIndex: s + 1 >= u.length ? -1 : s + 1
      };
      break;
    case $i:
    case zi: {
      if (s < 0)
        break;
      var p = s;
      u.length === 1 ? p = -1 : s === u.length - 1 && (p = u.length - 2), c = U({
        selectedItems: [].concat(u.slice(0, s), u.slice(s + 1))
      }, {
        activeIndex: p
      });
      break;
    }
    case Vi:
      c = {
        activeIndex: u.length - 1
      };
      break;
    case ji:
      c = {
        selectedItems: u.slice(0, u.length - 1)
      };
      break;
    case qi:
      c = {
        selectedItems: [].concat(u, [o])
      };
      break;
    case Ui:
      c = {
        activeIndex: -1
      };
      break;
    case Gi: {
      var d = s, h = u.findIndex(function(m) {
        return i.itemToKey(m) === i.itemToKey(o);
      });
      if (h < 0)
        break;
      u.length === 1 ? d = -1 : h === u.length - 1 && (d = u.length - 2), c = {
        selectedItems: [].concat(u.slice(0, h), u.slice(h + 1)),
        activeIndex: d
      };
      break;
    }
    case Yi: {
      var f = t.selectedItems;
      c = {
        selectedItems: f
      };
      break;
    }
    case Qi: {
      var b = t.activeIndex;
      c = {
        activeIndex: b
      };
      break;
    }
    case Xi:
      c = {
        activeIndex: cc(i, "activeIndex"),
        selectedItems: cc(i, "selectedItems")
      };
      break;
    default:
      throw new Error("Reducer called without proper action type.");
  }
  return U({}, e, c);
}
a(mv, "downshiftMultipleSelectionReducer");
var hv = ["refKey", "ref", "onClick", "onKeyDown", "selectedItem", "index"], gv = ["refKey", "ref", "onKeyDown", "onClick", "preventKeyActio\
n"];
lp.stateChangeTypes = fv;
function lp(e) {
  e === void 0 && (e = {}), dv(e, lp);
  var t = U({}, pv, e), r = t.getA11yStatusMessage, n = t.environment, i = t.keyNavigationNext, o = t.keyNavigationPrevious, s = Lc(mv, t, uv,
  cv), u = s[0], c = s[1], p = u.activeIndex, d = u.selectedItems, h = Qn(), f = X(null), b = X();
  b.current = [];
  var m = Yn({
    state: u,
    props: t
  });
  fi(r, u, [p, d], n), V(function() {
    h || (p === -1 && f.current ? f.current.focus() : b.current[p] && b.current[p].focus());
  }, [p]), mi({
    props: t,
    state: u
  });
  var v = di("getDropdownProps"), S = j(function() {
    var w;
    return w = {}, w[o] = function() {
      c({
        type: Ki
      });
    }, w[i] = function() {
      c({
        type: Wi
      });
    }, w.Delete = /* @__PURE__ */ a(function() {
      c({
        type: zi
      });
    }, "Delete"), w.Backspace = /* @__PURE__ */ a(function() {
      c({
        type: $i
      });
    }, "Backspace"), w;
  }, [c, i, o]), C = j(function() {
    var w;
    return w = {}, w[o] = function(O) {
      pc(O) && c({
        type: Vi
      });
    }, w.Backspace = /* @__PURE__ */ a(function(P) {
      pc(P) && c({
        type: ji
      });
    }, "Backspace"), w;
  }, [c, o]), g = A(function(w) {
    var O, P = w === void 0 ? {} : w, D = P.refKey, L = D === void 0 ? "ref" : D, M = P.ref, W = P.onClick, Z = P.onKeyDown, G = P.selectedItem,
    R = P.index, z = Oe(P, hv), H = m.current.state, te = ci(G, R, H.selectedItems, "Pass either item or index to getSelectedItemProps!"), B = te[1],
    N = B > -1 && B === H.activeIndex, F = /* @__PURE__ */ a(function() {
      c({
        type: Ri,
        index: B
      });
    }, "selectedItemHandleClick"), $ = /* @__PURE__ */ a(function(re) {
      var ee = ar(re);
      ee && S[ee] && S[ee](re);
    }, "selectedItemHandleKeyDown");
    return U((O = {}, O[L] = Xe(M, function(Q) {
      Q && b.current.push(Q);
    }), O.tabIndex = N ? 0 : -1, O.onClick = ue(W, F), O.onKeyDown = ue(Z, $), O), z);
  }, [c, m, S]), y = A(function(w, O) {
    var P, D = w === void 0 ? {} : w, L = D.refKey, M = L === void 0 ? "ref" : L, W = D.ref, Z = D.onKeyDown, G = D.onClick, R = D.preventKeyAction,
    z = R === void 0 ? !1 : R, H = Oe(D, gv), te = O === void 0 ? {} : O, B = te.suppressRefError, N = B === void 0 ? !1 : B;
    v("getDropdownProps", N, M, f);
    var F = /* @__PURE__ */ a(function(re) {
      var ee = ar(re);
      ee && C[ee] && C[ee](re);
    }, "dropdownHandleKeyDown"), $ = /* @__PURE__ */ a(function() {
      c({
        type: Ui
      });
    }, "dropdownHandleClick");
    return U((P = {}, P[M] = Xe(W, function(Q) {
      Q && (f.current = Q);
    }), P), !z && {
      onKeyDown: ue(Z, F),
      onClick: ue(G, $)
    }, H);
  }, [c, C, v]), I = A(function(w) {
    c({
      type: qi,
      selectedItem: w
    });
  }, [c]), E = A(function(w) {
    c({
      type: Gi,
      selectedItem: w
    });
  }, [c]), T = A(function(w) {
    c({
      type: Yi,
      selectedItems: w
    });
  }, [c]), _ = A(function(w) {
    c({
      type: Qi,
      activeIndex: w
    });
  }, [c]), k = A(function() {
    c({
      type: Xi
    });
  }, [c]);
  return {
    getSelectedItemProps: g,
    getDropdownProps: y,
    addSelectedItem: I,
    removeSelectedItem: E,
    setSelectedItems: T,
    setActiveIndex: _,
    reset: k,
    selectedItems: d,
    activeIndex: p
  };
}
a(lp, "useMultipleSelection");

// src/manager/components/sidebar/Search.tsx
var $p = Fe(up(), 1);

// src/manager/components/sidebar/types.ts
function Dr(e) {
  return !!(e && e.showAll);
}
a(Dr, "isExpandType");
function Ji(e) {
  return !!(e && e.item);
}
a(Ji, "isSearchResult");

// src/manager/hooks/useDebounce.ts
function cp(e, t) {
  let [r, n] = J(e);
  return V(() => {
    let i = setTimeout(() => {
      n(e);
    }, t);
    return () => {
      clearTimeout(i);
    };
  }, [e, t]), r;
}
a(cp, "useDebounce");

// src/manager/components/sidebar/FileSearchModal.utils.tsx
function pp(e) {
  return Object.keys(e).reduce(
    (r, n) => {
      let i = e[n];
      if (typeof i.control == "object" && "type" in i.control)
        switch (i.control.type) {
          case "object":
            r[n] = {};
            break;
          case "inline-radio":
          case "radio":
          case "inline-check":
          case "check":
          case "select":
          case "multi-select":
            r[n] = i.control.options?.[0];
            break;
          case "color":
            r[n] = "#000000";
            break;
          default:
            break;
        }
      return Xn(i.type, r, n), r;
    },
    {}
  );
}
a(pp, "extractSeededRequiredArgs");
function Xn(e, t, r) {
  if (!(typeof e == "string" || !e.required))
    switch (e.name) {
      case "boolean":
        t[r] = !0;
        break;
      case "number":
        t[r] = 0;
        break;
      case "string":
        t[r] = r;
        break;
      case "array":
        t[r] = [];
        break;
      case "object":
        t[r] = {}, Object.entries(e.value ?? {}).forEach(([n, i]) => {
          Xn(i, t[r], n);
        });
        break;
      case "function":
        t[r] = () => {
        };
        break;
      case "intersection":
        e.value?.every((n) => n.name === "object") && (t[r] = {}, e.value?.forEach((n) => {
          n.name === "object" && Object.entries(n.value ?? {}).forEach(([i, o]) => {
            Xn(o, t[r], i);
          });
        }));
        break;
      case "union":
        e.value?.[0] !== void 0 && Xn(e.value[0], t, r);
        break;
      case "enum":
        e.value?.[0] !== void 0 && (t[r] = e.value?.[0]);
        break;
      case "other":
        typeof e.value == "string" && e.value === "tuple" && (t[r] = []);
        break;
      default:
        break;
    }
}
a(Xn, "setArgType");
async function Zn(e, t, r = 1) {
  if (r > 10)
    throw new Error("We could not select the new story. Please try again.");
  try {
    await e(t);
  } catch {
    return await new Promise((i) => setTimeout(i, 500)), Zn(e, t, r + 1);
  }
}
a(Zn, "trySelectNewStory");

// src/manager/components/sidebar/FileList.tsx
var dp = x("div")(({ theme: e }) => ({
  marginTop: "-16px",
  // after element which fades out the list
  "&::after": {
    content: '""',
    position: "fixed",
    pointerEvents: "none",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80px",
    background: `linear-gradient(${qo(e.barBg, 0)} 10%, ${e.barBg} 80%)`
  }
})), Jn = x("div")(({ theme: e }) => ({
  height: "280px",
  overflow: "auto",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  position: "relative",
  "::-webkit-scrollbar": {
    display: "none"
  }
})), fp = x("li")(({ theme: e }) => ({
  ":focus-visible": {
    outline: "none",
    ".file-list-item": {
      borderRadius: "4px",
      background: e.base === "dark" ? "rgba(255,255,255,.1)" : e.color.mediumlight,
      "> svg": {
        display: "flex"
      }
    }
  }
})), eo = x("div")(({ theme: e }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative"
})), mp = x.div(({ theme: e, selected: t, disabled: r, error: n }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  alignSelf: "stretch",
  padding: "8px 16px",
  cursor: "pointer",
  borderRadius: "4px",
  ...t && {
    borderRadius: "4px",
    background: e.base === "dark" ? "rgba(255,255,255,.1)" : e.color.mediumlight,
    "> svg": {
      display: "flex"
    }
  },
  ...r && {
    cursor: "not-allowed",
    div: {
      color: `${e.color.mediumdark} !important`
    }
  },
  ...n && {
    background: e.base === "light" ? "#00000011" : "#00000033"
  },
  "&:hover": {
    background: n ? "#00000022" : e.base === "dark" ? "rgba(255,255,255,.1)" : e.color.mediumlight,
    "> svg": {
      display: "flex"
    }
  }
})), hp = x("ul")({
  margin: 0,
  padding: "0 0 0 0",
  width: "100%",
  position: "relative"
}), gp = x("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "calc(100% - 50px)"
}), yp = x("div")(({ theme: e, error: t }) => ({
  color: t ? e.color.negativeText : e.color.secondary
})), vp = x("div")(({ theme: e, error: t }) => ({
  color: t ? e.color.negativeText : e.base === "dark" ? e.color.lighter : e.color.darkest,
  fontSize: "14px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: "100%"
})), bp = x("div")(({ theme: e }) => ({
  color: e.color.mediumdark,
  fontSize: "14px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: "100%"
})), Ip = x("ul")(({ theme: e }) => ({
  margin: 0,
  padding: 0
})), Sp = x("li")(({ theme: e, error: t }) => ({
  padding: "8px 16px 8px 16px",
  marginLeft: "30px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "14px",
  cursor: "pointer",
  borderRadius: "4px",
  ":focus-visible": {
    outline: "none"
  },
  ...t && {
    background: "#F9ECEC",
    color: e.color.negativeText
  },
  "&:hover,:focus-visible": {
    background: t ? "#F9ECEC" : e.base === "dark" ? "rgba(255, 255, 255, 0.1)" : e.color.mediumlight,
    "> svg": {
      display: "flex"
    }
  },
  "> div > svg": {
    color: t ? e.color.negativeText : e.color.secondary
  }
})), xp = x("div")(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "calc(100% - 20px)"
})), wp = x("span")(({ theme: e }) => ({
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: "calc(100% - 160px)",
  display: "inline-block"
})), Ep = x("span")(({ theme: e }) => ({
  display: "inline-block",
  padding: `1px ${e.appBorderRadius}px`,
  borderRadius: "2px",
  fontSize: "10px",
  color: e.base === "dark" ? e.color.lightest : "#727272",
  backgroundColor: e.base === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F2F4F5"
})), Cp = x("div")(({ theme: e }) => ({
  textAlign: "center",
  maxWidth: "334px",
  margin: "16px auto 50px auto",
  fontSize: "14px",
  color: e.base === "dark" ? e.color.lightest : "#000"
})), Tp = x("p")(({ theme: e }) => ({
  margin: 0,
  color: e.base === "dark" ? e.color.defaultText : e.color.mediumdark
}));

// src/manager/components/sidebar/FileSearchListSkeleton.tsx
var yv = x("div")(({ theme: e }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  alignSelf: "stretch",
  padding: "8px 16px"
})), vv = x("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
  borderRadius: "3px"
}), bv = x.div(({ theme: e }) => ({
  width: "14px",
  height: "14px",
  borderRadius: "3px",
  marginTop: "1px",
  background: e.base === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)",
  animation: `${e.animation.glow} 1.5s ease-in-out infinite`
})), _p = x.div(({ theme: e }) => ({
  height: "16px",
  borderRadius: "3px",
  background: e.base === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)",
  animation: `${e.animation.glow} 1.5s ease-in-out infinite`,
  width: "100%",
  maxWidth: "100%",
  "+ div": {
    marginTop: "6px"
  }
})), kp = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(Jn, null, [1, 2, 3].map((e) => /* @__PURE__ */ l.createElement(eo, { key: e },
/* @__PURE__ */ l.createElement(yv, null, /* @__PURE__ */ l.createElement(bv, null), /* @__PURE__ */ l.createElement(vv, null, /* @__PURE__ */ l.
createElement(_p, { style: { width: "90px" } }), /* @__PURE__ */ l.createElement(_p, { style: { width: "300px" } })))))), "FileSearchListLoa\
dingSkeleton");

// global-externals:react-dom
var Lr = __REACT_DOM__, { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: JM, createPortal: eD, createRoot: tD, findDOMNode: rD, flushSync: Nr,
hydrate: nD, hydrateRoot: oD, render: iD, unmountComponentAtNode: aD, unstable_batchedUpdates: sD, unstable_renderSubtreeIntoContainer: lD, version: uD } = __REACT_DOM__;

// ../node_modules/@tanstack/virtual-core/dist/esm/utils.js
function Dt(e, t, r) {
  let n = r.initialDeps ?? [], i;
  return () => {
    var o, s, u, c;
    let p;
    r.key && ((o = r.debug) != null && o.call(r)) && (p = Date.now());
    let d = e();
    if (!(d.length !== n.length || d.some((b, m) => n[m] !== b)))
      return i;
    n = d;
    let f;
    if (r.key && ((s = r.debug) != null && s.call(r)) && (f = Date.now()), i = t(...d), r.key && ((u = r.debug) != null && u.call(r))) {
      let b = Math.round((Date.now() - p) * 100) / 100, m = Math.round((Date.now() - f) * 100) / 100, v = m / 16, S = /* @__PURE__ */ a((C, g) => {
        for (C = String(C); C.length < g; )
          C = " " + C;
        return C;
      }, "pad");
      console.info(
        `%c\u23F1 ${S(m, 5)} /${S(b, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * v, 120)
        )}deg 100% 31%);`,
        r?.key
      );
    }
    return (c = r?.onChange) == null || c.call(r, i), i;
  };
}
a(Dt, "memo");
function to(e, t) {
  if (e === void 0)
    throw new Error(`Unexpected undefined${t ? `: ${t}` : ""}`);
  return e;
}
a(to, "notUndefined");
var Op = /* @__PURE__ */ a((e, t) => Math.abs(e - t) < 1, "approxEqual");

// ../node_modules/@tanstack/virtual-core/dist/esm/index.js
var Iv = /* @__PURE__ */ a((e) => e, "defaultKeyExtractor"), Sv = /* @__PURE__ */ a((e) => {
  let t = Math.max(e.startIndex - e.overscan, 0), r = Math.min(e.endIndex + e.overscan, e.count - 1), n = [];
  for (let i = t; i <= r; i++)
    n.push(i);
  return n;
}, "defaultRangeExtractor"), Pp = /* @__PURE__ */ a((e, t) => {
  let r = e.scrollElement;
  if (!r)
    return;
  let n = /* @__PURE__ */ a((o) => {
    let { width: s, height: u } = o;
    t({ width: Math.round(s), height: Math.round(u) });
  }, "handler");
  if (n(r.getBoundingClientRect()), typeof ResizeObserver > "u")
    return () => {
    };
  let i = new ResizeObserver((o) => {
    let s = o[0];
    if (s?.borderBoxSize) {
      let u = s.borderBoxSize[0];
      if (u) {
        n({ width: u.inlineSize, height: u.blockSize });
        return;
      }
    }
    n(r.getBoundingClientRect());
  });
  return i.observe(r, { box: "border-box" }), () => {
    i.unobserve(r);
  };
}, "observeElementRect");
var Ap = /* @__PURE__ */ a((e, t) => {
  let r = e.scrollElement;
  if (!r)
    return;
  let n = /* @__PURE__ */ a(() => {
    t(r[e.options.horizontal ? "scrollLeft" : "scrollTop"]);
  }, "handler");
  return n(), r.addEventListener("scroll", n, {
    passive: !0
  }), () => {
    r.removeEventListener("scroll", n);
  };
}, "observeElementOffset");
var xv = /* @__PURE__ */ a((e, t, r) => {
  if (t?.borderBoxSize) {
    let n = t.borderBoxSize[0];
    if (n)
      return Math.round(
        n[r.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  return Math.round(
    e.getBoundingClientRect()[r.options.horizontal ? "width" : "height"]
  );
}, "measureElement");
var Mp = /* @__PURE__ */ a((e, {
  adjustments: t = 0,
  behavior: r
}, n) => {
  var i, o;
  let s = e + t;
  (o = (i = n.scrollElement) == null ? void 0 : i.scrollTo) == null || o.call(i, {
    [n.options.horizontal ? "left" : "top"]: s,
    behavior: r
  });
}, "elementScroll"), ea = class ea {
  constructor(t) {
    this.unsubs = [], this.scrollElement = null, this.isScrolling = !1, this.isScrollingTimeoutId = null, this.scrollToIndexTimeoutId = null,
    this.measurementsCache = [], this.itemSizeCache = /* @__PURE__ */ new Map(), this.pendingMeasuredCacheIndexes = [], this.scrollDirection =
    null, this.scrollAdjustments = 0, this.measureElementCache = /* @__PURE__ */ new Map(), this.observer = /* @__PURE__ */ (() => {
      let r = null, n = /* @__PURE__ */ a(() => r || (typeof ResizeObserver < "u" ? r = new ResizeObserver((i) => {
        i.forEach((o) => {
          this._measureElement(o.target, o);
        });
      }) : null), "get");
      return {
        disconnect: /* @__PURE__ */ a(() => {
          var i;
          return (i = n()) == null ? void 0 : i.disconnect();
        }, "disconnect"),
        observe: /* @__PURE__ */ a((i) => {
          var o;
          return (o = n()) == null ? void 0 : o.observe(i, { box: "border-box" });
        }, "observe"),
        unobserve: /* @__PURE__ */ a((i) => {
          var o;
          return (o = n()) == null ? void 0 : o.unobserve(i);
        }, "unobserve")
      };
    })(), this.range = null, this.setOptions = (r) => {
      Object.entries(r).forEach(([n, i]) => {
        typeof i > "u" && delete r[n];
      }), this.options = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: Iv,
        rangeExtractor: Sv,
        onChange: /* @__PURE__ */ a(() => {
        }, "onChange"),
        measureElement: xv,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        scrollingDelay: 150,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        ...r
      };
    }, this.notify = (r) => {
      var n, i;
      (i = (n = this.options).onChange) == null || i.call(n, this, r);
    }, this.maybeNotify = Dt(
      () => (this.calculateRange(), [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]),
      (r) => {
        this.notify(r);
      },
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug"),
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    ), this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((r) => r()), this.unsubs = [], this.scrollElement = null;
    }, this._didMount = () => (this.measureElementCache.forEach(this.observer.observe), () => {
      this.observer.disconnect(), this.cleanup();
    }), this._willUpdate = () => {
      let r = this.options.getScrollElement();
      this.scrollElement !== r && (this.cleanup(), this.scrollElement = r, this._scrollToOffset(this.scrollOffset, {
        adjustments: void 0,
        behavior: void 0
      }), this.unsubs.push(
        this.options.observeElementRect(this, (n) => {
          this.scrollRect = n, this.maybeNotify();
        })
      ), this.unsubs.push(
        this.options.observeElementOffset(this, (n) => {
          this.scrollAdjustments = 0, this.scrollOffset !== n && (this.isScrollingTimeoutId !== null && (clearTimeout(this.isScrollingTimeoutId),
          this.isScrollingTimeoutId = null), this.isScrolling = !0, this.scrollDirection = this.scrollOffset < n ? "forward" : "backward", this.
          scrollOffset = n, this.maybeNotify(), this.isScrollingTimeoutId = setTimeout(() => {
            this.isScrollingTimeoutId = null, this.isScrolling = !1, this.scrollDirection = null, this.maybeNotify();
          }, this.options.scrollingDelay));
        })
      ));
    }, this.getSize = () => this.scrollRect[this.options.horizontal ? "width" : "height"], this.memoOptions = Dt(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey
      ],
      (r, n, i, o) => (this.pendingMeasuredCacheIndexes = [], {
        count: r,
        paddingStart: n,
        scrollMargin: i,
        getItemKey: o
      }),
      {
        key: !1
      }
    ), this.getFurthestMeasurement = (r, n) => {
      let i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
      for (let s = n - 1; s >= 0; s--) {
        let u = r[s];
        if (i.has(u.lane))
          continue;
        let c = o.get(
          u.lane
        );
        if (c == null || u.end > c.end ? o.set(u.lane, u) : u.end < c.end && i.set(u.lane, !0), i.size === this.options.lanes)
          break;
      }
      return o.size === this.options.lanes ? Array.from(o.values()).sort((s, u) => s.end === u.end ? s.index - u.index : s.end - u.end)[0] :
      void 0;
    }, this.getMeasurements = Dt(
      () => [this.memoOptions(), this.itemSizeCache],
      ({ count: r, paddingStart: n, scrollMargin: i, getItemKey: o }, s) => {
        let u = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        let c = this.measurementsCache.slice(0, u);
        for (let p = u; p < r; p++) {
          let d = o(p), h = this.options.lanes === 1 ? c[p - 1] : this.getFurthestMeasurement(c, p), f = h ? h.end + this.options.gap : n + i,
          b = s.get(d), m = typeof b == "number" ? b : this.options.estimateSize(p), v = f + m, S = h ? h.lane : p % this.options.lanes;
          c[p] = {
            index: p,
            start: f,
            size: m,
            end: v,
            key: d,
            lane: S
          };
        }
        return this.measurementsCache = c, c;
      },
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.calculateRange = Dt(
      () => [this.getMeasurements(), this.getSize(), this.scrollOffset],
      (r, n, i) => this.range = r.length > 0 && n > 0 ? wv({
        measurements: r,
        outerSize: n,
        scrollOffset: i
      }) : null,
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.getIndexes = Dt(
      () => [
        this.options.rangeExtractor,
        this.calculateRange(),
        this.options.overscan,
        this.options.count
      ],
      (r, n, i, o) => n === null ? [] : r({
        ...n,
        overscan: i,
        count: o
      }),
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.indexFromElement = (r) => {
      let n = this.options.indexAttribute, i = r.getAttribute(n);
      return i ? parseInt(i, 10) : (console.warn(
        `Missing attribute name '${n}={index}' on measured element.`
      ), -1);
    }, this._measureElement = (r, n) => {
      let i = this.measurementsCache[this.indexFromElement(r)];
      if (!i || !r.isConnected) {
        this.measureElementCache.forEach((u, c) => {
          u === r && (this.observer.unobserve(r), this.measureElementCache.delete(c));
        });
        return;
      }
      let o = this.measureElementCache.get(i.key);
      o !== r && (o && this.observer.unobserve(o), this.observer.observe(r), this.measureElementCache.set(i.key, r));
      let s = this.options.measureElement(r, n, this);
      this.resizeItem(i, s);
    }, this.resizeItem = (r, n) => {
      let i = this.itemSizeCache.get(r.key) ?? r.size, o = n - i;
      o !== 0 && ((this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(r, o, this) :
      r.start < this.scrollOffset + this.scrollAdjustments) && this._scrollToOffset(this.scrollOffset, {
        adjustments: this.scrollAdjustments += o,
        behavior: void 0
      }), this.pendingMeasuredCacheIndexes.push(r.index), this.itemSizeCache = new Map(this.itemSizeCache.set(r.key, n)), this.notify(!1));
    }, this.measureElement = (r) => {
      r && this._measureElement(r, void 0);
    }, this.getVirtualItems = Dt(
      () => [this.getIndexes(), this.getMeasurements()],
      (r, n) => {
        let i = [];
        for (let o = 0, s = r.length; o < s; o++) {
          let u = r[o], c = n[u];
          i.push(c);
        }
        return i;
      },
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.getVirtualItemForOffset = (r) => {
      let n = this.getMeasurements();
      return to(
        n[Dp(
          0,
          n.length - 1,
          (i) => to(n[i]).start,
          r
        )]
      );
    }, this.getOffsetForAlignment = (r, n) => {
      let i = this.getSize();
      n === "auto" && (r <= this.scrollOffset ? n = "start" : r >= this.scrollOffset + i ? n = "end" : n = "start"), n === "start" ? r = r :
      n === "end" ? r = r - i : n === "center" && (r = r - i / 2);
      let o = this.options.horizontal ? "scrollWidth" : "scrollHeight", u = (this.scrollElement ? "document" in this.scrollElement ? this.scrollElement.
      document.documentElement[o] : this.scrollElement[o] : 0) - this.getSize();
      return Math.max(Math.min(u, r), 0);
    }, this.getOffsetForIndex = (r, n = "auto") => {
      r = Math.max(0, Math.min(r, this.options.count - 1));
      let i = to(this.getMeasurements()[r]);
      if (n === "auto")
        if (i.end >= this.scrollOffset + this.getSize() - this.options.scrollPaddingEnd)
          n = "end";
        else if (i.start <= this.scrollOffset + this.options.scrollPaddingStart)
          n = "start";
        else
          return [this.scrollOffset, n];
      let o = n === "end" ? i.end + this.options.scrollPaddingEnd : i.start - this.options.scrollPaddingStart;
      return [this.getOffsetForAlignment(o, n), n];
    }, this.isDynamicMode = () => this.measureElementCache.size > 0, this.cancelScrollToIndex = () => {
      this.scrollToIndexTimeoutId !== null && (clearTimeout(this.scrollToIndexTimeoutId), this.scrollToIndexTimeoutId = null);
    }, this.scrollToOffset = (r, { align: n = "start", behavior: i } = {}) => {
      this.cancelScrollToIndex(), i === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), this._scrollToOffset(this.getOffsetForAlignment(r, n), {
        adjustments: void 0,
        behavior: i
      });
    }, this.scrollToIndex = (r, { align: n = "auto", behavior: i } = {}) => {
      r = Math.max(0, Math.min(r, this.options.count - 1)), this.cancelScrollToIndex(), i === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      );
      let [o, s] = this.getOffsetForIndex(r, n);
      this._scrollToOffset(o, { adjustments: void 0, behavior: i }), i !== "smooth" && this.isDynamicMode() && (this.scrollToIndexTimeoutId =
      setTimeout(() => {
        if (this.scrollToIndexTimeoutId = null, this.measureElementCache.has(
          this.options.getItemKey(r)
        )) {
          let [c] = this.getOffsetForIndex(r, s);
          Op(c, this.scrollOffset) || this.scrollToIndex(r, { align: s, behavior: i });
        } else
          this.scrollToIndex(r, { align: s, behavior: i });
      }));
    }, this.scrollBy = (r, { behavior: n } = {}) => {
      this.cancelScrollToIndex(), n === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), this._scrollToOffset(this.scrollOffset + r, {
        adjustments: void 0,
        behavior: n
      });
    }, this.getTotalSize = () => {
      var r;
      let n = this.getMeasurements(), i;
      return n.length === 0 ? i = this.options.paddingStart : i = this.options.lanes === 1 ? ((r = n[n.length - 1]) == null ? void 0 : r.end) ??
      0 : Math.max(
        ...n.slice(-this.options.lanes).map((o) => o.end)
      ), i - this.options.scrollMargin + this.options.paddingEnd;
    }, this._scrollToOffset = (r, {
      adjustments: n,
      behavior: i
    }) => {
      this.options.scrollToFn(r, { behavior: i, adjustments: n }, this);
    }, this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map(), this.notify(!1);
    }, this.setOptions(t), this.scrollRect = this.options.initialRect, this.scrollOffset = typeof this.options.initialOffset == "function" ?
    this.options.initialOffset() : this.options.initialOffset, this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.
    forEach((r) => {
      this.itemSizeCache.set(r.key, r.size);
    }), this.maybeNotify();
  }
};
a(ea, "Virtualizer");
var ro = ea, Dp = /* @__PURE__ */ a((e, t, r, n) => {
  for (; e <= t; ) {
    let i = (e + t) / 2 | 0, o = r(i);
    if (o < n)
      e = i + 1;
    else if (o > n)
      t = i - 1;
    else
      return i;
  }
  return e > 0 ? e - 1 : 0;
}, "findNearestBinarySearch");
function wv({
  measurements: e,
  outerSize: t,
  scrollOffset: r
}) {
  let n = e.length - 1, o = Dp(0, n, /* @__PURE__ */ a((u) => e[u].start, "getOffset"), r), s = o;
  for (; s < n && e[s].end < r + t; )
    s++;
  return { startIndex: o, endIndex: s };
}
a(wv, "calculateRange");

// ../node_modules/@tanstack/react-virtual/dist/esm/index.js
var Ev = typeof document < "u" ? Wt : V;
function Cv(e) {
  let t = Kt(() => ({}), {})[1], r = {
    ...e,
    onChange: /* @__PURE__ */ a((i, o) => {
      var s;
      o ? Nr(t) : t(), (s = e.onChange) == null || s.call(e, i, o);
    }, "onChange")
  }, [n] = J(
    () => new ro(r)
  );
  return n.setOptions(r), V(() => n._didMount(), []), Ev(() => n._willUpdate()), n;
}
a(Cv, "useVirtualizerBase");
function Lp(e) {
  return Cv({
    observeElementRect: Pp,
    observeElementOffset: Ap,
    scrollToFn: Mp,
    ...e
  });
}
a(Lp, "useVirtualizer");

// src/manager/components/sidebar/FIleSearchList.utils.tsx
var Np = /* @__PURE__ */ a(({
  parentRef: e,
  rowVirtualizer: t,
  selectedItem: r
}) => {
  V(() => {
    let n = /* @__PURE__ */ a((i) => {
      if (!e.current)
        return;
      let o = t.options.count, s = document.activeElement, u = parseInt(s.getAttribute("data-index") || "-1", 10), c = s.tagName === "INPUT",
      p = /* @__PURE__ */ a(() => document.querySelector('[data-index="0"]'), "getFirstElement"), d = /* @__PURE__ */ a(() => document.querySelector(
      `[data-index="${o - 1}"]`), "getLastElement");
      if (i.code === "ArrowDown" && s) {
        if (i.stopPropagation(), c) {
          p()?.focus();
          return;
        }
        if (u === o - 1) {
          Nr(() => {
            t.scrollToIndex(0, { align: "start" });
          }), setTimeout(() => {
            p()?.focus();
          }, 100);
          return;
        }
        if (r === u) {
          document.querySelector(
            `[data-index-position="${r}_first"]`
          )?.focus();
          return;
        }
        if (r !== null && s.getAttribute("data-index-position")?.includes("last")) {
          document.querySelector(
            `[data-index="${r + 1}"]`
          )?.focus();
          return;
        }
        s.nextElementSibling?.focus();
      }
      if (i.code === "ArrowUp" && s) {
        if (c) {
          Nr(() => {
            t.scrollToIndex(o - 1, { align: "start" });
          }), setTimeout(() => {
            d()?.focus();
          }, 100);
          return;
        }
        if (r !== null && s.getAttribute("data-index-position")?.includes("first")) {
          document.querySelector(
            `[data-index="${r}"]`
          )?.focus();
          return;
        }
        s.previousElementSibling?.focus();
      }
    }, "handleArrowKeys");
    return document.addEventListener("keydown", n, { capture: !0 }), () => {
      document.removeEventListener("keydown", n, { capture: !0 });
    };
  }, [t, r, e]);
}, "useArrowKeyNavigation");

// src/manager/components/sidebar/FileSearchList.tsx
var Fp = x(sl)(({ theme: e }) => ({
  display: "none",
  alignSelf: "center",
  color: e.color.mediumdark
})), Tv = x(Jt)(({ theme: e }) => ({
  display: "none",
  alignSelf: "center",
  color: e.color.mediumdark
})), Hp = Ir(/* @__PURE__ */ a(function({
  isLoading: t,
  searchResults: r,
  onNewStory: n,
  errorItemId: i
}) {
  let [o, s] = J(null), u = l.useRef(), c = j(() => [...r ?? []].sort((m, v) => {
    let S = m.exportedComponents === null || m.exportedComponents?.length === 0, C = m.storyFileExists, g = v.exportedComponents === null ||
    v.exportedComponents?.length === 0, y = v.storyFileExists;
    return C && !y ? -1 : y && !C || S && !g ? 1 : !S && g ? -1 : 0;
  }), [r]), p = r?.length || 0, d = Lp({
    count: p,
    // @ts-expect-error (non strict)
    getScrollElement: /* @__PURE__ */ a(() => u.current, "getScrollElement"),
    paddingStart: 16,
    paddingEnd: 40,
    estimateSize: /* @__PURE__ */ a(() => 54, "estimateSize"),
    overscan: 2
  });
  Np({ rowVirtualizer: d, parentRef: u, selectedItem: o });
  let h = A(
    ({ virtualItem: m, searchResult: v, itemId: S }) => {
      v?.exportedComponents?.length > 1 ? s((C) => C === m.index ? null : m.index) : v?.exportedComponents?.length === 1 && n({
        componentExportName: v.exportedComponents[0].name,
        componentFilePath: v.filepath,
        componentIsDefaultExport: v.exportedComponents[0].default,
        selectedItemId: S,
        componentExportCount: 1
      });
    },
    [n]
  ), f = A(
    ({ searchResult: m, component: v, id: S }) => {
      n({
        componentExportName: v.name,
        componentFilePath: m.filepath,
        componentIsDefaultExport: v.default,
        selectedItemId: S,
        // @ts-expect-error (non strict)
        componentExportCount: m.exportedComponents.length
      });
    },
    [n]
  ), b = A(
    ({ virtualItem: m, selected: v, searchResult: S }) => {
      let C = i === S.filepath, g = v === m.index;
      return /* @__PURE__ */ l.createElement(
        eo,
        {
          "aria-expanded": g,
          "aria-controls": `file-list-export-${m.index}`,
          id: `file-list-item-wrapper-${m.index}`
        },
        /* @__PURE__ */ l.createElement(
          mp,
          {
            className: "file-list-item",
            selected: g,
            error: C,
            disabled: S.exportedComponents === null || S.exportedComponents?.length === 0
          },
          /* @__PURE__ */ l.createElement(yp, { error: C }, /* @__PURE__ */ l.createElement(Yo, null)),
          /* @__PURE__ */ l.createElement(gp, null, /* @__PURE__ */ l.createElement(vp, { error: C }, S.filepath.split("/").at(-1)), /* @__PURE__ */ l.
          createElement(bp, null, S.filepath)),
          g ? /* @__PURE__ */ l.createElement(Tv, null) : /* @__PURE__ */ l.createElement(Fp, null)
        ),
        S?.exportedComponents?.length > 1 && g && /* @__PURE__ */ l.createElement(
          Ip,
          {
            role: "region",
            id: `file-list-export-${m.index}`,
            "aria-labelledby": `file-list-item-wrapper-${m.index}`,
            onClick: (y) => {
              y.stopPropagation();
            },
            onKeyUp: (y) => {
              y.key === "Enter" && y.stopPropagation();
            }
          },
          S.exportedComponents?.map((y, I) => {
            let E = i === `${S.filepath}_${I}`, T = I === 0 ? "first" : (
              // @ts-expect-error (non strict)
              I === S.exportedComponents.length - 1 ? "last" : "middle"
            );
            return /* @__PURE__ */ l.createElement(
              Sp,
              {
                tabIndex: 0,
                "data-index-position": `${m.index}_${T}`,
                key: y.name,
                error: E,
                onClick: () => {
                  f({
                    searchResult: S,
                    component: y,
                    id: `${S.filepath}_${I}`
                  });
                },
                onKeyUp: (_) => {
                  _.key === "Enter" && f({
                    searchResult: S,
                    component: y,
                    id: `${S.filepath}_${I}`
                  });
                }
              },
              /* @__PURE__ */ l.createElement(xp, null, /* @__PURE__ */ l.createElement(Yo, null), y.default ? /* @__PURE__ */ l.createElement(
              l.Fragment, null, /* @__PURE__ */ l.createElement(wp, null, S.filepath.split("/").at(-1)?.split(".")?.at(0)), /* @__PURE__ */ l.
              createElement(Ep, null, "Default export")) : y.name),
              /* @__PURE__ */ l.createElement(Fp, null)
            );
          })
        )
      );
    },
    [f, i]
  );
  return t && (r === null || r?.length === 0) ? /* @__PURE__ */ l.createElement(kp, null) : r?.length === 0 ? /* @__PURE__ */ l.createElement(
  Cp, null, /* @__PURE__ */ l.createElement("p", null, "We could not find any file with that name"), /* @__PURE__ */ l.createElement(Tp, null,
  "You may want to try using different keywords, check for typos, and adjust your filters")) : c?.length > 0 ? /* @__PURE__ */ l.createElement(
  dp, null, /* @__PURE__ */ l.createElement(Jn, { ref: u }, /* @__PURE__ */ l.createElement(
    hp,
    {
      style: {
        height: `${d.getTotalSize()}px`
      }
    },
    d.getVirtualItems().map((m) => {
      let v = c[m.index], S = v.exportedComponents === null || v.exportedComponents?.length === 0, C = {};
      return /* @__PURE__ */ l.createElement(
        fp,
        {
          key: m.key,
          "data-index": m.index,
          ref: d.measureElement,
          onClick: () => {
            h({
              virtualItem: m,
              itemId: v.filepath,
              searchResult: v
            });
          },
          onKeyUp: (g) => {
            g.key === "Enter" && h({
              virtualItem: m,
              itemId: v.filepath,
              searchResult: v
            });
          },
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${m.start}px)`
          },
          tabIndex: 0
        },
        S ? /* @__PURE__ */ l.createElement(
          ze,
          {
            ...C,
            style: { width: "100%" },
            hasChrome: !1,
            closeOnOutsideClick: !0,
            tooltip: /* @__PURE__ */ l.createElement(
              un,
              {
                note: S ? "We can't evaluate exports for this file. You can't create a story for it automatically" : null
              }
            )
          },
          /* @__PURE__ */ l.createElement(
            b,
            {
              searchResult: v,
              selected: o,
              virtualItem: m
            }
          )
        ) : /* @__PURE__ */ l.createElement(
          b,
          {
            ...C,
            key: m.index,
            searchResult: v,
            selected: o,
            virtualItem: m
          }
        )
      );
    })
  ))) : null;
}, "FileSearchList"));

// src/manager/hooks/useMeasure.tsx
function Bp() {
  let [e, t] = l.useState({
    width: null,
    height: null
  }), r = l.useRef(null);
  return [l.useCallback((i) => {
    if (r.current && (r.current.disconnect(), r.current = null), i?.nodeType === Node.ELEMENT_NODE) {
      let o = new ResizeObserver(([s]) => {
        if (s && s.borderBoxSize) {
          let { inlineSize: u, blockSize: c } = s.borderBoxSize[0];
          t({ width: u, height: c });
        }
      });
      o.observe(i), r.current = o;
    }
  }, []), e];
}
a(Bp, "useMeasure");

// src/manager/components/sidebar/FileSearchModal.tsx
var _v = 418, kv = x(Et)(() => ({
  boxShadow: "none",
  background: "transparent"
})), Ov = x.div(({ theme: e, height: t }) => ({
  backgroundColor: e.background.bar,
  borderRadius: 6,
  boxShadow: "rgba(255, 255, 255, 0.05) 0 0 0 1px inset, rgba(14, 18, 22, 0.35) 0px 10px 18px -10px",
  padding: "16px",
  transition: "height 0.3s",
  height: t ? `${t + 32}px` : "auto",
  overflow: "hidden"
})), Pv = x(Et.Content)(({ theme: e }) => ({
  margin: 0,
  color: e.base === "dark" ? e.color.lighter : e.color.mediumdark
})), Av = x(rn.Input)(({ theme: e }) => ({
  paddingLeft: 40,
  paddingRight: 28,
  fontSize: 14,
  height: 40,
  ...e.base === "light" && {
    color: e.color.darkest
  },
  "::placeholder": {
    color: e.color.mediumdark
  },
  "&:invalid:not(:placeholder-shown)": {
    boxShadow: `${e.color.negative} 0 0 0 1px inset`
  },
  "&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration": {
    display: "none"
  }
})), Mv = x.div({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  position: "relative"
}), Dv = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  left: 16,
  zIndex: 1,
  pointerEvents: "none",
  color: e.darkest,
  display: "flex",
  alignItems: "center",
  height: "100%"
})), Lv = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  right: 16,
  zIndex: 1,
  color: e.darkest,
  display: "flex",
  alignItems: "center",
  height: "100%",
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" }
  },
  animation: "spin 1s linear infinite"
})), Nv = x(Et.Error)({
  position: "absolute",
  padding: "8px 40px 8px 16px",
  bottom: 0,
  maxHeight: "initial",
  width: "100%",
  div: {
    wordBreak: "break-word"
  },
  "> div": {
    padding: 0
  }
}), Fv = x(mn)({
  position: "absolute",
  top: 4,
  right: -24,
  cursor: "pointer"
}), Rp = /* @__PURE__ */ a(({
  open: e,
  onOpenChange: t,
  fileSearchQuery: r,
  setFileSearchQuery: n,
  isLoading: i,
  error: o,
  searchResults: s,
  onCreateNewStory: u,
  setError: c,
  container: p
}) => {
  let [d, h] = Bp(), [f, b] = J(h.height), [, m] = ps(), [v, S] = J(r);
  return V(() => {
    f < h.height && b(h.height);
  }, [h.height, f]), /* @__PURE__ */ l.createElement(
    kv,
    {
      height: _v,
      width: 440,
      open: e,
      onOpenChange: t,
      onEscapeKeyDown: () => {
        t(!1);
      },
      onInteractOutside: () => {
        t(!1);
      },
      container: p
    },
    /* @__PURE__ */ l.createElement(Ov, { height: r === "" ? h.height : f }, /* @__PURE__ */ l.createElement(Pv, { ref: d }, /* @__PURE__ */ l.
    createElement(Et.Header, null, /* @__PURE__ */ l.createElement(Et.Title, null, "Add a new story"), /* @__PURE__ */ l.createElement(Et.Description,
    null, "We will create a new story for your component")), /* @__PURE__ */ l.createElement(Mv, null, /* @__PURE__ */ l.createElement(Dv, null,
    /* @__PURE__ */ l.createElement(vn, null)), /* @__PURE__ */ l.createElement(
      Av,
      {
        placeholder: "./components/**/*.tsx",
        type: "search",
        required: !0,
        autoFocus: !0,
        value: v,
        onChange: (C) => {
          let g = C.target.value;
          S(g), m(() => {
            n(g);
          });
        }
      }
    ), i && /* @__PURE__ */ l.createElement(Lv, null, /* @__PURE__ */ l.createElement(tr, null))), /* @__PURE__ */ l.createElement(
      Hp,
      {
        errorItemId: o?.selectedItemId,
        isLoading: i,
        searchResults: s,
        onNewStory: u
      }
    ))),
    o && r !== "" && /* @__PURE__ */ l.createElement(Nv, null, /* @__PURE__ */ l.createElement("div", null, o.error), /* @__PURE__ */ l.createElement(
      Fv,
      {
        onClick: () => {
          c(null);
        }
      }
    ))
  );
}, "FileSearchModal");

// src/manager/components/sidebar/CreateNewStoryFileModal.tsx
var Hv = /* @__PURE__ */ a((e) => JSON.stringify(e, (t, r) => typeof r == "function" ? "__sb_empty_function_arg__" : r), "stringifyArgs"), zp = /* @__PURE__ */ a(
({ open: e, onOpenChange: t }) => {
  let [r, n] = J(!1), [i, o] = J(""), s = cp(i, 600), u = cs(s), c = X(null), [p, d] = J(
    null
  ), h = me(), [f, b] = J(null), m = A(
    (g) => {
      h.addNotification({
        id: "create-new-story-file-success",
        content: {
          headline: "Story file created",
          subHeadline: `${g} was created`
        },
        duration: 8e3,
        icon: /* @__PURE__ */ l.createElement(tt, null)
      }), t(!1);
    },
    [h, t]
  ), v = A(() => {
    h.addNotification({
      id: "create-new-story-file-error",
      content: {
        headline: "Story already exists",
        subHeadline: "Successfully navigated to existing story"
      },
      duration: 8e3,
      icon: /* @__PURE__ */ l.createElement(tt, null)
    }), t(!1);
  }, [h, t]), S = A(() => {
    n(!0);
    let g = Ge.getChannel(), y = /* @__PURE__ */ a((I) => {
      I.id === u && (I.success ? b(I.payload.files) : d({ error: I.error }), g.off(qr, y), n(!1), c.current = null);
    }, "set");
    return g.on(qr, y), u !== "" && c.current !== u ? (c.current = u, g.emit(ts, {
      id: u,
      payload: {}
    })) : (b(null), n(!1)), () => {
      g.off(qr, y);
    };
  }, [u]), C = A(
    async ({
      componentExportName: g,
      componentFilePath: y,
      componentIsDefaultExport: I,
      componentExportCount: E,
      selectedItemId: T
    }) => {
      try {
        let _ = Ge.getChannel(), k = await jr(_, Ja, es, {
          componentExportName: g,
          componentFilePath: y,
          componentIsDefaultExport: I,
          componentExportCount: E
        });
        d(null);
        let w = k.storyId;
        await Zn(h.selectStory, w);
        try {
          let P = (await jr(_, Qa, Xa, {
            storyId: w
          })).argTypes, D = pp(P);
          await jr(
            _,
            ns,
            os,
            {
              args: Hv(D),
              importPath: k.storyFilePath,
              csfId: w
            }
          );
        } catch {
        }
        m(g), S();
      } catch (_) {
        switch (_?.payload?.type) {
          case "STORY_FILE_EXISTS":
            let k = _;
            await Zn(h.selectStory, k.payload.kind), v();
            break;
          default:
            d({ selectedItemId: T, error: _?.message });
            break;
        }
      }
    },
    [h?.selectStory, m, S, v]
  );
  return V(() => {
    d(null);
  }, [u]), V(() => S(), [S]), /* @__PURE__ */ l.createElement(
    Rp,
    {
      error: p,
      fileSearchQuery: i,
      fileSearchQueryDeferred: u,
      onCreateNewStory: C,
      isLoading: r,
      onOpenChange: t,
      open: e,
      searchResults: f,
      setError: d,
      setFileSearchQuery: o
    }
  );
}, "CreateNewStoryFileModal");

// src/manager/components/sidebar/Search.tsx
var { document: Bv } = ae, ta = 50, Rv = {
  shouldSort: !0,
  tokenize: !0,
  findAllMatches: !0,
  includeScore: !0,
  includeMatches: !0,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: "name", weight: 0.7 },
    { name: "path", weight: 0.3 }
  ]
}, zv = x.div({
  display: "flex",
  flexDirection: "row",
  columnGap: 6
}), $v = x(un)({
  margin: 0
}), Wv = x.label({
  position: "absolute",
  left: -1e4,
  top: "auto",
  width: 1,
  height: 1,
  overflow: "hidden"
}), Kv = x(ie)(({ theme: e }) => ({
  color: e.color.mediumdark
})), Vv = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  left: 8,
  zIndex: 1,
  pointerEvents: "none",
  color: e.textMutedColor,
  display: "flex",
  alignItems: "center",
  height: "100%"
})), jv = x.div({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  position: "relative"
}), Uv = x.input(({ theme: e }) => ({
  appearance: "none",
  height: 28,
  paddingLeft: 28,
  paddingRight: 28,
  border: 0,
  boxShadow: `${e.button.border} 0 0 0 1px inset`,
  background: "transparent",
  borderRadius: 4,
  fontSize: `${e.typography.size.s1 + 1}px`,
  fontFamily: "inherit",
  transition: "all 150ms",
  color: e.color.defaultText,
  width: "100%",
  "&:focus, &:active": {
    outline: 0,
    borderColor: e.color.secondary,
    background: e.background.app
  },
  "&::placeholder": {
    color: e.textMutedColor,
    opacity: 1
  },
  "&:valid ~ code, &:focus ~ code": {
    display: "none"
  },
  "&:invalid ~ svg": {
    display: "none"
  },
  "&:valid ~ svg": {
    display: "block"
  },
  "&::-ms-clear": {
    display: "none"
  },
  "&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration": {
    display: "none"
  }
})), qv = x.code(({ theme: e }) => ({
  position: "absolute",
  top: 6,
  right: 9,
  height: 16,
  zIndex: 1,
  lineHeight: "16px",
  textAlign: "center",
  fontSize: "11px",
  color: e.base === "light" ? e.color.dark : e.textMutedColor,
  userSelect: "none",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  gap: 4
})), Gv = x.span({
  fontSize: "14px"
}), Yv = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  right: 8,
  zIndex: 1,
  color: e.textMutedColor,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  height: "100%"
})), Qv = x.div({ outline: 0 }), Xv = ae.CONFIG_TYPE === "DEVELOPMENT", Zv = ae.STORYBOOK_RENDERER === "react", Wp = l.memo(/* @__PURE__ */ a(
function({
  children: t,
  dataset: r,
  enableShortcuts: n = !0,
  getLastViewed: i,
  initialQuery: o = "",
  showCreateStoryButton: s = Xv && Zv
}) {
  let u = me(), c = X(null), [p, d] = J("Find components"), [h, f] = J(!1), b = u ? Ye(u.getShortcutKeys().search) : "/", [m, v] = J(!1), S = A(
  () => {
    let T = r.entries.reduce((_, [k, { index: w, status: O }]) => {
      let P = Cn(w || {}, O);
      return w && _.push(
        ...Object.values(w).map((D) => {
          let L = O && O[D.id] ? Or(Object.values(O[D.id] || {}).map((M) => M.status)) : null;
          return {
            ...ni(D, r.hash[k]),
            status: L || P[D.id] || null
          };
        })
      ), _;
    }, []);
    return new $p.default(T, Rv);
  }, [r]), C = A(
    (T) => {
      let _ = S();
      if (!T) return [];
      let k = [], w = /* @__PURE__ */ new Set(), O = _.search(T).filter(({ item: P }) => !(P.type === "component" || P.type === "docs" || P.
      type === "story") || // @ts-expect-error (non strict)
      w.has(P.parent) ? !1 : (w.add(P.id), !0));
      return O.length && (k = O.slice(0, h ? 1e3 : ta), O.length > ta && !h && k.push({
        showAll: /* @__PURE__ */ a(() => f(!0), "showAll"),
        totalCount: O.length,
        moreCount: O.length - ta
      })), k;
    },
    [h, S]
  ), g = A(
    (T) => {
      if (Ji(T)) {
        let { id: _, refId: k } = T.item;
        u?.selectStory(_, void 0, { ref: k !== rt && k }), c.current.blur(), f(!1);
        return;
      }
      Dr(T) && T.showAll();
    },
    [u]
  ), y = A((T, _) => {
    f(!1);
  }, []), I = A(
    (T, _) => {
      switch (_.type) {
        case Mt.stateChangeTypes.blurInput:
          return {
            ..._,
            // Prevent clearing the input on blur
            inputValue: T.inputValue,
            // Return to the tree view after selecting an item
            isOpen: T.inputValue && !T.selectedItem
          };
        case Mt.stateChangeTypes.mouseUp:
          return T;
        case Mt.stateChangeTypes.keyDownEscape:
          return T.inputValue ? { ..._, inputValue: "", isOpen: !0, selectedItem: null } : { ..._, isOpen: !1, selectedItem: null };
        case Mt.stateChangeTypes.clickItem:
        case Mt.stateChangeTypes.keyDownEnter:
          return Ji(_.selectedItem) ? { ..._, inputValue: T.inputValue } : Dr(_.selectedItem) ? T : _;
        default:
          return _;
      }
    },
    []
  ), { isMobile: E } = Ee();
  return (
    // @ts-expect-error (non strict)
    /* @__PURE__ */ l.createElement(
      Mt,
      {
        initialInputValue: o,
        stateReducer: I,
        itemToString: (T) => T?.item?.name || "",
        scrollIntoView: (T) => _t(T),
        onSelect: g,
        onInputValueChange: y
      },
      ({
        isOpen: T,
        openMenu: _,
        closeMenu: k,
        inputValue: w,
        clearSelection: O,
        getInputProps: P,
        getItemProps: D,
        getLabelProps: L,
        getMenuProps: M,
        getRootProps: W,
        highlightedIndex: Z
      }) => {
        let G = w ? w.trim() : "", R = G ? C(G) : [], z = !G && i();
        z && z.length && (R = z.reduce((N, { storyId: F, refId: $ }) => {
          let Q = r.hash[$];
          if (Q && Q.index && Q.index[F]) {
            let re = Q.index[F], ee = re.type === "story" ? Q.index[re.parent] : re;
            N.some((le) => le.item.refId === $ && le.item.id === ee.id) || N.push({ item: ni(ee, r.hash[$]), matches: [], score: 0 });
          }
          return N;
        }, []));
        let H = "storybook-explorer-searchfield", te = P({
          id: H,
          ref: c,
          required: !0,
          type: "search",
          placeholder: p,
          onFocus: /* @__PURE__ */ a(() => {
            _(), d("Type to find...");
          }, "onFocus"),
          onBlur: /* @__PURE__ */ a(() => d("Find components"), "onBlur"),
          onKeyDown: /* @__PURE__ */ a((N) => {
            N.key === "Escape" && w.length === 0 && c.current.blur();
          }, "onKeyDown")
        }), B = L({
          htmlFor: H
        });
        return /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(Wv, { ...B }, "Search for components"), /* @__PURE__ */ l.
        createElement(zv, null, /* @__PURE__ */ l.createElement(
          jv,
          {
            ...W({ refKey: "" }, { suppressRefError: !0 }),
            className: "search-field"
          },
          /* @__PURE__ */ l.createElement(Vv, null, /* @__PURE__ */ l.createElement(vn, null)),
          /* @__PURE__ */ l.createElement(Uv, { ...te }),
          !E && n && !T && /* @__PURE__ */ l.createElement(qv, null, b === "\u2318 K" ? /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.
          createElement(Gv, null, "\u2318"), "K") : b),
          T && /* @__PURE__ */ l.createElement(Yv, { onClick: () => O() }, /* @__PURE__ */ l.createElement(Qe, null))
        ), s && /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(
          ze,
          {
            trigger: "hover",
            hasChrome: !1,
            tooltip: /* @__PURE__ */ l.createElement($v, { note: "Create a new story" })
          },
          /* @__PURE__ */ l.createElement(
            Kv,
            {
              onClick: () => {
                v(!0);
              },
              variant: "outline"
            },
            /* @__PURE__ */ l.createElement(vl, null)
          )
        ), /* @__PURE__ */ l.createElement(
          zp,
          {
            open: m,
            onOpenChange: v
          }
        ))), /* @__PURE__ */ l.createElement(Qv, { tabIndex: 0, id: "storybook-explorer-menu" }, t({
          query: G,
          results: R,
          isBrowsing: !T && Bv.activeElement !== c.current,
          closeMenu: k,
          getMenuProps: M,
          getItemProps: D,
          highlightedIndex: Z
        })));
      }
    )
  );
}, "Search"));

// src/manager/components/sidebar/SearchResults.tsx
var { document: Kp } = ae, Jv = x.ol({
  listStyle: "none",
  margin: 0,
  padding: 0
}), eb = x.li(({ theme: e, isHighlighted: t }) => ({
  width: "100%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "start",
  textAlign: "left",
  color: "inherit",
  fontSize: `${e.typography.size.s2}px`,
  background: t ? e.background.hoverable : "transparent",
  minHeight: 28,
  borderRadius: 4,
  gap: 6,
  paddingTop: 7,
  paddingBottom: 7,
  paddingLeft: 8,
  paddingRight: 8,
  "&:hover, &:focus": {
    background: ge(0.93, e.color.secondary),
    outline: "none"
  }
})), tb = x.div({
  marginTop: 2
}), rb = x.div(() => ({
  display: "flex",
  flexDirection: "column"
})), nb = x.div(({ theme: e }) => ({
  marginTop: 20,
  textAlign: "center",
  fontSize: `${e.typography.size.s2}px`,
  lineHeight: "18px",
  color: e.color.defaultText,
  small: {
    color: e.barTextColor,
    fontSize: `${e.typography.size.s1}px`
  }
})), ob = x.mark(({ theme: e }) => ({
  background: "transparent",
  color: e.color.secondary
})), ib = x.div({
  marginTop: 8
}), ab = x.div(({ theme: e }) => ({
  display: "flex",
  justifyContent: "space-between",
  fontSize: `${e.typography.size.s1 - 1}px`,
  fontWeight: e.typography.weight.bold,
  minHeight: 28,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: e.textMutedColor,
  marginTop: 16,
  marginBottom: 4,
  alignItems: "center",
  ".search-result-recentlyOpened-clear": {
    visibility: "hidden"
  },
  "&:hover": {
    ".search-result-recentlyOpened-clear": {
      visibility: "visible"
    }
  }
})), Vp = l.memo(/* @__PURE__ */ a(function({
  children: t,
  match: r
}) {
  if (!r) return t;
  let { value: n, indices: i } = r, { nodes: o } = i.reduce(
    ({ cursor: s, nodes: u }, [c, p], d, { length: h }) => (u.push(/* @__PURE__ */ l.createElement("span", { key: `${d}-1` }, n.slice(s, c))),
    u.push(/* @__PURE__ */ l.createElement(ob, { key: `${d}-2` }, n.slice(c, p + 1))), d === h - 1 && u.push(/* @__PURE__ */ l.createElement(
    "span", { key: `${d}-3` }, n.slice(p + 1))), { cursor: p + 1, nodes: u }),
    { cursor: 0, nodes: [] }
  );
  return /* @__PURE__ */ l.createElement("span", null, o);
}, "Highlight")), sb = x.div(({ theme: e }) => ({
  display: "grid",
  justifyContent: "start",
  gridAutoColumns: "auto",
  gridAutoFlow: "column",
  "& > span": {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
})), lb = x.div(({ theme: e }) => ({
  display: "grid",
  justifyContent: "start",
  gridAutoColumns: "auto",
  gridAutoFlow: "column",
  fontSize: `${e.typography.size.s1 - 1}px`,
  "& > span": {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  "& > span + span": {
    "&:before": {
      content: "' / '"
    }
  }
})), ub = l.memo(/* @__PURE__ */ a(function({ item: t, matches: r, onClick: n, ...i }) {
  let o = A(
    (d) => {
      d.preventDefault(), n?.(d);
    },
    [n]
  ), s = me();
  V(() => {
    s && i.isHighlighted && t.type === "component" && s.emit(xt, { ids: [t.children[0]] }, { options: { target: t.refId } });
  }, [i.isHighlighted, t]);
  let u = r.find((d) => d.key === "name"), c = r.filter((d) => d.key === "path"), [p] = t.status ? ir[t.status] : [];
  return /* @__PURE__ */ l.createElement(eb, { ...i, onClick: o }, /* @__PURE__ */ l.createElement(tb, null, t.type === "component" && /* @__PURE__ */ l.
  createElement(mt, { viewBox: "0 0 14 14", width: "14", height: "14", type: "component" }, /* @__PURE__ */ l.createElement(lt, { type: "com\
ponent" })), t.type === "story" && /* @__PURE__ */ l.createElement(mt, { viewBox: "0 0 14 14", width: "14", height: "14", type: "story" }, /* @__PURE__ */ l.
  createElement(lt, { type: "story" })), !(t.type === "component" || t.type === "story") && /* @__PURE__ */ l.createElement(mt, { viewBox: "\
0 0 14 14", width: "14", height: "14", type: "document" }, /* @__PURE__ */ l.createElement(lt, { type: "document" }))), /* @__PURE__ */ l.createElement(
  rb, { className: "search-result-item--label" }, /* @__PURE__ */ l.createElement(sb, null, /* @__PURE__ */ l.createElement(Vp, { match: u },
  t.name)), /* @__PURE__ */ l.createElement(lb, null, t.path.map((d, h) => /* @__PURE__ */ l.createElement("span", { key: h }, /* @__PURE__ */ l.
  createElement(Vp, { match: c.find((f) => f.arrayIndex === h) }, d))))), t.status ? p : null);
}, "Result")), jp = l.memo(/* @__PURE__ */ a(function({
  query: t,
  results: r,
  closeMenu: n,
  getMenuProps: i,
  getItemProps: o,
  highlightedIndex: s,
  isLoading: u = !1,
  enableShortcuts: c = !0,
  clearLastViewed: p
}) {
  let d = me();
  V(() => {
    let b = /* @__PURE__ */ a((m) => {
      if (!(!c || u || m.repeat) && ht(!1, m) && Ve("Escape", m)) {
        if (m.target?.id === "storybook-explorer-searchfield") return;
        m.preventDefault(), n();
      }
    }, "handleEscape");
    return Kp.addEventListener("keydown", b), () => Kp.removeEventListener("keydown", b);
  }, [n, c, u]);
  let h = A((b) => {
    if (!d)
      return;
    let m = b.currentTarget, v = m.getAttribute("data-id"), S = m.getAttribute("data-refid"), C = d.resolveStory(v, S === "storybook_interna\
l" ? void 0 : S);
    C?.type === "component" && d.emit(xt, {
      // @ts-expect-error (TODO)
      ids: [C.isLeaf ? C.id : C.children[0]],
      options: { target: S }
    });
  }, []), f = /* @__PURE__ */ a(() => {
    p(), n();
  }, "handleClearLastViewed");
  return /* @__PURE__ */ l.createElement(Jv, { ...i() }, r.length > 0 && !t && /* @__PURE__ */ l.createElement(ab, { className: "search-resu\
lt-recentlyOpened" }, "Recently opened", /* @__PURE__ */ l.createElement(
    ie,
    {
      className: "search-result-recentlyOpened-clear",
      onClick: f
    },
    /* @__PURE__ */ l.createElement(Sl, null)
  )), r.length === 0 && t && /* @__PURE__ */ l.createElement("li", null, /* @__PURE__ */ l.createElement(nb, null, /* @__PURE__ */ l.createElement(
  "strong", null, "No components found"), /* @__PURE__ */ l.createElement("br", null), /* @__PURE__ */ l.createElement("small", null, "Find \
components by name or path."))), r.map((b, m) => {
    if (Dr(b))
      return /* @__PURE__ */ l.createElement(ib, { key: "search-result-expand" }, /* @__PURE__ */ l.createElement(
        we,
        {
          ...b,
          ...o({ key: m, index: m, item: b }),
          size: "small"
        },
        "Show ",
        b.moreCount,
        " more results"
      ));
    let { item: v } = b, S = `${v.refId}::${v.id}`;
    return /* @__PURE__ */ l.createElement(
      ub,
      {
        key: v.id,
        ...b,
        ...o({ key: S, index: m, item: b }),
        isHighlighted: s === m,
        "data-id": b.item.id,
        "data-refid": b.item.refId,
        onMouseOver: h,
        className: "search-result-item"
      }
    );
  }));
}, "SearchResults"));

// src/manager/components/sidebar/useLastViewed.ts
var Gp = Fe(ti(), 1);
var io = Fe(Up(), 1);
var qp = (0, Gp.default)((e) => io.default.set("lastViewedStoryIds", e), 1e3), Yp = /* @__PURE__ */ a((e) => {
  let t = j(() => {
    let i = io.default.get("lastViewedStoryIds");
    return !i || !Array.isArray(i) ? [] : i.some((o) => typeof o == "object" && o.storyId && o.refId) ? i : [];
  }, [io.default]), r = X(t), n = A(
    (i) => {
      let o = r.current, s = o.findIndex(
        ({ storyId: u, refId: c }) => u === i.storyId && c === i.refId
      );
      s !== 0 && (s === -1 ? r.current = [i, ...o] : r.current = [i, ...o.slice(0, s), ...o.slice(s + 1)], qp(r.current));
    },
    [r]
  );
  return V(() => {
    e && n(e);
  }, [e]), {
    getLastViewed: A(() => r.current, [r]),
    clearLastViewed: A(() => {
      r.current = r.current.slice(0, 1), qp(r.current);
    }, [r])
  };
}, "useLastViewed");

// src/manager/components/sidebar/Sidebar.tsx
var rt = "storybook_internal", cb = x.nav(({ theme: e }) => ({
  position: "absolute",
  zIndex: 1,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: e.background.content,
  [st]: {
    background: e.background.app
  }
})), pb = x(at)({
  paddingLeft: 12,
  paddingRight: 12,
  paddingBottom: 20,
  paddingTop: 16,
  flex: 1
}), db = x.div(({ theme: e }) => ({
  borderTop: `1px solid ${e.appBorderColor}`,
  padding: e.layoutMargin / 2,
  display: "flex",
  flexWrap: "wrap",
  gap: e.layoutMargin / 2,
  backgroundColor: e.barBg,
  "&:empty": {
    display: "none"
  }
})), fb = l.memo(/* @__PURE__ */ a(function({
  children: t,
  condition: r
}) {
  let [n, i] = l.Children.toArray(t);
  return /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement("div", { style: { display: r ? "block" : "none" } },
  n), /* @__PURE__ */ l.createElement("div", { style: { display: r ? "none" : "block" } }, i));
}, "Swap")), mb = /* @__PURE__ */ a((e, t, r, n, i) => {
  let o = j(
    () => ({
      [rt]: {
        index: e,
        indexError: t,
        previewInitialized: r,
        status: n,
        title: null,
        id: rt,
        url: "iframe.html"
      },
      ...i
    }),
    [i, e, t, r, n]
  );
  return j(() => ({ hash: o, entries: Object.entries(o) }), [o]);
}, "useCombination"), Qp = l.memo(/* @__PURE__ */ a(function({
  // @ts-expect-error (non strict)
  storyId: t = null,
  refId: r = rt,
  index: n,
  indexError: i,
  status: o,
  previewInitialized: s,
  menu: u,
  extra: c,
  bottom: p = [],
  menuHighlighted: d = !1,
  enableShortcuts: h = !0,
  refs: f = {},
  onMenuClick: b,
  showCreateStoryButton: m
}) {
  let v = j(() => t && { storyId: t, refId: r }, [t, r]), S = mb(n, i, s, o, f), C = !n && !i, g = Yp(v);
  return /* @__PURE__ */ l.createElement(cb, { className: "container sidebar-container" }, /* @__PURE__ */ l.createElement(on, { vertical: !0,
  offset: 3, scrollbarSize: 6 }, /* @__PURE__ */ l.createElement(pb, { row: 1.6 }, /* @__PURE__ */ l.createElement(
    Al,
    {
      className: "sidebar-header",
      menuHighlighted: d,
      menu: u,
      extra: c,
      skipLinkHref: "#storybook-preview-wrapper",
      isLoading: C,
      onMenuClick: b
    }
  ), /* @__PURE__ */ l.createElement(
    Wp,
    {
      dataset: S,
      enableShortcuts: h,
      showCreateStoryButton: m,
      ...g
    },
    ({
      query: y,
      results: I,
      isBrowsing: E,
      closeMenu: T,
      getMenuProps: _,
      getItemProps: k,
      highlightedIndex: w
    }) => /* @__PURE__ */ l.createElement(fb, { condition: E }, /* @__PURE__ */ l.createElement(
      Xu,
      {
        dataset: S,
        selected: v,
        isLoading: C,
        isBrowsing: E
      }
    ), /* @__PURE__ */ l.createElement(
      jp,
      {
        query: y,
        results: I,
        closeMenu: T,
        getMenuProps: _,
        getItemProps: k,
        highlightedIndex: w,
        enableShortcuts: h,
        isLoading: C,
        clearLastViewed: g.clearLastViewed
      }
    ))
  ))), C ? null : /* @__PURE__ */ l.createElement(db, { className: "sb-bar" }, p.map(({ id: y, render: I }) => /* @__PURE__ */ l.createElement(
  I, { key: y }))));
}, "Sidebar"));

// src/manager/container/Menu.tsx
var hb = {
  storySearchField: "storybook-explorer-searchfield",
  storyListMenu: "storybook-explorer-menu",
  storyPanelRoot: "storybook-panel-root"
}, gb = x.span(({ theme: e }) => ({
  display: "inline-block",
  height: 16,
  lineHeight: "16px",
  textAlign: "center",
  fontSize: "11px",
  background: e.base === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
  color: e.base === "light" ? e.color.dark : e.textMutedColor,
  borderRadius: 2,
  userSelect: "none",
  pointerEvents: "none",
  padding: "0 6px"
})), yb = x.code(
  ({ theme: e }) => `
  padding: 0;
  vertical-align: middle;

  & + & {
    margin-left: 6px;
  }
`
), We = /* @__PURE__ */ a(({ keys: e }) => /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(gb, null, e.map(
(t, r) => /* @__PURE__ */ l.createElement(yb, { key: t }, Ye([t]))))), "Shortcut"), Xp = /* @__PURE__ */ a((e, t, r, n, i, o, s) => {
  let u = Re(), c = t.getShortcutKeys(), p = j(
    () => ({
      id: "about",
      title: "About your Storybook",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab("about"), "onClick"),
      icon: /* @__PURE__ */ l.createElement(hl, null)
    }),
    [t]
  ), d = j(() => ({
    id: "documentation",
    title: "Documentation",
    href: t.getDocsUrl({ versioned: !0, renderer: !0 }),
    icon: /* @__PURE__ */ l.createElement(Ct, null)
  }), [t]), h = e.whatsNewData?.status === "SUCCESS" && !e.disableWhatsNewNotifications, f = t.isWhatsNewUnread(), b = j(
    () => ({
      id: "whats-new",
      title: "What's new?",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab("whats-new"), "onClick"),
      right: h && f && /* @__PURE__ */ l.createElement(Ws, { status: "positive" }, "Check it out"),
      icon: /* @__PURE__ */ l.createElement(xl, null)
    }),
    [t, h, f]
  ), m = j(
    () => ({
      id: "shortcuts",
      title: "Keyboard shortcuts",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab("shortcuts"), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.shortcutsPage }) : null,
      style: {
        borderBottom: `4px solid ${u.appBorderColor}`
      }
    }),
    [t, s, c.shortcutsPage, u.appBorderColor]
  ), v = j(
    () => ({
      id: "S",
      title: "Show sidebar",
      onClick: /* @__PURE__ */ a(() => t.toggleNav(), "onClick"),
      active: o,
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.toggleNav }) : null,
      icon: o ? /* @__PURE__ */ l.createElement(tt, null) : null
    }),
    [t, s, c, o]
  ), S = j(
    () => ({
      id: "T",
      title: "Show toolbar",
      onClick: /* @__PURE__ */ a(() => t.toggleToolbar(), "onClick"),
      active: r,
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.toolbar }) : null,
      icon: r ? /* @__PURE__ */ l.createElement(tt, null) : null
    }),
    [t, s, c, r]
  ), C = j(
    () => ({
      id: "A",
      title: "Show addons",
      onClick: /* @__PURE__ */ a(() => t.togglePanel(), "onClick"),
      active: i,
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.togglePanel }) : null,
      icon: i ? /* @__PURE__ */ l.createElement(tt, null) : null
    }),
    [t, s, c, i]
  ), g = j(
    () => ({
      id: "D",
      title: "Change addons orientation",
      onClick: /* @__PURE__ */ a(() => t.togglePanelPosition(), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.panelPosition }) : null
    }),
    [t, s, c]
  ), y = j(
    () => ({
      id: "F",
      title: "Go full screen",
      onClick: /* @__PURE__ */ a(() => t.toggleFullscreen(), "onClick"),
      active: n,
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.fullScreen }) : null,
      icon: n ? /* @__PURE__ */ l.createElement(tt, null) : null
    }),
    [t, s, c, n]
  ), I = j(
    () => ({
      id: "/",
      title: "Search",
      onClick: /* @__PURE__ */ a(() => t.focusOnUIElement(hb.storySearchField), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.search }) : null
    }),
    [t, s, c]
  ), E = j(
    () => ({
      id: "up",
      title: "Previous component",
      onClick: /* @__PURE__ */ a(() => t.jumpToComponent(-1), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.prevComponent }) : null
    }),
    [t, s, c]
  ), T = j(
    () => ({
      id: "down",
      title: "Next component",
      onClick: /* @__PURE__ */ a(() => t.jumpToComponent(1), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.nextComponent }) : null
    }),
    [t, s, c]
  ), _ = j(
    () => ({
      id: "prev",
      title: "Previous story",
      onClick: /* @__PURE__ */ a(() => t.jumpToStory(-1), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.prevStory }) : null
    }),
    [t, s, c]
  ), k = j(
    () => ({
      id: "next",
      title: "Next story",
      onClick: /* @__PURE__ */ a(() => t.jumpToStory(1), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.nextStory }) : null
    }),
    [t, s, c]
  ), w = j(
    () => ({
      id: "collapse",
      title: "Collapse all",
      onClick: /* @__PURE__ */ a(() => t.collapseAll(), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: c.collapseAll }) : null
    }),
    [t, s, c]
  ), O = A(() => {
    let P = t.getAddonsShortcuts(), D = c;
    return Object.entries(P).filter(([L, { showInMenu: M }]) => M).map(([L, { label: M, action: W }]) => ({
      id: L,
      title: M,
      onClick: /* @__PURE__ */ a(() => W(), "onClick"),
      right: s ? /* @__PURE__ */ l.createElement(We, { keys: D[L] }) : null
    }));
  }, [t, s, c]);
  return j(
    () => [
      p,
      ...e.whatsNewData?.status === "SUCCESS" ? [b] : [],
      d,
      m,
      v,
      S,
      C,
      g,
      y,
      I,
      E,
      T,
      _,
      k,
      w,
      ...O()
    ],
    [
      p,
      e,
      b,
      d,
      m,
      v,
      S,
      C,
      g,
      y,
      I,
      E,
      T,
      _,
      k,
      w,
      O
    ]
  );
}, "useMenu");

// src/manager/container/Sidebar.tsx
var vb = l.memo(/* @__PURE__ */ a(function({ onMenuClick: t }) {
  return /* @__PURE__ */ l.createElement(he, { filter: /* @__PURE__ */ a(({ state: n, api: i }) => {
    let {
      ui: { name: o, url: s, enableShortcuts: u },
      viewMode: c,
      storyId: p,
      refId: d,
      layout: { showToolbar: h },
      index: f,
      status: b,
      indexError: m,
      previewInitialized: v,
      refs: S
    } = n, C = Xp(
      n,
      i,
      h,
      i.getIsFullscreen(),
      i.getIsPanelShown(),
      i.getIsNavShown(),
      u
    ), g = n.whatsNewData?.status === "SUCCESS" && !n.disableWhatsNewNotifications, y = i.getElements(ke.experimental_SIDEBAR_BOTTOM), I = i.
    getElements(ke.experimental_SIDEBAR_TOP), E = j(() => Object.values(y), [Object.keys(y).join("")]), T = j(() => Object.values(I), [Object.
    keys(I).join("")]);
    return {
      title: o,
      url: s,
      index: f,
      indexError: m,
      status: b,
      previewInitialized: v,
      refs: S,
      storyId: p,
      refId: d,
      viewMode: c,
      menu: C,
      menuHighlighted: g && i.isWhatsNewUnread(),
      enableShortcuts: u,
      bottom: E,
      extra: T
    };
  }, "mapper") }, (n) => /* @__PURE__ */ l.createElement(Qp, { ...n, onMenuClick: t }));
}, "Sideber")), Zp = vb;

// src/manager/container/Preview.tsx
var Wr = Fe(xn(), 1);

// src/manager/components/preview/utils/components.ts
var Jp = x.main({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "hidden"
}), ed = x.div({
  overflow: "auto",
  width: "100%",
  zIndex: 3,
  background: "transparent",
  flex: 1
}), td = x.div(
  {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    justifyItems: "center",
    overflow: "auto",
    gridTemplateColumns: "100%",
    gridTemplateRows: "100%",
    position: "relative",
    width: "100%",
    height: "100%"
  },
  ({ show: e }) => ({ display: e ? "grid" : "none" })
), pN = x(Yr)({
  color: "inherit",
  textDecoration: "inherit",
  display: "inline-block"
}), dN = x.span({
  // Hides full screen icon at mobile breakpoint defined in app.js
  "@media (max-width: 599px)": {
    display: "none"
  }
}), ao = x.div(({ theme: e }) => ({
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  justifyItems: "center",
  overflow: "auto",
  display: "grid",
  gridTemplateColumns: "100%",
  gridTemplateRows: "100%",
  position: "relative",
  width: "100%",
  height: "100%"
})), rd = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  background: e.background.preview,
  zIndex: 1
}));

// src/manager/components/preview/tools/zoom.tsx
var Fr = 1, nd = Gr({ value: Fr, set: /* @__PURE__ */ a((e) => {
}, "set") }), na = class na extends He {
  state = {
    value: Fr
  };
  set = /* @__PURE__ */ a((t) => this.setState({ value: t }), "set");
  render() {
    let { children: t, shouldScale: r } = this.props, { set: n } = this, { value: i } = this.state;
    return /* @__PURE__ */ l.createElement(nd.Provider, { value: { value: r ? i : Fr, set: n } }, t);
  }
};
a(na, "ZoomProvider");
var so = na, { Consumer: ra } = nd, Ib = Ir(/* @__PURE__ */ a(function({ zoomIn: t, zoomOut: r, reset: n }) {
  return /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(ie, { key: "zoomin", onClick: t, title: "Zoom in" },
  /* @__PURE__ */ l.createElement(wl, null)), /* @__PURE__ */ l.createElement(ie, { key: "zoomout", onClick: r, title: "Zoom out" }, /* @__PURE__ */ l.
  createElement(El, null)), /* @__PURE__ */ l.createElement(ie, { key: "zoomreset", onClick: n, title: "Reset zoom" }, /* @__PURE__ */ l.createElement(
  Cl, null)));
}, "Zoom"));
var Sb = Ir(/* @__PURE__ */ a(function({
  set: t,
  value: r
}) {
  let n = A(
    (s) => {
      s.preventDefault(), t(0.8 * r);
    },
    [t, r]
  ), i = A(
    (s) => {
      s.preventDefault(), t(1.25 * r);
    },
    [t, r]
  ), o = A(
    (s) => {
      s.preventDefault(), t(Fr);
    },
    [t, Fr]
  );
  return /* @__PURE__ */ l.createElement(Ib, { key: "zoom", zoomIn: n, zoomOut: i, reset: o });
}, "ZoomWrapper"));
function xb() {
  return /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(ra, null, ({ set: e, value: t }) => /* @__PURE__ */ l.
  createElement(Sb, { set: e, value: t })), /* @__PURE__ */ l.createElement(qt, null));
}
a(xb, "ZoomToolRenderer");
var od = {
  title: "zoom",
  id: "zoom",
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: xb
};

// src/manager/components/preview/Wrappers.tsx
var id = /* @__PURE__ */ a(({
  wrappers: e,
  id: t,
  storyId: r,
  children: n
}) => /* @__PURE__ */ l.createElement(_e, null, e.reduceRight(
  (i, o, s) => /* @__PURE__ */ l.createElement(o.render, { index: s, children: i, id: t, storyId: r }),
  n
)), "ApplyWrappers"), ad = [
  {
    id: "iframe-wrapper",
    type: ke.PREVIEW,
    render: /* @__PURE__ */ a((e) => /* @__PURE__ */ l.createElement(ao, { id: "storybook-preview-wrapper" }, e.children), "render")
  }
];

// src/manager/components/preview/tools/copy.tsx
var dd = Fe(pd(), 1);
var { PREVIEW_URL: _b, document: kb } = ae, Ob = /* @__PURE__ */ a(({ state: e }) => {
  let { storyId: t, refId: r, refs: n } = e, { location: i } = kb, o = n[r], s = `${i.origin}${i.pathname}`;
  return s.endsWith("/") || (s += "/"), {
    refId: r,
    baseUrl: o ? `${o.url}/iframe.html` : _b || `${s}iframe.html`,
    storyId: t,
    queryParams: e.customQueryParams
  };
}, "copyMapper"), fd = {
  title: "copy",
  id: "copy",
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(he, { filter: Ob }, ({ baseUrl: e, storyId: t, queryParams: r }) => t ? /* @__PURE__ */ l.
  createElement(
    ie,
    {
      key: "copy",
      onClick: () => (0, dd.default)(Yt(e, t, r)),
      title: "Copy canvas link"
    },
    /* @__PURE__ */ l.createElement(yl, null)
  ) : null), "render")
};

// src/manager/components/preview/tools/eject.tsx
var { PREVIEW_URL: Pb } = ae, Ab = /* @__PURE__ */ a(({ state: e }) => {
  let { storyId: t, refId: r, refs: n } = e, i = n[r];
  return {
    refId: r,
    baseUrl: i ? `${i.url}/iframe.html` : Pb || "iframe.html",
    storyId: t,
    queryParams: e.customQueryParams
  };
}, "ejectMapper"), md = {
  title: "eject",
  id: "eject",
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(he, { filter: Ab }, ({ baseUrl: e, storyId: t, queryParams: r }) => t ? /* @__PURE__ */ l.
  createElement(ie, { key: "opener", asChild: !0 }, /* @__PURE__ */ l.createElement(
    "a",
    {
      href: Yt(e, t, r),
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Open canvas in new tab"
    },
    /* @__PURE__ */ l.createElement(Ct, null)
  )) : null), "render")
};

// src/manager/components/preview/tools/addons.tsx
var Mb = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  isVisible: e.getIsPanelShown(),
  singleStory: t.singleStory,
  panelPosition: t.layout.panelPosition,
  toggle: /* @__PURE__ */ a(() => e.togglePanel(), "toggle")
}), "menuMapper"), hd = {
  title: "addons",
  id: "addons",
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(he, { filter: Mb }, ({ isVisible: e, toggle: t, singleStory: r, panelPosition: n }) => !r &&
  !e && /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(ie, { "aria-label": "Show addons", key: "addons", onClick: t,
  title: "Show addons" }, n === "bottom" ? /* @__PURE__ */ l.createElement(fn, null) : /* @__PURE__ */ l.createElement(bn, null)))), "render")
};

// src/manager/components/preview/tools/remount.tsx
var Db = x(ie)(({ theme: e, animating: t, disabled: r }) => ({
  opacity: r ? 0.5 : 1,
  svg: {
    animation: t ? `${e.animation.rotate360} 1000ms ease-out` : void 0
  }
})), Lb = /* @__PURE__ */ a(({ api: e, state: t }) => {
  let { storyId: r } = t;
  return {
    storyId: r,
    remount: /* @__PURE__ */ a(() => e.emit(Oo, { storyId: t.storyId }), "remount"),
    api: e
  };
}, "menuMapper"), gd = {
  title: "remount",
  id: "remount",
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(he, { filter: Lb }, ({ remount: e, storyId: t, api: r }) => {
    let [n, i] = J(!1), o = /* @__PURE__ */ a(() => {
      t && e();
    }, "remountComponent");
    return r.on(Oo, () => {
      i(!0);
    }), /* @__PURE__ */ l.createElement(
      Db,
      {
        key: "remount",
        title: "Remount component",
        onClick: o,
        onAnimationEnd: () => i(!1),
        animating: n,
        disabled: !t
      },
      /* @__PURE__ */ l.createElement(tr, null)
    );
  }), "render")
};

// src/manager/components/preview/Toolbar.tsx
var Nb = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  toggle: e.toggleFullscreen,
  isFullscreen: e.getIsFullscreen(),
  shortcut: Ye(e.getShortcutKeys().fullScreen),
  hasPanel: Object.keys(e.getElements(ke.PANEL)).length > 0,
  singleStory: t.singleStory
}), "fullScreenMapper"), vd = {
  title: "fullscreen",
  id: "fullscreen",
  type: ve.TOOL,
  // @ts-expect-error (non strict)
  match: /* @__PURE__ */ a((e) => ["story", "docs"].includes(e.viewMode), "match"),
  render: /* @__PURE__ */ a(() => {
    let { isMobile: e } = Ee();
    return e ? null : /* @__PURE__ */ l.createElement(he, { filter: Nb }, ({ toggle: t, isFullscreen: r, shortcut: n, hasPanel: i, singleStory: o }) => (!o ||
    o && i) && /* @__PURE__ */ l.createElement(
      ie,
      {
        key: "full",
        onClick: t,
        title: `${r ? "Exit full screen" : "Go full screen"} [${n}]`,
        "aria-label": r ? "Exit full screen" : "Go full screen"
      },
      r ? /* @__PURE__ */ l.createElement(Qe, null) : /* @__PURE__ */ l.createElement(pl, null)
    ));
  }, "render")
};
var bd = l.memo(/* @__PURE__ */ a(function({
  isShown: t,
  tools: r,
  toolsExtra: n,
  tabs: i,
  tabId: o,
  api: s
}) {
  return i || r || n ? /* @__PURE__ */ l.createElement(Hb, { className: "sb-bar", key: "toolbar", shown: t, "data-test-id": "sb-preview-tool\
bar" }, /* @__PURE__ */ l.createElement(Bb, null, /* @__PURE__ */ l.createElement(Id, null, i.length > 1 ? /* @__PURE__ */ l.createElement(_e,
  null, /* @__PURE__ */ l.createElement(sn, { key: "tabs" }, i.map((u, c) => /* @__PURE__ */ l.createElement(
    ln,
    {
      disabled: u.disabled,
      active: u.id === o || u.id === "canvas" && !o,
      onClick: () => {
        s.applyQueryParams({ tab: u.id === "canvas" ? void 0 : u.id });
      },
      key: u.id || `tab-${c}`
    },
    u.title
  ))), /* @__PURE__ */ l.createElement(qt, null)) : null, /* @__PURE__ */ l.createElement(yd, { key: "left", list: r })), /* @__PURE__ */ l.
  createElement(Rb, null, /* @__PURE__ */ l.createElement(yd, { key: "right", list: n })))) : null;
}, "ToolbarComp")), yd = l.memo(/* @__PURE__ */ a(function({ list: t }) {
  return /* @__PURE__ */ l.createElement(l.Fragment, null, t.filter(Boolean).map(({ render: r, id: n, ...i }, o) => (
    // @ts-expect-error (Converted from ts-ignore)
    /* @__PURE__ */ l.createElement(r, { key: n || i.key || `f-${o}` })
  )));
}, "Tools"));
function Fb(e, t) {
  let r = t?.type === "story" && t?.prepared ? t?.parameters : {}, n = "toolbar" in r ? r.toolbar : void 0, { toolbar: i } = Ge.getConfig(),
  o = Ur(i, n);
  return o ? !!o[e?.id]?.hidden : !1;
}
a(Fb, "toolbarItemHasBeenExcluded");
function oa(e, t, r, n, i, o) {
  let s = /* @__PURE__ */ a((u) => u && (!u.match || u.match({
    storyId: t?.id,
    refId: t?.refId,
    viewMode: r,
    location: n,
    path: i,
    tabId: o
  })) && !Fb(u, t), "filter");
  return e.filter(s);
}
a(oa, "filterToolsSide");
var Hb = x.div(({ theme: e, shown: t }) => ({
  position: "relative",
  color: e.barTextColor,
  width: "100%",
  height: 40,
  flexShrink: 0,
  overflowX: "auto",
  overflowY: "hidden",
  marginTop: t ? 0 : -40,
  boxShadow: `${e.appBorderColor}  0 -1px 0 0 inset`,
  background: e.barBg,
  zIndex: 4
})), Bb = x.div({
  position: "absolute",
  width: "calc(100% - 20px)",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "nowrap",
  flexShrink: 0,
  height: 40,
  marginLeft: 10,
  marginRight: 10
}), Id = x.div({
  display: "flex",
  whiteSpace: "nowrap",
  flexBasis: "auto",
  gap: 6,
  alignItems: "center"
}), Rb = x(Id)({
  marginLeft: 30
});

// src/manager/components/preview/Iframe.tsx
var zb = x.iframe(({ theme: e }) => ({
  backgroundColor: e.background.preview,
  display: "block",
  boxSizing: "content-box",
  height: "100%",
  width: "100%",
  border: "0 none",
  transition: "background-position 0s, visibility 0s",
  backgroundPosition: "-1px -1px, -1px -1px, -1px -1px, -1px -1px",
  margin: "auto",
  boxShadow: "0 0 100px 100vw rgba(0,0,0,0.5)"
}));
function Sd(e) {
  let { active: t, id: r, title: n, src: i, allowFullScreen: o, scale: s, ...u } = e, c = l.useRef(null);
  return /* @__PURE__ */ l.createElement(qs.IFrame, { scale: s, active: t, iFrameRef: c }, /* @__PURE__ */ l.createElement(
    zb,
    {
      "data-is-storybook": t ? "true" : "false",
      onLoad: (p) => p.currentTarget.setAttribute("data-is-loaded", "true"),
      id: r,
      title: n,
      src: i,
      allow: "clipboard-write;",
      allowFullScreen: o,
      ref: c,
      ...u
    }
  ));
}
a(Sd, "IFrame");

// src/manager/components/preview/utils/stringifyQueryParams.tsx
var sm = Fe(am(), 1);
var lm = /* @__PURE__ */ a((e) => sm.default.stringify(e, { addQueryPrefix: !0, encode: !1 }).replace(/^\?/, "&"), "stringifyQueryParams");

// src/manager/components/preview/FramesRenderer.tsx
var RI = /* @__PURE__ */ a((e, t) => e && t[e] ? `storybook-ref-${e}` : "storybook-preview-iframe", "getActive"), zI = x(we)(({ theme: e }) => ({
  display: "none",
  "@media (min-width: 600px)": {
    position: "absolute",
    display: "block",
    top: 10,
    right: 15,
    padding: "10px 15px",
    fontSize: e.typography.size.s1,
    transform: "translateY(-100px)",
    "&:focus": {
      transform: "translateY(0)",
      zIndex: 1
    }
  }
})), $I = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  isFullscreen: e.getIsFullscreen(),
  isNavShown: e.getIsNavShown(),
  selectedStoryId: t.storyId
}), "whenSidebarIsVisible"), WI = {
  '#root [data-is-storybook="false"]': {
    display: "none"
  },
  '#root [data-is-storybook="true"]': {
    display: "block"
  }
}, um = /* @__PURE__ */ a(({
  refs: e,
  scale: t,
  viewMode: r = "story",
  refId: n,
  queryParams: i = {},
  baseUrl: o,
  storyId: s = "*"
}) => {
  let u = e[n]?.version, c = lm({
    ...i,
    ...u && { version: u }
  }), p = RI(n, e), { current: d } = X({}), h = Object.values(e).filter((f) => f.type === "auto-inject" || f.id === n, {});
  return d["storybook-preview-iframe"] || (d["storybook-preview-iframe"] = Yt(o, s, {
    ...i,
    ...u && { version: u },
    viewMode: r
  })), h.forEach((f) => {
    let b = `storybook-ref-${f.id}`, m = d[b]?.split("/iframe.html")[0];
    if (!m || f.url !== m) {
      let v = `${f.url}/iframe.html?id=${s}&viewMode=${r}&refId=${f.id}${c}`;
      d[b] = v;
    }
  }), /* @__PURE__ */ l.createElement(_e, null, /* @__PURE__ */ l.createElement(Vt, { styles: WI }), /* @__PURE__ */ l.createElement(he, { filter: $I },
  ({ isFullscreen: f, isNavShown: b, selectedStoryId: m }) => f || !b || !m ? null : /* @__PURE__ */ l.createElement(zI, { asChild: !0 }, /* @__PURE__ */ l.
  createElement("a", { href: `#${m}`, tabIndex: 0, title: "Skip to sidebar" }, "Skip to sidebar"))), Object.entries(d).map(([f, b]) => /* @__PURE__ */ l.
  createElement(_e, { key: f }, /* @__PURE__ */ l.createElement(
    Sd,
    {
      active: f === p,
      key: f,
      id: f,
      title: f,
      src: b,
      allowFullScreen: !0,
      scale: t
    }
  ))));
}, "FramesRenderer");

// src/manager/components/preview/Preview.tsx
var KI = /* @__PURE__ */ a(({ state: e, api: t }) => ({
  storyId: e.storyId,
  refId: e.refId,
  viewMode: e.viewMode,
  customCanvas: t.renderPreview,
  queryParams: e.customQueryParams,
  getElements: t.getElements,
  entry: t.getData(e.storyId, e.refId),
  previewInitialized: e.previewInitialized,
  refs: e.refs
}), "canvasMapper"), cm = /* @__PURE__ */ a(() => ({
  id: "canvas",
  type: ve.TAB,
  title: "Canvas",
  route: /* @__PURE__ */ a(({ storyId: e, refId: t }) => t ? `/story/${t}_${e}` : `/story/${e}`, "route"),
  match: /* @__PURE__ */ a(({ viewMode: e }) => !!(e && e.match(/^(story|docs)$/)), "match"),
  render: /* @__PURE__ */ a(() => null, "render")
}), "createCanvasTab"), pm = l.memo(/* @__PURE__ */ a(function(t) {
  let {
    api: r,
    id: n,
    options: i,
    viewMode: o,
    storyId: s,
    entry: u = void 0,
    description: c,
    baseUrl: p,
    withLoader: d = !0,
    tools: h,
    toolsExtra: f,
    tabs: b,
    wrappers: m,
    tabId: v
  } = t, S = b.find((I) => I.id === v)?.render, C = o === "story", { showToolbar: g } = i, y = X(s);
  return V(() => {
    if (u && o) {
      if (s === y.current)
        return;
      if (y.current = s, o.match(/docs|story/)) {
        let { refId: I, id: E } = u;
        r.emit(is, {
          storyId: E,
          viewMode: o,
          options: { target: I }
        });
      }
    }
  }, [u, o, s, r]), /* @__PURE__ */ l.createElement(_e, null, n === "main" && /* @__PURE__ */ l.createElement(Cr, { key: "description" }, /* @__PURE__ */ l.
  createElement("title", null, c)), /* @__PURE__ */ l.createElement(so, { shouldScale: C }, /* @__PURE__ */ l.createElement(Jp, null, /* @__PURE__ */ l.
  createElement(
    bd,
    {
      key: "tools",
      isShown: g,
      tabId: v,
      tabs: b,
      tools: h,
      toolsExtra: f,
      api: r
    }
  ), /* @__PURE__ */ l.createElement(ed, { key: "frame" }, S && /* @__PURE__ */ l.createElement(ao, null, S({ active: !0 })), /* @__PURE__ */ l.
  createElement(td, { show: !v }, /* @__PURE__ */ l.createElement(VI, { withLoader: d, baseUrl: p, wrappers: m }))))));
}, "Preview"));
var VI = /* @__PURE__ */ a(({ baseUrl: e, withLoader: t, wrappers: r }) => /* @__PURE__ */ l.createElement(he, { filter: KI }, ({
  entry: n,
  refs: i,
  customCanvas: o,
  storyId: s,
  refId: u,
  viewMode: c,
  queryParams: p,
  previewInitialized: d
}) => {
  let h = "canvas", [f, b] = J(void 0);
  V(() => {
    if (ae.CONFIG_TYPE === "DEVELOPMENT")
      try {
        Ge.getChannel().on(rs, (y) => {
          b(y);
        });
      } catch {
      }
  }, []);
  let m = !!i[u] && !i[u].previewInitialized, v = !(f?.value === 1 || f === void 0), S = !u && (!d || v), C = n && m || S;
  return /* @__PURE__ */ l.createElement(ra, null, ({ value: g }) => /* @__PURE__ */ l.createElement(l.Fragment, null, t && C && /* @__PURE__ */ l.
  createElement(rd, null, /* @__PURE__ */ l.createElement(nn, { id: "preview-loader", role: "progressbar", progress: f })), /* @__PURE__ */ l.
  createElement(id, { id: h, storyId: s, viewMode: c, wrappers: r }, o ? o(s, c, h, e, g, p) : /* @__PURE__ */ l.createElement(
    um,
    {
      baseUrl: e,
      refs: i,
      scale: g,
      entry: n,
      viewMode: c,
      refId: u,
      queryParams: p,
      storyId: s
    }
  ))));
}), "Canvas");
function dm(e, t) {
  let { previewTabs: r } = Ge.getConfig(), n = t ? t.previewTabs : void 0;
  if (r || n) {
    let i = Ur(r, n), o = Object.keys(i).map((s, u) => ({
      index: u,
      ...typeof i[s] == "string" ? { title: i[s] } : i[s],
      id: s
    }));
    return e.filter((s) => {
      let u = o.find((c) => c.id === s.id);
      return u === void 0 || u.id === "canvas" || !u.hidden;
    }).map((s, u) => ({ ...s, index: u })).sort((s, u) => {
      let c = o.find((f) => f.id === s.id), p = c ? c.index : o.length + s.index, d = o.find((f) => f.id === u.id), h = d ? d.index : o.length +
      u.index;
      return p - h;
    }).map((s) => {
      let u = o.find((c) => c.id === s.id);
      return u ? {
        ...s,
        title: u.title || s.title,
        disabled: u.disabled,
        hidden: u.hidden
      } : s;
    });
  }
  return e;
}
a(dm, "filterTabs");

// src/manager/components/preview/tools/menu.tsx
var jI = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  isVisible: e.getIsNavShown(),
  singleStory: t.singleStory,
  toggle: /* @__PURE__ */ a(() => e.toggleNav(), "toggle")
}), "menuMapper"), fm = {
  title: "menu",
  id: "menu",
  type: ve.TOOL,
  // @ts-expect-error (non strict)
  match: /* @__PURE__ */ a(({ viewMode: e }) => ["story", "docs"].includes(e), "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(he, { filter: jI }, ({ isVisible: e, toggle: t, singleStory: r }) => !r &&
  !e && /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(ie, { "aria-label": "Show sidebar", key: "menu", onClick: t,
  title: "Show sidebar" }, /* @__PURE__ */ l.createElement(yn, null)), /* @__PURE__ */ l.createElement(qt, null))), "render")
};

// src/manager/container/Preview.tsx
var UI = [cm()], qI = [fm, gd, od], GI = [hd, vd, md, fd], YI = [], QI = (0, Wr.default)(1)(
  (e, t, r, n) => n ? dm([...UI, ...Object.values(t)], r) : YI
), XI = (0, Wr.default)(1)(
  (e, t, r) => oa([...qI, ...Object.values(t)], ...r)
), ZI = (0, Wr.default)(1)(
  (e, t, r) => oa([...GI, ...Object.values(t)], ...r)
), JI = (0, Wr.default)(1)((e, t) => [
  ...ad,
  ...Object.values(t)
]), { PREVIEW_URL: eS } = ae, tS = /* @__PURE__ */ a((e) => e.split("/").join(" / ").replace(/\s\s/, " "), "splitTitleAddExtraSpace"), rS = /* @__PURE__ */ a(
(e) => {
  if (e?.type === "story" || e?.type === "docs") {
    let { title: t, name: r } = e;
    return t && r ? tS(`${t} - ${r} \u22C5 Storybook`) : "Storybook";
  }
  return e?.name ? `${e.name} \u22C5 Storybook` : "Storybook";
}, "getDescription"), nS = /* @__PURE__ */ a(({
  api: e,
  state: t
  // @ts-expect-error (non strict)
}) => {
  let { layout: r, location: n, customQueryParams: i, storyId: o, refs: s, viewMode: u, path: c, refId: p } = t, d = e.getData(o, p), h = Object.
  values(e.getElements(ke.TAB)), f = Object.values(e.getElements(ke.PREVIEW)), b = Object.values(e.getElements(ke.TOOL)), m = Object.values(
  e.getElements(ke.TOOLEXTRA)), v = e.getQueryParam("tab"), S = XI(b.length, e.getElements(ke.TOOL), [
    d,
    u,
    n,
    c,
    // @ts-expect-error (non strict)
    v
  ]), C = ZI(
    m.length,
    e.getElements(ke.TOOLEXTRA),
    // @ts-expect-error (non strict)
    [d, u, n, c, v]
  );
  return {
    api: e,
    entry: d,
    options: r,
    description: rS(d),
    viewMode: u,
    refs: s,
    storyId: o,
    baseUrl: eS || "iframe.html",
    queryParams: i,
    tools: S,
    toolsExtra: C,
    tabs: QI(
      h.length,
      e.getElements(ke.TAB),
      d ? d.parameters : void 0,
      r.showTabs
    ),
    wrappers: JI(
      f.length,
      e.getElements(ke.PREVIEW)
    ),
    tabId: v
  };
}, "mapper"), oS = l.memo(/* @__PURE__ */ a(function(t) {
  return /* @__PURE__ */ l.createElement(he, { filter: nS }, (r) => /* @__PURE__ */ l.createElement(pm, { ...t, ...r }));
}, "PreviewConnected")), mm = oS;

// src/manager/container/Panel.tsx
var hm = Fe(xn(), 1);

// src/manager/components/panel/Panel.tsx
var Da = class Da extends He {
  constructor(t) {
    super(t), this.state = { hasError: !1 };
  }
  componentDidCatch(t, r) {
    this.setState({ hasError: !0 }), console.error(t, r);
  }
  // @ts-expect-error (we know this is broken)
  render() {
    let { hasError: t } = this.state, { children: r } = this.props;
    return t ? /* @__PURE__ */ l.createElement("h1", null, "Something went wrong.") : r;
  }
};
a(Da, "SafeTab");
var Aa = Da, Ma = l.memo(
  ({
    panels: e,
    shortcuts: t,
    actions: r,
    selectedPanel: n = null,
    panelPosition: i = "right",
    absolute: o = !0
  }) => {
    let { isDesktop: s, setMobilePanelOpen: u } = Ee();
    return /* @__PURE__ */ l.createElement(
      Us,
      {
        absolute: o,
        ...n ? { selected: n } : {},
        menuName: "Addons",
        actions: r,
        showToolsWhenEmpty: !0,
        emptyState: /* @__PURE__ */ l.createElement(
          Ks,
          {
            title: "Storybook add-ons",
            description: /* @__PURE__ */ l.createElement(l.Fragment, null, "Integrate your tools with Storybook to connect workflows and unl\
ock advanced features."),
            footer: /* @__PURE__ */ l.createElement(De, { href: "https://storybook.js.org/integrations", target: "_blank", withArrow: !0 }, /* @__PURE__ */ l.
            createElement(er, null), " Explore integrations catalog")
          }
        ),
        tools: /* @__PURE__ */ l.createElement(iS, null, s ? /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(
          ie,
          {
            key: "position",
            onClick: r.togglePosition,
            title: `Change addon orientation [${Ye(
              t.panelPosition
            )}]`
          },
          i === "bottom" ? /* @__PURE__ */ l.createElement(bn, null) : /* @__PURE__ */ l.createElement(fn, null)
        ), /* @__PURE__ */ l.createElement(
          ie,
          {
            key: "visibility",
            onClick: r.toggleVisibility,
            title: `Hide addons [${Ye(t.togglePanel)}]`
          },
          /* @__PURE__ */ l.createElement(Qe, null)
        )) : /* @__PURE__ */ l.createElement(ie, { onClick: () => u(!1), title: "Close addon panel" }, /* @__PURE__ */ l.createElement(Qe, null))),
        id: "storybook-panel-root"
      },
      Object.entries(e).map(([c, p]) => (
        // @ts-expect-error (we know this is broken)
        /* @__PURE__ */ l.createElement(Aa, { key: c, id: c, title: typeof p.title == "function" ? /* @__PURE__ */ l.createElement(p.title, null) :
        p.title }, p.render)
      ))
    );
  }
);
Ma.displayName = "AddonPanel";
var iS = x.div({
  display: "flex",
  alignItems: "center",
  gap: 6
});

// src/manager/container/Panel.tsx
var aS = (0, hm.default)(1)((e) => ({
  onSelect: /* @__PURE__ */ a((t) => e.setSelectedPanel(t), "onSelect"),
  toggleVisibility: /* @__PURE__ */ a(() => e.togglePanel(), "toggleVisibility"),
  togglePosition: /* @__PURE__ */ a(() => e.togglePanelPosition(), "togglePosition")
})), sS = /* @__PURE__ */ a((e) => {
  let t = e.getElements(ke.PANEL), r = e.getCurrentStoryData();
  if (!t || !r || r.type !== "story")
    return t;
  let { parameters: n } = r, i = {};
  return Object.entries(t).forEach(([o, s]) => {
    let { paramKey: u } = s;
    u && n && n[u] && n[u].disable || (i[o] = s);
  }), i;
}, "getPanels"), lS = /* @__PURE__ */ a(({ state: e, api: t }) => ({
  panels: sS(t),
  selectedPanel: t.getSelectedPanel(),
  panelPosition: e.layout.panelPosition,
  actions: aS(t),
  shortcuts: t.getShortcutKeys()
}), "mapper"), uS = /* @__PURE__ */ a((e) => /* @__PURE__ */ l.createElement(he, { filter: lS }, (t) => /* @__PURE__ */ l.createElement(Ma, {
...e, ...t })), "Panel"), gm = uS;

// src/manager/components/layout/useDragging.ts
var ym = 30, Eo = 240, Co = 270, vm = 0.9;
function bm(e, t, r) {
  return Math.min(Math.max(e, t), r);
}
a(bm, "clamp");
function Im(e, t, r) {
  return t + (r - t) * e;
}
a(Im, "interpolate");
function Sm({
  setState: e,
  isPanelShown: t,
  isDesktop: r
}) {
  let n = X(null), i = X(null);
  return V(() => {
    let o = n.current, s = i.current, u = document.querySelector("#storybook-preview-iframe"), c = null, p = /* @__PURE__ */ a((f) => {
      f.preventDefault(), e((b) => ({
        ...b,
        isDragging: !0
      })), f.currentTarget === o ? c = o : f.currentTarget === s && (c = s), window.addEventListener("mousemove", h), window.addEventListener(
      "mouseup", d), u && (u.style.pointerEvents = "none");
    }, "onDragStart"), d = /* @__PURE__ */ a((f) => {
      e((b) => c === s && b.navSize < Eo && b.navSize > 0 ? {
        ...b,
        isDragging: !1,
        navSize: Eo
      } : c === o && b.panelPosition === "right" && b.rightPanelWidth < Co && b.rightPanelWidth > 0 ? {
        ...b,
        isDragging: !1,
        rightPanelWidth: Co
      } : {
        ...b,
        isDragging: !1
      }), window.removeEventListener("mousemove", h), window.removeEventListener("mouseup", d), u?.removeAttribute("style"), c = null;
    }, "onDragEnd"), h = /* @__PURE__ */ a((f) => {
      if (f.buttons === 0) {
        d(f);
        return;
      }
      e((b) => {
        if (c === s) {
          let m = f.clientX;
          return m === b.navSize ? b : m <= ym ? {
            ...b,
            navSize: 0
          } : m <= Eo ? {
            ...b,
            navSize: Im(vm, m, Eo)
          } : {
            ...b,
            // @ts-expect-error (non strict)
            navSize: bm(m, 0, f.view.innerWidth)
          };
        }
        if (c === o) {
          let m = b.panelPosition === "bottom" ? "bottomPanelHeight" : "rightPanelWidth", v = b.panelPosition === "bottom" ? (
            // @ts-expect-error (non strict)
            f.view.innerHeight - f.clientY
          ) : (
            // @ts-expect-error (non strict)
            f.view.innerWidth - f.clientX
          );
          if (v === b[m])
            return b;
          if (v <= ym)
            return {
              ...b,
              [m]: 0
            };
          if (b.panelPosition === "right" && v <= Co)
            return {
              ...b,
              [m]: Im(
                vm,
                v,
                Co
              )
            };
          let S = (
            // @ts-expect-error (non strict)
            b.panelPosition === "bottom" ? f.view.innerHeight : f.view.innerWidth
          );
          return {
            ...b,
            [m]: bm(v, 0, S)
          };
        }
        return b;
      });
    }, "onDrag");
    return o?.addEventListener("mousedown", p), s?.addEventListener("mousedown", p), () => {
      o?.removeEventListener("mousedown", p), s?.removeEventListener("mousedown", p), u?.removeAttribute("style");
    };
  }, [
    // we need to rerun this effect when the panel is shown/hidden or when changing between mobile/desktop to re-attach the event listeners
    t,
    r,
    e
  ]), { panelResizerRef: n, sidebarResizerRef: i };
}
a(Sm, "useDragging");

// ../node_modules/react-transition-group/esm/config.js
var La = {
  disabled: !1
};

// ../node_modules/react-transition-group/esm/TransitionGroupContext.js
var Na = l.createContext(null);

// ../node_modules/react-transition-group/esm/utils/reflow.js
var xm = /* @__PURE__ */ a(function(t) {
  return t.scrollTop;
}, "forceReflow");

// ../node_modules/react-transition-group/esm/Transition.js
var Kr = "unmounted", Bt = "exited", Rt = "entering", yr = "entered", Fa = "exiting", ut = /* @__PURE__ */ function(e) {
  Qt(t, e);
  function t(n, i) {
    var o;
    o = e.call(this, n, i) || this;
    var s = i, u = s && !s.isMounting ? n.enter : n.appear, c;
    return o.appearStatus = null, n.in ? u ? (c = Bt, o.appearStatus = Rt) : c = yr : n.unmountOnExit || n.mountOnEnter ? c = Kr : c = Bt, o.
    state = {
      status: c
    }, o.nextCallback = null, o;
  }
  a(t, "Transition"), t.getDerivedStateFromProps = /* @__PURE__ */ a(function(i, o) {
    var s = i.in;
    return s && o.status === Kr ? {
      status: Bt
    } : null;
  }, "getDerivedStateFromProps");
  var r = t.prototype;
  return r.componentDidMount = /* @__PURE__ */ a(function() {
    this.updateStatus(!0, this.appearStatus);
  }, "componentDidMount"), r.componentDidUpdate = /* @__PURE__ */ a(function(i) {
    var o = null;
    if (i !== this.props) {
      var s = this.state.status;
      this.props.in ? s !== Rt && s !== yr && (o = Rt) : (s === Rt || s === yr) && (o = Fa);
    }
    this.updateStatus(!1, o);
  }, "componentDidUpdate"), r.componentWillUnmount = /* @__PURE__ */ a(function() {
    this.cancelNextCallback();
  }, "componentWillUnmount"), r.getTimeouts = /* @__PURE__ */ a(function() {
    var i = this.props.timeout, o, s, u;
    return o = s = u = i, i != null && typeof i != "number" && (o = i.exit, s = i.enter, u = i.appear !== void 0 ? i.appear : s), {
      exit: o,
      enter: s,
      appear: u
    };
  }, "getTimeouts"), r.updateStatus = /* @__PURE__ */ a(function(i, o) {
    if (i === void 0 && (i = !1), o !== null)
      if (this.cancelNextCallback(), o === Rt) {
        if (this.props.unmountOnExit || this.props.mountOnEnter) {
          var s = this.props.nodeRef ? this.props.nodeRef.current : Lr.findDOMNode(this);
          s && xm(s);
        }
        this.performEnter(i);
      } else
        this.performExit();
    else this.props.unmountOnExit && this.state.status === Bt && this.setState({
      status: Kr
    });
  }, "updateStatus"), r.performEnter = /* @__PURE__ */ a(function(i) {
    var o = this, s = this.props.enter, u = this.context ? this.context.isMounting : i, c = this.props.nodeRef ? [u] : [Lr.findDOMNode(this),
    u], p = c[0], d = c[1], h = this.getTimeouts(), f = u ? h.appear : h.enter;
    if (!i && !s || La.disabled) {
      this.safeSetState({
        status: yr
      }, function() {
        o.props.onEntered(p);
      });
      return;
    }
    this.props.onEnter(p, d), this.safeSetState({
      status: Rt
    }, function() {
      o.props.onEntering(p, d), o.onTransitionEnd(f, function() {
        o.safeSetState({
          status: yr
        }, function() {
          o.props.onEntered(p, d);
        });
      });
    });
  }, "performEnter"), r.performExit = /* @__PURE__ */ a(function() {
    var i = this, o = this.props.exit, s = this.getTimeouts(), u = this.props.nodeRef ? void 0 : Lr.findDOMNode(this);
    if (!o || La.disabled) {
      this.safeSetState({
        status: Bt
      }, function() {
        i.props.onExited(u);
      });
      return;
    }
    this.props.onExit(u), this.safeSetState({
      status: Fa
    }, function() {
      i.props.onExiting(u), i.onTransitionEnd(s.exit, function() {
        i.safeSetState({
          status: Bt
        }, function() {
          i.props.onExited(u);
        });
      });
    });
  }, "performExit"), r.cancelNextCallback = /* @__PURE__ */ a(function() {
    this.nextCallback !== null && (this.nextCallback.cancel(), this.nextCallback = null);
  }, "cancelNextCallback"), r.safeSetState = /* @__PURE__ */ a(function(i, o) {
    o = this.setNextCallback(o), this.setState(i, o);
  }, "safeSetState"), r.setNextCallback = /* @__PURE__ */ a(function(i) {
    var o = this, s = !0;
    return this.nextCallback = function(u) {
      s && (s = !1, o.nextCallback = null, i(u));
    }, this.nextCallback.cancel = function() {
      s = !1;
    }, this.nextCallback;
  }, "setNextCallback"), r.onTransitionEnd = /* @__PURE__ */ a(function(i, o) {
    this.setNextCallback(o);
    var s = this.props.nodeRef ? this.props.nodeRef.current : Lr.findDOMNode(this), u = i == null && !this.props.addEndListener;
    if (!s || u) {
      setTimeout(this.nextCallback, 0);
      return;
    }
    if (this.props.addEndListener) {
      var c = this.props.nodeRef ? [this.nextCallback] : [s, this.nextCallback], p = c[0], d = c[1];
      this.props.addEndListener(p, d);
    }
    i != null && setTimeout(this.nextCallback, i);
  }, "onTransitionEnd"), r.render = /* @__PURE__ */ a(function() {
    var i = this.state.status;
    if (i === Kr)
      return null;
    var o = this.props, s = o.children, u = o.in, c = o.mountOnEnter, p = o.unmountOnExit, d = o.appear, h = o.enter, f = o.exit, b = o.timeout,
    m = o.addEndListener, v = o.onEnter, S = o.onEntering, C = o.onEntered, g = o.onExit, y = o.onExiting, I = o.onExited, E = o.nodeRef, T = Oe(
    o, ["children", "in", "mountOnEnter", "unmountOnExit", "appear", "enter", "exit", "timeout", "addEndListener", "onEnter", "onEntering", "\
onEntered", "onExit", "onExiting", "onExited", "nodeRef"]);
    return (
      // allows for nested Transitions
      /* @__PURE__ */ l.createElement(Na.Provider, {
        value: null
      }, typeof s == "function" ? s(i, T) : l.cloneElement(l.Children.only(s), T))
    );
  }, "render"), t;
}(l.Component);
ut.contextType = Na;
ut.propTypes = {};
function gr() {
}
a(gr, "noop");
ut.defaultProps = {
  in: !1,
  mountOnEnter: !1,
  unmountOnExit: !1,
  appear: !1,
  enter: !0,
  exit: !0,
  onEnter: gr,
  onEntering: gr,
  onEntered: gr,
  onExit: gr,
  onExiting: gr,
  onExited: gr
};
ut.UNMOUNTED = Kr;
ut.EXITED = Bt;
ut.ENTERING = Rt;
ut.ENTERED = yr;
ut.EXITING = Fa;
var zt = ut;

// src/manager/components/upgrade/UpgradeBlock.tsx
var To = /* @__PURE__ */ a(({ onNavigateToWhatsNew: e }) => {
  let t = me(), [r, n] = J("npm");
  return /* @__PURE__ */ l.createElement(cS, null, /* @__PURE__ */ l.createElement("strong", null, "You are on Storybook ", t.getCurrentVersion().
  version), /* @__PURE__ */ l.createElement("p", null, "Run the following script to check for updates and upgrade to the latest version."), /* @__PURE__ */ l.
  createElement(pS, null, /* @__PURE__ */ l.createElement(wm, { active: r === "npm", onClick: () => n("npm") }, "npm"), /* @__PURE__ */ l.createElement(
  wm, { active: r === "pnpm", onClick: () => n("pnpm") }, "pnpm")), /* @__PURE__ */ l.createElement(dS, null, r === "npm" ? "npx storybook@l\
atest upgrade" : "pnpm dlx storybook@latest upgrade"), e && // eslint-disable-next-line jsx-a11y/anchor-is-valid
  /* @__PURE__ */ l.createElement(De, { onClick: e }, "See what's new in Storybook"));
}, "UpgradeBlock"), cS = x.div(({ theme: e }) => ({
  border: "1px solid",
  borderRadius: 5,
  padding: 20,
  marginTop: 0,
  borderColor: e.appBorderColor,
  fontSize: e.typography.size.s2,
  width: "100%",
  [st]: {
    maxWidth: 400
  }
})), pS = x.div({
  display: "flex",
  gap: 2
}), dS = x.pre(({ theme: e }) => ({
  background: e.base === "light" ? "rgba(0, 0, 0, 0.05)" : e.appBorderColor,
  fontSize: e.typography.size.s2 - 1,
  margin: "4px 0 16px"
})), wm = x.button(({ theme: e, active: t }) => ({
  all: "unset",
  alignItems: "center",
  gap: 10,
  color: e.color.defaultText,
  fontSize: e.typography.size.s2 - 1,
  borderBottom: "2px solid transparent",
  borderBottomColor: t ? e.color.secondary : "none",
  padding: "0 10px 5px",
  marginBottom: "5px",
  cursor: "pointer"
}));

// src/manager/components/mobile/about/MobileAbout.tsx
var Tm = /* @__PURE__ */ a(() => {
  let { isMobileAboutOpen: e, setMobileAboutOpen: t } = Ee(), r = X(null);
  return /* @__PURE__ */ l.createElement(
    zt,
    {
      nodeRef: r,
      in: e,
      timeout: 300,
      appear: !0,
      mountOnEnter: !0,
      unmountOnExit: !0
    },
    (n) => /* @__PURE__ */ l.createElement(fS, { ref: r, state: n, transitionDuration: 300 }, /* @__PURE__ */ l.createElement(gS, { onClick: () => t(
    !1), title: "Close about section" }, /* @__PURE__ */ l.createElement(il, null), "Back"), /* @__PURE__ */ l.createElement(mS, null, /* @__PURE__ */ l.
    createElement(Em, { href: "https://github.com/storybookjs/storybook", target: "_blank" }, /* @__PURE__ */ l.createElement(Cm, null, /* @__PURE__ */ l.
    createElement(hn, null), /* @__PURE__ */ l.createElement("span", null, "Github")), /* @__PURE__ */ l.createElement(Ct, { width: 12 })), /* @__PURE__ */ l.
    createElement(
      Em,
      {
        href: "https://storybook.js.org/docs/react/get-started/install/",
        target: "_blank"
      },
      /* @__PURE__ */ l.createElement(Cm, null, /* @__PURE__ */ l.createElement(bl, null), /* @__PURE__ */ l.createElement("span", null, "Do\
cumentation")),
      /* @__PURE__ */ l.createElement(Ct, { width: 12 })
    )), /* @__PURE__ */ l.createElement(To, null), /* @__PURE__ */ l.createElement(hS, null, "Open source software maintained by", " ", /* @__PURE__ */ l.
    createElement(De, { href: "https://chromatic.com", target: "_blank" }, "Chromatic"), " ", "and the", " ", /* @__PURE__ */ l.createElement(
    De, { href: "https://github.com/storybookjs/storybook/graphs/contributors" }, "Storybook Community")))
  );
}, "MobileAbout"), fS = x.div(
  ({ theme: e, state: t, transitionDuration: r }) => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 11,
    transition: `all ${r}ms ease-in-out`,
    overflow: "scroll",
    padding: "25px 10px 10px",
    color: e.color.defaultText,
    background: e.background.content,
    opacity: `${(() => {
      switch (t) {
        case "entering":
        case "entered":
          return 1;
        case "exiting":
        case "exited":
          return 0;
        default:
          return 0;
      }
    })()}`,
    transform: `${(() => {
      switch (t) {
        case "entering":
        case "entered":
          return "translateX(0)";
        case "exiting":
        case "exited":
          return "translateX(20px)";
        default:
          return "translateX(0)";
      }
    })()}`
  })
), mS = x.div({
  marginTop: 20,
  marginBottom: 20
}), Em = x.a(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: e.typography.size.s2 - 1,
  height: 52,
  borderBottom: `1px solid ${e.appBorderColor}`,
  cursor: "pointer",
  padding: "0 10px",
  "&:last-child": {
    borderBottom: "none"
  }
})), Cm = x.div(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  fontSize: e.typography.size.s2 - 1,
  height: 40,
  gap: 5
})), hS = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2 - 1,
  marginTop: 30
})), gS = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "currentColor",
  fontSize: e.typography.size.s2 - 1,
  padding: "0 10px"
}));

// src/manager/components/mobile/navigation/MobileMenuDrawer.tsx
var _m = /* @__PURE__ */ a(({ children: e }) => {
  let t = X(null), r = X(null), n = X(null), { isMobileMenuOpen: i, setMobileMenuOpen: o, isMobileAboutOpen: s, setMobileAboutOpen: u } = Ee();
  return /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(
    zt,
    {
      nodeRef: t,
      in: i,
      timeout: 300,
      mountOnEnter: !0,
      unmountOnExit: !0,
      onExited: () => u(!1)
    },
    (c) => /* @__PURE__ */ l.createElement(yS, { ref: t, state: c }, /* @__PURE__ */ l.createElement(
      zt,
      {
        nodeRef: r,
        in: !s,
        timeout: 300
      },
      (p) => /* @__PURE__ */ l.createElement(vS, { ref: r, state: p }, e)
    ), /* @__PURE__ */ l.createElement(Tm, null))
  ), /* @__PURE__ */ l.createElement(
    zt,
    {
      nodeRef: n,
      in: i,
      timeout: 300,
      mountOnEnter: !0,
      unmountOnExit: !0
    },
    (c) => /* @__PURE__ */ l.createElement(
      bS,
      {
        ref: n,
        state: c,
        onClick: () => o(!1),
        "aria-label": "Close navigation menu"
      }
    )
  ));
}, "MobileMenuDrawer"), yS = x.div(({ theme: e, state: t }) => ({
  position: "fixed",
  boxSizing: "border-box",
  width: "100%",
  background: e.background.content,
  height: "80%",
  bottom: 0,
  left: 0,
  zIndex: 11,
  borderRadius: "10px 10px 0 0",
  transition: `all ${300}ms ease-in-out`,
  overflow: "hidden",
  transform: `${t === "entering" || t === "entered" ? "translateY(0)" : t === "exiting" || t === "exited" ? "translateY(100%)" : "translateY\
(0)"}`
})), vS = x.div(({ theme: e, state: t }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  zIndex: 1,
  transition: `all ${300}ms ease-in-out`,
  overflow: "hidden",
  opacity: `${t === "entered" || t === "entering" ? 1 : t === "exiting" || t === "exited" ? 0 : 1}`,
  transform: `${(() => {
    switch (t) {
      case "entering":
      case "entered":
        return "translateX(0)";
      case "exiting":
      case "exited":
        return "translateX(-20px)";
      default:
        return "translateX(0)";
    }
  })()}`
})), bS = x.div(({ state: e }) => ({
  position: "fixed",
  boxSizing: "border-box",
  background: "rgba(0, 0, 0, 0.5)",
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 10,
  transition: `all ${300}ms ease-in-out`,
  cursor: "pointer",
  opacity: `${(() => {
    switch (e) {
      case "entering":
      case "entered":
        return 1;
      case "exiting":
      case "exited":
        return 0;
      default:
        return 0;
    }
  })()}`,
  "&:hover": {
    background: "rgba(0, 0, 0, 0.6)"
  }
}));

// src/manager/components/mobile/navigation/MobileAddonsDrawer.tsx
var IS = x.div(({ theme: e }) => ({
  position: "relative",
  boxSizing: "border-box",
  width: "100%",
  background: e.background.content,
  height: "42vh",
  zIndex: 11,
  overflow: "hidden"
})), km = /* @__PURE__ */ a(({ children: e }) => /* @__PURE__ */ l.createElement(IS, null, e), "MobileAddonsDrawer");

// src/manager/components/mobile/navigation/MobileNavigation.tsx
var SS = /* @__PURE__ */ a(() => {
  let { index: e } = et(), t = me(), r = t.getCurrentStoryData();
  if (!r) return "";
  let n = r.renderLabel?.(r, t) || r.name, i = e[r.id];
  for (; "parent" in i && i.parent && e[i.parent] && n.length < 24; )
    i = e[i.parent], n = `${i.renderLabel?.(i, t) || i.name}/${n}`;
  return n;
}, "useFullStoryName"), Om = /* @__PURE__ */ a(({ menu: e, panel: t, showPanel: r }) => {
  let { isMobileMenuOpen: n, isMobilePanelOpen: i, setMobileMenuOpen: o, setMobilePanelOpen: s } = Ee(), u = SS();
  return /* @__PURE__ */ l.createElement(xS, null, /* @__PURE__ */ l.createElement(_m, null, e), i ? /* @__PURE__ */ l.createElement(km, null,
  t) : /* @__PURE__ */ l.createElement(wS, { className: "sb-bar" }, /* @__PURE__ */ l.createElement(ES, { onClick: () => o(!n), title: "Open\
 navigation menu" }, /* @__PURE__ */ l.createElement(yn, null), /* @__PURE__ */ l.createElement(CS, null, u)), r && /* @__PURE__ */ l.createElement(
  ie, { onClick: () => s(!0), title: "Open addon panel" }, /* @__PURE__ */ l.createElement(al, null))));
}, "MobileNavigation"), xS = x.div(({ theme: e }) => ({
  bottom: 0,
  left: 0,
  width: "100%",
  zIndex: 10,
  background: e.barBg,
  borderTop: `1px solid ${e.appBorderColor}`
})), wS = x.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: 40,
  padding: "0 6px"
}), ES = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: e.barTextColor,
  fontSize: `${e.typography.size.s2 - 1}px`,
  padding: "0 7px",
  fontWeight: e.typography.weight.bold,
  WebkitLineClamp: 1,
  "> svg": {
    width: 14,
    height: 14,
    flexShrink: 0
  }
})), CS = x.p({
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
});

// src/manager/components/notifications/NotificationItem.tsx
var TS = xr({
  "0%": {
    opacity: 0,
    transform: "translateY(30px)"
  },
  "100%": {
    opacity: 1,
    transform: "translateY(0)"
  }
}), _S = xr({
  "0%": {
    width: "0%"
  },
  "100%": {
    width: "100%"
  }
}), Pm = x.div(
  ({ theme: e }) => ({
    position: "relative",
    display: "flex",
    padding: 15,
    width: 280,
    borderRadius: 4,
    alignItems: "center",
    animation: `${TS} 500ms`,
    background: e.base === "light" ? "hsla(203, 50%, 20%, .97)" : "hsla(203, 30%, 95%, .97)",
    boxShadow: "0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)",
    color: e.color.inverseText,
    textDecoration: "none",
    overflow: "hidden"
  }),
  ({ duration: e, theme: t }) => e && {
    "&::after": {
      content: '""',
      display: "block",
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 3,
      background: t.color.secondary,
      animation: `${_S} ${e}ms linear forwards reverse`
    }
  }
), Am = x(Pm)(() => ({
  cursor: "pointer",
  border: "none",
  outline: "none",
  textAlign: "left",
  transition: "all 150ms ease-out",
  transform: "translate3d(0, 0, 0)",
  "&:hover": {
    transform: "translate3d(0, -3px, 0)",
    boxShadow: "0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)"
  },
  "&:active": {
    transform: "translate3d(0, 0, 0)",
    boxShadow: "0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)"
  },
  "&:focus": {
    boxShadow: "rgba(2,156,253,1) 0 0 0 1px inset, 0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0\
.1)"
  }
})), kS = Am.withComponent("div"), OS = Am.withComponent(Yr), PS = x.div(() => ({
  display: "flex",
  marginRight: 10,
  alignItems: "center",
  svg: {
    width: 16,
    height: 16
  }
})), AS = x.div(({ theme: e }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  color: e.base === "dark" ? e.color.mediumdark : e.color.mediumlight
})), MS = x.div(({ theme: e, hasIcon: t }) => ({
  height: "100%",
  width: t ? 205 : 230,
  alignItems: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: e.typography.size.s1,
  lineHeight: "16px",
  fontWeight: e.typography.weight.bold
})), DS = x.div(({ theme: e }) => ({
  color: ge(0.25, e.color.inverseText),
  fontSize: e.typography.size.s1 - 1,
  lineHeight: "14px",
  marginTop: 2
})), Ha = /* @__PURE__ */ a(({
  icon: e,
  content: { headline: t, subHeadline: r }
}) => {
  let n = Re(), i = n.base === "dark" ? n.color.mediumdark : n.color.mediumlight;
  return /* @__PURE__ */ l.createElement(l.Fragment, null, !e || /* @__PURE__ */ l.createElement(PS, null, l.isValidElement(e) ? e : typeof e ==
  "object" && "name" in e && /* @__PURE__ */ l.createElement(js, { icon: e.name, color: e.color || i })), /* @__PURE__ */ l.createElement(AS,
  null, /* @__PURE__ */ l.createElement(MS, { title: t, hasIcon: !!e }, t), r && /* @__PURE__ */ l.createElement(DS, null, r)));
}, "ItemContent"), LS = x(ie)(({ theme: e }) => ({
  alignSelf: "center",
  marginTop: 0,
  color: e.base === "light" ? "rgba(255,255,255,0.7)" : " #999999"
})), Ba = /* @__PURE__ */ a(({ onDismiss: e }) => /* @__PURE__ */ l.createElement(
  LS,
  {
    title: "Dismiss notification",
    onClick: (t) => {
      t.preventDefault(), t.stopPropagation(), e();
    }
  },
  /* @__PURE__ */ l.createElement(mn, { size: 12 })
), "DismissNotificationItem"), v2 = x.div({
  height: 48
}), NS = /* @__PURE__ */ a(({
  notification: { content: e, duration: t, link: r, onClear: n, onClick: i, id: o, icon: s },
  onDismissNotification: u
}) => {
  let c = A(() => {
    u(o), n && n({ dismissed: !1, timeout: !0 });
  }, [u, n]), p = X(null);
  V(() => {
    if (t)
      return p.current = setTimeout(c, t), () => clearTimeout(p.current);
  }, [t, c]);
  let d = A(() => {
    clearTimeout(p.current), u(o), n && n({ dismissed: !0, timeout: !1 });
  }, [u, n]);
  return r ? /* @__PURE__ */ l.createElement(OS, { to: r, duration: t }, /* @__PURE__ */ l.createElement(Ha, { icon: s, content: e }), /* @__PURE__ */ l.
  createElement(Ba, { onDismiss: d })) : i ? /* @__PURE__ */ l.createElement(kS, { duration: t, onClick: () => i({ onDismiss: d }) }, /* @__PURE__ */ l.
  createElement(Ha, { icon: s, content: e }), /* @__PURE__ */ l.createElement(Ba, { onDismiss: d })) : /* @__PURE__ */ l.createElement(Pm, {
  duration: t }, /* @__PURE__ */ l.createElement(Ha, { icon: s, content: e }), /* @__PURE__ */ l.createElement(Ba, { onDismiss: d }));
}, "NotificationItem"), Mm = NS;

// src/manager/components/notifications/NotificationList.tsx
var Dm = /* @__PURE__ */ a(({
  notifications: e,
  clearNotification: t
}) => /* @__PURE__ */ l.createElement(FS, null, e && e.map((r) => /* @__PURE__ */ l.createElement(
  Mm,
  {
    key: r.id,
    onDismissNotification: (n) => t(n),
    notification: r
  }
))), "NotificationList"), FS = x.div({
  zIndex: 200,
  position: "fixed",
  left: 20,
  bottom: 60,
  [st]: {
    bottom: 20
  },
  "> * + *": {
    marginTop: 10
  },
  "&:empty": {
    display: "none"
  }
});

// src/manager/container/Notifications.tsx
var HS = /* @__PURE__ */ a(({ state: e, api: t }) => ({
  notifications: e.notifications,
  clearNotification: t.clearNotification
}), "mapper"), Lm = /* @__PURE__ */ a((e) => /* @__PURE__ */ l.createElement(he, { filter: HS }, (t) => /* @__PURE__ */ l.createElement(Dm, {
...e, ...t })), "Notifications");

// src/manager/components/layout/Layout.tsx
var BS = 100, Nm = /* @__PURE__ */ a((e, t) => e.navSize === t.navSize && e.bottomPanelHeight === t.bottomPanelHeight && e.rightPanelWidth ===
t.rightPanelWidth && e.panelPosition === t.panelPosition, "layoutStateIsEqual"), RS = /* @__PURE__ */ a(({
  managerLayoutState: e,
  setManagerLayoutState: t,
  isDesktop: r,
  hasTab: n
}) => {
  let i = l.useRef(e), [o, s] = J({
    ...e,
    isDragging: !1
  });
  V(() => {
    o.isDragging || // don't interrupt user's drag
    Nm(e, i.current) || (i.current = e, s((m) => ({ ...m, ...e })));
  }, [o.isDragging, e, s]), Wt(() => {
    if (o.isDragging || // wait with syncing managerLayoutState until user is done dragging
    Nm(e, o))
      return;
    let m = {
      navSize: o.navSize,
      bottomPanelHeight: o.bottomPanelHeight,
      rightPanelWidth: o.rightPanelWidth
    };
    i.current = {
      ...i.current,
      ...m
    }, t(m);
  }, [o, t]);
  let u = e.viewMode !== "story" && e.viewMode !== "docs", c = e.viewMode === "story" && !n, { panelResizerRef: p, sidebarResizerRef: d } = Sm(
  {
    setState: s,
    isPanelShown: c,
    isDesktop: r
  }), { navSize: h, rightPanelWidth: f, bottomPanelHeight: b } = o.isDragging ? o : e;
  return {
    navSize: h,
    rightPanelWidth: f,
    bottomPanelHeight: b,
    panelPosition: e.panelPosition,
    panelResizerRef: p,
    sidebarResizerRef: d,
    showPages: u,
    showPanel: c,
    isDragging: o.isDragging
  };
}, "useLayoutSyncingState"), Hm = /* @__PURE__ */ a(({ managerLayoutState: e, setManagerLayoutState: t, hasTab: r, ...n }) => {
  let { isDesktop: i, isMobile: o } = Ee(), {
    navSize: s,
    rightPanelWidth: u,
    bottomPanelHeight: c,
    panelPosition: p,
    panelResizerRef: d,
    sidebarResizerRef: h,
    showPages: f,
    showPanel: b,
    isDragging: m
  } = RS({ managerLayoutState: e, setManagerLayoutState: t, isDesktop: i, hasTab: r });
  return /* @__PURE__ */ l.createElement(
    zS,
    {
      navSize: s,
      rightPanelWidth: u,
      bottomPanelHeight: c,
      panelPosition: e.panelPosition,
      isDragging: m,
      viewMode: e.viewMode,
      showPanel: b
    },
    /* @__PURE__ */ l.createElement(Lm, null),
    f && /* @__PURE__ */ l.createElement(KS, null, n.slotPages),
    /* @__PURE__ */ l.createElement(fs, { path: /(^\/story|docs|onboarding\/|^\/$)/, startsWith: !1 }, ({ match: v }) => /* @__PURE__ */ l.createElement(
    WS, { shown: !!v }, n.slotMain)),
    i && /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement($S, null, /* @__PURE__ */ l.createElement(Fm, { ref: h }),
    n.slotSidebar), b && /* @__PURE__ */ l.createElement(VS, { position: p }, /* @__PURE__ */ l.createElement(
      Fm,
      {
        orientation: p === "bottom" ? "horizontal" : "vertical",
        position: p === "bottom" ? "left" : "right",
        ref: d
      }
    ), n.slotPanel)),
    o && /* @__PURE__ */ l.createElement(Om, { menu: n.slotSidebar, panel: n.slotPanel, showPanel: b })
  );
}, "Layout"), zS = x.div(
  ({ navSize: e, rightPanelWidth: t, bottomPanelHeight: r, viewMode: n, panelPosition: i, showPanel: o }) => ({
    width: "100%",
    height: ["100vh", "100dvh"],
    // This array is a special Emotion syntax to set a fallback if 100dvh is not supported
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    [st]: {
      display: "grid",
      gap: 0,
      gridTemplateColumns: `minmax(0, ${e}px) minmax(${BS}px, 1fr) minmax(0, ${t}px)`,
      gridTemplateRows: `1fr minmax(0, ${r}px)`,
      gridTemplateAreas: n === "docs" || !o ? `"sidebar content content"
                  "sidebar content content"` : i === "right" ? `"sidebar content panel"
                  "sidebar content panel"` : `"sidebar content content"
                "sidebar panel   panel"`
    }
  })
), $S = x.div(({ theme: e }) => ({
  backgroundColor: e.background.app,
  gridArea: "sidebar",
  position: "relative",
  borderRight: `1px solid ${e.color.border}`
})), WS = x.div(({ theme: e, shown: t }) => ({
  flex: 1,
  position: "relative",
  backgroundColor: e.background.content,
  display: t ? "grid" : "none",
  // This is needed to make the content container fill the available space
  overflow: "auto",
  [st]: {
    flex: "auto",
    gridArea: "content"
  }
})), KS = x.div(({ theme: e }) => ({
  gridRowStart: "sidebar-start",
  gridRowEnd: "-1",
  gridColumnStart: "sidebar-end",
  gridColumnEnd: "-1",
  backgroundColor: e.background.content,
  zIndex: 1
})), VS = x.div(
  ({ theme: e, position: t }) => ({
    gridArea: "panel",
    position: "relative",
    backgroundColor: e.background.content,
    borderTop: t === "bottom" ? `1px solid ${e.color.border}` : void 0,
    borderLeft: t === "right" ? `1px solid ${e.color.border}` : void 0
  })
), Fm = x.div(
  ({ theme: e }) => ({
    position: "absolute",
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
    zIndex: 100,
    "&:after": {
      content: '""',
      display: "block",
      backgroundColor: e.color.secondary
    },
    "&:hover": {
      opacity: 1
    }
  }),
  ({ orientation: e = "vertical", position: t = "left" }) => e === "vertical" ? {
    width: t === "left" ? 10 : 13,
    height: "100%",
    top: 0,
    right: t === "left" ? "-7px" : void 0,
    left: t === "right" ? "-7px" : void 0,
    "&:after": {
      width: 1,
      height: "100%",
      marginLeft: t === "left" ? 3 : 6
    },
    "&:hover": {
      cursor: "col-resize"
    }
  } : {
    width: "100%",
    height: "13px",
    top: "-7px",
    left: 0,
    "&:after": {
      width: "100%",
      height: 1,
      marginTop: 6
    },
    "&:hover": {
      cursor: "row-resize"
    }
  }
);

// src/manager/App.tsx
var Bm = /* @__PURE__ */ a(({ managerLayoutState: e, setManagerLayoutState: t, pages: r, hasTab: n }) => {
  let { setMobileAboutOpen: i } = Ee();
  return /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(Vt, { styles: hs }), /* @__PURE__ */ l.createElement(
    Hm,
    {
      hasTab: n,
      managerLayoutState: e,
      setManagerLayoutState: t,
      slotMain: /* @__PURE__ */ l.createElement(mm, { id: "main", withLoader: !0 }),
      slotSidebar: /* @__PURE__ */ l.createElement(Zp, { onMenuClick: () => i((o) => !o) }),
      slotPanel: /* @__PURE__ */ l.createElement(gm, null),
      slotPages: r.map(({ id: o, render: s }) => /* @__PURE__ */ l.createElement(s, { key: o }))
    }
  ));
}, "App");

// src/manager/settings/About.tsx
var jS = x.div({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  marginTop: 40
}), US = x.header({
  marginBottom: 32,
  alignItems: "center",
  display: "flex",
  "> svg": {
    height: 48,
    width: "auto",
    marginRight: 8
  }
}), qS = x.div(({ theme: e }) => ({
  marginBottom: 24,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: e.base === "light" ? e.color.dark : e.color.lightest,
  fontWeight: e.typography.weight.regular,
  fontSize: e.typography.size.s2
})), GS = x.div({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 24,
  marginTop: 24,
  gap: 16
}), Rm = x(De)(({ theme: e }) => ({
  "&&": {
    fontWeight: e.typography.weight.bold,
    color: e.base === "light" ? e.color.dark : e.color.light
  },
  "&:hover": {
    color: e.base === "light" ? e.color.darkest : e.color.lightest
  }
})), zm = /* @__PURE__ */ a(({ onNavigateToWhatsNew: e }) => /* @__PURE__ */ l.createElement(jS, null, /* @__PURE__ */ l.createElement(US, null,
/* @__PURE__ */ l.createElement(an, { alt: "Storybook" })), /* @__PURE__ */ l.createElement(To, { onNavigateToWhatsNew: e }), /* @__PURE__ */ l.
createElement(qS, null, /* @__PURE__ */ l.createElement(GS, null, /* @__PURE__ */ l.createElement(we, { asChild: !0 }, /* @__PURE__ */ l.createElement(
"a", { href: "https://github.com/storybookjs/storybook" }, /* @__PURE__ */ l.createElement(hn, null), "GitHub")), /* @__PURE__ */ l.createElement(
we, { asChild: !0 }, /* @__PURE__ */ l.createElement("a", { href: "https://storybook.js.org/docs" }, /* @__PURE__ */ l.createElement(er, { style: {
display: "inline", marginRight: 5 } }), "Documentation"))), /* @__PURE__ */ l.createElement("div", null, "Open source software maintained by",
" ", /* @__PURE__ */ l.createElement(Rm, { href: "https://www.chromatic.com/" }, "Chromatic"), " and the", " ", /* @__PURE__ */ l.createElement(
Rm, { href: "https://github.com/storybookjs/storybook/graphs/contributors" }, "Storybook Community")))), "AboutScreen");

// src/manager/settings/AboutPage.tsx
var za = class za extends He {
  componentDidMount() {
    let { api: t, notificationId: r } = this.props;
    t.clearNotification(r);
  }
  render() {
    let { children: t } = this.props;
    return t;
  }
};
a(za, "NotificationClearer");
var Ra = za, $m = /* @__PURE__ */ a(() => {
  let e = me(), t = et(), r = A(() => {
    e.changeSettingsTab("whats-new");
  }, [e]);
  return /* @__PURE__ */ l.createElement(Ra, { api: e, notificationId: "update" }, /* @__PURE__ */ l.createElement(
    zm,
    {
      onNavigateToWhatsNew: t.whatsNewData?.status === "SUCCESS" ? r : void 0
    }
  ));
}, "AboutPage");

// src/manager/settings/SettingsFooter.tsx
var YS = x.div(({ theme: e }) => ({
  display: "flex",
  paddingTop: 20,
  marginTop: 20,
  borderTop: `1px solid ${e.appBorderColor}`,
  fontWeight: e.typography.weight.bold,
  "& > * + *": {
    marginLeft: 20
  }
})), QS = /* @__PURE__ */ a((e) => /* @__PURE__ */ l.createElement(YS, { ...e }, /* @__PURE__ */ l.createElement(De, { secondary: !0, href: "\
https://storybook.js.org", cancel: !1, target: "_blank" }, "Docs"), /* @__PURE__ */ l.createElement(De, { secondary: !0, href: "https://gith\
ub.com/storybookjs/storybook", cancel: !1, target: "_blank" }, "GitHub"), /* @__PURE__ */ l.createElement(
  De,
  {
    secondary: !0,
    href: "https://storybook.js.org/community#support",
    cancel: !1,
    target: "_blank"
  },
  "Support"
)), "SettingsFooter"), Wm = QS;

// src/manager/settings/shortcuts.tsx
var XS = x.header(({ theme: e }) => ({
  marginBottom: 20,
  fontSize: e.typography.size.m3,
  fontWeight: e.typography.weight.bold,
  alignItems: "center",
  display: "flex"
})), Km = x.div(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold
})), ZS = x.div({
  alignSelf: "flex-end",
  display: "grid",
  margin: "10px 0",
  gridTemplateColumns: "1fr 1fr 12px",
  "& > *:last-of-type": {
    gridColumn: "2 / 2",
    justifySelf: "flex-end",
    gridRow: "1"
  }
}), JS = x.div(({ theme: e }) => ({
  padding: "6px 0",
  borderTop: `1px solid ${e.appBorderColor}`,
  display: "grid",
  gridTemplateColumns: "1fr 1fr 0px"
})), ex = x.div({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridAutoRows: "minmax(auto, auto)",
  marginBottom: 20
}), tx = x.div({
  alignSelf: "center"
}), rx = x(rn.Input)(
  ({ valid: e, theme: t }) => e === "error" ? {
    animation: `${t.animation.jiggle} 700ms ease-out`
  } : {},
  {
    display: "flex",
    width: 80,
    flexDirection: "column",
    justifySelf: "flex-end",
    paddingLeft: 4,
    paddingRight: 4,
    textAlign: "center"
  }
), nx = xr`
0%,100% { opacity: 0; }
  50% { opacity: 1; }
`, ox = x(tt)(
  ({ valid: e, theme: t }) => e === "valid" ? {
    color: t.color.positive,
    animation: `${nx} 2s ease forwards`
  } : {
    opacity: 0
  },
  {
    alignSelf: "center",
    display: "flex",
    marginLeft: 10,
    height: 14,
    width: 14
  }
), ix = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  padding: "3rem 20px",
  maxWidth: 600,
  margin: "0 auto"
})), ax = {
  fullScreen: "Go full screen",
  togglePanel: "Toggle addons",
  panelPosition: "Toggle addons orientation",
  toggleNav: "Toggle sidebar",
  toolbar: "Toggle canvas toolbar",
  search: "Focus search",
  focusNav: "Focus sidebar",
  focusIframe: "Focus canvas",
  focusPanel: "Focus addons",
  prevComponent: "Previous component",
  nextComponent: "Next component",
  prevStory: "Previous story",
  nextStory: "Next story",
  shortcutsPage: "Go to shortcuts page",
  aboutPage: "Go to about page",
  collapseAll: "Collapse all items on sidebar",
  expandAll: "Expand all items on sidebar",
  remount: "Remount component"
}, sx = ["escape"];
function $a(e) {
  return Object.entries(e).reduce(
    // @ts-expect-error (non strict)
    (t, [r, n]) => sx.includes(r) ? t : { ...t, [r]: { shortcut: n, error: !1 } },
    {}
  );
}
a($a, "toShortcutState");
var Wa = class Wa extends He {
  constructor(t) {
    super(t), this.state = {
      // @ts-expect-error (non strict)
      activeFeature: void 0,
      // @ts-expect-error (non strict)
      successField: void 0,
      // The initial shortcutKeys that come from props are the defaults/what was saved
      // As the user interacts with the page, the state stores the temporary, unsaved shortcuts
      // This object also includes the error attached to each shortcut
      // @ts-expect-error (non strict)
      shortcutKeys: $a(t.shortcutKeys),
      addonsShortcutLabels: t.addonsShortcutLabels
    };
  }
  onKeyDown = /* @__PURE__ */ a((t) => {
    let { activeFeature: r, shortcutKeys: n } = this.state;
    if (t.key === "Backspace")
      return this.restoreDefault();
    let i = qa(t);
    if (!i)
      return !1;
    let o = !!Object.entries(n).find(
      ([s, { shortcut: u }]) => s !== r && u && Ga(i, u)
    );
    return this.setState({
      shortcutKeys: { ...n, [r]: { shortcut: i, error: o } }
    });
  }, "onKeyDown");
  onFocus = /* @__PURE__ */ a((t) => () => {
    let { shortcutKeys: r } = this.state;
    this.setState({
      activeFeature: t,
      shortcutKeys: {
        ...r,
        [t]: { shortcut: null, error: !1 }
      }
    });
  }, "onFocus");
  onBlur = /* @__PURE__ */ a(async () => {
    let { shortcutKeys: t, activeFeature: r } = this.state;
    if (t[r]) {
      let { shortcut: n, error: i } = t[r];
      return !n || i ? this.restoreDefault() : this.saveShortcut();
    }
    return !1;
  }, "onBlur");
  saveShortcut = /* @__PURE__ */ a(async () => {
    let { activeFeature: t, shortcutKeys: r } = this.state, { setShortcut: n } = this.props;
    await n(t, r[t].shortcut), this.setState({ successField: t });
  }, "saveShortcut");
  restoreDefaults = /* @__PURE__ */ a(async () => {
    let { restoreAllDefaultShortcuts: t } = this.props, r = await t();
    return this.setState({ shortcutKeys: $a(r) });
  }, "restoreDefaults");
  restoreDefault = /* @__PURE__ */ a(async () => {
    let { activeFeature: t, shortcutKeys: r } = this.state, { restoreDefaultShortcut: n } = this.props, i = await n(t);
    return this.setState({
      shortcutKeys: {
        ...r,
        ...$a({ [t]: i })
      }
    });
  }, "restoreDefault");
  displaySuccessMessage = /* @__PURE__ */ a((t) => {
    let { successField: r, shortcutKeys: n } = this.state;
    return t === r && n[t].error === !1 ? "valid" : void 0;
  }, "displaySuccessMessage");
  displayError = /* @__PURE__ */ a((t) => {
    let { activeFeature: r, shortcutKeys: n } = this.state;
    return t === r && n[t].error === !0 ? "error" : void 0;
  }, "displayError");
  renderKeyInput = /* @__PURE__ */ a(() => {
    let { shortcutKeys: t, addonsShortcutLabels: r } = this.state;
    return Object.entries(t).map(([i, { shortcut: o }]) => /* @__PURE__ */ l.createElement(JS, { key: i }, /* @__PURE__ */ l.createElement(tx,
    null, ax[i] || r[i]), /* @__PURE__ */ l.createElement(
      rx,
      {
        spellCheck: "false",
        valid: this.displayError(i),
        className: "modalInput",
        onBlur: this.onBlur,
        onFocus: this.onFocus(i),
        onKeyDown: this.onKeyDown,
        value: o ? Ye(o) : "",
        placeholder: "Type keys",
        readOnly: !0
      }
    ), /* @__PURE__ */ l.createElement(ox, { valid: this.displaySuccessMessage(i) })));
  }, "renderKeyInput");
  renderKeyForm = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(ex, null, /* @__PURE__ */ l.createElement(ZS, null, /* @__PURE__ */ l.
  createElement(Km, null, "Commands"), /* @__PURE__ */ l.createElement(Km, null, "Shortcut")), this.renderKeyInput()), "renderKeyForm");
  render() {
    let t = this.renderKeyForm();
    return /* @__PURE__ */ l.createElement(ix, null, /* @__PURE__ */ l.createElement(XS, null, "Keyboard shortcuts"), t, /* @__PURE__ */ l.createElement(
      we,
      {
        variant: "outline",
        size: "small",
        id: "restoreDefaultsHotkeys",
        onClick: this.restoreDefaults
      },
      "Restore defaults"
    ), /* @__PURE__ */ l.createElement(Wm, null));
  }
};
a(Wa, "ShortcutsScreen");
var _o = Wa;

// src/manager/settings/ShortcutsPage.tsx
var Vm = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(he, null, ({
  api: {
    getShortcutKeys: e,
    getAddonsShortcutLabels: t,
    setShortcut: r,
    restoreDefaultShortcut: n,
    restoreAllDefaultShortcuts: i
  }
}) => /* @__PURE__ */ l.createElement(
  _o,
  {
    shortcutKeys: e(),
    addonsShortcutLabels: t(),
    setShortcut: r,
    restoreDefaultShortcut: n,
    restoreAllDefaultShortcuts: i
  }
)), "ShortcutsPage");

// src/manager/settings/whats_new.tsx
var jm = x.div({
  top: "50%",
  position: "absolute",
  transform: "translateY(-50%)",
  width: "100%",
  textAlign: "center"
}), lx = x.div({
  position: "relative",
  height: "32px"
}), Um = x.div(({ theme: e }) => ({
  paddingTop: "12px",
  color: e.textMutedColor,
  maxWidth: "295px",
  margin: "0 auto",
  fontSize: `${e.typography.size.s1}px`,
  lineHeight: "16px"
})), ux = x.div(({ theme: e }) => ({
  position: "absolute",
  width: "100%",
  bottom: "40px",
  background: e.background.bar,
  fontSize: "13px",
  borderTop: "1px solid",
  borderColor: e.appBorderColor,
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
})), cx = /* @__PURE__ */ a(({
  isNotificationsEnabled: e,
  onToggleNotifications: t,
  onCopyLink: r
}) => {
  let n = Re(), [i, o] = J("Copy Link"), s = /* @__PURE__ */ a(() => {
    r(), o("Copied!"), setTimeout(() => o("Copy Link"), 4e3);
  }, "copyLink");
  return /* @__PURE__ */ l.createElement(ux, null, /* @__PURE__ */ l.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
  /* @__PURE__ */ l.createElement(ml, { color: n.color.mediumdark }), /* @__PURE__ */ l.createElement("div", null, "Share this with your tea\
m."), /* @__PURE__ */ l.createElement(we, { onClick: s, size: "small", variant: "ghost" }, i)), e ? /* @__PURE__ */ l.createElement(we, { size: "\
small", variant: "ghost", onClick: t }, /* @__PURE__ */ l.createElement(dl, null), "Hide notifications") : /* @__PURE__ */ l.createElement(we,
  { size: "small", variant: "ghost", onClick: t }, /* @__PURE__ */ l.createElement(fl, null), "Show notifications"));
}, "WhatsNewFooter"), px = x.iframe(
  {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 0,
    margin: 0,
    padding: 0,
    width: "100%",
    height: "calc(100% - 80px)",
    background: "white"
  },
  ({ isLoaded: e }) => ({ visibility: e ? "visible" : "hidden" })
), dx = x((e) => /* @__PURE__ */ l.createElement(dn, { ...e }))(({ theme: e }) => ({
  color: e.textMutedColor,
  width: 32,
  height: 32,
  margin: "0 auto"
})), fx = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(jm, null, /* @__PURE__ */ l.createElement(lx, null, /* @__PURE__ */ l.createElement(
nn, null)), /* @__PURE__ */ l.createElement(Um, null, "Loading...")), "WhatsNewLoader"), mx = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(
jm, null, /* @__PURE__ */ l.createElement(dx, null), /* @__PURE__ */ l.createElement(Um, null, "The page couldn't be loaded. Check your inte\
rnet connection and try again.")), "MaxWaitTimeMessaging"), hx = /* @__PURE__ */ a(({
  didHitMaxWaitTime: e,
  isLoaded: t,
  onLoad: r,
  url: n,
  onCopyLink: i,
  onToggleNotifications: o,
  isNotificationsEnabled: s
}) => /* @__PURE__ */ l.createElement(_e, null, !t && !e && /* @__PURE__ */ l.createElement(fx, null), e ? /* @__PURE__ */ l.createElement(mx,
null) : /* @__PURE__ */ l.createElement(l.Fragment, null, /* @__PURE__ */ l.createElement(px, { isLoaded: t, onLoad: r, src: n, title: "What\
's new?" }), /* @__PURE__ */ l.createElement(
  cx,
  {
    isNotificationsEnabled: s,
    onToggleNotifications: o,
    onCopyLink: i
  }
))), "PureWhatsNewScreen"), gx = 1e4, qm = /* @__PURE__ */ a(() => {
  let e = me(), t = et(), { whatsNewData: r } = t, [n, i] = J(!1), [o, s] = J(!1);
  if (V(() => {
    let c = setTimeout(() => !n && s(!0), gx);
    return () => clearTimeout(c);
  }, [n]), r?.status !== "SUCCESS") return null;
  let u = !r.disableWhatsNewNotifications;
  return /* @__PURE__ */ l.createElement(
    hx,
    {
      didHitMaxWaitTime: o,
      isLoaded: n,
      onLoad: () => {
        e.whatsNewHasBeenRead(), i(!0);
      },
      url: r.url,
      isNotificationsEnabled: u,
      onCopyLink: () => {
        navigator.clipboard?.writeText(r.blogUrl ?? r.url);
      },
      onToggleNotifications: () => {
        u ? ae.confirm("All update notifications will no longer be shown. Are you sure?") && e.toggleWhatsNewNotifications() : e.toggleWhatsNewNotifications();
      }
    }
  );
}, "WhatsNewScreen");

// src/manager/settings/whats_new_page.tsx
var Gm = /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(qm, null), "WhatsNewPage");

// src/manager/settings/index.tsx
var { document: Ym } = ae, yx = x.div(({ theme: e }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: 40,
  boxShadow: `${e.appBorderColor}  0 -1px 0 0 inset`,
  background: e.barBg,
  paddingRight: 8
})), Ka = l.memo(/* @__PURE__ */ a(function({
  changeTab: t,
  id: r,
  title: n
}) {
  return /* @__PURE__ */ l.createElement(Qr, null, ({ path: i }) => {
    let o = i.includes(`settings/${r}`);
    return /* @__PURE__ */ l.createElement(
      ln,
      {
        id: `tabbutton-${r}`,
        className: ["tabbutton"].concat(o ? ["tabbutton-active"] : []).join(" "),
        type: "button",
        key: "id",
        active: o,
        onClick: () => t(r),
        role: "tab"
      },
      n
    );
  });
}, "TabBarButton")), vx = x(on)(({ theme: e }) => ({
  background: e.background.content
})), bx = /* @__PURE__ */ a(({ changeTab: e, onClose: t, enableShortcuts: r = !0, enableWhatsNew: n }) => (l.useEffect(() => {
  let i = /* @__PURE__ */ a((o) => {
    !r || o.repeat || ht(!1, o) && Ve("Escape", o) && (o.preventDefault(), t());
  }, "handleEscape");
  return Ym.addEventListener("keydown", i), () => Ym.removeEventListener("keydown", i);
}, [r, t]), /* @__PURE__ */ l.createElement(_e, null, /* @__PURE__ */ l.createElement(yx, { className: "sb-bar" }, /* @__PURE__ */ l.createElement(
sn, { role: "tablist" }, /* @__PURE__ */ l.createElement(Ka, { id: "about", title: "About", changeTab: e }), n && /* @__PURE__ */ l.createElement(
Ka, { id: "whats-new", title: "What's new?", changeTab: e }), /* @__PURE__ */ l.createElement(Ka, { id: "shortcuts", title: "Keyboard shortc\
uts", changeTab: e })), /* @__PURE__ */ l.createElement(
  ie,
  {
    onClick: (i) => (i.preventDefault(), t()),
    title: "Close settings page"
  },
  /* @__PURE__ */ l.createElement(Qe, null)
)), /* @__PURE__ */ l.createElement(vx, { vertical: !0, horizontal: !1 }, /* @__PURE__ */ l.createElement(Sr, { path: "about" }, /* @__PURE__ */ l.
createElement($m, { key: "about" })), /* @__PURE__ */ l.createElement(Sr, { path: "whats-new" }, /* @__PURE__ */ l.createElement(Gm, { key: "\
whats-new" })), /* @__PURE__ */ l.createElement(Sr, { path: "shortcuts" }, /* @__PURE__ */ l.createElement(Vm, { key: "shortcuts" }))))), "P\
ages"), Ix = /* @__PURE__ */ a(() => {
  let e = me(), t = et(), r = /* @__PURE__ */ a((n) => e.changeSettingsTab(n), "changeTab");
  return /* @__PURE__ */ l.createElement(
    bx,
    {
      enableWhatsNew: t.whatsNewData?.status === "SUCCESS",
      enableShortcuts: t.ui.enableShortcuts,
      changeTab: r,
      onClose: e.closeSettings
    }
  );
}, "SettingsPages"), Qm = {
  id: "settings",
  url: "/settings/",
  title: "Settings",
  type: ve.experimental_PAGE,
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ l.createElement(Sr, { path: "/settings/", startsWith: !0 }, /* @__PURE__ */ l.createElement(
  Ix, null)), "render")
};

// src/manager/index.tsx
Do.displayName = "ThemeProvider";
dt.displayName = "HelmetProvider";
var Sx = /* @__PURE__ */ a(({ provider: e }) => /* @__PURE__ */ l.createElement(dt, { key: "helmet.Provider" }, /* @__PURE__ */ l.createElement(
ds, { key: "location.provider" }, /* @__PURE__ */ l.createElement(xx, { provider: e }))), "Root"), xx = /* @__PURE__ */ a(({ provider: e }) => {
  let t = ms();
  return /* @__PURE__ */ l.createElement(Qr, { key: "location.consumer" }, (r) => /* @__PURE__ */ l.createElement(
    Ua,
    {
      key: "manager",
      provider: e,
      ...r,
      navigate: t,
      docsOptions: ae?.DOCS_OPTIONS || {}
    },
    (n) => {
      let { state: i, api: o } = n, s = A(
        (c) => {
          o.setSizes(c);
        },
        [o]
      ), u = j(
        () => [Qm, ...Object.values(o.getElements(ve.experimental_PAGE))],
        [Object.keys(o.getElements(ve.experimental_PAGE)).join()]
      );
      return /* @__PURE__ */ l.createElement(Do, { key: "theme.provider", theme: gs(i.theme) }, /* @__PURE__ */ l.createElement(kl, null, /* @__PURE__ */ l.
      createElement(
        Bm,
        {
          key: "app",
          pages: u,
          managerLayoutState: {
            ...i.layout,
            viewMode: i.viewMode
          },
          hasTab: !!o.getQueryParam("tab"),
          setManagerLayoutState: s
        }
      )));
    }
  ));
}, "Main");
function Xm(e, t) {
  if (!(t instanceof wt))
    throw new vs();
  as(e).render(/* @__PURE__ */ l.createElement(Sx, { key: "root", provider: t }));
}
a(Xm, "renderStorybookUI");

// src/manager/runtime.ts
var ja = class ja extends wt {
  addons;
  channel;
  constructor() {
    super();
    let t = Ya({ page: "manager" });
    Ge.setChannel(t), t.emit(Za), this.addons = Ge, this.channel = t, ae.__STORYBOOK_ADDONS_CHANNEL__ = t;
  }
  getElements(t) {
    return this.addons.getElements(t);
  }
  getConfig() {
    return this.addons.getConfig();
  }
  handleAPI(t) {
    this.addons.loadAddons(t);
  }
};
a(ja, "ReactProvider");
var Va = ja, { document: wx } = ae, Ex = wx.getElementById("root");
setTimeout(() => {
  Xm(Ex, new Va());
}, 0);
