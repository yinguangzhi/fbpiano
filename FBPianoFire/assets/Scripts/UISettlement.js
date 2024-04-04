

const GameParamsHelper = require("./GameParamsHelper");
const Observer = require("./Observer");
const AudioUtils = require("./utils/AudioUtils");
const ConfigUtils = require("./utils/ConfigUtils");
const FacebookUtils = require("./utils/FacebookUtils");
const FacebookUtils2 = require("./utils/FacebookUtils2");
const PoolUtil = require("./utils/PoolUtil");
const StorageUtils = require("./utils/StorageUtils");
const UIUtils = require("./utils/UIUtils");
const UIBase = require("./base/UIBase");
const EffectUtils = require("./utils/EffectUtils");
const GameData = require("./GameData");
const FunUtils = require("./utils/FunUtils");

cc.Class({
    extends: UIBase,

    properties: {
        seedPrefab : cc.Prefab,
        mask : cc.Node,

        nameLabel: cc.Label,
        scoreLabel: cc.Label,
        rewardLabel: cc.Label,
        bestScoreLabel: cc.Label,
        
        starNode : cc.Node,
        btnNode: cc.Node,
        layout: cc.Node,
        
        nextBtn: cc.Node,
        nextADBtn : cc.Node,
        againNode: cc.Node,

        shareNode: cc.Node,
        inviteNode: cc.Node,
        
        starEff: cc.Node,
        starPrefab: cc.Prefab,
        
        adRewardNode : cc.Node,
        nextMusicCG: null,
        
        btnY: 0,
        nameY: 0,
        starY: 0,
        bestY: 0,
        scoreY: 0,
    },

    onLoad() {
        
        PoolUtil.register("seed",this.seedPrefab);

        this.mask.active = true;
        this.content.opacity = 255;
        
        this.btnNode.opacity = 0;

        this.nameY = this.nameLabel.node.y;
        this.bestY = this.bestScoreLabel.node.parent.y;
        this.starY = this.starNode.y;
        this.scoreY = this.scoreLabel.node.y;
        this.nameLabel.node.y += 300;
        this.bestScoreLabel.node.parent.y += 300;
        this.starNode.y += 300;
        this.scoreLabel.node.y += 300;

        this.starNode.opacity = 0;
        this.bestScoreLabel.node.parent.opacity = 0;
        this.scoreLabel.node.opacity = 0;
        this.rewardLabel.node.parent.opacity = 0;

        this.adRewardNode.opacity = 0;
        this.adRewardNode.x = 400;

        this.scheduleOnce(() => {

            FacebookUtils2.initVideoFromExternal(true);

            FacebookUtils2.displayBannerFromExternal();
        }, 0.6)
    },

    start() {
        FacebookUtils2.displayBannerFromExternal();
    },

    update(dt) {
    },

    onDestroy()
    {
        
            UIUtils.hideUI("UISettlement");
    },

    setData() {

        let id = this.data.id;
        let star = this.data.star;
        let score = this.data.score;

        this.musicCG = ConfigUtils.getMusicConfig(id);
        let storageData = StorageUtils.getMusicData(id);

        this.nameLabel.string = this.musicCG.SongName;
        this.scoreLabel.string = score;
        let bestS = storageData ? storageData.score : 0;
        if (bestS < score) bestS = score;
        this.bestScoreLabel.string = "Best:" + bestS;
        
        this.againNode.active = true;
        // this.shareNode.active = star >= 3;
        // this.inviteNode.active = star < 3;


        FacebookUtils.postSessionScore(score);

        FacebookUtils.setProtoRank("allUser", score);

        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.guide, 1, false);
        StorageUtils.saveMusicData(id, star, score);
        Observer.fireMass(Observer.EVENT_NAME.REFRESH_STAR);
        

        let coin = GameData.coin + Math.floor(this.musicCG.RewardNum * this.data.progress);
        this.rewardLabel.string = "+" + coin;
        if (coin > 0)
        {
            this.scheduleOnce(() =>
            {
                if (!cc.isValid(this)) return;

                EffectUtils.displayCoinFly(10, this.rewardLabel.node, null, cc.v2(), 0.2, () =>
                {
                    StorageUtils.saveItem(StorageUtils.USER_PROPERTY.coin, coin);
                    Observer.fireMass(Observer.EVENT_NAME.REFRESH_COIN);
                });
            },1.3)
        }
        

        this.displayName();

        this.scheduleOnce(() => {
            let contextID = FacebookUtils.contextID.get();
            if (!FunUtils.isEmpty(contextID)) {
                FacebookUtils.updateToPlatform("image/share", FacebookUtils.updateType.update, { score: score }, null);
            }
        }, 0.3);

        this.scheduleOnce(() => {
            this.checkShortcut();
        }, 0.5);

        this.scheduleOnce(() => {
            this.mask.active = false;
        }, 1.4);
    },

    displayName()
    {
        cc.tween(this.nameLabel.node)
            .to(0.32, { y: this.nameY - 20 })
            .to(0.08,{y : this.nameY})
            .start();

        cc.tween(this.starNode)
            .delay(0.3)
            .to(0.24, { opacity: 255,y : this.starY - 20 })
            .to(0.08,{y : this.starY})
            .start();
        
        cc.tween(this.bestScoreLabel.node.parent)
            .delay(0.45)
            .to(0.32, {opacity: 255, y: this.bestY - 20 })
            .to(0.08,{y : this.bestY})
            .start();
        
        cc.tween(this.scoreLabel.node)
            .delay(0.55)
            .to(0.32, {opacity : 255, y: this.scoreY - 20 })
            .to(0.08,{y : this.scoreY})
            .call(() =>
            {
                this.setStar(this.data.star);
            })
            .start();
        
        cc.tween(this.rewardLabel.node.parent)
            .delay(0.66)
            .to(0.2, { opacity: 255 })
            .start();
    },
    
    
    setStar(count)
    {
        // count = 2;
        let delayTime = 0.18 * count;
        for (let i = 0; i < count; i++)
        {
            this.scheduleOnce(() =>
            {
                AudioUtils.playAudio(AudioUtils.AUDIO.STAR)
                let star = cc.instantiate(this.starPrefab);
                star.parent = this.starNode;
                star.position = this.starNode.children[i].position;
                
            }, i * 0.2)
            
            this.starEff.active = true;
            
        }
        
        this.scheduleOnce(() =>
        {
            this.generateLayout();
        },delayTime)
            
     },
    
    generateLayout()
    {
        let lockList = [];
        let unlockList = [];
        let notSameTypeLockList = [];
        for (let i = 0; i < ConfigUtils.musicList.length; i++)
        {
            let _cg = ConfigUtils.musicList[i];

            if (!StorageUtils.isMusicUnlock(_cg.SongId))
            {
                if (_cg.SongType == this.musicCG.SongType)
                {
                    lockList.push(_cg);
                }
                else
                {
                    notSameTypeLockList.push(_cg);
                }
                
            }
            else if (_cg.SongId != this.musicCG.SongId)
            {
                unlockList.push(_cg);
            }
        }
        
        lockList = lockList.concat(notSameTypeLockList);

        let couldNextAD = lockList.length > 0;
        this.nextADBtn.active = couldNextAD;
        this.nextBtn.active = !couldNextAD;

        if (lockList.length < 5) 
        {
            for (let i = 0; i < unlockList.length; i++)
            {
                lockList.push(unlockList[i]);
                if (lockList.length >= 5) break;
            }    
        }
        lockList = lockList.slice(0, 5);

        cc.tween(this.adRewardNode)
                .to(0.30, { x: -90,opacity : 255 })
                .to(0.08,{x : 0})
                .start();

        for(let i = 0;i < lockList.length;i++)
        {
            let obj = PoolUtil.get("seed", true, this.layout);
            let seed = obj.getComponent("UnitMusic");
            seed.data = lockList[i];

            obj.x = 1000;
            cc.tween(obj)
                .delay(i * 0.06)
                .to(0.30, { x: -90 })
                .to(0.08,{x : 0})
                .start();
        }
        
        this.nextMusicCG = lockList[0];

        this.scheduleOnce(() =>
        {
            this.displayBtn();
        }, 0.4)
        
    },
    
    displayBtn()
    {
        this.btnY = this.btnNode.y;
        this.btnNode.y -= 600;
        this.btnNode.opacity = 255;

        cc.tween(this.btnNode)
            .to(0.36, { y: this.btnY })
            .start();
    },
    
    homeAction() {

        if (!Observer.fireInterval("settlement", 500)) return;

        let call = () =>
        {

            if(GameParamsHelper.homeLoaded) cc.director.loadScene("home", function () { });
            else UIUtils.translate("home");
        }

        FacebookUtils2.displayFullFromExternal(true, call);
    },

    nextAction()
    { 
        if (!Observer.fireInterval("settlement", 500)) return;

        this.realPlay();
    },
    
    nextADAction() {

        if (!Observer.fireInterval("settlement", 500)) return;

        FacebookUtils2.displayVideoFromExternal(true,(state) => {
            if (state) {

                this.realPlay();
            }
        })
    },

    adRewardAction() {

        if (!Observer.fireInterval("settlement", 500)) return;

        FacebookUtils2.displayVideoFromExternal(true,(state) => {
            if (state) {

                if (!cc.isValid(this)) return;

                // this.adRewardNode.active = false;
                EffectUtils.displayCoinFly(10, this.adRewardNode, null, cc.v2(), 0.2, () =>
                {
                    StorageUtils.saveItem(StorageUtils.USER_PROPERTY.coin, 100);
                    Observer.fireMass(Observer.EVENT_NAME.REFRESH_COIN);
                });
            }
        })
    },

    realPlay()
    {
        StorageUtils.saveMusicData(this.nextMusicCG.SongId, 0, 0);
        
        GameParamsHelper.musicID = this.nextMusicCG.SongId;
        
        UIUtils.translate("game2");
    },

    shareAction() {

        if (!Observer.fireInterval("settlement", 500)) return;

        UIUtils.displayMask(true);
        AudioUtils.playMute();

        FacebookUtils.updateToPlatform("image/share", FacebookUtils.updateType.share, { score: 1 }, (bool) => {

            UIUtils.displayMask(false);
        });

    },
    inviteAction() {

        if (!Observer.fireInterval("settlement", 500)) return;

        UIUtils.displayMask(true);
        AudioUtils.playMute();

        FacebookUtils.inviteFriend("image/share", (bool) => {

            UIUtils.displayMask(false);
            
            Observer.fire(Observer.EVENT_NAME.PREPARE_GAME);

            UIUtils.hideUI("UISettlement");
        });

    },

    againAction() {

        if (!Observer.fireInterval("settlement", 500)) return;

        let call = () =>
        {
            Observer.fire(Observer.EVENT_NAME.PREPARE_GAME);

            UIUtils.hideUI("UISettlement");
        }

        FacebookUtils2.displayFullFromExternal(true, call);
    },

    checkShortcut() { 
        
        let timeStr = FunUtils.getTodayString();

        if (StorageUtils.getItem(StorageUtils.USER_PROPERTY.shortcutTime) != timeStr) { 

            FacebookUtils.createShortcut(true, true, (_bool) => {
    
                // this.shortcutNode.active = _bool;

                if (_bool) {

                    AudioUtils.playMute();
                    FacebookUtils.createShortcut(false, true, (_bool) => {

                        StorageUtils.saveItem(StorageUtils.USER_PROPERTY.shortcutTime, timeStr);

                        // this.shortcutNode.active = _bool;
                    });
                }
            });
        }
        
    },

});
