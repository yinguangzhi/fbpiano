/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2023-11-14 20:21:55
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-06 20:36:56
 * @FilePath: \Decompression\assets\script\AssetUrl.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const LoadUtils = require("../utils/LoadUtils");

cc.Class({
    extends: cc.Component,

    properties: {
        _url : "",
        url: {
            get: function () {
                return this._url;
            },
            set: function (value) {
                
                if(this._url == value) return;

                this.setURL(value);
            }
        },

        /**
         * @description 未加载完成前 是否不可见
         */
        hideBeforeLoaded : true,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    setSpriteNull()
    {
        let sp = this.node.getComponent(cc.Sprite);
        if(sp != null)
        {
            sp.spriteFrame = null;
        }
    },
    
    
    setURL(__url,callback)
    {
        if(!__url) return;
        if(this._url == __url) return;

        this._url = __url;
        
        let isImage = __url.indexOf("img/") != -1 || __url.indexOf("image/") || __url.indexOf("texture/");
        // let isAudio = __url.indexOf("audio/") != -1 || __url.indexOf("Audio/") || __url.indexOf("Music/") || __url.indexOf("music/");
        // let isPrefab = __url.indexOf("prefab/") || __url.indexOf("Prefab/") || __url.indexOf("prefabs/") || __url.indexOf("Prefabs/");

        if(isImage)
        {
            let sp = this.node.getComponent(cc.Sprite);
            if(sp == null)
            {
                console.log("sprite is not exist");
                return;
            }

            // if(this.hideBeforeLoaded) this.node.opacity = 0;
            this.loadSSDAsset(__url,cc.SpriteFrame,(asset) =>
            {
                if(asset && this && sp)
                {
                    sp.spriteFrame = asset;
                    // if(this.hideBeforeLoaded) this.node.opacity = 255;
                }

                callback && callback(asset);
            });
        }
        else
        {
            console.log("is not sprite");
        }
    },

    loadSSDAsset(url,type,callback)
    {
        LoadUtils.loadAssetAsync(url, type, null)
            .then((asset) => {
                callback && callback(asset);
            })
            .catch((error) => {
                callback && callback(null);
            });
        // cc.resources.load(url,type,(error,asset) =>
        // {
        //     if(error)
        //     {
        //         callback && callback(null);
        //     }
        //     else
        //     {
        //         callback && callback(asset);
        //     }
        // })
    },
});
