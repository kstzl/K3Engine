const { Bodies, World } = require("matter-js");

class Player {

    constructor(nick)
    {
        this.replicated = {};

        this.replicated.positionX = 0;
        this.replicated.positionY = 150;
        this.replicated.nickname = nick;
    }

    initClient()
    {
        this.sprite = PIXI.Sprite.from("client/sprites/raquette.png");
        this.pixi.stage.addChild(this.sprite);
        this.sprite.anchor.set(0.5);
        this.sprite.width = 100;
        this.sprite.height = 80;
        this.i = 0;

        this.text = new PIXI.Text(this.replicated.nickname, {fontFamily : 'Arial', fontSize: 32, fill : 0x3d3fc, align : 'center'});
        this.text.anchor.set(0.5);
        this.pixi.stage.addChild(this.text);

    }

    initServer()
    {
        this.box = Bodies.rectangle(this.replicated.positionX, this.replicated.positionY, 100, 80, {
            isStatic: true
        });
        World.add(this.getWorld(), this.box);
    }

    lerp(start, end, amt){
        return (1 - amt) * start + amt * end;
    }

    tickClient()
    {
        
        this.sprite.x += (this.replicated.positionX - this.sprite.x) / 10;
        this.sprite.y += (this.replicated.positionY - this.sprite.y) / 10;

        this.text.text = this.replicated.nickname;

        this.text.position = {
            x: this.sprite.x,
            y: this.sprite.y + 75,
        }

        this.text.style.fontSize = 25 + Math.sin(this.i) * 2.5;

        this.i+=0.05;
    }

    tickServer()
    {
        this.replicated.positionX = this.box.position.x;
        this.replicated.positionY = this.box.position.y;
    }

    deleteClient()
    {
        this.pixi.stage.removeChild(this.sprite);
        this.pixi.stage.removeChild(this.text);
    }

}

module.exports = { Player }