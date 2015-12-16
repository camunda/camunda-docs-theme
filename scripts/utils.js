'use strict';
/*jshint browser: true*/

/*global module: false*/

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var utils = module.exports = {};

function toArray(thing) {
  var arr = [];
  if (!thing.length) { return arr; }
  for (var i = 0; i < thing.length; i++) {
    arr.push(thing[i]);
  }
  return arr;
}
utils.toArray = toArray;

function attr(node, name, value) {
  if (value === null) {
    node.removeAttribute(name);
  }
  else if (typeof value !== 'undefined') {
    node.setAttribute(name, value);
  }
  return node.getAttribute(name);
}
utils.attr = attr;

function mkEl(name, attrs) {
  var el = document.createElement(name);
  if (attrs) {
    Object.keys(attrs).forEach(function (name) {
      attr(el, name, attrs[name]);
    });
  }
  return el;
}
utils.mkEl = mkEl;

function offset(node) {
  var parent = node;
  var obj = {
    top: parent.offsetTop,
    left: parent.offsetLeft,
  };

  while ((parent = parent.offsetParent)) {
    obj.top += parent.offsetTop;
    obj.left += parent.offsetLeft;
  }

  return obj;
}
utils.offset = offset;

function query(selector, context) {
  context = (context || document.body);
  return context.querySelector(selector);
}
utils.query = query;

function queryAll(selector, context) {
  context = (context || document.body);
  return toArray(context.querySelectorAll(selector));
}
utils.queryAll = queryAll;


function keys(o) {
  return Object.keys(o);
}
utils.keys = keys;


function tmpl(str, obj) {
  keys(obj).forEach(function (key) {
    str = str.split('{' + key + '}').join(obj[key]);
  });
  return str;
}
utils.tmpl = tmpl;



var _init = [];
function docLoaded(fn) { _init.push(fn); }
document.addEventListener('readystatechange', function () {
  if (document.readyState === 'complete') {
    var fn;
    /*jshint boss: true*/
    while (fn = _init.shift()) { fn(); }
    /*jshint boss: false*/
  }
});
utils.docLoaded = docLoaded;
