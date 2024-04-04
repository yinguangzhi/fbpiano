

/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2023-09-05 23:20:10
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-23 22:59:27
 * @FilePath: \Block\assets\script\AspectUnit.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
cc.Class({
    extends: cc.Component,

    properties: {
        originScale : 1,
    },

    onLoad ()
    {
        this.originScale = this.node.scale;
    },

    start ()
    {
        let realSize = cc.view.getFrameSize();
        let realRate = realSize.height / realSize.width;

        let designSize = cc.view.getDesignResolutionSize();
        let designRate = designSize.height / designSize.width;

        
        if(realRate > designRate)
        {
            let realHeight = designSize.height * realRate / designRate;
            if(realHeight > this.node.height - 20)
            {
                let _s = realHeight / (this.node.height - 20);
                this.node.scale = this.originScale * _s;
            }
        }
    },


    // update (dt) {},
});
