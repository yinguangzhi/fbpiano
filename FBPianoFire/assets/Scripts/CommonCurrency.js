/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-16 10:56:27
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-29 23:28:46
 * @FilePath: \FBPianoFire\assets\Scripts\CommonCurrency.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Observer = require("./Observer");
const AudioUtils = require("./utils/AudioUtils");
const EffectUtils = require("./utils/EffectUtils");
const StorageUtils = require("./utils/StorageUtils");
const WRScript = require("./base/WRScript");
const EnumUtils = require("./utils/EnumUtils");
const UIUtils = require("./utils/UIUtils");
const ConsoleUtils = require("./utils/ConsoleUtils");

cc.Class({
    extends: WRScript,

    properties: {
        setCollect: false,
        collectNode : cc.Node,
        valueLabel: cc.Label,
        
        currencyType : {
            default: 0,
            type : cc.Enum(EnumUtils.CURRENCY_TYPE),
        },
        eventName:
        {
            default: "",
            visible : false,
        }
    },


    start() {
        
        if (this.currencyType == EnumUtils.CURRENCY_TYPE.COIN)
        {
            if (this.setCollect) EffectUtils.setCoinNode(this);
            this.eventName = Observer.EVENT_NAME.REFRESH_COIN;
        }
        else if (this.currencyType == EnumUtils.CURRENCY_TYPE.STAR)
        {
            if (this.setCollect) EffectUtils.setStarNode(this);
            this.eventName = Observer.EVENT_NAME.REFRESH_STAR;
        }
        else if (this.currencyType == EnumUtils.CURRENCY_TYPE.DIAMOND)
        {
            if (this.setCollect) EffectUtils.setDiamondNode(this);
            this.eventName = Observer.EVENT_NAME.REFRESH_DIAMOND;
        }
        
        Observer.registerMass(this.eventName, this.refreshCurrency, this);
        
        this.refreshCurrency();
    },

    onDestroy()
    {
        Observer.removeMassChild(this.eventName, this);
    },
    // update (dt) {},

    refreshCurrency()
    {
        let cnt = 0;
        if (this.currencyType == EnumUtils.CURRENCY_TYPE.COIN)
        {
            cnt = StorageUtils.getItem(StorageUtils.USER_PROPERTY.coin, 0);
        }
        else if (this.currencyType == EnumUtils.CURRENCY_TYPE.STAR)
        {
            cnt = StorageUtils.getTotalStar();
        }
        else if (this.currencyType == EnumUtils.CURRENCY_TYPE.DIAMOND)
        {
            cnt = StorageUtils.getItem(StorageUtils.USER_PROPERTY.diamond, 0);
        }

        this.valueLabel.string = cnt; 
        ConsoleUtils.log(StorageUtils.getTotalStar());
    },


    displayAnima()
    {
        if (!this.collectNode) return;

        this.collectNode.stopAllActions();
        this.collectNode.scale = 1;
        cc.tween(this.collectNode)
            .to(0.12, { scale: 1.2 })
            .to(0.09, { scale: 1 })
            .start();
    },

    getIconNode()
    {
        return this.collectNode;
    },

    addAction()
    {
        let _name = "CoinPop";
        if (this.currencyType == EnumUtils.CURRENCY_TYPE.DIAMOND)
        {
            _name = "DiamondPop";
        }

        UIUtils.displayUI(_name, null, true, true, null);
    }
});
