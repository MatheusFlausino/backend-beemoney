'use strict';

module.exports = function (SensorColmeia) {

    SensorColmeia.observe('before save', function (ctx, next) {
        // console.log(ctx);
        var inst = ctx.instance ? ctx.instance : ctx.data;
        inst.col_id = 1;


        SensorColmeia.app.models.Colmeia.findOne({include:[{
            relation:'medicoes',
            scope:{
                order:'createdat ASC',
                limit:1                
            }
        }]},function (err,res) {
            if(inst.valor >= res.peso_cheio){
                SensorColmeia.app.models.Alarme.create({tipo:1,lido:false})
            }

            if(res.__data && res.__data.medicoes && res.__data.medicoes[0] && ((res.__data.medicoes[0].valor)/1.5) > inst.valor){
                SensorColmeia.app.models.Alarme.create({tipo:2,lido:false})
            }
    
            next()        
        })
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