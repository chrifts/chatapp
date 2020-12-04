import axios from "axios";
import { MAIN_APP_CONTACT_HANDLER, MAIN_APP_MESSAGES } from '../constants'

async function axiosRequest(type: string, url: string, postData?: {}, headers?: {}) {
    
    let data: any;
    if(type == 'GET') {
        try {
            const response = await axios.get(url, headers)
            data = response;
        } catch (error) {
            throw new Error(error.response.data.message);
        }
    }
    if(type == 'POST') {
        try {
            const response = await axios.post(url, postData, headers)
            data = response;
        } catch (error) {
            data = error.response;
        }
        
    }
    return data;
}

const emailRegex = (email: string) => {
    if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
        return true;
    }
    return false;
}

function defaultSocketEvents (socket: any, opts?: {context?: string, store?: any}) {
    //context = context app (main app or selectedChat)

    // connect	            Fired upon connection (including a successful reconnection)
    // disconnect	        Fired upon disconnection
    // connect_error	    Fired upon a connection error
    // connect_timeout	    Fired upon a connection timeout
    // reconnect_attempt	Fired upon an attempt to reconnect
    // reconnect_error	    Fired upon a reconnection attempt error
    // reconnect_failed	    Fired when the client couldn’t reconnect within reconnectionAttempts
    // reconnecting	        Alias for “reconnect_attempt”
    // reconnect	        Fired upon a successful reconnection
    // ping	                Fired when a ping is sent to the server
    // pong	                Fired when a pong is received from the server
    let socketStatus = '';
    console.log(socket);
    socket.on('connect', ()=>{
        console.log('connected', socket)
        if(opts?.context == 'mainSocket' ) {
            socketStatus = 'connected';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('connect_error', (error)=>{
        console.log('socket error: ', error, socket)
        if(opts?.context == 'mainSocket' ) {
            socketStatus = 'error';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('connect_timeout', (error)=>{
        console.log('socket error: ', error, socket)
        if(opts?.context == 'mainSocket' ) {
            socketStatus = 'connection timeout';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('disconnect', (res)=>{
        console.log('disconnected: ', res, socket)
        if(opts?.context == 'mainSocket' ) {
            socketStatus = 'disconnected';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('reconnect_attempt', (res)=>{
        console.log('reconnect_attempt: ', res, socket)
        if(opts?.context == 'mainSocket' ) {
            socketStatus = 'reconnect attempt';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('reconnect', (res)=>{
        console.log('reconnect: ', res, socket)
        if(opts?.context == 'mainSocket' ) {
            socketStatus = 'reconnected';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
}

function customSocketEvents(socket: any,  context: string, store: any, auth?: {}) {
    
    if(context == MAIN_APP_CONTACT_HANDLER) {
        
        socket.on('CONTACT_STATUS_ACCEPTED', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            if(payload.notification){
                store.commit('updateNotifications', payload)
            }
            store.commit('updateContactStatus', {payload: payload, event:'ACCEPTED'})
        });

        socket.on('CONTACT_STATUS_RESEND', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            if(payload.notification){
                store.commit('updateNotifications', payload)
            }
            store.commit('updateContactStatus', {payload: payload, event:'RESEND'})
        });

        socket.on('CONTACT_STATUS_REJECTED', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            if(payload.notification){
                store.commit('updateNotifications', payload)
            }
            store.commit('updateContactStatus', {payload: payload, event:'REJECTED'})
        });

        socket.on('CONTACT_STATUS_RESEND_CANCEL', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            if(payload.notification){
                store.commit('updateNotifications', payload)
            }
            store.commit('updateContactStatus', {payload: payload, event:'RESEND_CANCEL'})
        });

        socket.on('CONTACT_REQUEST', async (payload) => {
            console.log(payload)
            if(payload.message.sentByRejector) {
                store.commit('updateContactStatus', {payload: payload, event:'RESEND_BY_REJECTOR'})
            } else {
                store.commit('addContact', payload)
            }
            if(payload.notification){
                store.commit('updateNotifications', payload)
            }
        });
    }

    if(context == MAIN_APP_MESSAGES) {
        socket.on('MESSAGE_NOTIFICATION', (payload) => {
            store.commit('updateContactLastMessage', payload)
            if(payload.notification) {
                if(store.getters.selectedChat){
                    if(payload.chatId != store.getters.selectedChat.chatId) {
                        store.commit('updateNotifications', payload)
                    }
                } else {
                    store.commit('updateNotifications', payload)
                }
            }
        });
    }
}

export {
    axiosRequest,
    emailRegex,
    defaultSocketEvents,
    customSocketEvents
}