const ConsoleUtils = require("./ConsoleUtils");

module.exports =
{
    decrypt(data, singleHeight, ElseSpeed, callback) {
        
        if (this.isEmpty(ElseSpeed)) ElseSpeed = 1;
        if (isNaN(ElseSpeed)) ElseSpeed = 1;

        ConsoleUtils.log(data.text);
        ConsoleUtils.log(singleHeight);
        let model = {};
        let bpm = 0;
        let baseY = 0;
        let baseTime = 0;

        let str = data.text.replace(/\r/g, "");
        let mapArr = str.split("\n");

        let paramsTypes = [];
        let titles = [];
        var array = [];

        for (let index = 0; index < mapArr.length; index++) {

            const element = mapArr[index];

            let arr = element.split(",");

            let lineData = {};

            for (let i = 0; i < arr.length; i++)
            {
                if (index == 0)
                {
                    if (this.isEmpty(arr[i])) titles.push("")
                    else titles.push(arr[i]);
                }
                else if (index == 1)
                {
                    paramsTypes.push(arr[i]);
                }
                else if (!this.isEmpty(titles[i]))
                {
                    let _title = titles[i];
                    let _paramsType = paramsTypes[i];
                    lineData[_title] = this.parseParams(_paramsType, arr[i]);
                }
            }
            if (index == 0 || index == 1) continue;

            if (lineData[titles[0]] == -1) continue;

            array.push(lineData);
        }

        let locations = [64, 192, 320, 448];
        let len = array.length;
        for (let i = 0; i < len; i++)
        {
            let block = array[i];
            if (i == 0)
            {
                bpm = block.BPM * ElseSpeed;   
                block['bpm2'] = bpm; 
            }
            
            let speed = (bpm * 2 * singleHeight) / 60;
            let posy = baseY + (block.StartTime - baseTime) / 1000 * speed;

            let length = 0;
            if (block.Type == 0) length = singleHeight;
            else if (block.Type == 2)
            {
                if ((block.EndTime <= block.StartTime))
                {
                    console.error("长块结束时间配置有问题 : ",block.StartTime,"->",block.EndTime);
                    length = singleHeight;
                }
                else
                {
                    length = (block.EndTime - block.StartTime) / 1000 * speed;
                }
            }
            

            block['coin'] = false;
            block['posyCnt'] = posy / singleHeight;
            block['posy'] = posy;
            block['timeFromStart'] = posy;
            block['length'] = length;
            block['empty'] = false;
            block['xIndex'] = locations.indexOf(block.Location);

            let _bCnt = length / singleHeight;

            let _bCnt2 = Math.round(_bCnt);
            if (Math.abs(_bCnt - _bCnt2) < 0.1) _bCnt = _bCnt2;
            
            block['bCnt'] = _bCnt <= 1 ? 1 : _bCnt;

            if (block.Type == 2)
            {
                if (block['bCnt'] <= 1.5)
                {
                    console.error("长块的长度略短 : ",block['bCnt'],"  real : ",_bCnt)
                }    
            }
            

            if (block.BPM > 0) {

                bpm = block.BPM * ElseSpeed;
                block['bpm2'] = bpm;

                if (!model['BPMs'] || model['BPMs'] <= 0) model['BPMs'] = [];
                model['BPMs'].push(bpm);

                baseY = posy;
                baseTime = block.StartTime;
            }
        }

        let finalNote = array[len - 1];
        let totalLength = finalNote.posy + finalNote.length;


        baseTime = finalNote.StartTime;
        baseY = finalNote.posy;
        let speed = (bpm * 2 * singleHeight) / 60;
        let _s_id = finalNote.ID + 1;
        let _s_s_time = baseTime + 2000;
        let _d_time = 1000 * singleHeight / speed;

        //添加金币块
        for (let i = 0; i < 10; i++)
        {
            let xs = i % 2 == 0 ? [1, 3] : [0, 2];
            for (let j = 0; j < 2; j++)
            {
                let block = {
                    ID: _s_id++,
                    Type: 0,
                    StartTime: _s_s_time + _d_time * i,
                    EndTime: 0,
                    Location: 0,
                    BPM: -1,
                    bpm2 : -1,
                    Color : -1,
                }    

                let posy = baseY + (block.StartTime - baseTime) / 1000 * speed;
                
                block['posyCnt'] = posy / singleHeight;
                block['posy'] = posy;
                block['timeFromStart'] = posy;
                block['length'] = singleHeight;
                block['empty'] = false;
                block['xIndex'] = xs[j];
                block['bCnt'] = 1;
                block['coin'] = true;

                array.push(block);
            }
        }
        
        model['totalLength'] = totalLength;
        model['blocks'] = array;

        ConsoleUtils.log(model);
        ConsoleUtils.log(paramsTypes);

        callback && callback(model);

    },

    //横着读
    CSVStringToArrayJerry(strData, singleHeight) {

    },

    parseParams(_type, _val) {
        _type = _type.toLowerCase()
        if (this.isEmpty(_val)) _val = -1;
        switch (_type) {
            case 'string':
                return _val
                break;
            case 'int':
                return parseInt(_val);
                break;
            case 'float':
                return parseFloat(_val);
                break;
            case 'boolean':
            case 'bool':
                return Boolean(_val);
                break;
            case 'array':
                break;
        }
    },

    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}