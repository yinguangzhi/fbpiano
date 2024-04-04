

const WRScript = require("./WRScript");
const UIUtils = require("../utils/UIUtils");
const AudioUtils = require("../utils/AudioUtils");

cc.Class({
    extends: WRScript,

    properties: {
        content : cc.Node,
        elements: [],
        
        isAnima: true,
        isCloseAnima: true,
        isTouchClose: false,
        
        inClosing: false,
        inLockClosing: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.inClosing = false;
        this.inLockClosing = false;
        
        this.elements = {};
        // this.binderElements(this.node);

        if (this.isAnima) this.display();
        
        let touch = this.node.children[0];
        if (touch.name == "touch" && this.isTouchClose)
        {
            let moveDistance = 0;
            let startPos = cc.v2();
            let endPos = cc.v2();
            touch.on(cc.Node.EventType.TOUCH_START, (event) =>
            {
                startPos = event.touch.getLocation();
                endPos = event.touch.getLocation();
                moveDistance = 0;
            },this);

            
            touch.on(cc.Node.EventType.TOUCH_MOVE, function (event)
            {
                endPos = event.touch.getLocation();
            }, this);


            let cancel = (event) =>
            {
                
                endPos = event.touch.getLocation();
                let distance = cc.Vec2.distance(startPos,endPos);
        
                if (distance > 20) return;
                
                this.closeFromTouch();
            };

            // node.on(cc.Node.EventType.TOUCH_CANCEL, cancel,this)
            touch.on(cc.Node.EventType.TOUCH_END, cancel,this)  
        }
        
    },

    start () {

    },

    // update (dt) {},

    binderElements(note,path)
    {
        if (!path) path = ""; 
        
        let _children = note.children;
        if (_children.length == 0) return;
        
        for (let i = 0; i < _children.length; i++)
        {
            let arg = _children[i];
            let _secondPath = path + arg.name;

            if (this.elements[_secondPath])
            {
                let _sib = i;
                _secondPath += "(ssd_clone_" + _sib + ")";
            }
            
            this.elements[_secondPath] = arg;

            this.binderElements(arg, _secondPath + "/");
        }
        
    },

    setData()
    { 
        
    },
    
    /**
     * @description 播放界面展示动画
     */
    display()
    {
        if (this.content)
        {
            this.lockClose(0.3);
            
            this.content.scale = 0;
            cc.tween(this.content)
                .to(0.2, { scale: 1.2 })
                .to(0.08, { scale: 1 })
                .call(this.onDisplay)
                .start();
        }
        
    },

    displayClose(_callback)
    { 
        if (this.content)
        {
            this.content.stopAllActions();
            
            if (this.isCloseAnima)
            {
                cc.tween(this.content)
                    .to(0.2, { scale: 1.25,opacity : 40 })
                    .call(() =>
                    {
                        _callback && _callback();
                    })
                    .start();
            }
            else
            {
                _callback && _callback();
            }
        }
        else
        {
            _callback && _callback();
        }
        
        
    },
    
    onDisplay()
    {

    },
    
    /**
     * @description 冻结关闭行为
     * @param {*} _time 
     */
    lockClose(_time)
    {
        this.inLockClosing = true;
        if (_time >= 0) 
        {
            this.scheduleOnce(() =>
            {
                this.reLockClose();
            },_time)    
        }
    },

    /**
     * @description 恢复关闭行为
     * @param {*} _time 
     */
    reLockClose()
    {
        this.inLockClosing = false;
    },

    close()
    {
        // if (!Observer.fireInterval("click", 500)) return;
        
        if (this.inLockClosing) return;

        this.close2();
    },

    /**
     * @description 点击背景关闭界面
     */
    closeFromTouch()
    {
        // if (!Observer.fireInterval("click", 500)) return;
        
        this.close2();
    },

    close2()
    {
        if (this.inLockClosing) return;
        if (this.inClosing) return;

        this.inClosing = true;
        
        
        this.displayClose(() =>
        {
            this.inClosing = false;
            UIUtils.hideUI(this.node.name);

            this.endCall && this.endCall();
        })
        
    },

    /**
     * @description 界面是否有用或是可操作
     * @returns 
     */
    isValid()
    {
        return !this.inClosing;
    }
});
