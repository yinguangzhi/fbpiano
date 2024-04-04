/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-13 20:41:33
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-23 21:28:35
 * @FilePath: \FBPianoFire\assets\Scripts\utils\ConfigUtils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const CsvUtils = require("./CsvUtils")

module.exports = 
{
    musicList: [],
    
    loadConfig(_data,_callback)
    {
        let arr = CsvUtils.parse(_data);

        this.musicList = [];
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i].SongName == "0") continue;
            this.musicList.push(arr[i]);
        }
    },

    getMusicConfig(_id,_default)
    {
        let _find = this.musicList.find((element) => element.SongId === _id);
        if (!this.isEmpty(_find)) return _find;

        if(_default) return this.musicList[0];
        else return null;
    },

    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}