let path = require("path")
let fs = require("fs")
let _ = require("lodash")
let vile = require("@brentlintner/vile")
let Promise = require("bluebird")
let xml = require("xml2js")
let log = vile.logger.create("csslint")
let ignore = require("ignore-file")

const node_modules = path.join(__dirname, "..", "node_modules")
const csslint_bin = path.join(node_modules, ".bin", "csslint")

let allowed = (ignore_list = []) => {
  let ignored = ignore.compile(ignore_list.join("\n"))
  return (file) => file.match(/\.css$/) && !ignored(file)
}

let csslint = (custom_config_path, ignore_list) => {
  let opts = {}

  opts.args = _.reduce(opts, (arr, option, name) => {
    return arr.concat([`-${name}`, option])
  }, []).concat([
    ".",
    "--format=csslint-xml",
    ignore_list ? `--exclude-list=${ ignore_list }` : ""
  ])

  return vile
    .spawn(csslint_bin, opts)
    .then((stdout) => {
      return new Promise((resolve, reject) => {
        xml.parseString(stdout, (err, json) => {
          if (err) log.error(err)
          resolve(json.csslint.file)
        })
      })
    })
}

let to_issue_type = (severity="") => {
  return severity.toLowerCase() == "warning" ?
    vile.WARNING : vile.ERROR
}

let vile_issue = (issue, file) => {
  return vile.issue(
    to_issue_type(issue.severity),
    file,
    issue.reason,
    {
      line: issue.line,
      character: issue.char
    }
  )
}

let punish = (plugin_config) => {
  let config = _.get(plugin_config, "config")
  let ignore = _.get(plugin_config, "ignore")

  // TODO: support autodetecting .csslintignore if nothing passed at all?
  if (typeof ignore == "string") {
    ignore = _.attempt(JSON.parse.bind(null,
                fs.readFileSync(ignore, "utf-8")), [])
  }

  return vile.promise_each(
    process.cwd(),
    allowed(ignore),
    (filepath) => vile.issue(vile.OK, filepath),
    { read_data: false }
  )
  .then(
    csslint(config, ignore)
      .then((files) => {
        return _.flatten(_.map(files, (file) => {
          let name = _.get(file, "$.name", "?")
            .replace(process.cwd(), "").replace(/^\/?/, "")
          let issues = file.issue || []
          return issues.map((issue) => vile_issue(issue.$, name))
        }))
      })
   )
}

module.exports = {
  punish: punish
}
