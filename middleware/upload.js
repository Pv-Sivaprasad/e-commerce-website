
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
})

const upload = multer({ 
    storage: storage,
    limits: { fieldSize: 10 * 1024 * 1024 } // Adjust size limit as needed (10MB in this example)
})

module.exports= upload;