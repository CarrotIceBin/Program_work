<template>
  <view class="detail-page">
    <!-- 商品图片轮播 -->
    <swiper class="image-swiper" indicator-dots autoplay circular :indicator-color="'rgba(255,255,255,0.5)'" :indicator-active-color="'#fff'">
      <swiper-item v-for="(img, index) in images" :key="index">
        <image class="product-image" :src="img" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 商品基本信息 -->
    <view class="info-section">
      <view class="price-row">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ product.price }}</text>
        <text class="price-unit">起</text>
        <view class="sales-tag">已售 {{ product.sales }}</view>
      </view>
      <view class="product-title">{{ product.title }}</view>
      <view class="product-desc">{{ product.desc }}</view>
    </view>

    <!-- 商品规格 -->
    <view class="spec-section">
      <view class="spec-item" v-for="(spec, index) in product.specs" :key="index" @click="selectSpec(index)">
        <text class="spec-label">{{ spec.label }}</text>
        <view class="spec-values">
          <text 
            v-for="(val, vIdx) in spec.values" 
            :key="vIdx" 
            class="spec-value"
            :class="{ active: selectedSpecs[spec.key] === val }"
            @click.stop="selectSpecValue(spec.key, val)"
          >{{ val }}</text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-title">商品详情</view>
      <view class="detail-content">
        <view class="detail-item" v-for="(item, index) in product.details" :key="index">
          <text class="detail-label">{{ item.label }}：</text>
          <text class="detail-value">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <!-- 商品图片展示 -->
    <view class="gallery-section">
      <view class="section-title">商品展示</view>
      <image 
        v-for="(img, index) in images" 
        :key="index" 
        class="gallery-image" 
        :src="img" 
        mode="widthFix"
      ></image>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-item" @click="goHome">
        <view class="bar-icon">🏠</view>
        <text class="bar-text">首页</text>
      </view>
      <view class="bar-item" @click="contactService">
        <view class="bar-icon">💬</view>
        <text class="bar-text">客服</text>
      </view>
      <view class="btn-cart" @click="addToCart">加入购物车</view>
      <view class="btn-buy" @click="buyNow">立即购买</view>
    </view>

    <!-- 选择规格弹窗 -->
    <view class="spec-popup" v-if="showSpecPopup" @click="showSpecPopup = false">
      <view class="spec-popup-box" @click.stop>
        <view class="popup-header">
          <image class="popup-img" :src="product.image" mode="aspectFill"></image>
          <view class="popup-info">
            <view class="popup-price">¥{{ product.price }}</view>
            <view class="popup-stock">库存：充足</view>
          </view>
          <view class="popup-close" @click="showSpecPopup = false">×</view>
        </view>
        <scroll-view scroll-y class="popup-content">
          <view class="popup-spec-item" v-for="(spec, index) in product.specs" :key="index">
            <text class="popup-spec-label">{{ spec.label }}</text>
            <view class="popup-spec-values">
              <text 
                v-for="(val, vIdx) in spec.values" 
                :key="vIdx" 
                class="popup-spec-value"
                :class="{ active: selectedSpecs[spec.key] === val }"
                @click="selectSpecValue(spec.key, val)"
              >{{ val }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="popup-footer" @click="confirmSpec">确定</view>
      </view>
      <!-- 数量选择 -->
      <view class="quantity-row">
        <text class="quantity-label">购买数量</text>
        <view class="quantity-control">
          <view class="qty-btn" @click="qty > 1 ? qty-- : 1">-</view>
          <text class="qty-value">{{ qty }}</text>
          <view class="qty-btn" @click="qty++">+</view>
        </view>
      </view>
      <!-- 确定按钮 -->
      <view class="popup-footer" @click="confirmSpec">确定</view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/api.js'

export default {
  data() {
    return {
      showSpecPopup: false,
      qty: 1,
      images: [],
      product: {
        id: '',
        title: '',
        desc: '',
        price: '',
        sales: '',
        image: '',
        images: [],
        specs: [],
        details: []
      },
      selectedSpecs: {}
    }
  },
  computed: {
    // 根据商品ID获取商品数据（后端接口对接后此方法可删除）
    productData() {
      const productMap = {
        '1': {
          id: '1',
          title: 'PUBG绝地求生超级巨星蓝色战神夹克CDK',
          desc: '【官方CDK】24小时发货 绝地求生 超级巨星蓝色战神夹克',
          price: '28.00',
          sales: '2000+',
          image: '/static/2026.jpg',
          images: ['/static/2026.jpg', '/static/2.jpg', '/static/3.jpg'],
          specs: [
            { key: 'edition', label: '版本', values: ['超级巨星版', '普通版'] },
            { key: 'delivery', label: '发货方式', values: ['自动发货', '人工发货'] }
          ],
          details: [
            { label: '商品品牌', value: 'PUBG' },
            { label: '商品类型', value: 'CDK激活码' },
            { label: '使用平台', value: 'Steam / 官方' },
            { label: '有效期', value: '永久有效' },
            { label: '发货时间', value: '24小时内发货' }
          ]
        },
        '2': {
          id: '2',
          title: '苹果17 Pro 百亿补贴',
          desc: '【需当面签收激活】iPhone 17 Pro Apple/苹果',
          price: '6999.00',
          sales: '500+',
          image: '/static/1.jpg',
          images: ['/static/1.jpg', '/static/2026.jpg', '/static/3.jpg'],
          specs: [
            { key: 'capacity', label: '容量', values: ['256GB', '512GB', '1TB'] },
            { key: 'color', label: '颜色', values: ['原色钛金属', '深空黑色', '白色'] }
          ],
          details: [
            { label: '品牌', value: 'Apple 苹果' },
            { label: '型号', value: 'iPhone 17 Pro' },
            { label: '屏幕尺寸', value: '6.3英寸' },
            { label: '处理器', value: 'A19 Pro' },
            { label: '保修', value: '全国联保一年' }
          ]
        },
        '3': {
          id: '3',
          title: 'PUBG曼森套装皮肤CDK连帽卫衣98k枪皮肤主播',
          desc: '绝地求生PUBG曼森套装皮肤CDK连帽卫衣98k枪皮肤主播',
          price: '35.00',
          sales: '800+',
          image: '/static/2.jpg',
          images: ['/static/2.jpg', '/static/2026.jpg', '/static/1.jpg'],
          specs: [
            { key: 'gift', label: '赠品', values: ['含赠品', '无赠品'] }
          ],
          details: [
            { label: '商品品牌', value: 'PUBG' },
            { label: '包含内容', value: '曼森套装+98k皮肤' },
            { label: '发货方式', value: '自动发货' },
            { label: '有效期', value: '永久有效' }
          ]
        },
        '4': {
          id: '4',
          title: '星魂大礼包皮肤吃鸡M4猛虎下山白运动白虎平底锅CDK',
          desc: 'PUBG绝地求生星魂大礼包皮肤吃鸡M4猛虎下山白运动白虎平底锅CDK',
          price: '58.00',
          sales: '1000+',
          image: '/static/3.jpg',
          images: ['/static/3.jpg', '/static/2026.jpg', '/static/1.jpg'],
          specs: [
            { key: 'package', label: '礼包类型', values: ['星魂大礼包', '单一皮肤'] }
          ],
          details: [
            { label: '商品品牌', value: 'PUBG' },
            { label: '包含内容', value: 'M4+白虎平底锅+运动套装' },
            { label: '发货方式', value: '自动发货' },
            { label: '有效期', value: '永久有效' }
          ]
        },
        '5': {
          id: '5',
          title: '相册5',
          desc: '类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品',
          price: '13.14',
          sales: '300+',
          image: '/static/4.jpg',
          images: ['/static/4.jpg', '/static/5.jpg', '/static/6.jpg'],
          specs: [
            { key: 'style', label: '款式', values: ['默认'] }
          ],
          details: [
            { label: '商品类型', value: '相册展示' },
            { label: '发货方式', value: '点击链接购买' },
            { label: '有效期', value: '长期有效' }
          ]
        },
        '6': {
          id: '6',
          title: '相册6',
          desc: '类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品',
          price: '521',
          sales: '200+',
          image: '/static/5.jpg',
          images: ['/static/5.jpg', '/static/4.jpg', '/static/6.jpg'],
          specs: [
            { key: 'style', label: '款式', values: ['默认'] }
          ],
          details: [
            { label: '商品类型', value: '相册展示' },
            { label: '发货方式', value: '点击链接购买' },
            { label: '有效期', value: '长期有效' }
          ]
        },
        '7': {
          id: '7',
          title: '相册7',
          desc: '类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品',
          price: '1314',
          sales: '500+',
          image: '/static/6.jpg',
          images: ['/static/6.jpg', '/static/4.jpg', '/static/5.jpg'],
          specs: [
            { key: 'style', label: '款式', values: ['默认'] }
          ],
          details: [
            { label: '商品类型', value: '相册展示' },
            { label: '发货方式', value: '点击链接购买' },
            { label: '有效期', value: '长期有效' }
          ]
        },
        '8': {
          id: '8',
          title: '相册8',
          desc: '类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品',
          price: '777',
          sales: '150+',
          image: '/static/7.jpg',
          images: ['/static/7.jpg', '/static/4.jpg', '/static/5.jpg'],
          specs: [
            { key: 'style', label: '款式', values: ['默认'] }
          ],
          details: [
            { label: '商品类型', value: '相册展示' },
            { label: '发货方式', value: '点击链接购买' },
            { label: '有效期', value: '长期有效' }
          ]
        }
      }
      return productMap[this.product.id] || this.product
    }
  },
  onLoad(options) {
    // 接收传递的商品参数
    const productStr = decodeURIComponent(options.product || '{}')
    this.product = JSON.parse(productStr)

    // 先用传过来的图片做初始展示
    if (this.product.images && this.product.images.length) {
      this.images = this.product.images
    } else if (this.product.image) {
      this.images = [this.product.image]
    }

    // 从后端拉取商品详情数据
    this.loadDetail()

    // 初始化规格选择
    if (this.product.specs && this.product.specs.length) {
      this.product.specs.forEach(spec => {
        this.$set(this.selectedSpecs, spec.key, spec.values[0])
      })
    }
  },
  methods: {
    // 从后端拉取商品详情
    async loadDetail() {
      const token = uni.getStorageSync('token')
      try {
        const res = await request('goodsDetail', {
          id: this.product.id,
          token: token
        })
        // 后端返回格式: { code: "0", data: { id, title, desc, price, sales, image, images, specs, details } }
        if (res.code == '0' && res.data) {
          const d = res.data
          this.product = {
            id: d.id,
            title: d.title || this.product.title,
            desc: d.desc || this.product.desc,
            price: d.price || this.product.price,
            sales: d.sales || '100+',
            image: d.image || this.product.image,
            images: d.images || (d.image ? [d.image] : this.images),
            specs: d.specs || [],
            details: d.details || []
          }
          this.images = this.product.images
          // 初始化规格
          if (this.product.specs.length) {
            this.product.specs.forEach(spec => {
              this.$set(this.selectedSpecs, spec.key, spec.values[0])
            })
          }
        } else {
          // 后端无数据，用本地预设兜底
          this.usePreset()
        }
      } catch (e) {
        console.log('后端接口未就绪，使用本地预设数据', e)
        this.usePreset()
      }
    },
    // 本地预设数据兜底（后端接口就绪后可删除）
    usePreset() {
      const presetData = this.productData
      if (presetData && presetData.id && presetData.images) {
        this.product = presetData
        this.images = presetData.images
        if (this.product.specs && this.product.specs.length) {
          this.product.specs.forEach(spec => {
            this.$set(this.selectedSpecs, spec.key, spec.values[0])
          })
        }
      }
    },
    selectSpec(index) {
      // 可以扩展点击整个规格行的逻辑
    },
    selectSpecValue(key, value) {
      this.$set(this.selectedSpecs, key, value)
    },
    goHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    contactService() {
      uni.showModal({
        title: '联系客服',
        content: '客服微信号：tcyy2024\n或点击复制',
        confirmText: '复制微信号',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: 'tcyy2024',
              success: () => {
                uni.showToast({ title: '复制成功，请添加客服微信', icon: 'none' })
              }
            })
          }
        }
      })
    },
    addToCart() {
      this.showSpecPopup = true
    },
    buyNow() {
      this.showSpecPopup = true
    },
    confirmSpec() {
      this.showSpecPopup = false
      const specText = Object.values(this.selectedSpecs).join(' / ')
      uni.showToast({ title: `已选：${specText}，共${this.qty}件`, icon: 'none' })
      // 这里可以跳转到订单确认页
      setTimeout(() => {
        uni.showToast({ title: '订单已提交', icon: 'success' })
      }, 500)
    }
  }
}
</script>

<style scoped lang="scss">
.detail-page {
  background: #f5f5f5;
  padding-bottom: 120rpx;
  min-height: 100vh;
}

// 图片轮播
.image-swiper {
  width: 100%;
  height: 600rpx;
  background: #fff;
}

.product-image {
  width: 100%;
  height: 600rpx;
}

// 商品信息
.info-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.price-symbol {
  color: #ff4444;
  font-size: 28rpx;
  font-weight: bold;
}

.price-value {
  color: #ff4444;
  font-size: 52rpx;
  font-weight: bold;
  margin-right: 8rpx;
}

.price-unit {
  color: #ff4444;
  font-size: 24rpx;
  margin-right: auto;
}

.sales-tag {
  color: #999;
  font-size: 24rpx;
}

.product-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.product-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.5;
}

// 规格选择
.spec-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.spec-item {
  margin-bottom: 28rpx;
}

.spec-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.spec-value {
  padding: 12rpx 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  background: #f9f9f9;
}

.spec-value.active {
  border-color: #fd7031;
  color: #fd7031;
  background: #fff5f0;
}

// 详情区
.detail-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 20rpx;
  padding-left: 16rpx;
  border-left: 6rpx solid #fd7031;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  width: 180rpx;
  font-size: 28rpx;
  color: #999;
}

.detail-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

// 商品展示
.gallery-section {
  background: #fff;
  padding: 24rpx;
}

.gallery-image {
  width: 100%;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.06);
  z-index: 100;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20rpx;
}

.bar-icon {
  font-size: 40rpx;
}

.bar-text {
  font-size: 22rpx;
  color: #666;
  margin-top: 4rpx;
}

.btn-cart, .btn-buy {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  margin-left: 16rpx;
}

.btn-cart {
  background: linear-gradient(135deg, #ffb74d, #ff9800);
}

.btn-buy {
  background: linear-gradient(135deg, #fd7031, #ff5722);
}

// 规格选择弹窗
.spec-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.spec-popup-box {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.popup-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
}

.popup-info {
  flex: 1;
  margin-left: 20rpx;
  padding-top: 10rpx;
}

.popup-price {
  color: #ff4444;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.popup-stock {
  font-size: 26rpx;
  color: #999;
}

.popup-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 48rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  line-height: 56rpx;
  text-align: center;
}

.popup-content {
  flex: 1;
  padding: 24rpx;
  max-height: 400rpx;
}

.popup-spec-item {
  margin-bottom: 32rpx;
}

.popup-spec-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.popup-spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.popup-spec-value {
  padding: 14rpx 32rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  background: #f9f9f9;
}

.popup-spec-value.active {
  border-color: #fd7031;
  color: #fd7031;
  background: #fff5f0;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.quantity-label {
  font-size: 28rpx;
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 32rpx;
  color: #333;
  background: #f5f5f5;
}

.qty-value {
  width: 80rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;
}

.popup-footer {
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: linear-gradient(135deg, #fd7031, #ff5722);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 0 0 24rpx 24rpx;
}
</style>
