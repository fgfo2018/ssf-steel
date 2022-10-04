const express = require('express');
const cors = require('cors')
var fs = require("fs");
filename = "./config.json";
let rawdata = fs.readFileSync(filename);
let config = JSON.parse(rawdata);
const app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server, {
        cors: {
            // No CORS at all
            origin: '*',
        }
    }),
    rtsp = require('rtsp-ffmpeg');
const bodyParser = require('body-parser')

server.listen(config.server01_Port);
app.use(bodyParser.text({
        type: '*/*'
    }), express.static(__dirname + '/views'),
    cors()
);
var uri =
    config.server01_Url,
    stream = new rtsp.FFMpeg({
        input: uri,
        rate: config.server01_VIDEO_FPS
    });
io.on('connection', function (socket) {
    var pipeStream = function (data) {
        socket.emit('data', data.toString('base64'));
    };
    stream.on('data', pipeStream);
    socket.on('disconnect', function () {
        stream.removeListener('data', pipeStream);
    });

    console.log("[" + mToday() + "] NO.1 Connection succeeded")
});

function mToday() {
    var m = new Date().toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei'
    });
    return m;
}

// ping
app.get('/checkPort', function (req, res) {
    var net = require('net');
    var sock = new net.Socket();
    var hosts = [
        ['localhost', 8554],
    ];
    hosts.forEach(function (item) {
        sock.setTimeout(2500);
        sock.on('connect', function () {
            res.send({
                status: true
            })
            console.log("連線成功")
            sock.destroy();
        }).on('error', function (e) {
            console.log("連線不成功1")
            res.send({
                status: false
            })
        }).on('timeout', function (e) {
            console.log("連線不成功2")
            res.send({
                status: false
            })
        }).connect(item[1], item[0]);
    })
    
})
// ping end

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/config', function (req, res) {
    const output = getSpotsData();
    // console.log();
    res.send(output)
});

app.get('/list', function (req, res) {
    const output = getTime();
    // console.log();
    res.send(output)
});


app.get('/listdir', function (req, res) {
    const output = getDir();
    // console.log();
    res.send(output)
});
app.post('/api/analysis/setnumber', function (req, res) {
    const output = getDir();
    const id = JSON.parse(req.body)
    var data = []
    output.forEach(function (item) {
        data.push(item.name)
    })
    id.forEach(function (item) {

        console.log(data.indexOf(item.name))
    })

    // saveDir(id)
    res.send({
        success: true,
    })
})
var testtt = 0
app.post('/log', function (req, res) {
    const id = JSON.parse(req.body)
    var data = '[ERROR][' + mToday() + ']:video is not working' + id.name;
    console.log(data)
    saveLogData(data)
    testtt++
    res.send({
        success: true,
    })
});

const getDir = () => {
    const jsonData = fs.readFileSync('./views/temp/listTime.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}
const saveDir = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./views/temp/listTime.json', stringifyData)
}

const getTime = () => {
    const jsonData = fs.readFileSync('./views/temp/testTimeList.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}
const getSpotsData = () => {
    const jsonData = fs.readFileSync('./config.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}

function putLOG(content) {
    const path = './log.txt'
    try {
        if (!fs.existsSync(path)) {
            fs.writeFile(path, '', function (error) {
                console.log(error)
                console.log('create log.txt')
            })
        }
    } catch (err) {
        console.error(err)
    }
    var data = fs.readFileSync(path).toString().split("\n");
    data.splice(-1, 0, content);
    var text = data.join("\n");
    fs.writeFile(path, text, function (err) {
        if (err) return console.log(err);
    });
    return true;
}

function mToday() {
    var m = new Date().toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei'
    });
    return m;
}


var arr = []

function saveLogData(content) {
    arr.push(content)
    console.log(arr)
}
var pustatus = true
setInterval(() => {
    if (arr.length > 0 && pustatus) {
        pustatus = false
        var tp = putLOG(arr[0])
        arr.shift();
        pustatus = tp
    }
}, 200)

var system1 = `[system info][${mToday()}]:系統正常啟動`
saveLogData(system1)
setInterval(() => {
    var data = `[system info][${mToday()}]:System is normal`
    saveLogData(data)
}, 0.1 * 60 * 1000)

var exit1 = false;
process.on('SIGINT', () => {
    var data = `[system info][${mToday()}]:系統程序退出`
    exit1 = putLOG(data)
    setInterval(() => {
        if (exit1) {
            process.exit(0);
        }
    }, 10)
})