/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-06 00:12:51
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-04-01 00:21:12
 * @FilePath: \FBPianoFire\assets\Scripts\Initializer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


const LoadUtils = require('./utils/LoadUtils');
const FacebookUtils = require('./utils/FacebookUtils');
const FacebookUtils2 = require('./utils/FacebookUtils2');
const AudioUtils = require('./utils/AudioUtils');
const UIUtils = require('./utils/UIUtils');
const StorageUtils = require('./utils/StorageUtils');
const GameData = require('./GameData');
const ConfigUtils = require('./utils/ConfigUtils');

cc.Class({
    extends: cc.Component,

    properties: {

        loadCnt: 0,
        musicCsv: cc.TextAsset,
        
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {

    },

    start () {
        this.loadCnt = 0;

        FacebookUtils.initFacebook();
        ConfigUtils.loadConfig(this.musicCsv.text,null);
        // FacebookUtils.adConvert("186615390575519_186615960575462");//banner
        // FacebookUtils.adConvert("186615390575519_186615967242128");//interi
        // FacebookUtils.adConvert("186615390575519_186616097242115");//video

        FacebookUtils.login((state) => {

            StorageUtils.readUserDataFromPlatform(() => {

                AudioUtils.setAudioState(StorageUtils.getItem(StorageUtils.USER_PROPERTY.audio) == 1);
                AudioUtils.setMusicState(StorageUtils.getItem(StorageUtils.USER_PROPERTY.music) == 1, false);

                FacebookUtils.bindPause();
                FacebookUtils.initPlayer();

                FacebookUtils2.initVideoFromExternal(true);


                this.enterGame();
            })

            StorageUtils.readMusicDataFromPlatform(() => { 
                
                this.enterGame();
            })
        })
        
        GameData.generateMusicLayoutConfig();
    },

    enterGame() {
        this.loadCnt++;

        LoadUtils.loadAsset("prefab/UILoading", cc.Prefab, null);
        
        if (this.loadCnt >= 2) {

            for (let i = 0; i < ConfigUtils.musicList.length; i++)
            { 
                let data = ConfigUtils.musicList[i];
                if (data.UnlockType == 0)
                {
                    StorageUtils.saveMusicData(data.SongId, 0, 0);
                }
                
            }
            
            UIUtils.translate("home");
        }
    },
    // update (dt) {},
});
