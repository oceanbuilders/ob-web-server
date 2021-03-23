const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const AWS = require('aws-sdk');
const fs = require('fs');
const _ = require('lodash');

const { User } = require('../models/users/user');
const { SeaPod } = require('../models/seapod/seapod');
const { SeaPodConfig } = require('../models/seapod/seaPodConfig');
const { PermissionService } = require('./permission');
const { generateFakeData, isOwnerAtSeaPod } = require('../helpers/utilites');
const { filterUserAndSeapods, filterSeaPods } = require('../helpers/filtering');
const { LightiningSceneService } = require('./lightiningScene');

class SeaPodService {

    async buildSeaPod(obj) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findById(obj.user)
                .populate('seaPods')
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'accessRequests',
                        model: 'ReqestAccess'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'accessInvitation',
                        model: 'ReqestAccess'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'permissionSets',
                        model: 'Permissions'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'lightScenes',
                        model: 'LightiningScenes'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'users.lighting.lightScenes',
                        model: 'LightiningScenes'
                    }
                })
                .populate({
                    path: 'seaPods',
                    populate: {
                        path: 'users.permissionSet',
                        model: 'Permissions'
                    }
                })
                .populate('accessRequests')
                .populate('accessInvitation');

            if (!user) return {
                isError: true,
                statusCode: 404,
                error: 'User Not Found!'
            };

            const token = obj.token;
            const notificationToken = await this.getNotificationToken(user, token);

            const seapod = await this.createSeapod(obj.body, notificationToken, obj.hostName, user);
            user.seaPods.push(seapod._id);

            await user.save();
            const newSeaPod = await seapod.save();
            user.seaPods.pop();
            user.seaPods.push(newSeaPod);

            await session.commitTransaction();

            const updatedUser = filterUserAndSeapods(user.toJSON(), generateFakeData(user.seaPods.length));

            return {
                isError: false,
                user: updatedUser
            };
        } catch (error) {
            await session.abortTransaction();
            return {
                isError: true,
                statusCode: 404,
                error: error
            };
        } finally {
            session.endSession();
        }
    }

    async updateSeaPodName(seapodId, seapodName, userId) {
        const seapod = await this.getSeapodById(seapodId);
        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: "Seapod not found!"
        }

        if (!isOwnerAtSeaPod(seapod.users, userId)) return {
            isError: true,
            statusCode: 403,
            error: "Access denied. you are not allowed to update the seapod name!"
        }

        seapod.SeaPodName = seapodName;
        await seapod.save();
        return {
            isError: false,
            updateSeapod: filterSeaPods(JSON.parse(JSON.stringify([seapod])), userId, generateFakeData(1))
        }
    }

    async getNotificationToken(user, token) {
        for (const td of user.tokensAndDevices) {
            const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
            if (decoded.jti == td.jti) //hasTheSameJti
                return td.notificationToken;
        }
        return "";
    }

    async getAllSeapods() {
        const seaPods = await SeaPod.find()
            .populate('permissionSets')
            .populate('accessRequests')
            .populate('accessInvitation')
            .populate('lightScenes')
            .populate('seaPodConfig')
            .populate('users.lighting.lightScenes')
            .populate('users.permissionSet');

        for (const seapod of seaPods)
            seapod.data = generateFakeData(1).pop();

        return seaPods;
    }

    async getSeapodById(seapodId) {
        const seapod = await SeaPod.findById(seapodId)
            .populate('permissionSets')
            .populate('accessRequests')
            .populate('accessInvitation')
            .populate('lightScenes')
            .populate('seaPodConfig')
            .populate('users.lighting.lightScenes')
            .populate('users.permissionSet');

        if (!seapod) return;
        seapod.data = generateFakeData(1).pop();
        return seapod;
    }

    async getUserSeapods(userId) {
        const userSeapods = await User.findById(userId).populate('seaPods').select('seaPods');

        if (!userSeapods.seaPods) return {
            isError: true,
            statusCode: 404,
            error: "SeaPods Not Found!"
        }

        const filteredSeapods = filterSeaPods(JSON.parse(JSON.stringify(userSeapods.seaPods)), userId, generateFakeData(userSeapods.seaPods.length));

        return {
            isError: false,
            seaPods: filteredSeapods
        };
    }

    async toggleIsDisableStatus(seapodId, userId, ownerId) {
        const seapod = await this.getSeapodById(seapodId);

        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: 'Seapod Not found!'
        };
        let isOwner = isOwnerAtSeaPod(seapod.users, ownerId);
        if (!isOwner) return {
            isError: true,
            statusCode: 403,
            error: 'Your are not allowed to take this action on the current seapod'
        };

        for (const seapodUser of seapod.users) {
            if (seapodUser._id === userId)
                seapodUser.isDisabled = !seapodUser.isDisabled;
        }

        await seapod.save();

        return {
            isError: false,
            seapodUsers: seapod.users
        };
    }


    async removeUserFromSeapod(seapodId, userId, ownerId, eventEmitter) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const seapod = await this.getSeapodById(seapodId);

            if (!seapod) return {
                isError: true,
                statusCode: 404,
                error: "Seapod Not found!"
            };

            let isOwner = isOwnerAtSeaPod(seapod.users, ownerId);
            if (!isOwner) return {
                isError: true,
                statusCode: 403,
                error: "Your are not allowed to take this action on the current seapod"
            };

            if (seapod.users.length === 1) return {
                isError: true,
                statusCode: 400,
                error: "This member can't be removed,SeaPod Must have at least one member"
            };
            const onwerName = seapod.users.id(ownerId).userName;
            const index = this.indexOfUser(seapod.users, userId);
            if (index == -1) return {
                isError: true,
                statusCode: 404,
                error: "User not found!"
            }

            seapod.users.splice(index, 1);

            await seapod.save();

            const user = await User.findById(userId);
            const seapodIndex = user.seaPods.indexOf(seapodId);
            user.seaPods.splice(seapodIndex, 1);
            await user.save();
            await session.commitTransaction();

            const notificationData = {
                title: `You are no longer a member at Sea Pod ${seapod.name} (${seapod.vessleCode})`,
                message: 'SEAPOD ACCESS UPDATE',
                data: {
                    "message": `You have been deleted by ${onwerName}`
                },
                type: 'seapod_member_removal'
            };

            eventEmitter.emit('sendRequestAccessNotification',
                [user.tokensAndDevices[user.tokensAndDevices.length - 1].notificationToken], notificationData);

            eventEmitter.emit('addNotificationDataToOnwers', [user._id],
                notificationData);

            return {
                isError: false,
                seapodUsers: seapod.users
            };
        } catch (error) {
            await session.abortTransaction();
            return {
                isError: true,
                statusCode: 500,
                error: error.message
            }
        } finally {
            session.endSession();
        }
    }

    async createSeapod(seapodData, notificationToken, hostName, user) {
        let seapod = new SeaPod(seapodData);

        seapod.data = generateFakeData(1).pop();
        seapod.location = seapod.generateRandomLocation();

        seapod.users.push({
            _id: user._id,
            userName: user.getUserName(),
            profilePicUrl: user.profileImageUrl,
            notificationToken: notificationToken,
            type: 'OWNER',
        });

        seapod.actionsHistory.push({
            action: "Sea Pod Creation",
            actionResult: "SUCCEESED",
            userId: user._id,
            userName: user.getUserName(),
            userType: 'OWNER'
        });
        const vesselCode = seapod.generateVesselCode();
        seapod.vessleCode = vesselCode;

        const qrCodeUrl = await seapod.generateQrCode(vesselCode, hostName);
        seapod.qrCodeImageUrl = qrCodeUrl;

        const model = "A";
        const seaPodConfig = await SeaPodConfig.findOne({ model });
        seapod.seaPodConfig = seaPodConfig;
        await seapod.populate('seaPodConfig')
            .populate({
                path: 'seaPodConfig',
                populate: {
                    path: 'rooms.roomConfig',
                    model: 'RoomConfig'
                }
            }).execPopulate();

        const permissionService = new PermissionService();
        seapod = await permissionService.addDefaultPremissionSets(seapod);
        await seapod.populate('permissionSets').execPopulate();
        seapod = await permissionService.addDefaultPremissionSet(user._id, seapod);

        const lightiningSceneService = new LightiningSceneService();
        seapod = await lightiningSceneService.addDefaultLightScenes(user._id, seapod);

        return seapod;
    }

    indexOfUser(users, userId) {
        for (let index = 0; index < users.length; index++)
            if (users[index]._id === userId)
                return index;
        return -1;
    }

    async getUserDetails(seapodId, userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'User Not Found!'
                };
            }

            let seapod = await this.getSeapodById(seapodId);
            if (!seapod) return {
                isError: true,
                statusCode: 404,
                error: "Seapod Not found!"
            };

            await seapod.populate('users.permissionSet')
                .populate({
                    path: "users.lighting.lightScenes",
                    model: 'LightiningScenes'
                })
                .execPopulate();

            const seapodUser = seapod.users.id(userId);

            return {
                isError: false,
                seapodUsers: seapodUser
            };
        } catch (error) {
            return {
                isError: true,
                statusCode: 500,
                error: error.message
            }
        }
    }

    encode(data) {
        let buf = Buffer.from(data);
        let base64 = buf.toString('base64');
        return base64
    }

    async getQrImage(vessleCode) {
        
            const seapod = await SeaPod.findOne({ 'vessleCode': vessleCode });
            if (!seapod) return {
                isError: true,
                statusCode: 404,
                error: "Seapod Not found!"
            };

            const dir = 'assets/qrcodes';
            const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
            const IAM_USER_KEY = process.env.AWS_ACCESS_KEY_ID;
            const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;

            const s3 = new AWS.S3({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET
            });

            const qrImagePath = `${dir}/${vessleCode}.png`
        
        try {
            const qrImage = await s3.getObject({
                Bucket: BUCKET_NAME,
                Key: qrImagePath
            }).promise();

            fs.writeFileSync(qrImagePath, qrImage.Body);   
        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        }

        return {
            isError: false,
            qrImagePath
        }
    }

    async getSeapodOwner(seapodId) {

        let owners = [];

        try {
            const seapod = await SeaPod.findById(seapodId);

            seapod.users.forEach(user => {
                if (user.type == 'OWNER') owners.push(_.pick(user, ['_id', 'userName', 'checkInDate', 'profilePicUrl']))
            })

            for (let i = 0; i < owners.length; i++) {
                const ownerInfo = await User.findById(owners[i]._id).populate('seaPods');

                owners[i].seaPods = [];
                ownerInfo.seaPods.forEach(seapod => {
                    let seapodName = seapod.SeaPodName;
                    let seapodUser = seapod.users.find(user => user._id == owners[i]._id)
                    const seapodInstance = {
                        seapodName,
                        userType: seapodUser.type
                    }
                    owners[i].seaPods.push(seapodInstance)
                })

                owners[i].country = ownerInfo.country;
                owners[i].firstName = ownerInfo.firstName;
                owners[i].lastName = ownerInfo.lastName;
                owners[i].email = ownerInfo.email;
                owners[i].mobileNumber = ownerInfo.mobileNumber;
                owners[i].emergencyContacts = ownerInfo.emergencyContacts;
            }
        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        }

        return {
            isError: false,
            owners,
            statusCode: 200
        };

    }

    async selectWeatherSource(seapodId, source) {
        const seapod = await SeaPod.findById(seapodId)
            .populate('permissionSets')
            .populate('accessRequests')
            .populate('accessInvitation')
            .populate('lightScenes')
            .populate('seaPodConfig')
            .populate('users.lighting.lightScenes')
            .populate('users.permissionSet');
        if (!seapod) return {
            isError: true,
            error: 'Seapod not found!',
            statusCode: 400
        }

        if (source != 'external' && source != 'local') {
            return {
                isError: true,
                error: 'Source value is invalid',
                statusCode: 400
            }
        }

        seapod.selectedWeatherSource = source;
        seapod.save();

        return {
            isError: false,
            seapod,
            statusCode: 200
        };
    }
}
exports.SeaPodService = SeaPodService;