'use strict';
/*jshint browser: true*/

/*global require: false, console: false*/

require('./classList');

function toArray(thing) {
  var arr = [];
  if (!thing.length) { return arr; }
  for (var i = 0; i < thing.length; i++) {
    arr.push(thing[i]);
  }
  return arr;
}

function attr(node, name, value) {
  if (value === null) {
    node.removeAttribute(name);
  }
  else if (typeof value !== 'undefined') {
    node.setAttribute(name, value);
  }
  return node.getAttribute(name);
}

function offset(node) {
  var parent = node;
  var offset = {
    top: parent.offsetTop,
    left: parent.offsetLeft,
  };

  while ((parent = parent.offsetParent)) {
    offset.top += parent.offsetTop;
    offset.left += parent.offsetLeft;
  }

  return offset;
}

function query(selector, context) {
  context = (context || document.body);
  return context.querySelector(selector);
}

function queryAll(selector, context) {
  context = (context || document.body);
  return toArray(context.querySelectorAll(selector));
}

function openParentItem(childItem) {
  childItem.classList.add('open');

  var parentItem = childItem.parentNode.parentNode;
  if (parentItem.tagName.toLowerCase() === 'li') {
    openParentItem(parentItem);
  }
}






var toc = query('#TableOfContents');

var tocLeft = 0;
var tocWrapper;
var tocLinks;
var tocTargets;
var tocTargetPositions;

var currentLink = query('.site-menu a[href$="' + location.pathname + '"]');
var currentMenuItem;

function tocPosition() {
  if (toc) {
    attr(tocWrapper, 'style', null);//.style.position = 'static';
    tocLeft = offset(tocWrapper).left;
    tocWrapper.style.width = tocWrapper.clientWidth + 'px';
    tocWrapper.style.left = tocLeft + 'px';
    tocWrapper.style.position = 'fixed';
  }
}

if (toc) {
  tocWrapper = toc.parentNode;
  tocPosition();

  tocLinks = queryAll('a[href]', toc);

  tocTargets = tocLinks.map(function (node) {
    return document.getElementById(attr(node, 'href').slice(1));
  });

  tocTargetPositions = tocTargets.map(function (node) {
    return offset(node);
  });
}

if (currentLink) {
  currentMenuItem = currentLink.parentNode;
  openParentItem(currentLink.parentNode);
}


function scrolling() {
  if (!toc) { return; }

  var top = window.scrollY;
  // toc.parentNode.style.top = (top + tocOffset) + 'px';

  tocLinks.forEach(function (node) {
    node.parentNode.classList.remove('open');
  });

  for (var i = 0; i < tocTargetPositions.length; i++) {
    if (tocTargetPositions[i].top >= top) {
      tocLinks[i].parentNode.classList.add('open');
      openParentItem(tocLinks[i].parentNode);
      i = tocTargetPositions.length;
    }
  }
}

window.addEventListener('resize', function () {
  tocPosition();
});
window.addEventListener('scroll', scrolling);
scrolling();
