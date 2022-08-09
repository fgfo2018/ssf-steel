console.log("[" + mToday() + "] server enabled")
require('./rtsp-server1')
require('./rtsp-server2')
require('./rtsp-server3')

function mToday() {
    var m = new Date().toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei'
    });
    return m;
}