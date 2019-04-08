module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();


  var path = require('path');
  var app = require(path.resolve(__dirname, '../server'));

  app.models.SensorColmeia.find({},function (err,res) {
    console.log(res);
    
  })

};