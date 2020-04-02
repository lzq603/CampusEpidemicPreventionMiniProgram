# 疫情防控  

疫情防控小程序，方便学校对学生健康状况进行统计  
![疫情防控](https://images.gitee.com/uploads/images/2020/0225/224808_a945e297_1694647.jpeg "疫情防控.jpg")  

> 测试账号  
> 学号：20169999  
> 姓名：测试  

## 本项目具备以下特点：  
1.绑定个人信息，填写报表时无需再次填写  
2.区分教师、学生、辅导员、院长四类用户  
3.导出Excel表格，不同颜色标注发热人员   
  
## 依赖  
1.本项目使用云开发，无需域名，无需部署服务器  
2.导出Excel模块依赖exceljs库  

## 部署说明  
1.注册微信小程序  
2.使用微信开发者工具导入项目，修改AppId  
3.小程序后台创建订阅消息模板“打卡提醒”和“信息提交成功通知”（分别用于提醒学生打卡和提醒辅导员打卡已完成）  
![QQ截图20200330152647](http://120.79.54.89:8090/upload/2020/3/QQ%E6%88%AA%E5%9B%BE20200330152647-1bf24e7e5abf4119b110b08ede4b6f25.png)  
![QQ截图20200330152711](http://120.79.54.89:8090/upload/2020/3/QQ%E6%88%AA%E5%9B%BE20200330152711-29f0a29189de423da60c1fe5b7fbf7bd.png)  
并修改小程序中对应id(和参数)：  
```javascript
// miniprogram/pages/checkin/checkin.js  

const tmpId = 'bzVdoPY3-KljJBAGe_vGlOz7PRUsGqlZITm85uKyUWk'  // 提醒学生消息模板  
const tmpIdt = 'E0u3PLO8OThB8pwGhwJn68ehfYzMcBltNjQPOoEAhYY'  // 提醒辅导员消息模板  
```
```javascript  
// 云函数文件remind/index.js  
```  
  
4.数据库创建，格式如下：  
> 注意：settings集合中数据id固定，请勿修改
- identi集合（用于身份验证）  
```javascript
//学生
{
  "userInfo":{
    "no":"xxxxxxx",
    "name":"xxx",
    "class_":"信16xx-3",
    "phone":"xxxxx",
    "department":"信息科学与技术学院",
    "type":"学生"
  }
}

//副院长、辅导员
{
  "userInfo": {
    "department": "信息科学与技术学院",
    "manage_classes": [
      "信xxxx-x",
      "信xxxx-x",
      "信xxxx-x"
    ],
    "name": "测试",
    "no": "20199999",
    "phone": "151xxxxx238",
    "type": "副院长"
  }
}

//教师
{
  "userInfo":{
    "no":"xxxxxxx",
    "name":"xxx",
    "phone":"xxxxx",
    "department":"信息科学与技术学院",
    "type":"教师"
  }
}
```
- settings集合（配置上报截止时间，注意：本条数据id固定，请勿修改）
```javascript
{
  "_id": "deadline",
  "hours": "11",
  "minutes": "00"
}
```
- user集合（只需创建，无需手动添加数据）

## 开发人员  
宁宇 李志强 王世博  
  
## Bug反馈  
[反馈/建议](http://120.79.54.89:8090/archives/%E9%93%81%E5%A4%A7%E9%98%B2%E6%8E%A7%E5%8F%8D%E9%A6%88)  
或 iv2013@qq.com  
或 QQ：603631695  
