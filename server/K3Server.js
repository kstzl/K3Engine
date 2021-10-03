const { env } = require("process");
const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const path = require("path");
const { performance } = require("perf_hooks");
const { Engine, World, Runner, Bodies } = require("matter-js");

const { v4: uuidv4 } = require("uuid");

const K3SocketClient = require("./K3SocketClient");

class K3Server{

    constructor()
    {
        this.app = express();
        this.http = http;
        this.server = this.http.createServer(this.app);
        this.io = new Server(this.server);

        this.clients = {}
        this.entities = {}
        this.callbacks = []

        this.ip = "";
        this.port = 3000;
        this.indexFile = "public/client/index.html";
        this.tickRate = 50;
        this.serverDelay = 0;
        
        this.app.use(express.static("public"));

        //WEB SERVER PART
        this.app.get("/", (_, res) => { res.sendFile(path.resolve(__dirname, `../${this.indexFile}`)) });

        this.server.listen(process.env.port || this.port, this.ip, () => {

            this.print(`Server started on ${this.ip}:${this.port} !`);

        });

        //MaterJS PART
        let ground = Bodies.rectangle(100, 750, 5000, 50, {isStatic: true})
        let wall1 = Bodies.rectangle(0, 0, 50, 5000, {isStatic: true})
        let wall2 = Bodies.rectangle(1000, 0, 50, 5000, {isStatic: true})

        this.engine = Engine.create();
        this.world = this.engine.world;
        this.engine.gravity = {x: 0, y: 1};
        World.add(this.world, [ground, wall1, wall2]);
        Runner.run(this.engine);

        //SOCKET.IO PART
        this.io.on("connection", (socket) => {

            let i = 0;
            let searchNick = true;

            //Search avaible uniqueId
            if(Object.keys(this.clients).length > 0)
            {
                while(searchNick)
                {
                    for(let e in this.clients)
                    {
                        let clientId = this.clients[e].uniqueId;
                        
                        if(clientId !== i)
                        {
                            this.print(`Avaible uniqueId found ! (${i})`)
                            searchNick = false;

                            break;
                        }
                        else
                        {
                            i++;
                        }
                    }
                }
            }

            let newClient = new K3SocketClient(socket, i)

            this.print(`${newClient.nickname} connected !`);
            this.clients[socket.id] = newClient
            
            for(let key in this.entities)
            {
                socket.emit("_send_entity", this.packEntity(this.entities[key]));
            }

            this.callbacks.forEach((callback) => {
                socket.on(callback.callbackName, (datas) => {
                    callback.callback(datas, socket);
                });
            });

            socket.on("disconnect", () => {

                let client = this.clients[socket.id]

                this.print(`${client.nickname} disconnected !`);
                this.call("clientDisconnected", client)
                
                delete this.clients[socket.id]

                this.io.emit("updateClientsCount", Object.keys(this.clients).length)

            });

            socket.on("_sendServer", (datas) => {
            
                let entity = this.entities[datas.entityId];
                let funcName = datas.funcName;
                let funcDatas = datas.funcDatas;
    
                entity.serverInstance[funcName](funcDatas);
    
            });

            this.call("clientConnected", newClient)
            this.io.emit("updateClientsCount", Object.keys(this.clients).length)

        });

        //Entities refreshing
        this.ticker = setInterval(() => {

            let startTime = performance.now();
            let copies = {};

            for(let key in this.entities)
            {
                let entity = this.entities[key];
                entity.serverInstance.tickServer();

                copies[key] = {
                    toUpdate: entity.serverInstance.replicated
                };
            }

            this.serverDelay = (performance.now() - startTime);

            this.io.emit("_update_server", {
                entities: copies,
                serverDelay: this.serverDelay
            });

        }, this.tickRate);

    }

    packEntity(entity)
    {
        return {
            id: entity.id,
            className: entity.className,
            replicated: entity.serverInstance.replicated
        }
    }
    createEntity(entity)
    {
        let id = uuidv4();
        let className = entity.constructor.name;

        let newEntity = {
            id: id,
            className: className,
            serverInstance: entity
        }

        this.entities[id] = newEntity;

        this.print(`Entity ${id} (${className}) created !`)
        this.io.emit("_send_entity", this.packEntity(newEntity))

        entity.getEntities = () => { return this.entities; }
        entity.getEngine = () => { return this.engine; }
        entity.getWorld = () => { return this.world; }
        entity.getIo = () => { return this.io; }

        entity.sendMulticast = (func, datas) => {

            this.io.emit("_sendMulticast", {
                entityId: newEntity.id,
                funcName: func.name,
                funcDatas: datas
            });

        };

        entity.initServer();

        return newEntity;
    }

    deleteEntity(entity)
    {
        let id = entity.id;
        let className = entity.className;

        delete this.entities[id];

        this.io.emit("_delete_entity", this.packEntity(entity));
        this.print(`Entity ${id} (${className}) deleted !`)
    }

    call(callbackName, datas)
    {
        this.callbacks.forEach((callback) => {
            
            if(callback.callbackName === callbackName)
            {
                callback.callback(datas);
            }

        })
    }

    on(callbackName, callback)
    {
        this.callbacks.push({
            callbackName: callbackName,
            callback: callback
        });
    }

    print(text)
    {
        console.log(`[K3 SERVER] ${text}`);
    }

}

module.exports = { K3Server }