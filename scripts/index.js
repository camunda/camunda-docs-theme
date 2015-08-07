'use strict';
/*jshint browser: true*/

/*global require: false, console: false*/

function query(selector, context) {
  context = context || document.body;
  return context.querySelector(selector);
}


function openParentItem(childItem) {
  childItem.className = 'open';

  var parentItem = childItem.parentNode.parentNode;
  if (parentItem.tagName.toLowerCase() === 'li') {
    openParentItem(parentItem);
  }
}


var currentLink = query('.site-menu a[href$="' + location.pathname + '"]');
var currentMenuItem;

if (currentLink) {
  currentMenuItem = currentLink.parentNode;
  openParentItem(currentLink.parentNode);
}

