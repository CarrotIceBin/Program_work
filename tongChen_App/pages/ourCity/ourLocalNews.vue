<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-content">
				<view class="navbar-title">同城消息</view>
			</view>
		</view>

		<!-- Tab栏 -->
		<view class="tab-bar">
			<view class="tab-inner">
				<view 
					v-for="item in tabBarData" 
					:key="item.tabID" 
					class="tab-item" 
					:class="{ active: currentTab == item.tabID }" 
					@click="switchTab(item.tabID)"
				>
					{{ item.name }}
				</view>
			</view>
		</view>

		<!-- 消息列表 -->
		<view class="content">
			<view v-if="msgList.length === 0 && loadStatus === 'more'" class="empty-state">
				<uni-icons type="chatbubble" size="80" color="#ddd"></uni-icons>
				<text class="empty-text">暂无消息</text>
				<text class="empty-tip">快来发布第一条消息吧~</text>
			</view>
			
			<view v-for="(item, index) in msgList" :key="index" class="msg-card" @click="openMsgDetail(item)">
				<view class="avatar-wrap">
					<image v-if="item.icon || item.imgUrl || item.userImgUrl" class="avatar" :src="item.icon || item.imgUrl || item.userImgUrl" mode="aspectFill"></image>
					<view v-else class="avatar avatar-placeholder">
						<uni-icons type="person" size="32" color="#fff"></uni-icons>
					</view>
					<view class="unread-dot" v-if="getUnreadCount(item) > 0"></view>
				</view>
				<view class="msg-info">
					<view class="msg-header">
						<text class="msg-title">{{ item.title || item.userName || '未知用户' }}</text>
						<text class="msg-time">{{ item.time || item.txt || item.inputTime || '刚刚' }}</text>
					</view>
					<view class="msg-preview">
						<text class="msg-text">{{ item.txt || item.content || item.remark || '暂无消息内容' }}</text>
						<view class="unread-badge" v-if="getUnreadCount(item) > 0">{{ getUnreadCount(item) > 99 ? '99+' : getUnreadCount(item) }}</view>
					</view>
				</view>
			</view>

			<uni-load-more :status="loadStatus" :content-text="contentText" />
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			tabBarData: [
				{ tabID: 1, name: '消息' },
				{ tabID: 2, name: '缘分' },
				{ tabID: 5, name: '单身' },
				{ tabID: 3, name: '好友列表' },
				{ tabID: 4, name: '缘分列表' }
			],
			currentTab: 1,
			page: 0,
			msgList: [],
			loadStatus: 'more',
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				contentnomore: '没有更多数据了'
			},
			pageInfo: { 
				total_num: 0,
				per_num: 0,
			},
			loading: false,
			statusBarHeight: 20
		};
	},

	onLoad() {
		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
		uni.$on('ourUserMsg', this.refreshMsgList);
		uni.$on('chatMessageUpdated', this.refreshMsgList);
	},

	onShow() {
		// 检查登录状态
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.redirectTo({ url: '/pages/public/loginPwd' });
			return;
		}
		// 重置并加载数据
		this.resetAndLoad();
	},

	onReachBottom() {
		if (this.loadStatus === 'more' && !this.loading) {
			this.page++;
			this.loadMsgList();
		}
	},

	onUnload() {
		uni.$off('ourUserMsg', this.refreshMsgList);
		uni.$off('chatMessageUpdated', this.refreshMsgList);
	},

	methods: {
		checkLoginAndLoad() {
			const token = uni.getStorageSync('token');
			if (token) {
				this.resetAndLoad();
			} else {
				this.showLoginModal();
			}
		},

		resetAndLoad() {
			this.page = 0;
			this.msgList = [];
			this.loadStatus = 'more';
			this.loadMsgList();
		},

		showLoginModal() {
			uni.clearStorage();
			uni.redirectTo({ url: '/pages/public/loginPwd' });
		},

		refreshMsgList() {
			this.resetAndLoad();
		},

		switchTab(tabID) {
			if (this.currentTab == tabID) return;
			this.currentTab = tabID;
			this.resetAndLoad();
		},

		openMsgDetail(item) {
			// 跳转到聊天页
			const userName = encodeURIComponent(item.title || '用户');
			const avatar = encodeURIComponent(item.icon || '');
			uni.navigateTo({
				url: `/pages/chat/chat?userID=${item.userid}&userName=${userName}&avatar=${avatar}`
			});
		},

		async loadMsgList() {
			if (this.loading) return;
			this.loading = true;

			try {
				// 先从本地存储读取聊天会话
				const localConversations = this.loadLocalConversations();
				
				// 再从后端拉取
				const res = await this.$http('userMsgListUser', {
					pg: this.page,
					typeId: this.currentTab,
					userid: '',
					token: uni.getStorageSync('token')
				}).catch(() => null);

				console.log('同城消息API响应:', res);

				let backendData = [];
				if (res && res.code == 0) {
					const listData = res.msgList || res.userList || res.list || {};
					backendData = listData.datas || res.datas || listData.list || [];
				} else if (res && res.code == 99) {
					this.showLoginModal();
					return;
				}

				// 合并本地和后端数据
				const mergedData = this.mergeConversations(localConversations, backendData);
				
				const pgInfo = { total_num: mergedData.length, per_num: 40 };
				this.handleMsgList({ datas: mergedData, pgInfo });
			} catch (err) {
				console.error('加载失败:', err);
				uni.showToast({ title: '网络错误', icon: 'none' });
			} finally {
				this.loading = false;
			}
		},

		loadLocalConversations() {
			const saved = uni.getStorageSync('chat_conversations');
			if (!saved) return [];
			
			try {
				const list = JSON.parse(saved);
				return list.filter(item => {
					// 只显示匹配当前Tab的会话（typeId=1是消息）
					return !item.typeId || item.typeId === this.currentTab;
				}).map(item => ({
					userid: item.userid,
					title: item.title,
					icon: item.icon,
					time: item.time,
					txt: item.txt,
					unread: item.unread || 0,
					typeId: item.typeId || 1,
					isLocal: true
				}));
			} catch (e) {
				return [];
			}
		},

		mergeConversations(localData, backendData) {
			// 后端数据格式化
			const formattedBackend = backendData.map(item => ({
				userid: item.userid || item.userId || '',
				title: item.title || item.userName || item.nickName || '',
				icon: item.icon || item.imgUrl || item.userImgUrl || '',
				time: item.time || item.inputTime || item.createTime || '',
				txt: item.txt || item.content || item.remark || item.lastMsg || '',
				unread: item.unread || item.unreadNum || item.unreadCount || item.numRead || 0,
				typeId: this.currentTab,
				isLocal: false
			}));

			// 先用 Map 按 userid 去重后端数据
			const backendMap = new Map();
			formattedBackend.forEach(item => {
				if (item.userid) {
					// 如果同一 userid 有多条，保留最新的（后面的覆盖前面的）
					backendMap.set(item.userid, item);
				}
			});

			// 再合并本地数据（本地优先）
			localData.forEach(localItem => {
				const userId = localItem.userid;
				if (userId && backendMap.has(userId)) {
					// 已存在，比较时间更新
					const existItem = backendMap.get(userId);
					if (localItem.updateTime > (existItem.updateTime || 0)) {
						backendMap.set(userId, { ...existItem, ...localItem, isLocal: true });
					}
				} else {
					// 不存在，添加本地数据
					backendMap.set(userId || 'local_' + Date.now(), { ...localItem, isLocal: true });
				}
			});

			return Array.from(backendMap.values());
		},

		handleMsgList(msgList) {
			const data = msgList.datas || [];
			this.pageInfo = msgList.pgInfo || {};

			// 转换数据格式，兼容不同字段名
			const formattedData = data.map(item => ({
				icon: item.icon || item.imgUrl || item.userImgUrl || '',
				title: item.title || item.userName || item.nickName || '',
				time: item.time || item.inputTime || item.createTime || '',
				txt: item.txt || item.content || item.remark || item.lastMsg || '',
				unread: item.unread || item.unreadNum || item.unreadCount || item.numRead || 0
			}));

			if (this.page == 0) {
				this.msgList = formattedData;
			} else {
				this.msgList.push(...formattedData);
			}

			this.updateLoadStatus();
			
			console.log('消息列表加载成功:', {
				count: this.msgList.length,
				pageInfo: this.pageInfo,
				rawData: data,
				formattedData: formattedData
			});
		},

		getUnreadCount(item) {
			return item.unread || item.unreadNum || item.unreadCount || item.numRead || 0;
		},

		updateLoadStatus() {
			const totalNum = parseFloat(this.pageInfo.total_num) || 0;
			if (totalNum > 0 && this.msgList.length >= totalNum) {
				this.loadStatus = 'nomore';
			} else if (this.msgList.length === 0) {
				this.loadStatus = 'more';
			} else {
				this.loadStatus = 'more';
			}
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

// Tab栏
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

// 内容区
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

// 消息卡片
.msg-card {
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

.unread-dot {
	position: absolute;
	top: 0;
	right: 0;
	width: 20rpx;
	height: 20rpx;
	background: #ff4d4f;
	border-radius: 50%;
	border: 3rpx solid #fff;
}

.msg-info {
	flex: 1;
	margin-left: 24rpx;
	min-width: 0;
}

.msg-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.msg-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a1a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 350rpx;
}

.msg-time {
	font-size: 22rpx;
	color: #999;
	flex-shrink: 0;
}

.msg-preview {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.msg-text {
	font-size: 26rpx;
	color: #666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
}

.unread-badge {
	background: #ff4d4f;
	color: #fff;
	font-size: 20rpx;
	min-width: 32rpx;
	height: 32rpx;
	line-height: 32rpx;
	text-align: center;
	border-radius: 16rpx;
	padding: 0 8rpx;
	flex-shrink: 0;
	margin-left: 12rpx;
}
</style>
