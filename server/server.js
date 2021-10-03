const { K3Server } = require("./K3Server.js");

const { Player } = require("../public/shared/Player");
const { Bullet } = require("../public/shared/Bullet");
const { Body } = require("matter-js");

const srv = new K3Server();
var Players = {}

srv.on("clientConnected", (client) => {

    let newPlayer = srv.createEntity(new Player(client.nickname));

    Players[client.socketId] = newPlayer;

    console.log("Nouveau client : " + client.nickname)

});

srv.on("clientDisconnected", (client) => {

    let id = client.socketId;

    console.log(client.nickname + " est partit")

    srv.deleteEntity(Players[id]);
    delete Players[id];

});

srv.on("update_client", (datas, sender) => {

    
    let player = Players[sender.id];

    Body.set(player.serverInstance.box, "position", {
        x: datas.mouseX,
        y: datas.mouseY
    })
    //player.serverInstance.replicated.positionX = datas.mouseX;
    //player.serverInstance.replicated.positionY = datas.mouseY;

});

srv.on("bullet", (datas, sender) => {

    let player = Players[sender.id];
    let lol = srv.createEntity(new Bullet(player.serverInstance.replicated.positionX, player.serverInstance.replicated.positionY - 75));

});