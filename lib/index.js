"use strict";

var path = require("path");
var fs = require("fs");
var _ = require("lodash");
var vile = require("@brentlintner/vile");
var Promise = require("bluebird");
var xml = require("xml2js");
var log = vile.logger.create("csslint");
var ignore = require("ignore-file");

var node_modules = path.join(__dirname, "..", "node_modules");
var csslint_bin = path.join(node_modules, ".bin", "csslint");

var allowed = function allowed() {
  var ignore_list = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  var ignored = ignore.compile(ignore_list.join("\n"));
  return function (file) {
    return file.match(/\.css$/) && !ignored(file);
  };
};

var csslint = function csslint(custom_config_path, ignore_list) {
  var opts = {};

  opts.args = _.reduce(opts, function (arr, option, name) {
    return arr.concat(["-" + name, option]);
  }, []).concat([".", "--format=csslint-xml", ignore_list ? "--exclude-list=" + ignore_list : ""]);

  return vile.spawn(csslint_bin, opts).then(function (stdout) {
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

  return severity.toLowerCase() == "warning" ? vile.WARNING : vile.ERROR;
};

var vile_issue = function vile_issue(issue, file) {
  return vile.issue(to_issue_type(issue.severity), file, issue.reason, {
    line: issue.line,
    character: issue.char
  });
};

var punish = function punish(plugin_config) {
  var config = _.get(plugin_config, "config");
  var ignore = _.get(plugin_config, "ignore");

  // TODO: support autodetecting .csslintignore if nothing passed at all?
  if (typeof ignore == "string") {
    ignore = _.attempt(JSON.parse.bind(null, fs.readFileSync(ignore, "utf-8")), []);
  }

  return vile.promise_each(process.cwd(), allowed(ignore), function (filepath) {
    return vile.issue(vile.OK, filepath);
  }, { read_data: false }).then(csslint(config, ignore).then(function (files) {
    return _.flatten(_.map(files, function (file) {
      var name = _.get(file, "$.name", "?").replace(process.cwd(), "").replace(/^\/?/, "");
      var issues = file.issue || [];
      return issues.map(function (issue) {
        return vile_issue(issue.$, name);
      });
    }));
  }));
};

module.exports = {
  punish: punish
};