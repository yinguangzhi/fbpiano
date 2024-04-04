/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-17 00:41:10
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-29 23:29:14
 * @FilePath: \FBPianoFire\assets\Scripts\HomeBottom.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const Observer = require("./Observer");
const AudioUtils = require("./utils/AudioUtils");
const UIUtils = require("./utils/UIUtils");

cc.Class({
    extends: cc.Component,

    properties: {
        toggles : [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.setToggleState(1);
    },

    // update (dt) {},
    settingAction()
    {
        if (!Observer.fireInterval("prop", 400)) return;

        this.hideShop();
        this.hideMusic();

        this.setToggleState(2);
        UIUtils.displayUI("UISetting", UIUtils.getRootParent(), true,true, null)
    },

    musicAction()
    {
        if (!Observer.fireInterval("prop", 400)) return;

        this.hideShop();
        this.hideSetting();

        this.setToggleState(1);
        UIUtils.displayUI("MusicPage",  UIUtils.getRootParent(), true, true, null);
    },

    shopAction()
    {
        if (!Observer.fireInterval("prop", 400)) return;

        this.hideSetting();
        this.hideMusic();

        this.setToggleState(0);
        UIUtils.displayUI("UIShop",  UIUtils.getRootParent(), true, true, null);
    },

    hideShop()
    {
        let shop = UIUtils.getUI("UIShop");
        if (cc.isValid(shop)) shop.active = false;
    },
    
    hideSetting()
    {
        let setting = UIUtils.getUI("UISetting");
        if (cc.isValid(setting)) setting.active = false; 
    },

    hideMusic()
    {
        let music = UIUtils.getUI("MusicPage");
        if (cc.isValid(music)) music.active = false; 
    },

    setToggleState(_idx)
    {
        for (let i = 0; i < this.toggles.length; i++)
        {
            let toggle = this.toggles[i];
            toggle.children[0].active = i != _idx;
            toggle.children[1].active = i == _idx;
        }
    }
});
