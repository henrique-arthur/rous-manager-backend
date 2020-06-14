const gerarMensalidade = require('./gerarMensalidade');
const schedule = require('node-schedule')
const express = require ('express');
const { errors } = require('celebrate');
const routes = require('./routes');
const path = require('path');
const app = express();

app.use(express.json());
app.use(routes);
app.use(errors());
app.use('/imagens' ,express.static(path.resolve(__dirname,'database','images')));
app.listen(process.env.APP_PORT || 3333);

var a = schedule.scheduleJob('*/10 * * * * *',()=>{gerarMensalidade.gerarMensalidade()});
//gerarMensalidade.gerarMensalidade()

//'* 16 17 * * 0-7'