
module.exports = function (app) {

    app.post('/correios/calculo-prazo', function (req, res, next) {

        var dadosDaEntrega = req.body;

        var correiosSOAPClient = new app.servicos.CorreiosSOAPClient();
        correiosSOAPClient.calculaPrazo(dadosDaEntrega, function (erros, resultado) {

            if (erros) {
                
                res.status(500).send(erros);
                return;
            } else {

                console.log('prazo calculado com sucesso');
                res.json(resultado);
            }
        });

        
    });
}