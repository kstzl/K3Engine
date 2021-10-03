module.exports = class K3SocketClient{

    constructor(socket, uniqueId)
    {
        this.socket = socket;
        this.socketId = socket.id;
        this.uniqueId = uniqueId;
        this.nickname = `Client ${uniqueId}`;
    }

    setNickname(newNickname)
    {
        this.nickname = newNickname;
    }
}