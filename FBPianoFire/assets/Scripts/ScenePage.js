// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const GameParamsHelper = require("./GameParamsHelper");
const LoadUtils = require("./utils/LoadUtils");
const UIUtils = require("./utils/UIUtils");
const PreloadUtils = require("./utils/PreloadUtils");
const PathUtils = require("./utils/PathUtils");
const PoolUtil = require("./utils/PoolUtil");
const FacebookUtils2 = require("./utils/FacebookUtils2");
const FacebookUtils = require("./utils/FacebookUtils");
const AudioUtils = require("./utils/AudioUtils");
const MidiConvert = require("./utils/MidiConvert");
const GameData = require("./GameData");
const ConfigUtils = require("./utils/ConfigUtils");
const StorageUtils = require("./utils/StorageUtils");

cc.Class({
    extends: cc.Component,
    properties: {
    
        callback: null,
        backNode: cc.Node,
        progressSprite: cc.Node,
        progressTip : cc.Node,


        progress : 0,
        totalPreLoadCnt : 0,
        preLoadCnt : 0,
        speed: 30,
        
        durTime : 0,
        lastPercent : 0,
        speed: 30,
        scene: "",
    
        couldDestroy : false,
        autoTranslate : false,
        progressLabel: cc.Label,
    },

    onLoad() {
        this.speed = 12;
        this.totalPreLoadCnt = 999;
        
        this.canceled = false;

        this.progress = 0;
        this.setProgress(0);

        if (this.backNode) this.backNode.active = false;
    },

     update(dt) {

        if (this.progress < 98) {

            if (this.preLoadCnt < this.totalPreLoadCnt) {

                if (this.progress < 96) {

                    this.progress += dt * this.speed;
                }
                if (this.progress >= 98) this.progress = 96;
                
                this.setProgress(this.progress);
                
            } 
            else {
                
                this.speed = 60;

                this.progress += dt * this.speed;
                this.setProgress(this.progress);
            }

            if (this.progress >= 98) {
                console.log(this.scene);
                
                this.onLoadComplete();
            }
        }
     },
    
    setData(_scene , _autoTranslate ) {

        let staticID = ++GameParamsHelper.staticID;

        this.speed = 15;
        // this.progress = 0;
        // this.setProgress(this.progress);
        
        console.log("load scene : ", _scene);
        
        this.scene = _scene;

        this.autoTranslate = _autoTranslate;

        if (this.backNode) this.backNode.active = false;

        this.preLoadCnt = 0;
        this.totalPreLoadCnt = 0;

        if (this.scene == "game2") {

            FacebookUtils2.displayBannerFromExternal();

            this.totalPreLoadCnt = 4;
            let config = ConfigUtils.getMusicConfig(GameParamsHelper.musicID);
            console.log(config);
            
            //图片资源
            this.totalPreLoadCnt += GameData.frameNames.length;
            
            let skinID = StorageUtils.getItem(StorageUtils.USER_PROPERTY.skin,1);
            GameData.setCurrSkinCG(skinID);

            for (let i = 0; i < GameData.frameNames.length; i++)
            {
                let _name = GameData.frameNames[i];
                let path1 = PathUtils.getSkinPath(skinID, _name);
                if (_name == "coinBlock") path1 = PathUtils.getImagePath(_name);

                LoadUtils.loadAssetAsync(path1, cc.SpriteFrame, null, 0)
                    .then((asset) =>
                    {
                        GameData.frameMap[_name] = asset;   
                        this.preLoadCnt++;
                    })       
            }
            
            

            //音乐资源
            LoadUtils.loadAsset(PathUtils.getMusicPath(config.File), cc.AudioClip, (asset) =>
            {
                if (staticID != GameParamsHelper.staticID) return;
                if (!cc.isValid(this)) return;
                if (this.canceled) return;
                
                AudioUtils.music = asset;
                
                this.preLoadCnt++;

                AudioUtils.prePlayMusic();
            })  

            //json文件
            LoadUtils.loadAsset(PathUtils.getCSVPath(config.Note), cc.TextAsset, (asset) => {
                if (staticID != GameParamsHelper.staticID) return;
                if (!cc.isValid(this)) return;
                if (this.canceled) return;

                MidiConvert.decrypt(asset, GameData.musicLayoutConfig.baseHeight,config.ElseSpeed, (asset) =>
                {
                    GameParamsHelper.model = asset;
                });
                this.preLoadCnt++;
                
            }, 0)

            //注册prefab对象池
            PreloadUtils.addAsset("enter_game",PathUtils.getPrefabPath("MusicNote"),cc.Prefab,0,(asset) =>
            {
                PoolUtil.register(PoolUtil.pool_name.musicNote, asset);
            })
            PreloadUtils.addAsset("enter_game",PathUtils.getPrefabPath("MusicNoteEffect"),cc.Prefab,0,(asset) =>
            {
                PoolUtil.register(PoolUtil.pool_name.musicNoteEffect, asset);
            })
            PreloadUtils.addAsset("enter_game",PathUtils.getPrefabPath("MusicBlock"),cc.Prefab,0,(asset) =>
            {
                PoolUtil.register(PoolUtil.pool_name.musicBlock, asset);
            })
            PreloadUtils.addAsset("enter_game",PathUtils.getPrefabPath("MusicChildBlock"),cc.Prefab,0,(asset) =>
            {
                PoolUtil.register(PoolUtil.pool_name.musicChildBlock, asset);
            })
            PreloadUtils.addAsset("enter_game",PathUtils.getPrefabPath("AddScore"),cc.Prefab,0,(asset) =>
            {
                PoolUtil.register(PoolUtil.pool_name.addScore, asset);
            })
            PreloadUtils.addAsset("enter_game", PathUtils.getPrefabPath("GREAT"), cc.Prefab, 0, null);
            PreloadUtils.addAsset("enter_game", PathUtils.getPrefabPath("PERFECT"), cc.Prefab, 0, null);
            PreloadUtils.addAsset("enter_game",PathUtils.getPrefabPath("TrailPrefab"),cc.Prefab,0,(asset) =>
            {
                PoolUtil.register(PoolUtil.pool_name.trailPrefab, asset);
                this.preLoadCnt++;
            })
            PreloadUtils.beginPreLoad("enter_game");
            
        }
        else if (this.scene == "home") { 
            
            this.totalPreLoadCnt = 3;
            
            LoadUtils.loadAssetAsync("prefab/Coin", cc.Prefab, null, 0)
                .then((asset) =>
                {
                    PoolUtil.register(PoolUtil.pool_name.coin, asset);
                    this.preLoadCnt++;
                })
            
            LoadUtils.loadAssetAsync("prefab/Diamond", cc.Prefab, null, 0)
                .then((asset) =>
                {
                    PoolUtil.register(PoolUtil.pool_name.diamond, asset);
                    this.preLoadCnt++;
                })
        }

        cc.director.preloadScene(_scene, () => {
            if (staticID != GameParamsHelper.staticID) return;
            
            if (!cc.isValid(this)) return;
            
            if (this.canceled) return;
            
            this.preLoadCnt++;
            
        });
        
    },

    onLoadComplete() {
     
        this.progress = 98;
        this.setProgress(this.progress);

        // this.node.active = false;
        // this.destroy();
        
        if (this.scene == "home") GameParamsHelper.homeLoaded = true;
        
        cc.director.loadScene(this.scene, function () { 
            console.log(GameData.frameMap);
        });
        
    },

    realComplete() { 
        
        this.progress = 100;
        this.setProgress(this.progress);

        this.scheduleOnce(() => { 
            UIUtils.hideUI("ScenePage");
        },0.02)
    },

    setProgress(percent ) {

        this.progressLabel.string = "loading... " + `${Math.floor(percent)}%`;
        this.progressSprite.width = percent * 0.01 * 630;

        this.progressTip.x = this.progressSprite.x + this.progressSprite.width - 20;

        if (percent > 50 &&
            this.preLoadCnt < this.totalPreLoadCnt &&
            this.scene.indexOf("game") != -1 &&
            !this.canceled &&
            this.backNode ) {

            this.backNode.active = true;
        }
    },

    backAction() { 

        AudioUtils.playClick();
        
        this.canceled = true;
        if(this.backNode) this.backNode.active = false;

        FacebookUtils.hideBanner();

        UIUtils.hideUI("ScenePage");
        
    },
});
