/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-01-13 22:55:14
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-24 18:35:11
 * @FilePath: \Block\assets\script\PathHelper.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = 
{
    commonFramePath : "image/block/",
    commonPrefabPath: "prefab/",
    commonAudioPath : "audio/",
    commonMusicPath : "music/",
    commonCSVPath : "config/",
    commonSkinPath : "image/skin/",
    commonImagePath : "image/",

    getPrefabPath(_name)
    {
        return this.commonPrefabPath + _name;
    },

    getBlockFramePath(_name)
    {
        return this.commonFramePath + _name;
    },

    getAudioPath(_name)
    {
        return this.commonAudioPath + _name;
    },

    getMusicPath(_name)
    {
        return this.commonMusicPath + _name;
    },
    
    getCSVPath(_name)
    {
        return this.commonCSVPath + _name;
    },

    getSkinPath(_id, _name)
    {
        let path = this.commonSkinPath + "frame" + _id + "/" + _name;
        return path;
    },

    
    getImagePath(_name)
    {
        return this.commonImagePath + _name;
    },
}