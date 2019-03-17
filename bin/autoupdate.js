var path = require('path');
var app = require(path.resolve(__dirname, '../server/server'));
var arrModels = require(path.resolve(__dirname, '../server/model-config.json'));
var ds = app.datasources.mongodb;
require('events').EventEmitter.prototype._maxListeners = 100;

var promises = new Array();
Object.keys(arrModels).forEach(model => {
    
    if (arrModels[model].dataSource!="mongodb"){
        return;
    }

    if (process.argv[2] && process.argv[2]!=model){
        return;
    }

    ds.autoupdate(model)
        .then(function(){
            console.log("Updated: "+model);
            return;
        }).catch(function err(e) {
            console.log('Error:', e);
            return;
        });
    });