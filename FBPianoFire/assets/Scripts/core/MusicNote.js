/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-07 20:50:04
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-07 23:09:07
 * @FilePath: \FBPianoFire\assets\Scripts\core\MusicNote.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import WRScript from "../base/WRScript";
import EnumUtils from "../utils/EnumUtils";

/**
 * @description 音乐块的节点
 */
cc.Class({
    extends: WRScript,

    properties: {
        status : 0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    setData()
    {
        this.status = EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE;
    },

    /**
     * @description 回收
     */
    restore()
    {},
    
});
