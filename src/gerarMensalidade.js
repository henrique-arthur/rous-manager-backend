const connection = require('./database/connection');
const moment = require('moment');

module.exports = {
    async gerarMensalidade(){
        moment.locale('pt')

        const contrato = await connection('contrato')
        .select('idContrato', 'dataInicio', 'dataFinal','valorContrato','produto')
        .where('fechado',0);

        var today = moment(new Date(),'YYYY-MM-DD','pt').format('L');
        var today = this.dateConverter(today,'en');
        var mesatual = moment().format('MM');
        var anoatual = moment().format('YYYY');

        var verfmes = false;

        //console.log('gerarMensalidade() running at ' + moment().format('llll'));

        for (i in contrato){                                 //PERCORRER CADA CONTRATO
            if(moment(today).isAfter(contrato[i].dataFinal)){//SE A DATA DE HOJE FOR DEPOIS DA DATA DE VENCIMENTO
                                                             //DO CONTRATO ELE É FECHADO
                await connection('contrato')
                    .where('idContrato',contrato[i].idContrato)
                    .update({fechado:1});

                console.log('Contrato de ID: '+contrato[i].idContrato+' Fechado dia '+moment().format('L'))
            }
            else{                                                 //SE O CONTRATO NÃO ESTIVER FECHADO 
                var mensalidades = await connection('mensalidade')//PERCORRER CADA MENSALIDADE DO MESMO
                    .innerJoin('contrato','contrato.idContrato','mensalidade.idContrato')
                    .select('mensalidade.idMensalidade','mensalidade.dataValidade')
                    .where('mensalidade.idContrato',contrato[i].idContrato)
                    .andWhere('contrato.fechado',0);

                //PEGAR A ULTIMA POSIÇÃO DA MENSALIDADE DO CONTRATO SELECIONADO 
                //É MENOR OU IGUAL A DATA ATUAL
                // FIXME console.log(mensalidades)
                if(!this.isEmpty(mensalidades)){
                    mesdb = mensalidades[mensalidades.length - 1].dataValidade;
                    // FIXME console.log('caiu no if de pegar a ultima data da mensalidade: '+mesdb);
                }else{
                    mesdb = moment(contrato[i].dataInicio).subtract(1,'month');
                    // FIXME console.log('caiu no if de pegar a dataInicio do contrato') 
                }    
                // FIXME console.log('mesdb antes: '+moment(mesdb).format('YYYY-MM-DD'))
                mesdb = moment(mesdb).format('YYYY-MM-DD').split('-');
                if(parseInt(mesdb[1]) < mesatual || parseInt(mesdb[0]) < anoatual ){      //SE FOR MENOR (NÃO EXISTE MENSALIDADE ESTE MES) verfmes SAI TRUE
                    verfmes = true;
                }
                else if(mesdb[1] == mesatual.toString() && mesdb[0] == anoatual.toString()){//SE FOR IGUAL(JÁ EXISTE UMA MENSALIDADE ESSE MES) verfmes SAI FALSE
                    verfmes = false;
                }
                
                if(verfmes){
                    // FIXME console.log((mensalidades == [])?'true': 'false')
                    if(!this.isEmpty(mensalidades)){
                        nextmonth = moment(mensalidades[mensalidades.length - 1].dataValidade).add(1,'month');
                    }else{
                        nextmonth = moment(contrato[i].dataInicio);
                    }
                    // FIXME console.log('mesdb dps: '+moment(nextmonth).format('YYYY-MM-DD'))
                    await connection('mensalidade').insert({
                        idContrato: contrato[i].idContrato,
                        valor: contrato[i].valorContrato,
                        dataValidade:moment(nextmonth).format('YYYY-MM-DD'),
                    });

                    console.log('Mensalidade adicionada ao contrato ID: '+ contrato[i].idContrato+'\nmês: '+moment(nextmonth).format('YYYY-MM-DD'))
                }
            }
            // FIXME console.log('----------------------------------------')
        }
    },

    dateConverter(date, string){
        /**
         * CONVERSOR DE DATA  ANCHOR
         * 
         * Passando 'pt' no segundo parâmetro
         * converte YYYY-MM-DD para DD/MM/YYYY
         * 
         * Passando 'en' no segundo parâmetro
         * converte DD/MM/YYYY para YYYY-MM-DD
         */

        if(string === 'pt'){
            try{
                date = date.split('-');    
                date = date[2] +'/'+date[1]+'/'+date[0];
                return date;
            }catch(err){throw err}
        }
        else if(string === 'en'){
            date = date.split('/');    
            date = date[2] +'-'+date[1]+'-'+date[0];
            return date;
        }
        else throw 'formato de data para conversão inválido.';   
    },

    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
}
