
const LoadUtils = require("./LoadUtils");
const FacebookUtils = require("./FacebookUtils");
const PathUtils = require("./PathUtils");

var MusicStatus = cc.Enum({
    None: 1,
    Playing: 2,
    Pause: 3,
});
    
module.exports =
{
    
    music: null,
    noteList : null,
    audioList: [],
    
    musicStatus: MusicStatus.None,
    musicState: true,
    audioState: true,

    AUDIO:
    {
        CLICK: "click",
        MUTE: "mute",
        START: "start",
        STAR: "star2",
        WINDOW: "window",
        BOMB : "bomb",
    },
    
    
    bomb: "bomb",
    mute: "mute",
    click: "click",
    start: "start",
    window: "window",
    star : "star2",

    audioTimes: [],
    
    frame: 0,

    setAudioState(state) {
        this.audioState = state;
    },

    setMusicState(state, _behavior) {
        this.musicState = state;
        if (_behavior) {
            if (this.musicState) this.playAudio(this.music, true, true);
            else this.pauseMusic();
        }
    },

    getMillion() {
        let now = new Date();
        return now.getTime();
    },

    resetFrame() {
        this.frame = 0;
    },


    playClick()
    {
        this.playAudio(this.AUDIO.CLICK, false, false, false);
    },

    playMute()
    {
        this.playAudio(this.AUDIO.MUTE, false, false, false);
    },

    playAudio(url, loop, isMusic,isNote) {

        if (!url) return;

        if (url == this.mute)
        {
            if (!FacebookUtils.isIOS()) return;
        }

        let clip = this.audioList[url];

        if (cc.isValid(clip)) {

            this.realPlayAudio(clip, loop, isMusic,isNote);
            return;
        }

        let _external = isNote ? 'notes/' : 'audio/'
        let path = _external + url;

        LoadUtils.loadAssetAsync(path, cc.AudioClip, null, 0)
            .then((asset) =>
            {
                this.audioList[url] = asset;
                this.realPlayAudio(asset, loop, isMusic, isNote);
            })
            .catch((error) =>
            {
                console.log("pre load audio error ", path);
            })
    },

    realPlayAudio(clip, loop, isMusic,isNote) {
        let volume = 1;

        if (!isNote)
        {
            if (isMusic)
            {
                volume = 0.3;
                if (!this.musicState)
                {
                    volume = 0;
                    return;
                }
            }
            else if (!this.audioState)
            {

                volume = 0;
                return;
            }
        }
        
        

        if (isMusic) {
            console.log("music : ", this.musicStatus);
            if (this.musicStatus == MusicStatus.Playing) return;

            cc.audioEngine.setMusicVolume(volume);
            if (this.musicStatus == MusicStatus.None) cc.audioEngine.playMusic(clip, true);
            else if (this.musicStatus == MusicStatus.Pause) cc.audioEngine.resumeMusic();

            this.musicStatus = MusicStatus.Playing;
        }
        else cc.audioEngine.play(clip, loop, volume);

    },

    preLoadAudio(url) {

        if (!url) return;

        let clip = this.audioList[url];
        if (cc.isValid(clip)) return;

        let path = PathUtils.getAudioPath(url);
        LoadUtils.loadAssetAsync(path, cc.AudioClip, null, 0)
            .then((asset) =>
            {
                this.audioList[url] = asset;
            })
            .catch((error) =>
            {
                console.log("pre load audio error ", path);
            })
    },

    prePlayMusic()
    {
        cc.audioEngine.playMusic(this.music, false);
        cc.audioEngine.setMusicVolume(0);
    },

    playMusic()
    {
        cc.audioEngine.playMusic(this.music);
        cc.audioEngine.setMusicVolume(1);
    },

    resumeMusic()
    {
        cc.audioEngine.resumeMusic();
    },

    pauseMusic()
    {
        cc.audioEngine.pauseMusic();
    },
}