/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2023-08-13 11:14:47
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-31 22:53:33
 * @FilePath: \Solitaire\assets\scripts\Observer.js
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


    

module.exports =
{
    EVENT_NAME :
    {
        /**
         * @description 刷新歌曲进度
         */
        REFRESH_GAME_PROGRESS: "REFRESH_GAME_PROGRESS",
        
        /**
         * @description 重置游戏进度
         */
        RESET_GAME_PROGRESS: "RESET_GAME_PROGRESS",      
        
        /**
         * @description 加分
         */
        ADD_GAME_SCORE: "ADD_GAME_SCORE", 

        /**
         * @description 设置游戏分数
         */
        SET_GAME_SCORE: "SET_GAME_SCORE",
        
        
        /**
         * @description 游戏过程中更换bpm
         */
        RE_CHANGE_BPM: "RE_CHANGE_BPM",        

        /**
         * @description 游戏开始
         */
        GAME_BEGIN: "GAME_BEGIN",

        
        /**
         * @description 生成新的音乐块
         */
        GENERATE_NEW_MUSIC_NOTE: "GENERATE_NEW_MUSIC_NOTE",
        
        /**
         * @description 复活
         */
        RESURRECT: "RESURRECT",
        
        
        /**
         * @description 准备开始游戏
         */
        PREPARE_GAME: "PREPARE_GAME",

        /**
         * @description 清除游戏缓存
         */
        CLEAR_GAME_CACHE: "CLEAR_GAME_CACHE",

        /**
         * @description 刷新金币
         */
        REFRESH_COIN: "REFRESH_COIN",
        
        /**
         * @description 刷新钻石
         */
        REFRESH_DIAMOND: "REFRESH_DIAMOND",
        /**
         * @description 刷新星星
         */
        REFRESH_STAR: "REFRESH_STAR",

        
        /**
         * @description 音乐块被点击后的 good or perfect
         */
        GOOD_OR_PERFECT: "GOOD_OR_PERFECT",
        
        /**
         * @description 音乐块被点击后的特效
         */
        DISPLAY_MUSIC_NOTE_EFFECT: "DISPLAY_MUSIC_NOTE_EFFECT",
        

        /**
         * @description 音乐块被点击后的反馈
         */
        TOUCH_MUSIC_NOTE_FEEDBACK: "TOUCH_MUSIC_NOTE_FEEDBACK",
        
        
        /**
         * @description 设置阶段ui的状态
         */
        SET_MERGE_STAGE_UI: "SET_MERGE_STAGE_UI",
        
        /**
         * @description 展示合成的弹框提示
         */
        DISPLAY_COMBINE_EFFECT_TIP: "DISPLAY_COMBINE_EFFECT_TIP",
        

        /**
         * @description 生成游戏
         */
        GENERATE_GAME: "GENERATE_GAME",
        
        
        /**
         * @description 进入游戏主页
         */
        ENTER_HOME_PAGE: "ENTER_HOME_PAGE",
        
        
        /**
         * @description 重新开始游戏
         */
        AGAIN_GAME: "AGAIN_GAME",

        
        /**
         * @description 选择皮肤框
         */
        SELECT_SKIN_IN_SHOP: "SELECT_SKIN_IN_SHOP",
        
        
        /**
         * @description 使用皮肤
         */
        USE_SKIN_IN_SHOP: "USE_SKIN_IN_SHOP",

        
        /**
         * @description 展示选中的皮肤
         */
        DISPLAY_SKIN_IN_SHOP: "DISPLAY_SKIN_IN_SHOP",

    },
    
    /** 回调函数 */
    massListeners : [],
    listeners: [],
    eventListeners: [],
    lastFireTime: 0,

    register(funcStr, func, attach) {
        this.listeners[funcStr] = { func: func, attach: attach };
    },

    fire(funcStr, params, params1, ...paramsn) {
        let _data = this.listeners[funcStr];

        if (!_data || !_data.func || !cc.isValid(_data.attach))
            return;


        let _length = arguments.length;
        if (_length == 1) _data.func.call(_data.attach);
        else if (_length == 2) _data.func.call(_data.attach, arguments[1]);
        else if (_length == 3) _data.func.call(_data.attach, arguments[1], arguments[2]);
        else if (_length == 4) _data.func.call(_data.attach, arguments[1], arguments[2], arguments[3]);
        else if (_length == 5) _data.func.call(_data.attach, arguments[1], arguments[2], arguments[3], arguments[4]);
        else if (_length == 6) _data.func.call(_data.attach, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
    },

    fireInterval(eventName, deltaTime, toAll) {
        let ret = false;
        let now = new Date();
        let _time = this.eventListeners[eventName];
        if (this.isEmpty(_time)) {
            this.eventListeners[eventName] = now.getTime();
            ret = true;
        }
        else {
            ret = (now.getTime() - _time) > deltaTime;
            if (ret) this.eventListeners[eventName] = now.getTime();
        }


        return ret;
    },

    clearMass()
    {
        this.massListeners = {};
    },
    
    registerMass(funcStr, func,attach)
    {
        if (!this.massListeners[funcStr]) this.massListeners[funcStr] = [];

        let arg = this.massListeners[funcStr].find(element => element.attach == attach);
        if(!arg) this.massListeners[funcStr].push({func : func,attach : attach});
    },

    removeMass(funcStr)
    {
        if (!this.massListeners[funcStr]) return;
        this.massListeners[funcStr] = null;
    },

    removeMassChild(funcStr, attach)
    {
        if (!this.massListeners[funcStr]) return;
        if (this.massListeners[funcStr].length == 0) return;

        let arg = this.massListeners[funcStr].find(element => element.attach == attach);
        if (!arg) return;

        let idx = this.massListeners[funcStr].indexOf(arg);
        this.massListeners[funcStr].splice(idx, 1);
        // console.log("success remove mass : " + funcStr + " : " + this.massListeners[funcStr].length);
    },
    
    fireMass(funcStr,params, params1, ...paramsn)
    {
        if (!this.massListeners[funcStr]) return;
        if (this.massListeners[funcStr].length == 0) return;

        let _length = arguments.length;
        
        let arr = this.massListeners[funcStr];
        for (let i = 0; i < arr.length; i++)
        {
            let _data = arr[i];
            if (cc.isValid(_data) && cc.isValid(_data.attach) && cc.isValid(_data.func))
            {
                if (_length == 1) _data.func.call(_data.attach);
                else if (_length == 2) _data.func.call(_data.attach, arguments[1]);
                else if (_length == 3) _data.func.call(_data.attach, arguments[1], arguments[2]);
                else if (_length == 4) _data.func.call(_data.attach, arguments[1], arguments[2], arguments[3]);
                else if (_length == 5) _data.func.call(_data.attach, arguments[1], arguments[2], arguments[3], arguments[4]);
                else if (_length == 6) _data.func.call(_data.attach, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                
                // obj.func.call(obj.attach,track);
            }
            
                
        }
    },
    
    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}
