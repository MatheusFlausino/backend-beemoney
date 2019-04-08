'use strict';

module.exports = function (Colmeia) {
    Colmeia.observe('before save', function (ctx, next) {
        console.log(ctx);
        next()        
    })
};