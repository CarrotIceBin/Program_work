<template>
  <!-- 模拟手机容器 -->
  <div class="phone-box">
    <div class="pay-page">
      <!-- 顶部导航栏 -->
      <div class="header">
        <span class="back-icon">&lt;</span>
        <h3 class="title">收银台</h3>
        <span class="price-text">需支付 ¥99.00</span>
      </div>

      <div class="content-wrap">
        <!-- 商家订单项 -->
        <div class="pay-item radio-item">
          <span class="item-text">同城圈推广订单</span>
          <el-radio v-model="payType" label="order"></el-radio>
        </div>

        <div class="split-tip">其它支付方式</div>

        <!-- 微信支付选项（默认选中） -->
        <div class="pay-item radio-item checked-item">
          <div class="pay-left">
            <div class="pay-icon wechat-icon"></div>
            <div class="pay-desc">
              <div class="name">微信支付</div>
              <div class="small-text">微信安全支付</div>
            </div>
          </div>
          <el-radio v-model="payType" label="wechat"></el-radio>
        </div>

        <!-- 其他第三方支付 -->
        <div class="pay-item arrow-item">
          <span>其他第三方支付</span>
          <span>&gt;</span>
        </div>

        <!-- 微信好友代付 -->
        <div class="pay-item radio-item">
          <div class="pay-left">
            <div class="pay-icon proxy-icon"></div>
            <div class="pay-desc">
              <div class="name">微信好友代付</div>
              <div class="small-text">好友帮忙付款</div>
            </div>
          </div>
          <el-radio v-model="payType" label="proxy"></el-radio>
        </div>
      </div>

      <!-- 底部提交按钮 -->
      <div class="bottom-btn">
        <button>微信支付 ¥99.00</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 默认选中微信支付
const payType = ref('wechat')
</script>

<style scoped>
/* 手机外壳样式，模拟真机截图效果 */
.phone-box {
  width: 320px;
  height: auto;
  margin: 20px auto;
  border: 12px solid #222;
  border-radius: 40px;
  overflow: hidden;
  background: #fff;
}
.pay-page {
  width: 100%;
  min-height: 620px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
  border-bottom: 1px solid #eee;
}
.back-icon {
  font-size: 20px;
  color: #333;
}
.title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}
.price-text {
  color: #f53f3f;
  font-size: 15px;
}

.content-wrap {
  flex: 1;
  padding: 10px 14px;
}
.radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 10px;
  border-bottom: 1px solid #f2f2f2;
}
.checked-item {
  position: relative;
}
/* 右侧红色对勾标记 还原原图样式 */
.checked-item::after {
  content: "✓";
  color: #fff;
  background: #f53f3f;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  text-align: center;
  font-size: 12px;
  position: absolute;
  right: 8px;
  top: 20px;
}

.split-tip {
  padding: 14px 10px;
  color: #999;
  font-size: 14px;
}
.pay-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pay-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.wechat-icon {
  background: #07c160;
}
.proxy-icon {
  background: #07c160;
}
.pay-desc .name {
  font-size: 15px;
  color: #333;
}
.pay-desc .small-text {
  font-size: 12px;
  color: #999;
}
.arrow-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 10px;
  border-bottom: 1px solid #f2f2f2;
  font-size: 15px;
  color: #333;
}

/* 底部橙色支付按钮 */
.bottom-btn {
  padding: 18px 14px;
}
.bottom-btn button {
  width: 100%;
  height: 52px;
  background: linear-gradient(90deg, #ff453a, #ff7722);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
}
</style>