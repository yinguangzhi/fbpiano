// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const GameData = require("./GameData");
const GameParamsHelper = require("./GameParamsHelper");
const Observer = require("./Observer");
const UIBase = require("./base/UIBase");
const FacebookUtils2 = require("./utils/FacebookUtils2");

cc.Class({
    extends: UIBase,

    properties: {
        callback: null,

        progressForce: cc.Sprite,

        coolDownLabel: cc.Label,

        adNode: cc.Node,

        timeDelta: 0,
        duration : 0,
        
        isCounting : false,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad() {
    //     this._super();
    // },

    start() {
        this.isCounting = true;
        this.adNode.scale = 0;
        this.adNode.opacity = 255;
        this.adNode.width = GameData.musicLayoutConfig.baseWidth;
        this.adNode.height = GameData.musicLayoutConfig.baseHeight;
        
        cc.tween(this.adNode)
            .to(0.2, { scale: 1 })
            .call(() =>
            {
                this.adNode.scale = 1;
            })
            .start();
        
        this.progressForce.fillRange = 1;

        this.duration = 0;
        this.timeDelta = 0;
        this.totalTime = 5;
        if (this.coolDownLabel) this.coolDownLabel.string = this.totalTime;
    },

    update(dt) {
        
        if (!this.isCounting) return;

        this.duration += dt;
        this.progressForce.fillRange = 1 - this.duration / 5;
        if (this.progressForce.fillRange < 0) this.progressForce.fillRange = 0;

        this.timeDelta += dt;
        if (this.timeDelta <= 1) return;

        this.timeDelta = 0;

        this.totalTime--;
        if (this.coolDownLabel) this.coolDownLabel.string = this.totalTime;

        if (this.totalTime == 0) {
            this.hide(true);
        }
    },

    setData() {

        this.callback = this.data.call;
        let xIndex = this.data.xIndex;

        this.adNode.position = cc.v2(GameData.getXPosByIndex(xIndex), GameData.getBaseMusicY());
    },

    onDisplay()
    {
        this.isCounting = true;
    },

    adAction() {
        
        if (!this.isValid())
        {
            return;    
        }

        if (!Observer.fireInterval("relive", 500)) return;

        this.isCounting = false;

        FacebookUtils2.displayVideoFromExternal(true, (state) => {
            
            if (state) {
                    

                this.callback && this.callback(true);
                
                this.hide(false);
                
            }
            else this.isCounting = true;
        })
        
    },

    hide(containEvent)
    {
        if (!this.isValid())
        {
            return;    
        }
        
        
        if(containEvent) this.callback && this.callback(false);
        
        this.close2();
    }

});
