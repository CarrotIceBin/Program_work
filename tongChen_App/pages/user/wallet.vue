<template>
  <view class="wallet-page">
    <!-- 资产卡片 -->
    <view class="asset-card">
      <view class="asset-title">账户总览（元）</view>
      <view class="asset-balance">¥{{ formatMoney(userInfo.money) }}</view>
      <view class="asset-tags">
        <view class="asset-tag" v-if="userInfo.points">积分：{{ userInfo.points }}</view>
      </view>
    </view>

    <!-- 资产明细 -->
    <view class="asset-detail">
      <view class="detail-item">
        <view class="detail-label">主余额</view>
        <view class="detail-value">¥{{ formatMoney(userInfo.money) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">充值中心</view>
        <view class="detail-value">¥{{ formatMoney(userInfo.moneyCent) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">消费余额</view>
        <view class="detail-value">¥{{ formatMoney(userInfo.moneyXf) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">消费充值中心</view>
        <view class="detail-value">¥{{ formatMoney(userInfo.moneyXfCent) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">积分</view>
        <view class="detail-value">{{ formatMoney(userInfo.points) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">积分中心</view>
        <view class="detail-value">{{ formatMoney(userInfo.pointsCent) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">累计收入</view>
        <view class="detail-value income">¥{{ formatMoney(userInfo.incomeSumMoney) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">累计消费</view>
        <view class="detail-value cost">¥{{ formatMoney(userInfo.costSum) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">大市场销售</view>
        <view class="detail-value">¥{{ formatMoney(userInfo.bigMarketSales) }}</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">团队销售</view>
        <view class="detail-value">¥{{ formatMoney(userInfo.teamSales) }}</view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-btn" @click="rechargeClick">
        <view class="action-icon">💰</view>
        <text>充值</text>
      </view>
      <view class="action-btn" @click="withdrawClick">
        <view class="action-icon">💸</view>
        <text>提现</text>
      </view>
      <view class="action-btn" @click="transferClick">
        <view class="action-icon">🔁</view>
        <text>转账</text>
      </view>
      <view class="action-btn" @click="detailClick">
        <view class="action-icon">📋</view>
        <text>明细</text>
      </view>
    </view>

    <!-- 交易提示 -->
    <view class="tips">
      <view class="tips-title">温馨提示</view>
      <view class="tips-item">• 充值后余额可用于平台消费</view>
      <view class="tips-item">• 提现需绑定银行卡，审核时间约1-3个工作日</view>
      <view class="tips-item">• 如有疑问请联系客服</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {}
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  onShow() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => uni.navigateBack(), 1000);
        return;
      }
      this.$http('userInfo', JSON.stringify({ token })).then(res => {
        console.log('[钱包] userInfo接口返回:', JSON.stringify(res).substring(0, 800));
        if (res.code == 0) {
          // 直接整体赋值，完全使用后端返回的数据，不预设任何值
          this.userInfo = res.userInfo ? { ...res.userInfo } : {};
          console.log('[钱包] 赋值后userInfo:', JSON.stringify(this.userInfo));
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
        }
      }).catch(err => {
        console.error('[钱包] loadUserInfo error:', err);
      });
    },
    formatMoney(val) {
      try {
        if (val === undefined || val === null || val === '' || val === 'undefined' || val === 'null') {
          return '0.00';
        }
        const num = Number(String(val).trim());
        if (isNaN(num) || !isFinite(num)) {
          return '0.00';
        }
        return num.toFixed(2);
      } catch (e) {
        console.error('[钱包] formatMoney异常:', e, 'val=', val);
        return '0.00';
      }
    },
    rechargeClick() {
      uni.showToast({ title: '充值功能开发中', icon: 'none' });
    },
    withdrawClick() {
      uni.showToast({ title: '提现功能开发中', icon: 'none' });
    },
    transferClick() {
      uni.showToast({ title: '转账功能开发中', icon: 'none' });
    },
    detailClick() {
      uni.showToast({ title: '明细功能开发中', icon: 'none' });
    }
  }
};
</script>

<style scoped lang="scss">
.wallet-page {
  min-height: 100vh;
  background: #f5f5f7;
  padding: 24rpx;
  box-sizing: border-box;
}

/* 资产卡片 */
.asset-card {
  background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(252, 96, 118, 0.2);
}

.asset-title {
  font-size: 28rpx;
  opacity: 0.9;
}

.asset-balance {
  font-size: 72rpx;
  font-weight: bold;
  margin: 16rpx 0;
}

.asset-tags {
  display: flex;
  gap: 16rpx;
}

.asset-tag {
  background: rgba(255, 255, 255, 0.25);
  padding: 6rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}

/* 资产明细 */
.asset-detail {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.detail-value.income {
  color: #52c41a;
}

.detail-value.cost {
  color: #ff4d4f;
}

/* 操作按钮 */
.action-section {
  display: flex;
  justify-content: space-around;
  background: #fff;
  margin-top: 24rpx;
  padding: 32rpx 0;
  border-radius: 20rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.action-icon {
  font-size: 56rpx;
}

/* 提示 */
.tips {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
}

.tips-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.tips-item {
  font-size: 24rpx;
  color: #999;
  line-height: 1.8;
}
</style>
