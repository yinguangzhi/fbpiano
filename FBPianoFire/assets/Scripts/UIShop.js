// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const GameData = require("./GameData");
const Observer = require("./Observer");
const UIBase = require("./base/UIBase");
const { CURRENCY_BUY_TYPE } = require("./utils/EnumUtils");
const FacebookUtils2 = require("./utils/FacebookUtils2");
const FunUtils = require("./utils/FunUtils");
const StorageUtils = require("./utils/StorageUtils");
const UIUtils = require("./utils/UIUtils");

cc.Class({
    extends: UIBase,

    properties: {
        layout: cc.Node,
        item: cc.Node,

        selectID: 1,
        
        adBtn : cc.Node,
        coinBtn : cc.Node,
        usedBtn : cc.Node,
        unlockBtn: cc.Node,
        
        image: cc.Node,
        coinPriceLabel : cc.Label,
        coinPriceNode : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.setData();
        Observer.register(Observer.EVENT_NAME.DISPLAY_SKIN_IN_SHOP, this.displaySelect, this);
    },

    // update (dt) {},

    onDestroy()
    {
        Observer.removeMass(Observer.EVENT_NAME.USE_SKIN_IN_SHOP);
        Observer.removeMass(Observer.EVENT_NAME.SELECT_SKIN_IN_SHOP);
    },

    setData()
    {
        let arr = GameData.skinDataList;
        this.layout.getComponent("WRGrid").setData(arr);
        
        // for (let i = 0; i < arr.length; i++)
        // {
        //     let cg = arr[i];
            
        //     let obj = cc.instantiate(this.item);
        //     obj.parent = this.layout;
        //     obj.active = true;

        //     FunUtils.WRScript(obj).data = cg;
        // }
        
        this.scheduleOnce(() =>
        {
            let _id = StorageUtils.getItem(StorageUtils.USER_PROPERTY.skin, 1);
            Observer.fireMass(Observer.EVENT_NAME.SELECT_SKIN_IN_SHOP, _id);
            Observer.fireMass(Observer.EVENT_NAME.USE_SKIN_IN_SHOP, _id);
            this.displaySelect(_id);
        },0)
    },

    displaySelect(_id)
    { 
        this.selectID = _id;

        let cg = GameData.getSkinConfig(this.selectID);
        let _usedID = StorageUtils.getItem(StorageUtils.USER_PROPERTY.skin);
        let _unlock = StorageUtils.isSkinUnlock(cg.id) || cg.currencyType == CURRENCY_BUY_TYPE.FREE;

        this.unlockBtn.active = _unlock && this.selectID != _usedID;
        this.coinBtn.active = !_unlock && cg.currencyType == CURRENCY_BUY_TYPE.COIN;
        this.adBtn.active = !_unlock && cg.currencyType == CURRENCY_BUY_TYPE.AD;
        this.usedBtn.active = _unlock && _usedID == this.selectID;

        this.image.getComponent("AssetUrl").url = "image/" + cg.frame;
        this.coinPriceNode.label.string = cg.price;
    },
    
    displayUse()
    {
        this.displaySelect(this.selectID);
        console.log("USE_SKIN_IN_SHOP");
        Observer.fireMass(Observer.EVENT_NAME.USE_SKIN_IN_SHOP, this.selectID);
    },
    
    
    useAction()
    {
        let cg = GameData.getSkinConfig(this.selectID);
        
        if (StorageUtils.isSkinUnlock(cg.id) || cg.currencyType == CURRENCY_BUY_TYPE.FREE)
        {
            StorageUtils.saveItem(StorageUtils.USER_PROPERTY.skin, cg.id);
            this.displayUse();
            return;    
        }
        
        if (cg.currencyType == CURRENCY_BUY_TYPE.DIAMOND)
        {
            let diamond = StorageUtils.getItem(StorageUtils.USER_PROPERTY.diamond, 0);
            if (cg.price > diamond)
            {
                UIUtils.displayUI("DiamondPop", null, true, true, null);
                return;    
            }

            StorageUtils.saveItem(StorageUtils.USER_PROPERTY.diamond, -cg.price, true);
            StorageUtils.saveItem(StorageUtils.USER_PROPERTY.skin, cg.id);

            this.displayUse();
        }
        else if (cg.currencyType == CURRENCY_BUY_TYPE.COIN)
        {
            let coin = StorageUtils.getItem(StorageUtils.USER_PROPERTY.coin, 0);
            if (cg.price > coin)
            {
                UIUtils.displayUI("CoinPop", null, true, true, null);
                return;    
            }
            
            StorageUtils.saveItem(StorageUtils.USER_PROPERTY.coin, -cg.price, true);
            StorageUtils.saveItem(StorageUtils.USER_PROPERTY.skin, cg.id);

            this.displayUse();
        }
        else if (cg.currencyType == CURRENCY_BUY_TYPE.AD)
        {
            FacebookUtils2.displayVideoFromExternal(true, (state) =>
            {
                if (state)
                {
                    StorageUtils.saveItem(StorageUtils.USER_PROPERTY.skin, cg.id);

                    if(this) this.displayUse();
                }
            })
        }
    },
});
