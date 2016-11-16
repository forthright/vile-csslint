let path = require("path")
let _ = require("lodash")
let vile = require("@forthright/vile")
let Promise = require("bluebird")
let xml = require("xml2js")
let log = vile.logger.create("csslint")

const csslint_bin = "csslint"

let csslint = () =>
  vile
    .spawn(csslint_bin, {
      args: [ ".", "--format=csslint-xml" ]
    })
    .then((spawn_data) => {
      let stdout = _.get(spawn_data, "stdout", "")
      return new Promise((resolve, reject) => {
        xml.parseString(stdout, (err, json) => {
          if (err) log.error(err)
          resolve(json.csslint.file)
        })
      })
    })

let to_issue_type = (severity="") => {
  return severity.toLowerCase() == "warning" ?
    vile.STYL : vile.ERR
}

let vile_issue = (issue, file) => {
  return vile.issue({
    type: to_issue_type(issue.severity),
    path: file,
    title: issue.reason,
    message: issue.reason,
    signature: `csslint::${issue.reason}`,
    where: {
      start: {
        line: issue.line,
        character: issue.char
      }
    }
  })
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
