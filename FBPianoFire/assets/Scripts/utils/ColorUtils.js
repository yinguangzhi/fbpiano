/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-06 20:37:31
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-23 21:25:57
 * @FilePath: \FBPianoFire\assets\Scripts\utils\ColorUtils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

module.exports = {

    colorList: {},
    convertHexToColor(colorStr) {
      
        let color = this.colorList[colorStr];
        
        if (this.isEmpty(color)) {
            color = cc.Color.WHITE.fromHEX(colorStr);
            this.colorList[colorStr] = color;
        }
        return color;
    },

    isEmpty: function (obj) {
        return obj === '' || obj === null || obj === undefined;
    },
}
