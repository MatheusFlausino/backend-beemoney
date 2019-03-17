var path = require('path');
var app = require(path.resolve(__dirname, '../server/server'));
var arrModels = require(path.resolve(__dirname, '../server/model-config.json'));
var ds = app.datasources.postgres;
var fs = require('fs');
require('events').EventEmitter.prototype._maxListeners = 100;

fs.readdir(path.resolve(__dirname, '../bin/data/'), (err, files) => {
    files.forEach(file => {
        var modelName = file.replace('.json','');

        if (!arrModels[modelName]){
            return;
        };

        if (process.argv[2] && process.argv[2]!=modelName){
            return;
        }
        
        var dados = require(path.resolve(__dirname, '../bin/data/'+file));

        dados.forEach(row =>{
            app.models[modelName].create(row, function(err, model) {
                if (err) console.log(err);                 
                console.log('Created: ', model);
            });
        });

    });
});