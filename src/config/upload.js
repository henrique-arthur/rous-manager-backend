const multer = require('multer');
const path = require('path');

module.exports = {
    storage: multer.diskStorage({
        //destination: path.resolve('.','src','database','images'),
        destination: path.resolve(__dirname,'..','database','images'),

        filename: (req, file, cb) => {
            cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)},
    }),

    fileFilter :(req, file, cb) =>{
        if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/jpg' || file.mimetype === 'image/png'){cb(null,true)}
        else{cb(new Error('Tipo de imagem não suportado.'),false)}
    },
    
    upload : multer({
        storage: this.storage, 
        limits: {
            fileSize: 1024 * 1024 * 2},
        fileFilter:this.fileFilter    
        }),
}
