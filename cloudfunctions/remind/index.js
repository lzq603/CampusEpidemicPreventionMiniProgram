// 云函数入口文件
/**
 *对Date的扩展，将 Date 转化为指定格式的String
 *月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *例子：
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  var date = new Date()

  if(event.type=='finish'){
    const db = cloud.database()
    const _ = db.command
    var counsellor = null
    await db.collection('users').doc(event.id).get().then(res => {
      counsellor = res
    })
    // 发送通知
    console.log(counsellor)
    try {
      //counsellor.data._openid,
      return await cloud.openapi.subscribeMessage.send({
        touser: counsellor.data._openid,
        page: 'pages/checkin/checkin',
        lang: 'zh_CN',
        data: {
          "thing1": {
            "value": "您的班级已完成体温填报"
          },
          "date2": {
            "value": date.format("yyyy年MM月dd日 hh:mm")
          }
        },
        templateId: 'E0u3PLO8OThB8pwGhwJn68ehfYzMcBltNjQPOoEAhYY'
        // miniprogram_state: 'developer'
      })
      // console.log(result)
    } catch (err) {
      console.log(err)
      return err
    }
  }
  // 获取未上报体温的openid
  openids = []
  await db.collection('users').where(_.or([{
    userInfo: {
      temperatures: {
        am: null
      }
    }
  }, {
    userInfo: {
      temperatures: {
        pm: null
      }
    }
  }])).field({
    _openid:true
  }).get().then(res=>{
    for(var i = 0;i < res.data.length;i++){
      openids.push(res.data[i]._openid)
    }
  })
  // 向每一个未填体温的学生/教师发送提醒
  let results = []
  for (var i = 0; i < openids.length; i++) {
    // 处理拒收订阅消息异常
    try {
      var result = await cloud.openapi.subscribeMessage.send({
        touser: openids[i],
        page: 'pages/checkin/checkin',
        lang: 'zh_CN',
        data: {
          "thing1": {
            "value": "上报体温"
          },
          "time2": {
            "value": date.format("yyyy-MM-dd 11:00")
          }
        },
        templateId: 'bzVdoPY3-KljJBAGe_vGlOz7PRUsGqlZITm85uKyUWk'
        // miniprogram_state: 'developer'
      })
      console.log(result)
      results.push(result)
    } catch (err) {
      console.log(err)
      results.push(err)
    }
  }
  return results
}