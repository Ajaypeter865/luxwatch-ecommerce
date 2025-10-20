const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { error } = require('console')

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        console.log('storage - Entered destination');

        let folder = 'public/img/uploads'
        // console.log('storage - req.file', req.file);

        fs.mkdirSync(folder, { recursive: true })
        cb(null, folder)
    },
    filename: (req, file, cb) => {

        const uniqueName = Date.now() + "_" + file.originalname
        console.log('storage - req.file', req.file);
        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) => {
    const allowdedTypes = /jpeg|jpg|png/;
    console.log('fileFilter - Entered allowedTypes');
    const extname = allowdedTypes.test(path.extname(file.originalname).toLocaleLowerCase())
    if (extname) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowded'))
    }
}


const upload = multer({ storage, fileFilter })

// console.log('upload =', upload, 'getFilename =', upload.getFilen, 'getDestination =', upload.getDestination);


module.exports = {
    upload
}