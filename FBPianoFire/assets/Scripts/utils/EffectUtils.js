/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-16 10:51:56
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-25 20:26:53
 * @FilePath: \FBPianoFire\assets\Scripts\utils\EffectUtils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const FunUtils = require("./FunUtils");
const PoolUtil = require("./PoolUtil");
const UIUtils = require("./UIUtils");

module.exports = {
    
    collectPos: cc.v2(),
    constCurrency : null,
    diamondCurrency : null,
    
    setCoinNode(cCurrency)
    {
        this.constCurrency = cCurrency;
    },
    setStarNode(cCurrency)
    {
        // this.constCurrency = cCurrency;
    },
    setDiamondNode(cCurrency)
    {
        this.diamondCurrency = cCurrency;
    },

    displayCoinInRuntime(from,to,pos,delay,callback)
    { 
        let scale1 = 1.6;
        
        let pos2 = cc.v2(pos.x, pos.y);
    
        let par = UIUtils.getPermanentsParent(null);
        pos2 = FunUtils.convertPos(from, par, pos2);
        
        if (!to) to = this.constCurrency.getIconNode();
        let pos3 = FunUtils.convertPos(to, par, cc.v2());

        let obj = PoolUtil.get(PoolUtil.pool_name.coin, true, par);
        if (!obj) return;
        
        obj.position = pos2;
        obj.scale = 0;
        
        cc.tween(obj)
            .delay(delay)
            .to(0.23, { scale: scale1 })
            .to(0.4,{position : pos3,scale : 1})
            .call(() =>
            {
                PoolUtil.restore(PoolUtil.pool_name.coin, obj);
                callback && callback();
            })
            .start();  
    },
    
    /**
     * @description 展示收集金币动画
     * @param 数量 number 
     * @param 金币产生的起始节点 from 
     * @param 金币的目的 to 
     * @param 金币在起始节点下的基础位置 pos 
     * @param 延迟 delay 
     * @param 回调 callback 
     */
    displayCoinFly(number,from,to,pos,delay,callback)
    {
        for (let i = 0; i < number; i++)
        {
            let index = i;
            let scale1 = FunUtils.randFloat(0.95, 1.12);
            let scale2 = FunUtils.randFloat(0.6, 0.86);
            let xDelta = FunUtils.randInt(-90, 90);
            let yDelta = FunUtils.randInt(-80, 80);
            
            let pos2 = cc.v2(pos.x + xDelta, pos.y + yDelta);
        
            let par = UIUtils.getPermanentsParent(null);
            pos2 = FunUtils.convertPos(from, par, pos2);
           
            if (!to) to = this.constCurrency.getIconNode();
            let pos3 = FunUtils.convertPos(to, par, cc.v2());

            let obj = PoolUtil.get(PoolUtil.pool_name.coin, true, par);
            if (!obj) continue;
            
            obj.position = pos2;
            obj.scale = 0;
            
            cc.tween(obj)
                .delay(delay)
                .delay(0.1 * (index ))
                .to(0.25, { scale: scale1 })
                .to(0.18, { scale: scale2 })
                .to(0.5,{position : pos3,scale : 1})
                .call(() =>
                {
                    PoolUtil.restore(PoolUtil.pool_name.coin, obj);
                    if (index == 0) callback && callback();
                    
                    this.constCurrency?.displayAnima();
                })
                .start();    
        }
    },

    displayDiamondFly(number,from,to,pos,delay,callback)
    {
        for (let i = 0; i < number; i++)
        {
            let index = i;
            let scale1 = FunUtils.randFloat(0.95, 1.12);
            let scale2 = FunUtils.randFloat(0.6, 0.86);
            let xDelta = FunUtils.randInt(-90, 90);
            let yDelta = FunUtils.randInt(-80, 80);
            
            let pos2 = cc.v2(pos.x + xDelta, pos.y + yDelta);
        
            let par = UIUtils.getPermanentsParent(null);
            pos2 = FunUtils.convertPos(from, par, pos2);
           
            if (!to) to = this.diamondCurrency.getIconNode();
            let pos3 = FunUtils.convertPos(to, par, cc.v2());

            let obj = PoolUtil.get(PoolUtil.pool_name.diamond, true, par);
            if (!obj) continue;
            
            obj.position = pos2;
            obj.scale = 0;
            
            cc.tween(obj)
                .delay(delay)
                .delay(0.1 * (index ))
                .to(0.25, { scale: scale1 })
                .to(0.18, { scale: scale2 })
                .to(0.5,{position : pos3,scale : 1})
                .call(() =>
                {
                    PoolUtil.restore(PoolUtil.pool_name.diamond, obj);
                    if (index == 0) callback && callback();
                    
                    this.diamondCurrency?.displayAnima();
                })
                .start();    
        }
    },
}
