import { postMessage } from './helpers/index'

module.exports = function(io: any) {
    //selected Chat Namespaces
    const chatspaces = io.of(/^\/chat-\w+$/);
    chatspaces.on('connection', socket => {
        
        socket.on('ChatSpaceMessage', (msg)=>{
            postMessage(io, msg)
        })
        const chatSpace = socket.nsp;
        console.log('connected to ChatSpace: '+chatSpace.name)
        socket.broadcast.emit('broadcast', 'hello friends')
        socket.on('disconnect', () => {
            console.log('disconnected from ChatSpace: '+chatSpace.name)
        });
    })

    //User Main Namespace
    const workspaces = io.of(/^\/user-\w+$/);
    workspaces.on('connection', socket => {
        socket.emit('ping', {info: 'first ping'});
        const workspace = socket.nsp;
        //console.log(workspace);
        console.log(workspace.name+' connected');
        
        socket.on('pong', function(data){
            console.log("Pong received from client");
            socket.emit('ping', data);
        });
        
        socket.on('disconnect', () => {
            console.log(workspace.name+' disconnected')
            socket.emit('reconnect_attempt', socket)
        });
    });
}
