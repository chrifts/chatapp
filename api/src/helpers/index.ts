const UM = require("../models/user.model");
const ObjectID = require('mongodb').ObjectID;
import { NEW_MESSAGE } from "../constants";
const CM = require("../models/chat.model");


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

async function postMessage(io: any, msg: any) {
    const notificationType = NEW_MESSAGE;
    console.log(io, msg)
    const data = msg
    console.log(data);
    try {
        const chat = await CM.findOneAndUpdate(
            {
                _id: data.chatId
            },
            {
                $push: {
                    messages: data.message
                }
            }
        )
        if(chat) {
            console.log(data)
            let event = data.message;
            event.from = data.from._id;
            console.log(event);
            io.of('/chat-'+data.chatId).emit('NEW_MESSAGE', event)
            const chat = await CM.findOne(
                {
                    _id: data.chatId,
                }
            ).lean()
            let i = 0;
            //TODO: Make this for await fully dynamic
            for await (const user_id of chat.members) {
                const user = await UM.updateOne({
                    _id: chat.members[i],
                    "contacts.contact_id": chat.members[i+1 == 2 ? 0 : i+1]
                }, 
                {
                    $set: {
                        "contacts.$.lastMessage" : {message: data.message.message, timestamp: data.message.timestamp},
                    }
                })
                i++;
            }
            console.log(data);
            const notification = {
                _id: ObjectID(),
                extraDataFrom: data.from,
                from: data.from._id,
                message: data.message.message,
                timestamp: data.message.timestamp,
                type: notificationType,
                to: data.message.to,
                chatId: chat._id
            };
            console.log(notification);
            await sendNotification(notification.extraDataFrom, data.message.to, {message: notification.message, timestamp: notification.timestamp, chatId: notification.chatId}, notificationType, io, 'MESSAGE_NOTIFICATION')                
            
        }
    } catch (error) {
        throw new Error(error)
    }
}

export {
    sendNotification,
    readNotification,
    postMessage
}