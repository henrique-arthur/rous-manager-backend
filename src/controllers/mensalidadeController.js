const connection = require('../database/connection');
const moment = require('moment');
const dateManipulator = require('../gerarMensalidade');

module.exports = {
    async listOne(request, response){
        try{
            const {id} = request.params;

            mensalidade = await connection('mensalidade')
            .innerJoin('contrato','contrato.idContrato','mensalidade.idContrato')
            .innerJoin('cliente','cliente.idCliente','contrato.idCliente')
            .select('cliente.nome',
            'mensalidade.dataPagamento','mensalidade.dataValidade','mensalidade.valor')
            .where('mensalidade.idMensalidade',id).first();

             mensalidade.dataPagamento = (!mensalidade.dataPagamento) ? "Mensalidade ainda não foi paga." : moment(mensalidade.dataPagamento,'YYYY-MM-DD','pt').format('L');
             mensalidade.dataValidade = moment(mensalidade.dataValidade,'YYYY-MM-DD','pt').format('L');

            return response.status(200).json(mensalidade);
        }catch(err){
            return response.status(400).json({erro:err})
        }
    },

    async pagar(request,response){
        try{
            const {id,pago} = request.params;

            let dataPagamento = moment().format('YYYY-MM-DD');

            rsp = await connection('mensalidade')
                .update({pago, dataPagamento})
                .where('idMensalidade',id);

            return response.status(200).json({rsp});
        }catch(err){
            return response.status(400).json({erro:err})
        }
    },

    async listTodas(request, response){   
        try{
            const { page = 1} = request.query;
            
            const [cont] = await connection.table('mensalidade').count();

            mensalidades = await connection
            .table('mensalidade')
            .innerJoin('contrato', 'contrato.idContrato', 'mensalidade.idContrato')
            .innerJoin('cliente', 'cliente.idCliente','contrato.idCliente')
            .limit(8)
            .offset((page-1)*8)
            .select('cliente.nome','mensalidade.idMensalidade','mensalidade.dataPagamento','mensalidade.dataValidade','mensalidade.valor')

            for (i in mensalidades){
                mensalidades[i].dataPagamento = (!mensalidades[i].dataPagamento) ? "Mensalidade ainda não foi paga." : moment(mensalidades[i].dataPagamento,'YYYY-MM-DD','pt').format('L');
                mensalidades[i].dataValidade = moment(mensalidades[i].dataValidade,'YYYY-MM-DD','pt').format('L');
            }

            response.header('X-Total-Count',cont['count(*)']);
            return response.status(200).json(mensalidades);
        }catch(err){
            return response.status(400).json({erro:"Erro ao carregar mensalidades.\n"+err});
        }
    },

    async listProximas(request, response){
        try{
            const { page = 1} = request.query;

            today = moment(new Date(),'YYYY-MM-DD','pt').format('L'); // NOTE RECE DATA EM DD/MM/YYYY
            todate = moment(today,'DD-MM-YYYY','pt').add(7,'days').format('L'); //RECEBE DATA ATUAL + 7 DIAS EM DD/MM/YYYY

            today = dateManipulator.dateConverter(today,'en');
            todate = dateManipulator.dateConverter(todate,'en');

            const [cont] = await connection.table('mensalidade').count().whereBetween('mensalidade.dataValidade',[today,todate]).andWhere('mensalidade.pago',0);

            mensalidades = await connection
            .table('mensalidade')
            .innerJoin('contrato', 'contrato.idContrato', 'mensalidade.idContrato')
            .innerJoin('cliente', 'cliente.idCliente','contrato.idCliente')
            .limit(8)
            .offset((page-1)*8)
            .select('cliente.nome','mensalidade.idMensalidade','mensalidade.dataPagamento','mensalidade.dataValidade','mensalidade.valor')
            .whereBetween('mensalidade.dataValidade',[today,todate])
            .andWhere('mensalidade.pago',0);

            for (i in mensalidades){
                mensalidades[i].dataPagamento = (!mensalidades[i].dataPagamento) ? "Mensalidade ainda não foi paga." : moment(mensalidades[i].dataPagamento, 'YYYY-MM-DD','pt').format('L');
                mensalidades[i].dataValidade = moment(mensalidades[i].dataValidade, 'YYYY-MM-DD','pt').format('L');
            }

            response.header('X-Total-Count',cont['count(*)']);
            return response.status(200).json(mensalidades);
        }catch(err){
            return response.status(400).json({erro:"Erro ao carregar mensalidades.\n "+err});
        }
    },

    async listAtrasadas(request, response){
        try{
            const { page = 1} = request.query;

            //ANCHOR FORMATO CORRETO DE CONVERSÃO ABAIXO "moment(new Date(),'YYYY-MM-DD','pt')"
            today = moment(new Date(),'YYYY-MM-DD','pt').format('L'); // NOTE RECE DATA EM DD/MM/YYYY
            today = dateManipulator.dateConverter(today,'en');
            
            const [cont] = await connection.table('mensalidade')
            .count()
            .where('mensalidade.dataValidade','<',today)
            .whereNot('mensalidade.pago',1);

            mensalidades = await connection
            .table('mensalidade')
            .innerJoin('contrato', 'contrato.idContrato', 'mensalidade.idContrato')
            .innerJoin('cliente', 'cliente.idCliente','contrato.idCliente')
            .limit(8)
            .offset((page-1)*8)
            .select('cliente.nome','mensalidade.idMensalidade','mensalidade.dataPagamento','mensalidade.dataValidade','mensalidade.valor')
            .where('mensalidade.dataValidade','<',today)
            .whereNot('mensalidade.pago',1);

            for (i in mensalidades){
                mensalidades[i].dataPagamento = (!mensalidades[i].dataPagamento) ? "Mensalidade ainda não foi paga." : moment(mensalidades[i].dataPagamento,'YYYY-MM-DD','pt').format('L');
                mensalidades[i].dataValidade = moment(mensalidades[i].dataValidade,'YYYY-MM-DD','pt').format('L');
            }

            response.header('X-Total-Count',cont['count(*)']);
            return response.status(200).json(mensalidades);
        }catch(err){
            return response.status(400).json({erro:"Erro ao carregar mensalidades.\n"+err});
        }
    },

    async listPagas(request, response){
        try{
            const { page = 1} = request.query;
            
            const [cont] = await connection.table('mensalidade').count().where('mensalidade.pago',1);

            mensalidades = await connection
            .table('mensalidade')
            .innerJoin('contrato', 'contrato.idContrato', 'mensalidade.idContrato')
            .innerJoin('cliente', 'cliente.idCliente','contrato.idCliente')
            .limit(8)
            .offset((page-1)*8)
            .select('cliente.nome','mensalidade.idMensalidade','mensalidade.dataPagamento','mensalidade.dataValidade','mensalidade.valor')
            .where('mensalidade.pago',1);

            for (i in mensalidades){
                mensalidades[i].dataPagamento = (!mensalidades[i].dataPagamento) ? "Mensalidade ainda não foi paga." : moment(mensalidades[i].dataPagamento,'YYYY-MM-DD','pt').format('L');
                mensalidades[i].dataValidade = moment(mensalidades[i].dataValidade,'YYYY-MM-DD','pt').format('L');
            }

            response.header('X-Total-Count',cont['count(*)']);
            return response.status(200).json(mensalidades);
        }catch(err){
            return response.status(400).json({erro:"Erro ao carregar mensalidades.\n"+err});
        }
    },

    async listCliente(request, response){
        try{
            const {id}  = request.params;
            const [cont] = await connection('cliente')
            .innerJoin('contrato', 'cliente.idCliente', 'contrato.idCliente')
            .innerJoin('mensalidade', 'mensalidade.idContrato','contrato.idContrato')
            .count()
            .where('cliente.idCliente',id);

            const mensalidades = await connection('contrato')
            .innerJoin('mensalidade', 'contrato.idContrato', 'mensalidade.idContrato')
            .select ('contrato.produto', 'contrato.dataInicio', 'contrato.dataFinal',
            'contrato.valorContrato', 'mensalidade.idMensalidade', 'mensalidade.valor',
            'mensalidade.dataPagamento', 'mensalidade.dataValidade', 'mensalidade.pago')
            .where('contrato.idCliente',id)
            .andWhere('contrato.fechado',0);
            
            for (i in mensalidades){
                mensalidades[i].dataPagamento = (!mensalidades[i].dataPagamento) ? "Mensalidade ainda não foi paga." : moment(mensalidades[i].dataPagamento,'YYYY-MM-DD','pt').format('L');
                mensalidades[i].dataValidade = moment(mensalidades[i].dataValidade,'YYYY-MM-DD','pt').format('L');
            }

            response.header('X-Total-Count',cont['count(*)']);
            return response.status(200).json(mensalidades);
        }catch(err){
            return response.status(400).json({erro:"Erro ao carregar mensalidades.\n"+err});
        }
    },
}