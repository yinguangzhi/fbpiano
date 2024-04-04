// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var GameParamsHelper = require('./GameParamsHelper');
var Observer = require('./Observer');
const LoadUtils = require('./utils/LoadUtils');
const UIUtils = require('./utils/UIUtils');
const PoolUtil = require('./utils/PoolUtil');
const FacebookUtils2 = require('./utils/FacebookUtils2');
const FacebookUtils = require('./utils/FacebookUtils');
const AudioUtils = require('./utils/AudioUtils');
const StorageUtils = require('./utils/StorageUtils');
const EnumUtils = require('./utils/EnumUtils');
const GameData = require('./GameData');
const ConfigUtils = require('./utils/ConfigUtils');
const UIRoot = require('./common/UIRoot');
const EffectUtils = require('./utils/EffectUtils');
const FunUtils = require('./utils/FunUtils');
const ConsoleUtils = require('./utils/ConsoleUtils');
const PathUtils = require('./utils/PathUtils');

cc.Class({
    extends: UIRoot,

    properties: {
       
        descNode: cc.Node,
        nameLabel: cc.Label,
        authorLabel: cc.Label,
        bestLabel: cc.Label,

        blockParent: cc.Node,
        bgParent: cc.Node,
        unitList: null,

        model: null,
        musicData: null,
        constPreludeTime: 1,
        preludeTime: 0,


        blockIndex: 0,

        lifeList: [cc.Node],
        lifeParent: cc.Node,
        lifePrefab: cc.Prefab,

        baseLine: cc.Node,
        virtualLine: cc.Node,

        /** 复活时，音乐块父物体的y轴位置 */
        reviveY: 0,

        /** 开始块的赛道 */
        beginXIndex: 2,
        
        distance: 0,
        totalDistance: 10000,

        missNode: cc.Node,

        goodNode: cc.Node,
        perfectNode: cc.Node,
        perfectLabel: cc.Label,
        coinLabel: cc.Label,
        coinNode: cc.Node,

        musicPlayed: false,
        progressDelta: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        GameParamsHelper.vibrate = StorageUtils.getItem(StorageUtils.USER_PROPERTY.vibrate) == 1;

        this.musicData = ConfigUtils.getMusicConfig(GameParamsHelper.musicID, true);
        
        this.constPreludeTime = 1.2;

        Observer.clearMass();
    },

    start() {
        
        //该方法在安卓手机上报错，不能用
        //this._super();

        this.checkScenePage();

        this.unitList = [];

        // Observer.register("moveBg", this.moveBg, this);
        Observer.register(Observer.EVENT_NAME.RE_CHANGE_BPM, this.setBpm, this);
        Observer.register("gameOver", this.gameOver, this);
        Observer.register("loseBlock", this.loseBlock, this);
        Observer.register(Observer.EVENT_NAME.PREPARE_GAME, this.prepare, this);
        Observer.register(Observer.EVENT_NAME.GAME_BEGIN, this.gameBegin, this);
        Observer.register(Observer.EVENT_NAME.CLEAR_GAME_CACHE, this.clear, this);
        Observer.register(Observer.EVENT_NAME.GOOD_OR_PERFECT, this.displayGoodOrPerfect, this);
        Observer.register(Observer.EVENT_NAME.TOUCH_MUSIC_NOTE_FEEDBACK, this.touchFeedback, this);
        Observer.register(Observer.EVENT_NAME.GENERATE_NEW_MUSIC_NOTE, this.generateNewMusicNote, this);
        Observer.register("setMusicState", this.setMusicState, this);
        Observer.register(Observer.EVENT_NAME.DISPLAY_MUSIC_NOTE_EFFECT, this.displayNoteEffect, this);

        this.model = GameParamsHelper.model;
        
        this.prepare();
        
        this.generateLine();


        this.preload();
    },

    lateUpdate(dt) {

        this.progressDelta += dt;
        if (this.progressDelta > 0.2) {
            this.progressDelta = 0;

            let _progress = this.distance / this.totalDistance;
            Observer.fire(Observer.EVENT_NAME.REFRESH_GAME_PROGRESS, _progress);
        }

        if (GameParamsHelper.gs == EnumUtils.GAME_STATUS.PLAYING) {
            if (this.preludeTime != 100) {
                this.preludeTime -= dt;
                if (this.preludeTime <= 0) {
                    this.preludeTime = 100;
                    this.setMusicState(true);
                }
            }

            this.distance += GameParamsHelper.speed * dt;
            this.blockParent.y -= GameParamsHelper.speed * dt;

        }
    },

    onDestroy() {
        this.clear(true);
    },

    prepare() {
        let storageBlock = StorageUtils.getMusicData(this.musicData.SongId);
        this.nameLabel.string = this.musicData.SongName;
        this.authorLabel.string = this.musicData.Author;
        this.bestLabel.string = "Best:" + (storageBlock ? storageBlock.score : 0);
        this.descNode.active = true;

        FacebookUtils.hideBanner();

        if (!this.model) return;

        // this.clear();

        GameParamsHelper.gs = EnumUtils.GAME_STATUS.IDLE;

        GameData.coin = 0;
        GameParamsHelper.star = 0;
        GameParamsHelper.score = 0;
        GameParamsHelper.errorCount = 0;
        GameParamsHelper.reviveCount = 0;

        GameData.goodCount = 0;
        GameData.perfectCount = 0;

        GameData.indexInSkin = 0;

        this.distance = 0;
        this.blockIndex = -1;
        this.beginXIndex = 2;
        this.musicPlayed = false;

        Observer.fire(Observer.EVENT_NAME.SET_GAME_SCORE);
        this.refreshLife();
        this.coinLabel.node.parent.x = 600;
        this.coinLabel.node.parent.opacity = 0;
        
        Observer.fire(Observer.EVENT_NAME.RESET_GAME_PROGRESS);

        this.setBPMByMusicBlock(this.model.blocks[0]);

        this.totalDistance = this.model.totalLength;

        this.baseLine.setPosition(0, GameData.getBaseMusicY());
        
        this.perfectNode.scale = 0;
        this.goodNode.scale = 0;

        let _delayTime = FacebookUtils.isAndroid() ? 0.22 : 0.02;
        this.preludeTime = this.constPreludeTime;
        // ConsoleUtils.log("this.preludeTime : ", this.preludeTime);
        let _y = GameData.getBaseMusicY() + GameParamsHelper.speed * (_delayTime + this.preludeTime);
        _y -= GameData.musicLayoutConfig.baseHeight * 0.5;
        this.blockParent.y = _y;

        this.generateNewMusicNote(null);
        this.setLifeState(3);
        let _life = StorageUtils.getItem(StorageUtils.USER_PROPERTY.guide) == 0 ? 3 : 1;
        this.setLifeState(_life);
    },

    gameBegin()
    {
        AudioUtils.pauseMusic();
        AudioUtils.playAudio(AudioUtils.AUDIO.START);
        
        GameParamsHelper.gs = EnumUtils.GAME_STATUS.PLAYING;
        this.descNode.active = false;
    },

    setMusicState(state)
    {
        if (state) {
            if (this.musicPlayed) {
                AudioUtils.resumeMusic();
            }
            else {
                this.musicPlayed = true;
                AudioUtils.playMusic();
            }
        }
        else AudioUtils.pauseMusic();
    },

    setBPMByMusicBlock(_block)
    {
        this.setBpm(_block.bpm2);
    },

    setBpm(bpm)
    {
        GameParamsHelper.bpm = bpm;
        ConsoleUtils.log("bpm : ",bpm);
        GameParamsHelper.speed = GameData.refreshRuntimeSpeed(GameParamsHelper.bpm)// * 0.2;
    },

    setLifeState(count)
    {
        GameParamsHelper.totalErrorCount = count;

        if (!this.lifePrefab) return;
        
        if (this.lifeList) {
            if (this.lifeList.length != 0) {
                for (let i = 0; i < this.lifeList.length; i++) {

                    this.lifeList[i].active = false;
                }
            }
        }
        else this.lifeList = [];

        let  xs = [0,43,86];
        for(let i = 0;i < count;i++)
        {
            let obj = null;
            if(i < this.lifeList.length) obj = this.lifeList[i];
            else
            {
                obj = cc.instantiate(this.lifePrefab);
                obj.parent = this.lifeParent;
                this.lifeList.push(obj);
            }
            obj.position = cc.v2(xs[i],0);
            obj.active = true;
        }
    },

    generateNewMusicNote()
    {
        if(this.blockIndex >= this.model.blocks.length) return;

        if(this.blockIndex == -1)
        {
            this.addBeginMusicBlock(-1);
        }
        else
        {
            let _block = this.model.blocks[this.blockIndex];
            let _xIndex = _block.xIndex;

            if(_block.bpm2 > 0)
            {
                GameParamsHelper.bpm = _block.bpm2;
                GameParamsHelper.speed2bpm = GameData.getTempRuntimeSpeed(_block.bpm2);
                ConsoleUtils.log(GameParamsHelper.speed,"  ",GameParamsHelper.speed2bpm)
            }

            let isEnd = this.blockIndex == this.model.blocks.length - 1;
            this.setMusicBlockData(_block,this.blockIndex,_xIndex,isEnd);
        }

        this.blockIndex++;
    },

    addBeginMusicBlock(index)
    {
        let _yPos = GameData.getBaseMusicY() - GameData.musicLayoutConfig.baseHeight * 0.5 - this.blockParent.y;

        let _block = {
            Type : 0,
            bCnt: 1,
            BPM: -1,
            bpm2 : -1,
            length: GameData.musicLayoutConfig.baseHeight,
            posy : _yPos,
        };

        this.setMusicBlockData(_block,index,this.beginXIndex,false);
    },

    setMusicBlockData(_block,index,xIndex,isEnd)
    {
        let obj = PoolUtil.get(PoolUtil.pool_name.musicBlock,true,this.blockParent,this.unitList);
        let unit = obj.getComponent("MusicBlock");

        obj.position = cc.v2(GameData.getXPosByIndex(xIndex), _block.posy);
        unit.data = {
            block : _block,
            index : index,
            xIndex : xIndex,
            isEnd : isEnd,
            speed : GameParamsHelper.speed2bpm,
        }
    },

    /** 点击音乐块后的加分 */
    touchFeedback(_complete,result,attach)
    {
        let val = 0;
        if(result == EnumUtils.SCORE_LEVEL.PERFECT)
        {
            val = 3;
        }
        else if(result == EnumUtils.SCORE_LEVEL.GREAT)
        {
            val = 1;
        }

        if (_complete && attach.isLong)
        {
            val += 2;

            let _y = attach.topY + 20;
            let _obj = PoolUtil.get(PoolUtil.pool_name.addScore, true, this.node, null);    
            _obj.position = cc.v2(attach.x, _y);
            _obj.opacity = 0;

            _obj.children[0].getComponent(cc.Label).string = val;

            let _t_y = _y + 86;
            
            cc.tween(_obj)
                .to(0.36, { y: _t_y },{easing : "sineOut"})
                .start();
            cc.tween(_obj)
                .to(0.08, { opacity: 255 })
                .delay(0.28)
                .to(0.16, { opacity: 0 })
                .call(() =>
                {
                    PoolUtil.restore(PoolUtil.pool_name.addScore, _obj);
                })
                .start();
        }
        
        if (attach.isCoinBlock)
        {
            this.coinLabel.node.parent.opacity = 255;
            this.coinLabel.node.parent.x = 300;
            GameData.coin += 1;
            EffectUtils.displayCoinInRuntime( attach.node, this.coinNode, cc.v2(0,attach.offsetY), 0, () =>
            {
                this.coinLabel.string = GameData.coin;
            })
        }
        
        Observer.fire(Observer.EVENT_NAME.ADD_GAME_SCORE, val);
    },

     /** 点击音乐块后的反馈 */
    displayGoodOrPerfect(result)
    {
        let perfectCall = () =>
        {
            GameData.goodCount = 0;
            GameData.perfectCount ++;
            this.perfectLabel.string = "x" + GameData.perfectCount + '';

            this.goodNode.scale = 0;
            this.perfectNode.scale = 1;

            this.perfectLabel.node.stopAllActions();
            this.perfectLabel.node.scale = 0.7;
            cc.tween(this.perfectLabel.node)
                .to(0.15, { scale: 1 })
                .delay(0.4)
                .to(0.3, { scale: 0 })
                .start();
            

            let _o = FunUtils.findChild(this.perfectNode, "PERFECT");
            _o?.getComponent(cc.Animation).play();
        }

        let goodCall = () =>
        {
            GameData.perfectCount = 0;

            this.perfectNode.scale = 0;
            this.goodNode.scale = 1;
            let _o = FunUtils.findChild(this.goodNode, "GREAT");
            _o?.getComponent(cc.Animation).play();
        }

        if (result == EnumUtils.SCORE_LEVEL.GOOD)
        {
            goodCall();
        }
        else if(result == EnumUtils.SCORE_LEVEL.GREAT)
        {
            goodCall();
        }
        else if(result == EnumUtils.SCORE_LEVEL.PERFECT)
        {
            perfectCall();
        }
    },
    
    
    loseBlock(unit)
    {
        // if (StorageUtils.getItem(StorageUtils.USER_PROPERTY.guide) == 0) return;

        if (GameParamsHelper.gs == EnumUtils.GAME_STATUS.END) return;

        if (unit.isCoinBlock)
        {
            return;    
        }
        
        GameParamsHelper.errorCount++;
        
        if (GameParamsHelper.errorCount <= this.lifeList.length)
            this.lifeList[this.lifeList.length - GameParamsHelper.errorCount].active = false;
        
        ConsoleUtils.log(GameParamsHelper.errorCount ,"  ", GameParamsHelper.totalErrorCount);
        if(GameParamsHelper.errorCount >= GameParamsHelper.totalErrorCount)
        {
            let _y = unit.baseY;
            let _deltaD = GameData.getBaseMusicY() - _y;
            this.preludeTime = _deltaD / GameParamsHelper.speed;
            this.reviveY = this.blockParent.y + _deltaD;
            this.distance -= _deltaD;

            this.beginXIndex = unit.xIndex
            this.gameOver(false,unit);
        }
    },

    gameOver(success,unit)
    {
        if (GameParamsHelper.gs == EnumUtils.GAME_STATUS.END) return;

        GameParamsHelper.gs = EnumUtils.GAME_STATUS.END;
        GameData.perfectCount = 0;
        GameData.goodCount = 0;

        this.setMusicState(false);

        if(success)
        {
            GameParamsHelper.star = 3;
            this.settlement(success);
        }
        else
        {
            FacebookUtils2.initVideoFromExternal(true);
            
            let dist = this.reviveY - this.blockParent.y;
            let _time = dist / (1.2 * GameData.musicLayoutConfig.height)
            cc.tween(this.blockParent)
                .to(_time, { y: this.reviveY })
                .call(() =>
                {
                    // ConsoleUtils.log(unit.node);
                    cc.tween(unit.node)
                        .to(0.25, { opacity: 100 })
                        .to(0.25, { opacity: 255 })
                        .to(0.25, { opacity: 100 })
                        .to(0.25, { opacity: 255 })
                        .call(() => {
                            this.reviveUI(success, unit.xIndex);
                        })
                        .start();
                })
                .start();
            
        }

    },

    reviveUI(success,xIndex)
    { 
        UIUtils.displayUI("UIRelive",this.node,true,true,(page) =>
        {
            page.getComponent("UIRelive").data = {
                xIndex: xIndex,
                call: (state) =>
                {
                    if(state) this.revive();
                    else this.settlement(success);
                }
            }
        });
    },
    
    revive()
    {
        //放在最上层
        GameParamsHelper.gs = EnumUtils.GAME_STATUS.IDLE;
        GameParamsHelper.errorCount = 0;

        //放在音乐块父节点上移之前
        Observer.fireMass(Observer.EVENT_NAME.RESURRECT);

        this.addBeginMusicBlock(-2);

        this.setLifeState(1);
    },

    settlement(success)
    {
        FacebookUtils2.initFullFromExternal(true);

        AudioUtils.preLoadAudio(AudioUtils.AUDIO.STAR);

        let _progress = success ? 1 : this.distance / this.totalDistance;
        
        FacebookUtils2.displayFullFromExternal(false,() =>
        {
            UIUtils.displayUI("UISettlement",this.node,true,true,(page) =>
            {
                this.clear(false);
                page.getComponent("UISettlement").data = {
                    id: this.musicData.SongId,
                    score: GameParamsHelper.score,
                    star: GameParamsHelper.star,
                    progress: _progress,
                }
            });
        })
        
    },

    refreshLife()
    {

    },

    flyLife(_adds)
    {
        for (let i = 0; i < _adds.length; i++)
        {
            let _life = _adds[i];
            let _pos1 = _life.convertToWorldSpaceAR(cc.v2());
            _pos1 = this.lifeParent.convertToNodeSpaceAR(_pos1);
            _life.parent = this.lifeParent;
            _life.position = _pos1;

            if (i == 0)
            {
                _life.active = false;
                continue;    
            }
            
            let _t_life = this.lifeList[i];
            let _t_pos = _t_life.position;
            cc.tween(_life)
                .delay(0.06 * i)
                .to(0.36, { position: _t_pos })
                .call(() =>
                {
                    _life.destroy();
                    _t_life.active = true;
                })
                .start();
        }
        
        this.scheduleOnce(() => {
            this.setLifeState(3);
        }, 0.5);
    },
    
    generateLine()
    {
        let posXs = [-360,-180,0,180,360]
        for (let i = 0; i < 5; i++)
        {
            let obj = cc.instantiate(this.virtualLine);
            obj.parent = this.virtualLine.parent;
            obj.position = cc.v2(posXs[i], 0);
            obj.active = true;
        }
        
     },
    
    displayNoteEffect(unit)
    { 
        if (!unit) return;

        let pos = unit.getWorldPos();
        pos = this.node.convertToNodeSpaceAR(pos);

        let eff = PoolUtil.get(PoolUtil.pool_name.musicNoteEffect, true, this.node);
        eff.position = pos;

        let rand = FunUtils.randInt(1, 5);
        
        eff.getComponent(cc.Animation).play("tile" + rand);

        this.scheduleOnce(() => {
            if (!cc.isValid(this)) return;
            PoolUtil.restore(PoolUtil.pool_name.musicNoteEffect, eff);
        }, 0.55);
    },
    
    preload()
    {
        for (let i = 0; i < 3; i++)
        {
            let obj = PoolUtil.get(PoolUtil.pool_name.trailPrefab, true, this.node);
            obj.x = -10000;
            this.scheduleOnce(() =>
            {
                PoolUtil.restore(PoolUtil.pool_name.trailPrefab,obj);
            }, 1)
        }
        
        
        for (let i = 1; i < 5; i++)
        {
            let obj = PoolUtil.get(PoolUtil.pool_name.musicNoteEffect, true, this.node);
            obj.x = -10000;
            obj.getComponent(cc.Animation).play("tile" + i);
            this.scheduleOnce(() =>
            {
                PoolUtil.restore(PoolUtil.pool_name.musicNoteEffect,obj);
            }, 0.6)    
        }
        
        LoadUtils.loadAssetResAsync(PathUtils.getPrefabPath("GREAT"), cc.Prefab, true, this.goodNode, null, 0);
        LoadUtils.loadAssetResAsync(PathUtils.getPrefabPath("PERFECT"), cc.Prefab, true, this.perfectNode, null, 0);
    },
    
    clear(_clearCache)
    {
        ConsoleUtils.log("clear cache : ", _clearCache);
        for(let i = 0;i < this.unitList.length;i++)
        {
            let unit = this.unitList[i];
            unit.getComponent("MusicBlock").restore();
        }
        this.unitList.length = 0;

        if (!_clearCache) return;

        PoolUtil.clear(PoolUtil.pool_name.addScore);
        PoolUtil.clear(PoolUtil.pool_name.trailPrefab);
        PoolUtil.clear(PoolUtil.pool_name.musicBlock);
        PoolUtil.clear(PoolUtil.pool_name.musicChildBlock);
        PoolUtil.clear(PoolUtil.pool_name.musicNoteEffect);
    },

});
