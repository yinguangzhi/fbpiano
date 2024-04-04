/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-28 22:03:12
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-04-02 00:03:19
 * @FilePath: \FBPianoFire\assets\Scripts\Permanenter.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

cc.macro.CLEANUP_IMAGE_CACHE = false;
cc.dynamicAtlasManager.enabled = true;
cc.dynamicAtlasManager.maxFrameSize = 1024;

const AudioUtils = require("./utils/AudioUtils");
const LoadUtils = require("./utils/LoadUtils");
const ProtoUtils = require("./utils/ProtoUtils");
const UIUtils = require("./utils/UIUtils");

cc.Class({
    extends: cc.Component,

    properties: {

        prefab: cc.Prefab,
        scenePage : null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.addPersistRootNode(this.node);

        UIUtils.addPermanents(this);
        UIUtils.displayUI("ScenePage", this.node, true,true, null);     
    },

    start() {
        this.node.x = (cc.winSize.width) * 0.5;
        this.node.y = (cc.winSize.height) * 0.5;

        this.node.width = cc.winSize.width + 2;
        this.node.height = cc.winSize.height + 2;

        ProtoUtils.addButton();
        ProtoUtils.addLabel();
        ProtoUtils.addSprite();
        // cc.Node.prototype['label'] = function ()
        // {
        //     if (this.__label == null)
        //     {
        //         this.__label = this.getComponent(cc.Label);    
        //     }
            
        //     return this.__label;
        // }
        
    },

    
    // update (dt) {},
});
