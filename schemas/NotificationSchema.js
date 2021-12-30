const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
    {
        userTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        userFrom: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        notificationType: String,
        opened: { type: Boolean, default: false },

        entityId: Schema.Types.ObjectId,
    },
    { timestamps: true }
);

NotificationSchema.statics.insertNotification = async (
    userTo,
    userFrom,
    notificationType,
    entityId
) => {
    let data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId: entityId,
    };
    await Notification.deleteOne(data).catch((e) => console.log(e));
    return Notification.create(data).catch((e) => console.log(e));
};

let Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
