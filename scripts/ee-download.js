'use strict';
/*jshint browser: true*/

/*global require: false*/
var utils = require('./utils');

var months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

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
      evt.preventDefault();
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

      clickCb.call(that, i, el);
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

  var releaseTitle = query('.info h3', holder);
  var standaloneWebAppTitle = query('.standalone h4', holder);
  var standaloneWebAppHint = query('.standalone p.hint', holder);
  var notesA = query('a.notes', holder);
  var dateSpan = query('span.date', holder);
  var zipA = query('a.zip', holder);
  var targzA = query('a.tar-gz', holder);
  var warA = query('a.war', holder);
  var licensesLinkA = query('a.licenses-link', holder);
  var thirdPartyLicensesLinkA = query('a.third-party-licenses-link', holder);

  var runDetails = query('a.details.run', holder);
  var fullDetails = query('a.details.full', holder);

  var branches = keys(info.branches).sort(function (a, b) {
    var foo = parseInt(a.split(".")[1], 10);
    var bar = parseInt(b.split(".")[1], 10);
    return (foo > bar ? -1 : (foo < bar ? 1 : 0));
  });


  function getReleaseInfo(branch, version) {
    return info.branches[branch].find(function (release) {
      return release.number === version;
    });
  }

  function getBranchVersions(branch) {
    return info.branches[branch].map(function (release) {
      return release.number;
    }).filter(function (item) { return !!item; });
  }

  function getServers(release) {
    var servers = keys(info.servers);
    if (release.excludeServers) {
      servers = servers.filter(function (name) {
        return release.excludeServers.indexOf(name) < 0;
      });
    }
    return servers;
  }


  var dlBasePath = 'https://downloads.camunda.cloud/enterprise-release/camunda-bpm/';
  function mkServerClickHandler(servers, version, branch) {
    return function (s) {
      var selectedServer = servers[s];
      var serverInfo = info.servers[selectedServer];
      var release = getReleaseInfo(branch, version);
      var excludesWar = release.excludeFormats && release.excludeFormats.indexOf('war') > -1;
      infoDiv.classList.add('accessible');

      runDetails.style.display = 'none';
      fullDetails.style.display = 'inline';

      var dl = tmpl('{server}/{branch}/{version}/camunda-bpm-ee-{serverAlias}-{version}-ee', {
        version:  version,
        branch:   (version.indexOf('alpha') > -1) ? 'nightly' : branch,
        server:   serverInfo.path,
        serverAlias: (selectedServer === 'wildfly8')? 'wildfly' : serverInfo.path
      });

      releaseTitle.innerHTML = version + '-ee for ' + serverInfo.name;
      standaloneWebAppTitle.innerHTML = 'Standalone Web Application';
      standaloneWebAppHint.innerHTML = '';
      if (selectedServer === 'wildfly-jakartaee') {
        standaloneWebAppTitle.innerHTML += " for WildFly ≤26 / JBoss EAP 7";
        standaloneWebAppHint.innerHTML = 'For newer Wildfly versions, standalone webapps were discontinued.';
      }

      var parts = release.date.split('.').map(function (part) {
        return parseInt(part, 10);
      });
      dateSpan.innerHTML = parts[2] + ' ' + months[parts[1] - 1] + ' ' + parts[0];

      attr(notesA, 'href', release.note);

      attr(warA, 'href', dlBasePath + tmpl('{server}/{branch}/{version}/camunda-webapp-ee-{server}-standalone-{version}-ee', {
        version:  version,
        branch:   (version.indexOf('alpha') > -1) ? 'nightly' : branch,
        server:   selectedServer.match(/wildfly*/) ? 'jboss' : selectedServer
      }) + '.war');

      attr(targzA, 'href', dlBasePath + dl + '.tar.gz');

      attr(zipA, 'href', dlBasePath + dl + '.zip');

      attr(licensesLinkA, 'href', 'https://docs.camunda.org/manual/' + branch + '/introduction/licenses/');
      attr(thirdPartyLicensesLinkA, 'href', 'https://docs.camunda.org/manual/' + branch + '/introduction/third-party-libraries/');

      if (selectedServer.startsWith('ibm-was') || selectedServer === 'oracle-wls') {
        dl = tmpl('{vendor}-{server}/{branch}/{version}/camunda-ee-{vendor}-{serverAlias}-{version}-ee', {
          version:  version,
          branch:   (version.indexOf('alpha') > -1) ? 'nightly' : branch,
          vendor:   selectedServer.split('-')[0],
          server:   (selectedServer == 'ibm-was-liberty')? 'was-liberty' : selectedServer.split('-')[1],
          serverAlias:   selectedServer.split('-')[1]
        });

        attr(targzA, 'href', dlBasePath + dl + '.tar.gz');

        attr(zipA, 'href', dlBasePath + dl + '.zip');

        attr(warA, 'href', dlBasePath + tmpl('{vendor}-{server}/{branch}/{version}/camunda-webapp-ee-{server}-standalone-{version}-ee', {
          version:  version,
          branch:   (version.indexOf('alpha') > -1) ? 'nightly' : branch,
          vendor:   selectedServer.split('-')[0],
          server:   selectedServer.split('-')[1]
        }) + '.war');
      }

      if(selectedServer.startsWith('run')) {

        runDetails.style.display = 'inline';
        fullDetails.style.display = 'none';

        var dl = tmpl('{server}/{branch}/{version}/camunda-bpm-{server}-ee-{version}-ee', {
          version:  version,
          branch:   (version.indexOf('alpha') > -1) ? 'nightly' : branch,
          server:   selectedServer
        });


        attr(targzA, 'href', dlBasePath + dl + '.tar.gz');

        attr(zipA, 'href', dlBasePath + dl + '.zip');

        excludesWar = true;
      }


      if (excludesWar) {
        standaloneDiv.style.display = 'none';
      }
      else {
        standaloneDiv.style.display = 'block';
      }
    };
  }

  function mkVersionClickHandler(branchName) {
    var patchReleases = getBranchVersions(branchName);

    return function selectVersion(r) {
      serverList.innerHTML = '';

      infoDiv.classList.remove('accessible');

      var selectedVersion = patchReleases[r];

      var releaseInfo = getReleaseInfo(branchName, selectedVersion);

      var releaseServers = getServers(releaseInfo);

      return mkListItems(serverList, releaseServers.map(function (id) {
        return info.servers[id].name;
      }), mkServerClickHandler(releaseServers, selectedVersion, branchName));
    };
  }


  function selectBranch(b) {
    patchList.innerHTML = '';

    serverList.innerHTML = '';

    infoDiv.classList.remove('accessible');

    var branchName = branches[b];

    var patchReleases = getBranchVersions(branchName);

    return mkListItems(patchList, patchReleases, mkVersionClickHandler(branchName));
  }


  var branchEls = mkListItems(majorList, branches, selectBranch);

  if (info.selected) {
    var b = branches.indexOf(info.selected.branch);

    var versionEls = selectBranch(b);

    branchEls[b].classList.add('active');


    var patchReleases = getBranchVersions(branches[b]);

    var v = patchReleases.indexOf(info.selected.version);

    var serverEls = mkVersionClickHandler(branches[b])(v);

    versionEls[v].classList.add('active');


    var servers = getServers(patchReleases[v]);

    var s = servers.indexOf(info.selected.server);

    serverEls[s].classList.add('active');

    mkServerClickHandler(servers, info.selected.version, info.selected.branch)(s);
  }
}

var camDownloadsEl = query('.cam-downloads');
if (window.camDownloads && camDownloadsEl) {
  camDownloadsWidget(window.camDownloads, camDownloadsEl);
}
