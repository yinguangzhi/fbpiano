// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const WRScript = require('./base/WRScript');

cc.Class({
    extends: WRScript,

    properties: {
        sprite : cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setData()
    {
        if (this.data.frame) this.sprite.spriteFrame = this.data.frame;
        
        this.sprite.node.width = this.data.width;
        this.sprite.node.height = this.data.height;
        
        this.position = cc.v2(0, this.data.y);
        
    },

    restore()
    {

    },
});
