
var Observer = require('./Observer');
var GameParamsHelper = require('./GameParamsHelper');
const UIUtils = require('./utils/UIUtils');
const FacebookUtils2 = require('./utils/FacebookUtils2');
const AudioUtils = require('./utils/AudioUtils');
const StorageUtils = require('./utils/StorageUtils');
const ConfigUtils = require('./utils/ConfigUtils');
const UIBase = require('./base/UIBase');
const GameData = require('./GameData');
const { SHOP_TYPE, CURRENCY_TYPE, CURRENCY_BUY_TYPE } = require('./utils/EnumUtils');
const ConsoleUtils = require('./utils/ConsoleUtils');

cc.Class({
    extends: UIBase,

    properties: {
        item: cc.Node,
        layout: cc.Node,
        frames : [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.item.active = false;
        this.data = GameData.getBuyDataArrByType(SHOP_TYPE.COIN);
    },

    // update (dt) {},

    setData()
    {
        for (let i = 0; i < this.data.length; i++)
        {
            let note = cc.instantiate(this.item);
            note.parent = this.layout;
            note.active = true;

            let _idx = i;
            if (i >= this.frames.length) _idx = this.frames.length - 1;

            this.data[i].frame = this.frames[_idx];
            note.getComponent("WRScript").data = this.data[i];

            
        }
        
    },
});
