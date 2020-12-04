module.exports = function(io: any) {


    //selected Chat Namespaces
    const chatspaces = io.of(/^\/chat-\w+$/);
    chatspaces.on('connection', socket => {
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
        const workspace = socket.nsp;
        //console.log(workspace);
        console.log(workspace.name+' connected');

        
        socket.on('disconnect', () => {
            console.log(workspace.name+' disconnected')
        });
    });
}
