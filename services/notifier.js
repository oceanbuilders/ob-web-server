const { sendMultipleNotification } = require('./fcmNotifier');

class Notifier {
    static async createAndSendNotification(tokens, notificationContainer) {
        const message = {
            notification: {
                title: notificationContainer.title,
                body: notificationContainer.body
            },
            data: JSON.stringify(notificationContainer.data),
            tokens: tokens
        }
        sendMultipleNotification(message);
    }
}
module.exports = Notifier;