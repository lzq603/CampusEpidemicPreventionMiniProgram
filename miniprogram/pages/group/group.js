const app = getApp()
const db = wx.cloud.database()

// miniprogram/pages/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infos: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({ class_, department }) {

    this.setData({
      class_, department
    })
    console.log({ class_, department })
    wx.cloud.callFunction({
      name: 'get_user_group',
      data: {
        class_, department
      }
    }).then(res => {
      console.log(res)
      let now = new Date()
      this.setData({
        infos: res.result.data.map(it => {
          let { name, temperatures, last_checkin_at } = it.userInfo
          return {
            name, temperatures,
            checked: last_checkin_at && last_checkin_at.substring(0, 10) === now.toJSON().substring(0, 10)
          }
        })
      })
    }).catch(console.log)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const that = this

    wx.cloud.callFunction({
      name: 'get_user_group',
      data: {
        class_: that.data.class_,
        department: that.data.department
      }
    }).then(res => {
      console.log(res)
      let now = new Date()
      this.setData({
        infos: res.result.data.map(it => {
          let { name, temperatures, last_checkin_at } = it.userInfo
          return {
            name, temperatures,
            checked: last_checkin_at && last_checkin_at.substring(0, 10) === now.toJSON().substring(0, 10)
          }
        })
      })
    }).catch(console.error).finally(res => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //导出Excel报表
  exportExcel: function(){
    const that = this

    wx.showLoading({
      title: '正在生成表格'
    })
    let { class_, department } = this.data
    console.log([class_])
    wx.cloud.callFunction({
      name:'excel',
      data:{
        classes: class_ ? [class_] : [],
        department
      }
    }).then(res=>{
      console.log(res)
      var fileSystemManager = wx.getFileSystemManager()
      var date = new Date()
      fileSystemManager.writeFile({
        filePath: `${wx.env.USER_DATA_PATH}/${date.getMonth()+1}月${date.getDate()}日${class_ || department+'教职工'}体温信息表.xlsx`,
        data: res.result,
        success(res){
          wx.hideLoading()
          wx.openDocument({
            filePath: `${wx.env.USER_DATA_PATH}/${date.getMonth()+1}月${date.getDate()}日${class_ || department+'教职工'}体温信息表.xlsx`,
            fileType: 'xlsx',
            success(res) {
              console.log(res)
            },
            fail(res) {
              console.log(res)
            }
          })
        },
        fail(res){
          console.log(res)
        }
      })
    })

    
  }
})