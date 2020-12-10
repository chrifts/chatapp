import { CONTACT_REQUEST } from "../../constants";
import { readNotification, sendNotification } from "../../helpers";

const UM = require("../../models/user.model");

function ADD_CONTACT(io: any) {
    const callback = async (req, res) => {
        try {
            const contact = await UM.findOne({email: req.body.contactEmail}).lean()
            const me = await UM.findOne({email: req.body.myEmail}).lean()
            let userExists = false;
            let userExistsStatus = false;
            
            const cont = me.contacts.filter(e => e.contact_id == contact._id)
            console.log(cont);
            if(cont.length > 0) {
                if(cont[0].status == 'rejected_by_me') {
                    userExistsStatus = true;
                } else {
                    userExists = true;
                }
                if(userExists) {
                    res.status(403).json({message: 'User exists'})
                    return;
                }
            }
            // if(userExistsStatus) {
            //     res.status(403).json({message: 'You ha'})
            //     return;
            // }

            if(contact && me) {
                delete me.password;
                delete me.contacts;
                try {
                    
                
                if(userExistsStatus) {
                    //RESENT BY REJECTOR
                    await UM.findOneAndUpdate({
                        email: req.body.myEmail
                    }, 
                    {
                        $set: {
                            contacts: {
                                status: 'requested_by',
                                contact_id: contact._id
                            }
                        }
                    })
                    await UM.findOneAndUpdate({
                        email: req.body.contactEmail
                    },
                    {
                        $set: {
                            contacts: {
                                status: 'sent',
                                contact_id: me._id
                            }
                        }
                    })
                } else {
                    await UM.findOneAndUpdate({
                        email: req.body.myEmail
                    }, 
                    {
                        $push: {
                            contacts: {
                                status: 'sent',
                                contact_id: contact._id
                            }
                        }
                    })
                    await UM.findOneAndUpdate({
                        email: req.body.contactEmail
                    },
                    {
                        $push: {
                            contacts: {
                                status: 'requested_by',
                                contact_id: me._id
                            }
                        }
                    })
                }
                me.status = 'requested_by'
                contact.status = 'sent'    
                await sendNotification(me, contact._id, {message: {event: 'NEW_CONTACT', status: 'new contact from', sentByRejector: userExistsStatus, requestStatus: me.status }}, CONTACT_REQUEST, io, 'CONTACT_REQUEST')
                res.json({contact_data: contact});
                } catch (error) {
                    res.send(403).json({error: 'Error adding contact'});   
                    throw new Error(error)    
                }
            } else {
                res.status(403).json({error: 'No user found'})
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
        
    }
    return callback;
}

function GET_CONTACTS(io: any) {

    const callback = async (req, res) => {
        
        try {
            const me = await UM.findOne({email: req.body.email}).lean()
            let contacts = []
            for await (const element of me.contacts) {
                const contact = await UM.findOne(
                    {
                        _id: element.contact_id,
                        
                    },
                    
                ).lean()
                console.log(element)
                if(contact) {
                    contact.status = element.status;
                    contact.lastMessage = element.lastMessage;
                    delete contact.password;
                    delete contact.contacts;
                    contacts.push(contact);
                }
            }            
            res.status(200).json({contacts: contacts});
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
    }
    return callback;
}

function HANDLE_CONTACT_REQUEST(io: any) {
    //EVENTS:
    //@CONTACT_REQUEST_RESEND
    //@CONTACT_REQUEST_ACCEPTED
    //@CONTACT_REQUEST_REJECTED
    //@CONTACT_STATUS_RESEND_CANCEL
    const callback = async (req, res) => {
        
        try {
            const my_data = await UM.findOne({_id: req.body.myId}).lean();             
            delete my_data.password;
            delete my_data.contacts;

            const contact_data = await UM.findOne({_id: req.body.contactId}).lean()
            delete contact_data.password;
            delete contact_data.contacts;
            var event_to_send: String;
            switch (req.body.event) {
                case 'ACCEPTED':
                    event_to_send = 'CONTACT_STATUS_ACCEPTED';
                    try {
                        const contact = await UM.updateOne({
                            _id: req.body.contactId,
                            "contacts.contact_id": req.body.myId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'connecteds' 
                            }
                        })
                        const me = await UM.updateOne({
                            _id: req.body.myId,
                            "contacts.contact_id": req.body.contactId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'connecteds' 
                            }
                        })
                        my_data.status = 'connecteds';
                        contact_data.status = 'connecteds';
                        await sendNotification(my_data, contact_data._id, {message: {event:'ACCEPTED', status: 'connecteds'}}, CONTACT_REQUEST, io, event_to_send)
                        await readNotification(my_data, contact_data, CONTACT_REQUEST)
                        io.of('/user-'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({event:'ACCEPTED', status: 'connecteds'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }
                    break;
            
                case 'RESEND':
                    event_to_send = 'CONTACT_STATUS_RESEND';
                    try {    
                        const contact = await UM.updateOne({
                            _id: req.body.contactId,
                            "contacts.contact_id": req.body.myId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'requested_by' 
                            }
                        })
                        const me = await UM.updateOne({
                            _id: req.body.myId,
                            "contacts.contact_id": req.body.contactId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'sent' 
                            }
                        })
                        my_data.status ='requested_by';
                        contact_data.status = 'sent';
                        await readNotification(my_data, contact_data, CONTACT_REQUEST)
                        await sendNotification(my_data, contact_data._id, {message: {event:'RESEND', status: 'resend'}}, CONTACT_REQUEST, io, event_to_send)
                        // io.of('/user-'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({event:event_to_send, status: 'resent'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }
                    break;
                
                case 'REJECTED':
                    event_to_send = 'CONTACT_STATUS_REJECTED';
                    try {    
                        const contact = await UM.updateOne({
                            _id: req.body.contactId,
                            "contacts.contact_id": req.body.myId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'rejected_by_contact' 
                            }
                        })
    
                        const me = await UM.updateOne({
                            _id: req.body.myId,
                            "contacts.contact_id": req.body.contactId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'rejected_by_me' 
                            }
                        })
                        my_data.status = 'rejected_by_contact'
                        contact_data.status = 'rejected_by_me'
                        await readNotification(my_data, contact_data, CONTACT_REQUEST)
                        await sendNotification(my_data, contact_data._id, {message: {event:'REJECTED', status: 'rejected'}}, CONTACT_REQUEST, io, event_to_send)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({message: 'rejected'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }
                    break;
                
                case 'RESEND_CANCEL':
                    event_to_send = 'CONTACT_STATUS_RESEND_CANCEL';

                    try {    
                        const contact = await UM.updateOne( 
                            {
                                _id: req.body.contactId
                            }, 
                            {
                                $pull: { contacts: { contact_id: req.body.myId } }
                            },
                            {multi: true} 
                        )

                        const me = await UM.updateOne( 
                            {
                                _id: req.body.myId
                            }, 
                            {
                                $pull: { contacts: { contact_id: req.body.contactId } }
                            },
                            {multi: true} 
                        )
                        
                        

                        my_data.status = 'resend_cancelled'
                        //contact_data.status = 'resend_cancelled'
                        //io.of('/'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({message: 'resend_cancelled'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }

                    break;
                default:
                    console.log('NO CASE SENT IN REQUEST')
                    res.send(500).json({error: 'default event undefined'})
                    break;
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
        
    }
    return callback;
}

function READ_NOTIFICATIONS() {

    const callback = async (req, res) => {
        try {        
            const notifications = req.body.notifications;
            Object.entries(notifications).forEach(([ix, el])=>{
                Object.entries(el).forEach(([i, e])=>{ 
                    e.forEach(notf => {
                        notf.status = 'read'
                    });
                })
            })
            console.log(req.user)
            await UM.updateOne({_id: req.user._id}, {$set: {notifications: notifications}}).exec()
            console.log(notifications);
            res.status(200).json({data:'ok'})
        } catch (error) {
            res.status(500).json({error: 'error reading notifications'})
            throw new Error(error)
        }
    }
    return callback;
}

export {
    ADD_CONTACT,
    GET_CONTACTS,
    HANDLE_CONTACT_REQUEST,
    READ_NOTIFICATIONS
}