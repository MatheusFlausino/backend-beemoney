'use strict';

module.exports = function (Medida) {
    Medida.validatesUniquenessOf('nome');
};