const express = require('express');
const _ = require('lodash');
const path = require('path');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { validateSeaPod } = require('../models/seapod/seapod');
const { SeaPodService } = require('../services/seapod');
const { validateObjectId, validateSeapdName } = require('../services/validation');
const attachAccessRequestListner = require('../subscribers/accessManagement');

const router = express.Router();

const eventEmitter = new (require('events').EventEmitter)();
attachAccessRequestListner(eventEmitter);

router.post('/', auth, async (req, res) => {
    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': "Seapod data is required!"
    });

    const { error } = validateSeaPod(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const contextObject = {
        user: req.user,
        token: req.get('x-auth-token'),
        body: req.body,
        hostName: req.hostName,
    }
    const seaPodService = new SeaPodService();
    const result = await seaPodService.buildSeaPod(contextObject);

    if (result.isError)
        return res.status(result.statusCode ? 500 : result.statusCode).json({
            'message': result.error.message
        });

    return res.status(200).json(result.user);
});

router.get('/', [auth, admin], async (req, res) => {
    const seaPodService = new SeaPodService();
    const seapods = await seaPodService.getAllSeapods();

    return res.send(seapods);
});

router.get('/:id', [auth, admin], async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).json({
        "message": "Invalid seapod id!"
    });

    const seaPodService = new SeaPodService();
    const seapod = await seaPodService.getSeapodById(req.params.id);

    if (!seapod) return res.status(400).json({
        "message": "Seapod not found!"
    });
    return res.send(seapod);
});

router.put('/:id/name', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.id);
    if (seapodIdError.error) return res.status(400).json({
        'message': 'Invalid seapod id!'
    });

    if (_.isEmpty(req.body)) return res.status(400).json({
        'message': 'Seapod name is required!'
    });

    const { error } = validateSeapdName(req.body);
    if (error) return res.status(400).json({
        'message': error.message
    });

    const seaPodService = new SeaPodService();
    const result = await seaPodService.updateSeaPodName(req.params.id, req.body.seapodName, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.updateSeapod);
});

router.put('/:seapodId/users/:userId', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        'message': 'Invalid seapod id!'
    });

    const userIdError = validateObjectId(req.params.userId);
    if (userIdError.error) return res.status(400).json({
        'message': 'Invalid user id!'
    });

    const seaPodService = new SeaPodService();
    const result = await seaPodService.toggleIsDisableStatus(req.params.seapodId, req.params.userId, req.user._id);

    if (result.isError) return res.status(result.statusCode).send({
        'message': result.error
    });
    return res.send(result.seapodUsers);
});

router.delete('/:seapodId/users/:userId', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid seapod id!"
    });

    const userIdError = validateObjectId(req.params.userId);
    if (userIdError.error) return res.status(400).json({
        "message": "Invalid user id!"
    });

    const seaPodService = new SeaPodService();
    const result = await seaPodService.removeUserFromSeapod(req.params.seapodId, req.params.userId, req.user._id, eventEmitter);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.seapodUsers);
});

router.get('/:seapodId/users/:userId', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid seapod id!"
    });

    const userIdError = validateObjectId(req.params.userId);
    if (userIdError.error) return res.status(400).json({
        "message": "Invalid user id!"
    });

    const seaPodService = new SeaPodService();
    const result = await seaPodService.getUserDetails(req.params.seapodId, req.params.userId);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.send(result.seapodUsers);
});

router.get('/qrcode/:vessleCode', async (req, res)=> {
    const seaPodService = new SeaPodService();
    const result = await seaPodService.getQrImage(req.params.vessleCode);

    if (result.isError) return res.status(result.statusCode).send({
        "message": result.error
    });
    return res.sendFile(path.join(__dirname, '/../', result.qrImagePath));

})

router.get('/:seapodId/owner', [auth, admin], async (req, res) => {
    const seaPodService = new SeaPodService();
    const result = await seaPodService.getSeapodOwner(req.params.seapodId);

    if (result.isError) return res.status(result.statusCode).json({
        'message': result.error
    });

    return res.status(200).json(result.owners);
});

router.put('/:seapodId/weatherSource/:source', auth, async (req, res) => {
    const seapodIdError = validateObjectId(req.params.seapodId);
    if (seapodIdError.error) return res.status(400).json({
        "message": "Invalid seapod id!"
    });

    if (!req.params.source) return res.status(400).json({
        'message': "Weather Source is required!"
    });

    const seaPodService = new SeaPodService();
    const result = await seaPodService.selectWeatherSource(req.params.seapodId, req.params.source);

    if (result.isError) return res.status(result.statusCode).json({
        "message": result.error
    });
    return res.send(result.seapod);
});

module.exports = router;