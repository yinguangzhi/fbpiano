'use strict';

let fs = require('fs');
let path = require('path');

module.exports = {
    load() {
        Editor.log('Hello Convert Load!');
    },

    unload() {
        Editor.log('Hello Convert Fail!');
    },

    encryptMidi(data) {

        let model = data;
        if (!model) return;

        let withNotes = true;

        let y = 0;
        let noteBlocks = [];
        let encryptStr = "";

        for (let i = 0; i < model.chapters.length; i++) {
            let fragment = model.chapters[i];

            let baseLength = fragment.baseBeats / 2;
            let bpm = fragment.bpm;

            let splinters = fragment.periods;


            for (let m = 0; m < splinters.length; m++) {
                let splinter = splinters[m];

                let main = splinter.main;
                let second = splinter.second;

                let splinter_main = this.getMiDiBlocks(main, baseLength);
                let splinter_second = this.getMiDiBlocks(second, baseLength);


                //计算轨1 的相对位置
                let tempY = 0;
                let tempBlocks = [];
                for (let k = 0; k < splinter_main.noteDatas.length; k++) {
                    //每一篇章的第一个块 携带bpm数值
                    let _bpm1 = k == 0 && m == 0 ? bpm : 0;

                    let _noteData = splinter_main.noteDatas[k];

                    let _arg = {
                        type: _noteData.type,
                        time: tempY,
                        bpm: _bpm1,
                        duration: _noteData.count,
                        notes: _noteData.notes,
                        attachments: [],
                    }
                    tempBlocks.push(_arg);

                    tempY += _noteData.count;
                }

                //轨2 附着 轨1
                let tempY2 = 0;
                for (let k = 0; k < splinter_second.noteDatas.length; k++) {
                    let _noteData = splinter_second.noteDatas[k];

                    let _accordBlock = null;
                    for (let v = 0; v < tempBlocks.length; v++) {
                        if (tempY2 >= tempBlocks[v].time && tempY2 < tempBlocks[v].time + tempBlocks[v].duration) {
                            _accordBlock = tempBlocks[v];
                            break;
                        }
                    }

                    if (_accordBlock) {
                        let _localTime = tempY2 - _accordBlock.time;
                        _accordBlock.attachments.push({
                            localTime: _localTime,
                            notes: _noteData.notes,
                        })
                    }

                    tempY2 += _noteData.count;
                }

                //重新计算轨1，获取全局位置
                for (let k = 0; k < tempBlocks.length; k++) {
                    let _noteData = tempBlocks[k];
                    _noteData.time += y;

                    if (_noteData.attachments.length > 1) {
                        // console.log(_noteData.attachments)
                        // console.log(k);
                    }

                    noteBlocks.push(_noteData)
                }

                y += tempY;
            }
        }

        for (let k = 0; k < noteBlocks.length; k++) {
            let _noteData = noteBlocks[k];
            _noteData.time *= 1000;
            _noteData.duration *= 1000;

            if (!withNotes) {
                delete _noteData['attachments'];
                delete _noteData['notes'];
            }

        }

        encryptStr = JSON.stringify(noteBlocks)

        return encryptStr;
    },

    anonData: [],
    midiName: '',
    length_duration:
    {
        O: 1, N: 2, M: 4, L: 8, K: 16, J: 32, I: 64, H: 128, G: 256, F: 512, E: 1024
    },

    getMiDiBlocks(splinterStr, baseLength) {
        let splinter = { totalCount: 0, totalLength: 0, noteDatas: [] };
        if (!splinterStr) return splinter;

        let blocks = splinterStr.split(',');
        for (let i = 0; i < blocks.length; i++) {
            let _block = blocks[i];

            if (!_block) continue;

            let _args = _block.split('[');

            let _noteStr = _args[0];
            let _empty = _noteStr.indexOf("empty") != -1;

            let _isMulti = _noteStr.indexOf('(') != -1;
            if (_isMulti) _noteStr = _noteStr.slice(1, _noteStr.length - 1);

            //音符列表
            let _notes = [];
            if (!_empty) {
                _notes = this.splitContext([_noteStr], '&');

                _notes = this.splitContext(_notes, '~');
                _notes = this.splitContext(_notes, '^');
                _notes = this.splitContext(_notes, '%');
                // let _temp_idx = _noteStr.indexOf('~');
                // let _temp_idx2 = _noteStr.indexOf('^');
                // if (_temp_idx2 != -1) _notes = _noteStr.split('^');
                // if (_temp_idx != -1) _notes = _noteStr.split('~');
                // else _notes = _noteStr.split('&');
            }
            if (_notes.length != 0) {
                for (let m = 0; m < _notes.length; m++) {
                    // Editor.log("音符", _notes[m])
                    let anonNote = this.anonData[_notes[m]];
                    if (anonNote) _notes[m] = anonNote.toString();
                    else {

                        Editor.log("midi : ", this.midiName, " 的音符", _notes[m], "的混淆音符不存在")
                        _notes[m] = this.anonData['mute'];
                    }
                }
            }

            let _lengthStr = _args[1].substr(0, _args[1].length - 1);

            let _realLength = 0;
            for (let m = 0; m < _lengthStr.length; m++) {
                _realLength += this.length_duration[_lengthStr[m]];
            }

            let _type = 0;
            let _count = _realLength / baseLength;
            if (!_empty) {
                if (_count < 1) _type = 1;
                else if (_count == 1) _type = 2;
                else _type = 3;
            }

            let noteData =
            {
                type: _type,
                count: _count,
                length: _realLength,
                notes: _notes,
            };

            splinter.noteDatas.push(noteData);
            splinter.totalCount += _count;
            splinter.totalLength += _realLength;

        }

        console.log(splinter);
        return splinter;
    },

    splitContext(arr, arg) {
        let _notes = [];
        if (!arr) return _notes;

        for (let i = 0; i < arr.length; i++) {
            let temps = arr[i].split(arg);

            for (let m = 0; m < temps.length; m++) {

                if (temps[m]) _notes.push(temps[m]);
            }

        }
        // if (arg == '^') Editor.log(_notes.length)
        return _notes;
    },

    messages: {
        'convert'() {
            Editor.log('Hello Convert !');

            let rootPath = Editor.Project.path;

            let destDir = path.join(rootPath, "assets/resources/json");
            if (!fs.existsSync(destDir)) {

                fs.mkdirSync(destDir);

                Editor.log("混淆后的json文件的目录路径 : ", destDir, "   不存在，请创建该目录，混淆后的json文本会放于此处");

            }

            let anonPath = path.join(rootPath, "assets/res", "anon.json");
            let anonStr = fs.readFileSync(anonPath, 'utf-8');
            this.anonData = JSON.parse(anonStr);

            Editor.log('Hello Convert !！！！！');
            let that = this;
            Editor.assetdb.queryAssets("db://assets/res/json/**\/*", 'json', function (error, results) {

                    Editor.log(error);
                results.forEach(function (result) {

                    Editor.log(result);

                    let filepath = Editor.assetdb.urlToFspath(result.url);
                    let basename = path.basename(filepath);
                    let dirname = path.dirname(filepath);
                    let _name = basename.slice(0, basename.length - 5);


                    let arg = fs.readFileSync(filepath, 'utf-8');
                    arg = JSON.parse(arg)


                    // Editor.log(arg['chapters'][0]['periods']);

                    that.midiName = _name;
                    let data = that.encryptMidi(arg);
                    // Editor.log(data);

                    let destPath = 'db://assets/resources/json/' + _name + '.json';
                    if (Editor.assetdb.exists(destPath)) {

                        Editor.assetdb.saveExists(destPath, data, function (err, meta) {

                        });
                    }
                    else {
                        Editor.assetdb.create(destPath, data)
                    }

                    // result.url
                    // result.path
                    // result.uuid
                    // result.type
                    // result.isSubAsset
                });

                Editor.assetdb.refresh('db://assets/resources/json/', function (err, results) { });

                Editor.log("Convert Complete !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            });
        },

        'anonnote'() {

            let anonData = {};
            let rootPath = Editor.Project.path;
            let anon = 1;


            let anonDir = path.join(rootPath, "assets/res");
            if (!fs.existsSync(anonDir)) {

                fs.mkdirSync(anonDir);

                Editor.log("混淆文本的目录路径 : ", anonDir, "   不存在，请创建该目录，混淆后的文本会放于此处");

            }


            let destDir = path.join(rootPath, "assets/resources/audio");
            if (!fs.existsSync(destDir)) {

                fs.mkdirSync(destDir);

                Editor.log("目标路径 : ", destDir, "   不存在，请创建该目录，混淆后的音节会放于此处");

            }


            let externalPath = path.join(rootPath, "audio");
            if (!fs.existsSync(externalPath)) {

                fs.mkdirSync(externalPath);

                Editor.log("路径 : ", externalPath, "   不存在，请创建该目录，并将所有音节放于此处,方便进行混淆");

                return;

            }


            let files = fs.readdirSync(externalPath);
            // Editor.log(files);
            for (let i = 0; i < files.length; i++) {
                let basename = files[i];
                let filepath = path.join(externalPath, basename);

                let dirname = path.dirname(filepath);
                let _name = basename.split('.')[0];

                anonData[_name] = anon;

                let destPath = path.join(destDir, (anon + '.mp3'));

                let srcData = fs.readFileSync(filepath);
                fs.writeFileSync(destPath, srcData);


                anon++;
            }

            Editor.log(anonData);

            let anonPath = path.join(anonDir, "anon.json");
            fs.writeFileSync(anonPath, JSON.stringify(anonData));

            Editor.assetdb.refresh('db://assets/resources/audio/', function (err, results) { });
            Editor.assetdb.refresh('db://assets/resources/json/', function (err, results) { });
            Editor.assetdb.refresh('db://assets/res', function (err, results) { });


            Editor.log("Anon Complete !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        }
    },
};