const express = require('express');
const { LoggerService } = require('../services/logger');

const router = express.Router();
// const auth = require('../middlewares/auth');
// const admin = require('../middlewares/admin');

router.get('/' , async (req, res) => {

    const loggerService = new LoggerService();
    const result = loggerService.getAllLog();

    // if (result.isError) return res.status(result.statusCode).send({
    //     "message": result.error
    // });
    return res.send(result);
});

module.exports = router;