const connection = require('../database/connection');
const CryptoJS = require("crypto-js");
const dateManipulator = require('../gerarMensalidade');
const fs = require('fs');
const cryptokey = 'roussistemas';

module.exports = {
    async create(request,response){ //CADASTRAR USUÁRIO
        try{
            const {nome, user, nascimento, email, usersenha, chave} = request.body;
        
            var dtnascimento = dateManipulator.dateConverter(nascimento, 'en');

            const userdb = await connection('usuario').select('user');

            for(cont in userdb){
                if(userdb[cont].user==user){
                    return response.status(400).json({erro:"Este nome de usuário já está em uso."});
                }
            }

            const [chavedb] = await connection('chave').select('chave').where('id',1);

            if(chavedb.chave == chave){
                senha = CryptoJS.AES.encrypt(usersenha, cryptokey).toString(); //CRIPTOGRAFAR

                await connection('usuario').insert({
                    nome,
                    user,
                    nascimento:dtnascimento,
                    email,
                    senha,
                });
                return response.status(200).json();
            }else if (chavedb.chave != chave){
                return response.status(400).json({erro:"Token incorreto."});
            }
            //return response.status(400).json({erro:"Erro ao cadastrar o usuário."});
        }catch(e){
            return response.status(400).json({erro:e.data.Error})
        }
    },

    async login(request, response){
        try{
            const {usuario, senha} = request.body;

            const [login] = await connection('usuario')
            .select('idUsuario','user','senha','nome')
            .where('user',usuario)
            .orWhere('email',usuario);
    
            if(!login){
                return response.status(404).json({erro:'Este usuário não existe.'});
            }
                let bytes  = CryptoJS.AES.decrypt(login.senha, cryptokey); //DESCRIPTOGRAFAR P COMPARAR
                let senhaDecript = bytes.toString(CryptoJS.enc.Utf8);   
                
            if(senha==senhaDecript){

                nomepartido = login.nome.split(" ");
                console.log(nomepartido.length)
                let nomeFinal = '';
                if(nomepartido.length > 2){
            
                    if(nomepartido[1].toLowerCase()=="de" || nomepartido[1].toLowerCase()=="dos" || nomepartido[1].toLowerCase()=="das" || nomepartido[1].toLowerCase()=="da"){
                        nomeFinal = nomepartido[0].concat(" ",nomepartido[1]," ",nomepartido[2])                
                    }else{
                        nomeFinal = nomepartido[0].concat(" ",nomepartido[1]);         
                    }
                }else{
                    nomeFinal = nomeFinal = nomepartido[0].concat(" ",nomepartido[1]); 
                }

                console.log(`Usuário ${usuario} acaba de logar.`);
                return response.status(200).json({id:login.idUsuario, nome:nomeFinal});
            }
            return response.status(404).json({erro:'Usuário ou senha Incorretos.'});
        }catch(err){
            return response.status(400).json({erro:'Erro ao tentar fazer login.'});
        }
    },

    async list(request, response){
        const usuarios = await connection('usuario').select('nome','descricao','foto');
        for(cont in usuarios){
            nomepartido = usuarios[cont].nome.split(" ");
            usuarios[cont].foto = JSON.parse(usuarios[cont].foto);
           if(nomepartido.length > 2){
            
                if(nomepartido[1].toLowerCase()=="de" || nomepartido[1].toLowerCase()=="dos" || nomepartido[1].toLowerCase()=="das" || nomepartido[1].toLowerCase()=="da"){
                    usuarios[cont].nome = nomepartido[0].concat(" ",nomepartido[1]," ",nomepartido[2])                
                }else{
                    usuarios[cont].nome = nomepartido[0].concat(" ",nomepartido[1]);         
                }
            }
            if(!usuarios[cont].foto){
                usuarios[cont].foto = null;
            }else{
                usuarios[cont].foto = usuarios[cont].foto.path;
            }
        }
        return response.json(usuarios);
    
    },

    async edit(request, response){   
        const{nome, user, descricao, email, nascimento, senha, foto} = request.body;
        const {id} = request.params;
        try{
            usersenha = CryptoJS.AES.encrypt(senha, cryptokey).toString(); //CRIPTOGRAFAR
            request.file.idUsuario = id;

            const oldimg = await connection('usuario').select('foto').where('idUsuario',id).first();
            
            if(oldimg.foto != null){
                const imgparsered = JSON.parse(oldimg.foto);
                fs.unlink(imgparsered.path, (err) => {
                    if (err) throw err;
                });
            }

            imgparser=JSON.stringify(request.file);

            await connection('usuario').update({
                nome:nome,
                user:user,
                descricao:descricao,
                email:email, 
                nascimento:nascimento, 
                senha:usersenha,
                foto:imgparser
            })
            .where('idUsuario',id)
            
            return response.status(200).json();
        }catch(err){
            return response.status(400).json({error:err});
        }
    }
}