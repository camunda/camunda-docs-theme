'use strict';
/*jshint browser: true*/

/*global require: false, console: false*/
var utils = require('./utils');

var attr = utils.attr;
var query = utils.query;
var mkEl = utils.mkEl;
var keys = utils.keys;
var tmpl = utils.tmpl;

function mkListItems(target, texts, clickCb, that) {
  var items = [];
  that = that || {};

  texts.forEach(function (text, i) {
    var el = mkEl('li');
    el.innerHTML = '<a>' + text + '</a>';

    el.addEventListener('click', function (evt) {
      items.forEach(function (e) {
        var cl = e.classList;
        if (e === el) {
          if (!cl.contains('active')) {
            cl.add('active');
          }
        }
        else {
          cl.remove('active');
        }
      });

      clickCb.call(that, evt, i);
    });

    target.appendChild(el);

    items.push(el);
  });

  return items;
}

function camDownloadsWidget(info, holder) {
  var majorList = query('ul.major', holder);
  var patchList = query('ul.patch', holder);
  var serverList = query('ul.server', holder);
  var infoDiv = query('.selected-server', holder);
  var standaloneDiv = query('.standalone', infoDiv);

  var notesA = query('a.notes', holder);
  var dateSpan = query('span.date', holder);
  var zipA = query('a.zip', holder);
  var targzA = query('a.tar-gz', holder);
  var warA = query('a.war', holder);


  var branches = keys(info.branches).sort(function (a, b) {
    return (a > b ? -1 : (a < b ? 1 : 0));
  });

  function mkPatchReleases(evt, b) {
    patchList.innerHTML = '';
    serverList.innerHTML = '';
    infoDiv.classList.remove('accessible');

    var selectedBranch = branches[b];

    var patchReleases = info.branches[selectedBranch].map(function (release) {
      return release.number;
    }).filter(function (item) { return !!item; });


    mkListItems(patchList, patchReleases, function mkServersList(evt, r) {
      serverList.innerHTML = '';
      infoDiv.classList.remove('accessible');

      var selectedVersion = patchReleases[r];

      var releaseInfo = info.branches[selectedBranch].find(function (release) {
        return release.number === selectedVersion;
      });

      var releaseServers = keys(info.servers);
      if (releaseInfo.excludeServers) {
        releaseServers = releaseServers.filter(function (name) {
          return releaseInfo.excludeServers.indexOf(name) < 0;
        });
      }


      mkListItems(serverList, releaseServers.map(function (name) {
        return info.servers[name];
      }), function (evt, s) {
        var selectedServer = releaseServers[s];
        infoDiv.classList.add('accessible');

        var dl = tmpl('{server}/{branch}/{version}/camunda-bpm-ee-{server}-{version}-ee', {
          version:  selectedVersion,
          branch:   selectedBranch,
          server:   selectedServer
        });

        attr(notesA, 'href', releaseInfo.note);

        dateSpan.innerHTML = releaseInfo.date;

        attr(targzA, 'href', 'http://camunda.org/enterprise-release/camunda-bpm/' + dl + '.tar.gz');

        attr(zipA, 'href', 'http://camunda.org/enterprise-release/camunda-bpm/' + dl + '.zip');

        attr(warA, 'href', 'http://camunda.org/enterprise-release/camunda-bpm/' + dl + '.war');

        if (releaseInfo.excludeFormats && releaseInfo.excludeFormats.indexOf('war') > -1) {
          standaloneDiv.style.display = 'none';
        }
        else {
          standaloneDiv.style.display = 'block';
        }
      });
    });
  }


  mkListItems(majorList, branches, mkPatchReleases);
}

var camDownloadsEl = query('.cam-downloads');
if (window.camDownloads && camDownloadsEl) {
  camDownloadsWidget(window.camDownloads, camDownloadsEl);
}
