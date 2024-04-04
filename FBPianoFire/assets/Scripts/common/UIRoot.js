/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-16 13:32:28
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-22 22:42:28
 * @FilePath: \FBPianoFire\assets\Scripts\common\UIRoot.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const WRScript = require("../base/WRScript");
const UIUtils = require("../utils/UIUtils");
cc.Class({
    extends: WRScript,

    properties: {
        delayTime : 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        UIUtils.addRoot(this);
    },

    start () {
        this.checkScenePage();
    },

    checkScenePage()
    {
        
        this.scheduleOnce(() =>
        {
            let scene = UIUtils.getUI("ScenePage");
            if (scene) scene.getComponent("ScenePage").realComplete(false);
        },this.delayTime)
    }
    // update (dt) {},
});
