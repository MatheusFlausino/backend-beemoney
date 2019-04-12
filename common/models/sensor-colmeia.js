'use strict';

module.exports = function (SensorColmeia) {

    SensorColmeia.observe('before save', function (ctx, next) {
        // console.log(ctx);
        var inst = ctx.instance ? ctx.instance : ctx.data;
        inst.col_id = 1;
        next()        
    })

    SensorColmeia.on('dataSourceAttached', function (obj) {
        SensorColmeia.custom.autocomplete.sensor = {
            where: function (reg) {
                return {
                    nome: (reg)
                };
            },
            out: function (row) {
                var newRow = {
                    id: row.id,
                    label: row.nome
                };
                return newRow;
            },
            label: function (row) {
                return row.sensor.nome;
            }
        };
    })
};