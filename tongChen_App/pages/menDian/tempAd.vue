<template>
  <view class="page-wrap">
    <!-- 顶部导航栏：返回+标题 -->
    <view class="nav-bar">
      <view class="empty-box"></view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 表单区域 -->
      <view class="form-card">
        <!-- 广告投放时间 -->
        <view class="form-item">
          <text class="label">请选择投放日期</text>
          <picker mode="date" :value="adTime" @change="timeChange">
            <view class="input-box">{{ adTime || "请选择投放日期" }}</view>
          </picker>
        </view>

        <!-- 广告旁白 -->
        <view class="form-item">
          <text class="label">广告旁白</text>
          <picker mode="selector" :value="asideIndex" :range="asideList" @change="asideChange">
            <view class="input-box">{{ adAside || "请选择" }}</view>
          </picker>
        </view>

        <!-- 广告标题 -->
        <view class="form-item">
          <text class="label">广告标题</text>
          <picker mode="selector" :value="titleIndex" :range="titleList" @change="titleChange">
            <view class="input-box">{{ adTitle || "请选择广告标题" }}</view>
          </picker>
        </view>

        <!-- 广告内容 -->
        <view class="form-item">
          <text class="label">广告内容</text>
          <textarea class="textarea-box" v-model="adContent" placeholder="填写线下活动详情"></textarea>
        </view>

        <!-- 联系人 -->
        <view class="form-item">
          <text class="label">广告联系人</text>
          <input class="input-box" v-model="linkMan" placeholder="请输入联系人姓名" />
        </view>

        <!-- 联系电话 -->
        <view class="form-item">
          <text class="label">联系电话</text>
          <input class="input-box" v-model="linkPhone" placeholder="请输入手机号" />
        </view>

        <!-- 省市区三级联动 -->
        <view class="form-item">
          <text class="label">广告地点</text>
          <view class="input-box" @click="openAreaPicker">
            {{ regionStr || "请选择省/市/区" }}
          </view>
        
          <!-- 自定义省市区弹窗 -->
          <view class="area-popup" v-if="showAreaPopup">
            <view class="popup-top">
              <text class="cancel" @click="closeAreaPicker">取消</text>
              <text class="confirm" @click="confirmArea">完成</text>
            </view>
            <picker-view :value="pickerIndexArr" @change="pickerChange" class="picker-view-box">
              <picker-view-column>
                <view v-for="(item,idx) in provinceList" :key="idx" class="picker-cell">{{ item.name }}</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(item,idx) in cityList" :key="idx" class="picker-cell">{{ item.name }}</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(item,idx) in districtList" :key="idx" class="picker-cell">{{ item.name }}</view>
              </picker-view-column>
            </picker-view>
          </view>
        </view>

        <!-- 详细地址 -->
        <view class="form-item">
          <text class="label">详细门牌号/地标</text>
          <textarea class="textarea-box" v-model="detailAddr" placeholder="精确到路/门牌号/标志性建筑物等明确位置"></textarea>
        </view>
      </view>

      <!-- 资料上传区域 -->
      <view class="upload-card">
        <text class="upload-tit">资料上传</text>
        <view class="upload-row">
          <view class="upload-btn" @click="chooseImg('idFront')">身份证正面</view>
          <view class="upload-btn" @click="chooseImg('idBack')">身份证反面</view>
          <view class="upload-btn" @click="chooseImg('scene')">场景照片</view>
          <view class="upload-btn agree-btn" @click="showAgree">签署协议</view>
        </view>
        <!-- 已上传图片预览 -->
        <view class="img-preview" v-if="imgList.length > 0">
          <view class="img-item" v-for="(src,idx) in imgList" :key="idx" @click="previewImg(idx)">
            <image :src="src" mode="aspectFill"></image>
          </view>
        </view>
      </view>

      <!-- 服务承诺书弹窗 -->
      <view class="popup-mask" v-if="showPopup" @click="showPopup=false">
        <view class="popup-box" @click.stop>
          <!-- 竖向滚动容器 - 使用动态计算高度 -->
          <scroll-view scroll-y class="pop-content" :scrollbar="false" :style="{ height: popupContentHeight + 'px' }">
            <view class="commit-content">
              <view class="commit-title">临时互联网广告服务承诺书</view>
              <view class="commit-tip">（请您仔细阅读本协议）</view>

              <!-- 1.黄色公告区块 -->
              <view class="commit-notice">
                <view class="notice-title">公告：</view>
                <view class="notice-text">
                  各用户必须根据国家法律、行政法规规定，双方按照合法、公平、平等自愿、协商一致、诚实信用等原则达成共识，明确双方的权利和义务，并订立相关合同（如聊天记录），保证双方的权利和义务。
                </view>
                <view class="notice-red">
                  凡是与金钱有关的事需用户必须要慎重！！！
                </view>
              </view>

              <!-- 2.各项条款文字 -->
              <view class="commit-item">
                <text>广告标题：</text>
                <text class="filled-text">{{ adTitle || '（未填写）' }}</text>
              </view>
          
              <view class="commit-item">
                <text>广告内容：</text>
                <text class="filled-text">{{ adContent || '（未填写）' }}</text>
              </view>
          
              <view class="commit-item">
                <text>广告时间：</text>
                <text class="filled-text">{{ adTime || '（未填写）' }}</text>
              </view>
          
              <view class="commit-item">
                <text>广告内容旁白：</text>
                <text class="filled-text">{{ adAside || '（未选择）' }}</text>
              </view>
          
              <view class="commit-item">
                <text>广告联系人：</text>
                <text class="filled-text">{{ linkMan || '（未填写）' }}</text>
              </view>
          
              <view class="commit-item">
                <text>联系电话：</text>
                <text class="filled-text">{{ linkPhone || '（未填写）' }}</text>
              </view>
          
              <view class="commit-item">
                <text>广告地点：</text>
                <text class="filled-text">{{ (regionStr ? regionStr + ' ' : '') + (detailAddr || '') || '（未填写）' }}</text>
              </view>
          
              <!-- 3.红色注意文字 -->
              <view class="commit-attention">
                注意：广告只显示3天，请各用户提前安排好时间。并仔细核对相关内容。
              </view>

              <!-- 4.底部承诺书 -->
              <view class="commit-promise">
                <view class="promise-title">签约人承诺书：</view>
                <view class="promise-text">
                  本人熟知并借助同城有缘只为我单位/门店/个人广告宣传服务，我单位/门店/个人承诺合法经营（服务），并承担相关法律责任。如未履行相关义务，本单位/个人自愿承担相应的法律责任和经济责任且与平台无关。平台只为我单位/门店/个人做广告宣传，并有权停止我单位/门店/个人的广告宣传并包括不限于冻结账户等相关措施。
                </view>
              </view>
            </view>
          </scroll-view>
          <!-- 底部按钮 -->
          <view class="pop-btn" @click="showPopup=false">我已阅读并同意</view>
        </view>
      </view>

      <!-- 底部保存按钮 -->
      <view class="save-btn" @click="submitSave">保存临时广告</view>
      <view class="space-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
import areaData from '@/static/city.json'
export default {
  data() {
    return {
      // 省市区弹窗
      showAreaPopup: false,
      pickerIndexArr: [0, 0, 0],
      provinceList: [],
      cityList: [],
      districtList: [],
      regionStr: "",
      allArea: [],
      // 承诺书弹窗
      showPopup: false,
      popupContentHeight: 0,  // 动态计算的弹窗内容高度
      // 表单数据
      adTime: "",
      asideList: ["有需要的用户可自行前往", "欢迎各位顾客到店体验"],
      asideIndex: 0,
      adAside: "",
      adTitle: "",
      titleList: [
        "商品采购", "果园开摘", "线下相亲", "鱼塘开钓",
        "道路施工", "旺铺招租", "商品促销", "求职招聘",
        "新店开业", "商品寻找", "临时用工", "顺风车",
        "景区活动", "寻人启事", "马拉松", "装修用工",
        "台球比赛", "寻物启事", "农庄开业", "车位转租",
        "水果特价", "杀猪宴", "其他",
        "房屋出租", "货物清仓", "赛龙舟", "篮球比赛"
      ],
      titleIndex: -1,
      adContent: "",
      linkMan: "",
      linkPhone: "",
      detailAddr: "",
      // 图片上传
      imgList: [],
      uploadType: ""
    }
  },
  onLoad() {
    this.allArea = areaData
    this.provinceList = this.allArea
    // 初始化市和区列表
    const firstProvince = this.allArea[0]
    this.cityList = firstProvince.list || []
    const firstCity = this.cityList[0]
    this.districtList = (firstCity && firstCity.list) || []
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    // 投放日期选择
    timeChange(e) {
      this.adTime = e.target.value
    },
    // 旁白下拉选择
    asideChange(e) {
      const idx = e.target.value
      this.asideIndex = idx
      this.adAside = this.asideList[idx]
    },
    // 广告标题下拉选择
    titleChange(e) {
      const idx = e.target.value
      this.titleIndex = idx
      this.adTitle = this.titleList[idx]
    },
    // 省市区联动逻辑
    openAreaPicker() {
      this.showAreaPopup = true
    },
    closeAreaPicker() {
      this.showAreaPopup = false
    },
    confirmArea() {
      const p = this.provinceList[this.pickerIndexArr[0]]
      const c = this.cityList[this.pickerIndexArr[1]]
      const d = this.districtList[this.pickerIndexArr[2]]
      this.regionStr = `${p.name}/${c.name}/${d.name}`
      this.showAreaPopup = false
    },
    pickerChange(e) {
      const newValue = e.detail.value
      const oldValue = this.pickerIndexArr
      const pIndex = newValue[0]
      const cIndex = newValue[1]
      
      if (newValue[0] !== oldValue[0]) {
        // 省改变了 -> 更新市和区
        this.cityList = this.allArea[pIndex].list || []
        this.districtList = ((this.allArea[pIndex].list || [])[0] && (this.allArea[pIndex].list || [])[0].list) || []
        this.pickerIndexArr = [pIndex, 0, 0]
      } else if (newValue[1] !== oldValue[1]) {
        // 市改变了 -> 更新区
        const cityData = this.cityList
        this.districtList = (cityData[cIndex] && cityData[cIndex].list) || []
        this.pickerIndexArr = [pIndex, cIndex, 0]
      } else {
        // 只有区改变 -> 直接更新索引
        this.pickerIndexArr = newValue
      }
    },
    // 图片选择上传
    chooseImg(type) {
      this.uploadType = type
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: res => {
          this.imgList.push(...res.tempFilePaths)
        }
      })
    },
    previewImg(index) {
      uni.previewImage({
        urls: this.imgList,
        current: this.imgList[index]
      })
    },
    // 打开协议弹窗
    showAgree() {
      this.showPopup = true
      // 延迟计算弹窗内容高度（真机适配关键）
      setTimeout(() => {
        this.calcPopupHeight()
      }, 50)
    },
    // 动态计算弹窗滚动区域高度
    calcPopupHeight() {
      const sysInfo = uni.getSystemInfoSync()
      const windowHeight = sysInfo.windowHeight
      // 弹窗高度 = 屏幕高度 * 0.72
      const popupHeight = windowHeight * 0.72
      // 内容高度 = 弹窗高度 - 按钮高度(45px) - 内边距
      const btnHeight = 45
      const padding = 12  // 上下各24rpx ≈ 12px
      this.popupContentHeight = popupHeight - btnHeight - padding
      console.log('弹窗计算: 弹窗高=' + popupHeight + ' 内容高=' + this.popupContentHeight)
    },
    // 表单提交校验
    submitSave() {
      if (!this.adTime || !this.adTitle || !this.adContent || !this.adAside || !this.linkMan || !this.linkPhone || !this.regionStr || !this.detailAddr) {
        uni.showToast({ title: "请完善全部必填信息", icon: "none" })
        return
      }
      uni.showToast({ title: "临时广告提交成功，有效期3天" })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background-color: #f8f8f8;
}
.page-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
// 顶部导航栏
.nav-bar {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.06);
  .back-btn {
    width: 70rpx;
    height: 100%;
    display: flex;
    align-items: center;
    .arrow {
      font-size: 36rpx;
      color: #333;
    }
  }
  .nav-title {
    font-size: 34rpx;
    font-weight: 500;
    color: #333;
  }
  .empty-box {
    width: 70rpx;
  }
}
.scroll-content {
  flex: 1;
  padding: 20rpx;
}
// 表单卡片
.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 24rpx;
  margin-bottom: 24rpx;
  .form-item {
    margin-bottom: 26rpx;
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
    }
    .input-box {
      width: 100%;
      height: 76rpx;
      background: #f7f7f7;
      border-radius: 10rpx;
      padding: 0 18rpx;
      font-size: 28rpx;
      line-height: 76rpx;
      color: #666;
    }
    .textarea-box {
      width: 100%;
      min-height: 140rpx;
      background: #f7f7f7;
      border-radius: 10rpx;
      padding: 16rpx 18rpx;
      font-size: 28rpx;
    }
  }
}
// 上传模块
.upload-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 24rpx;
  margin-bottom: 36rpx;
  .upload-tit {
    font-size: 30rpx;
    font-weight: 500;
    margin-bottom: 22rpx;
    display: block;
  }
  .upload-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    .upload-btn {
      padding: 16rpx 22rpx;
      background: #ffd300;
      border-radius: 10rpx;
      font-size: 26rpx;
    }
    .agree-btn {
      background: #ff9500;
      color: #fff;
    }
  }
  .img-preview {
    margin-top: 24rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    .img-item {
      width: 160rpx;
      height: 160rpx;
      border-radius: 10rpx;
      overflow: hidden;
      image {
        width: 100%;
        height: 100%;
      }
    }
  }
}
// 省市区底部弹窗
.area-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  z-index: 99999;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
}
.popup-top {
  height: 88rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
  .cancel {
    font-size: 32rpx;
    color: #666;
  }
  .confirm {
    font-size: 32rpx;
    color: #007aff;
  }
}
.picker-view-box {
  height: 400rpx;
  width: 100%;
}
.picker-cell {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
}
// 承诺书弹窗样式
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .popup-box {
    width: 86%;
    height: 72vh;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;

    .pop-content {
      padding: 24rpx;
      box-sizing: border-box;

      .commit-content {
        line-height: 1.8;
        font-size: 28rpx;
        color: #222;
        padding-bottom: 30rpx;
      }
      .commit-title {
        text-align: center;
        font-size: 36rpx;
        font-weight: 600;
        margin-bottom: 8rpx;
      }
      .commit-tip {
        text-align: center;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 24rpx;
      }
      // 黄色公告盒子
      .commit-notice {
        background: #fff9b8;
        padding: 20rpx;
        border-radius: 8rpx;
        margin: 0 0 30rpx 0;
      }
      .notice-title {
        font-weight: 600;
        margin-bottom: 8rpx;
      }
      .notice-red {
        color: red;
        font-weight: bold;
        margin-top: 10rpx;
      }
      .commit-item {
        margin-bottom: 22rpx;
      }
      .filled-text {
        color: #fd7031;
        font-weight: 500;
      }
      .commit-attention {
        color: #ff0000;
        font-weight: 500;
        margin: 26rpx 0;
      }
      .commit-promise {
        color: #7b1fa2;
        line-height: 1.85;
      }
      .promise-title {
        font-weight: 600;
        margin-bottom: 8rpx;
      }
    }
    // 底部按钮固定在弹窗底部
    .pop-btn {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 90rpx;
      background: #fd7031;
      color: #fff;
      text-align: center;
      line-height: 90rpx;
      font-size: 32rpx;
      border-bottom-left-radius: 16rpx;
      border-bottom-right-radius: 16rpx;
    }
  }
}
// 底部提交按钮
.save-btn {
  width: 100%;
  height: 92rpx;
  background: linear-gradient(135deg,#fd7031,#ff8c4a);
  color: #fff;
  text-align: center;
  line-height: 92rpx;
  font-size: 32rpx;
  border-radius: 14rpx;
}
.space-bottom {
  height: 40rpx;
}
</style>