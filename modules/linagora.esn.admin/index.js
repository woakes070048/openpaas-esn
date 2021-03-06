'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;
var path = require('path');

var MODULE_NAME = 'admin';
var AWESOME_MODULE_NAME = 'linagora.esn.' + MODULE_NAME;

var adminModule = new AwesomeModule(AWESOME_MODULE_NAME, {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper')
  ],

  states: {
    lib: function(dependencies, callback) {
      var libModule = require('./backend/lib')(dependencies);

      var lib = {
        lib: libModule
      };

      return callback(null, lib);
    },

    deploy: function(dependencies, callback) {
      var app = require('./backend/webserver')(this, dependencies);
      var webserverWrapper = dependencies('webserver-wrapper');
      var frontendJsFiles = [
        'app.js',
        'directives.js',
        'components/sidebar.js'
      ];

      webserverWrapper.injectAngularModules(MODULE_NAME, frontendJsFiles, [AWESOME_MODULE_NAME], ['esn']);
      var lessFile = path.resolve(__dirname, './frontend/css/styles.less');
      webserverWrapper.injectLess(MODULE_NAME, [lessFile], 'esn');
      webserverWrapper.addApp(MODULE_NAME, app);

      return callback();
    },

    start: function(dependencies, callback) {
      callback();
    }
  }
});

module.exports = adminModule;
