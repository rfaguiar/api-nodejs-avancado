
var soap = require('soap');

function CorreiosSOAPClient() {

    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
    
}

CorreiosSOAPClient.prototype.calculaPrazo = function (dados, callback) {

    soap.createClient(this._url, function (erro, cliente) {
                    
        console.log('cliente soap criado');

        cliente.CalcPrazo(dados, callback);
    });
}

module.exports = function() {
    return CorreiosSOAPClient;
}



            // {
            //     'nCdServico':'40010',
            //     'sCepOrigem':'04101300',
            //     'sCepDestino':'6500600'
            // }