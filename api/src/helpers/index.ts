const UM = require("../models/user.model");
const ObjectID = require('mongodb').ObjectID;

async function sendNotification(from, to, message, type, io?, socketEvent?){
    console.log(from, to);
    try {
        let notification = {
            _id: ObjectID(),
            extraDataFrom: from,
            from: from._id,
            to: to,
            message: message.message,
            timestamp: message.timestamp,
            chatId: message.chatId,
            type: type,
            notification: true,
            status: 'unread'
        };
        const user = await UM.findOneAndUpdate({
                _id: to,
            },
            {
                $push: {
                    [`notifications.${type}.${from._id}`]: notification
                },
                
            },{multi: true}
            
        ).exec()
           
        io.of('/user-'+to).emit(socketEvent, notification)    
        return true;
    } catch (error) {
        throw new Error(error)
    }
}

async function readNotification(to, from, type ) {
    try {
        const usr = await UM.findOneAndUpdate({
            _id: to._id,
        },
        {
            $unset: { [`notifications.${type}.${from._id}`] : 1 }
            
        }
        ).exec()
        if(usr) {
            return 'ok'
        } else {
            return 'error'
        }
    } catch (error) {
        throw new Error(error)        
    }
}

export {
    sendNotification,
    readNotification
}