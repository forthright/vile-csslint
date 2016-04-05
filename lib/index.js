"use strict";

var path = require("path");
var _ = require("lodash");
var vile = require("@forthright/vile");
var Promise = require("bluebird");
var xml = require("xml2js");
var log = vile.logger.create("csslint");

var csslint_bin = "csslint";

var csslint = function csslint() {
  return vile.spawn(csslint_bin, {
    args: [".", "--format=csslint-xml"]
  }).then(function (stdout) {
    return new Promise(function (resolve, reject) {
      xml.parseString(stdout, function (err, json) {
        if (err) log.error(err);
        resolve(json.csslint.file);
      });
    });
  });
};

var to_issue_type = function to_issue_type() {
  var severity = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

  return severity.toLowerCase() == "warning" ? vile.STYL : vile.ERR;
};

var vile_issue = function vile_issue(issue, file) {
  return vile.issue({
    type: to_issue_type(issue.severity),
    path: file,
    title: issue.reason,
    message: issue.reason,
    signature: "csslint::" + issue.reason,
    where: {
      start: {
        line: issue.line,
        character: issue.char
      }
    }
  });
};

var punish = function punish(plugin_config) {
  return csslint().then(function (files) {
    return _.flatten(_.map(files, function (file) {
      var name = _.get(file, "$.name", "?").replace(process.cwd(), "").replace(/^\/?/, "");
      var issues = file.issue || [];
      return issues.map(function (issue) {
        return vile_issue(issue.$, name);
      });
    }));
  });
};

module.exports = {
  punish: punish
};