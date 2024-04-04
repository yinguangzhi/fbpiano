

module.exports =
{
    parse(text) {
        text = text.replace(/\r/g, "");
        let lines = text.split('\n');

        let properties = [];
        let dataTypes = [];
        let array = [];

        let properties_desc_index = 0;
        let properties_index = 1;
        let data_type_index = 2;

        for (let i = 0; i < lines.length; i++) {
            if (i == properties_desc_index) continue; //属性描述

            let line = lines[i];
            let line_arr = line.split(',');

            if (this.isEmpty(line_arr[0])) continue;

            let data = {};
            for (let m = 0; m < line_arr.length; m++) {
                let arg = line_arr[m];

                if (i == properties_index)//读取属性
                {
                    if (this.isEmpty(arg)) properties.push("");
                    else properties.push(arg);
                }
                else if (i == data_type_index)//数据类型
                {
                    dataTypes.push(arg);
                }
                else if (!this.isEmpty(arg)) {
                    let _data_type = dataTypes[m];
                    let _properties = properties[m];
                    data[_properties] = this.getProperties(_data_type, arg);
                }

            }
            if (i == properties_desc_index || i == properties_index || i == data_type_index) continue;

            array.push(data);
        }
        // console.log(array);
        return array;
    },

    stringify() {

    },

    getProperties(_type, _val) {
        _type = _type.toLowerCase()
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
            case 'array<int>':

                let arr = _val.split(';');

                let arr2 = [];
                for (let i = 0; i < arr.length; i++) {
                    arr2.push(parseInt(arr[i]));
                }
                return arr2;
                break;

            case 'array<string>':

                let arr3 = _val.split(';');

                let arr4 = [];
                for (let i = 0; i < arr3.length; i++) {
                    arr4.push(arr3[i]);
                }
                return arr4;
                break;
        }
    },

    isEmpty: function (obj) {
        
        return obj === '' || obj === null || obj === undefined;
    },
}