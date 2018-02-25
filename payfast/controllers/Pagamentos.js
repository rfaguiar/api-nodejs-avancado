
var logger = require('../servicos/logger.js');

module.exports = function(app) {

    app.get('/pagamentos', function (req, res, next) {

        console.log('Recebida requisicao de teste');

        res.send('OK');
    });

    app.get('/pagamentos/pagamento/:id', function(req, res){

        var id = req.params.id;

        // console.log('consultando pagamento: ' + id);        
        //Nova forma de escrever logs com Winston
        logger.info('consultando pagamento: ' + id);

        var memcachedClient = app.servicos.MemCachedClient();

        memcachedClient.get('pagamento-' + id, function(erro, retorno){
            if (erro || !retorno){
                console.log('MISS - chave nao encontrada');

                var connection = app.persistencia.ConnectionFactory();
                var pagamentoDao = new app.persistencia.PagamentoDAO(connection);

                pagamentoDao.buscaPorId(id, function(erro, resultado){
                    if(erro){
                        console.log('erro ao consultar no banco: ' + erro);
                        res.status(500).send(erro);
                        return;
                    }
                    console.log('pagamento encontrado: ' + JSON.stringify(resultado));
                    res.json(resultado);
                    return;
                });
            //HIT no cache
            } else {
                console.log('HIT - valor: ' + JSON.stringify(retorno));
                res.json(retorno);
                return;
            }
        });

    });

    app.delete('/pagamentos/pagamento/:id', function (req, res, next) {

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CANCELADO';

        var connection = app.persistencia.ConnectionFactory();
        var dao = new app.persistencia.PagamentoDAO(connection);

        dao.atualiza(pagamento, function(erro, resultado) {
            if (erro) {

                console.log('Erro ao cancelado no banco: ' + erro);
                res.status(500).send(erro);
                return;
            } else {

                console.log('pagamento cancelado');

                res.status(204).send(pagamento);
            }
        });
    });

    app.put('/pagamentos/pagamento/:id', function (req, res, next) {

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CONFIRMADO';

        var connection = app.persistencia.ConnectionFactory();
        var dao = new app.persistencia.PagamentoDAO(connection);

        dao.atualiza(pagamento, function(erro, resultado) {
            if (erro) {

                console.log('Erro ao atualizar no banco: ' + erro);
                res.status(500).send(erro);
                return;
            } else {

                console.log('pagamento atualizado');

                res.send(pagamento);
            }
        });    
    });

    app.post('/pagamentos/pagamento', function (req, res, next) {

        req.assert('pagamento.forma_de_pagamento',
                'Forma de pagamento obrigatorio').notEmpty();
        req.assert('pagamento.valor',
                'Valor obrigatorio e deve ser um decimal').notEmpty().isFloat();

        var errors = req.validationErrors();

        if (errors) {
            
            console.log('Erros de validação encontrados');
            res.status(400).send(errors);
            return;
        }

        var pagamento = req.body['pagamento'];

        console.log('processando uma requisicao de um novo pagamento');

        pagamento.status = 'CRIADO';
        pagamento.data = new Date();

        var connection = app.persistencia.ConnectionFactory();
        var dao = new app.persistencia.PagamentoDAO(connection);

        dao.salva(pagamento, function (erro, resultado) {

            if (erro) {

                console.log('Erro ao inserir no banco: ' + erro);
                res.status(500).send(erro);
                return;
            } else {

                console.log('pagamento criado');

                pagamento.id = resultado.insertId;

                // ISERINDO NO CACHE
                // var cache = app.servicos.MemCachedClient();
                // cache.set('pagamento-' + pagamento.id, result, 600, function (err) {
                //     if (err) {
                //         console.log('Erro ao colocar no cache: ' + err);
                //     }
                //     console.log('nova chave: pagamento-' + pagamento.id);
                // });

                if (pagamento.forma_de_pagamento == 'cartao') {

                    var cartao = req.body['cartao'];

                    var clientCartoes = new app.servicos.ClientCartoes();

                    clientCartoes.autoriza(cartao, function (exception, request, response, retorno) {

                        if (exception) {

                            console.log(exception);
                            res.status(400).send(exception);
                            return;
                        }


                        res.location('/pagamentos/pagamento/'+ pagamento.id);

                        var response = {
                            dados_do_pagamento: pagamento,
                            cartao: retorno,
                            links: [
                                {href: 'http://localhost:3000/pagamentos/pagamento/'+ pagamento.id, rel: 'consultar', method: 'GET'},
                                {href: 'http://localhost:3000/pagamentos/pagamento/'+ pagamento.id, rel: 'confirmar', method: 'PUT'},
                                {href: 'http://localhost:3000/pagamentos/pagamento/'+ pagamento.id, rel: 'cancelar', method: 'DELETE'}
                            ]
                        };

                        res.status(201).json(response);
                        return; 
                    });
                } else {

                    res.location('/pagamentos/pagamento/'+ pagamento.id);

                    var response = {
                        dados_do_pagamento: pagamento,
                        links: [
                            {href: 'http://localhost:3000/pagamentos/pagamento/'+ pagamento.id, rel: 'consultar', method: 'GET'},
                            {href: 'http://localhost:3000/pagamentos/pagamento/'+ pagamento.id, rel: 'confirmar', method: 'PUT'},
                            {href: 'http://localhost:3000/pagamentos/pagamento/'+ pagamento.id, rel: 'cancelar', method: 'DELETE'}
                        ]
                    };

                    res.status(201).json(response);
                }
            }
        });
    });
}