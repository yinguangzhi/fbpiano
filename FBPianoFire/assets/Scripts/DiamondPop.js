/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-06 00:12:51
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-29 23:28:56
 * @FilePath: \FBPianoFire\assets\Scripts\DiamondPop.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var Observer = require('./Observer');
var GameParamsHelper = require('./GameParamsHelper');
const UIUtils = require('./utils/UIUtils');
const FacebookUtils2 = require('./utils/FacebookUtils2');
const AudioUtils = require('./utils/AudioUtils');
const StorageUtils = require('./utils/StorageUtils');
const ConfigUtils = require('./utils/ConfigUtils');
const UIBase = require('./base/UIBase');
const GameData = require('./GameData');
const { SHOP_TYPE } = require('./utils/EnumUtils');
const EffectUtils = require('./utils/EffectUtils');
cc.Class({
    extends: UIBase,

    properties: {
        
        adNode: cc.Node,

        rewardCount : 5,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

        let temps = GameData.getBuyDataArrByType(SHOP_TYPE.DIAMOND);
        this.data = temps[0];
    },

    setData()
    {
        this.rewardCount = this.data.reward;
    },


    playAction()
    {
    },

    adAction()
    {
        if(!Observer.fireInterval("buy",500))
            return;

        FacebookUtils2.displayVideoFromExternal(true,(state) =>
        {
            if (state)
            {
                StorageUtils.saveItem(StorageUtils.USER_PROPERTY.diamond, this.data.reward);
                
                EffectUtils.displayDiamondFly(10, this.node, null, cc.v2(), 0, () =>
                {
                    Observer.fireMass(Observer.EVENT_NAME.REFRESH_DIAMOND);
                });

                // StorageUtils.saveItem(StorageUtils.USER_PROPERTY.diamond, this.rewardCount);
                // Observer.fireMass(Observer.EVENT_NAME.REFRESH_DIAMOND);

                // this.close2();
            }
        })
    },
});
