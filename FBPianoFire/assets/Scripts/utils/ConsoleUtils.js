/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-23 22:27:35
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-27 21:40:50
 * @FilePath: \FBPianoFire\assets\Scripts\utils\ConsoleUtils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
    /** 是否输出 */
    isLog : true,

    log(...data)
    {
        if (!this.isLog) return;

        console.log(...data);
    },

    error(...data)
    {
        if (!this.isLog) return;
        
        console.error(...data);
    }
}