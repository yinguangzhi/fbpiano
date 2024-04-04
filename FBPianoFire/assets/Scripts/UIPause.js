/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-06 00:12:51
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-29 23:31:09
 * @FilePath: \FBPianoFire\assets\Scripts\UIPause.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


const Observer = require("./Observer");
const GameParamsHelper = require("./GameParamsHelper");
const UIUtils = require("./utils/UIUtils");
const UIBase = require("./base/UIBase");
const FacebookUtils = require("./utils/FacebookUtils");
const AudioUtils = require("./utils/AudioUtils");
const StorageUtils = require("./utils/StorageUtils");

cc.Class({
    extends: UIBase,

    properties: {
        audioNode: cc.Node,
        musicNode: cc.Node,
        vibrateNode: cc.Node,
    },


    start() {
        this.setAudioState(StorageUtils.getItem(StorageUtils.USER_PROPERTY.audio) == 1);
        // this.setMusicState(StorageUtils.getItem(StorageUtils.USER_PROPERTY.music) == 1);
        this.setShakeState(StorageUtils.getItem(StorageUtils.USER_PROPERTY.vibrate) == 1);
    },

    inviteAction() {

        if (!Observer.fireInterval("prop", 600)) return;

        UIUtils.displayMask(true);
        AudioUtils.playMute();
        FacebookUtils.inviteFriend("image/share", (bool) => {

            UIUtils.displayMask(false);
        })
    },

    audioAction() {

        let state = StorageUtils.getItem(StorageUtils.USER_PROPERTY.audio);
        state = state == 1 ? 0 : 1;
        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.audio, state);

        this.setAudioState(state == 1);

        AudioUtils.setAudioState(state == 1);
    },

    setAudioState(bool) {
        this.audioNode.children[0].active = !bool;
        this.audioNode.children[1].active = bool;
    },

    musicAction() {

        let state = StorageUtils.getItem(StorageUtils.USER_PROPERTY.music);
        state = state == 1 ? 0 : 1;
        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.music, state);

        this.setMusicState(state == 1);

        GameParamsHelper.autoPlay = state == 1;
        AudioUtils.setMusicState(state == 1, true);
    },

    setMusicState(bool) {
        this.musicNode.children[0].active = !bool;
        this.musicNode.children[1].active = bool;
    },
    shakeAction() {

        let state = StorageUtils.getItem(StorageUtils.USER_PROPERTY.vibrate);
        state = state == 1 ? 0 : 1;

        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.vibrate,state);

        GameParamsHelper.shake = state == 1;
        this.setShakeState(state == 1);
    },

    setShakeState(bool) {
        
        this.vibrateNode.children[0].active = !bool;
        this.vibrateNode.children[1].active = bool;
    },

    exitAction() {
        if (!Observer.fireInterval("prop", 500)) return;
        this.close2();
    },
});
