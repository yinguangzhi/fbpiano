
module.exports = {

    assetMap : {},
    assetTaskMap :[],

    loadAssetAsync(url,type,callback)
    {
        
        return new Promise((resolve,reject) =>
        {
            let arg = this.assetMap[url];

            if(arg && arg.asset) resolve(arg.asset);
            else
            {
                cc.resources.load(url,type,(error,asset) =>
                {
                    // console.log(asset);
                    if(error)
                    {
                        reject(error)
                    }
                    else
                    {
                        this.assetMap[url] = {url : url,asset : asset};
                        resolve(asset);
                    }
                })
            }
            
        })
    },

    beginPreLoad(title)
    {
        this.checkPreLoad(title);
    },

    checkPreLoad(title)
    {
        let tasks = this.assetTaskMap[title];
        if(!tasks || tasks.length == 0) return;

        let arg = tasks[0];

        let delayCall = (asset) =>
        {
            arg && arg.callback && arg.callback(asset);
            
            tasks.splice(0,1);

            setTimeout(() => {
                this.checkPreLoad(title);
            }, arg.interval * 1000);
        }

        this.loadAssetAsync(arg.url,arg.type,null)
            .then((asset) =>
            {   
                delayCall(asset);
            })
            .catch((error) =>
            {
                delayCall(null);
            })
            
    },

    /**
     * @description 添加预加载任务
     * @param {任务标志} title 
     * @param {路径} url 
     * @param {类型} type 
     * @param {该资源加载完后，过多久可以加载下一个} interval 
     * @param {*} callback 
     * @returns 
     */
    addAsset(title,url,type,interval,callback)
    {
        let tasks = this.assetTaskMap[title];
        if (!tasks)
        {
            this.assetTaskMap[title] = [];
            tasks = this.assetTaskMap[title];
        }
        
        let find = tasks.find(element => element.url == url);
        if(find)
        {
            console.log(url + " is existed !!!");
            return;
        }

        let arg = {
            title : title,
            url : url,
            type : type,
            interval : interval,
            callback : callback,
        }

        tasks.push(arg);
    },

    isPreloaded(url)
    {
        return this.assetMap[url] != null;
    },
}
