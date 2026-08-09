<template>
	<view class="page-container" :style="'margin-top:'+ topHeight +'px;'">
		<view class="user-info-wrapper">
			<view class="user-header">
				<view class="avatar-container">
					<image :src="userInfo.imgUrl || '/static/missing-face.png'" mode="aspectFill"></image>
				</view>
				<view class="user-detail">
					<view class="user-name">{{ userInfo.userName }}</view>
					<view class="user-stats">
						<view class="stat-btn" @click="meansClick">资料</view>
						<view class="stat-btn" @click="walletClick">钱包</view>
						<view class="stat-btn" @click="openFilter">筛选：{{ genderFilterText }}</view>
					</view>
				</view>
			</view>
			<view class="user-actions" @click="setClick">设置</view>
		</view>
		<view class="top-data-list">
			<view class="data-item">
				<view class="data-name">好友</view>
				<view class="data-value">{{ userTopData.numFans }}</view>
			</view>
			<view class="data-item">
				<view class="data-name">关注</view>
				<view class="data-value">{{ userTopData.numSc }}</view>
			</view>
			<view class="data-item">
				<view class="data-name">点赞</view>
				<view class="data-value">{{ userTopData.numDz }}</view>
			</view>
			<view class="data-item">
				<view class="data-name">评论</view>
				<view class="data-value">{{ userTopData.numPinLun }}</view>
			</view>
		</view>
		<!-- <view class="top-data-list">
			<view class="data-item" v-for="item in userTopData" :key="item.userID">
				<view class="data-name">{{ item.name }}</view>
				<view class="data-value">{{ item.num }}</view>
			</view>
		</view> -->
		
		<view class="interactive-section">
			<view class="interactive-item" @click="myNewsClick">
				<view class="info-number">{{ userTopData.numNewsMy }}</view>
				<view class="info-label">我的同城</view>
				<view class="interactive-action" @click.stop="publishClick">发同城圈</view>
			</view>
			
			<view class="interactive-item">
				<view class="info-number">0</view>
				<view class="info-label">谁看过我</view>
				<view class="interactive-action">去看看</view>
			</view>
			<view class="interactive-item">
				<view class="info-number">0</view>
				<view class="info-label">我看过的</view>
				<view class="interactive-action">去看看</view>
			</view>
			<view class="interactive-item">
				<view class="info-number">0</view>
				<view class="info-label">相亲访客</view>
				<view class="interactive-action">去看看</view>
			</view>
		</view>
		
		<view class="page-bottom-notice" v-if="showNotice">
			<!-- 喇叭图标 -->
			<text class="notice-icon">📢</text>
			<!-- 横向滚动公告文字 -->
			<scroll-view class="notice-scroll">
				<text class="notice-txt">{{ noticeContent }}</text>
			</scroll-view>
			<!-- 关闭按钮 -->
			<text class="close-btn" @click="showNotice = false">×</text>
		</view>
		
		<view class="bottom-tags" v-if="userBottomData.length">
			<view class="tag-item" v-for="item in userBottomData" :key="item.selectValue" 
				  @click="tagsBottomClick(item.selectValue)">
				{{ item.selectTxt }}
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			topHeight: 0,
			userInfo: {},
			userTopData: {},
			showNotice: true,
			noticeContent: "茫茫四海人无数，哪个男儿是丈夫？今生的妻子，万世的祖母。有心者有所累，无心者无所畏。婚姻的本质是搭伙过日子，合伙与同命，喜结良缘需结合实际考虑双方家庭等各种因素，评估能否过下去，希望大家能找到一位如意配偶",
			userTopData: [
				{ userID: 1, name: '好友', num: 0 },
				{ userID: 2, name: '关注', num: 0 },
				{ userID: 3, name: '粉丝', num: 0 },
				{ userID: 4, name: '收藏', num: 0 },
				{ userID: 5, name: '转发', num: 0 },
				{ userID: 6, name: '点赞', num: 0 },
				{ userID: 7, name: '评论', num: 0 }
			],
			userBottomData: [],
			genderFilterText: ''
		}
	},
	onLoad() {
		const getInfo = uni.getWindowInfo();
		this.topHeight = getInfo.statusBarHeight ? Number(getInfo.statusBarHeight) : 0;
	},
	onShow() {
		this.userStatInfo();
		this.getUserInfo();
		this.selectItemList();
		// 读取已保存的性别筛选
		const saved = uni.getStorageSync('genderFilter');
		if (saved === '男' || saved === '女') {
			this.genderFilterText = saved;
		} else {
			this.genderFilterText = '';
		}
	},
	methods: {
		getUserInfo() {
			this.$http("userInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.code == 0) {
					this.userInfo = res.userInfo;
				} else {
					if(res.code != 4 && res.code != 99) {
						uni.showToast({title: res.msg, icon:'none' });
					}
				}
			}).catch(console.error);
		},
		userStatInfo(){
			this.$http("userStatisticInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.code == 0) {
					this.userTopData = res.userInfo;
				} else {
					uni.showToast({title: res.msg, icon:'none' });
				}
			}).catch(console.error);
		},
		selectItemList() {
			this.$http("selectItemList", JSON.stringify({
				tag: "video_fl",
				token: uni.getStorageSync("token") || ''
			})).then(res => {
				if (res.code == 0) {
					this.userBottomData = res.itemList;
				} else {
					if(res.code != 4) {
						uni.showToast({title: res.msg, icon:'none' });
					}
				}
			}).catch(console.error);
		},
		setClick() {
			if (!this.checkLogin()) return;
			uni.navigateTo({ url: '/pages/userProfile/userinfo' });
		},
		tagsBottomClick(videoID) {
			if (!this.checkLogin()) return;
			uni.navigateTo({ url: `/pages/user/userVideo?videoID=${videoID}` });
		},
		meansClick() {
			if (!this.checkLogin()) return;
			uni.navigateTo({ url: '/pages/userProfile/basics' });
		},
		walletClick() {
			if (!this.checkLogin()) return;
			uni.navigateTo({ url: '/pages/user/wallet' });
		},
		openFilter() {
			if (!this.checkLogin()) return;
			uni.showActionSheet({
				itemList: ['全部', '男', '女'],
				success: (res) => {
					const map = ['all', '男', '女'];
					const choice = map[res.tapIndex];
					// 保存到本地存储，供index.vue读取
					if (choice === 'all') {
						uni.removeStorageSync('genderFilter');
						this.genderFilterText = '全部';
					} else {
						uni.setStorageSync('genderFilter', choice);
						this.genderFilterText = choice;
					}
					uni.showToast({
						title: `已选择：${this.genderFilterText}`,
						icon: 'none'
					});
				},
				fail: () => {}
			});
		},
		publishClick(){
			if (!this.checkLogin()) return;
			uni.navigateTo({
				url: "/pages/index/dynamic"
			});
		},
		myNewsClick() {
			if (!this.checkLogin()) return;
			const userid = uni.getStorageSync('userid');
			if (!userid) {
				this.showToast('用户信息异常');
				return;
			}
			uni.navigateTo({
				url: `/pages/index/headshots?userid=${userid}`
			});
		},
		checkLogin() {
			if (!uni.getStorageSync('token')) {
				this.navigateToLogin();
				return false;
			}
			return true;
		},
		navigateToLogin() {
			uni.clearStorage();
			uni.navigateTo({ url: '/pages/public/loginPwd' });
		}
	}
}
</script>

<style scoped lang="scss">
.page-container {
	padding-bottom: 160rpx;
	padding: 20rpx;
	background-color: #f5f5f7;
	touch-action: none;
	/* #ifndef APP-NVUE */
	height: calc(100vh - 50px);
	/* #endif */
	/* #ifndef H5 */
	height: calc(100vh - 36px);
	/* #endif */
}

/* 底部公告栏专属样式 */
::v-deep .page-bottom-notice {
	position: fixed; /* 固定在页面最底部，不随页面滚动消失 */
	left: 30rpx;
	right: 30rpx;
	bottom: 90rpx;
	display: flex;
	align-items: center;
	padding: 20rpx 24rpx;
	background: #fff8e6;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);

	.notice-icon {
		font-size: 34rpx;
		margin-right: 16rpx;
	}
	.notice-scroll {
	  flex: 1;
	  // height: 40rpx; 删掉固定高度，高度随文字自适应
	  .notice-txt {
	    font-size: 26rpx;
	    color: #e06c20;
	    line-height: 1.6; // 行间距，多行文字看着舒适
	  }
	}
	.close-btn {
		font-size: 36rpx;
		color: #aaa;
		padding: 0 10rpx;
	}
}

.user-info-wrapper {
	background: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	
	.user-header {
		display: flex;
		align-items: center;
		flex: 1;
		
		.avatar-container {
			width: 130rpx;
			height: 130rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-right: 20rpx;
			border: 4rpx solid #eee;
			
			image {
				width: 100%;
				height: 100%;
			}
		}
		
		.user-detail {
			flex: 1;
			
			.user-name {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 15rpx;
			}
			
			.user-stats {
				display: flex;
				gap: 20rpx;
				
				.stat-btn {
					font-size: 24rpx;
					color: #fff;
					background-color: #FD7031;
					padding: 5rpx 15rpx;
					border-radius: 10rpx;
				}
			}
		}
	}
	
	.user-actions {
		height: 60rpx;
		font-size: 28rpx;
		color: #FD7031;
		border: 2rpx solid #FD7031;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.top-data-list {
	background: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	
	.data-item {
		text-align: center;
		padding: 20rpx 0;
		
		.data-name {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 10rpx;
		}
		
		.data-value {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}
}

.interactive-section {
	background: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	
	.interactive-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.info-number {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 5rpx;
		}
		
		.info-label {
			font-size: 26rpx;
			color: #666;
			margin-bottom: 15rpx;
		}
		
		.interactive-action {
			font-size: 26rpx;
			color: #FD7031;
			border: 2rpx solid #FD7031;
			padding: 10rpx 20rpx;
			border-radius: 30rpx;
		}
	}
}

.bottom-tags {
	background: #fff;
	border-radius: 10rpx;
	padding: 30rpx 20rpx;
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 20rpx;
	
	.tag-item {
		font-size: 30rpx;
		background-color: #f5f5f5;
		padding: 12rpx;
		border-radius: 10rpx;
		text-align: center;
	}
}
</style>
