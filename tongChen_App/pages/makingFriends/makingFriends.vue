<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-content">
				<view class="navbar-title">交友/相亲</view>
			</view>
		</view>

		<!-- 顶部Tab栏 -->
		<view class="tab-bar">
			<view class="tab-inner">
				<view 
					v-for="item in tabs" 
					:key="item.id" 
					class="tab-item" 
					:class="{ active: currentTab == item.id }" 
					@click="switchTab(item.id)"
				>
					{{ item.name }}
				</view>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content">
			<!-- 空状态 -->
			<view v-if="currentData.length === 0 && loadStatus === 'more'" class="empty-state">
				<uni-icons type="person" size="80" color="#ddd"></uni-icons>
				<text class="empty-text">暂无用户</text>
				<text class="empty-tip">快去其他Tab看看吧~</text>
			</view>
			
			<view 
				v-for="(item, index) in currentData" 
				:key="index" 
				class="user-card" 
				@click="goToUserPage(item)"
			>
				<view class="avatar-wrap">
					<image v-if="item.imgUrl" class="avatar" :src="item.imgUrl" mode="aspectFill"></image>
					<view v-else class="avatar avatar-placeholder">
						<uni-icons type="person" size="32" color="#fff"></uni-icons>
					</view>
					<view class="online-dot" v-if="getUserStatus(item) === '在线'"></view>
				</view>
				<view class="user-info">
					<view class="user-top">
						<text class="username">{{ item.userName || '未知用户' }}</text>
						<view class="status-tag" :class="{ online: getUserStatus(item) === '在线' }">
							{{ getUserStatus(item) }}
						</view>
					</view>
					<view class="user-bottom">
						<view class="info-item">
							<uni-icons type="location" size="12" color="#999"></uni-icons>
							<text>{{ item.distance || '未知距离' }}</text>
						</view>
						<view class="info-item">
							<uni-icons type="chatbubble" size="12" color="#999"></uni-icons>
							<text>{{ formatLoginTime(item.loginTime) }}</text>
						</view>
					</view>
				</view>
				<view class="action-btn">
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>
			
			<uni-load-more :status="loadStatus" :content-text="contentText" />
		</view>
	</view>
</template>

<script>
const TAB_CONFIG = {
	1: { name: '附近的人', needCheck: false },
	2: { name: '故乡的人', needCheck: false },
	3: { name: '附近缘分', needCheck: false },
	4: { name: '故乡缘分', needCheck: false },
	5: { name: '单身', needCheck: false }
};

export default {
	data() {
		return {
			currentTab: 1,
			pages: 0,
			userData: {},
			loading: false,
			
			// 修复：添加缺失的pageInfo
			pageInfo: {
				1: { total_num: 0, per_num: 0 },
				2: { total_num: 0, per_num: 0 },
				3: { total_num: 0, per_num: 0 },
				4: { total_num: 0, per_num: 0 },
				5: { total_num: 0, per_num: 0 }
			},
			
			loadStatus: 'more',
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				contentnomore: '没有更多数据了'
			},
			statusBarHeight: 20,
		};
	},

	computed: {
		tabs() {
			return Object.keys(TAB_CONFIG).map((id) => ({
				id: Number(id),
				name: TAB_CONFIG[id].name
			}));
		},

		activeTabId() {
			return this.currentTab;
		},

		currentData() {
			return this.userData[this.currentTab] || [];
		}
	},

	onLoad() {
		this.initUserData();
		// 获取状态栏高度
		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
	},
	onShow() {
		// 检查登录状态
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.redirectTo({ url: '/pages/public/loginPwd' });
			return;
		}
		// 初始化数据并加载
		this.initUserData();
		this.currentTab = 1;
		this.pages = 0;
		this.loadStatus = 'more';
		this.loadNearList();
	},

	onReachBottom() {
		if (this.loadStatus !== 'noMore' && !this.loading) {
			this.loadMore();
		}
	},

	methods: {
		initUserData() {
			this.userData = Object.keys(TAB_CONFIG).reduce((acc, key) => {
				acc[key] = [];
				return acc;
			}, {});
		},

		switchTab(tabId) {
			if (this.currentTab == tabId) return;

			this.currentTab = tabId;
			this.pages = 0;
			this.loadStatus = 'more';
			this.userData[tabId] = [];

			if (TAB_CONFIG[tabId].needCheck) {
				this.checkUserInfo(() => this.loadTabData());
			} else {
				this.loadTabData();
			}
		},

		loadTabData() {
			const methods = {
				1: this.loadNearList,
				2: this.loadGuXiangList,
				3: this.loadNearbyYuanFenList,
				4: this.loadGuXiangYuanFenList,
				5: this.loadDanShenList
			};
			methods[this.currentTab]?.call(this);
		},

		loadMore() {
			if (this.loadStatus === 'noMore') return;
			this.pages++;
			this.loadTabData();
		},

		// 公共请求方法
		commonRequest(apiName) {
			if (this.loading) return;

			this.loading = true;
			this.loadStatus = 'loading';
			const params = {
				pg: this.pages,
				token: uni.getStorageSync('token')
			};

			this.$http(apiName, params)
				.then(this.handleResponse)
				.catch(console.error)
				.finally(() => {
					this.loading = false;
					if (this.loadStatus === 'loading') {
						this.loadStatus = 'more';
					}
				});
		},

		loadNearList() {
			this.commonRequest('userListNearby');
		},

		loadGuXiangList() {
			this.commonRequest('userListGuXiang');
		},

		loadDanShenList() {
			this.commonRequest('userListDanShen');
		},

		loadNearbyYuanFenList() {
			this.commonRequest('userListNearbyYuanFen');
		},

		loadGuXiangYuanFenList() {
			this.commonRequest('userListGuXiangYuanFen');
		},

		// 响应处理
		handleResponse(res) {
			if (res.code == 0) {
				this.handleSuccess(res);
			} else if (res.code == 99) {
				this.handleLoginExpired();
			} else {
				uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
				this.loadStatus = 'more';
			}
		},

		handleSuccess(res) {
			// 兼容不同的后端返回字段名
			const listData = res.userList || res.msgList || {};
			const pgInfo = listData.pgInfo || res.pgInfo || {};
			const datas = listData.datas || res.datas || [];
			const currentTab = this.currentTab;
			
			// 修复：更新pageInfo
			this.pageInfo[currentTab] = pgInfo;
			
			// 修复：正确合并数据
			if (this.pages == 0) {
				this.userData[currentTab] = datas;
			} else {
				this.userData[currentTab].push(...datas);
			}
			
			// 修复：使用loadStatus判断是否有更多数据
			const totalNum = parseFloat(pgInfo.total_num) || 0;
			const currentLength = this.userData[currentTab].length;
			
			this.loadStatus = totalNum > 0 && currentLength >= totalNum ? 'noMore' : 'more';
		},

		// 用户信息检查
		checkUserInfo(callback) {
			this.$http('userInfo', {
				token: uni.getStorageSync('token')
			}).then((res) => {
				if (res.code == 0) {
					this.contentText.contentdown = '暂无数据'
					if (!res.userInfo?.remark) {
						this.showModal('请先完善个人信息', () => {
							uni.navigateTo({ url: '/pages/userProfile/userinfo' });
						});
					} else {
						callback?.();
					}
				} else if (res.code == 99) {
					this.handleLoginExpired();
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch(console.error);
		},

		handleLoginExpired() {
			uni.clearStorage();
			uni.redirectTo({ url: '/pages/public/loginPwd' });
		},

		showModal(content, confirmCallback) {
			uni.showModal({
				content,
				showCancel: false,
				success: (e) => e.confirm && setTimeout(confirmCallback, 200)
			});
		},

		getStatusText(tabId) {
			return [1, 3].includes(tabId) ? '在线' : '11分钟之前';
		},

		// 获取用户状态，优先使用后端返回的字段
		getUserStatus(item) {
			// 如果后端返回了 status 字段，直接使用
			if (item.status) {
				return item.status;
			}
			// 如果后端返回了 lastTime 字段，显示最后活跃时间
			if (item.lastTime) {
				return item.lastTime;
			}
			// 兜底逻辑：根据 tab 类型显示
			return [1, 3].includes(this.currentTab) ? '在线' : '11分钟之前';
		},

		// 格式化登录时间
		formatLoginTime(loginTime) {
			if (!loginTime) return '暂无登录记录';
			
			try {
				// loginTime 可能是时间戳（毫秒或秒）
				let date;
				if (typeof loginTime === 'number') {
					date = new Date(loginTime < 1000000000000 ? loginTime * 1000 : loginTime);
				} else {
					date = new Date(loginTime);
				}
				
				if (isNaN(date.getTime())) return loginTime;
				
				const now = new Date();
				const diff = now - date;
				const minutes = Math.floor(diff / 60000);
				const hours = Math.floor(diff / 3600000);
				const days = Math.floor(diff / 86400000);
				
				if (minutes < 1) return '刚刚在线';
				if (minutes < 60) return `${minutes}分钟前在线`;
				if (hours < 24) return `${hours}小时前在线`;
				if (days < 7) return `${days}天前在线`;
				
				// 超过7天显示具体日期
				const month = date.getMonth() + 1;
				const day = date.getDate();
				return `${month}月${day}日在线`;
			} catch (e) {
				return loginTime;
			}
		},

		goToUserPage(item) {
			const userId = item.userid || '';
			const userName = encodeURIComponent(item.userName || '用户');
			const avatar = encodeURIComponent(item.imgUrl || '');
			uni.navigateTo({
				url: `/pages/chat/chat?userID=${userId}&userName=${userName}&avatar=${avatar}`
			});
		}
	}
};
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f7f7f9;
}

// 自定义导航栏
.navbar {
	background: #fff;
	position: sticky;
	top: 0;
	z-index: 100;
}

.navbar-content {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.navbar-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.tab-bar {
	background: #fff;
	padding: 16rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.tab-inner {
	display: flex;
	justify-content: space-between;
	gap: 8rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	font-size: 24rpx;
	color: #666;
	padding: 10rpx 0;
	border-radius: 28rpx;
	transition: all 0.3s ease;
	white-space: nowrap;

	&.active {
		color: #fff;
		background: linear-gradient(135deg, #fd7031, #ff8c5a);
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(253, 112, 49, 0.3);
	}
}

.content {
	padding: 24rpx;
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.empty-icon {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	margin-bottom: 32rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 32rpx;
	color: #666;
	font-weight: 500;
	margin-bottom: 12rpx;
}

.empty-tip {
	font-size: 26rpx;
	color: #999;
}

.user-card {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 20rpx;
	padding: 28rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
		background: #fafafa;
	}
}

.avatar-wrap {
	position: relative;
	flex-shrink: 0;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	border: 4rpx solid #fff;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.avatar-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #fd7031, #ff8c5a);
	color: #fff;
}

.online-dot {
	position: absolute;
	right: 2rpx;
	bottom: 2rpx;
	width: 20rpx;
	height: 20rpx;
	background: #52c41a;
	border-radius: 50%;
	border: 3rpx solid #fff;
}

.user-info {
	flex: 1;
	margin-left: 24rpx;
	min-width: 0;
}

.user-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.username {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a1a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 280rpx;
}

.status-tag {
	font-size: 22rpx;
	color: #999;
	background: #f5f5f5;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	flex-shrink: 0;

	&.online {
		color: #52c41a;
		background: #f6ffed;
	}
}

.user-bottom {
	display: flex;
	gap: 24rpx;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 24rpx;
	color: #999;
}

.action-btn {
	flex-shrink: 0;
	margin-left: 16rpx;
}
</style>