'use strict';

module.exports = function (SensorColmeia) {
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