// Kleb-in Corp. 2018. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

var LoopBackContext = require('loopback-context');

module.exports = function mixin(app) {
  app.loopback.modelBuilder.mixins.define('KlBaseMixin', KlBaseMixin);
};

function KlBaseMixin(Model, options) {

  if (Model.custom == undefined) {
    Model.custom = {autocomplete:{'kle':'ber'}};
  }

  Model.remoteMethod('autocomplete', {
    description: 'retrieves options for autocomplete field',
    accepts: ([{
        arg: 'params',
        type: 'object',
        required: true,
        http: function (ctx) {
          var req = ctx.req.params;
          return req;
        }
      },
      {
        arg: 'req',
        type: 'object',
        required: false,
        http: {
          source: 'req'
        }
      }
      // { arg: 'accessToken', type: 'object', http: function (ctx) { return ctx.req.accessToken; } }
    ]),
    returns: {
      arg: 'rows',
      type: 'object',
      root: true,
      description: ('Return rows retrieved'),
    },
    http: {
      verb: 'get',
      path: '/autocomplete/:field/:search'
    }
  });

  Model.autocomplete = autocomplete;

  function autocomplete(model, params, req, fn) {
    console.log('AUTOCOMPLETE CALL', modelName, params);

    var _model = Model.app.models[modelName];
    var relations = Model.app.models[modelName].definition.settings.relations;
    var _field = params.field;

    if (!_model.custom.autocomplete[_field]) {
      fn('autocomplete settings not defined. check custom.autocomplete');
    }

    if (_model.custom.autocomplete[_field].customQuery !== undefined) {
      _model.custom.autocomplete[_field].customQuery(modelName, params, req, fn);
      return;
    }

    var autocompleteSettings = _model.custom.autocomplete[_field];

    if (relations[_field]) {
      var _relation = relations[_field];
      var relationModel = Model.app.models[_relation.model];
    } else {
      if (!autocompleteSettings.model) {
        fn('autocomplete model not defined. check custom.autocomplete');
      }
      var relationModel = Model.app.models[autocompleteSettings.model];
    }
  }

  return Model;

};