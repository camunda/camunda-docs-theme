'use strict';
/*jshint browser: true*/

/*global require: false, console: false*/
var xhr = require('xhr');
require('./classList');

/********************************************************************\
 * DOM utilities                                                    *
\********************************************************************/
var utils = require('./utils');
var toArray = utils.toArray;
var attr = utils.attr;
var mkEl = utils.mkEl;
var offset = utils.offset;
var query = utils.query;
var queryAll = utils.queryAll;
var docLoaded = utils.docLoaded;

function openParentItem(childItem, className) {
  childItem.classList.add(className || 'open');

  var parentItem = childItem.parentNode.parentNode;
  if (parentItem.tagName.toLowerCase() === 'li') {
    openParentItem(parentItem, className);
  }
}






/********************************************************************\
 * Banner Support
\********************************************************************/

var bannerContainer = query('div[class=docs-banner]');

if(!!bannerContainer) {
  xhr({
      uri: '/banners.html'
    }, function (err, resp, body) {

      if(!err && resp.statusCode == 200) {

        var offScreen = document.createElement('div');
        offScreen.innerHTML = body;

        var banners = queryAll('div[data-banner]', offScreen);

        if(banners.length > 0) {
          var randomIndex = Math.floor(Math.random() * banners.length);
          bannerContainer.innerHTML = '';
          bannerContainer.appendChild(banners[randomIndex]);
        }
      }

      // always make banner container visible
      bannerContainer.setAttribute('style', '');

    });
}


/********************************************************************\
 * tic tac TOC                                                      *
\********************************************************************/


var toc = query('#TableOfContents');
var navBar = query('.navbar-fixed-top');
var tocWrapper;
var tocLinks;
var tocTargets;
var tocTargetPositions;

var currentLink = query('.site-menu a[href="' + location.pathname + '"]');
var currentMenuItem;

if (toc) {
  tocWrapper = toc.parentNode;

  tocLinks = queryAll('a[href]', toc);

  tocTargets = tocLinks.map(function (node) {
    return document.getElementById(attr(node, 'href').slice(1));
  });

  tocTargetPositions = tocTargets.map(function (node) {
    return offset(node);
  });
}


/********************************************************************\
 * Active menu link                                                 *
\********************************************************************/

if (currentLink) {
  currentMenuItem = currentLink.parentNode;
  currentMenuItem.classList.add('active');
  openParentItem(currentLink.parentNode);
  openParentItem(currentLink.parentNode, 'active-trail');
}


/********************************************************************\
 * Open menu section                                                *
\********************************************************************/

var siteMenuToggle = queryAll('.site-menu-toggle');
if (siteMenuToggle) {
  siteMenuToggle.forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.body.classList.toggle('site-menu-open');
    });
  });
}

var siteMenuSubmenus = queryAll('.site-menu ul ul');

function setSubmenuClasses(span, nope) {
  var li = span.parentNode;

  if (!nope) {
    li.classList.toggle('open');
  }
}

function makeToggleBtn(ul) {
  var span = mkEl('span', {'class': 'submenu-toggle'});

  span.addEventListener('click', function () {
    var li = span.parentNode;
    if (li.classList.contains('open')) {
      li.classList.remove('open');
      return;
    }
    setSubmenuClasses(span);

    toArray(li.parentNode.childNodes).forEach(function (el) {
      if (!el.tagName) { return; }
      if (el !== li) {
        el.classList.remove('open');
        queryAll('li.open', el).forEach(function (subli) {
          subli.classList.remove('open');
        });
      }
      else {
        el.classList.add('open');
      }
    });
  });

  ul.parentNode.insertBefore(span, ul);
  return span;
}

siteMenuSubmenus.forEach(function (ul) {
  var toggleBtn = makeToggleBtn(ul);
  setSubmenuClasses(toggleBtn, true);
});












/********************************************************************\
 * Page scrolling and anchor links                                  *
\********************************************************************/
var debounced;
function scrolling() {
  if (!toc) { return; }
  if (debounced) {
    clearTimeout(debounced);
  }
  debounced = setTimeout(function () {
    var top = window.scrollY;

    queryAll('.active-trail, .open', toc).forEach(function (node) {
      var cl = node.classList;
      cl.remove('active-trail');
      cl.remove('open');
    });

    tocTargetPositions = tocTargets.map(function (node) {
      return offset(node);
    });

    for (var i = 0; i < tocTargetPositions.length; i++) {
      if (tocTargetPositions[i].top >= top) {
        tocLinks[i].parentNode.classList.add('open');
        openParentItem(tocLinks[i].parentNode);
        i = tocTargetPositions.length;
      }
    }

    queryAll('.open', toc).slice(0, -1).forEach(function (el) {
      el.classList.remove('open');
      el.classList.add('active-trail');
    });
  }, 100);
}

window.addEventListener('scroll', scrolling);
scrolling();

function shiftWindow() {
  if (!navBar) { return; }
  window.scrollBy(0, 0 - (navBar.clientHeight + 15));
}

if (location.hash) {
  setTimeout(shiftWindow, 200);
}
window.addEventListener('hashchange', shiftWindow);












/********************************************************************\
 * Tutorial download boxes                                          *
\********************************************************************/

queryAll('.gs-download-step-panel').forEach(function (panel) {
  var btn = query('.toggle-instructions', panel);
  if (!btn) { return; }
  btn.addEventListener('click', function () {
    panel.classList.toggle('open');
  });
});












/********************************************************************\
 * Images / lightbox                                                *
\********************************************************************/

var lightbox = mkEl('div', {'class': 'lightbox'});
var lightboxContent = mkEl('div', {'class': 'content'});
var lightboxImg = mkEl('img');
lightbox.appendChild(lightboxContent);
lightbox.addEventListener('click', function () {
  lightbox.classList.remove('open');
});
lightboxContent.appendChild(lightboxImg);



document.body.appendChild(lightbox);

function showBigger(evt) {
  var img = evt.target.src ? evt.target : query('img', evt.target);
  attr(lightboxImg, 'src', img.src);
  var style = lightboxContent.style;
  if (img.naturalWidth < document.body.clientWidth) {
    style.marginLeft = (-4 - (img.naturalWidth / 2)) + 'px';
  }
  else {
    style.marginLeft = (0 - (document.body.clientWidth / 2)) + 'px';
  }

  if (img.naturalHeight < document.body.clientHeight) {
    style.marginTop = (-4 - (img.naturalHeight / 2)) + 'px';
  }
  else {
    style.marginTop = (0 - (document.body.clientHeight / 2)) + 'px';
  }

  lightbox.classList.add('open');
}


function attachLightbox () {
  queryAll('.page-content figure.image img:not(.js-processed)').forEach(function (img) {
    img.classList.add('js-processed');
    if (img.parentNode.parentNode.classList.contains('no-lightbox')) { return; }
    if (img.clientWidth < img.naturalWidth) {
      var figure = img.parentNode.parentNode;
      figure.classList.add('clickable');
      figure.addEventListener('click', showBigger);
    }
  });
}
docLoaded(attachLightbox);






/********************************************************************\
 * Menu meta nav                                                    *
\********************************************************************/

var siteMenuMeta = query('.site-menu .meta');
var metaToggle = query('.toggle', siteMenuMeta);
var metaHeader = query('.header', siteMenuMeta);
function toggleMenuMeta() {
  var mcl = siteMenuMeta.classList;
  var tcl = metaToggle.classList;

  mcl.toggle('open');
  if (mcl.contains('open')) {
    tcl.remove('glyphicon-chevron-up');
    tcl.add('glyphicon-chevron-down');
  }
  else {
    tcl.add('glyphicon-chevron-up');
    tcl.remove('glyphicon-chevron-down');
  }
}

var versionLink = query('.site-menu .version a');
if (versionLink) {
  versionLink.addEventListener('click', toggleMenuMeta);
}
metaHeader.addEventListener('click', toggleMenuMeta);

var versionSelect = query('.site-menu .meta select');
if (versionSelect) {
  versionSelect.addEventListener('change', function () {

    var dest = attr(versionSelect, 'data-basepath') + '/' + versionSelect.value;

    var basePath = attr(versionSelect, 'base-url');
    var result = location.href.split(basePath)[1];
    if (result) {
      dest = dest + '/' + result;
    }

    location.pathname = dest;
  });
}


/********************************************************************\
 * Code highlighting                                                *
\********************************************************************/

var prismjs = require('prismjs');
require('prismjs/plugins/line-highlight/prism-line-highlight');
require('prismjs/plugins/line-numbers/prism-line-numbers');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-css');
require('prismjs/components/prism-css-extras');
require('prismjs/components/prism-git');
require('prismjs/components/prism-http');
require('prismjs/components/prism-java');
require('prismjs/components/prism-less');
require('prismjs/components/prism-markup');
require('prismjs/components/prism-yaml');
prismjs.languages.json = prismjs.languages.javascript;
prismjs.languages.js = prismjs.languages.javascript;
prismjs.languages.xml = prismjs.languages.markup;
prismjs.languages.html = prismjs.languages.markup;


/********************************************************************\
 * Content anchors                                                  *
\********************************************************************/

function addAnchors() {
  queryAll('h1, h2, h3, h4, h5, h6', query('.page-content')).forEach(function (heading) {
    if (!heading.id) { return; }

    var link = mkEl('a', {
      href: '#' + heading.id,
      class: 'content-anchor glyphicon glyphicon-link'
    });

    heading.appendChild(link);
  });
}
docLoaded(addAnchors);












/********************************************************************\
 * No clue...                                                       *
\********************************************************************/

var BPMNViewer = require('bpmn-js');

function fitBpmnViewport(el, viewer) {
  var vb = viewer.get('canvas').viewbox();
  var inner = vb.inner;

  if(el.offsetWidth < inner.width) {
    // need to zoom out: calculate height
    el.style.height = Math.round(inner.height * (el.clientWidth / inner.width)) + 'px';
  }
  else {
    // set height to inner height
    el.style.height = inner.height + 'px';
  }

  var canvas = viewer.get('canvas');
  canvas.zoom('fit-viewport');
  setTimeout(function () {
    canvas.zoom('fit-viewport');
  }, 10);
}

function attachDiagrams () {
  queryAll('[data-bpmn-diagram]:not(.js-processed)').forEach(function (el) {
    var src = attr(el, 'data-bpmn-diagram');
    el.classList.add('js-processed');

    var viewer = new BPMNViewer({
      container: el,
      width: '100%',
      height: '100%',
      overlays: {
        deferUpdate: false
      }
    });

    xhr({
      uri: src + '.bpmn',
    }, function (err, resp, body) {
      if (err) { throw err; }
      viewer.importXML(body, function(err) {
        if (err) { throw err; }
        fitBpmnViewport(el, viewer);
      });
    });
  });
}
docLoaded(attachDiagrams);


/********************************************************************\
 * Search                                                           *
\********************************************************************/

var searchResultTmpl = require('lodash.template')(
  '<li>' +
    '<h2><a href="<%= link %>"><%= title %></a></h2>' +
    '<div class="description<% if (pagemap && pagemap.cse_thumbnail) { %> with-thumbnail<% } %>">' +
      '<% if (pagemap && pagemap.cse_thumbnail) { %>' +
      '<a class="thumbnail" href="<%= link %>"><img src="<%- pagemap.cse_thumbnail[0].src %>" /></a>' +
      '<% } %>' +
      '<p><%= htmlSnippet %></p>' +
    '</div>' +
  '</li>'
);

var gSearchApiKey = 'AIzaSyBr7ZsDDbUbl_pExzErrTlSWXSZP0vpzyM';
var gSearchCtx = '007121298374582869478:yaec0vxmc7e';
var bodyClasses = document.body.classList;
var searchUri = 'https://www.googleapis.com/customsearch/v1?key=' + gSearchApiKey + '&cx=' + gSearchCtx + '&q=';
var searchField = query('.search-input');
var searchResults = query('.search-results');
var searchUnderlay = query('.search-underlay');
var searchCloseBtn = query('.search-close', searchResults);
var pageButtons = queryAll('button.page');

function closeSearch(evt) {
  evt.preventDefault();
  bodyClasses.remove('search-open');
  searchField.value = '';
}
searchCloseBtn.addEventListener('click', closeSearch);
searchUnderlay.addEventListener('click', closeSearch);

pageButtons.forEach(function (btn) {
  btn.addEventListener('click', function (evt) {
    evt.preventDefault();
    var searched = attr(btn, 'data-searched');
    var startIndex = attr(btn, 'data-start-index');
    performSearch(searchUri + searched/* + '&startIndex=' + startIndex*/ + '&start=' + startIndex);
  });
});


function performSearch(uri) {
  pageButtons.forEach(function (el) {
    attr(el, 'disabled', 'disabled');
    attr(el, 'data-searched', null);
    attr(el, 'data-start-index', null);
  });

  xhr({
    uri: uri,
    headers: {
      'Accept': 'application/json'
    }
  }, function (err, resp, body) {
    var resultsContainer = query('ul', searchResults);
    var renderedResults = '';

    if(err) {
      console.error('google custom search', err.message);
      resultsContainer.innerHTML = '<li class="search-error">' + err.message + '</li>';
    }
    else {
      var results = JSON.parse(body);

      if (results.items && results.items.length) {
        renderedResults = results.items.map(function (item) {
          if (!item.pagemap) {
            return '';
          }
          return searchResultTmpl(item);
        }).join('');

        var previous = results.queries.previousPage ? results.queries.previousPage[0] : false;
        if (previous) {
          attr(pageButtons[0], 'disabled', null);
          attr(pageButtons[0], 'data-searched', previous.searchTerms);
          attr(pageButtons[0], 'data-start-index', previous.startIndex);
        }

        var next = results.queries.nextPage ? results.queries.nextPage[0] : false;
        if (next) {
          attr(pageButtons[1], 'disabled', null);
          attr(pageButtons[1], 'data-searched', next.searchTerms);
          attr(pageButtons[1], 'data-start-index', next.startIndex);
        }
      }
      else {
        renderedResults += '<li class="no-results">no results</li>';
      }
    }

    resultsContainer.innerHTML = renderedResults;

    bodyClasses.add('search-open');

    query('li:first-of-type', resultsContainer).scrollIntoView();
  });
}

function searchEvent(evt) {
  evt.preventDefault();

  var search = searchField.value.trim();

  // IE9 users are redirected
  if (document.all && !window.atob) {
    window.open('https://www.google.com/search?q=site%3Ahttp%3A%2F%2Fdocs.camunda.org%20' + search, 'GoogleSearch');
    return;
  }

  if(!search.length) {
    bodyClasses.remove('search-open');
    return;
  }
  bodyClasses.add('search-open');

  performSearch(searchUri + search);
}

searchField.addEventListener('change', searchEvent);
searchField.value = '';







/********************************************************************\
 * Downloads                                                        *
\********************************************************************/

require('./ee-download');

/********************************************************************\
 * Spying                                                           *
\********************************************************************/



// var _gaq = window._gaq || [];
// var pluginUrl = '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
// _gaq.push(['_require', 'inpage_linkid', pluginUrl]);
// _gaq.push(['_setAccount', 'UA-39060941-1']);
// _gaq.push(['_setDomainName', 'camunda.org']);
// _gaq.push(['_trackPageview']);

// (function() {
//   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//   ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
//   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// })();
