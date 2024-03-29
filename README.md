# Camunda theme for Hugo docs

## Install

Clone this repository/branch aside of the `camunda-docs-manual`:

```sh
# from the camunda-docs-manual directory
cd ..
git clone git@github.com:camunda/camunda-docs-theme.git
# go into its directory
cd camunda-docs-theme
npm i
npm run build
```

_Note:_ you can clone this repository anywhere,
but you may then change the `setup.target` value of `package.json`.

## Working

After installing (you probably want to have [hugo running as watching server][building-docs])
and then run `npm run build` from this directory.

## Consuming the theme

1. Edit the `setup.target` value of `package.json` to point to the theme's root directory in your Hugo project (default: `../camunda-docs-manual/themes/camunda`).
2. Build and update the theme in the target location by either running:
   1. `grunt build` for building and syncing non-minified assets
   2. Run additionally `grunt optimize` for building and syncing minified assets  

### Using git subtree

You can also consume the theme in a project via git subtree:

Adding the latest version of the theme as `camunda`:

```bash
git subtree add -P themes/camunda git@github.com:camunda/camunda-docs-theme.git dist --squash
```

Updating the theme to the latest version:

```bash
git subtree pull -P themes/camunda git@github.com:camunda/camunda-docs-theme.git dist --squash
```

### Theme development with Virtualbox

This would be the command to execute in order to make the local development site
of `camunda-docs-manual` (see `--baseUrl` option) available in a virtualbox (typically for IE).
Livereload should be deactivate (see `--disableLiveReload`) if you want to develop for IE9.

```sh
hugo --bind="0.0.0.0" --baseUrl="http://10.0.2.2:1313/manual/develop/" -w --disableLiveReload=true server
```

The development site is then available on `http://10.0.2.2:1313/manual/develop/` in your virtualbox
guest OS.

## Licence

[MIT](LICENSE)

[building-docs]: https://github.com/camunda/camunda-docs-manual/#building-the-documentation
