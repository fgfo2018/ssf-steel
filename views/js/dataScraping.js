$(function () {
    // 
    // document.getElementById('selectDate').valueAsDate = new Date();
    // 載入config
    var fixedtablebodyscrollTop = 0
    var config = null
    var Interval = null
    $.ajax({
        url: '/config',
        type: 'get',
        async: false,
        success: function (res) {
            config = res;
        },
        error: function (res) {
            rtn = false;
        }
    });

    
    // fixedtablebodyscrollTop = scroller1.scrollTop
    // console.log(config.web_dataScraping_initial)
    //初始化資料報表
    var clickSum = null;
    const refreshurl = `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.web_dataScraping_refresh}` //定義資料報表API位置
    initial1()
    function initial1() {
        $.ajax({
            url: `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.web_dataScraping_initial}`,
            data: range,
            method: 'GET',
            dataType: "json",
            success: function (data) {
                var maxtre = maxtr()
                var array = data
                var sum = 0
                // array.sort(function (a, b) {
                //     var keyA = new Date(a.table_start),
                //         keyB = new Date(b.table_start);
                //     // Compare the 2 dates
                //     if (keyA < keyB) return 1;
                //     if (keyA > keyB) return -1;
                //     return 0;
                // });
                // console.log(array)

                array.forEach(element => {
                    array[sum].id = sum + 1
                    var start = new Date(element.table_start)
                    var end = new Date(element.table_stop)
                    var totle = (end.getTime() - start.getTime()) / 1000
                    // console.log(totle)
                    totle = getDuration(totle)
                    var bucketNumber = element.table_bucketNumber
                    if (bucketNumber === -1) {
                        bucketNumber = ""
                    }
                    array[sum].table_bucketNumber = {
                        bucketNumber: bucketNumber,
                        table_itemName: element.table_itemName,
                        sortSum: element.table_bucketNumber + 1
                    }
                    if (element.table_frequency === null) {
                        element.table_frequency = ""
                    }
                    array[sum].table_frequency = {
                        frequency: element.table_frequency,
                        table_itemName: element.table_itemName,
                    }
                    if (element.table_bucket_temperture === null) {
                        element.table_bucket_temperture = ""
                    }
                    array[sum].table_bucket_temperture = {
                        bucketTemperture: element.table_bucket_temperture,
                        table_itemName: element.table_itemName,
                    }
                    if (element.table_remark1 === null) {
                        element.table_remark1 = ""
                    }
                    array[sum].table_remark1 = {
                        remark1: element.table_remark1,
                        table_itemName: element.table_itemName,
                    }
                    if (element.table_remark2 === null) {
                        element.table_remark2 = ""
                    }
                    array[sum].table_remark2 = {
                        remark2: element.table_remark2,
                        table_itemName: element.table_itemName,
                    }
                    // L/F
                    array[sum].table_maxTempLF = {
                        maxTr: element.table_maxTempLF,
                        status: Compare(element.table_maxTempLF, f_tr, s_tr)
                    }
                    array[sum].table_maxTempSTAIR = {
                        maxTr: element.table_maxTempSTAIR,
                        status: Compare(element.table_maxTempSTAIR, f_tr, s_tr)
                    }
                    array[sum].table_maxTempLD = {
                        maxTr: element.table_maxTempLD,
                        status: Compare(element.table_maxTempLD, f_tr, s_tr)
                    }
                    // table_start
                    array[sum].delete_vidoe = {
                        table_start: element.table_start
                    }
                    // console.log(totle)
                    array[sum].sec = totle
                    sum++
                })
                // array.sort(compareFn)
                // console.log(array.sort(compareFn))
                mydata(array)
                // $('.max_tr01').parent().css('background','#ff8d00')
                // $('.max_tr01').closest('tr').css('background','rgb(255 220 223)')
                $('.max_tr01').closest('tr').css('background', '#F4EAE4')
                // $('.max_tr02').parent().css('background','rgb(255, 0, 0)')
                $('.max_tr02').closest('tr').css('background', '#F4EAE4')
                // 判斷圖表滾輪高度
                // const scroller1 = document.querySelector(".fixed-table-body");
                // scroller1.addEventListener("scroll", (event) => {
                //     console.log(`scrollTop: ${scroller1.scrollTop}`)
                //     fixedtablebodyscrollTop = scroller1.scrollTop
                const scroller1 = document.querySelector(".fixed-table-body");
                scroller1.addEventListener('scroll', (e) => {
                    // console.log(scroller1.scrollTop);
                    fixedtablebodyscrollTop = scroller1.scrollTop
                })
                // });

            },
            error: function (err) {
                console.log('請求錯誤')
                initial1()
                console.log('重新讀取資料')
            },
        })
    }
    // 排序
    function compareFn(a, b) {
        var ae = a.table_bucketNumber.bucketNumber
        if (ae === '') {
            ae = -1
        }
        if (ae < b.table_bucketNumber.bucketNumber) {
            return -1;
        }
        if (ae > b.table_bucketNumber.bucketNumber) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }
    // 警報input
    var alarmInput = false
    $('.toolbar').on('focus', 'input', function () {
        alarmInput = true
    })
    $('.toolbar').on('focusout', 'input', function () {
        // if($(this).val() === $(this).attr("data-value")) {
        alarmInput = false
        // }
    })
    // input 比對 
    // var tempInputVal = null;
    $('#table2').on('focus', 'input', function () {
        // tempInputVal = $(this).val()
        $(this).addClass("thisdataupdata")
    })
    $('#table2').on('focusout', 'input', function () {
        var tempInputVal = $(this).attr("data-tmp")
        // console.log(tempInputVal, $(this).val())
        if (tempInputVal !== $(this).val()) {
            // console.log("this is updata")
            $(this).addClass("thisdataupdata")
        } else {
            $(this).removeClass("thisdataupdata")
        }
    })
    // $("form").on("submit", function (event) {
    // 	event.preventDefault();
    // 	console.log($(".thisdataupdata").serializeArray());
    // 	$(".thisdataupdata").removeClass("thisdataupdata")
    // });

    var today = new Date();
    listday = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
        today.getDate().toString().padStart(2, '0') + ' 23:59:59'
    // today.setDate(today.getDate() - 3)
    today = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
        (today.getDate()).toString().padStart(2, '0') + ' 00:00:00'
    var range = {
        'table_timeselectStart': today,
        'table_timeselectStop': listday
    }

    $(window).keypress(function (event) {
        // if (Interval !== null) {
        //     clearInterval(Interval)
        //     Interval = null
        // }
        const scroller1 = document.querySelector(".fixed-table-body");
        fixedtablebodyscrollTop = scroller1.scrollTop
        if (event.which === 13) {
            event.preventDefault();
            if (alarmInput) {
                var data = {
                    "setting_first_alarm_temperature": $('.f_tr').val(),
                    "setting_second_alarm_temperature": $('.s_tr').val()
                }
                if ($('.f_tr').val() > $('.s_tr').val()) {
                    return false
                }
                data = JSON.stringify(data)
                // console.log(data)
                $.ajax({
                    url: `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.apiDataChanged}`,
                    method: 'POST',
                    data: data,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    success: function (res) {
                        startRefresh(range)
                        message('警報溫度已更新')
                    },
                    error: function (err) { }
                })
                // console.log(alarmInput)
                alarmInput = false;
            } else {
                $('input').blur()
                var data = $(".thisdataupdata").serializeArray()
                var tmp = []
                var tmp2 = []
                var typeName = ['BN', 'FQ', 'BT', 'RE1', 'RE2']
                var output = []
                data.forEach(function (element) {
                    var index = element.name.split("_")
                    index = {
                        type: index[0],
                        time: `${index[1]}_${index[2]}`,
                        value: element.value
                    }
                    tmp.push(index)
                })
                // table_bucketNumber: "" = BN
                // table_frequency: "" = FQ
                // table_bucket_temperture: "" = BT
                // table_remark1: "" = RE1
                // table_remark2: "" = 
                tmp.forEach((element) => {
                    tmp2[element.time] = {
                        table_itemName: element.time,
                        table_bucketNumber: "",
                        table_frequency: "",
                        table_bucket_temperture: "",
                        table_remark1: "",
                        table_remark2: ""
                    }
                })
                Object.keys(tmp2).forEach((key) => {
                    typeName.forEach((element) => {
                        console.log(document.querySelector(`[name='${element}_${key}']`).value)
                        var value = document.querySelector(`[name='${element}_${key}']`).value
                        if (element === "BN") {
                            tmp2[key].table_bucketNumber = value
                        } else if (element === "FQ") {
                            tmp2[key].table_frequency = value
                        } else if (element === "BT") {
                            tmp2[key].table_bucket_temperture = value
                        } else if (element === "RE1") {
                            tmp2[key].table_remark1 = value
                        } else if (element === "RE2") {
                            tmp2[key].table_remark2 = value
                        }
                    })

                })
                Object.keys(tmp2).forEach((key) => {
                    output.push({
                        table_itemName: tmp2[key].table_itemName,
                        table_bucketNumber: tmp2[key].table_bucketNumber,
                        table_frequency: tmp2[key].table_frequency,
                        table_bucket_temperture: tmp2[key].table_bucket_temperture,
                        table_remark1: tmp2[key].table_remark1,
                        table_remark2: tmp2[key].table_remark2
                    })
                })
                // tmp.forEach((element) => {
                //     if (element.type === "BN"){
                //         tmp2[element.time].table_bucketNumber = element.value
                //     }else if (element.type === "FQ"){
                //         tmp2[element.time].table_frequency = element.value
                //     } else if (element.type === "BT") {
                //         tmp2[element.time].table_bucket_temperture = element.value
                //     } else if (element.type === "RE1") {
                //         tmp2[element.time].table_remark1 = element.value
                //     }
                // })
                // data.forEach(function (element) {
                //     output.push({
                //         table_itemName: element.name,
                //         table_bucketNumber: element.value,
                //         table_frequency: "0",
                //         table_bucket_temperture: "0",
                //         table_remark1: "0",
                //         table_remark2: null
                //     })
                // })
                console.log(output)
                output = JSON.stringify(output)
                $(".thisdataupdata").removeClass("thisdataupdata")
                $.ajax({
                    url: `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.analysisSetnumber}`,
                    data: output,
                    method: 'POST',
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    success: function (res) {

                        startRefresh(range, 1)
                        message('桶號已經修改完成')
                        const data = $('#table2').bootstrapTable(
                            'getRowByUniqueId',
                            1)
                        getDATA(data)
                        setTimeout(() => {
                            const scroller1 = document.querySelector(".fixed-table-body");
                            scroller1.scrollTop = fixedtablebodyscrollTop
                            // console.log(fixedtablebodyscrollTop)
                        }, 10)

                    },
                    error: function (err) {
                        message('資料錯誤，尚未修改桶號，自動恢復上次儲存資料', 1)
                        startRefresh(range, 1)
                    }
                })
            }
        }
    });



    // 日期更新後執行
    $('input[name="dates"]').on('apply.daterangepicker', function (ev, picker) {
        // console.log(picker.startDate.format('YYYY-MM-DD'));
        // console.log(picker.endDate.format('YYYY-MM-DD'));
        var datesstart = picker.startDate.format('YYYY-MM-DD') + ' 00:00:00'
        var datesstop = picker.endDate.format('YYYY-MM-DD') + ' 23:59:59'
        range = {
            'table_timeselectStart': datesstart,
            'table_timeselectStop': datesstop
        }
        startRefresh(range)
        // console.log(range)
    });
    // $('#selectDate').on('change', function (ev) {
    //     console.log($(this).val());
    //     var datesstart = $(this).val() + ' 00:00:00'
    //     var datesstop = $(this).val() + ' 23:59:59'
    //     range = {
    //         'table_timeselectStart': datesstart,
    //         'table_timeselectStop': datesstop
    //     }
    //     startRefresh(range)
    //     // console.log(range)
    // });
    // 按刷新鍵觸發此動作
    $('.table-responsive').on('click', 'button', function () {
        if (this.name === "refresh") {
            // console.log(range)
            startRefresh(range)
            // range = JSON.stringify(range)
        }
    })
    // 刷新請求作業
    function startRefresh(time, err) {
        // console.log(time, refreshurl)
        time = JSON.stringify(time)
        $.ajax({
            url: refreshurl,
            data: time,
            method: 'POST',
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                var maxtre = maxtr()
                var array = data
                var sum = 0
                // array.sort(function (a, b) {
                //     var keyA = new Date(a.table_start),
                //         keyB = new Date(b.table_start);
                //     // Compare the 2 dates
                //     if (keyA < keyB) return 1;
                //     if (keyA > keyB) return -1;
                //     return 0;
                // });
                array.forEach(element => {
                    array[sum].id = sum + 1
                    var start = new Date(element.table_start)
                    var end = new Date(element.table_stop)
                    var totle = (end.getTime() - start.getTime()) / 1000
                    // console.log(totle)
                    totle = getDuration(totle)
                    var tmpeNumber = array[sum].table_bucketNumber
                    if (array[sum].table_bucketNumber === -1) {
                        array[sum].table_bucketNumber = ""
                    }
                    array[sum].table_bucketNumber = {
                        bucketNumber: element.table_bucketNumber,
                        table_itemName: element.table_itemName,
                        sortSum: tmpeNumber + 1
                    }
                    if (element.table_frequency === null) {
                        element.table_frequency = ""
                    }
                    array[sum].table_frequency = {
                        frequency: element.table_frequency,
                        table_itemName: element.table_itemName,
                    }
                    if (element.table_bucket_temperture === null) {
                        element.table_bucket_temperture = ""
                    }
                    array[sum].table_bucket_temperture = {
                        bucketTemperture: element.table_bucket_temperture,
                        table_itemName: element.table_itemName,
                    }
                    if (element.table_remark1 === null) {
                        element.table_remark1 = ""
                    }
                    array[sum].table_remark1 = {
                        remark1: element.table_remark1,
                        table_itemName: element.table_itemName,
                    }
                    if (element.table_remark2 === null) {
                        element.table_remark2 = ""
                    }
                    array[sum].table_remark2 = {
                        remark2: element.table_remark2,
                        table_itemName: element.table_itemName,
                    }
                    // L/F
                    array[sum].table_maxTempLF = {
                        maxTr: element.table_maxTempLF,
                        status: Compare(element.table_maxTempLF, f_tr,
                            s_tr)
                    }
                    array[sum].table_maxTempSTAIR = {
                        maxTr: element.table_maxTempSTAIR,
                        status: Compare(element.table_maxTempSTAIR, f_tr,
                            s_tr)
                    }
                    array[sum].table_maxTempLD = {
                        maxTr: element.table_maxTempLD,
                        status: Compare(element.table_maxTempLD, f_tr,
                            s_tr)
                    }
                    // table_start
                    array[sum].delete_vidoe = {
                        table_start: element.table_start
                    }
                    // console.log(totle)
                    array[sum].sec = totle
                    sum++
                })
                // array.sort(compareFn)
                // console.log(array)
                updata(array)

                // $('.max_tr01').parent().css('background','#ff8d00')
                // $('.max_tr01').closest('tr').css('background','rgb(255 220 223)')
                $('.max_tr01').closest('tr').css('background', '#F4EAE4')
                // $('.max_tr02').parent().css('background','rgb(255, 0, 0)')
                $('.max_tr02').closest('tr').css('background', '#F4EAE4')
                if (err === undefined) {
                    message('資料已刷新')
                }
                clickSum = null
                var d = $('#table2').bootstrapTable(
                    'getRowByUniqueId',
                    1)
                getDATA(d)
                const scroller1 = document.querySelector(".fixed-table-body");
                scroller1.addEventListener('scroll', (e) => {
                    // console.log(scroller1.scrollTop);
                    fixedtablebodyscrollTop = scroller1.scrollTop
                })
            },
            error: function (err) {
                console.log(err)
            },
        })
    }
    // 取得警報溫度
    function maxtr() {
        var array = []
        $.ajax({
            url: `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.dataNormal}`,
            dataType: "json",
            method: 'GET',
            async: false, // 關閉非同步作業
            success: function (res) {
                f_tr = res.setting_first_alarm_temperature
                s_tr = res.setting_second_alarm_temperature
                array = {
                    f_tr: f_tr,
                    s_tr: s_tr,
                }
                $(".f_tr").val(f_tr)
                $(".s_tr").val(s_tr)
                $(".f_tr").attr("data-value", f_tr)
                $(".s_tr").attr("data-value", s_tr)
            },
            error: function (err) { }
        })
        return array
    }
    // 計算超溫狀態
    function Compare(int, f_tr, s_tr) {
        var output = null
        if (int < f_tr) {
            output = 0
        } else if (int >= f_tr && int < s_tr) {
            output = 1
        } else if (int >= s_tr) {
            output = 2
        }
        return output;
    }
    // 初始
    function mydata(mydata2) {
        $('#table2').bootstrapTable(database(mydata2), function () {
            // $('.max_tr01').closest('tr').css('background', '#F4EAE4')
            // $('.max_tr02').closest('tr').css('background', '#F4EAE4')
            // console.log(123)
        });
        $('#table2').on('click', '.table-borderless',
            function () {
                // console.log(123)
            }
        )
    }
    // 更新
    function updata(mydata2) {
        $('#table2').bootstrapTable('destroy');
        $('#table2').bootstrapTable(database(mydata2), function () {
            // $('.max_tr01').closest('tr').css('background', '#F4EAE4')
            // $('.max_tr02').closest('tr').css('background', '#F4EAE4')
            // console.log(123)
        });
        // $('#table2').bootstrapTable('refreshOptions', database(mydata2));
    }
    // table格式化
    function database(mydata2) {
        var array = {
            data: mydata2,
            classes: 'table table-borderless  table-hover data-checkbox="true" data-field="',
            exportTypes: ['txt', 'csv', 'excel'], // 導出類型
            exportDataType: 'all', // basic', 'all', 'selected'
            // showToggle: true,
            // sortReset: true,
            columns: [{
                title: '順序',
                field: 'id',
                align: 'center',
                sortable: true,
            },
            {
                title: '桶號',
                field: 'table_bucketNumber',
                align: 'center',
                // sortable: false,
                sortable: true,
                formatter: bucketNumberForm,
            },
            {
                title: '回數',
                field: 'table_frequency',
                align: 'center',
                sortable: false,
                // sortable: true,
                formatter: frequency
            }
                ,
            {
                title: '精煉爐溫度',
                field: 'table_bucket_temperture',
                align: 'center',
                sortable: false,
                // sortable: true,
                formatter: bucketTemperture
            },
            {
                title: '開始時間',
                field: 'table_start',
                align: 'center',
                sortable: true,
            },
            {
                title: '終止時間&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                field: 'table_stop',
                align: 'center',
                sortable: false,
                // width: '300px'
            },
            {
                title: '總秒數',
                field: 'sec',
                align: 'center',
                sortable: false,
            },
            {
                title: 'L/F 副料區',
                field: 'table_maxTempLF',
                align: 'center',
                sortable: false,
                formatter: maxTemp,
            },
            {
                title: '出鋼室地下樓梯',
                field: 'table_maxTempSTAIR',
                align: 'center',
                sortable: false,
                formatter: maxTemp,
            },
            {
                title: 'L/D 2F平台',
                field: 'table_maxTempLD',
                align: 'center',
                sortable: false,
                formatter: maxTemp,
            }, {
                title: '備註',
                field: 'table_remark1',
                align: 'center',
                sortable: false,
                formatter: remark1
            }
                , {
                title: '',
                field: 'table_remark2',
                align: 'center',
                sortable: false,
                formatter: remark2
            }
                , {
                title: '刪除',
                field: 'delete_vidoe',
                align: 'center',
                sortable: false,
                formatter: deleteVidoe,

            }
                // ,
                // {
                // 	title: '拍照時間',
                // field: 'table_shootingTime',
                // 	align: 'center',
                // 	sortable: true,
                // }
            ]
        }
        return array
    }
    var dataJSON = null
    var reciprocalInt = null
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'))
    $('.table-responsive').on('click', '#inDeleteVideo', function () {
        myModal.show()
        // console.log($(this).attr("data-date"))
        var date = new Date($(this).attr("data-date"))
        time = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + "_T" + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2)
        dataJSON = [
            {
                video_name: time
            }
        ]
        $(".videotimename").html(time)
        $(".videotimename1").html($(this).attr("data-date"))
        // var reciprocal = 0
        // $("#btnDeleteVidoe").attr('disabled', true);
        // $("#btnDeleteVidoe>span").html(8)
        // if (reciprocalInt !== null) {
        //     clearInterval(reciprocalInt)
        // }
        // reciprocalInt = setInterval(() => {
        //     if (reciprocal < 0) {
        //         $("#btnDeleteVidoe>span").html("")
        //         $("#btnDeleteVidoe").attr('disabled', false);
        //         reciprocal = 0
        //         clearInterval(reciprocalInt)
        //         reciprocalInt = null
        //     } else {
        //         $("#btnDeleteVidoe>span").html(reciprocal)
        //         reciprocal -= 1
        //     }

        // }, 1000)

    })
    $("#btnDeleteVidoe").click(function () {
        myModal.hide()
        deleteVideoAPI()
    })
    $("#btnDeleteVidoeclo").click(function () {
        myModal.hide()
    })
    function deleteVideoAPI() {
        

        $.ajax({
            url: `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.apiDeleteVideo}`,
            type: 'post',
            // dataType: "application/json",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(dataJSON),
            // async: false,
            success: (res) => {
                // console.log('刪除')
                startRefresh(range)
                setTimeout(() => {
                    const data = $('#table2').bootstrapTable(
                        'getRowByUniqueId',
                        1)
                    getDATA(data)
                    const scroller1 = document.querySelector(".fixed-table-body");
                    scroller1.scrollTop = fixedtablebodyscrollTop
                }, 500)

                console.log('刪除');
                
                // config = res;
            },
            error: function (res) {
                // rtn = false;
            }
        });
    }

    function deleteVidoe(e) {
        // console.log(e)
        return [`<div style="z-index:999;" data-date="${e.table_start}" id="inDeleteVideo"><img src="/static/trash.png" width="30px" class="me-3" /></div>`]
    }
    // input輸入框
    function bucketNumberForm(e) {
        try {
            return [`<input type="number" min="0" style="width:50px;text-align: center;" name="BN_${e
                .table_itemName}" value="${e
                    .bucketNumber}" data-tmp="${e
                        .bucketNumber}"><span class="d-none">${e
                            .bucketNumber}</span>`]
        } catch { return [] }
    }
    function frequency(e) {
        try {
            return [`<input type="number" min="0" style="width:50px;text-align: center;" name="FQ_${e
                .table_itemName}" value="${e.frequency}" data-tmp="${e.frequency}">`]
        } catch { return [] }
    }
    function bucketTemperture(e) {
        try {
            return [`<input type="number" min="0" style="width:50px;text-align: center;" name="BT_${e
                .table_itemName}" value="${e.bucketTemperture}" data-tmp="${e.bucketTemperture}">`]
        } catch { return [] }
    }
    function remark1(e) {
        try {
            return [`<input type="text" min="0" style="width:50px;text-align: center;" name="RE1_${e
                .table_itemName}" value="${e.remark1}" data-tmp="${e.remark1}">`]
        } catch { return [] }
    }
    function remark2(e) {
        try {
            return [`<input type="text" min="0" style="width:50px;text-align: center;" name="RE2_${e
                .table_itemName}" value="${e.remark2}" data-tmp="${e.remark2}">`]
        } catch { return [] }
    }
    // 合併溫度方法
    function maxTemp(e) {
        if (e.status === 0) {
            return [e.maxTr + '°C']
        } else if (e.status === 1) {
            return ['<span class="max_tr01">' + e.maxTr + '°C</span>']
        } else if (e.status === 2) {
            return ['<span class="max_tr02">' + e.maxTr + '°C</span>']
        }
    }
    // 秒 轉 分、時、天，並且隱藏時間未到的單位
    function getDuration(second) {
        var days = Math.floor(second / 86400);
        var hours = Math.floor((second % 86400) / 3600);
        var minutes = Math.floor(((second % 86400) % 3600) / 60);
        var seconds = Math.floor(((second % 86400) % 3600) % 60);
        if (second < 60) {
            var duration = seconds + "秒";
        } else if (second >= 60 && second < 3600) {
            var duration = minutes + "分" + seconds + "秒";
        } else if (second >= 3600 && second < 86400) {
            var duration = hours + "時<br />" + minutes + "分" + seconds + "秒";
        } else if (second >= 86400) {
            var duration = days + "天" + hours + "時<br />" + minutes + "分" + seconds + "秒";
        }
        return duration;
    }
    // 日期選擇
    $('input[name="dates"]').daterangepicker({
        locale: formatDates(),
        showDropdowns: false,
        maxDate: today,
        maxSpan: {
            "days": 7
        },
    });

    //選擇日期格式
    function formatDates() {
        return {
            "format": "YYYY/MM/DD",
            "separator": " - ",
            "applyLabel": "確定",
            "cancelLabel": "取消",
            "fromLabel": "表單",
            "toLabel": "至",
            "customRangeLabel": "自訂",
            "daysOfWeek": [
                "日",
                "一",
                "二",
                "三",
                "四",
                "五",
                "六"
            ],
            "monthNames": [
                "1月",
                "2月",
                "3月",
                "4月",
                "5月",
                "6月",
                "7月",
                "8月",
                "9月",
                "10月",
                "11月",
                "12月"
            ],
            "firstDay": 0
        }
    }
    // ----------------------------------------------------------------
    // 基于准备好的dom，初始化echarts实例
    var Trend = echarts.init(document.getElementById('main'));
    // const colorPalette2 = ['#7180AC', '#2B4570', '#A8D0DB', '#E49273']
    // 指定图表的配置项和数据
    var testasd = 0;
    var optionTrend = {
        title: {
            // text: ''
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                this_video = document.getElementById("videoList");
                this_video.currentTime = params[0].name
                this_video.pause()
                // Get your data from params, eg: params[0].data
                var res =
                    "<div class='tooltip-value' style=''><p>影像第" +
                    params[0].name +
                    "秒數</p></div>";
                for (var i = 0; i < params.length; i++) {
                    res +=
                        `<div class='tooltip-point' style=""><span
										style="background-color:${[params[i].color,]};"></span>${params[i].seriesName}:${params[i].data}°C</div>
								`;
                }
                return res;
            }
        },
        legend: {
            data: ['L/F 副料區', '出鋼室地下樓梯', 'L/D 2F平台'],
            //   selectedMode: 'single', // 設定顯示單一圖例的圖形，點選可切換
            top: 10,
            right: 0,
            left: "center",
            textStyle: {
                color: '#666',
                fontSize: 9,
            }
        },
        // color: 'colorPalette2',
        grid: {
            left: '2%',
            right: '3%',
            top: '15%',
            containLabel: true, //grid区域是否包含坐标轴的刻度标签。

        },
        toolbox: {
            show: true,
            left: "right",
            top: "top",
            itemSize: 30,
            // show: false,
            feature: {
                // saveAsImage: {}
                myTool2: {
                    show: false,
                    title: '自動播放',
                    icon: 'image://static/play.png',
                    onclick: function () {
                        // console.log(testasd);
                        testasd++
                        Trend.setOption({
                            toolbox: {
                                feature: {
                                    myTool2: {
                                        title: '暫停',
                                        icon: 'image://static/pause.png',
                                    }
                                }
                            }
                        })
                    }
                }
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            name: '(s)',
            show: true,
            interval: 1,
            triggerEvent: true,
            boundaryGap: false,
            // boundaryGap: true,
        },
        yAxis: {
            // type: 'value'

            type: 'value',
            name: '(°C)',
            min: 200,
            // max: 350,
            show: true,
        },
        series: [{
            name: 'L/F 副料區',
            type: 'line',
            color: '#77849A',
            smooth: true,
        },
        {
            name: '出鋼室地下樓梯',
            type: 'line',
            color: '#D0CAC4',
            smooth: true,
        },
        {
            name: 'L/D 2F平台',
            type: 'line',
            color: '#CF8786',
            smooth: true,
        },
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    Trend.setOption(optionTrend);
    // Trend.on('click', function (params) {
    // 	var click_this_val = null
    // 	if (params.componentType === 'series') {
    // 		click_this_val = params.name
    // 	} else if (params.componentType === 'xAxis') {
    // 		click_this_val = params.value
    // 	}
    // 	this_video = document.getElementById("videoList");
    // 	this_video.currentTime = click_this_val
    // 	this_video.pause()
    // });
    // 讀取目前影片撥放時間(暫無用處)
    // this_video = document.getElementById("videoList");
    // this_video.addEventListener("timeupdate",
    // 	function (ev) {
    // 		// console.log(ev.target.currentTime);
    // 	});
    // 初始化_讓影片以及趨勢圖讀取資料報表第一條
    var initInterval = null;
    initInterval = setInterval(function () {
        const data = $('#table2').bootstrapTable(
            'getRowByUniqueId',
            1)
        if (data.id === 1) {
            getDATA(data)
            clearInterval(initInterval)
        }
    }, 1000)
    // 點擊報表觸發/影片趨勢圖連動
    const testdata = $('#table2').bootstrapTable(
        'getRowByUniqueId',
        1)
    $('.table-responsive').on('click', 'tr', function () {
        // if (Interval !== null) {
        //     clearInterval(Interval)
        //     Interval = null
        // }
        // var id = parseInt($(this).attr("data-index")) + 1
        var id = parseInt($(this).attr("data-uniqueid"))
        $('.max_tr01').closest('tr').css('background', '#F4EAE4')
        $('.max_tr02').closest('tr').css('background', '#F4EAE4')

        if (!isNaN(id)) { // 判斷id是否有數字
            if (clickSum !== id) { // 判斷是否點擊同一列
                if (Interval !== null) {
                    clearInterval(Interval)
                }
                $('.active').removeClass('active')
                $(this).addClass('active')
                const data = $('#table2').bootstrapTable(
                    'getRowByUniqueId',
                    id)
                // console.log(id)
                getDATA(data)
            }
        }
        clickSum = id
    })

    function getDATA(data) {

        // console.log(data)
        const download = `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.web_dataScraping_download}` + data.table_itemName + '.txt' //設定api位置
        const videodownload = `${window.location.protocol}//${window.location.hostname}:${config.backEndPort}${config.web_dataScraping_download}` + data.table_itemName + '.mp4'
        // $("#videoList").attr("src", video)
        // 將影片下載到內部(解決steam導致無法選擇影片進度問題)
        blobVideo(videodownload)
        // 
        $.ajax({
            url: download,
            method: 'GET',
            dataType: "json",
            success: function (response) {
                // response.time = fix(response.time, 2)
                timesum = response.time
                var summary = 0
                timesum.forEach(function (time) {
                    timesum[summary] = fix(time, 2)
                    summary++
                })
                // console.log(timesum)

                Trend.setOption({
                    xAxis: {
                        data: timesum
                    },
                    series: [{
                        name: 'L/F 副料區',
                        data: response.temperature_LF
                    },
                    {
                        name: '出鋼室地下樓梯',
                        data: response.temperature_STAIR
                    },
                    {
                        name: 'L/D 2F平台',
                        data: response.temperature_LD
                    },
                    ]
                });
                // 自動高亮
                var hover = true //如果鼠標在圖表上，就設定為false 讓Interval不會再更新高亮的index
                var video = document.getElementById("videoList");
                video.removeAttribute("controls")
                $('#videoList').hover(function () {
                    if (hover) {
                        video.setAttribute("controls", "controls")
                        hover = false
                    }
                }, function () {
                    video.removeAttribute("controls")
                    hover = true
                });
                Trend.getZr().on('mousemove', function () {
                    if (hover) {
                        video.setAttribute("controls", "controls")
                        hover = false
                    }
                });
                Trend.getZr().on('globalout', function () {
                    video.removeAttribute("controls")
                    hover = true
                });
                let currentIndex = -1;
                if (Interval !== null) {
                    clearInterval(Interval)
                    Interval = null
                }
                Interval = setInterval(function () {
                    if (hover) {
                        var dataLen = response.time.length;
                        Trend.dispatchAction({
                            type: 'downplay',
                            seriesIndex: 0,
                            dataIndex: currentIndex
                        });
                        currentIndex = (currentIndex + 1) % dataLen;
                        Trend.dispatchAction({
                            type: 'highlight',
                            seriesIndex: 0,
                            dataIndex: currentIndex
                        });
                        Trend.dispatchAction({
                            type: 'showTip',
                            seriesIndex: 0,
                            dataIndex: currentIndex
                        });
                        // 影片設定
                        // this_video = document.getElementById("videoList");
                        // this_video.currentTime = response.time[currentIndex]
                        // this_video.pause()
                    }
                }, 1500);
                const scroller1 = document.querySelector(".fixed-table-body");
                scroller1.scrollTop = fixedtablebodyscrollTop
            },
            error: function (err) { }
        })
    }

    function fix(num, N) {
        var base = Math.pow(10, N);
        // base = N * 10;
        return Math.floor(num * base) / base
    }

    function blobVideo(url) {
        // console.log(url);
        $('.video-loading>div').html('影像載入中...')
        $('.video-loading').css('opacity', 1)
        $('.video-loading-bg').css('opacity', 1)
        $('.video-loading-bg').css('width', '75%')
        var video = document.getElementById("videoList")
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'blob';
        req.onload = function () {
            if (this.status === 200) {
                var videoBlob = this.response;
                // console.log(videoBlob)
                var vid = URL.createObjectURL(videoBlob);
                video.src = vid;
                if (videoBlob.type === 'text/html') {
                    $('.video-loading-bg').css('width', '100%')
                    $('.video-loading>div').html('該區段並無找到錄製影像')
                } else {
                    setTimeout(function () {
                        $('.video-loading-bg').css('width', '100%')
                        setTimeout(function () {
                            $('.video-loading-bg').css('width', '0%')
                            $('.video-loading').css('opacity', 0)
                            $('.video-loading-bg').css('opacity', 0)
                        }, 300)
                    }, 1000)
                }

            }
        }
        req.onerror = function () {
            // Error
        }
        req.send();
    }
    $('.testclick').click(function () {
        var test = 'test'
        message(test)
    })

    function message(message, err) {
        var s = 'bg-primary'
        if (err !== undefined) {
            s = 'btn-danger'
        }
        setTimeout(function () {
            var id = Math.floor(Math.random() * 99999);
            id = 'name' + id
            var html = `<div id="liveToast" class="Toast-custom ${s} mb-1 ${id}">
			<div class="Toastbody-custom">
				${message}
			</div>
		</div>`
            $('.dataScraping-message').append(html)
            setTimeout(function () {
                $('.' + id).fadeOut();
                $('.' + id).fadeOut(3000);
            }, 2000)
        }, 500)
    }
});