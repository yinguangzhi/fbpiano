
var Observer = require('./Observer');
var GameParamsHelper = require('./GameParamsHelper');
const UIUtils = require('./utils/UIUtils');
const WRRender = require('./common/WRRender');
const FacebookUtils2 = require('./utils/FacebookUtils2');
const AudioUtils = require('./utils/AudioUtils');
const StorageUtils = require('./utils/StorageUtils');
const { MUSIC_UNLOCK_TYPE } = require('./utils/EnumUtils');
const EnumUtils = require('./utils/EnumUtils');
const ConfigUtils = require('./utils/ConfigUtils');
const GameData = require('./GameData');

cc.Class({
    extends: WRRender,

    properties: {

        topBg: cc.Node,
        
        starNumLabel: cc.Label,
        starNumLabel2: cc.Label,

        nameLabel: cc.Label,
        authorLabel: cc.Label,
        hardLabel: cc.Label,

        icon: cc.Sprite,
        frames : [cc.SpriteFrame],

        diamondPlayNode : cc.Node,
        coinPlayNode : cc.Node,
        playNode : cc.Node,
        adNode: cc.Node,
        lockNode: cc.Node,
        starNode : cc.Node,
        collectNode : cc.Node,
        
        starFrames: [cc.SpriteFrame],
        starCount : 0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    setData()
    {
        let storageData = StorageUtils.getMusicData(this.data.SongId);

        this.topBg.active = this.indexInList == 0 && !GameData.isInGameScene();
        if (this.indexInList == 0 && this.topBg.active)
        {
            if (GameData.selectMusicToggleData.type == EnumUtils.MUSIC_SORT_TYPE.ALL) {
                this.starNumLabel.node.parent.opacity  = 255;
                this.starNumLabel.string = StorageUtils.getTotalStar();
                this.starNumLabel2.string = "/" + ConfigUtils.musicList.length * 3;
            }
            else this.starNumLabel.node.parent.opacity  = 0;
        }
        
        this.nameLabel.string = this.data.SongName;
        this.authorLabel.string = this.data.Author;

        let costLabel = this.diamondPlayNode.getChildByName("cost").getComponent(cc.Label);
        costLabel.string = this.data.UnlockNum;

        let costLabel2 = this.coinPlayNode.getChildByName("cost").getComponent(cc.Label);
        costLabel2.string = this.data.UnlockNum;

        if (this.data.Hard == EnumUtils.DIFFICULT_TYPE.EASY) this.hardLabel.string = "Easy";
        if (this.data.Hard == EnumUtils.DIFFICULT_TYPE.HARD) this.hardLabel.string = "Hard";
        if (this.data.Hard == EnumUtils.DIFFICULT_TYPE.MASTER) this.hardLabel.string = "Expert";
        if (this.data.Hard == EnumUtils.DIFFICULT_TYPE.CRAZY) this.hardLabel.string = "Crazy";

        this.starCount = storageData ? storageData.level : 0;

        this.icon.spriteFrame = this.frames[this.data.SongId % 5];
 
        let unlock = StorageUtils.isMusicUnlock(this.data.SongId);
        let free = unlock || this.data.UnlockType == MUSIC_UNLOCK_TYPE.FREE;

        this.setLockState(free);
        this.setCollectState();
    },

    setLockState(free)
    {
        this.diamondPlayNode.active = !free && this.data.UnlockType == MUSIC_UNLOCK_TYPE.DIAMOND;
        this.coinPlayNode.active = !free && this.data.UnlockType == MUSIC_UNLOCK_TYPE.COIN;
        this.playNode.active = free;
        this.adNode.active = !free;

        this.lockNode.active = false;// !free;
        this.starNode.active = free;
        let stars = this.starNode.children;
       
        for (let i = 0; i < stars.length; i++)
        {
            let _frameIndex = i < this.starCount ? 1 : 0;
            stars[i].getComponent(cc.Sprite).spriteFrame = this.starFrames[_frameIndex]
        }
    },

    setCollectState()
    {
        let storageData = StorageUtils.getMusicData(this.data.SongId);
        let like = storageData && storageData.like == 1;
        this.collectNode.children[0].active = !like;
        this.collectNode.children[1].active = like;
    },

    playAction()
    {
        if(!Observer.fireInterval("play",500))
            return;

        this.realPlay();
    },

    adAction()
    {
        if(!Observer.fireInterval("play",500))
            return;

        FacebookUtils2.displayVideoFromExternal(true,(state) =>
        {
            if(state) this.realPlay();
        })
    },

    diamondAction()
    {
        if(!Observer.fireInterval("play",500))
            return;

        if(StorageUtils.getItem(StorageUtils.USER_PROPERTY.diamond) < this.data.UnlockNum)
        {
            UIUtils.displayUI("DiamondPop",null, true,true, (page) =>
            {    
            })
            
            return;
        }

        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.diamond,-this.data.UnlockNum,false);

        this.realPlay();
    },

    coinAction()
    {
        if(!Observer.fireInterval("play",500))
            return;

        if(StorageUtils.getItem(StorageUtils.USER_PROPERTY.coin) < this.data.UnlockNum)
        {
            UIUtils.displayUI("CoinPop",null, true,true,null)
            
            return;
        }

        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.coin,-this.data.UnlockNum,false);

        this.realPlay();
    },

    likeAction()
    { 
        if(!Observer.fireInterval("like",100))
            return;

        StorageUtils.saveMusicDataByLike(this.data.SongId);
        this.setCollectState();
    },
    
    realPlay()
    {
        Observer.fire("setHandState", false);
        StorageUtils.saveMusicData(this.data.SongId, 0, 0);
        
        GameParamsHelper.musicID = this.data.SongId;
        
        UIUtils.translate("game2");
    },
});
