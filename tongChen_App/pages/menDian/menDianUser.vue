<template>
	<view class="store-page">
		<!-- 顶部渐变头部 -->
		<view class="page-header">
			<view class="header-title">我的门店</view>
			<view class="header-subtitle" v-if="storeInfo.mdmc">欢迎回来</view>
			<view class="header-subtitle" v-else>开启你的商业之旅</view>
		</view>

		<!-- 门店卡片 -->
		<view class="store-card" v-if="storeInfo.mdmc" @click="viewStoreDetail">
			<view class="store-badge">{{ storeInfo.menDianFlmc || '门店' }}</view>
			<view class="store-content">
				<image class="store-image" :src="storeInfo.iconUrl || '/static/default-store.png'" mode="aspectFill"></image>
				<view class="store-info">
					<view class="store-name">{{ storeInfo.mdmc }}</view>
					<view class="store-address">📍 {{ storeInfo.address1 }}</view>
					<view class="store-meta">
						<text class="meta-tag">认证商家</text>
						<text class="meta-tag" v-if="storeInfo.percentSx != 0">服务费 {{ storeInfo.percentSx }}%</text>
						<text class="meta-status" :class="storeInfo.statusID == 1 ? 'on' : 'off'">
							{{ storeInfo.statusID == 1 ? '● 营业中' : '○ 已下架' }}
						</text>
					</view>
				</view>
			</view>
			<view class="store-actions">
				<view class="action-btn btn-info" @click.stop="viewStoreDetail">详情</view>
				<view class="action-btn btn-edit" @click.stop="editStore">资料</view>
				<view class="action-btn btn-status" @click.stop="toggleStatus">
					{{ storeInfo.statusID == 0 ? "上架" : "下架" }}
				</view>
				<view class="action-btn btn-delete" @click.stop="deleteStore">删除</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<view class="empty-icon">🏪</view>
			<view class="empty-title">还没有门店</view>
			<view class="empty-desc">添加你的第一个门店，开启商业之旅</view>
		</view>

		<!-- 广告入口卡片 -->
		<view class="ad-section">
			<view class="section-label">推广工具</view>
			<view class="ad-cards">
				<view class="ad-card ad-net" @click="goNetAd">
					<view class="ad-icon">📢</view>
					<view class="ad-title">网络广告</view>
					<view class="ad-desc">一键推广到同城</view>
				</view>
				<view class="ad-card ad-temp" @click="goTempAd">
					<view class="ad-icon">⏰</view>
					<view class="ad-title">临时广告</view>
					<view class="ad-desc">限时曝光推广</view>
				</view>
			</view>
		</view>

		<!-- 底部操作区 -->
		<view class="bottom-area">
			<view class="main-btn" @click="handleStoreAction">
				{{ storeInfo.mdmc ? '✏️ 编辑门店' : '➕ 添加门店' }}
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			storeInfo: {}
		}
	},
	onShow() {
		this.getStoreInfo()
	},
	methods: {
		goNetAd() {
			uni.switchTab({ url: "/pages/menDian/netAd" })
		},
		goTempAd() {
			uni.navigateTo({ url: "/pages/menDian/tempAd" })
		},
		async getStoreInfo() {
			try {
				const token = uni.getStorageSync("token")
				const res = await this.$http("menDianInfoMy", JSON.stringify({ token }))
				if (res.code == 0) {
					this.storeInfo = res.menDianInfo || {}
					if (this.storeInfo) {
						const areaName = res.menDianInfo.areaName
						const result1 = areaName ? areaName.replace(/\s/g, '') : ''
						this.storeInfo.address1 = result1 + (res.menDianInfo.address || '')
					}
				} else if (res.code != 4) {
					uni.showToast({ title: res.msg, icon: 'none' })
				}
			} catch (error) {
				console.error('加载门店失败:', error)
			}
		},
		viewStoreDetail() {
			if (!this.storeInfo.mdID) return
			uni.navigateTo({ url: `/pages/menDian/menDianInfo?menDianID=${this.storeInfo.mdID}` })
		},
		handleStoreAction() {
			const params = {
				isMenDian: this.storeInfo.mdmc ? 1 : 0,
				menDianID: this.storeInfo.mdID || ''
			}
			const url = `/pages/menDian/menDianAddBy?${Object.keys(params).map(k => `${k}=${params[k]}`).join('&')}`
			uni.navigateTo({ url })
		},
		editStore() {
			if (!this.storeInfo.mdID) return
			uni.navigateTo({
				url: `/pages/menDian/menDianUserMeans?menDianID=${this.storeInfo.imgID}&menDianNum=${this.storeInfo.imgNum}`
			})
		},
		deleteStore() {
			if (this.storeInfo.statusID == 1) {
				uni.showToast({ title: '下架后才可以删除该门店', icon: 'none' });
				return;
			}
			uni.showModal({
				title: '提示',
				content: '确定删除该门店吗？',
				success: async (res) => {
					if (res.confirm) {
						await this.deleteStoreRequest()
					}
				}
			})
		},
		async deleteStoreRequest() {
			try {
				const res = await this.$http("menDianMyDel", JSON.stringify({
					mdID: this.storeInfo.mdID,
					token: uni.getStorageSync("token")
				}))
				if (res.code == 0) {
					uni.showToast({ title: '删除成功', icon: 'none' })
					this.storeInfo = {}
				} else {
					uni.showToast({ title: res.msg, icon: 'none' })
				}
			} catch (error) {
				console.error('删除失败:', error)
			}
		},
		async toggleStatus() {
			if (!(this.storeInfo.detailList && this.storeInfo.detailList.length == 0) || !(this.storeInfo.viewList && this.storeInfo.viewList.length == 0)) {
				uni.showToast({ title: '请先完善资料信息，然后在上架门店', icon: 'none' })
				return false;
			}
			try {
				const res = await this.$http("menDianMyStatusUpd", JSON.stringify({
					mdID: this.storeInfo.mdID,
					statusID: this.storeInfo.statusID == 1 ? 0 : 1,
					token: uni.getStorageSync("token")
				}))
				if (res.code == 0) {
					const statusID = this.storeInfo.statusID ? 0 : 1
					uni.showToast({
						title: statusID ? '上架成功' : '下架成功',
						icon: 'none'
					})
					this.getStoreInfo()
				} else {
					uni.showToast({ title: res.msg, icon: 'none' })
				}
			} catch (error) {
				console.error('状态切换失败:', error)
			}
		}
	}
}
</script>

<style scoped lang="scss">
.store-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding-bottom: 200rpx;
}

// 顶部头部
.page-header {
	background: linear-gradient(135deg, #fd7031 0%, #ff9955 100%);
	padding: 60rpx 32rpx 80rpx;
	position: relative;
	&::after {
		content: '';
		position: absolute;
		bottom: -30rpx;
		left: 0;
		right: 0;
		height: 60rpx;
		background: #f5f5f5;
		border-radius: 30rpx 30rpx 0 0;
	}
	.header-title {
		font-size: 48rpx;
		font-weight: 700;
		color: #fff;
	}
	.header-subtitle {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 8rpx;
	}
}

// 门店卡片
.store-card {
	margin: -20rpx 24rpx 0;
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 8rpx 30rpx rgba(253, 112, 49, 0.12);
	position: relative;
	overflow: hidden;
}

.store-badge {
	position: absolute;
	top: 0;
	right: 0;
	background: linear-gradient(135deg, #ff6b6b, #fd7031);
	color: #fff;
	font-size: 22rpx;
	padding: 8rpx 24rpx;
	border-radius: 0 24rpx 0 20rpx;
}

.store-content {
	display: flex;
	margin-bottom: 28rpx;
}

.store-image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 16rpx;
	margin-right: 24rpx;
	flex-shrink: 0;
	background: #f0f0f0;
}

.store-info {
	flex: 1;
	min-width: 0;
}

.store-name {
	font-size: 36rpx;
	font-weight: 700;
	color: #333;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-address {
	font-size: 26rpx;
	color: #888;
	margin-top: 12rpx;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.store-meta {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 16rpx;
	.meta-tag {
		font-size: 22rpx;
		color: #fd7031;
		background: #fff3ed;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}
	.meta-status {
		font-size: 22rpx;
		font-weight: 500;
		&.on { color: #4cd964; }
		&.off { color: #999; }
	}
}

.store-actions {
	display: flex;
	gap: 16rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #f5f5f5;
}

.action-btn {
	flex: 1;
	font-size: 26rpx;
	font-weight: 500;
	text-align: center;
	padding: 18rpx 0;
	border-radius: 12rpx;
	color: #fff;
	&.btn-info { background: #5a8dee; }
	&.btn-edit { background: #fd7031; }
	&.btn-status { background: #4cd964; }
	&.btn-delete { background: #ff5e5e; }
}

// 空状态
.empty-state {
	margin: 40rpx 24rpx 0;
	background: #fff;
	border-radius: 24rpx;
	padding: 80rpx 40rpx;
	text-align: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 24rpx;
	}
	.empty-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}
	.empty-desc {
		font-size: 26rpx;
		color: #999;
	}
}

// 推广工具区
.ad-section {
	margin: 40rpx 24rpx 0;
	.section-label {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
		padding-left: 8rpx;
	}
}

.ad-cards {
	display: flex;
	gap: 24rpx;
}

.ad-card {
	flex: 1;
	background: #fff;
	border-radius: 20rpx;
	padding: 32rpx 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	transition: transform 0.2s;
	&:active {
		transform: scale(0.97);
	}
	&.ad-net {
		background: linear-gradient(135deg, #fff5ef, #fff);
		.ad-icon { color: #fd7031; }
	}
	&.ad-temp {
		background: linear-gradient(135deg, #eef7ff, #fff);
		.ad-icon { color: #5a8dee; }
	}
	.ad-icon {
		font-size: 56rpx;
		margin-bottom: 16rpx;
	}
	.ad-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}
	.ad-desc {
		font-size: 24rpx;
		color: #999;
	}
}

// 底部按钮
.bottom-area {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 24rpx 32rpx 40rpx;
	background: linear-gradient(transparent, #f5f5f5 60%);
	z-index: 10;
}

.main-btn {
	background: linear-gradient(135deg, #fd7031, #ff9955);
	color: #fff;
	font-size: 34rpx;
	font-weight: 600;
	text-align: center;
	padding: 32rpx;
	border-radius: 16rpx;
	box-shadow: 0 8rpx 24rpx rgba(253, 112, 49, 0.35);
}
</style>
