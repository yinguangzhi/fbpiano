/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2023-09-05 23:30:06
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2023-09-05 23:30:44
 * @FilePath: \Block\assets\script\AspectCanvas.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        size: null,
        designSize: null,
        staticRate: 1,
        rate: 1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.size = cc.view.getFrameSize();
        this.rate = this.size.height / this.size.width;

        this.designSize = cc.view.getDesignResolutionSize();
        this.staticRate = this.designSize.height / this.designSize.width;

        if (this.rate < this.staticRate) this.node.getComponent(cc.Canvas).fitHeight = true;
        else this.node.getComponent(cc.Canvas).fitHeight = false;
    },
});
