const { Bodies, World, Events, Body } = require("matter-js");

class Bullet {

    constructor(x, y)
    {

        this.replicated = {};
        
        this.replicated.positionX = x;
        this.replicated.positionY = y;
        this.replicated.rotation = 0;
        this.replicated.vely = -35;
    }

    initClient()
    {
        this.sprite = PIXI.Sprite.from("client/sprites/pingpong.png");
        this.sprite.anchor.set(0.5);
        this.pixi.stage.addChild(this.sprite);
        this.sprite.width = 25;
        this.sprite.height = 25;

        this.sprite.x = this.replicated.positionX;
        this.sprite.y = this.replicated.positionY;

        this.sound = new Howl({
            src: ["client/audio/pingpong.mp3"]
        });

    }

    getRandomArbitrary(min, max){
        return Math.random() * (max - min) + min;
    }

    testMulticast(text)
    {
        this.sound.rate(this.getRandomArbitrary(1, 1.25));
        this.sound.volume(0.1);
        this.sound.play();
    }

    initServer()
    {
        this.box = Bodies.circle(this.replicated.positionX, this.replicated.positionY, 25/2);
        this.box.restitution = 1
        this.box._parent = this;

        World.add(this.getWorld(), this.box);

        Events.on(this.getEngine(), "collisionStart", (e) => {
            
            let pairs = e.pairs[0];

            if(pairs.bodyB == this.box)
            {
                let bod = pairs.bodyB;
                let self = pairs.bodyB._parent;

                Body.setVelocity(this.box, {x: 0, y: -15});

                this.sendMulticast(self.testMulticast, this.box.inertia); 
            }

        });
        
    }

    tickClient()
    {
        this.sprite.x += (this.replicated.positionX - this.sprite.x) / 5;
        this.sprite.y += (this.replicated.positionY - this.sprite.y) / 5;
        this.sprite.rotation += (this.replicated.rotation - this.sprite.rotation) / 5;
    }

    tickServer()
    {
        this.replicated.positionX = this.box.position.x;
        this.replicated.positionY = this.box.position.y;
        this.replicated.rotation = this.box.angle;
    }

    deleteClient()
    {
        this.pixi.stage.removeChild(this.sprite);
    }

}

module.exports = { Bullet }