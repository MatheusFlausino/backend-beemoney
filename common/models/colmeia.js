'use strict';

module.exports = function (Colmeia) {

  var moment = require('moment')
  Colmeia.getInfos = getInfos;
  Colmeia.remoteMethod('getInfos', {
    description: 'Action to reset user password',
    accepts: [{
      arg: 'data',
      type: 'object',
      http: {
        source: 'body'
      }
    }],
    returns: {
      arg: 'imoveis',
      type: 'object',
      root: true,
    },
    http: {
      verb: 'get',
      path: '/get-infos'
    }
  });


  function getInfos(req, fn) {


    Colmeia.findOne({
        include: ['medicoes'],
        where: {
          id: 1
        }
      },
      function (err, res) {
        var _obj = {}
        _obj.percent = parseFloat(((res.__data.medicoes[0].valor / res.peso_cheio) * 100).toFixed(2))
        _obj.last_med = res.__data.medicoes[0].valor;
        _obj.last_med_day_short = moment(res.__data.medicoes[0].createdAt).format('DD/MM');;
        _obj.last_med_day_formated = moment(res.__data.medicoes[0].createdAt).format('HH:mm') + ' - ' + moment(res.__data.medicoes[0].createdAt).format('DD/MM/YYYY')
        _obj.last_med_yest = null;
        _obj.last_med_day = null;
        for (var x in res.__data.medicoes) {
          if (moment(res.__data.medicoes[x].createdAt).format('DD/MM/YYYY') == moment().subtract(1, 'day').format('DD/MM/YYYY')) {
            _obj.last_med_yest = res.__data.medicoes[x].valor;
            _obj.last_med_day = moment(res.__data.medicoes[x].createdAt).format('DD/MM');
            _obj.gain = parseFloat((_obj.last_med - _obj.last_med_yest).toFixed(2));
            _obj.colmeia = res;
            fn(null, _obj)
            break;            
          }
        }
        // res.__data.medicoes.forEach(element => {
        //   if (moment(element.createdAt).format('DD/MM/YYYY') == moment().subtract(1, 'day').format('DD/MM/YYYY')) {
        //     _obj.last_med_yest = element.valor;
        //     _obj.last_med_day = moment(element.createdAt).format('DD/MM');
        //     _obj.gain = parseFloat((_obj.last_med - _obj.last_med_yest).toFixed(2));
        //     _obj.colmeia = res;
        //     fn(null, _obj)
        //     return false;
        //   }
        // });

      })


  }

  Colmeia.validatesUniquenessOf('nome');
  Colmeia.observe('before save', function (ctx, next) {
    next()
  })
};