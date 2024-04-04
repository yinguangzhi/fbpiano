const ConsoleUtils = require("./ConsoleUtils");

module.exports = {

    findChild(_note,_name)
    {
        if (!_note) return null;
        return _note.getChildByName(_name);
    },

    WRScript(_note)
    { 
        if (!_note) return null;
        return _note.getComponent("WRScript");
    },

    /** 整数随机 */
    randInt(min, max)
    {
        let _val = Math.floor(Math.random() * (max - min) + min);
        return _val;
    },

    /** 浮点数随机 */
    randFloat(min, max)
    {
        return Math.random() * (max - min + 1) + min;
    },

    getTodayString()
    {
        let now = new Date();

        let year = now.getFullYear();       //年
        let month = now.getMonth() + 1;     //月
        let day = now.getDate();            //日

        let arg = year + "-" + this.fix2(month) + "-" + this.fix2(day);

        return arg;
    },

    fix2(num)
    {
        return num < 10 ? ("0" + num) : ("" + num);
    },

    getNowTime() {
        let now = new Date();
        return now.getTime() / 1000;
    },

    clone(from, to) {
        if (!to) to = {};
        for (let key in from) {
            to[key] = from[key];
        }
        return to;
    },

    /** 是否在数组内 */
    isInArray(arr,val)
    {
        return arr.indexOf(val) >= 0;
    },

    removeArrayFromArray(array,deleteArr)
    {
        if (!array) return;
        if (array.length == 0) return;

        if (!deleteArr) return;
        if (deleteArr.length == 0) return;

        while (true)
        {
            let k = deleteArr[0];
            this.removeFromArray(array, k);
            deleteArr.splice(0, 1);

            if (deleteArr.length == 0) break;
        }
    },

    /** 从列表中移除某个元素 */
    removeFromArray(arr,obj,_setNull = false)
    {
        if (!arr) return false;

        if (arr.length == 0) return false; 

        let _idx = arr.indexOf(obj);
        if (_idx == -1) return false;

        if (_setNull)
        {
            arr[_idx] = null;
        }
        else
        {
            arr.splice(_idx, 1);
        }    
        return true;
    },


    /** 随机排序 */
    sortByRandom(list)
    {
        list.sort(() => {
            return Math.random() > 0.5 ? 1 : -1;
        });
    },

    widthDevice: false,//是否是宽屏设备
    realSize: { width: 720, height: 1280 },
    /** 计算屏幕分辨率 */
    calcFrameSize() {
        let frameSize = cc.view.getFrameSize();
        let frameRate = frameSize.height / frameSize.width;

        let designSize = { width: 720, height: 1280 };
        let designRate = designSize.height / designSize.width;

        this.widthDevice = frameRate < designRate;//宽屏设备


        let realHeight = designSize.height;
        if (frameRate > designRate) {
            realHeight = frameSize.height * designSize.width / frameSize.width;
        }

        this.realSize.width = designSize.width;
        this.realSize.height = realHeight;

        ConsoleUtils.log(this.realSize);
        return { width: designSize.width, height: realHeight };
    },

    /**
     * @description 将from节点下的pos 转化到 to节点之下
     * @param {*} _from 
     * @param {*} _to 
     * @param {*} _pos 
     * @returns 
     */
    convertPos(_from,_to,_pos)
    {
        if (!_from || !_to) return cc.v2();
        
        let _w_pos = _from.convertToWorldSpaceAR(_pos);
        return _to.convertToNodeSpaceAR(_w_pos);
    },

    // 保存字符串内容到文件。
    // 效果相当于从浏览器下载了一个文件到本地。
    // text - 要保存的文件内容
    // name - 要保存的文件名
    saveFromBrowser(text, name) {
        if (cc.sys.isBrowser) {
            let textFileAsBlob = new Blob([text], { type: 'application/json' });
            let downloadLink = document.createElement("a");
            downloadLink.download = name;
            downloadLink.innerHTML = "Download File";

            if (window.webkitURL != null) {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                // downloadLink.pathname = "D:/CocosCreatorProject/BeatFireFolder/copy/BeatFire20201020/assets/resources/Json"
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    },

    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}