<template>
	<view class="page">
		<!-- 轮播图 -->
		<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
			<swiper-item v-for="(item, index) in images.view" :key="index">
				<image :src="item.url" mode="aspectFill" class="swiper-img" />
			</swiper-item>
		</swiper>

		<!-- 门店信息 -->
		<view class="info-card">
			<view class="info-header">
				<text class="name">{{ store.mdmc }}</text>
				<view class="tag" v-if="store.menDianFlmc">{{ store.menDianFlmc }}</view>
			</view>
			<view class="address">{{ store.address1 }}</view>
			<view class="info-row" v-if="store.percentSx > 0">
				<text class="label">服务费：</text>
				<text class="value fee">{{ store.percentSx }}%</text>
			</view>
			<view class="info-row" v-if="store.contract">
				<text class="label">联系人：</text>
				<text class="value">{{ store.contract }}</text>
			</view>
			<view class="info-row" v-if="store.mobile" @click="mobileClick">
				<text class="label">电话：</text>
				<text class="">{{ store.mobile }}</text>
			</view>
		</view>

		<!-- 门店详情 -->
		<view class="detail-section">
			<view class="section-title">
				<text class="line"></text>
				<text class="text">门店详情</text>
				<text class="line"></text>
			</view>
			<view class="detail-images" v-if="images.detail.length">
				<image v-for="(img, idx) in images.detail" :key="idx" :src="img.url" mode="widthFix" class="detail-img" />
			</view>
			<view class="no-data" v-else>
				<text>暂无详情图片</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			storeId: 0,
			store: {},
			images: {
				view: [],
				detail: []
			}
		}
	},
	onLoad(options) {
		this.storeId = options.menDianID || 0
		this.loadStoreInfo()
	},
	methods: {
		async loadStoreInfo() {
			try {
				const res = await this.$http('menDianInfo', {
					mdID: this.storeId,
					token: uni.getStorageSync('token') || ''
				})

				if (res.code == 0) {
					this.processStoreData(res.newsInfo)
				} else {
					this.showToast(res.msg)
				}
			} catch (error) {
				console.error('加载门店信息失败:', error)
			}
		},

		processStoreData(data) {
			this.store = data || {}
			this.images.view = data.imgList?.viewList || []
			this.images.detail = data.imgList?.detailList || []
			
			if(data.address){
				const areaName = data.areaName
				const result1 = areaName.replace(/\s/g, '');
				this.store.address1 = result1 + data.address
			}
		},

		showToast(message) {
			uni.showToast({ title: message, icon: 'none' })
		},
		
		mobileClick(){
			uni.makePhoneCall({
				phoneNumber: this.store.mobile
			});
		}
	}
}
</script>

<style scoped lang="scss">
.page {
	background: #f5f5f5;
	min-height: 100vh;
}

/* 轮播图 */
.swiper {
	height: 350rpx;
	background: #fff;

	.swiper-img {
		width: 100%;
		height: 100%;
		display: block;
	}
}

/* 门店信息卡片 */
.info-card {
	background: #fff;
	padding: 20rpx;
	margin: 20rpx 0;

	.info-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.name {
			flex: 1;
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			line-height: 1.4;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}

		.tag {
			background: #fd7031;
			color: #fff;
			font-size: 24rpx;
			padding: 8rpx 16rpx;
			border-radius: 24rpx;
			margin-left: 20rpx;
		}
	}

	.address {
		display: flex;
		align-items: flex-start;
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 20rpx;

		.icon {
			margin-right: 10rpx;
		}
	}

	.info-row {
		display: flex;
		font-size: 28rpx;
		margin-bottom: 10rpx;

		.label {
			color: #999;
			width: 120rpx;
		}

		.value {
			flex: 1;
			color: #333;

			&.fee {
				color: #fd7031;
				font-weight: bold;
			}
		}
	}
}

/* 详情区域 */
.detail-section {
	background: #fff;
	padding: 30rpx 20rpx;
	margin-top: 20rpx;

	.section-title {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;

		.line {
			width: 80rpx;
			height: 2rpx;
			background: linear-gradient(90deg, transparent, #fd7031, transparent);
		}

		.text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin: 0 30rpx;
		}
	}

	.detail-images {
		.detail-img {
			width: 100%;
			display: block;
			overflow: hidden;
		}
	}

	.no-data {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
		font-size: 28rpx;
	}
}
</style>