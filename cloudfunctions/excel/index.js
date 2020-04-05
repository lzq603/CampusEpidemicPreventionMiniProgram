// 云函数入口文件
const cloud = require('wx-server-sdk')
const Excel = require('exceljs');
const fs = require('fs')
cloud.init()
var date = new Date()
const title = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日体温登记表"
/**
 * 生成学生体温数据的Excel表格
 * 参数：
 *    classes: 字符串数组，表示获取哪些班级的数据。如：["信1605-1", "土1605-1"]
 * 返回值：
 *    fileID: 云存储文件ID
 */
exports.main = async (event, context) => {

  const db = cloud.database()
  const _ = db.command
  const now = new Date()
  var isStudent = true

  let { classes, department } = event
  console.log(classes, department)
  var ws_data = []
  // 遍历每个班级
  for (let class_ of classes) {

    await db.collection('users').where({
      userInfo: {
        class_: class_
      }
    }).orderBy('userInfo.no', 'asc').get().then(user_datas => {
      // 一个班的学生
      var stu_data = []
      // 遍历班级内每个学生j
      for (let { userInfo } of user_datas.data) {
        let checked = userInfo.last_checkin_at && userInfo.last_checkin_at.toDateString() === now.toDateString()
        var row = [
          userInfo.no,
          userInfo.name,
          checked && userInfo.temperatures.pm ? userInfo.temperatures.pm : '未填写',
          checked && userInfo.temperatures.am ? userInfo.temperatures.am : '未填写',
          userInfo.class_,
          ''
        ]
        if ((row[2] != '未填写' && row[2] > 37.3) || (row[3] != '未填写' && row[3] > 37.3)) {
          row[5] = '是'
        } else if ((row[2] != '未填写' && row[2] <= 37.3) && (row[3] != '未填写' && row[3] <= 37.3)) {
          row[5] = '否'
        }
        row.push(checked && userInfo.lastLocation || '未填写')
        row.push(checked && userInfo.location || '未填写')
        row.push(userInfo.hasReturnees)
        row.push(userInfo.members && userInfo.members.length || 0)
        for (let { temperatures: { am, pm } } of userInfo.members || []) {
          row.push(checked && pm || '未填写', checked && am || '未填写')
        }
        stu_data.push(row)
      }
      ws_data.push(stu_data)
    })
  }

  if (department) {
    isStudent = false
    var tea_data = []

    await db.collection('users').where({
      userInfo: {
        department,
        type: _.neq('学生')
      }
    }).orderBy('userInfo.no', 'asc').get().then(user_datas => {

      // 遍历班级内每个教职工
      for (let { userInfo } of user_datas.data) {
        let checked = userInfo.last_checkin_at && userInfo.last_checkin_at.toDateString() === now.toDateString()
        var row = [
          userInfo.no,
          userInfo.name,
          checked && userInfo.temperatures.pm ? userInfo.temperatures.pm : '未填写',
          checked && userInfo.temperatures.am ? userInfo.temperatures.am : '未填写',
          userInfo.department,
          ''
        ]
        if ((row[2] != '未填写' && row[2] > 37.3) || (row[3] != '未填写' && row[3] > 37.3)) {
          row[5] = '是'
        } else if ((row[2] != '未填写' && row[2] <= 37.3) && (row[3] != '未填写' && row[3] <= 37.3)) {
          row[5] = '否'
        }
        row.push(checked && userInfo.lastLocation || '未填写')
        row.push(checked && userInfo.location || '未填写')
        row.push(userInfo.hasReturnees)
        row.push(userInfo.members && userInfo.members.length || 0)
        for (let { temperatures: { am, pm } } of userInfo.members || []) {
          row.push(checked && pm || '未填写', checked && am || '未填写')
        }
        tea_data.push(row)
      }
    })
    ws_data.push(tea_data)
  }

  return gen_excel_buffer(ws_data, isStudent, event.classes)
}

function gen_excel_buffer(datas, isStudent, class_name) {
  console.log(datas)
  console.log('isStudent:' + isStudent)
  // 表格属性
  var sheet_pro = {
    defaultRowHeight: 21,    // 默认行高
    defaultColWidth: 9.5   // 默认列宽
  }
  // 新建工作簿
  var workbook = new Excel.Workbook()
  for (var k = 0; k < datas.length; k++) {
    // 第k组数据
    var data = datas[k]
    // 新建工作表
    var worksheet = workbook.addWorksheet(data[0] ? data[0][4] : class_name[k], { properties: sheet_pro })

    let max_member_num = Math.max(...data.map(it => it[9]))
    if (isStudent) {
      // 添加标题
      worksheet.getRow(1).values = [title, , , , ,]
      worksheet.getRow(2).values = ['学号', '姓名', '体温', , '班级', '是否发烧', '位置',,'家庭人员是否有回国人员', '家庭其它成员数量']
      worksheet.getRow(3).values = ['学号', '姓名', '昨天中午', '今天上午', '班级', '是否发烧', '昨天', '今天', '家庭人员是否有回国人员', '家庭其它成员数量']
      // 定义列
      worksheet.columns = [
        { key: 'no', width: 9.5 },
        { key: 'name', width: 9.5 },
        { key: 'am', width: 9.5 },
        { key: 'pm', width: 9.5 },
        { key: 'class_', width: 14 },
        { key: 'isFever', width: 9.5 }
      ];
    } else {
      // 添加标题
      worksheet.getRow(1).values = [title, , , , ,]
      worksheet.getRow(2).values = ['工号', '姓名', '体温', , '学院', '是否发烧', '位置',, '家庭人员是否有回国人员', '家庭其它成员数量']
      worksheet.getRow(3).values = ['工号', '姓名', '昨天中午', '今天上午', '学院', '是否发烧', '昨天','今天', '家庭人员是否有回国人员', '家庭其它成员数量']
      // 定义列
      worksheet.columns = [
        { key: 'no', width: 9.5 },
        { key: 'name', width: 9.5 },
        { key: 'am', width: 9.5 },
        { key: 'pm', width: 9.5 },
        { key: 'department', width: 20 },
        { key: 'isFever', width: 9.5 }
      ];
    }

    let r2_values = worksheet.getRow(2).values
    let r3_values = worksheet.getRow(3).values
    for (let i = 0; i < max_member_num; ++i) {
      r2_values.push(`家庭成员${i + 1}`, '')
      r3_values.push('昨天中午', '今天上午')
    }

    worksheet.getRow(2).values = r2_values
    worksheet.getRow(3).values = r3_values

    worksheet.getColumn(7).width = 20
    worksheet.getColumn(8).width = 20
    worksheet.getColumn(9).width = 20
    worksheet.getColumn(10).width = 16
    for(let i=0;i<max_member_num*2;++i) {
      worksheet.getColumn(9+1+1+i).width=9.5
    }

    // 合并单元格
    worksheet.mergeCells('A1:F1')
    worksheet.mergeCells('A2:A3')
    worksheet.mergeCells('B2:B3')
    worksheet.mergeCells('C2:D2')
    worksheet.mergeCells('E2:E3')
    worksheet.mergeCells('F2:F3')
    worksheet.mergeCells('G2:H2')
    worksheet.mergeCells('I2:I3')
    worksheet.mergeCells('J2:J3')

    for (let i = 0; i < max_member_num; ++i) {
      worksheet.mergeCells(`${String.fromCharCode('A'.charCodeAt(0) + 8 + 2 + i * 2)}2:${String.fromCharCode('A'.charCodeAt(0) + 8 + 2 + i * 2 + 1)}2`)
    }

    // 居中
    for (var i = 1; i <= 7 + 2 + 1 + max_member_num * 2; i++) {
      worksheet.getColumn(i).alignment = { vertical: 'middle', horizontal: 'center' }
    }
    // 标题加粗
    worksheet.getRow(1).font = { bold: true }

    // 添加数据
    worksheet.addRows(data)

    // 迭代工作表中的所有行（包括空行）
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.height = 21
      // 未填写标黄
      if (row.values[3] == '未填写' || row.values[4] == '未填写') {
        for (var i = 3; i <= 4; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' }
          }
        }
      }
      // 发烧标红色
      if (row.values[3] > 37.3 || row.values[4] > 37.3) {
        for (var i = 3; i <= 4; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0000' }
          }
        }
      }
      // 位置变动标橘色
      if (row.values[7] != '昨天' && row.values[7] != '未填写' && row.values[8] != '未填写' && row.values[7] != row.values[8]){
        for (var i = 7; i <= 8; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC000' }
          }
        }
      }
    });
  }

  return workbook.xlsx.writeBuffer()
}
