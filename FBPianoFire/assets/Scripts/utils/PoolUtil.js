/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-03-07 21:16:33
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-03-24 22:16:52
 * @FilePath: \FBPianoFire\assets\Scripts\utils\PoolUtil.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


module.exports =
{
    pool_name: 
    {
        musicNote: "musicNote",
        musicNoteEffect : "musicNoteEffect",
        musicBlock: "musicBlock",
        musicChildBlock : "musicChildBlock",
        unitMusicPoint: "unitMusicPoint",
        trailPrefab : "trailPrefab",
        addScore : "addScore",
        coin: "coin",
        diamond : "diamond",
    },
    
    poolArray: [],
    register(name, prefab) {

        if (!prefab) return;

        let _poolAbout = this.poolArray[name];
        
        if (_poolAbout) {
            let _idx = this.poolArray.indexOf(_poolAbout);
            _poolAbout.pool.clear();
            _poolAbout.pool = null;
            _poolAbout.prefab = null;
            this.poolArray.splice(_idx, 1);
        }

        this.poolArray[name] = { name: name, pool: new cc.NodePool(), prefab: prefab };
    },

    get(name, _active, _parent,_list) {
        let poolAbout = this.poolArray[name];
        if (poolAbout == null) {
            return null;
        }

        let obj = null;

        if (poolAbout.pool.size() == 0) {
            
            // console.log(name ," : ",1)

            obj = cc.instantiate(poolAbout.prefab);
            if (_list) _list.push(obj);
        }
        else
        {
            obj = poolAbout.pool.get();
            if (!cc.isValid(obj))
            {  
                obj = cc.instantiate(poolAbout.prefab);
            }
            
            if (_list)
            {
                let _idx = _list.indexOf(obj);
                if (_idx == -1) _list.push(obj);
            }
            
        }

        obj.active = _active;
        obj.parent = _parent;

        return obj;
    },

    restore(name, unit) {
        let poolAbout = this.poolArray[name];
        if (poolAbout == null) {
            return null;
        }
        
        if (!unit) return;

        poolAbout.pool.put(unit);
    },

    clear(name)
    {
        let poolAbout = this.poolArray[name];
        if (poolAbout == null) {
            return null;
        }

        poolAbout.pool.clear();
    },
}