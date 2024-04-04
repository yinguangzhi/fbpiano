const ConsoleUtils = require("./utils/ConsoleUtils");
const { CURRENCY_BUY_TYPE } = require("./utils/EnumUtils");

module.exports = 
{
    selectMusicToggleData: null,
    
    /** 点击后的音乐块的透明度 */
    clickedOpacity: 40,

    /** 该皮肤的哪个阶段，用于变色 */
    indexInSkin: 0,
    
    perfectCount: 0,
    goodCount: 0,
    
    coin : 0,
    
    isInGameScene()
    {
        return cc.director.getScene().name == "game2";
    },

    musicLayoutConfig:
    {
        count : 0,
        width : 0 ,
        height : 0,
        singleLongTopScale : 0,
        baseWidth : 0,
        baseHeight : 0,
        perFrame : 0,
        top : 0,
        bot : 0,

        speed : 0,
        xLayouts : [],

        baseLength : 16,
        frameLength: 200,
        baseY : 0,
    },
    

    /**
     * @description     生成音乐布局配置
     * @param {*} width 屏幕宽度，可放置四个音乐块(X轴)
     * @param {*} top   在屏幕的可见区域 块的顶部
     * @param {*} base  音乐基准点
     * @param {*} bot   在屏幕的可见区域 块的低部
     * @param {*} count 一个屏幕的中可放置的音乐块的个数(Y轴)
     */
    generateMusicLayoutConfig()
    {
        this.musicLayoutConfig.top = cc.winSize.height * 0.5;
        this.musicLayoutConfig.bot = -cc.winSize.height * 0.5;

        this.musicLayoutConfig.width = cc.winSize.width;
        this.musicLayoutConfig.height = cc.winSize.height;

        let xCount = 4;
        let yCount = 4;
        this.musicLayoutConfig.baseWidth = this.musicLayoutConfig.width / xCount;
        this.musicLayoutConfig.baseHeight = this.musicLayoutConfig.height / yCount;
        
        this.musicLayoutConfig.xLayouts = [];
        let ci = (xCount - 1) * 0.5;
        for (let i = 0; i < xCount; i++)
        {
            let _x = Math.round((i - ci) * this.musicLayoutConfig.baseWidth);
            this.musicLayoutConfig.xLayouts.push(_x);
        }
        
        this.musicLayoutConfig.baseY = this.musicLayoutConfig.bot + this.musicLayoutConfig.height * 0.25;
        // [-270,-90,90,270];
        ConsoleUtils.log(this.musicLayoutConfig)
    },

    getBaseMusicY()
    {
        return this.musicLayoutConfig.baseY;
    },

    refreshRuntimeSpeed(bpm)
    {
        this.musicLayoutConfig.speed = this.getTempRuntimeSpeed(bpm);
        return this.musicLayoutConfig.speed;
    },

    getTempRuntimeSpeed(bpm)
    {
        return (bpm * 2 * this.musicLayoutConfig.baseHeight) / 60;
    },

    getLocalLength(length)
    {
        return length * this.musicLayoutConfig.baseHeight;
    },

    getXPosByIndex(_idx)
    {
        return this.musicLayoutConfig.xLayouts[_idx];
    },

    setCurrSkinCG(_id)
    {
        this.skinCG = this.skinConfigArr.find(element => element.id == _id);
        return this.skinCG;
    },

    /** 回收的y值 */
    getRestoreY()
    { 
        return this.musicLayoutConfig.bot - this.musicLayoutConfig.baseHeight;
    },
    
    skinCG : null,
    skinConfigArr:
        [
            {
                id : 1,
                distanceInPressToPressTop: 88,
                virtualDeltaInPressTop : 0,
            },
            {
                id : 2,
                distanceInPressToPressTop : 88,
                virtualDeltaInPressTop : 14,
            },
            {
                id : 3,
                distanceInPressToPressTop : 88,
            },
            {
                id : 4,
                distanceInPressToPressTop : 88,
            }
        ],
    frameNames: [
        "block_01", "block_02", "block_03", "block_04", "block_press_01", "block_press_02",
        "coinBlock","block__00",
        "block_01_1", "block_02_1", "block_03_1", "block_04_1", "block_press_01_1", "block_press_02_1",
    ],
    frameMap: {
        normalFrame: null,
        longFrame1: null,
        longFrame2: null,
        longFrame3: null,
        longTopFrame: null,
        longPressFrame : null,
        coinFrame : null,
    },

    normalFrame(_idx = 0)
    {
        return _idx == 0 ? this.frameMap["block_01"] : this.frameMap["block_01_1"];
    },
    
    longFrame1(_idx = 0)
    {
        return _idx == 0 ? this.frameMap["block_02"] : this.frameMap["block_02_1"];
    },
    
    longFrame2(_idx = 0)
    {
        return _idx == 0 ? this.frameMap["block_03"] : this.frameMap["block_03_1"];
    },
    
    longFrame3(_idx = 0)
    {
        return _idx == 0 ? this.frameMap["block_04"] : this.frameMap["block_04_1"];
    },

    longTranFrame()
    {
        return this.frameMap['block__00'];
    },
    
    longTopFrame(_idx = 0)
    {
        return _idx == 0 ? this.frameMap["block_press_01"] : this.frameMap["block_press_01_1"];
    },
    
    longPressFrame(_idx = 0)
    {
        return _idx == 0 ? this.frameMap["block_press_02"] : this.frameMap["block_press_02_1"];
    },

    coinFrame(_idx = 0)
    {
        return this.frameMap["coinBlock"];
    },

    // type :         购买的东西是金币还是钻石，      1 钻石   2 金币
    // reward :       购买到的金币或是钻石的数量
    // currencyType : 使用的货币类型                 0 免费   1 钻石     2 金币     3 广告      4 钱
    // price :        价格
    // limit :        购买的次数限制                -1 无限制
    buyDataList:
        [
            {id : 1,type : 2,icon : "",reward : 100,currencyType : 0,price : 0,limit : 1,frame : null},
            {id : 2,type : 2,icon : "",reward : 100,currencyType : 1,price : 1,limit : -1,frame : null},
            {id : 3,type : 2,icon : "",reward : 1100,currencyType : 1,price : 10,limit : -1,frame : null},
            {id : 4,type : 2,icon : "",reward : 12999,currencyType : 1,price : 100,limit : -1,frame : null},
            {id : 5,type : 1,icon : "",reward : 5,currencyType : 0,price : 0,limit : -1,frame : null},
        ],
    
    getBuyDataArrByType(_type)
    {
        let temps = [];
        for (let i = 0; i < this.buyDataList.length; i++)
        {
            let cg = this.buyDataList[i];
            if (cg.type == _type)
            {
                temps.push(cg);
            }
        }
        return temps;
    },

    skinDataList:
        [
            {id : 1,icon : "icon",currencyType : CURRENCY_BUY_TYPE.FREE,price : 10,frame : "icon"},
            {id : 2,icon : "icon",currencyType : CURRENCY_BUY_TYPE.AD,price : 10,frame : "icon"},
            {id : 3,icon : "icon",currencyType : CURRENCY_BUY_TYPE.AD,price : 10,frame : "icon"},
            {id : 4,icon : "icon",currencyType : CURRENCY_BUY_TYPE.COIN,price : 600,frame : "icon"},
        ],
    
    getSkinConfig(_id)
    { 
        let arg = this.skinDataList.find(element => element.id == _id);
        return arg ? arg : this.skinDataList[0];
    },
    
}