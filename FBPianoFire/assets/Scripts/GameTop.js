/*
 * @Author: shaoshude 2797275476@qq.com
 * @Date: 2022-09-23 22:08:10
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-23 23:00:48
 * @FilePath: \ADPiano5\assets\Scripts\GameProgress.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const GameParamsHelper = require("./GameParamsHelper");
const Observer = require("./Observer");
const ConsoleUtils = require("./utils/ConsoleUtils");

cc.Class({
    extends: cc.Component,

    properties: {

        progressNode : cc.Node,
        progressTop : cc.Node,

        totalWidth : 675,
        progress: 0,
        lastProgress : 0,
        stars: [cc.Node],

        scoreLabel: cc.Label,

        effect : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.totalWidth = 644;
        Observer.register(Observer.EVENT_NAME.REFRESH_GAME_PROGRESS, this.setProgress, this);
        Observer.register(Observer.EVENT_NAME.RESET_GAME_PROGRESS, this.resetDate, this);
        Observer.register(Observer.EVENT_NAME.ADD_GAME_SCORE, this.addGameScore, this);
        Observer.register(Observer.EVENT_NAME.SET_GAME_SCORE, this.setGameScore, this);
    },

    start () {

    },

    // update (dt) {},

    resetDate(state)
    {
        this.progress = 0;
        this.lastProgress = 0;
        for (let i = 0; i < this.stars.length; i++)
        {
            this.setStarState(i, false);  
        }
        

        this.setProgress(0)
    },

    setProgress(value)
    {
        this.progress = value;

        if(this.progress > 1) this.progress = 1;

        this.progressTop.width = this.progress * this.totalWidth;
        this.effect.x = this.progressTop.x + this.progressTop.width;

        if (this.progress >= 0.33 && this.lastProgress < 0.33)
        {
            this.setStarState(0, true);  
            // Observer.fire("moveBg", 1);
        }
        
        if (this.progress >= 0.66 && this.lastProgress < 0.66)
        {
            this.setStarState(1, true);   
            // Observer.fire("moveBg", 2);
        }
        if (this.progress >= 1 && this.lastProgress < 1)
        {
            this.setStarState(2, true);  
        }
        
        this.lastProgress = this.progress;
    },

    setStarState(idx, state)
    {
        ConsoleUtils.log("game progress :", idx);
        
        if(!state)
            this.stars[idx].children[1].opacity = 0;   
        else
        {
            GameParamsHelper.star = idx + 1;

            this.stars[idx].children[1].opacity = 90;
            this.stars[idx].children[1].scale = 3.2;
            cc.tween(this.stars[idx].children[1])
                .to(0.16, { scale: 0.88 ,opacity : 255})
                .to(0.09, { scale: 1 })
                .start();
        }
    },

    setGameScore()
    {
        if(GameParamsHelper.score <= 0)this.scoreLabel.string = "";
        else this.scoreLabel.string = GameParamsHelper.score;
    },

    addGameScore(_value)
    {
        if(_value == 0) return;
        GameParamsHelper.score += _value;
        
        this.setGameScore();

        cc.tween(this.scoreLabel.node)
            .to(0.03,{scale : 1.3})
            .to(0.1, { scale: 1 })
            .start();
    }
});
