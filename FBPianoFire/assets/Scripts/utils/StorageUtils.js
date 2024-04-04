
const ConsoleUtils = require("./ConsoleUtils");
const FacebookUtils = require("./FacebookUtils");


module.exports =
{
    SAVE_PATH:
    {
        MUSIC_DATA: "MUSIC_DATA",
        USER_DATA : "USER_DATA",
    },

    USER_PROPERTY:
    {
        diamond : "diamond",
        coin : "coin",
        star : "star",
        grade: "grade",
        vibrate : "vibrate",
        music : "music",
        audio : "audio",
        guide: "guide",
        shortcutTime : "shortcutTime",
        shortcutState: "shortcutState",
        skin : "skin",
        skins : "skins",
        dailyTime: "dailyTime",
        dailyDay : "dailyDay",
        freeRewardTime: "freeRewardTime",
    },
    
    musicData : null,
    userData: null,

    commonSaveUserData(_data)
    {
        if (!_data) _data = this.userData;

        this.__saveData(this.SAVE_PATH.USER_DATA, _data,true);

        return _data;
    },

    saveItem: function (_type, _val, _delaySave) {

        let _data = this.userData;
        this.checkDataProperty(_data, _type, 0);

        switch (_type) {
            case this.USER_PROPERTY.shortcutTime:
            case this.USER_PROPERTY.vibrate:
            case this.USER_PROPERTY.music:
            case this.USER_PROPERTY.audio:
            case this.USER_PROPERTY.dailyTime:
            case this.USER_PROPERTY.dailyDay:
            case this.USER_PROPERTY.guide:
            case this.USER_PROPERTY.freeRewardTime:
                _data[_type] = _val;
                break;
            case this.USER_PROPERTY.coin:
            case this.USER_PROPERTY.star:
            case this.USER_PROPERTY.diamond:
                _data[_type] += _val;
                break;
            case this.USER_PROPERTY.skin:
                _data[_type] = _val;
                if (_data.skins)
                {
                    let _idx = _data.skins.indexOf(_val);
                    if (_idx == -1) _data.skins.push(_val);
                }
                
                break;
            
        }

        if (_delaySave) return;

        this.commonSaveUserData();
    },

    getItem(_type,_defaultVal)
    {
        let val = this.userData[_type];
        if (this.isEmpty(val)) return _defaultVal;
        return val;
    },

    checkUser() {
        this.checkDataProperty(this.userData, this.USER_PROPERTY.shortcutTime, "", 'string');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.vibrate, 1, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.music, 1, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.audio, 1, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.dailyTime, "", 'string');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.dailyDay, 0, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.skin, 1, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.guide, 0, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.coin, 0, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.star, 0, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.diamond, 0, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.freeRewardTime, "", 'string');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.skin, 1, 'number');
        this.checkDataProperty(this.userData, this.USER_PROPERTY.skins, [], 'object');
    },

    readUserDataFromPlatform(_callback)
    {
        let _key = this.SAVE_PATH.USER_DATA;
        
        if (FacebookUtils.isFacebook) {
            FBInstant.player
                .getDataAsync([_key])
                .then((data) =>
                {
                    let dataStr = data[_key];

                    if (this.isEmpty(dataStr)) this.userData = { };
                    else
                    {
                        if (typeof dataStr != 'string') dataStr = JSON.stringify(dataStr);
                        this.userData = JSON.parse(dataStr);
                    }    

                    this.checkUser();
                    ConsoleUtils.log(this.userData);

                    this.__saveData(_key,this.userData,true);

                    _callback && _callback();
                });
        }
        else {

            this.userData = this.__readData(_key,"object");

            this.checkUser();

            ConsoleUtils.log(this.userData)

            this.__saveData(_key, this.userData, false);

            _callback && _callback();
        }
    },

    readMusicDataFromPlatform(_callback) {
      
        let _key = this.SAVE_PATH.MUSIC_DATA;
        if (FacebookUtils.isFacebook) {
            FBInstant.player
                .getDataAsync(_key)
                .then((data) =>
                {
                    let dataStr = data[_key];

                    if (this.isEmpty(dataStr)) this.musicData = new Array();
                    else {
                        if (typeof dataStr != 'string') dataStr = JSON.stringify(dataStr);
                        this.musicData = JSON.parse(dataStr);
                    }

                    this.checkAllMusic();

                    this.__saveData(_key,this.musicData,true);

                    _callback && _callback();
                });
        }
        else {
            this.musicData = this.__readData(_key,"array");
            this.checkAllMusic();

            ConsoleUtils.log(this.musicData)

            this.__saveData(_key, this.musicData, false);
            _callback && _callback();
        }
    },

    saveMusicDataByLike(id)
    {
        if(this.isEmpty(this.musicData) || !Array.isArray(this.musicData))
            this.musicData = new Array();

        let arg = this.musicData.find(element => element.id == id);
        
        let unlock = arg ? arg.unlock : 0;
        let like = arg ? arg.like : 0;
        let add = !arg;
        
        let newLike = like == 0 ? 1 : 0;
        arg = this.checkMusicData(arg, id, unlock, like);
        arg.like = newLike;
        if (add) this.musicData.push(arg);

        this.__saveData(this.SAVE_PATH.MUSIC_DATA, this.musicData, true);
    },

    /** 保存已解锁的歌曲信息 */
    saveMusicData(id,level,score)
    {
        if(this.isEmpty(this.musicData) || !Array.isArray(this.musicData))
            this.musicData = new Array();

        let arg = this.musicData.find(element => element.id == id);
        let push = !arg;

        let like = 0;
        if (!this.isEmpty(arg)) like = arg.like;

        arg = this.checkMusicData(arg, id,1,like);
        ConsoleUtils.log(arg);
        if (push)
        {
            this.musicData.push(arg); 
        }

        let maxLevel = 3;
        if (level > arg.level) {
            arg.level = level;
            push = true;
        }
        if (level >= maxLevel)
        {
            arg.count += 1;
            push = true;
        }    
        if (score > arg.score)
        {
            arg.score = score;
            push = true;
        }    
        ConsoleUtils.log(arg);
        if (!push) return;

        this.__saveData(this.SAVE_PATH.MUSIC_DATA, this.musicData, true);
    },

    getTotalStar()
    { 
        let cnt = 0;
        for(let i = 0;i < this.musicData.length;i++)
        {
            let data = this.musicData[i];
            if (!this.isEmpty(data) &&
                !this.isEmpty(data.level) &&
                !isNaN(data.level) &&
                !this.isEmpty(data.unlock) &&
                data.unlock == 1)
            {
                cnt += data.level;
            }
        }
        return cnt;
    },
    
    getMusicData(id)
    {
        if(!this.musicData) return null;
        if(!Array.isArray(this.musicData)) return null;

        let data = this.musicData.find(element => element.id == id);

        return data;
    },

    isMusicUnlock(id)
    {
        if(!this.musicData) return false;
        if(!Array.isArray(this.musicData)) return false;

        let data = this.musicData.find(element => element.id == id);

        if (this.isEmpty(data)) return false;
        if (this.isEmpty(data.unlock)) return false;
        return data.unlock == 1;
    },

    isMusicLiked(id)
    {
        if(!this.musicData) return false;
        if(!Array.isArray(this.musicData)) return false;

        let data = this.musicData.find(element => element.id == id);

        if (this.isEmpty(data)) return false;
        if (this.isEmpty(data.like)) return false;
        return data.like == 1;
    },

    checkAllMusic()
    {
        for(let i = 0;i < this.musicData.length;i++)
        {
            let data = this.musicData[i];
            this.checkMusicData(data,data.id,1,data.like);
        }
    },

    checkMusicData(data,id,unlock,like)
    {
        if(this.isEmpty(data)) data = {id : id,level : 0,score : 0,count : 0,unlock :unlock,like : like};

        this.checkDataProperty(data, "id", id, 'number');
        this.checkDataProperty(data, "level", 0, 'number');
        this.checkDataProperty(data, "score", 0, 'number');
        this.checkDataProperty(data, "count", 0, 'number');
        this.checkDataProperty(data, "unlock", unlock, 'number');
        this.checkDataProperty(data, "like", like, 'number');

        return data;
    },

    /** 皮肤是否解锁 */
    isSkinUnlock(_id)
    {
        if (this.isEmpty(this.userData.skins)) return false;
        return this.userData.skins.indexOf(_id) != -1;
    },

    checkDataProperty(tempData, key, defaultVal, valType) {
        if (this.isEmpty(tempData)) return;
        if (this.isEmpty(tempData[key])) tempData[key] = defaultVal;
        else if (!this.isEmpty(valType) && typeof tempData[key] !== valType) tempData[key] = defaultVal;
    },

    /**
     * @description 存储数据
     * @param {数据key} _savePath 
     * @param {数据结构} _data 
     * @param {是否推送到服务器或平台对应后端} _post 
     */
    __saveData(_savePath,_data,_post)
    { 
        let _dataStr = JSON.stringify(_data);
        cc.sys.localStorage.setItem(_savePath, _dataStr);
        if (_post)
        {
            let _postData = {};
            _postData[_savePath] = _dataStr;
            this.__postDataToFB(_postData,_savePath)
        }
    },
    
    __readData(_savePath,type)
    {
        let _dataStr = cc.sys.localStorage.getItem(_savePath);

        let _data = null;

        try
        {
            if (!this.isEmpty(_dataStr))
            {
                _data = JSON.parse(_dataStr);
            }
            else
            {
                if(type == "object") _data = {};
                else if(type == "array") _data = new Array();
            }
            
        }
        catch (e)
        {
            if(type == "object") _data = {};
            else if(type == "array") _data = new Array();
        }
        
        return _data;
    },
    
    __postDataToFB(dataObj,title)
    {
        try
        {
            if(!this.isEmpty(dataObj) && FacebookUtils.isFacebook)
            {
                FBInstant.player
                    .setDataAsync(dataObj)
                    .then(function()
                    {
                    });
            }
        }
        catch (e)
        {
        }
        
    },

    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}
