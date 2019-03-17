
// Kleb-in Corp. 2018. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

var _ = require('underscore');
var LoopBackContext = require('loopback-context');

module.exports = function mixin(app) {
  app.loopback.modelBuilder.mixins.define('UserIdentity', UserIdentity);
};

function UserIdentity(Model, options) {

  Model.observe('before save', function (ctx, next) {
    var _ctx = LoopBackContext.getCurrentContext();
    var currentUser = _ctx && _ctx.get('currentUser');
    var user = currentUser.id;

    if (ctx.instance) {
      // Create a new item
      ctx.instance["id_u"] = user;
    } else {
      // Update item

    }
    return next();
  });

  /**
   * Find
   *
   * @param   {object}    where    Where Filter
   * @param   {function}  cb       Async Callback
   */
  const _find = Model.find
  Model.find = function () {

    var filter = arguments[0];
    var options = arguments[1];
    var cb = arguments[2];

    if (filter === undefined) filter = {}
    else {
      if (!filter.where) filter.where = {}
      var _ctx = LoopBackContext.getCurrentContext();
      var currentUser = _ctx && _ctx.get('currentUser');
      var user = currentUser.id.toString();
      
      //Adm permissions!
      // if(currentUser.pusu_id != 1) {
      if (filter.where.and !== undefined) {
        // filter.where with and
        filter.where.and.push({ 'id_u': user });

      } else {
        // filter.where with or or nothing
        filter.where = {
          and: [filter.where, { 'id_u': user }]
        }

      }
      // };
    }
    return _find.call(Model, filter, options, cb)
  };
};