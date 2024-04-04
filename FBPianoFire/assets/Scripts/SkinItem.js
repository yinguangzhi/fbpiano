/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-31 00:05:13
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-04-01 00:13:31
 * @FilePath: \FBPianoFire\assets\Scripts\SkinItem.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const Observer = require("./Observer");
const WRRender = require("./common/WRRender");
cc.Class({
    extends: WRRender,

    properties: {
        selectNode : cc.Node,
        useTipNode : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Observer.registerMass(Observer.EVENT_NAME.USE_SKIN_IN_SHOP, this.setUse, this);
        Observer.registerMass(Observer.EVENT_NAME.SELECT_SKIN_IN_SHOP, this.select, this);
    },

    start () {
    },

    // update (dt) {},


    setData()
    {
        this.selectNode.active = false;
    },

    click()
    {
        Observer.fire(Observer.EVENT_NAME.DISPLAY_SKIN_IN_SHOP, this.data.id);
        Observer.fireMass(Observer.EVENT_NAME.SELECT_SKIN_IN_SHOP, this.data.id);
    },

    select(_id)
    {
        if (!this.isValid()) return;
        if (this.isEmpty(this.data)) return;
        
        this.selectNode.active = _id == this.data.id;
    },

    setUse(_id)
    {
        if (!this.isValid()) return;
        if (this.isEmpty(this.data)) return;
        
        console.log(this.data);
        this.useTipNode.active = _id == this.data.id;
    }
});
