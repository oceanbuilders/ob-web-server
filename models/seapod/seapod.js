const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const seaPodUser = require('./seaPodUser');
const seaPodActionHistory = require('./seaPodActionHistory');
const adminPermissions = require('./adminPermissions');
const fs = require('fs');
const qrcode = require('qrcode');
const randomLocation = require('random-location');

const hexColorsRegEx = /^(0xFF|0xff)([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6})$/;
const seaPodSchema = new mongoose.Schema({
    SeaPodName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    vessleCode: {
        type: String,
        required: true,
        unique: true
    },
    qrCodeImageUrl: {
        type: String,
        required: true
    },
    location: {
        type: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },
        unique: true,
        required: true
    },
    exteriorFinish: {
        type: String,
        required: true
    },
    exterioirColor: {
        type: String,
        required: true,
        match: hexColorsRegEx
    },
    sparFinish: {
        type: String,
        required: true
    },
    sparDesign: {
        type: String,
        required: true
    },
    deckEnclosure: {
        type: String,
        required: true
    },
    bedAndLivingRoomEnclousure: {
        type: String,
        required: true
    },
    power: {
        type: String,
        required: true
    },
    powerUtilities: {
        type: [String],
        required: true
    },
    underWaterRoomFinishing: {
        type: String,
        required: true
    },
    underWaterWindows: {
        type: String,
        required: false
    },
    soundSystem: [String],
    masterBedroomFloorFinishing: {
        type: [String],
        required: true,
    },
    masterBedroomInteriorWallColor: {
        type: String,
        required: true,
        match: hexColorsRegEx
    },
    livingRoomloorFinishing: {
        type: String,
        required: true
    },
    livingRoomInteriorWallColor: {
        type: String,
        required: true,
        match: hexColorsRegEx
    },
    kitchenfloorFinishing: {
        type: String,
        required: true
    },
    kitchenInteriorWallColor: {
        type: String,
        required: true,
        match: hexColorsRegEx
    },
    hasWeatherStation: {
        type: Boolean,
        default: false
    },
    entryStairs: {
        type: String,
        required: true
    },
    hasFathometer: {
        type: Boolean,
        default: false
    },
    hasCleanWaterLevelIndicator: {
        type: Boolean,
        default: false
    },
    interiorBedroomWallColor: {
        type: String,
        required: true,
        match: hexColorsRegEx
    },
    deckFloorFinishMaterial: {
        type: String,
        required: true
    },
    seaPodStatus: {
        type: String,
        required: true
    },
    users: [{
        type: seaPodUser,
        default: []
    }],
    actionsHistory: [{
        type: seaPodActionHistory,
        default: []
    }],
    adminPermissions: adminPermissions,
    permissionSets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permissions'
    }],
    lightScenes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LightiningScenes',
        default: []
    }],
    seaPodOrientation: {
        type: Number,
        default: 50
    },
    accessRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReqestAccess'
    }],
    accessInvitation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReqestAccess'
    }],
});

seaPodSchema.methods.generateVesselCode = function () {
    const id = this._id.toString();
    const counter = id.substring(22, 24).split("");
    const timeStampSubSlipt = id.substring(4, 8).split("");
    const vesselCodeArray = ['S', ...counter, ...timeStampSubSlipt];

    return vesselCodeArray.join("").toUpperCase();
}

seaPodSchema.methods.generateQrCode = async function (vesselCode, hostName) {
    const dir = 'assets/qrcodes';

    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, {
            recursive: true
        });

    await qrcode
        .toFile(`${dir}/${vesselCode}.png`, vesselCode);

    return `https://${hostName}/qrcodes/${vesselCode}.png`;
}

seaPodSchema.methods.generateRandomLocation = function () {
    const centerPoint = {
        latitude: 7.978555,
        longitude: -82.051609
    };
    const radius = 20000;

    return randomLocation.randomCirclePoint(centerPoint, radius);
}

const SeaPod = mongoose.model('SeaPods', seaPodSchema);


function validateSeaPod(seapod) {
    const schema = Joi.object({
        SeaPodName: Joi.string().min(5).max(50).required(),
        exteriorFinish: Joi.string().required(),
        exterioirColor: Joi.string().pattern(hexColorsRegEx).required(),
        sparFinish: Joi.string().required(),
        sparDesign: Joi.string().required(),
        deckEnclosure: Joi.string().required(),
        bedAndLivingRoomEnclousure: Joi.string().required(),
        power: Joi.string().required(),
        powerUtilities: Joi.array().items(Joi.string()),
        underWaterRoomFinishing: Joi.string().required(),
        underWaterWindows: Joi.string(),
        soundSystem: Joi.array().items(Joi.string()),
        masterBedroomFloorFinishing: Joi.array().items(Joi.string()),
        masterBedroomInteriorWallColor: Joi.string().pattern(hexColorsRegEx).required(),
        livingRoomloorFinishing: Joi.string().required(),
        livingRoomInteriorWallColor: Joi.string().pattern(hexColorsRegEx).required(),
        kitchenfloorFinishing: Joi.string().required(),
        kitchenInteriorWallColor: Joi.string().pattern(hexColorsRegEx).required(),
        hasWeatherStation: Joi.boolean().default(false),
        entryStairs: Joi.boolean().default(true),
        hasFathometer: Joi.boolean().default(false),
        hasCleanWaterLevelIndicator: Joi.boolean().default(false),
        interiorBedroomWallColor: Joi.string().pattern(hexColorsRegEx).required(),
        deckFloorFinishMaterial: Joi.string().required(),
        seaPodStatus: Joi.string(),
    });

    return schema.validate(seapod);
}


exports.SeaPod = SeaPod;
exports.validateSeaPod = validateSeaPod;