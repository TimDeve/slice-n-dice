const sortImportPlugin = require("@trivago/prettier-plugin-sort-imports")

module.exports = {
  semi: false,
  arrowParens: "avoid",
  importOrder: ["^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [sortImportPlugin],
}
