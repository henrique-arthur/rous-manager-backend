const connection = require('../database/connection');
const moment = require('moment');
const manipulator = require('../gerarMensalidade');
module.exports ={

    async create(request, response){
        try{
            const {nome, telefone, nomeRepresentante, rua, bairro, numero, cidade, uf} = request.body;

            const verfCliente = await connection('cliente').select('idCliente').where('nome', nome).first();
            if(verfCliente){
                throw 'Já existe um cliente com este nome cadastrado.';
            }      

            await connection('cliente')
                .insert({
                    nome, 
                    telefone, 
                    nomeRepresentante, 
                    rua, 
                    bairro, 
                    numero, 
                    cidade, 
                    uf:uf.toUpperCase(),
                });
            return response.status(200).json();
        }catch(err){
            return response.status(400).json({erro:"Erro ao cadastrar o cliente: "+err});
        }
    },
    
    async edit(request, response){
        try{
            const {id} = request.params;
            const {nome, telefone, nomeRepresentante, rua, bairro, numero, cidade, uf} = request.body;

            cliente = await connection('cliente')
            .update({
                nome, 
                telefone, 
                nomeRepresentante, 
                rua, 
                bairro, 
                numero, 
                cidade, 
                uf
            })
            .where('idCliente',id);

            return response.status(200).json(cliente);
        }catch(err){
            return response.status(400).json({erro:'Erro ao carregar clientes:'+err})
        }
                    

    },
    
    async delete(request, response){
        try{
            const {id} = request.params;

            await connection('cliente')
            .update({deletado: 1})
            .where('idCliente',id);

            await connection('contrato')
            .update({fechado: 1})
            .where('idCliente',id);

            return response.status(200).json();
        }catch(err){
            return response.status(400).json({erro:'Erro ao deletar cliente.'})
        }
    },

    async listAll(request, response){
        try{
            clientes = await connection('cliente')
            .select('idCliente','nome','nomeRepresentante')
            .where('deletado',0);

            return response.status(200).json(clientes);
        }catch(err){
            return response.status(400).json({erro:'Erro ao carregar clientes:' + err})
        }
    },

    async listOne(request, response){
        try{
            const {id} = request.params;
            let rsp = {}

            const cliente = await connection('cliente')
            .select('idCliente','nome','nomeRepresentante','telefone','rua','bairro','numero','cidade','uf')
            .where('idCliente',id).first();

            const mensalidade = await connection('contrato')
            .innerJoin('mensalidade', 'contrato.idContrato', 'mensalidade.idContrato')
            .select ('contrato.produto', 'contrato.dataInicio', 'contrato.dataFinal',
            'contrato.valorContrato', 'mensalidade.idMensalidade', 'mensalidade.valor',
            'mensalidade.dataPagamento', 'mensalidade.dataValidade', 'mensalidade.pago')
            .where('contrato.idCliente',id)
            .andWhere('contrato.fechado',0);
            
            if(!cliente) throw 'Este cliente não existe.';

            rsp = cliente; 

            if(manipulator.isEmpty(mensalidade)){
                rsp.dataInicio = '~';
                rsp.dataFinal = '~';
                rsp.valorContrato = '0';
                rsp.produto = 'Não existe contrato em aberto.';
                rsp.terminoContrato = '~';
            }
            else{//NOTE MOSTRAR QUANTO TEMPO FALTA EM MESES P CONTRATO
                rsp.dataInicio = mensalidade[0].dataInicio;
                rsp.dataFinal = mensalidade[0].dataFinal;
                rsp.valorContrato = mensalidade[0].valorContrato;
                rsp.produto = mensalidade[0].produto;
                rsp.terminoContrato = '';

                let fim = mensalidade[0].dataFinal;

                let fimmeses = moment(fim,'YYYY-MM-DD','pt').format('L')//manipulator.dateConverter(fim,'pt');

                fimmeses = moment(fimmeses,'DD/MM/YYYY','pt').endOf('day').fromNow();
                fimmeses = fimmeses[0].toUpperCase() + fimmeses.substr(1);        

                rsp.terminoContrato = fimmeses;
          
                rsp.dataInicio = moment(rsp.dataInicio,'YYYY-MM-DD','pt').format('L');
                rsp.dataFinal = moment(rsp.dataFinal,'YYYY-MM-DD','pt').format('L');
            }
            //rsp.cliente = JSON.parse(rsp.cliente);
            //rsp.mensalidade = JSON.parse(rsp.mensalidade);
            return response.status(200).json(rsp);
        }catch(err){
            return response.status(400).json({erro:'Erro ao carregar cliente: '+err})
        }
    }
}