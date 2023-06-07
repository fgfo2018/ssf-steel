var myChart = echarts.init(document.getElementById('main2'));
var config = getConfig();
function getConfig() {
    var rtn;
    $.ajax({
        url: '/config',
        type: 'get',
        async: false,
        success: function (res) {
            rtn = res;
        },
        error: function (res) {
            rtn = false;
        }
    });
    return rtn;
}
const url = `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.web_dataScraping_refresh}`

// prettier-ignore
// (x, y , 0:沒事 1:有事, 拉了幾桶(3桶/hr))
var Interval = null
option = {
    aria: {
        enabled: true
    },
    title: {
        textStyle: {
            color: '#6f6f6f',
            fontSize: 12,
            lineHeight: 50,
        },
        x: 'right'
    },
    // tooltip: {
    //     position: 'top'
    // },
    animation: false,
    grid: {
        height: '72%',
        top: '20%',
        width: '80%',
        // width: '91%',
        left: '48',
    },
    xAxis: {
        type: 'category',
        name: '(hr)',
        data: ['0', '1', '2', '3', '4', '5', '6',
            '7', '8', '9', '10', '11',
            '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23'
        ],
        splitArea: {
            show: true
        }
    },

    yAxis: {
        type: 'category',
        data: [0, 10, 20, 30, 40, 50],
        name: '(m)',
        splitArea: {
            show: true,
        },
    },
    visualMap: {
        show: true,
        min: 0,
        // max: 5,
        calculable: true,
        // orient: 'horizontal',
        orient: 'vertical',
        top: '45',
        right: '30',
        bottom: '15%',
        color: ['#7E6E68', '#907D76', '#A99792', '#BBACA9', '#D0C8C7']
    },
    series: [{
        name: '',
        type: 'heatmap',
        label: {
            show: true,
            normal: {
                show: true,
                formatter: function (params) {
                    if (params.data['2'] == 0) {
                        return '{a|' + params.data['3'] + '}';
                    } else if (params.data['2'] == 1) {
                        return '{b|' + params.data['3'] + '}';
                    } else if (params.data['2'] == 2) {
                        return '{c|' + params.data['3'] + '}';
                    }
                },
                rich: {
                    a: {
                        //  backgroundColor:'#fff',
                        color: '#E3DCD3'
                    },
                    b: {
                        backgroundColor: '#811C21',
                        height: '26',
                        width: '3',
                        shadowOffsetY: '0',
                        shadowOffsetX: '0',
                        align: 'center',
                    },
                    c: {
                        backgroundColor: '#B56666',
                        height: '26',
                        width: '3',
                        shadowOffsetY: '0',
                        shadowOffsetX: '0',
                        align: 'center',
                    },
                }
            }
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }]
};
// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);
//初始化資料報表

$('.table-responsive').on('click', 'button', function () {
    if (this.name === "refresh") {
        // getData(url)
    }
})
$(window).keypress(function (event) {
    if (event.which === 13) {
        getData(url)
    }
})
getData(url)
// _____________ 2022/11/22 backup
// 判斷表單點到的日期
// var clickSum = null;
// $('.table-responsive').on('click', 'tr', function () {
//     var id = parseInt($(this).attr("data-index")) + 1
//     if (!isNaN(id)) { // 判斷id是否有數字

//         if (clickSum !== id) { // 判斷是否點擊同一列
//             if (Interval !== null) {
//                 clearInterval(Interval)
//             }
//             const data = $('#table2').bootstrapTable(
//                 'getRowByUniqueId',
//                 id)
//             var clickdata = new Date(data.table_start)
//             getData(url, clickdata)
//         }
//     }
//     clickSum = id
// })
// _____________ 2022/11/22 backup
$('.selectDate1').on('change', function (ev) {
    setTimeout(() => {
        var date = new Date($(this).val())
        getData(url, date)
    }, 300)
    // console.log(range)
});

function getData(url, clickdata) {
    // var date_range = $('#date_range').val();
    // console.log(date_range)
    // console.log($('input[name="dates"]').data('daterangepicker').endDate)
    if (clickdata != undefined) {
        // console.log(clickdata)
        var date = new Date(clickdata)
    } else {
        var date = new Date()
    }
    var time = date.getFullYear() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        "-" +
        date.getDate().toString().padStart(2, '0')
    var range = {
        "table_timeselectStart": time + " 00:00:00",
        "table_timeselectStop": time + " 23:59:59"
    }
    // console.log(range)

    range = JSON.stringify(range)
    $.ajax({
        url: url,
        method: 'POST',
        data: range,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var data = listinterval(data, clickdata)
            // 判斷時段中拉起桶數的最大值
            var max = []
            data.forEach(function (item) {
                max.push(item[3])
            })
            max = Math.max(...max)
            // 判斷時段中拉起桶數的最大值 end
            data = data.map(function (item) {
                return [item[0], item[1], item[2], item[3]];
            })
            myChart.setOption({
                visualMap: {
                    max: max
                },
                title: {
                    text: '統計日期:' + time,
                },
                series: [{
                    name: '',
                    data: data,
                }]
            });
        },
        error: function (err) {
            console.log(err)
        },
    })
}
// -------時間計算器
// setInterval(function () {
// 	jQuery.ajax({
// 		url: '/list',
// 		method: 'GET',
// 		dataType: "json",
// 		success: function (res) {
// 			var data = listinterval(res)
// 			data = data.map(function (item) {
// 				return [item[0], item[1], item[2], item[3]];
// 			})
// 			myChart.setOption({
// 				series: [{
// 					name: '',
// 					data: data,
// 				}]
// 			});
// 		},
// 		error: function (err) {
// 			console.log(err)
// 		},
// 	})
// }, 500)
// 時間篩選
function listinterval(res, clickdata) {
    // 撈取警報溫度
    var f_tr = null;
    var s_tr = null;
    $.ajax({
        url: 'http://localhost:5000/api/data/normal',
        dataType: "json",
        method: 'GET',
        async: false, // 關閉非同步作業
        success: function (res) {
            f_tr = res.setting_first_alarm_temperature
            s_tr = res.setting_second_alarm_temperature
        },
        error: function (err) { }
    })

    // 宣告陣列
    var output = []
    // 取得今天日期
    if (clickdata != undefined) {
        // console.log(clickdata)
        var NowDate = new Date(clickdata)
    } else {
        var NowDate = new Date()
    }
    var NYear = NowDate.getFullYear()
    var NMonth = NowDate.getMonth()
    var NDate = NowDate.getDate()

    // 設定間隔時間(設定範圍1~60，並且可除盡60)
    var interval = 10
    // 判斷interval 是否為合理範圍，否則將強制變動
    if (interval === 0) {
        interval = 1
    } else if (interval > 60) {
        interval = 60
    }
    // 計算間隔時間
    setinterval = (1440 / interval) + 1
    // 指標時間變數
    var lastTime = null
    var NewMin = null

    // 間隔十分鐘
    for (var i = 1; i < setinterval; i++) {
        // 宣告日期
        var today = new Date(NYear, NMonth, NDate)
        var today1 = new Date(NYear, NMonth, NDate)
        // 判斷初始，存入起始時間
        if (i == 1) {
            lastTime = new Date(today)
        } else {
            lastTime = new Date(lastTime)
            lastTime = today1.setMinutes(today1.getMinutes() + ((i - 1) * interval))
            lastTime = new Date(lastTime)
        }
        // 結束時間
        NewTime = today.setMinutes(today.getMinutes() + (i * interval))
        NewTime = new Date(NewTime)
        // 判斷時間
        var timeSum = 0;
        var Hours = lastTime.getHours();
        var Minutes = lastTime.getMinutes();
        var status = 0
        res.forEach(function (item) {
            var listTime = new Date(item.table_start)
            // 判斷間隔時間如果符合，就在此區段增加統計數
            if (listTime > lastTime && listTime < NewTime) {
                // 此區段如果有任何一桶有問題，則將狀態變更為1
                if (item.table_maxTempLF > f_tr && item.table_maxTempLF < s_tr || item.table_maxTempSTAIR >
                    f_tr &&
                    item.table_maxTempSTAIR < s_tr || item.table_maxTempLD >
                    f_tr && item.table_maxTempLD < s_tr) {
                    status = 1
                } else if (item.table_maxTempLF >= s_tr || item.table_maxTempSTAIR >= s_tr || item
                    .table_maxTempLD >=
                    s_tr) {
                    status = 2
                }
                timeSum++
            }
        })
        // 將區段統計結果新增到陣列中
        array = [Hours, (Minutes / 10), status, timeSum]
        output.push(array)
    }
    // 印出陣列
    return output
}