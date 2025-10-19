const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'public/img/uploads'
        fs.mkdirSync(folder, {recursive:true})
        cb(null, folder)
    }

    
})