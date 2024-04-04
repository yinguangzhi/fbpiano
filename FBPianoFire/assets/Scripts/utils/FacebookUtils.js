const ConsoleUtils = require("./ConsoleUtils");



module.exports =
{
    userInfo: null,
    playerID: 0,
    playerName: "",
    playerPhoto: "",
    shareBattle: false,
    iconList: {},
    __platform: "PC",
    __version : "0.1",
    supportedAPIs: null,
    authorization: false,//授权
    screenWidth: 0,
    screenHeight: 0,

    isFacebook: false,
    
    isNative()
    {
        return cc.sys.isNative;
    },

    isPC()
    {
        return this.__platform == "WEB";
    },

    isAndroid() {
        if (this.isNative()) return true;
        return this.__platform == "ANDROID";
    },

    isIOS() {
        return this.__platform == "IOS";
    },

    contextID: {
        get: function () {
            let  _c_id = "";
            if (this.isFacebook)
            {
                _c_id = FBInstant.context.getID();
                ConsoleUtils.log("context.id : " + _c_id);  
            }
            
            return _c_id;
        },
    },

    checkAPI(_name)
    {
        if (!this.supportedAPIs)
        {
            if (window.isFB) this.supportedAPIs = FBInstant.getSupportedAPIs();
            // ConsoleUtils.log(this.supportedAPIs);
        }

        let index = -1;
        if (this.supportedAPIs)
        {
            index = this.supportedAPIs.indexOf(_name);
            if (index == -1) ConsoleUtils.log("api is not exist : ", _name)
        }
        return index != -1;
    },

    initFacebook()
    {
        this.isFacebook = window.FBInstant != null;

        this.lastFullTime = this.currentTime();
    },

    login(callback) {
        ConsoleUtils.log("login ...");

        callback && callback(true);
    },


    initPlayer()
    {
        if (this.isFacebook) {
            this.__version = FBInstant.getSDKVersion();
            this.__platform = FBInstant.getPlatform();

            ConsoleUtils.log(this.__platform);
            this.playerID = FBInstant.player.getID();
            this.playerName = FBInstant.player.getName();
            this.playerPhoto = FBInstant.player.getPhoto();
        }
        else
        {
            let u = navigator.userAgent;
            if (this.isEmpty(u)) return;
            
            let _isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            let _isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        }
        
    },

    paused: false,
    bindPause() {

        if (this.paused) return;

        this.paused = true;

        if (this.isFacebook) {
            FBInstant.onPause(function () {
                ConsoleUtils.log('pause was triggered');
            });
        }
    },

    trackEvent(eventStr) { },

    loadRemoteTexture(container, url, userID, _loading, _callback)
    {

        let setIcon = (frame) =>
        {
            this.iconList[userID] = frame;

            if (cc.isValid(container)) container.spriteFrame = frame;
            if (cc.isValid(_loading)) _loading.active = false;
            _callback && _callback();
        };

        let frame = this.iconList[userID];
        if (frame)
        {
            setIcon(frame);
            return;
        }

        if (cc.isValid(_loading)) _loading.active = true;

        if (this.isFacebook)
        {
            let playerImage = new Image();
            playerImage.crossOrigin = 'anonymous';
            playerImage.onload = function ()
            {
                let texture2d = new cc.Texture2D();
                texture2d.initWithElement(playerImage);
                texture2d.handleLoadedTexture();

                frame = new cc.SpriteFrame(texture2d);

                setIcon(frame);
            }

            playerImage.src = FBInstant.player.getPhoto();
        }
        else
        {
            if (cc.isValid(_loading)) _loading.active = false;
            _callback && _callback();
        }
    },


    VIBRATE_TYPE:
    {
        /** 尚未检测震动类型 */
        Null: 0,
        /** fb内置震动 */
        Haptic: 1,
        /** web内置震动 */
        Navigator: 2,
        /** 不支持震动 */
        None : 3,
    },
    
    __vibrateType: 0,
    initVibrate() {
        if (this.vibrateType != this.VIBRATE_TYPE.Null) return;

        if (this.checkAPI("performHapticFeedbackAsync"))
        {
            this.vibrateType = this.VIBRATE_TYPE.Haptic;
        }
        else
        {
            let _have = "vibrate" in navigator;
            if (_have) this.vibrateType = this.VIBRATE_TYPE.Navigator;
            else this.vibrateType = this.VIBRATE_TYPE.None;
        }

        if (this.isFacebook)
        {
            if (!this.isIOS() && !this.isAndroid()) 
            {
                this.vibrateType = this.VIBRATE_TYPE.None;
            }
        }
    },

    vibrateAction(_time) {
        
        this.initVibrate();
        
        if (this.isNative())
        {
            jsb.reflection.callStaticMethod("org/ToolManager", "vibrate", "(I)V", 25);
        }
        else
        {
            if (this.vibrateType == this.VIBRATE_TYPE.Haptic) FBInstant.performHapticFeedbackAsync();
            else if (this.vibrateType == this.VIBRATE_TYPE.Navigator) navigator.vibrate(10);
        }
    },

    suggestGame(id,type)
    {
        let arg = "";
        if(this.isFacebook)
        {
            ConsoleUtils.log("switchGame in fb")
    
            FBInstant.switchGameAsync(id,{enterTip: '0',type:arg})
                .catch(function (e)
                {
                    ConsoleUtils.log("switchGame error : " + e.message)
                });
        }
    },

    inviteFriend(texPath, _callback) {

        let _wid = 600;
        let _hei = 345;

        cc.resources.load(texPath, cc.Texture2D, (err, canvasTex) => {
            if (window.isFB) {

                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                canvas.width = _wid;
                canvas.height = _hei;

                let image = null;

                if (canvasTex) {
                    image = canvasTex.getHtmlElementObj();
                    if (this.couldDrawImage(image)) ctx.drawImage(image, 0, 0, _wid, _hei);
                }
                else {
                    ConsoleUtils.log(" canvasTex is wrong in : " + updateAT);
                }

                let base64Picture = canvas.toDataURL('image/png');

                let desc = this.getUpdateString();
                let id = this.playerID;

                FBInstant.inviteAsync({
                    image: base64Picture,
                    text: desc,
                    data: { type: "invite", score: 0, id: id },
                }).then(() => {

                    ConsoleUtils.log(" new invite friend success");
                    _callback &&  _callback(true);

                }).catch((error) => {

                    _callback && _callback(false);
                });
            }
            else _callback &&  _callback(true);
        })

    },

    battleData : {},
    playWithFriend: function (_callback)
    {
        this.resetBattleParams();

        if (this.isFacebook)
        {
            FBInstant.context.chooseAsync()
                .then(() =>
                {
                    FBInstant.context.getPlayersAsync()
                        .then((players) =>
                        {
                            this.battleData['id'] = 1;

                            if (this.isEmpty(players))
                            {
                                ConsoleUtils.log("players not exist");
                            }
                            else if (players.length == 2)
                            {
                                players.forEach((_player) =>
                                {
                                    if (_player.getID() != this.playerID) {
                                        
                                        this.battleData['id'] = _player.getID();
                                        this.battleData['name'] = _player.getName();
                                        this.battleData['photo'] = _player.getPhoto();

                                        this.addToCompleteFriend(_player.getID(), _player.getName(), _player.getPhoto());
                                    }
                                })
                            }
                            
                            _callback && _callback(true);
                        })
                        .catch((error) =>
                        {
                            _callback && _callback(false);
                            ConsoleUtils.log("invite player error : ", error);
                        });
                })
                .catch((error) =>
                {
                    ConsoleUtils.log("chooseAsync error : ", error);
                    if (error.code == "USER_INPUT")
                    {
                        _callback && _callback(false);
                    }
                    else
                    {
                        this.battleData['id'] = 1;
                        
                        _callback && _callback(true);
                    }
                });
        }
        else _callback && _callback(true);
    },

    fightWithUser: function (_user_id, _user_name, _user_photo, _user_score, _callback)
    {
        this.resetBattleParams();

        if (this.isFacebook)
        {
            if (this.isEmpty(_user_id)) _user_id = "1";

            FBInstant.context.createAsync(_user_id)
                .then(() => {
                    this.shareBattle = true;
                    this.battleData['id'] = _user_id;
                    this.battleData['name'] = _user_name;
                    this.battleData['photo'] = _user_photo;
                    this.battleData['score'] = _user_score;

                    _callback && _callback(true);
                })
                .catch((error) =>
                {
                    ConsoleUtils.log("fight user error : ", error.code);
                    if (error.code == "SAME_CONTEXT")
                    {
                        this.shareBattle = true;
                        this.battleData['id'] = _user_id;
                        this.battleData['name'] = _user_name;
                        this.battleData['photo'] = _user_photo;
                        this.battleData['score'] = _user_score;

                        _callback && _callback(true);
                    }
                    else
                    {
                        _callback && _callback(false);
                    }
                });
        }
        else
        {
            _callback && _callback(true);
        }
    },

    resetBattleParams() {
        this.shareBattle = false;
        this.battleData['id'] = -1;
    },

    createShortcut(_check, _auto, _callback)
    {
        if (this.isFacebook)
        {
            if (!this.checkAPI("canCreateShortcutAsync"))
            {
                _callback && _callback(false);
                return;
            }

            if (!this.checkAPI("createShortcutAsync"))
            {
                _callback && _callback(false);
                return;
            }

            if (_check)
            {
                FBInstant.canCreateShortcutAsync()
                    .then(function (canCreateShortcut) {
                        _callback && _callback(canCreateShortcut);
                    })
                    .catch(function (error) {
                        _callback && _callback(false);
                        ConsoleUtils.log("canCreateShortcut error : ", error);
                    });

                return;
            }

            FBInstant.canCreateShortcutAsync()
                .then(function (canCreateShortcut) {
                    if (canCreateShortcut) {
                        FBInstant.createShortcutAsync()
                            .then(function () {
                                ConsoleUtils.log("success shortcut");
                                _callback && _callback(false);
                            })
                            .catch(function () {
                                ConsoleUtils.log("some wrong when shortcut");
                                _callback && _callback(false);
                            });
                    }
                })
                .catch(function (error) {
                    ConsoleUtils.log("canCreateShortcut error : ", error);
                    _callback && _callback(false);
                });
        }
        else {
            _callback && _callback(false);
        }
    },
    
    completeFriends: null,
    setConnectPlayer() {

        if (this.completeFriends) return;

        if (this.isFacebook)
        {
            FBInstant.player.getConnectedPlayersAsync()
                // FBInstant.context.getPlayersAsync()
                .then((players) => {

                    ConsoleUtils.log("setConnectPlayer players : ......");
                    ConsoleUtils.log(players);

                    this.completeFriends = [];
                    players.forEach((player) => {

                        this.completeFriends.push({
                            id: player.getID(),
                            name: player.getName(),
                            photo: player.getPhoto()
                        })

                    });
                });
            ConsoleUtils.log(this.completeFriends);
        }
    },

    addToCompleteFriend(id, name, photo) {

        if (this.completeFriends) {

            let _find = this.completeFriends.find(element => element.id == id);

            if (!_find) {

                this.completeFriends.push({
                    id: id,
                    name: name,
                    photo: photo,
                })
            }
        }
    },

    getRealPlayerBlock(_id) {
        let _find = null;
        if (this.completeFriends) _find = this.completeFriends.find(element => element.id == _id);
        return _find;
    },

    updateType:
    {
        update: 1, share: 5
    },

    updateToPlatform: function (texPath, updateAT, data, _callback)
    {
        if (this.isFacebook)
        {
            cc.resources.load(texPath, cc.Texture2D, (err, canvasTex) =>
            {
                this.realUpdateToPlatform(canvasTex, updateAT, data, _callback);
            })
        }
        else
        {
            _callback && _callback();
        }
    },

    realUpdateToPlatform: function (canvasTex, updateAT, data, _callback) {

        let _wid = 600;
        let _hei = 345;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = _wid;
        canvas.height = _hei;

        let image = null;

        if (canvasTex) {
            image = canvasTex.getHtmlElementObj();
            if (this.couldDrawImage(image)) ctx.drawImage(image, 0, 0, _wid, _hei);
        }
        else {
            ConsoleUtils.log(" canvasTex is wrong in : " + updateAT);
        }

        let shareBattle64 = canvas.toDataURL('image/png');

        if (updateAT === this.updateType.update) {
            FBInstant.updateAsync(
                {
                    action: 'CUSTOM',
                    cta: 'Play',
                    image: shareBattle64,
                    text: this.getUpdateString(data.score),
                    template: 'WORD_PLAYED',
                    data: { type: "update", score: data.score, id: this.playerID },
                    strategy: 'IMMEDIATE',
                    notification: 'NO_PUSH',
                })
                .then(function () {
                    ConsoleUtils.log('updateAsync : Message was sended successfully');
                    _callback && _callback();
                })
                .catch(function (result) {
                    // ConsoleUtils.log(result);
                    _callback && _callback();
                });;
        }
        else {
            let _text = this.getShareString(data.score);
            let _data = { enterTip: '0', type: "", score: data.score, id: this.playerID };

            if (updateAT === this.updateType.share)
                _data = { enterTip: '0', type: "share", score: data.score, id: this.playerID };

            FBInstant.shareAsync(
                {
                    intent: 'REQUEST',
                    image: shareBattle64,
                    text: _text,
                    data: _data,
                })
                .then(function () {
                    ConsoleUtils.log("share success");
                    _callback && _callback();
                })
                .catch(function (result) {
                    ConsoleUtils.log(result);
                    _callback && _callback();
                });
        }
    },

    couldDrawImage(image) {
        let could = false;
        try {
            could = image instanceof HTMLImageElement ||
                image instanceof SVGImageElement ||
                image instanceof HTMLVideoElement ||
                image instanceof HTMLCanvasElement ||
                image instanceof ImageBitmap ||
                image instanceof OffscreenCanvas;
        }
        catch (e) { }
        return could;
    },

    setProtoRank(title, score) {
        
        let id = this.contextID.get();
        if (this.isEmpty(id)) return;

        if (this.isFacebook)
        {
            if (!this.checkAPI("getLeaderboardAsync")) return;

            FBInstant.getLeaderboardAsync(title + '.' + id)//
                .then((leaderboard) => {
                    ConsoleUtils.log(leaderboard.getName())
                    return leaderboard.setScoreAsync(score);
                })
                .then((entry) => {
                    ConsoleUtils.log("success set rank : ", entry.getScore());
                })
                .catch(error => {
                    ConsoleUtils.error("fail set rank : ");
                    ConsoleUtils.error(error);
                });
        }
    },


    ADState:
    {
        NotLoad: 0, LoadSuccess: 1, LoadFail: 2, Loading: 3
    },

    /** 全屏广告的最大间隔 */
    isFullMaxDelta()
    {
        let _time = this.currentTime();
        return _time - this.lastFullTime > 100;
    },

    loadFullFinishCallBack: null,
    executeFullLoadFinishCallBack()
    {
        this.loadFullFinishCallBack && this.loadFullFinishCallBack();
        this.loadFullFinishCallBack = null;
    },



    fullFailInitCnt: 0,
    fullLoadTime: 0,
    fullState: 0,
    fullAD: null,
    initFullAD: function ()
    {
        if (this.isFacebook)
        {
            if (this.fullState != this.ADState.LoadSuccess &&
                this.fullState != this.ADState.Loading)
            {
                this.fullState = this.ADState.Loading;

                this.fullLoadTime = this.currentTime();

                FBInstant.getInterstitialAdAsync(this.convertAD(this.ADEncryptType.Full))
                    .then((interstitial) =>
                    {
                        this.fullState = this.ADState.Loading;
                        this.fullAD = interstitial;
                        return this.fullAD.loadAsync();
                    })
                    .then(() =>
                    {
                        this.fullFailInitCnt = 0;
                        ConsoleUtils.log("load full success");

                        this.fullState = this.ADState.LoadSuccess;
                        this.executeFullLoadFinishCallBack();
                    })
                    .catch((err) => {

                        this.fullFailInitCnt++;
                        ConsoleUtils.log("load full fail : ", err);

                        this.fullState = this.ADState.LoadFail;

                        this.executeFullLoadFinishCallBack();
                    });
            }
        }
        else
        {
            this.fullState = this.ADState.LoadSuccess;
        }
    },

    lastFullTime: -10,
    displayFullAD(_callback)
    {
        let seconds = this.currentTime();

        if (this.isFacebook)
        {
            if (this.selfCloseVideo) 
            {
                this.selfCloseVideo = false;
                _callback && _callback();
                return;
            }

            if (this.fullState == this.ADState.LoadSuccess && seconds - this.lastFullTime > 36)
            {
                this.lastFullTime = seconds;

                this.fullState = this.ADState.NotLoad;

                this.fullAD.showAsync()
                    .then(() => {
                        ConsoleUtils.log('success display full ad');
                        _callback && _callback();
                        // this.initFullAD();
                    })
                    .catch((e) => {
                        ConsoleUtils.error("fail display full ad");
                        _callback && _callback();
                        // this.initFullAD();
                    });
            }
            else
            {
                _callback && _callback();
            }
        }
        else
        {
            this.fullState = this.ADState.NotLoad;
            
            _callback && _callback();
        }
    },

    
    loadVideoFinishCallBack: null,
    executeVideoLoadFinishCallBack()
    {
        this.loadVideoFinishCallBack && this.loadVideoFinishCallBack();
        this.loadVideoFinishCallBack = null;
    },

    selfCloseVideo: false,
    videoLoadTime: 0,
    videoFailInitCnt: 0,
    videoState: 0,
    videoAD: null,
    initVideoAD: function () {
        ConsoleUtils.log("init video ad")
        
        if (this.isFacebook)
        {
            if (this.videoState != this.ADState.LoadSuccess &&
                this.videoState != this.ADState.Loading)
            {
                this.videoState = this.ADState.Loading;
                this.videoLoadTime = this.currentTime();

                FBInstant.getRewardedVideoAsync(this.convertAD(this.ADEncryptType.Video))
                    .then((rewarded) => {
                        this.videoState = this.ADState.Loading;
                        this.videoAD = rewarded;
                        return this.videoAD.loadAsync();
                    })
                    .then(() => {
                        this.videoState = this.ADState.LoadSuccess;
                        this.videoFailInitCnt = 0;
                        ConsoleUtils.log("load video success")
                        this.executeVideoLoadFinishCallBack();
                    })
                    .catch((err) => {
                        this.videoFailInitCnt++;
                        ConsoleUtils.log("load video fail : ", err)
                        this.videoState = this.ADState.LoadFail;
                        this.executeVideoLoadFinishCallBack();
                    });
            }
        }
        else {
            
            this.videoState = this.ADState.Loading;
            
            // this.videoState = this.ADState.LoadSuccess;
            
            setTimeout(() => { 
                ConsoleUtils.log("aaaaaaa");
                this.videoState = this.ADState.LoadSuccess;
                
                this.executeVideoLoadFinishCallBack();
            },3000)
        }
    },

    displayVideoAD(_callback)
    {
        if (this.isFacebook)
        {
            if (this.videoState == this.ADState.LoadSuccess) {
                
                this.videoState = this.ADState.NotLoad;
                
                this.lastFullTime = this.currentTime();

                this.videoAD.showAsync()
                    .then(() => {
                        ConsoleUtils.log('display video ad success');
                        _callback && _callback(true);
                    })
                    .catch((e) => {
                        ConsoleUtils.error("display video ad fail : ", e.message);

                        _callback && _callback(false);

                        this.selfCloseVideo = true;
                    });
            }
            else _callback && _callback(false);
        }
        else
        {     
            this.videoState = this.ADState.NotLoad;
            
            ConsoleUtils.log("video videoState after display in not fb: ", this.videoState);
            
            _callback && _callback(true);
        } 
    },

    isVideoADLoad()
    {
        if (this.isFacebook)
        {
            return this.videoState == this.ADState.LoadSuccess;
        }
        
        return this.videoState == this.ADState.LoadSuccess;
    },

    isVideoADLoading() {
        if (this.isFacebook) return this.videoState == this.ADState.Loading;
        return this.videoState == this.ADState.Loading;
     },

    isFullADLoad() {
        if (this.isFacebook) return this.fullState == this.ADState.LoadSuccess;
        return true;
    },

    isFullADLoading() {
        if (this.isFacebook) return this.fullState == this.ADState.Loading;
        return false;
     },

    isMinVideoDelta() {
        
        if (this.videoState == this.ADState.LoadFail ||
            this.videoState == this.ADState.NotLoad) {

            let _arg = parseInt(this.videoFailInitCnt / 3);
            let _arg2 = parseInt(this.videoFailInitCnt % 3);
            let _baseDeltaTime = [0, 60, 90, 120, 120, 600, 800, 1000000][_arg];
            let _deltaTime = [30, 60, 90, 90, 90, 120, 240, 240, 240][_arg];

            let _time = this.currentTime();
            let _isReady = (_time - this.videoLoadTime) > (_baseDeltaTime + _arg2 * _deltaTime);
            ConsoleUtils.log("is video could load : ", _isReady);
            return _isReady;
        }
        else { 
            ConsoleUtils.log("is Video could init again external : ",false);
            return false;
            
        } 
    },

    isMinFullDelta() {
        if (this.fullState == this.ADState.LoadFail ||
            this.fullState == this.ADState.NotLoad) {

            let _arg = parseInt(this.fullFailInitCnt / 3);
            let _arg2 = parseInt(this.fullFailInitCnt % 3);
            let _baseDeltaTime = [0, 60, 90, 120, 120, 600, 800, 1000000][_arg];
            let _deltaTime = [30, 60, 90, 90, 90, 120, 240, 240, 240][_arg];

            let _time = this.currentTime();
            let _isReady = (_time - this.fullLoadTime) > (_baseDeltaTime + _arg2 * _deltaTime);
            return _isReady;
        }
        else return false;
    },

    
    bannerAd: null,
    bannerState: 0,
    lastBannerTime: -10,
    bannerFailInitCnt: 0,
    displayBanner(_callback) {

        if (this.isFacebook)
        {
            if (!this.isBannerMinDelta())
            {
                if (_callback) _callback(false);
                return;
            }

            if (!this.checkAPI("loadBannerAdAsync"))
            {
                if (_callback) _callback(false);
                return;
            }

            if (this.bannerState != this.ADState.Loading &&
                this.bannerState != this.ADState.LoadSuccess)
            {

                this.lastBannerTime = this.currentTime();
                this.bannerState = this.ADState.Loading;
                let _id = this.convertAD(this.ADEncryptType.Banner);
                try
                {
                    FBInstant.loadBannerAdAsync(_id)
                        .then(() => {

                            ConsoleUtils.log("load banner success")
                            if (this.bannerState == this.ADState.NotLoad)
                            {
                                this.hideBanner();    
                            }
                            else
                            {
                                this.bannerState = this.ADState.LoadSuccess;
                            }
                            _callback && _callback(true);
                            
                            this.bannerFailInitCnt = 0;
                        })
                        .catch((err) => {

                            ConsoleUtils.log(err);
                            ConsoleUtils.log("load banner fail : ", this.bannerState);

                            this.bannerState = this.ADState.LoadFail;
                            
                            _callback && _callback(false);

                            this.bannerFailInitCnt++;
                        })
                }
                catch (err)
                {
                    ConsoleUtils.log(err);
                    _callback && _callback(false);
                }
                
            }
        }
        else _callback && _callback(false);
    },

    hideBanner()
    {
        if (this.isFacebook)
        {
            if (this.checkAPI("hideBannerAdAsync")) {
                FBInstant.hideBannerAdAsync();
            }
            this.bannerState = this.ADState.NotLoad;
        }
    },

    /** banner广告的最小间隔 */
    isBannerMinDelta()
    {
        let _time = this.currentTime();
        return _time - this.lastBannerTime > this.bannerFailInitCnt * 20;
    },

    isBannerADLoad() {
        if (this.isFacebook) return this.bannerState == this.ADState.LoadSuccess;
        return true;
    },

    adPrefixIndex: 1,
    adPrefixes: ["VID_HD_16_9_15S_APP_INSTALL#", "CAROUSEL_IMG_SQUARE_APP_INSTALL#", "PLAYABLE#"],
    ADEncryptType: { Video: 0, Full: 1, Banner: 2 },

    ads: 
        [
            "",//video
            "",//full
            "",//banner
        ],
    
    convertAD: function (_type) {
        let numArray = this.ads[_type].split('_');

        let top = numArray[0];
        let top_char = '';
        for (let i = 0; i < top.length; i++) {
            top_char += parseInt(top.charCodeAt(i)) - 65;
        }

        let bottom = numArray[1];
        let bottom_char = '';
        for (let i = 0; i < bottom.length; i++) {
            bottom_char += parseInt(bottom.charCodeAt(i)) - 65 - 12;
        }

        let adStr = top_char + "_" + bottom_char;

        // let _external = '';
        // if (_type == this.ADEncryptType.Video) {
        //     _external = 'VID_HD_9_16_39S_LINK#';
        // }
        // if (_type == this.ADEncryptType.Full) {
        //     _external = this.adPrefixes[1];
        // }

        // return _external + adStr;
        return adStr;
    },

    adConvert(str) {
        let arr = str.split('_');
        let chars = "";
        for (let i = 0; i < arr[0].length; i++) {
            chars += String.fromCharCode(parseInt(arr[0][i]) + 65)
        }

        chars += "_";
        for (let i = 0; i < arr[1].length; i++) {
            chars += String.fromCharCode(parseInt(arr[1][i]) + 65 + 12)
        }
        ConsoleUtils.log(chars);
    },

    postSessionScore(_score) {
        if (this.isFacebook)
        {
            ConsoleUtils.log("postSession : ", _score);
            try {
                FBInstant.postSessionScoreAsync(_score);
            }
            catch (e) { }
        }
    },

    exitGame: function () {
        if (this.isFacebook)
        {
            FBInstant.quit();
        }
    },

    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },

    currentTime() {
        let now = new Date();
        let seconds = now.getTime() / 1000;
        return seconds;
    },

    getUpdateString: function (core) {
        let locale = FBInstant.getLocale();
        let shareStr = "Wow,it's real cool.";

        let ud =
        {
            default: shareStr,
            localizations:
            {
                en_US: shareStr,
                es_ES: shareStr,
                pt_BR: shareStr,
                pt_PT: shareStr,
                fr_CA: shareStr,
                fr_FR: shareStr,
                ar_AR: shareStr,
                id_ID: shareStr,
                tr_TR: shareStr,
                de_DE: shareStr,
                it_IT: shareStr,
                ru_RU: shareStr,
                ja_JP: shareStr,
                nl_BE: shareStr,
                nl_NL: shareStr,
                sv_SE: shareStr,
                hu_HU: shareStr,
                el_GR: shareStr,
                cs_CZ: shareStr,
                vi_VN: shareStr,
                pl_PL: shareStr,
                tl_PH: shareStr,
                zh_HK: shareStr,
                zh_TW: shareStr,
                zh_CN: shareStr,
                ko_KO: shareStr,
                ms_MY: shareStr,
                th_TH: shareStr,
            }
        };
        return ud;
    },

    getShareString: function (core) {
        let shareStr = "Wow,it's real cool.";
        return shareStr;
    },
}
