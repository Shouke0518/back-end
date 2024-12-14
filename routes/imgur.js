const { Router } = require('express');
var router = Router();
const { imgurFileHandler } = require('../utils/fileHandlers');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const imgurUrl = await imgurFileHandler(file);
        console.log('File uploaded to Imgur:', imgurUrl);

        res.status(200).json({ imgurUrl: imgurUrl });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Error uploading file');
    }
};

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
