/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-06 00:12:51
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-29 23:29:29
 * @FilePath: \FBPianoFire\assets\Scripts\MusicPage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const GameData = require('./GameData');
var GameParamsHelper = require('./GameParamsHelper');
const Observer = require('./Observer');
const AudioUtils = require('./utils/AudioUtils');
const ConfigUtils = require('./utils/ConfigUtils');
const EffectUtils = require('./utils/EffectUtils');
const { HOT_TYPE, NEW_TYPE, DIFFICULT_TYPE, MUSIC_SORT_TYPE, MUSIC_TAG_TYPE } = require('./utils/EnumUtils');
const StorageUtils = require('./utils/StorageUtils');
const UIUtils = require('./utils/UIUtils');

cc.Class({
    extends: cc.Component,

    properties: {
        seedParent : cc.Node,
        scrollView: cc.ScrollView,
        
        WRGrid: cc.Node,
        
        toggleList : [cc.Node],

        songs: null,
        
        handNode : cc.Node,
        guideParent: cc.Node,
        toggleContainer: cc.ToggleContainer,
        inGuide: false,
        
        toggleDesc : null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.handNode.active = false;
        this.scrollView.node.opacity = 0;
        cc.tween(this.scrollView.node).to(0.1, { opacity: 255 }).start();
        
        UIUtils.addUI("MusicPage", this.node);
    },

    start () {

        Observer.register("setHandState", this.setHandState, this);

        // let handle = new  cc.Component.EventHandler();
        // handle.target = this.node;
        // handle.component = "MusicPage";
        // handle.handler = "dropAction";
        // this.scrollView.scrollEvents.push(handle);

        this.inGuide = false; //StorageUtils.getItem(StorageUtils.USER_PROPERTY.guide) == 0;
        this.guideParent.active = this.inGuide;

        let titleMap = [
            {title : "All",type : MUSIC_SORT_TYPE.ALL,diffType : -1,tagType : -1,},
            {title : "Hot",type : -1,diffType : -1,tagType : MUSIC_TAG_TYPE.HOT},
            {title : "New",type : -1,diffType : -1,tagType : MUSIC_TAG_TYPE.NEW},
            {title : "Like",type : MUSIC_SORT_TYPE.LIKE,diffType : -1,tagType : -1},
            {title : "Easy",type : -1,diffType : DIFFICULT_TYPE.EASY,tagType : -1},
            {title : "Hard",type : -1,diffType : DIFFICULT_TYPE.HARD,tagType : -1},
            {title : "Master",type : -1,diffType : DIFFICULT_TYPE.MASTER,tagType : -1},
            {title : "Crazy",type : -1,diffType : DIFFICULT_TYPE.CRAZY,tagType : -1},
        ]
        this.toggleList = this.toggleContainer.node.children;
        for (let i = 0; i < this.toggleList.length; i++)
        {
            let toggle = this.toggleList[i];
            toggle['data'] = titleMap[i];
            toggle.getChildByName("name").getComponent(cc.Label).string = titleMap[i].title;
        }
        
        this.scheduleOnce(() =>
        {
            this.toggleDesc = titleMap[0];
            this.produceLayout();

            // EffectUtils.displayCoinFly(10, this.node, null, cc.v2(), 0.2, () =>
            // {
            //     StorageUtils.saveItem(StorageUtils.USER_PROPERTY.coin, 100);
            //     Observer.fireMass(Observer.EVENT_NAME.REFRESH_COIN);
                
            // });

        }, 0.03)
        
    },

    // update (dt) {},

    onDisable()
    {
        GameParamsHelper.scrollY = this.seedParent.y;
    },

    produceLayout()
    {
        GameData.selectMusicToggleData = this.toggleDesc;
        
        let temps = [];
        this.songs = ConfigUtils.musicList.concat();
        // console.log(this.songs);
        for (let i = 0; i < this.songs.length; i++)
        {
            let cg = this.songs[i];
            if (this.toggleDesc.diffType != -1)
            {
                if (this.toggleDesc.diffType != cg.Hard)
                {
                    continue;
                }    
            }
            
            if (this.toggleDesc.tagType != -1)
            {
                if (this.toggleDesc.tagType != cg.Tag)
                {
                    continue;
                }    
            }

            if (this.toggleDesc.type == MUSIC_SORT_TYPE.LIKE)
            {
                if (!StorageUtils.isMusicLiked(cg.SongId))
                    continue;    
            }
            

            temps.push(cg);
        }
        
        // console.log(temps);
        this.WRGrid.getComponent("WRGrid").setData(temps);
     },
    
    // dropAction()
    // {
    // },


    onToggleCheck(params1,params2)
    {
        if (!Observer.fireInterval("music", 200)) return;

        console.log(params1.node["data"]);
        this.toggleDesc = params1.node["data"];
        this.produceLayout();
    },

    setHandState(state)
    {
        this.handNode.active = state;
    },
});
