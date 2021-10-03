(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        this.sprite = PIXI.Sprite.from("client/sprites/0.jpg");
        this.pixi.stage.addChild(this.sprite);

        this.text = new PIXI.Text(this.replicated.nickname, {fontFamily : 'Arial', fontSize: 124, fill : 0x3d3fc, align : 'center'});
        this.sprite.addChild(this.text);

        this.sprite.scale.set(0.3, 0.3);

    }

    initServer()
    {

    }

    tickClient()
    {

        this.sprite.x += (this.replicated.positionX - this.sprite.x) / 5;
        this.sprite.y += (this.replicated.positionY - this.sprite.y) / 5;
        this.text.text = this.replicated.nickname;
    }

    tickServer()
    {

    }

    deleteClient()
    {
        this.pixi.stage.removeChild(this.sprite);
    }

}

if(typeof exports !== "undefined")
{
    module.exports = { Player }
}
},{}]},{},[1]);
