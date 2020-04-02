// 云函数入口文件
const cloud = require('wx-server-sdk')
const Excel = require('exceljs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
/**
 * 生成学院所有人数据Excel表格
 * 参数：
 *    department: 学院名
 * 返回值：
 *    fileID: 云存储文件ID
 */
const db = cloud.database()
const MAX_LIMIT = 1000
var date = new Date()
const title = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日体温登记表"

function gen_excel_buffer(data) {
  const now = new Date()
  // 表格属性
  var sheet_pro = {
    defaultRowHeight:21,    // 默认行高
    defaultColWidth:9.5   // 默认列宽
  }
  // 新建工作簿、工作表
  var workbook = new Excel.Workbook()
  var worksheet_stu = workbook.addWorksheet('学生体温表',{properties:sheet_pro})
  var worksheet_tea = workbook.addWorksheet('教师体温表',{properties:sheet_pro})
  // 添加标题
  worksheet_stu.getRow(1).values = [title,,,,,,]
  worksheet_stu.getRow(2).values = ['学号','姓名','体温',,'班级','是否发烧', '位置',, '家庭其它成员数量']
  worksheet_stu.getRow(3).values = ['学号','姓名','昨天中午','今天上午','班级','是否发烧', '昨天','今天', '家庭其它成员数量']
  worksheet_tea.getRow(1).values = [title,,,,,,]
  worksheet_tea.getRow(2).values = ['工号','姓名','体温',,'学院','是否发烧', '位置',, '家庭其它成员数量']
  worksheet_tea.getRow(3).values = ['工号','姓名','昨天中午','今天上午','学院','是否发烧', '昨天','今天', '家庭其它成员数量']

  // 定义列
  worksheet_stu.columns = [
    { key: 'no', width: 9.5 },
    { key: 'name', width: 9.5 },
    { key: 'am', width: 9.5 },
    { key: 'pm', width: 9.5 },
    { key: 'class_', width: 14 },
    { key: 'isFever', width: 9.5 },
    { key: 'lastLocation', width: 20 },
    { key: 'location', width: 20 },
    { key: 'familyCount', width: 16 }
  ];
  worksheet_tea.columns = [
    { key: 'no', width: 9.5 },
    { key: 'name', width: 9.5 },
    { key: 'am', width: 9.5 },
    { key: 'pm', width: 9.5 },
    { key: 'department', width: 20 },
    { key: 'isFever', width: 9.5 },
    { key: 'lastLocation', width: 20 },
    { key: 'location', width: 20 },
    { key: 'familyCount', width: 16 }
  ];
  // 居中
  for (var i = 1; i <= 7; i++) {
    worksheet_stu.getColumn(i).alignment = {vertical: 'middle', horizontal: 'center'}
    worksheet_tea.getColumn(i).alignment = {vertical: 'middle', horizontal: 'center'}
  }
  // 标题加粗
  worksheet_stu.getRow(1).font={ bold:true }
  worksheet_tea.getRow(1).font={ bold:true }

  // 添加数据
  var tea_data = []
  var stu_data = []

  let max_member_num_stu = 0
  let max_member_num_tea = 0
  for (var i = 0; i < data.length; i++) {
    var arr = []
    let checked = data[i].userInfo.last_checkin_at && data[i].userInfo.last_checkin_at.toDateString() === now.toDateString()
    if(data[i].userInfo.type == '学生')
    {
      // console.log(data[i])
      arr.push(data[i].userInfo.no)
      arr.push(data[i].userInfo.name)
      arr.push(checked && data[i].userInfo.temperatures&&data[i].userInfo.temperatures.pm?data[i].userInfo.temperatures.pm:'未填写')
      arr.push(checked && data[i].userInfo.temperatures&&data[i].userInfo.temperatures.am?data[i].userInfo.temperatures.am:'未填写')
      arr.push(data[i].userInfo.class_)
      if ((data[i].userInfo.temperatures&&data[i].userInfo.temperatures.am&&data[i].userInfo.temperatures.am>37.3)||
        (data[i].userInfo.temperatures&&data[i].userInfo.temperatures.pm&&data[i].userInfo.temperatures.pm>37.3)) {
        arr.push('是')
      }else if((data[i].userInfo.temperatures&&data[i].userInfo.temperatures.am&&data[i].userInfo.temperatures.am<=37.3)&&
        (data[i].userInfo.temperatures&&data[i].userInfo.temperatures.pm&&data[i].userInfo.temperatures.pm<=37.3)){
        arr.push('否')
      }else {
        arr.push('')
      }
      arr.push(checked && data[i].userInfo.lastLocation || '未填写')
      arr.push(checked && data[i].userInfo.location || '未填写')
      arr.push(data[i].userInfo.members && data[i].userInfo.members.length || 0)
      for (let { temperatures: { am, pm } } of data[i].userInfo.members || []) {
        arr.push(checked && pm || '未填写', checked && am || '未填写')
      }
      stu_data.push(arr)

      max_member_num_stu = Math.max(max_member_num_stu, data[i].userInfo.members && data[i].userInfo.members.length || 0)
    }else{
      arr.push(data[i].userInfo.no)
      arr.push(data[i].userInfo.name)
      arr.push(checked && data[i].userInfo.temperatures&&data[i].userInfo.temperatures.pm?data[i].userInfo.temperatures.pm:'未填写')
      arr.push(checked && data[i].userInfo.temperatures&&data[i].userInfo.temperatures.am?data[i].userInfo.temperatures.am:'未填写')
      arr.push(data[i].userInfo.department)
      if ((data[i].userInfo.temperatures&&data[i].userInfo.temperatures.am&&data[i].userInfo.temperatures.am>37.3)||
        (data[i].userInfo.temperatures&&data[i].userInfo.temperatures.pm&&data[i].userInfo.temperatures.pm>37.3)) {
        arr.push('是')
      }else if((data[i].userInfo.temperatures&&data[i].userInfo.temperatures.am&&data[i].userInfo.temperatures.am<=37.3)&&
        (data[i].userInfo.temperatures&&data[i].userInfo.temperatures.pm&&data[i].userInfo.temperatures.pm<=37.3)){
        arr.push('否')
      } else {
        arr.push('')
      }
      arr.push(checked && data[i].userInfo.lastLocation || '未填写')
      arr.push(checked && data[i].userInfo.location || '未填写')
      arr.push(data[i].userInfo.members && data[i].userInfo.members.length || 0)
      for (let { temperatures: { am, pm } } of data[i].userInfo.members || []) {
        arr.push(checked && pm || '未填写', checked && am || '未填写')
      }
      tea_data.push(arr)

      max_member_num_tea = Math.max(max_member_num_tea, data[i].userInfo.members && data[i].userInfo.members.length || 0)
    }
  }
  worksheet_stu.addRows(stu_data)
  worksheet_tea.addRows(tea_data)

  let r2_values_stu = worksheet_stu.getRow(2).values
  let r3_values_stu = worksheet_stu.getRow(3).values
  for (let i = 0; i < max_member_num_stu; ++i) {
    r2_values_stu.push(`家庭成员${i + 1}`, '')
    r3_values_stu.push('昨天中午', '今天上午')
  }
  worksheet_stu.getRow(2).values = r2_values_stu
  worksheet_stu.getRow(3).values = r3_values_stu
  for (let i = 0; i < max_member_num_stu; ++i) {
    worksheet_stu.mergeCells(`${String.fromCharCode('J'.charCodeAt(0) + i * 2)}2:${String.fromCharCode('J'.charCodeAt(0) + i * 2 + 1)}2`)
  }
  for (var i = 8; i <= 8+max_member_num_stu*2; i++) {
    worksheet_stu.getColumn(i+1).alignment = { vertical: 'middle', horizontal: 'center' }
  }
  for(let i=0;i<max_member_num_stu*2;++i) {
    worksheet_stu.getColumn(9+1+i).width=9.5
  }

  let r2_values_tea = worksheet_tea.getRow(2).values
  let r3_values_tea = worksheet_tea.getRow(3).values
  for (let i = 0; i < max_member_num_tea; ++i) {
    r2_values_tea.push(`家庭成员${i + 1}`, '')
    r3_values_tea.push('昨天中午', '今天上午')
  }
  worksheet_tea.getRow(2).values = r2_values_tea
  worksheet_tea.getRow(3).values = r3_values_tea
  for (let i = 0; i < max_member_num_tea; ++i) {
    worksheet_tea.mergeCells(`${String.fromCharCode('J'.charCodeAt(0) + i * 2)}2:${String.fromCharCode('J'.charCodeAt(0) + i * 2 + 1)}2`)
  }
  for (var i = 8; i <= 8 + max_member_num_tea * 2; i++) {
    worksheet_tea.getColumn(i+1).alignment = { vertical: 'middle', horizontal: 'center' }
  }
  for(let i=0;i<max_member_num_tea*2;++i) {
    worksheet_tea.getColumn(8+2+i).width=9.5
  }

  // 合并单元格
  worksheet_stu.mergeCells('A1:F1')
  worksheet_stu.mergeCells('A2:A3')
  worksheet_stu.mergeCells('B2:B3')
  worksheet_stu.mergeCells('C2:D2')
  worksheet_stu.mergeCells('E2:E3')
  worksheet_stu.mergeCells('F2:F3')
  worksheet_stu.mergeCells('G2:H2')
  worksheet_stu.mergeCells('I2:I3')
  worksheet_tea.mergeCells('A1:F1')
  worksheet_tea.mergeCells('A2:A3')
  worksheet_tea.mergeCells('B2:B3')
  worksheet_tea.mergeCells('C2:D2')
  worksheet_tea.mergeCells('E2:E3')
  worksheet_tea.mergeCells('F2:F3')
  worksheet_tea.mergeCells('G2:H2')
  worksheet_tea.mergeCells('I2:I3')
  
  // 迭代工作表中的所有行（包括空行）
  worksheet_stu.eachRow({ includeEmpty: true }, function(row, rowNumber) {
    row.height = 21
    // 未填写标黄
    if (row.values[3] == '未填写' || row.values[4] == '未填写') {
      for (var i = 3; i <= 4; i++) {
        row.getCell(i).fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FFFF00'}
        }
      }
    }
    // 发烧标橘色
    if (row.values[3] > 37.3 || row.values[4] > 37.3) {
      for (var i = 3; i <= 4; i++) {
        row.getCell(i).fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FFC000'}
        }
      }
    }

    // console.log('Row ' + rowNumber? + ' = ' + JSON.stringify(row.values));
  });
  // 迭代工作表中的所有行（包括空行）
  worksheet_tea.eachRow({ includeEmpty: true }, function(row, rowNumber) {
    row.height = 21
    // 未填写标黄
    if (row.values[3] == '未填写' || row.values[4] == '未填写') {
      for (var i = 3; i <= 4; i++) {
        row.getCell(i).fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FFFF00'}
        }
      }
    }
    // 发烧标红色
    if (row.values[3] > 37.3 || row.values[4] > 37.3) {
      for (var i = 3; i <= 4; i++) {
        row.getCell(i).fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FF0000'}
        }
      }
    }
    // 位置变动标橘色
    if (row.values[7] != '昨天' && row.values[7] != '未填写' && row.values[8] != '未填写' && row.values[7] != row.values[8]) {
      for (var i = 7; i <= 8; i++) {
        row.getCell(i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC000' }
        }
      }
    // console.log('Row ' + rowNumber? + ' = ' + JSON.stringify(row.values));
  });

  return workbook.xlsx.writeBuffer()
}

// 云函数入口函数
exports.main = async (event, context) => {

  // 先取出集合记录总数
  const countResult = await db.collection('users').where({
    userInfo: { department: event.department }
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('users').where({
      userInfo:{department:event.department}
    }).field({ 'userInfo.no': true, 'userInfo.name': true, 'userInfo.temperatures': true, 'userInfo.class_': true, 'userInfo.department': true, 'userInfo.type':true, 'userInfo.members': true, 'userInfo.last_checkin_at': true, 'userInfo.location': true }).orderBy('userInfo.no','asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  var data = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  }).data
  return gen_excel_buffer(data)
}