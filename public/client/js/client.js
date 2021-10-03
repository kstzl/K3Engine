const { K3Client } = require("../../client/js/K3Client");

const client = new K3Client();

let playersCount = new PIXI.Text("",{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
let entitiesCount = new PIXI.Text("",{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
let serverDelay = new PIXI.Text("",{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});

playersCount.x = 25;
entitiesCount.x = 25;
serverDelay.x = 25;

playersCount.y = 25;
entitiesCount.y = 50;
serverDelay.y = 75;


client.app.stage.addChild(playersCount);
client.app.stage.addChild(entitiesCount);
client.app.stage.addChild(serverDelay);

client.app.stage.interactive = true;

client.app.stage.on("pointermove", (datas) => {

    let pos = datas.data.global;

    client.socket.emit("update_client", {
        mouseX: pos.x,
        mouseY: pos.y
    })
});

client.on("updateClientsCount", (datas) => { playersCount.text = `${datas} joueur(s)`; });

client.on("updateEntitiesCount", (datas) => { entitiesCount.text = `${datas} entitée(s)`; });

client.on("disconnect", (e) => {
    serverDelay.style.fill = 0xfc0303;
    serverDelay.text = `DISCONNECTED ! (${e})`;
});

client.on("_update_server", (datas) => {

    serverDelay.text = `Delai serveur : ${client.serverDelay.toFixed(3)}ms`;

    if(client.serverDelay >= 0)
    {
        serverDelay.style.fill = 0x49fc03;
    }
    if(client.serverDelay >= 0.5)
    {
        serverDelay.style.fill = 0xfc7b03;
    }
    if(client.serverDelay >= 1)
    {
        serverDelay.style.fill = 0xfc0303;
    }

});


client.on("keydown", (e) => {
    
    if(e.key == " ")
    {
        client.socket.emit("bullet", {});
    }

});