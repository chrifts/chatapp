import { NEW_MESSAGE } from "../../constants";
import { readNotification, sendNotification } from "../../helpers/index"
const CM = require("../../models/chat.model");
const UM = require("../../models/user.model");
const ObjectID = require('mongodb').ObjectID;

const getOrCreate = async (req, res) => {
    //get chat where members
    try {

        const chat = await CM.findOne({members: { "$eq" : req.body.members.sort()}}).lean()
        if(chat !== null) {
            //return chat
            res.status(200).json({chat: chat});
        } else {
            //create and return
            const chat = new CM(
            { 
                members: req.body.members 
            });
            chat.save(async function (err) {
                if (err) {
                    return res.json(err);
                }
                const created_chat = await CM.findOne({members: { "$eq" : req.body.members.sort()}}).lean()
                res.status(200).json({chat: created_chat});
            });
            
        }
    } catch (error) {
        res.status(500).json({error: error});
        throw new Error(error)
    }
}

function postMessage(io: any) {
    const notificationType = NEW_MESSAGE;
    const callback = async (req, res) => {
        const data = JSON.parse(JSON.stringify(req.body))
        
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
                const event = data.message;
                event.from = data.message.from._id;
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
                const notification = {
                    _id: ObjectID(),
                    extraDataFrom: data.message.from,
                    from: JSON.parse(JSON.stringify(req.body.message.from)),
                    message: data.message.message,
                    timestamp: data.message.timestamp,
                    type: notificationType,
                    to: data.message.to,
                    chatId: chat._id
                };
                
                await sendNotification(notification.from, data.message.to, {message: notification.message, timestamp: notification.timestamp, chatId: notification.chatId}, notificationType, io, 'MESSAGE_NOTIFICATION')                
                io.of('/user-'+notification.from._id).emit('MESSAGE_NOTIFICATION', notification)
                res.status(200).json({message: chat})
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error)
        }
    }
    return callback;
}

const getMessages = async (req, res) => {
    try {
        const chat = await CM.findOne({_id: req.body.chatId}).lean()
        //DELETE NEW-MESSAGE NOTIFICATIONS FROM CONTACT
        if(req.body.contact) {
            const status = await readNotification(req.user, req.body.contact, NEW_MESSAGE)
            if(status == 'error') {
                throw new Error('chat controller error')
            }
        }  
        
        res.status(200).json({messages: chat.messages})
    } catch (error) {
        res.status(500).json({error: error})
        throw new Error(error)
    }
    
}

const clearNotifications = async (req, res) => {
    console.log(req.body, req.user)
    const status = await readNotification(req.user, req.body.leaved, NEW_MESSAGE)
    if(status == 'error') {
        res.json({error: 'error clearing notifications'})
        throw new Error('chat controller error')
    }
    res.json({data: 'ok'})
}

export {
    getOrCreate,
    postMessage,
    getMessages,
    clearNotifications
}