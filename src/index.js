let path = require("path")
let _ = require("lodash")
let vile = require("@brentlintner/vile")
let Promise = require("bluebird")
let xml = require("xml2js")
let log = vile.logger.create("csslint")

// TODO: don't relative require like this (broken in npm v3?)
const node_modules = path.join(__dirname, "..", "node_modules")
const csslint_bin = path.join(node_modules, ".bin", "csslint")

let csslint = () =>
  vile
    .spawn(csslint_bin, {
      args: [ ".", "--format=csslint-xml" ]
    })
    .then((stdout) =>
      new Promise((resolve, reject) => {
        xml.parseString(stdout, (err, json) => {
          if (err) log.error(err)
          resolve(json.csslint.file)
        })
      }))

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

let punish = (plugin_config) =>
  csslint().then((files) =>
    _.flatten(_.map(files, (file) => {
      let name = _.get(file, "$.name", "?")
        .replace(process.cwd(), "").replace(/^\/?/, "")
      let issues = file.issue || []
      return issues.map((issue) => vile_issue(issue.$, name))
    }))
  )

module.exports = {
  punish: punish
}
