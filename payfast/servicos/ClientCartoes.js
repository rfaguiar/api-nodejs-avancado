
var restify = require('restify-clients');

function ClientCartoes() {

    this._client = restify.createJsonClient({
        url: 'http://localhost:3001'
    });
}


ClientCartoes.prototype.autoriza = function (cartao, callback) {
    this._client.post('/cartoes/autoriza', cartao, callback);
};

module.exports = function() {
    return ClientCartoes;
}