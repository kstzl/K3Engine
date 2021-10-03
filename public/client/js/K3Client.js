const { Player } = require("../../shared/Player");
const { Bullet } = require("../../shared/Bullet");

class K3Client{

    constructor()
    {

        this.entities = {};
        this.callbacks = [];

        this.serverDelay = 0;

        //SOCKET.IO PART
        this.socket = io();
        
        this.socket.on("connect", () => {

            this.print(`Connected with the socket id : ${this.socket.id}`);

        });

        this.socket.on("_send_entity", (entity) => {

            let id = entity.id;
            let className = entity.className;

            let clientInstance = eval(`new ${className}();`);

            clientInstance.pixi = this.app;

            this.entities[id] = {
                id: id,
                className: className,
                clientInstance: clientInstance
            };

            Object.assign(clientInstance.replicated, entity.replicated);

            this.print(`Entity ${id} (${className}) added !`)

            clientInstance.sendServer = (func, datas) => {

                this.socket.emit("_sendServer", {
                    entityId: id,
                    funcName: func.name,
                    funcDatas: datas
                });
    
            };

            clientInstance.initClient();

            this.call("updateEntitiesCount", Object.keys(this.entities).length);

        });

        this.socket.on("_update_server", (datas) => {

            let entities = datas.entities;
            this.serverDelay = datas.serverDelay;

            for(let key in entities)
            {

                if(this.entities[key] === undefined)
                {
                    delete this.entities[key];
                    this.print(`'${entities[key].id}' (${entities[key].className}) is invalid !`);
                }
                else
                {
                    let toUpdate = entities[key].toUpdate;
                    let clientInstance = this.entities[key].clientInstance;

                    Object.assign(clientInstance.replicated, toUpdate);
                }

            }

        });

        this.socket.on("_delete_entity", (datas) => {

            let entity = this.entities[datas.id];

            let id = entity.id;
            let className = entity.className;

            entity.clientInstance.deleteClient();
            this.print(`Entity ${id} (${className}) removed !`)

            delete this.entities[datas.id];
            this.call("updateEntitiesCount", Object.keys(this.entities).length);

        });

        this.socket.on("_sendMulticast", (datas) => {
            
            let entity = this.entities[datas.entityId];
            let funcName = datas.funcName;
            let funcDatas = datas.funcDatas;

            entity.clientInstance[funcName](funcDatas);

        });

        //PIXI PART
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });

        window.addEventListener("DOMContentLoaded", () => {
            document.body.appendChild(this.app.view);
            this.print("App view added");
            this.call("ready", "yeah")
        });

        window.addEventListener("resize", () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            this.call("resize", { width: window.innerWidth, height: window.innerHeight });
        });

        window.addEventListener("keydown", (e) => {
            this.call("keydown", e);
        });

        this.elapsed = 0.0;

        this.app.ticker.add((delta) => {

            this.elapsed += delta;

            for(let key in this.entities)
            {
                let entity = this.entities[key];

                entity.clientInstance.tickClient();
            }

            this.call("update", this.elapsed);
        });
        

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

        this.socket.on(callbackName, (datas) => {
            callback(datas);
        });
    }

    print(text)
    {
        console.log(`[K3 CLIENT] ${text}`);
    }
}

module.exports = { K3Client };