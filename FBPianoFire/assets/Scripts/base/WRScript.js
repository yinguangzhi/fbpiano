/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-01-30 19:40:22
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-31 22:41:01
 * @FilePath: \Block\assets\script\SSDScript.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        __data : null,
        data: {
            get: function ()
            {
                return this.__data;
            },
            set: function (value)
            {
                this.__data = value;
                if(this.__data != null)
                {
                    this.setData();
                }
            },
            visible : false,
        },

        __endCall : null,
        endCall: {
            get: function ()
            {
                return this.__endCall;
            },
            set: function (value)
            {
                this.__endCall = value;
            },
            visible : false,
        },

        position : {
            get: function ()
            {
                return this.node.position;
            },
            set: function (value)
            {
                this.node.position = value;
            },
            visible : false,
        },

        scale : {
            get: function ()
            {
                return this.node.scale;
            },
            set: function (value)
            {
                this.node.scale = value;
            },
            visible : false,
        },

        angle : {
            get: function ()
            {
                return this.node.angle;
            },
            set: function (value)
            {
                this.node.angle = value;
            },
            visible : false,
        },

        width : {
            get: function ()
            {
                return this.node.width;
            },
            set: function (value)
            {
                this.node.width = value;
            },
            visible : false,
        },

        height : {
            get: function ()
            {
                return this.node.height;
            },
            set: function (value)
            {
                this.node.height = value;
            },
            visible : false,
        },

        x : {
            get: function ()
            {
                return this.node.x;
            },
            set: function (value)
            {
                this.node.x = value;
            },
            visible : false,
        },

        y : {
            get: function ()
            {
                return this.node.y;
            },
            set: function (value)
            {
                this.node.y = value;
            },
            visible : false,
        },

        active : {
            get: function ()
            {
                return this.node.active;
            },
            set: function (value)
            {
                this.node.active = value;
            },
            visible : false,
        },

        parent : {
            get: function ()
            {
                return this.node.parent;
            },
            set: function (value)
            {
                this.node.parent = value;
            },
            visible : false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},
    setData()
    { 
    },

    /**
     * @description 展示动画
     */
    displayAnima()
    {
        
    },

    getComponent(className)
    {
        return this.node.getComponent(className)
    },

    isValid()
    {
        return cc.isValid(this) && cc.isValid(this.node);
    },

    isEmpty(obj)
    {
        return obj === '' || obj === null || obj === undefined; 
    }
});
