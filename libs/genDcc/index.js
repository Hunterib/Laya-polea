/**
 * layadcc
 */
var fs = require('fs');
var path = require('path');

var cnfg_newtxtfmt = true;
var cnfg_newbinfmt = true;
function log(m) {
    //console.log('\x1b[0m\x1b[30m' + m);
	console.log(m);
}

function logNotify(m) {
    //console.log('\x1b[1m\x1b[37m' + m + '\x1b[0m\x1b[30m');
	console.log(m);
}

function logErr(m) {
    //console.log('\x1b[0m\x1b[31m' + m + '\x1b[0m\x1b[30m');
	console.log(m);
}

var excludes = [
    '.git',
    '.svn',
    'update',
    'dccTools',
    'layadccout'
];

var excludeExts = { '.exportjson': 1, '.pngz': 1, '.jpgz': 1, '.jngz': 1 };

//统计文件类型
var extfilest = {};

//遍历每个文件，执行func,传入完整的文件名字
function allFiles(root, func) {
    var files = fs.readdirSync(root);
    files.forEach(function(file) {
        var pathname = root + '/' + file;
        try {
            var stat = fs.lstatSync(pathname);
            if (!stat.isDirectory()) {
                var ext = path.extname(file);
                if (extfilest[ext] == undefined)
                    extfilest[ext] = 1;
                else
                    extfilest[ext]++;
                //扩展名过滤
                if (excludeExts[ext])
                    return true;
                func(pathname);
            } else {
                var exclude = (function() {
                    //目录过滤
                    var i = 0, sz = excludes.length;
                    for (i = 0; i < sz; i++) {
                        if (excludes[i] == file)
                            return true;
                    }
                    return false;
                })();
                if (exclude) return;
                allFiles(pathname, func);
            }
        } catch (e) {
            logErr('Error:' + e);
            logErr(e.stack);
        }
    });
}

var crypto = require('crypto');
var md5 = crypto.createHash('md5');

function getUintArrFromMD5Str(s) {
    var len = Math.max(s.length, 32);
    var charBuf = new Uint8Array(len);
    for (var i = 0; i < s.length; i++) charBuf[i] = s.charCodeAt(i);
    return new Uint32Array(charBuf.buffer);
}

/**
 * @param srcpath {string} 资源目录
 * @param outpath {string} 输出目录。如果指定了url，则就输出在当前目录下。
 * @param genCache {boolean} 是否生成cache
 * @param urlToLower {boolean} 是否把资源文件名和路径全部转成小写。
 * @param url {string?} 如果生成资源的话，对应的url是什么。可以为空
 */
function gendcc(srcpath, outpath, genCache, urlToLower,url, options) {
    md5 = crypto.createHash('md5');
    var bindcc = [0xffeeddcc, 1];    //标志和版本号
    bindcc.push(0x00ffffff);  //由于已经发布的程序不能正确做到兼容版本，所以上面的版本号当成标志了。
    bindcc.push(1);//这个才算真正版本
    //下面保存assetsid的md5
    var md5startPos = bindcc.length;
    for (var i = 0; i < 8; i++)  //4*8=32
        bindcc.push(0);     //先留空间

    if( genCache && url ) {
        var cacheOut = url;
        cacheOut = cacheOut.replace('http://', '');
        var index = cacheOut.indexOf('?');
        if (index > 0) {
            cacheOut = cacheOut.substring(0, index);
        }
        index = cacheOut.lastIndexOf('/');
        if (index > 0) {
            cacheOut = cacheOut.substring(0, index);
        }

        cacheOut = cacheOut.replace(/:/g, '.');
        cacheOut = cacheOut.replace(/\\/g, '_');
        cacheOut = cacheOut.replace(/\//g, '_');
        outpath = outpath+'/cache';
        //cacheOut = path.join(outpath, 'cache', cacheOut);
        if (!fs.existsSync(outpath)) {
            fs.mkdirSync(outpath);
        }
        outpath = outpath+'/'+cacheOut;
        if (!fs.existsSync(outpath)) {
            fs.mkdirSync(outpath);
        }
    }

    var outc = [];
    var outc1 = [];    //新的校验，统一已知文本的回车换行
    var allrelfile = [];
    var modifytm = true;

    allFiles(srcpath, function(p) {
        if (modifytm) {
            var cdt = new Date();
            fs.utimesSync(srcpath, cdt, cdt);
        }
        var relpath = '/' + path.relative(srcpath, p).replace(/\\/g, '/');
        if (urlToLower)
            relpath = relpath.toLowerCase();//转成小写
        if(options && options.escspace){
            relpath = relpath.replace(/\s/g,'%20');
        }
        allrelfile.push(relpath);
        var pathcrcv = require('./crc32').crc32(relpath); bindcc.push(pathcrcv * 1);
        var pathcrc = pathcrcv.toString(16);
        var padd = 8 - pathcrc.length;
        if(padd>0){        
            pathcrc = '00000000'.substr(0, padd) + pathcrc;
        }
        //计算校验的时候统一把\r\n换成\n
        var ext = path.extname(p).toLowerCase();
        var contentcrc = require('./scrc32').crc32(p); bindcc.push(contentcrc * 1);
        var content = contentcrc.toString(16);
        outc.push(pathcrc + ' ' + content);
        outc1.push(pathcrc + ' ' + content);

        if (ext === '.txt' || ext === '.html' || ext === '.js' || ext === '.exportjson' || ext === '.css' || ext === '.htm' || ext === '.ini' || ext === '.log') {
            /*
            var strbuff = fs.readFileSync(p,'utf8');    这有个问题，如果不是utf8的会导致与c端的不一致而产生校验错误
            strbuff = strbuff.replace(/\r\n/g,'\n');    
            var buff = new Buffer(strbuff);
            */
            var strbuff = fs.readFileSync(p);
            var tempBuff = Buffer.alloc(strbuff.length);
            var si = 0, di = 0;
            var srclen = strbuff.length;
            while (si < srclen) {
                if (strbuff[si] == 0x0d && strbuff[si + 1] == 0x0a) {
                    si++; si++;
                    tempBuff[di++] = 0x0a;
                } else {
                    tempBuff[di++] = strbuff[si++];
                }
            }
            tempBuff = tempBuff.slice(0, di);
            content = require('./scrc32').crc32mem(tempBuff).toString(16);
            outc1.pop();
            outc1.push(pathcrc + ' ' + content);
        }

        //log( pathcrc+' '+content+'   \t'+relpath);
        //copy
        var inbuf = fs.readFileSync(p);
        md5.update(inbuf);
        if (genCache)
            fs.writeFileSync(path.resolve(outpath, pathcrc), inbuf);
        //log(relpath);
    });
    var md5str = md5.digest('hex');
    //填上md5数值
    var md5int = getUintArrFromMD5Str(md5str);
    var stp = md5startPos;
    md5int.forEach(function(v) {
        bindcc[stp++] = v;
    });

    if( md5str.length==32 && cnfg_newtxtfmt){
        var outtxt = ['ffeeffee 1',md5str.slice(0,8)+' '+md5str.slice(8,16),md5str.slice(16,24)+' '+md5str.slice(24,32)].concat( outc);
        fs.writeFileSync(path.resolve(outpath, 'filetable.txt'), outtxt.join('\r\n'));
    }else{
        console.log('error! md5 length should be 32');
        fs.writeFileSync(path.resolve(outpath, 'filetable.txt'), outc.join('\r\n'));
    }
    //写二进制的dcc
    var bindccBuff = Buffer.alloc(4 * bindcc.length);
    bindccBuff.fill(0);
    for (i = 0; i < bindcc.length; i++) {
        bindccBuff.writeUInt32LE(bindcc[i], i * 4);
    }
    fs.writeFileSync(path.resolve(outpath, 'filetable.bin'), bindccBuff);
    fs.writeFileSync(path.resolve(outpath, 'filetable1.txt'), outc1.join('\r\n'));
    fs.writeFileSync(path.resolve(outpath, 'assetsid.txt'), md5str);
    fs.writeFileSync(path.resolve(outpath, 'allfiles.txt'), allrelfile.join('\r\n'));

    log(JSON.stringify(extfilest));
    log('输出:\n '+outpath);
}

exports.gendcc = gendcc;
//require("./UnitTest.js").testall(new alltest(),'testEJFile2Bin');//,'fff');
