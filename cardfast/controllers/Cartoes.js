
module.exports = function (app) {

    app.post('/cartoes/autoriza', function (req, res, next) {

        req.assert('numero', 'Número é obrigatorio e deve ter 16 caracteres').notEmpty().len(16,16);
        req.assert('bandeira', 'Bandeira do cartão é obrigatoria').notEmpty();
        req.assert('ano_de_expiracao', 'Ano de expiração é obrigatorio e deve ter 4 caracteres').notEmpty().len(4,4);
        req.assert('mes_de_expiracao', 'Mês de expiração é obrigatorio e deve ter 2 caracteres').notEmpty().len(2,2);
        req.assert('cvv', 'CVV de expiração é obrigatorio e dever ter 3 caracteres').notEmpty().len(3,3);

        var errors = req.validationErrors();

        if (errors) {

            console.log('erros de validação encontrados');
            res.status(400).send(errors);
            return;
        }

        console.log('processando pagamento com cartão');

        var cartao = req.body;
        cartao.status = 'AUTORIZADO';

        var response = {
            dados_dos_cartao: cartao
        }

        res.status(201).json(response);
    });

}