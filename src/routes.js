const multer = require('multer');
const express = require('express');
const uploadConfig = require('./config/upload');
const { celebrate, Joi, Segments } = require('celebrate');

const clienteController = require('./controllers/clienteController');
const usuarioController = require('./controllers/usuarioController');
const contratoController = require('./controllers/contratoController');
const mensalidadeController = require('./controllers/mensalidadeController');

routes = express.Router();
const upload = multer(uploadConfig);

/**
 * NOTE
 * GET: Buscar uma informação no back-end
 * POST: Criar/Enviar uma informação no back-end
 * PUT: Alterar uma informação no back-end
 * DELETE: Deletar uma informação no back-end
 */


//USUÁRIO
routes.post('/usuario/cadastro',
celebrate({
    [Segments.BODY]:Joi.object().keys({
        nome: Joi.string().required(),
        user: Joi.string().required(),
        nascimento: Joi.string().min(10).required(),
        email: Joi.string().required().email(),
        usersenha: Joi.string().min(3).required(),
        chave: Joi.string().required()
    })
}),
usuarioController.create); //CADASTRAR USUÁRIO
routes.post('/usuario/login', usuarioController.login); //LOGIN USUÁRIO
routes.get('/usuario/equipe', usuarioController.list);
routes.put('/usuario/editar/:id', upload.single('profileImage'), usuarioController.edit);

//CLIENTE
routes.post('/cliente/cadastro',
celebrate({
    [Segments.BODY]:Joi.object().keys({
        nome: Joi.string().required(),
        telefone: Joi.string().required(),
        nomeRepresentante: Joi.string().required(),
        rua: Joi.string().required(),
        bairro: Joi.string().required(),
        numero: Joi.number().required(),
        cidade: Joi.string().required(),
        uf: Joi.string().length(2).required(),
    })
}),
clienteController.create);
routes.get('/cliente/listar/todos',clienteController.listAll);
routes.get('/cliente/listar/:id',clienteController.listOne);
routes.put('/cliente/editar/:id',
celebrate({
    [Segments.BODY]:Joi.object().keys({
        nome: Joi.string().required(),
        telefone: Joi.string().required(),
        nomeRepresentante: Joi.string().required(),
        rua: Joi.string().required(),
        bairro: Joi.string().required(),
        numero: Joi.number().required(),
        cidade: Joi.string().required(),
        uf: Joi.string().length(2).required(),
    })
}),
clienteController.edit);
routes.put('/cliente/excluir/:id',clienteController.delete);

//CONTRATO
routes.post('/cobranca/nova/:idCliente',
celebrate({
    [Segments.BODY]:Joi.object().keys({
        produto: Joi.string().required(),
        diaCobranca: Joi.string().length(2).required(),
        tempoContrato: Joi.number().required(),
        mesInicial: Joi.string().length(2).required(),
        valor: Joi.number().required()
    })
})
,contratoController.create);

//MENSALIDADES
routes.get('/mensalidades/todas',mensalidadeController.listTodas); // NOTE Menu listar
routes.get('/mensalidades/proximas',mensalidadeController.listProximas);
routes.get('/mensalidades/atrasadas',mensalidadeController.listAtrasadas);
routes.get('/mensalidades/pagas',mensalidadeController.listPagas);
routes.get('/mensalidades/cliente/:id',mensalidadeController.listCliente);
routes.get('/mensalidades/:id',mensalidadeController.listOne); //LISTAR UMA MENSALIDADE
routes.post('/mensalidades/:id/:pago',mensalidadeController.pagar); //PAGAR OU "DESPAGAR" A MENSALIDADE

module.exports = routes;
  