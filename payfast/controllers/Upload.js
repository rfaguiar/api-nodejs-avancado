
var fs = require('fs');

module.exports = function (app) {

    app.post('/upload/imagen', function (req, res, next) {

        console.log('Recebendo imagen');

        var filename = req.headers.filename;

        req.pipe(fs.createWriteStream('files/' + filename))
            .on('finish', function(erros) {
                if (erros) {
                    
                    res.status(500).send(erros);
                } else {

                    res.status(201).send('ok');
                }
            });

    });

}