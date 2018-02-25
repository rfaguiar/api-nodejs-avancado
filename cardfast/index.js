var app = require('./config/CustomExpress')();

var server = app.listen(3001, function () {

    console.log('Servidor de cartoes rodando na porta 3001');
});

