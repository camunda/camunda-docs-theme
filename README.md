# Camunda theme for Hugo docs

## Install

Clone this repository/branch aside of the `docs.camunda.org`

```sh
# from the docs.camunda.org directory
cd ..
git clone git@github.com:camunda/docs.camunda.org.git docs-hugo-theme
# go into its directory
cd docs-hugo-theme
git checkout docs-hugo-styling
npm i
grunt build
```

_Note:_ you can clone this repository anywhere,
but you may then change the `setup.target` value of `package.json`.

## Working

After installing (you probably want to have [hugo running as watching server][building-docs])
and then use `grunt` in this directory.

## Consuming the theme

The simplest way to consume the theme in a project is to use the git subtree facilitites:

Adding the latest version of the theme as `camunda`:

```bash
git subtree add -P themes/camunda git@github.com:camunda/camunda-docs-theme.git master --squash
```

Updating the theme to the latest version:

```bash
git subtree pull -P themes/camunda git@github.com:camunda/camunda-docs-theme.git master --squash
```

## Licence

[MIT](LICENSE)


[building-docs]: https://github.com/camunda/docs.camunda.org/tree/hugo#building-the-doumentation
