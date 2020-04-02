const app = getApp()
const db = wx.cloud.database()
const tmpId = 'bzVdoPY3-KljJBAGe_vGlOz7PRUsGqlZITm85uKyUWk'
const tmpIdt = 'E0u3PLO8OThB8pwGhwJn68ehfYzMcBltNjQPOoEAhYY'

// miniprogram/pages/checkin/checkin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    allClasses: [],
    checked: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const that = this
    db.collection('settings').doc('deadline').get().then(res => {
      let { hours, minutes } = res.data
      this.setData({ hours, minutes })
    })
    wx.showLoading({
      title: '正在加载',
    })
    wx.cloud.callFunction({
      name: 'login',
      success(res) {
        console.log(res)
        db.collection('users').where({
          _openid: res.result.openid
        }).get().then(res => {
          if(res.data.length) {
            app.globalData.userInfo = res.data[0].userInfo
            app.globalData.userInfo.id = res.data[0]._id
            that.setData({
              checked: app.globalData.userInfo.last_checkin_at.toDateString() === new Date().toDateString(),
              userInfo: app.globalData.userInfo
            })
            wx.hideLoading()

            if (app.globalData.userInfo.type === '副院长') {
              db.collection('classes').doc('class_set').get().then(res => {
                let allClasses = []
                for (let major of res.data.major[app.globalData.userInfo.department]) {
                  allClasses.push(...res.data.class_[major])
                }
                that.setData({ allClasses: allClasses.sort() })
              })
            }
          }
          else {
            that.register()
          }
        })
      }
    })

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
    if(app.globalData.userInfo.id) {
      this.setData({
        checked: app.globalData.userInfo.last_checkin_at.toDateString() === new Date().toDateString(),
        userInfo: app.globalData.userInfo
      })
    }
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
    db.collection('settings').doc('deadline').get().then(res => {
      let { hours, minutes } = res.data
      this.setData({ hours, minutes })
    })
    db.collection('users').doc(app.globalData.userInfo.id).get().then(res => {
      console.log(res)
      app.globalData.userInfo = res.data.userInfo
      app.globalData.userInfo.id = res.data._id
      that.setData({
        checked: app.globalData.userInfo.last_checkin_at.toDateString() === new Date().toDateString(),
        userInfo: res.data.userInfo
      })

      if (app.globalData.userInfo.type === '副院长') {
        db.collection('classes').doc('class_set').get().then(res => {
          let allClasses = []
          for (let major of res.data.major[app.globalData.userInfo.department]) {
            allClasses.push(...res.data.class_[major])
          }
          this.setData({ allClasses: allClasses.sort() })
        })
      }
    }).catch(err => {
      // 用户不存在
    }).finally(res => {
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
  showGroup(e) {
    console.log(e.currentTarget.dataset)
    let { class_, department } = e.currentTarget.dataset
    if(!class_) {
      class_=''
    }
    if(!department) {
      department=''
    }
    wx.navigateTo({
      url: `../group/group?class_=${class_}&department=${department}`,
    })
  },
  register: function () {
    const that = this
    
    app.globalData.userInfo.last_checkin_at = new Date('2020')
    db.collection('users').add({
      data: {
        userInfo: app.globalData.userInfo,
        time: new Date()
      },
      success(res) {
        console.log(res)
        app.globalData.userInfo.id = res._id
        that.setData({
          userInfo: app.globalData.userInfo
        })
        wx.hideLoading()
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  changeClass(){
    // console.log('ss')
    wx.navigateTo({
      url: '/pages/myClasses/myClasses'
    })
  },
  hideModal() {
    this.setData({ showModal: false })
  },
  navToMyInfo() {
    wx.navigateTo({
      url: '../bind/bind',
    })
    this.hideModal()
  },
  //导出Excel报表
  exportExcel: function (e) {
    const that = this
    console.log(e)
    wx.showLoading({
      title: '正在生成表格'
    })
    let name, data, group
    if(e.currentTarget.dataset.all) {
      group = app.globalData.userInfo.department
      name = 'exportAllExcel'
      data = {
        department: group
      }
    }
    else {
      group = e.currentTarget.dataset.classes
      name = 'excel'
      data = {
        classes: group
      }
    }
    if(!group || !group.length) {
      wx.hideLoading()
      wx.showToast({
        title: '暂无数据可导出',
        icon: 'none'
      })
      return
    }

    var fileSystemManager = wx.getFileSystemManager()
    wx.cloud.callFunction({ name, data }).then(res => {
      console.log(res)
      fileSystemManager.writeFile({
        filePath: wx.env.USER_DATA_PATH + '/' + group + '.xlsx',
        data: res.result,
        success(res){
          wx.hideLoading()
          wx.openDocument({
            filePath: wx.env.USER_DATA_PATH + '/' + group + '.xlsx',
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
  },
  checkin(e) {

    let that = this
    if (!app.globalData.userInfo.id && !that.data.hours) return
    if (app.globalData.userInfo.boundInfo) {

      const now = new Date()
      let { hours, minutes } = that.data
      // 为了测试特判了测试人员……
      if ((now.getHours() >= hours || (now.getHours() == hours && now.getMinutes() >= minutes))
        && app.globalData.userInfo.name != '宁宇' && app.globalData.userInfo.name != '李志强') {
        wx.showToast({
          title: '已截止',
          icon: 'none'
        })
        return
      }
      wx.showLoading({
        title: '获取授权',
      })
      wx.getSetting({
        withSubscriptions: true,
        success(res) {
          console.log(res)
          if (!res.subscriptionsSetting[tmpId]) {
            wx.hideLoading()
            wx.showModal({
              title: '请务必选择允许',
              content: '建议勾选“保持以上选择，不再询问”\n授权仅用于在你未完成打卡时及时发出提醒',
              showCancel: false
            })
          }
        }
      })

      // 订阅消息
      wx.requestSubscribeMessage({
        tmplIds: app.globalData.userInfo.type == '学生' ? [tmpId] : [tmpId, tmpIdt],
        success(res) {
          console.log(res)
          if (res[tmpId] != 'accept' || (app.globalData.userInfo.type != '学生' && res[tmpIdt] != 'accept')) {
            wx.hideLoading()
            wx.showModal({
              title: '请选择允许',
              content: '如未弹出授权提示，请从右上角菜单项——设置处，订阅消息勾选“打卡提醒”',
              showCancel: false
            })
          } else {
            wx.hideLoading()
            wx.navigateTo({
              url: '../form/form',
            })
          }
        }
      })
    }
    else {
      wx.showModal({
        title: '未绑定身份',
        content: '正确绑定身份后，您的打卡情况才能被班级/学院统计。现在去绑定吗？',
        confirmText: '去绑定',
        cancelText: '取消',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../bind/bind',
            })
          }
        }
      })
    }

  },
  // 订阅消息
  getMessage(res){
    wx.navigateToMiniProgram({
      appId: 'wx47c1fa6cacac377e',
    })
  }
})