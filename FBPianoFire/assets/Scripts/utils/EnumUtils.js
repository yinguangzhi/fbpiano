/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-06 20:39:04
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-31 22:58:31
 * @FilePath: \FBPianoFire\assets\Scripts\utils\EnumUtils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


module.exports = {


    /**
     * @description 游戏阶段
     */
    GAME_STATUS:
    {
        IDLE: 0,
        BEFORE: 1,
        PLAYING: 2,
        END: 3,
        
    },

    /** 音乐节点的阶段 *///
    MUSIC_NOTE_STATUS:
    {
        /** 不可见的 */
        INVISIBLE: 0,
        
        /** 可见的 */
        VISIBLE: 1,

        /** 无效的 */
        INVALID: 1,
    },

     /** 分数等级 *///
    SCORE_LEVEL:
    {
        MISS: 0,

        GREAT: 2,

        PERFECT: 3,

        LONG_PERFECT: 4,
    },

    CURRENCY_TYPE:
    {
        COIN: 0,
        DIAMOND: 1,
        STAR : 2,
    },

    MUSIC_SORT_TYPE: 
    {
        ALL: 0,
        HOT: 1,
        NEW: 2,
        LIKE: 3,
        EASY: 4,
        HARD: 5,
        CRAZY : 5,
    },
    
    /** 难度 */
    DIFFICULT_TYPE:
    {
        EASY: 0,
        HARD: 1,
        MASTER: 2,
        CRAZY: 3,
    },

    MUSIC_TAG_TYPE:
    {
        NORMAL: 0,
        HOT: 1,
        NEW : 2,
    },
    

    /** 热歌 */
    MUSIC_UNLOCK_TYPE:
    {
        FREE : 0,
        DIAMOND: 1,
        COIN: 2,
    },

    /** 新歌 */
    NEW_TYPE:
    {
        NORMAL : 0,
        NEW: 1,
    },

    /** 货币类型 */
    CURRENCY_BUY_TYPE:
    {
        FREE : 0,
        DIAMOND: 1,
        COIN: 2,
        AD: 3,
        MONEY : 4,
    },

    /** 商店类型 */
    SHOP_TYPE:
    {
        DIAMOND: 1,
        COIN : 2,
    },

    MUSIC_NOTE_STATUS:
    {
        PREPARE : 1,
        PRESSING : 2,
        COMPLETE : 3,
        INVISIBLE : 4,
    },
}