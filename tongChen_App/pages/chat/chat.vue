<template>
	<view class="chat-page">
		<view class="navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-inner">
				<view class="nav-back" @click="goBack">
					<text class="back-icon">‹</text>
				</view>
				<view class="nav-title">
					<text class="user-name">{{ userName }}</text>
				</view>
				<view class="nav-right">
					<text class="online-status" v-if="isOnline">● 在线</text>
				</view>
			</view>
		</view>

		<scroll-view 
			class="message-list" 
			scroll-y 
			:scroll-into-view="scrollToId" 
			scroll-with-animation
			:style="{ marginTop: (statusBarHeight + 44) + 'px' }"
		>
			<view 
				class="message-item" 
				:class="message.isSelf ? 'self' : 'other'"
				v-for="message in messages" 
				:key="message.id"
				:id="'msg-' + message.id"
			>
				<view class="avatar" v-if="!message.isSelf">
					<image :src="message.avatar" mode="aspectFill" />
				</view>
				<view class="message-content">
					<view class="bubble">
						<text class="bubble-text">{{ message.content }}</text>
					</view>
					<text class="message-time">{{ formatTime(message.time) }}</text>
				</view>
				<view class="avatar" v-if="message.isSelf">
					<image :src="myAvatar" mode="aspectFill" />
				</view>
			</view>
			<view class="empty-tip" v-if="messages.length === 0">
				<text>暂无消息，发送一条打招呼吧~</text>
			</view>
		</scroll-view>

		<view class="input-bar">
			<input 
				class="message-input" 
				v-model="inputText" 
				placeholder="输入消息..." 
				@confirm="sendMessage"
				confirm-type="send"
			/>
			<view 
				class="send-btn" 
				:class="{ active: inputText.trim() }"
				@click="sendMessage"
			>
				<text>发送</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 20,
			userID: '',
			userName: '',
			isOnline: true,
			myAvatar: '',
			otherAvatar: '',
			inputText: '',
			messages: [],
			scrollToId: ''
		};
	},
	onLoad(options) {
		const sysInfo = uni.getWindowInfo();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
		
		this.userID = options.userID || '';
		this.userName = decodeURIComponent(options.userName || '用户');
		this.otherAvatar = decodeURIComponent(options.avatar || '');
		
		this.myAvatar = uni.getStorageSync('avatar') || '/static/default-avatar.png';
		
		// 清理历史重复会话数据
		this.cleanDuplicateConversations();
		
		this.loadMessages();
		this.addWelcomeMessage();
	},
	methods: {
		cleanDuplicateConversations() {
			const listKey = 'chat_conversations';
			const saved = uni.getStorageSync(listKey);
			if (!saved) return;
			
			try {
				const conversations = JSON.parse(saved);
				// 用 Map 去重，保留最后一条（最新的）
				const uniqueMap = new Map();
				conversations.forEach(c => {
					uniqueMap.set(String(c.userid), c);
				});
				const cleaned = Array.from(uniqueMap.values());
				uni.setStorageSync(listKey, JSON.stringify(cleaned));
				console.log('清理重复会话:', {
					before: conversations.length,
					after: cleaned.length
				});
			} catch (e) {
				console.error('清理重复数据失败:', e);
			}
		},
		goBack() {
			uni.navigateBack();
		},
		loadMessages() {
			const key = `chat_${this.userID}`;
			const saved = uni.getStorageSync(key);
			if (saved) {
				this.messages = JSON.parse(saved);
			}
		},
		saveMessages() {
			const key = `chat_${this.userID}`;
			uni.setStorageSync(key, JSON.stringify(this.messages));
			// 更新会话列表，供同城消息页显示
			this.updateConversationList();
		},
		updateConversationList() {
			const listKey = 'chat_conversations';
			const saved = uni.getStorageSync(listKey);
			let conversations = saved ? JSON.parse(saved) : [];
			
			const myUserID = uni.getStorageSync('userid') || '';
			const lastMsg = this.messages[this.messages.length - 1];
			
			const conversation = {
				userid: this.userID,
				title: this.userName,
				icon: this.otherAvatar,
				time: this.formatTime(lastMsg ? lastMsg.time : Date.now()),
				txt: lastMsg ? lastMsg.content : '',
				unread: 0,
				typeId: 1,
				updateTime: Date.now()
			};
			
			// 先移除所有相同 userid 的记录（防止重复）
			conversations = conversations.filter(c => String(c.userid) !== String(this.userID));
			
			// 添加新记录到开头
			conversations.unshift(conversation);
			
			// 再去重一次（保险）
			const uniqueMap = new Map();
			conversations.forEach(c => {
				if (!uniqueMap.has(String(c.userid))) {
					uniqueMap.set(String(c.userid), c);
				}
			});
			conversations = Array.from(uniqueMap.values());
			
			// 按更新时间排序
			conversations.sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0));
			
			uni.setStorageSync(listKey, JSON.stringify(conversations));
			
			console.log('会话列表更新:', {
				total: conversations.length,
				records: conversations.map(c => ({ userid: c.userid, title: c.title }))
			});
			
			// 通知同城消息页刷新
			uni.$emit('chatMessageUpdated');
		},
		addWelcomeMessage() {
			if (this.messages.length === 0) {
				this.messages.push({
					id: Date.now(),
					content: `你好！我是${this.userName}，很高兴认识你~`,
					time: Date.now(),
					isSelf: false,
					avatar: this.otherAvatar
				});
				this.saveMessages();
				this.scrollToBottom();
			}
		},
		sendMessage() {
			const text = this.inputText.trim();
			if (!text) return;
			
			const newMessage = {
				id: Date.now(),
				content: text,
				time: Date.now(),
				isSelf: true,
				avatar: this.myAvatar
			};
			
			this.messages.push(newMessage);
			this.inputText = '';
			this.saveMessages();
			this.scrollToBottom();
			
			setTimeout(() => {
				this.mockReply(text);
			}, 1000);
		},
		mockReply(text) {
			const replies = [
				'收到啦~',
				'嗯嗯，有道理！',
				'哈哈哈',
				'真的假的？',
				'我也是这么想的',
				'有空一起玩呀',
				'在忙，稍后回复你',
				'嗯嗯，了解了'
			];
			const reply = replies[Math.floor(Math.random() * replies.length)];
			
			this.messages.push({
				id: Date.now(),
				content: reply,
				time: Date.now(),
				isSelf: false,
				avatar: this.otherAvatar
			});
			this.saveMessages();
			this.scrollToBottom();
		},
		scrollToBottom() {
			this.$nextTick(() => {
				if (this.messages.length > 0) {
					const lastMsg = this.messages[this.messages.length - 1];
					this.scrollToId = 'msg-' + lastMsg.id;
				}
			});
		},
		formatTime(timestamp) {
			const date = new Date(timestamp);
			const now = new Date();
			const diff = now - date;
			
			if (diff < 60000) return '刚刚';
			if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
			if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
			if (diff < 172800000) return '昨天';
			
			return `${date.getMonth() + 1}月${date.getDate()}日`;
		}
	}
};
</script>

<style scoped lang="scss">
.chat-page {
	min-height: 100vh;
	background: #f5f5f5;
	display: flex;
	flex-direction: column;
}

.navbar {
	background: #fff;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.navbar-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 30rpx;
}

.nav-back {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 56rpx;
	color: #333;
	font-weight: bold;
}

.nav-title {
	flex: 1;
	text-align: center;
}

.user-name {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.nav-right {
	width: 120rpx;
	text-align: right;
}

.online-status {
	font-size: 22rpx;
	color: #52c41a;
}

.message-list {
	flex: 1;
	padding: 30rpx 20rpx;
	padding-bottom: 140rpx;
	box-sizing: border-box;
}

.message-item {
	display: flex;
	align-items: flex-start;
	margin-bottom: 30rpx;
}

.message-item.self {
	flex-direction: row-reverse;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
	
	image {
		width: 100%;
		height: 100%;
	}
}

.message-content {
	max-width: 65%;
	margin: 0 20rpx;
}

.bubble {
	padding: 20rpx 28rpx;
	border-radius: 20rpx;
	position: relative;
	word-break: break-all;
}

.message-item.other .bubble {
	background: #fff;
	border-top-left-radius: 6rpx;
}

.message-item.self .bubble {
	background: #4a9eff;
	border-top-right-radius: 6rpx;
}

.bubble-text {
	font-size: 28rpx;
	line-height: 1.5;
}

.message-item.other .bubble-text {
	color: #333;
}

.message-item.self .bubble-text {
	color: #fff;
}

.message-time {
	font-size: 22rpx;
	color: #999;
	margin-top: 10rpx;
	display: block;
}

.message-item.self .message-time {
	text-align: right;
}

.empty-tip {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}

.input-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.message-input {
	flex: 1;
	height: 72rpx;
	background: #f5f5f5;
	border-radius: 36rpx;
	padding: 0 30rpx;
	font-size: 28rpx;
}

.send-btn {
	height: 72rpx;
	padding: 0 40rpx;
	background: #ccc;
	border-radius: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	
	text {
		font-size: 28rpx;
		color: #fff;
	}
	
	&.active {
		background: #4a9eff;
	}
}
</style>
