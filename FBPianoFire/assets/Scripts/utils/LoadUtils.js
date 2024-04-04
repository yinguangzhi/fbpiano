const ConsoleUtils = require("./ConsoleUtils");

module.exports =
{
    assetMap : {},

    loadAssetRes(url, type, parent, active, callback, addRefCnt) {
        this.loadAsset(url, type, (prefab) => {
            let obj = null;

            if (cc.isValid(parent) && cc.isValid(prefab)) {
                obj = cc.instantiate(prefab);
                obj.active = active;
                obj.parent = parent;

                obj.position = cc.v2(0, 0)
            }
            if (callback) callback(obj);
        }, addRefCnt);
    },

    loadAsset(url, type, callback, addRefCnt) {

        let _find = this.assetMap[url];

        if (!_find || !cc.isValid(_find.asset)) {
            if (_find) {
                this.assetMap[url] = null;
            }

            let ret = null;

            cc.resources.load(url, type, (err, asset) => {

                if (!err)
                {
                    ret = asset;
                    _find = { url: url, asset: asset };
                    this.assetMap[url] = _find;
                    if (addRefCnt && addRefCnt > 0) {
                        for (let i = 0; i < addRefCnt; i++) _find.asset.addRef();
                    }
                }
                if (callback) callback(ret);
            });
        }
        else {
            if (addRefCnt && addRefCnt > 0) {
                // ConsoleUtils.log("addRefCnt : ", addRefCnt);
                for (let i = 0; i < addRefCnt; i++) _find.asset.addRef();
            }
            if (callback) callback(_find.asset);
        }
    },

    setAsset(url,asset)
    { 
        this.assetMap[url] =  { url: url, asset: asset };
    },
    
    loadAssets(folder, type, callback, addRefCnt) {
        cc.resources.loadDir(folder, type, (error, assets) => {

            if (callback) {
                if (error) callback(null);
                else callback(assets);
            }
        })
    },

    loadArrayAssets(paths, type, callback, addRefCnt) {
        cc.resources.load(paths, type, (error, assets) => {

            if (callback) {
                if (error) callback(null);
                else callback(assets);
            }
        })
    },

    /**
     * 释放资源数组
     * @param assets 要释放的asset数组
     * @param _thorough 是否彻底释放
     */
    releaseArray(assets, _thorough) {
        if (assets.length == 0) return;

        for (let i = 0; i < assets.length; ++i) {
            this.releaseAsset(assets[i], _thorough);
        }
    },

    /**
     * 直接通过asset释放资源（如cc.Prefab、cc.SpriteFrame）
     * @param asset 要释放的asset
     */
    releaseAssetImmediate(asset) {
        if (!asset) return;

        cc.assetManager.releaseAsset(asset);
    },

    /**
     * 释放冗余资源，使资源的引用数变为1
     */
    releaseAssetRedundancy(assets) {

        if (assets.length == 0) return;

        for (let i = 0; i < assets.length; ++i) {

            let url = assets[i];
            let _find = this.assetMap[url];

            if (!this.isEmpty(_find) && cc.isValid(_find.asset)) {

                let _cnt = _find.asset.refCount;

                if (_cnt > 1) {
                    for (let i = 1; i < _cnt; i++) {
                        _find.asset.decRef();
                    }
                }
                // ConsoleUtils.log("  leave ref dec :  ", url, "  :   ", _find.asset.refCount);
            }
        }

    },

    /**
     * 释放资源
     * @param assets 要释放的asset
     * @param _thorough 是否彻底释放
     */
    releaseAsset(url, _thorough) {

        let _find = this.assetMap[url];

        if (!this.isEmpty(_find) && cc.isValid(_find.asset)) {

            if (_thorough) {
                let _cnt = _find.asset.refCount;

                if (_cnt > 0) {
                    for (let i = 0; i < _cnt; i++) {
                        _find.asset.decRef();
                    }
                }

            }
            else _find.asset.decRef();
            // ConsoleUtils.log("  leave ref dec :  ", url, "  :   ", _find.asset.refCount);
        }
    },

    loadAssetAsync(url, type, callback, addRefCnt)
    {
        return new Promise((resolve, reject) =>
        {
            let _find = this.assetMap[url];

            if (!_find || !cc.isValid(_find.asset))
            {
                cc.resources.load(url, type, (err, asset) => {
                  
                    if (!err)
                    {
                        _find = { url: url, asset: asset };
                        this.assetMap[url] = _find;
                    
                        if (addRefCnt && addRefCnt > 0) {
                            for (let i = 0; i < addRefCnt; i++) asset.addRef();
                        }
                    
                        resolve(asset);
                    }
                    else reject(err);
                });
            }
            else
            {
                if (addRefCnt && addRefCnt > 0)
                {
                    for (let i = 0; i < addRefCnt; i++) _find.asset.addRef();
                }
                resolve(_find.asset);
            }
        })
     },
    
    
    loadAssetResAsync(url, type,active,parent, callback, addRefCnt)
    { 
        return new Promise((resolve, reject) =>
        {
            this.loadAssetAsync(url, type, callback, addRefCnt)
                .then((asset) =>
                {
                    let obj = cc.instantiate(asset);
                    obj.active = active;
                    obj.parent = parent;

                    obj.position = cc.v2(0, 0);
                    resolve(obj);
                })
                .catch((err) =>
                {
                    reject(err);
                })
        })
    },
    
    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}
