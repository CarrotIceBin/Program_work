<template>
  <view class="net-ad-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="keyword" placeholder="搜索商品" confirm-type="search" @confirm="doSearch" />
      </view>
    </view>

    <!-- 相册网格列表 -->
    <scroll-view scroll-y class="album-list">
      <view class="album-wrap">
        <view class="album-item" v-for="(item,index) in filteredList" :key="index" @click="openDetail(item)">
          <view class="album-img-wrap">
            <image class="album-img" :src="item.img" mode="aspectFill"></image>
            <view class="album-price" v-if="item.price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{item.price}}</text>
            </view>
          </view>
          <view class="album-title">{{item.title}}</view>
          <view class="album-desc">{{item.desc}}</view>
        </view>
      </view>
      <view class="empty-tip" v-if="filteredList.length === 0">暂无匹配的商品</view>
    </scroll-view>
  </view>
</template>

<script>
import request from '@/utils/api.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      keyword: "",
      albumList: [
        {
          id: 1,
          title: "PUBG绝地求生超级巨星蓝色战神夹克CDK",
          desc: "PUBG绝地求生超级巨星蓝色战神夹克CDK",
          img: "/static/2026.jpg",
          price: "28.00",
          link: "https://xxx商品链接1"
        },
        {
          id: 2,
          title: "苹果17 Pro 百亿补贴",
          desc: "【需当面签收激活】iPhone 17 Pro Apple/苹果",
          img: "/static/1.jpg",
          price: "6999.00",
          link: "https://xxx商品链接2"
        },
        {
          id: 3,
          title: "PUBG曼森套装皮肤CDK连帽卫衣98k枪皮肤主播",
          desc: "绝地求生PUBG曼森套装皮肤CDK连帽卫衣98k枪皮肤主播",
          img: "/static/2.jpg",
          price: "35.00",
          link: "https://xxx商品链接3"
        },
        {
          id: 4,
          title: "星魂大礼包皮肤吃鸡M4猛虎下山白运动白虎平底锅CDK",
          desc: "PUBG绝地求生星魂大礼包皮肤吃鸡M4猛虎下山白运动白虎平底锅CDK",
          img: "/static/3.jpg",
          price: "58.00",
          link: "https://xxx商品链接4"
        },
        {
          id: 5,
          title: "相册5",
          desc: "类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品",
          img: "/static/4.jpg",
          price: "13.14",
          link: "https://xxx商品链接5"
        },
        {
          id: 6,
          title: "相册6",
          desc: "类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品",
          img: "/static/5.jpg",
          price: "521",
          link: "https://xxx商品链接6"
        },
        {
          id: 7,
          title: "相册7",
          desc: "类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品",
          img: "/static/6.jpg",
          price: "1314",
          link: "https://xxx商品链接7"
        },
        {
          id: 8,
          title: "相册8",
          desc: "类似于淘宝买家界面，最下面照片点击是由链接，最后面照片可相应平台查找该商品",
          img: "/static/7.jpg",
          price: "777",
          link: "https://xxx商品链接8"
        }
      ]
    }
  },
  computed: {
    filteredList() {
      if (!this.keyword) return this.albumList;
      const kw = this.keyword.trim().toLowerCase();
      return this.albumList.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.desc.toLowerCase().includes(kw)
      );
    }
  },
  onLoad() {
    const sysInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;
    this.loadData()
  },
  methods: {
    doSearch() {
      if (!this.keyword) {
        uni.showToast({ title: '请输入搜索内容', icon: 'none' });
        return;
      }
      uni.showToast({ title: `找到 ${this.filteredList.length} 个结果`, icon: 'none' });
    },
    openDetail(item) {
      // 构建商品数据
      const product = {
        id: item.id || this.getProductId(item),
        title: item.title,
        desc: item.desc,
        image: item.img,
        price: item.price || '0.00',
        sales: '100+',
        specs: [],
        details: []
      }
      const productStr = encodeURIComponent(JSON.stringify(product))
      uni.navigateTo({
        url: `/pages/menDian/goodsDetail?product=${productStr}`
      })
    },
    getProductId(item) {
      // 根据商品图片路径判断商品ID
      const imgPath = item.img
      if (imgPath.includes('2026')) return '1'
      if (imgPath.includes('/1.')) return '2'
      if (imgPath.includes('/2.')) return '3'
      if (imgPath.includes('/3.')) return '4'
      return ''
    },
    // 从后端加载商品列表
    async loadData() {
      const token = uni.getStorageSync('token')
      try {
        const res = await request('goodsList', { token })
        // 后端返回格式: { code: "0", data: [{ id, title, desc, img, price, link }] }
        if (res.code == '0' && res.data && res.data.length) {
          this.albumList = res.data.map(item => ({
            id: item.id,
            title: item.title || '',
            desc: item.desc || '',
            img: item.img || '',
            price: item.price || '',
            link: item.link || ''
          }))
        }
      } catch (e) {
        console.log('商品列表后端接口未就绪，使用本地数据', e)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.net-ad-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 顶部导航栏
.nav-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #ffffff;
  box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.06);
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f2f2f2;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
  width: 100%;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  background: transparent;
  border: none;
  outline: none;
}

// 页面标题
.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  padding: 24rpx 24rpx 16rpx;
  background: #fff;
}

// 相册网格
.album-list {
  padding: 20rpx 24rpx;
  flex: 1;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.album-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.album-item {
  width: 48%;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.album-img-wrap {
  width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
}

.album-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

// 价格标签
.album-price {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  background: rgba(255, 68, 68, 0.9);
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
  margin-right: 4rpx;
}

.price-value {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

.album-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  padding: 16rpx 20rpx 8rpx;
  text-align: center;
}

.album-desc {
  font-size: 24rpx;
  color: #666;
  padding: 0 20rpx;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
