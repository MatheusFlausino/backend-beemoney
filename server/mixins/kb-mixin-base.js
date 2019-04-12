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
    accepts: ([
      {
        arg: 'req',
        type: 'object',
        required: false,
        http: {
          source: 'req'
        }
      }      
    ]),
    returns: {
      arg: 'rows',
      type: 'object',
      root: true,
      description: ('Return rows retrieved'),
    },
    http: {
      verb: 'get',
      path: '/autocomplete'
    }
  });

  Model.autocomplete = autocomplete;

  function autocomplete(req, fn) {
    // console.log('AUTOCOMPLETE CALL', modelName, params);
    var q = req.query;    
    var _model = Model.app.models[q.model];
    var relations = Model.app.models[modelName].definition.settings.relations;
    var _field = q.field;

    if (!_model.custom.autocomplete[_field]) {
      fn('autocomplete settings not defined. check custom.autocomplete');
    }

    var autocompleteSettings = _model.custom.autocomplete[_field];

    if (relations[_field]) {
      var relationModel = Model.app.models[autocompleteSettings.model];   
    }
  }

  return Model;

};