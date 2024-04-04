/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-20 21:00:15
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-29 23:28:32
 * @FilePath: \FBPianoFire\assets\Scripts\BuyItem.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const Observer = require('./Observer');
const WRScript = require('./base/WRScript');
const AudioUtils = require('./utils/AudioUtils');
const EffectUtils = require('./utils/EffectUtils');
const { CURRENCY_BUY_TYPE } = require('./utils/EnumUtils');
const FacebookUtils2 = require('./utils/FacebookUtils2');
const FunUtils = require('./utils/FunUtils');
const StorageUtils = require('./utils/StorageUtils');
const UIUtils = require('./utils/UIUtils');

cc.Class({
    extends: WRScript,

    properties: {
        rewardLabel: cc.Label,

        icon: cc.Sprite,
        
        priceNode : cc.Node,
        priceLabel: cc.Label,

        freeNode : cc.Node,
        adNode : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    setData()
    {
        let cg = this.data;

        this.rewardLabel.string = "x" + cg.reward;

        this.priceLabel.string = "x" + cg.price;
        this.priceNode.active = cg.currencyType == CURRENCY_BUY_TYPE.COIN || cg.currencyType == CURRENCY_BUY_TYPE.DIAMOND;
        
        this.freeNode.active = cg.currencyType == CURRENCY_BUY_TYPE.FREE;
        if (this.freeNode.active)
        {
            this.refreshFreeBtn();
        }
        
        this.adNode.active = cg.currencyType == CURRENCY_BUY_TYPE.AD;

        this.icon.spriteFrame = this.data.frame;
    },

    refreshFreeBtn()
    {
            let freed = StorageUtils.getItem(StorageUtils.USER_PROPERTY.freeRewardTime, "") == FunUtils.getTodayString();
            this.freeNode.getComponent(cc.Button).interactable = !freed;
            this.freeNode.opacity = freed ? 180 : 255;
    },
    
    adAction()
    { 
        if(!Observer.fireInterval("buy",500))
            return;

        FacebookUtils2.displayVideoFromExternal(true, (state) =>
        {
            if (state)
            {
                this.realReward();
            }
        })
    },
    
    freeAction()
    {
        if(!Observer.fireInterval("buy",500))
            return;

        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.freeRewardTime, FunUtils.getTodayString());
        this.refreshFreeBtn();
        
        this.realReward();
    },

    diamondAction()
    {
        if(!Observer.fireInterval("buy",500))
            return;

        let diamond = StorageUtils.getItem(StorageUtils.USER_PROPERTY.diamond, 0);
        if (this.data.price > diamond)
        {
            UIUtils.hideUI("CoinPop");
            UIUtils.displayUI("DiamondPop", null, true, true, null);   
            return;            
        }
        
        this.realReward();
    },

    realReward()
    {
        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.diamond, -this.data.price, true);
        Observer.fireMass(Observer.EVENT_NAME.REFRESH_DIAMOND);
        
        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.coin, this.data.reward);
        
        EffectUtils.displayCoinFly(10, this.rewardLabel.node, null, cc.v2(), 0, () =>
        {
            Observer.fireMass(Observer.EVENT_NAME.REFRESH_COIN);
        });

        // this.close2();
    }
});
