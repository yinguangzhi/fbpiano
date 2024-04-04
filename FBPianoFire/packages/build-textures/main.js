var ccpath = require('path');
var fs = require('fs');
//var cfb = require('CusFBTool');

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    else {
        if (mkdirsSync(ccpath.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
};

function onBeforeBuildFinish(options, callback) {
    let rootPath = Editor.Project.path;

    let _tempdir = ccpath.join(rootPath, "assets/Res/");
    if (!fs.existsSync(_tempdir)) fs.mkdirSync(_tempdir);
    _tempdir = ccpath.join(rootPath, "assets/Res/AfterBuildTexture");
    if (!fs.existsSync(_tempdir)) fs.mkdirSync(_tempdir);
    _tempdir = ccpath.join(rootPath, "assets/Res/NeedCompressTexture");
    if (!fs.existsSync(_tempdir)) fs.mkdirSync(_tempdir);

    // get all textures in build
    let srcDir = ccpath.join(rootPath, "assets/Res/AfterBuildTexture");
    let compressDir = ccpath.join(rootPath, "assets/Res/NeedCompressTexture");



    let fileList = fs.readdirSync(compressDir);
    fileList.forEach(function (fileName) {
        fs.unlinkSync(ccpath.join(compressDir, fileName));
    });

    Editor.log(options)
    options.bundles.forEach(function (bundle) {
        let buildResults = bundle.buildResults;

        Editor.log(buildResults);
        Editor.log('BuildingRoot: ' + rootPath + ";  platform : " + options.platform + ' to ' + options.dest);


        let cnt = 0;
        let textures = [];
        let assets = buildResults.getAssetUuids();
        let textureType = cc.js._getClassId(cc.Texture2D);
        for (let i = 0; i < assets.length; ++i) {
            let asset = assets[i];
            if (buildResults.getAssetType(asset) === textureType) {
                let path = buildResults.getNativeAssetPath(asset);//Editor.assetdb.uuidToFspath(asset);//

                if (path == '' || path == null) {
                    Editor.log(asset + ' path is null');
                }
                else {
                    /*let pathArray = path.split("DancingDot\\");
                    if(pathArray.length > 1)
                    {
                        path = "db://" + pathArray[1];
                    }
                    path = path.replace(/\\/g,"/");*/

                    let destPath = path;
                    let extName = ccpath.extname(destPath);
                    let texName = ccpath.basename(destPath);
                    let srcPath = ccpath.join(srcDir, texName);
                    if (extName != ".jpg") {
                        if (fs.existsSync(srcPath)) {
                            let srcData = fs.readFileSync(srcPath);//, 'utf8'
                            fs.writeFileSync(destPath, srcData)
                        }
                        else {
                            let srcData = fs.readFileSync(destPath);
                            destPath = ccpath.join(compressDir, texName);
                            fs.writeFileSync(destPath, srcData);

                            Editor.log(texName + " is not exist");
                        }

                        textures.push(path);
                        cnt++;
                    }
                    else {
                        Editor.log(texName + " is not png");
                    }
                }
                //Editor.log('textures ' + cnt + ' : ' + path);
            }
        }

        Editor.log(`All textures in build: ${textures}`);

        let textureCnt = textures.length;
        Editor.log('All textures length: ' + textureCnt);

    })
    //cfb.isfb = true;

    Editor.assetdb.refresh('db://assets/Res/NeedCompressTexture/', function (err, results) {

    });
    callback();
}

module.exports = {
    load() {
        Editor.Builder.on('before-change-files', onBeforeBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
    }
};
