// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var GameParamsHelper = require('./GameParamsHelper');
var Observer = require('./Observer');
const PoolUtil = require('./utils/PoolUtil');
const FacebookUtils = require('./utils/FacebookUtils');
const WRScript = require('./base/WRScript');
const EnumUtils = require('./utils/EnumUtils');
const GameData = require('./GameData');

cc.Class({
    extends: WRScript,

    properties: {
        status : EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE,

        touch : cc.Node,
        content: cc.Node,
        press : cc.Node,
        pressTop: cc.Node,
        
        block : null,
        type : 0,
        index : 0,
        xIndex : 0,
        length: 0,
        bCnt : 0,
        realHeight : 0,
        childList: [],

        isMusicBlock : false,
        isColorBlock: false,
        isCoinBlock : false,
        isBpmBlock : false,
        longStatus: 0,

        trail : null,
        
        /** 长块的 上方的弧形的顶部的透明部分的高度 */
        virtualDeltaInPressTop: 0,

        /** 长块的按压块和上方的弧形的距离 */
        distanceInPressToPressTop: 0,

        /** 按压长块时，按压块 的高度与手指点击的位置的距离 */
        distanceInPressToHead: 0,

        /** 按压块的最小高度 */
        minPressHeight : 0,

        nextCall : null,
        loseCall : null,

        isReset : false,

        startNode : cc.Node,
        isEnd : false,
        speed: 1,
        
        scoreLevel : 0,
        
        baseWidth:
        {
            get()
            {
                return GameData.musicLayoutConfig.baseWidth;
            }
        },
        baseHeight:
        {
            get()
            {
                return GameData.musicLayoutConfig.baseHeight;
            }
        },
        
        /** 中心点的偏移 */
        offsetY: 
        {
            get()
            {
                return this.baseHeight * 0.5;
            }
        },
        
        baseY:
            {
                get()
                {
                    if(this.status == EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE) return this.y;
                    return this.y + this.content.y + this.node.parent.y;
                }
            },
        botY:
            {
                get()
                {
                    return this.baseY - this.baseHeight * 0.5;
                }
            },
        topY:
            {
                get()
                {
                    return this.botY + this.height;
                }
            },

        localTopY :
        {
            get()
            {
                return this.y + this.height;
            }
        },

        realDistanceInPressToPressTop :
        {
            get()
            {
                return this.distanceInPressToPressTop - this.virtualDeltaInPressTop;
            }
        },

        isLong :
        {
            get()
            {
                return this.type == 2;
            }
        }
    },

    // onLoad () {},
    
    touchUnit(pos)
    {
        if(GameParamsHelper.gs == EnumUtils.GAME_STATUS.END) return;
            
        if(GameParamsHelper.gs == EnumUtils.GAME_STATUS.IDLE)
        {
            if(this.isMusicBlock)
            {
                Observer.fire(Observer.EVENT_NAME.GAME_BEGIN);
                this.feedback(true);
            }
            return;
        }

        if(this.status != EnumUtils.MUSIC_NOTE_STATUS.PREPARE) return;

        let _pos1 = this.node.convertToNodeSpaceAR(pos)
        this.feedback(true,_pos1);
     },
    
    cancelUnit()
    {
        if (GameParamsHelper.gs == EnumUtils.GAME_STATUS.END) return;
        this.feedbackEnd();
     },
    
    start() {
        Observer.registerMass(Observer.EVENT_NAME.RESURRECT, this.checkResurrected, this);

        this.minPressHeight = 136;
        this.distanceInPressToHead = 105;
        this.virtualDeltaInPressTop = GameData.skinCG.virtualDeltaInPressTop;
        this.distanceInPressToPressTop = GameData.skinCG.distanceInPressToPressTop;

        this.touch.on(cc.Node.EventType.TOUCH_START, (event) =>
        {
            this.touchUnit(event.getLocation())
        });


        this.touch.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.cancelUnit();
        })
        this.touch.on(cc.Node.EventType.TOUCH_END, () => {
            this.cancelUnit();
        })
        
    },

    update (dt) {
        if(GameParamsHelper.gs == EnumUtils.GAME_STATUS.PLAYING &&
            GameParamsHelper.autoPlay &&
            this.baseY <= GameData.getBaseMusicY())
        {
            this.feedback(true,cc.v2(0,0));
        }
        
        
        if((this.longStatus == 1 || this.longStatus == 2) && GameParamsHelper.gs == EnumUtils.GAME_STATUS.PLAYING)
        {
            let pressTopTopY = this.press.height + this.realDistanceInPressToPressTop;
            if (pressTopTopY >= this.realHeight)
            {
                this.feedbackEnd();
            }    
            else
            {
                this.press.height += GameParamsHelper.speed * dt;
                pressTopTopY = this.press.height + this.realDistanceInPressToPressTop;
                if (pressTopTopY >= this.realHeight)
                {
                    this.press.height = this.realHeight - this.realDistanceInPressToPressTop;
                }    

                this.pressTop.y = this.press.height + this.distanceInPressToPressTop;
            }
        }

        this.checkTurnSpeed();
        this.checkLose();
        this.checkEnd();
    },

    lateUpdate(dt)
    {
        this.checkNext(true);

        if(this.checkRestore()) this.restore();
    },

    
    onDestroy()
    { 
        Observer.removeMassChild(Observer.EVENT_NAME.RESURRECT, this);
    },
    
    /**
     * @param type      2 : normal    0 : long
     * @param length
     * @param index    -1 : 初始开始块         -2 ： 复活后的初始块
     * @param xIndex
     */
    setData()
    {
        this.block = this.data.block;
        this.isEnd = this.data.isEnd;
        this.speed = this.data.speed;
        this.index = this.data.index;
        this.xIndex = this.data.xIndex;
        this.type = this.block.Type;
        this.bCnt = this.block.bCnt;
        this.length = this.block.length;

        this.longStatus = 0;
        this.isCoinBlock = this.block.coin;
        this.isBpmBlock = this.block.bpm2 > 0;
        this.isColorBlock = this.block.Color > 0;
        this.isMusicBlock = this.index == -1 || this.index == -2;
        this.startNode.opacity = this.isMusicBlock ? 255 : 0;
        this.startNode.y = this.offsetY;

        this.status = EnumUtils.MUSIC_NOTE_STATUS.PREPARE;

        this.scoreLevel = EnumUtils.SCORE_LEVEL.GOOD;

        this.content.opacity = 255;
        this.content.y = this.offsetY;

        this.node.width = this.baseWidth;
        this.node.height = this.length;
        this.node.opacity = 255;

        this.touch.active = true;
        this.touch.width = this.node.width;
        this.touch.height = this.node.height + 40;
        this.touch.y = -20;

        if(this.press)
        {
            this.press.opacity = 0;
            this.pressTop.opacity = 255;
        }

        this.loseCall = 0;
        if (!this.isReset) {
            this.nextCall = this.index == -2 ? 1 : 0;
            
            this.fillBlock();
        }
        this.isReset = false;
    },

    /** 填充音乐块 */
    fillBlock()
    {   
        this.restoreChild();
        
        let _width = this.baseWidth;
        let _height = this.baseHeight;

        this.realHeight = this.length;

        let secondHeight = _height;
        let thirdHeight = _height;
        let firstHeight = _height;
        

        let _y = -_height * 0.5;

        let count = 1;
            
        if (this.bCnt > 2)
        {
            let _l_length = this.realHeight - firstHeight;

            let _cnt_2 = _l_length / _height;
            let _f_cnt_2 = Math.floor(_cnt_2);
            let _external = _cnt_2 - _f_cnt_2;

            if (_external < 0.5)
            {
                _l_length = this.realHeight - firstHeight - thirdHeight;
                secondHeight = _l_length / _f_cnt_2;
            }   
            else
            {
                thirdHeight = _external * _height;  
            }
            
            count = _f_cnt_2 + 2;
        }
        else if (this.bCnt > 1)
        {
            count = 2;
            thirdHeight = (this.bCnt - 1) * _height;
        }
        
        console.log("first : ", firstHeight, "  second : ", secondHeight, "  third :", thirdHeight);
        let _c_idx_in_skin = GameData.indexInSkin;
        let _n_idx_in_skin = GameData.indexInSkin == 0 ? 1 : 0;
        let _c_idx = this.isColorBlock ? Math.floor(count * 0.5) : 1000;

        if(this.isColorBlock) console.log("开始变色 : " ,_c_idx, "  ", count);
        
        this.press.getComponent(cc.Sprite).spriteFrame = GameData.longPressFrame(_c_idx_in_skin);
        this.pressTop.getComponent(cc.Sprite).spriteFrame = GameData.longTopFrame(_c_idx_in_skin);
        
        let _frame = GameData.normalFrame();
        for(let i = 0;i < count;i++)
        {
            if(i == 0)
            {
                _height = firstHeight;
                
                if(count == 1) _frame = GameData.normalFrame(_c_idx_in_skin);
                else _frame = GameData.longFrame1(_c_idx_in_skin);
                
                if (this.isCoinBlock) _frame = GameData.coinFrame();
            }
            else if(i == count - 1)
            {
                _height = thirdHeight;
                _frame = GameData.longFrame3(i <= _c_idx ? _c_idx_in_skin : _n_idx_in_skin);
            }
            else
            {
                _height = secondHeight;
                if (i == _c_idx && this.isColorBlock)
                {
                    _frame = GameData.longTranFrame();
                }
                else
                {
                    _frame = GameData.longFrame2(i <= _c_idx ? _c_idx_in_skin : _n_idx_in_skin);
                }
                
            }

            _y += _height * 0.5;

            let obj = PoolUtil.get(PoolUtil.pool_name.musicChildBlock,true,this.content);

            obj.getComponent("MusicChildBlock").data = {
                y: _y,
                frame: _frame,
                width: _width,
                height : _height,
            }

            this.childList.push(obj);

            _y += _height * 0.5;
        }

        
        if (this.isColorBlock)
        {
            GameData.indexInSkin = GameData.indexInSkin == 0 ? 1 : 0;       
        }
    },

    checkTurnSpeed(_check)
    {
        if (!this.isBpmBlock) return;
        
        if(_check)
        {
            if(this.baseY > GameData.getBaseMusicY()) return;
        }

        this.isBpmBlock = false;
        Observer.fire(Observer.EVENT_NAME.RE_CHANGE_BPM,GameParamsHelper.bpm);
    },

    checkNext(_check)
    {
        if (this.nextCall == 1) return;
        
        if(_check)
        {
            if(this.botY > GameData.musicLayoutConfig.top) return;
        }

        this.nextCall = 1;
        Observer.fire(Observer.EVENT_NAME.GENERATE_NEW_MUSIC_NOTE)
    },

    checkLose()
    {
        if(this.loseCall == 1) return;

        if(!this.isDead()) return;

        this.loseCall = 1;
        Observer.fire("loseBlock",this)
    },

    checkEnd()
    {
        if (this.isEnd &&
            this.isInvisible() &&
            this.status != EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE)
        {
            Observer.fire("gameOver",true);
        }
    },

    isDead()
    {
        return this.status == EnumUtils.MUSIC_NOTE_STATUS.PREPARE && this.isInvisible();
    },

    /** 是否超过屏幕，即将失效 */
    isInvisible()
    {
        return this.topY < GameData.musicLayoutConfig.bot;
    },

    /** 检测是否可以回收 */
    checkRestore()
    {
        return this.topY < GameData.getRestoreY();
    },

    /** 手指按下的反馈 */
    feedback(state,pos)
    {
        if (this.status !== EnumUtils.MUSIC_NOTE_STATUS.PREPARE)
            return false;

        this.status = EnumUtils.MUSIC_NOTE_STATUS.COMPLETE;

        if(GameParamsHelper.vibrate) FacebookUtils.vibrateAction(0.01);

        this.startNode.opacity = 0;

        this.calcScoreLevel();
        
        if(this.isLong)
        {
            this.longStatus = 1;

            this.press.opacity = 255;

            //长块的按压图在手指突出部分
            this.press.height = pos.y + this.distanceInPressToHead;
            
            if (this.press.height < this.minPressHeight)
                this.press.height = this.minPressHeight;
                
            let pressTopTopY = this.press.height + this.realDistanceInPressToPressTop;
            if(pressTopTopY >= this.realHeight)
            {
                this.press.height = this.realHeight - this.realDistanceInPressToPressTop;
                this.pressTop.y = this.press.height + this.distanceInPressToPressTop;
                
                this.feedbackEnd();
            }
            else
            {
                this.trail = PoolUtil.get(PoolUtil.pool_name.trailPrefab, true, this.pressTop);
                this.trail.y = -50; 
                this.trail.x = 0;
            } 
        }
        else
        {
            this.content.scale = 0.82;
            cc.tween(this.content)
                .to(0.2, { opacity: GameData.clickedOpacity,scale : 1 }).start();
            
            if(this.index == -1){}
            else
            {
                Observer.fire(Observer.EVENT_NAME.DISPLAY_MUSIC_NOTE_EFFECT, this);

                Observer.fire(Observer.EVENT_NAME.TOUCH_MUSIC_NOTE_FEEDBACK,true,this.scoreLevel,this);
            }
        }

        if(this.index >= 0 && !this.isCoinBlock) Observer.fire(Observer.EVENT_NAME.GOOD_OR_PERFECT,this.scoreLevel);
    },

    feedbackEnd()
    {
        if(this.longStatus == 0) return;

        if(this.isLong)
        {
            this.longStatus = 0;
            
            let _complete = this.press.height + this.realDistanceInPressToPressTop >= this.realHeight;
            
            if(_complete)
            {
                this.pressTop.opacity = 0;

                this.content.opacity = GameData.clickedOpacity;
                
                this.press.height = this.realHeight;
                cc.tween(this.press)
                    .to(0.3, { opacity: 0 })
                    .start();
            }

            Observer.fire(Observer.EVENT_NAME.TOUCH_MUSIC_NOTE_FEEDBACK, _complete, this.scoreLevel, this);
        }
    },

    calcScoreLevel()
    { 
        let bh = this.baseHeight;
        let by = GameData.getBaseMusicY();
        if (this.baseY >= by - bh * 0.4 && this.baseY <= by + bh * 0.4)
        {
            this.scoreLevel = EnumUtils.SCORE_LEVEL.PERFECT;    
        }
        else //if (this.baseY >= by - bh * 0.375 && this.baseY <= by + bh * 0.375)
        {
            this.scoreLevel = EnumUtils.SCORE_LEVEL.GREAT;    
        }
        // else 
        // {
        //     this.scoreLevel = EnumUtils.SCORE_LEVEL.GOOD;    
        // }
    },
    
    checkResurrected()
    {
        if (this.status == EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE) return;
        
        let _could = this.botY > GameData.getBaseMusicY() + 30;
        if (_could) this.checkReset();
        else 
        {
            this.status = EnumUtils.MUSIC_NOTE_STATUS.COMPLETE;
            this.touch.active = false;
            this.node.opacity = 0;
            this.restoreTrail();
        }
        
    },

    checkReset()
    {
        if (this.status != EnumUtils.MUSIC_NOTE_STATUS.COMPLETE) return;
        
        this.restoreTrail();

        this.isReset = true;
        this.setData();
    },
    
    getWorldPos()
    {
        let pos = this.content.convertToWorldSpaceAR(cc.v2());
        return pos;
    },
    
    getLongTopWorldPos()
    {
        let pos = this.pressTop.convertToWorldSpaceAR(cc.v2());
        return pos;
    },
    
    restore()
    {
        if(this.status == EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE) return;

        this.status = EnumUtils.MUSIC_NOTE_STATUS.INVISIBLE;
        this.startNode.opacity = 0;
        this.isReset = false;

        this.restoreChild();
        this.restoreTrail();

        PoolUtil.restore(PoolUtil.pool_name.musicBlock, this.node);
    },

    restoreChild()
    {
        for(let i = 0;i < this.childList.length;i++)
        {
            let obj = this.childList[i];

            PoolUtil.restore(PoolUtil.pool_name.musicChildBlock,obj);
        }
        this.childList.length = 0;
    },

    restoreTrail()
    {
        if (this.trail) PoolUtil.restore(PoolUtil.pool_name.trailPrefab, this.trail);
        this.trail = null;
    },
});
