// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        prefab : cc.Prefab,
        virtualPrefab : cc.Node,

        layout : cc.Node,
        scrollView : cc.ScrollView,
        pageView : null,

        ssdRenders: null,

        bufferNumber : 6,
        repeatNumber : 1,
        paddingTop : 0,
        paddingBottom : 0,
        paddingLeft : 0,
        paddingRight : 0,

        cellWidth : 0,
        cellHeight : 0,
        spaceX : 0,
        spaceY : 0,

        isVertical : true,
        isHorizontalAxis : true,
        isMoreThenBuffer : false,
    
        data : null,

        lastIndex : -1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if(!this.layout)
        {
            this.layout = this.node;
        }

        if(this.scrollView)
        {
            // this.scrollView.direction = this.isVertical ?  cc.PageView.Direction.Vertical : PageView.Direction.Horizontal;
            this.pageView = this.scrollView.node.getComponent(cc.PageView);
            if(this.pageView)
            {
                // console.log(pageView.getPages());
            }
        }

        
        this.schedule(this.onTimer, 0.05);
    },

    start () {

    },

    // update (dt) {},

    setData(_data,_buffNumber)
    {
        if(!this.isDataValid(_data))
        {
            return;
        }

        this.data = _data;
        for (let i = 0; i < this.data.length; i++)
        {
            if (this.data[i])
            {
                this.data[i]['__index'] = i;
            }
        }

        if(_buffNumber && _buffNumber > 0) this.bufferNumber = _buffNumber;

        this.generate();

        let pageView = this.scrollView.node.getComponent(cc.PageView);
            if(pageView)
            {
                // console.log(pageView.getPages());
            }
    },

    onTimer()
    {
        if(this.data == null) return;
        if(this.ssdRenders == null) return;
        if(this.scrollView == null) return;
        if(!this.isMoreThenBuffer) return;

        this.updateCell();
    },

    generate()
    {
        if(!this.ssdRenders)
        {
            this.ssdRenders = [];
        }

        this.lastIndex = -1;

        if(!this.isDataValid(this.data)) 
        {
            for (let i = 0; i < this.ssdRenders.length; i++)
            {
                let render = this.ssdRenders[i];
                if(render) render.ssdData = null;
            }
            return;
        }

        this.generateBuffer();

        this.isMoreThenBuffer = this.bufferNumber < this.data.length;

        for (let i = 0; i < this.ssdRenders.length; i++) 
        {
            if(!this.ssdRenders[i]) continue;

            this.ssdRenders[i].data = null;
            this.ssdRenders[i].node.active = false;
        }

        let rowCount = Math.ceil(this.data.length / this.repeatNumber);
        let colCount = Math.min(this.data.length, this.repeatNumber);

        let _disX = this.cellWidth + this.spaceX;
        let _disY = this.cellHeight + this.spaceY;
        let _total_width = _disX;
        let _total_height = _disY;

        if(this.isVertical)
        {
            _total_width = colCount * _disX - this.spaceX + this.paddingLeft + this.paddingRight;
            _total_height = rowCount * _disY - this.spaceY + this.paddingTop + this.paddingBottom;
        }
        else
        {
            _total_width = rowCount * _disX - this.spaceX + this.paddingLeft + this.paddingRight;
            _total_height = colCount * _disY - this.spaceY + this.paddingTop + this.paddingBottom;
        }

        this.layout.width = _total_width;
        this.layout.height = _total_height;

        this.updateCell();
    },

    generateBuffer()
    {
        _isn = typeof this.repeatNumber == "number";
        this.repeatNumber = this.repeatNumber == 0 || !_isn ? 1 : this.repeatNumber;

        let _isn = typeof this.bufferNumber == "number";
        if(this.bufferNumber == 0 || !_isn) 
        {
            this.bufferNumber = this.data.length;
        }

        if(this.ssdRenders.length >= this.bufferNumber)
        {
            return;
        }

        if(this.virtualPrefab) this.virtualPrefab.active = false;
        for(let i = this.ssdRenders.length;i < this.bufferNumber;i++)
        {
            let obj = this.virtualPrefab ? cc.instantiate(this.virtualPrefab) : cc.instantiate(this.prefab);
            
            if(this.pageView) this.pageView.addPage(obj);
            else obj.parent = this.layout;

            obj.active = true;

            let ren = obj.getComponent("WRRender");
            if(!ren) 
            {
                ren = obj.getComponent(cc.Component);
            }
            
            this.ssdRenders.push(ren);

            this.cellHeight = obj.height;
            this.cellWidth = obj.width;

            this.setCellPos(ren,i,0,0);

            if (this.ssdRenders.length >= this.bufferNumber) 
            {
                break;
            }
        }
        
        // console.log(this.ssdRenders)
    },

    updateCell()
    {
        let disX = this.cellWidth + this.spaceX;
        let disY = this.cellHeight + this.spaceY;

        let offsetX = 0;
        let offsetY = 0;
        let maxOffset = Math.floor((this.data.length - this.bufferNumber) / this.repeatNumber);
        if(this.isVertical)
        {
            offsetY = this.scrollView.getScrollOffset().y;
            offsetY = Math.floor((offsetY - this.paddingTop) / disY);

            //上下滑动时，循环的时候，补充的更及时，减少出现漏洞
            offsetY -= 1;
            
            offsetY = Math.min(offsetY, maxOffset);
            offsetY = Math.max(offsetY, 0);
        }
        else
        {
            offsetX = -this.scrollView.getScrollOffset().x;
            offsetX = Math.floor((offsetX - this.paddingLeft) / disX);
            offsetX = Math.min(offsetX, maxOffset);
            offsetX = Math.max(offsetX, 0);
        }

        let offsetT = this.isVertical ? offsetY : offsetX;
        // console.log(offsetT + "  " + this.lastIndex);
        if(offsetT != this.lastIndex)
        {
            let _length = this.ssdRenders.length;
            this.lastIndex = offsetT;
            offsetT *= this.repeatNumber;

            let lastIndexs = this.getLastIndexs(offsetT);
            for (let i = 0; i < _length; i++)
            {
                let _idx = i + offsetT;
                let dataIndex = this.data.length > _idx ? this.data[_idx].__index : null;
            
                if (dataIndex != null) 
                {
                    let renderIndex = lastIndexs[dataIndex] != null ? lastIndexs[dataIndex] : this.getNullIndex();
                    if (renderIndex !== -1) 
                    {
                        let render = this.ssdRenders[renderIndex];
                        if (render != null) 
                        {
                            if(this.isVertical) this.setCellPos(render,i,offsetX,offsetT);
                            else this.setCellPos(render,i,offsetT,offsetY);
                            
                            render.node.active = this.data.length > _idx;
                            render.externalData = "";

                            render.indexInList = _idx;
                            render.data = this.data[_idx];
                            // if (this._renderhandle) {
                            //     this._renderhandle.run(render.node, render.data, renderIndex);
                            // }

                            // render.select = i + offsetT === this._selectIndex;
                        }
                    }
                }
            }
        }
    },

    setCellPos(render,i,offsetX,offsetY)
    {
        let disX = this.cellWidth + this.spaceX;
        let disY = this.cellHeight + this.spaceY;
        if (this.isVertical)
        {
            if(this.repeatNumber == 1) render.node.x = 0;
            else render.node.x = this.cellWidth * 0.5 + disX * ((i + offsetY) % this.repeatNumber);

            render.node.y = -this.cellHeight * 0.5 - disY * Math.floor((i + offsetY) / this.repeatNumber) - this.paddingTop;
            // if (this.isReverY) 
            // {
            //     render.node.y = -render.node.y;
            // }
        } 
        else 
        {
            
            render.node.x = this.cellWidth * 0.5 + disX * Math.floor((i + offsetX) / this.repeatNumber) + this.paddingLeft;

            if(this.repeatNumber == 1) render.node.y = 0;
            else render.node.y = -this.cellHeight * 0.5 - disY * ((i + offsetX) % this.repeatNumber) - this.paddingTop;
        }
    },

    isDataValid(_data)
    {
        if(!_data)
        {
            return false;
        }
        
        let isArray = _data instanceof Array;
        if(!isArray)
        {
            return false;
        }
        return true;
    },
    
    getLastIndexs(index) {
        let lastIndexs = {};
        let length = this.ssdRenders.length;

        for (let i = 0; i < length; i++)
        {
            let renderData = this.ssdRenders[i].data;

            if(renderData == null)
            {
                continue;
            }

            let _dataIndex = renderData['__index'];
            if (_dataIndex < index || _dataIndex >= index + length)
            {
                if (this.bufferNumber !== 0) 
                {
                    this.ssdRenders[i].data = null;
                }
            }
            else 
            {
                lastIndexs[_dataIndex] = i;
            }
        }

        return lastIndexs;
    },

    getNullIndex()
    {
        for (let i = 0; i < this.ssdRenders.length; i++) 
        {
            if (this.ssdRenders[i].data == null) 
            {
                return i;
            }
        }
        return -1;
    }
});
