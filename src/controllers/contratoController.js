const connection = require('../database/connection');
const moment = require('moment');

const contractManipulator = require('../gerarMensalidade');

module.exports = {
    async create(request, response){
        try{
            const {idCliente}  = request.params;
            const {produto, diaCobranca, tempoContrato, mesInicial, valor} = request.body;

            let verfContrato = await connection('contrato')
            .innerJoin('cliente','contrato.idCliente','cliente.idCliente')
            .select('contrato.idContrato')
            .where('cliente.idCliente', idCliente)
            .andWhere('contrato.fechado', 0)
            .first();

            if(verfContrato){
                throw 'Este cliente já possui um contrato em andamento.';
            } 

            var ano = moment().year();
            ano = ano.toString();

            const inicioCobranca = ano.concat('-',mesInicial,'-',diaCobranca);
            /**
             * NOTE
             * Recebendo o diaCobranca, mesInicial e concatenando em uma data padrão americano em inicioCobranca
             * depois, adicionando o tempoContrato na var data para pegar a Data final
             */

            var finalCobranca = moment(inicioCobranca, "YYYY-MM-DD", "en", true);

            finalCobranca.add(tempoContrato,'month');

             resp = await connection('contrato').insert({
                idCliente,
                dataInicio:inicioCobranca,
                dataFinal:moment(finalCobranca).format("YYYY-MM-DD"),
                valorContrato: valor,
                produto,
            });

            //contractManipulator.gerarMensalidade();
                                                                  
            return response.status(200).json();
        }catch(err){
            return response.status(400).json({erro:err});
        }
    },
}