<template>
	<view class="chat-container">
		<!-- 导航栏 -->
		<view class="custom-nav">
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
			<view class="nav-inner">
				<view class="nav-left" @tap="goBack">
					<uni-icons type="left" size="22" color="#333" />
					<view class="nav-user">
						<text class="nav-name">{{ targetUser.name }}</text>
						<text class="nav-status" :class="{ online: targetUser.online }">
							{{ targetUser.online ? '在线' : '离线' }}
						</text>
					</view>
				</view>
				<view class="nav-right" @tap="showMoreActions">
					<uni-icons type="more" size="22" color="#333" />
				</view>
			</view>
		</view>

		<!-- 消息列表 - 使用scroll-view確保可靠滾動 -->
		<scroll-view class="message-list" scroll-y :scroll-into-view="scrollIntoView" scroll-with-animation
			:show-scrollbar="false" :style="{ height: listHeight + 'px' }">
			<view class="message-content-wrapper">
				<view class="message-date" @tap="resetBottomState">{{ messageDateLabel }}</view>

				<view v-for="(msg, index) in messages" :key="msg.id || index" :id="'msg' + index" class="message-item"
					@tap.stop>
					<view class="msg-row" :class="msg.isSelf ? 'msg-row-self' : 'msg-row-other'">
						<image v-if="!msg.isSelf" class="avatar-img" :src="getMessageAvatar(msg)" mode="aspectFill" />
						<view class="message-content">
							<template v-if="msg.type === 'text'">
								<view class="bubble" :class="getBubbleClass(msg)" @tap.stop>
									<text class="bubble-text">{{ msg.content }}</text>
								</view>
							</template>
							<template v-else-if="msg.type === 'voice'">
								<view class="bubble voice-bubble" :class="getBubbleClass(msg)"
									@tap.stop="playVoice(msg, index)">
									<view class="voice-inner" :class="{ 'voice-inner-self': msg.isSelf }">
										<view class="voice-waves" :class="{ playing: msg.playing }">
											<view class="wave wave1" />
											<view class="wave wave2" />
											<view class="wave wave3" />
										</view>
										<text class="voice-duration">{{ formatVoiceDuration(msg.duration) }}</text>
									</view>
								</view>
							</template>
							<template v-else-if="msg.type === 'image'">
								<view class="image-bubble" @tap.stop="previewImage(msg.content)">
									<image class="msg-image" :src="msg.content" mode="aspectFill" />
								</view>
							</template>
							<template v-else-if="msg.type === 'location'">
								<view class="location-bubble" @tap.stop>
									<view class="location-map">
										<view class="map-bg"><text class="map-pin">📍</text></view>
									</view>
									<view class="location-info">
										<text class="location-name">{{ msg.content.name }}</text>
										<text class="location-address">{{ msg.content.address }}</text>
									</view>
								</view>
							</template>
						</view>
						<image v-if="msg.isSelf" class="avatar-img" :src="getMessageAvatar(msg)" mode="aspectFill" />
					</view>
				</view>
				<view id="msgBottom" style="height: 60rpx" />
			</view>
		</scroll-view>

		<!-- 底部区域 -->
		<view class="bottom-area">
			<view class="input-bar">
				<view class="btn-icon" :class="{ active: isVoiceMode }" @tap="toggleVoiceMode">
					<image class="btn-image" :src="voiceToggleIcon" mode=""></image>
				</view>
				<view v-if="isVoiceMode" class="voice-press-btn" :class="{ recording: isRecording }"
					@touchstart="startRecord" @touchend="stopRecord" @touchcancel="cancelRecord">
					<text class="voice-press-text">{{ isRecording ? '松开发送' : '按住说话' }}</text>
				</view>
				<input v-else class="text-input" v-model="inputText" :focus="inputFocus" placeholder="发消息..."
					placeholder-style="color:#b0b0b0;" confirm-type="send" :adjust-position="false" :always-embed="true"
					@focus="onInputFocus" @blur="onInputBlur" @confirm="handleKeyboardSend" />
				<view class="btn-icon" :class="{ active: activePanel === 'emoji' }" @tap="togglePanel('emoji')">
					<image class="btn-image" :src="emojiToggleIcon" mode=""></image>
				</view>
				<view class="action-slot">
					<view v-if="canSendText" class="send-btn" @tap="sendTextMessage">
						<text class="send-text">发送</text>
					</view>
					<view v-else class="btn-icon" :class="{ active: activePanel === 'extra' }"
						@tap="togglePanel('extra')">
						<image class="btn-image" src="/static/index/plus-circle.png" mode=""></image>
					</view>
				</view>
			</view>

			<view v-if="activePanel === 'emoji'" class="panel emoji-panel">
				<view class="emoji-grid">
					<view v-for="emoji in emojiList" :key="emoji" class="emoji-item" @tap="insertEmoji(emoji)">
						<text class="emoji-text">{{ emoji }}</text>
					</view>
				</view>
			</view>

			<view v-if="activePanel === 'extra'" class="panel extra-panel">
				<view class="extra-grid">
					<view v-for="item in extraItems" :key="item.label" class="extra-item" @tap="handleExtra(item)">
						<view class="extra-icon-wrap">
							<image class="extra-icon-img" :src="item.icon" mode="aspectFill"></image>
						</view>
						<text class="extra-label">{{ item.label }}</text>
					</view>
				</view>
			</view>

			<view class="safe-area-bottom" />
		</view>

		<!-- 录音遮罩 -->
		<view v-if="isRecording" class="record-mask">
			<view class="record-box">
				<view class="record-wave-wrap">
					<view class="record-circle r1" />
					<view class="record-circle r2" />
					<view class="record-circle r3" />
					<text class="record-mic">🎙</text>
				</view>
				<text class="record-tip">松开发送，上滑取消</text>
			</view>
		</view>

		<view v-if="toastText" class="tab-note">
			<text>{{ toastText }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				targetUser: {
					name: '小明',
					online: true,
					avatar: '/static/image/2.jpeg'
				},
				selfUser: {
					avatar: '/static/image/1.jpeg'
				},
				messages: [{
						id: '1',
						type: 'text',
						content: '你好呀！',
						isSelf: false,
						time: Date.now() - 3600000
					},
					{
						id: '2',
						type: 'text',
						content: '你好！很高兴认识你 😊',
						isSelf: true,
						time: Date.now() - 3500000
					},
					{
						id: '3',
						type: 'image',
						content: '/static/image/12.jpeg',
						isSelf: false,
						time: Date.now() - 3000000
					}
				],
				inputText: '',
				inputFocus: false,
				isVoiceMode: false,
				activePanel: '', // 'emoji' | 'extra'
				isRecording: false,
				recordDuration: 0,
				recordTimer: null,
				// 界面状态
				statusBarHeight: 0,
				scrollIntoView: '',
				listHeight: 0,
				toastText: '',
				toastTimer: null,
				autoReplyTimer: null,
				// 表情数据
				emojiList: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
					'😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
					'😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
					'😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
					'😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
					'🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'
				],
				// 扩展功能
				extraItems: [{
						icon: '/static/index/album.png',
						label: '相册',
						action: 'album'
					},
					{
						icon: '/static/index/shoot.png',
						label: '拍摄',
						action: 'camera'
					},
					{
						icon: '/static/index/location.png',
						label: '位置',
						action: 'location'
					},
					{
						icon: '/static/index/red-packet.png',
						label: '红包',
						action: 'redpack'
					}
				],
				// 内部变量（以下划线开头）
				windowHeight: 0,
				keyboardHeight: 0,
				recordCancelled: false,
				recorderManager: null,
				recorderEventsBound: false,
				scrollTimer: null,
				focusGuardTimer: null,
				blockInputFocus: false,
				audioContext: null,
				playingIndex: -1,
				keyboardChangeHandler: null,
				scrollDebounceTimer: null,
				recordStartTime: 0
			};
		},
		computed: {
			canSendText() {
				return this.inputText.trim().length > 0;
			},
			voiceToggleIcon() {
				return this.isVoiceMode ? '/static/index/keyboard.png' : '/static/index/voice.png';
			},
			emojiToggleIcon() {
				return this.activePanel === 'emoji' ? '/static/index/keyboard.png' : '/static/index/expression.png';
			},
			messageDateLabel() {
				if (!this.messages.length) {
					return '';
				}
				const firstMessageTime = Number(this.messages[0].time) || Date.now();
				return this.formatMessageDate(firstMessageTime);
			}
		},

		onLoad() {
			const sys = uni.getSystemInfoSync();
			this.statusBarHeight = sys.statusBarHeight || 0;
			this.windowHeight = sys.windowHeight;
			this.keyboardHeight = 0;
			this.recordCancelled = false;
			this.recorderManager = null;
			this.recorderEventsBound = false;
			this.scrollTimer = null;
			this.focusGuardTimer = null;
			this.blockInputFocus = false;

			this.keyboardChangeHandler = ({
				height
			}) => {
				this.keyboardHeight = height;
				this.updateListHeight(() => {
					// 只有當鍵盤彈出時才滾動到底部
					if (height > 0) {
						setTimeout(() => this.scrollToBottom(), 50);
					}
				});
			};
			uni.onKeyboardHeightChange(this.keyboardChangeHandler);

			this.$nextTick(() => this.updateListHeight(() => this.scrollToBottom()));
		},

		onShow() {
			this.$nextTick(() => {
				this.updateListHeight(() => this.scrollToBottom());
			});
		},

		onUnload() {
			if (uni.offKeyboardHeightChange) {
				uni.offKeyboardHeightChange(this.keyboardChangeHandler);
			}
			clearTimeout(this.toastTimer);
			clearTimeout(this.autoReplyTimer);
			clearTimeout(this.scrollTimer);
			clearTimeout(this.focusGuardTimer);
			clearTimeout(this.scrollDebounceTimer);
			if (this.recorderManager) {
				this.recorderManager.stop();
			}
			this.stopCurrentAudio();
		},

		methods: {
			formatTime(time) {
				const d = new Date(time);
				return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
			},
			formatMessageDate(time) {
				const now = new Date();
				const target = new Date(time);
				const nowDate = now.getDate();
				const targetDate = target.getDate();
				const timeText = this.formatTime(time);

				if (now.toDateString() === target.toDateString()) {
					return `今天 ${timeText}`;
				}

				const yesterday = new Date(now);
				yesterday.setDate(nowDate - 1);
				if (yesterday.toDateString() === target.toDateString()) {
					return `昨天 ${timeText}`;
				}

				return `${target.getMonth() + 1}月${targetDate}日 ${timeText}`;
			},
			getMessageAvatar(msg) {
				return msg.isSelf ? this.selfUser.avatar : this.targetUser.avatar;
			},
			getBubbleClass(msg) {
				return msg.isSelf ? 'self-bubble' : 'other-bubble';
			},
			formatVoiceDuration(duration) {
				return `${duration || 0}"`;
			},
			newMsg(fields) {
				return {
					id: Date.now() + '_' + Math.random(),
					time: Date.now(),
					...fields
				};
			},
			appendMessage(fields, options = {}) {
				this.messages.push(this.newMsg(fields));

				// 確保DOM更新後再滾動，使用防抖避免連續快速滾動
				this.$nextTick(() => {
					clearTimeout(this.scrollDebounceTimer);
					this.scrollDebounceTimer = setTimeout(() => {
						this.scrollToBottom();
					}, 50);
				});

				if (options.reply) {
					this.autoReply();
				}
			},
			appendMessages(list) {
				if (!list.length) {
					return;
				}
				const nextMessages = list.map((item) => this.newMsg(item));
				this.messages = this.messages.concat(nextMessages);

				// 確保DOM更新後再滾動，使用防抖避免連續快速滾動
				this.$nextTick(() => {
					clearTimeout(this.scrollDebounceTimer);
					this.scrollDebounceTimer = setTimeout(() => {
						this.scrollToBottom();
					}, 50);
				});
			},



			scrollToBottom() {
				this.$nextTick(() => {
					clearTimeout(this.scrollTimer);
					this.scrollTimer = setTimeout(() => {
						// 使用scroll-into-view滾動到底部
						this.scrollIntoView = 'msgBottom';

						// 重置scrollIntoView，以便下次可以再次觸發
						setTimeout(() => {
							this.scrollIntoView = '';
						}, 100); // 縮短重置時間，從300ms改為100ms
					}, 50); // 縮短初始延遲，從100ms改為50ms
				});
			},

			showToast(text) {
				this.toastText = text;
				clearTimeout(this.toastTimer);
				this.toastTimer = setTimeout(() => {
					this.toastText = '';
				}, 2000);
			},

			updateListHeight(cb) {
				const query = uni.createSelectorQuery().in(this);
				query.select('.custom-nav').boundingClientRect();
				query.select('.bottom-area').boundingClientRect();
				query.exec((res) => {
					const navH = res[0] ? res[0].height : 0;
					const bottomH = res[1] ? res[1].height : 0;
					const kbH = this.keyboardHeight || 0;
					const newHeight = Math.max(0, this.windowHeight - navH - bottomH - kbH);

					// 如果高度变化很小，不更新，避免不必要的重绘
					if (Math.abs(this.listHeight - newHeight) < 2) {
						cb && cb();
						return;
					}

					// 保存当前高度
					const oldHeight = this.listHeight;

					// 更新高度
					this.listHeight = newHeight;

					// 延迟执行回调，确保DOM已更新
					this.$nextTick(() => {
						cb && cb();
					});
				});
			},

			goBack() {
				uni.navigateBack();
			},
			showMoreActions() {
				this.showToast('更多功能开发中');
			},
			resetBottomState() {
				this.dismissKeyboard();
				this.activePanel = '';
				this.isVoiceMode = false;
				if (this.isRecording) {
					this.cancelRecord();
				}
				this.stopCurrentAudio();
				this.$nextTick(() => this.updateListHeight());
			},
			stopCurrentAudio() {
				if (!this.audioContext) {
					return;
				}
				this.audioContext.stop();
				this.audioContext.destroy();
				this.audioContext = null;
				// 修复：使用索引更新播放状态
				this.messages = this.messages.map((item) =>
					item.type === 'voice' ? {
						...item,
						playing: false
					} : item
				);
			},
			isChooseCanceled(err) {
				const message = (err && (err.errMsg || err.message || '')) || '';
				return /cancel/i.test(message);
			},
			dismissKeyboard() {
				this.blockInputFocus = true;
				this.inputFocus = false;
				clearTimeout(this.focusGuardTimer);
				uni.hideKeyboard();
				this.focusGuardTimer = setTimeout(() => {
					this.blockInputFocus = false;
				}, 200);
			},

			// 切换语音模式时收起键盘
			toggleVoiceMode() {
				this.dismissKeyboard();
				this.isVoiceMode = !this.isVoiceMode;
				this.activePanel = '';
				this.$nextTick(() => this.updateListHeight());
			},

			// 点击表情或扩展面板时收起键盘
			togglePanel(panel) {
				const next = this.activePanel === panel ? '' : panel;
				this.dismissKeyboard();
				if (next) {
					this.isVoiceMode = false;
				}
				this.activePanel = next;
				this.$nextTick(() => this.updateListHeight());
			},

			onInputFocus() {
				if (this.blockInputFocus) {
					this.inputFocus = false;
					uni.hideKeyboard();
					return;
				}
				const hadBottomPanel = this.activePanel || this.isVoiceMode;
				this.activePanel = '';
				this.isVoiceMode = false;
				this.inputFocus = true;
				if (hadBottomPanel) {
					this.$nextTick(() => this.updateListHeight());
				}
			},
			onInputBlur() {
				this.inputFocus = false;
			},

			ensureRecorderManager() {
				if (!this.recorderManager) {
					this.recorderManager = uni.getRecorderManager();
				}
				if (this.recorderEventsBound) {
					return this.recorderManager;
				}
				this.recorderEventsBound = true;

				this.recorderManager.onStop((res) => {
					this.isRecording = false;
					if (this.recordCancelled) return;
					const duration = Math.max(1, Math.round((Date.now() - this.recordStartTime) / 1000));
					this.appendMessage({
						type: 'voice',
						content: res.tempFilePath,
						duration,
						isSelf: true,
						playing: false
					}, {
						reply: true
					});
				});

				this.recorderManager.onError(() => {
					this.isRecording = false;
					this.showToast('录音失败');
				});

				return this.recorderManager;
			},

			handleKeyboardSend() {
				const text = this.inputText.trim();
				if (!text) return;
				this.appendMessage({
					type: 'text',
					content: text,
					isSelf: true
				}, {
					reply: true
				});
				this.inputText = '';
				this.$nextTick(() => {
					this.inputFocus = true;
				});
			},
			sendTextMessage() {
				const text = this.inputText.trim();
				if (!text) return;
				this.appendMessage({
					type: 'text',
					content: text,
					isSelf: true
				}, {
					reply: true
				});
				this.inputText = '';
				this.dismissKeyboard();
			},

			insertEmoji(emoji) {
				this.inputText += emoji;
			},

			// 录音
			startRecord() {
				if (this.isRecording) return;
				this.recordCancelled = false;
				this.isRecording = true;
				this.recordStartTime = Date.now();
				const rm = this.ensureRecorderManager();
				rm.start({
					duration: 60000,
					format: 'mp3'
				});
			},
			stopRecord() {
				if (!this.isRecording) return;
				this.isRecording = false;
				this.recorderManager && this.recorderManager.stop();
			},
			cancelRecord() {
				if (!this.isRecording) return;
				this.recordCancelled = true;
				this.isRecording = false;
				this.recorderManager && this.recorderManager.stop();
				this.showToast('已取消');
			},

			playVoice(msg, idx) {
				if (!msg.content) {
					this.showToast('暂无音频');
					return;
				}
				if (msg.playing) return;
				this.stopCurrentAudio();
				// 修复：使用 Vue.set 或重新赋值数组来触发更新
				const updatedMsg = {
					...msg,
					playing: true
				};
				this.$set(this.messages, idx, updatedMsg);
				const audio = uni.createInnerAudioContext();
				this.audioContext = audio;
				audio.src = msg.content;
				audio.play();
				let finished = false;
				const done = () => {
					if (finished) return;
					finished = true;
					const currentMsg = this.messages[idx];
					if (currentMsg && currentMsg.type === 'voice') {
						this.$set(this.messages, idx, {
							...currentMsg,
							playing: false
						});
					}
					if (this.audioContext === audio) {
						audio.destroy();
						this.audioContext = null;
					}
				};
				audio.onEnded(done);
				audio.onError((err) => {
					done();
					this.showToast('播放失败');
				});
			},

			previewImage(src) {
				uni.previewImage({
					urls: [src],
					current: src
				});
			},

			handleExtra(item) {
				const action = item.action;
				this.activePanel = '';
				this.dismissKeyboard();
				this.$nextTick(() => this.updateListHeight());
				const finalize = () => {
					this.$nextTick(() => this.updateListHeight());
				};
				const handlers = {
					album: () =>
						uni.chooseImage({
							count: 9,
							sourceType: ['album'],
							success: ({
								tempFilePaths = []
							}) => {
								finalize();
								if (!tempFilePaths.length) return;
								this.appendMessages(tempFilePaths.map((path) => ({
									type: 'image',
									content: path,
									isSelf: true
								})));
							},
							fail: (err) => {
								finalize();
								if (!this.isChooseCanceled(err)) {
									this.showToast('选择图片失败');
								}
							}
						}),
					camera: () =>
						uni.chooseImage({
							count: 1,
							sourceType: ['camera'],
							success: ({
								tempFilePaths = []
							}) => {
								finalize();
								if (!tempFilePaths.length) return;
								this.appendMessage({
									type: 'image',
									content: tempFilePaths[0],
									isSelf: true
								});
							},
							fail: (err) => {
								finalize();
								if (!this.isChooseCanceled(err)) {
									this.showToast('拍照失败');
								}
							}
						}),
					location: () =>
						uni.chooseLocation({
							success: ({
								name,
								address
							}) => {
								finalize();
								this.appendMessage({
									type: 'location',
									content: {
										name: name || '当前位置',
										address: address || ''
									},
									isSelf: true
								});
							},
							fail: (err) => {
								finalize();
								if (!this.isChooseCanceled(err)) {
									this.showToast('获取位置失败');
								}
							}
						}),
					redpack: () => this.showToast('红包功能开发中')
				};
				(handlers[action] || (() => this.showToast('功能开发中')))();
			},

			autoReply() {
				const replies = ['😄', '好的！', '收到~', '哈哈！', '嗯嗯！'];
				clearTimeout(this.autoReplyTimer);
				this.autoReplyTimer = setTimeout(() => {
					this.appendMessage({
						type: 'text',
						content: replies[Math.floor(Math.random() * replies.length)],
						isSelf: false
					});
				}, 1000);
			}
		}
	};
</script>

<style>
	page {
		background: #ededed;
		font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
		height: 100%;
	}

	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #ededed;
		overflow: hidden;
	}

	/* 导航栏 */
	.custom-nav {
		background: #f7f7f7;
		border-bottom: 1rpx solid #e0e0e0;
		flex-shrink: 0;
	}

	.status-bar {
		width: 100%;
	}

	.nav-inner {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex: 1;
		min-width: 0;
	}

	.nav-user {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.nav-name {
		font-size: 32rpx;
		color: #1a1a1a;
		font-weight: 600;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nav-status {
		font-size: 20rpx;
		color: #999;
		line-height: 1.3;
	}

	.nav-status.online {
		color: #07c160;
	}

	.nav-right {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 消息列表 - scroll-view */
	.message-list {
		overflow: hidden;
		box-sizing: border-box;
		-webkit-overflow-scrolling: touch;
		/* 啟用iOS慣性滾動 */
		touch-action: pan-y;
		/* 優化觸摸滾動 */
	}

	.message-content-wrapper {
		padding: 24rpx 24rpx 20rpx;
		min-height: 100%;
		box-sizing: border-box;
		will-change: transform;
		/* 優化滾動性能 */
	}

	.message-date {
		text-align: center;
		font-size: 22rpx;
		color: #999;
		margin: 0 auto 24rpx;
	}

	.message-item {
		margin-bottom: 32rpx;
	}

	.msg-row {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
	}

	.msg-row-other {
		justify-content: flex-start;
	}

	.msg-row-self {
		justify-content: flex-end;
	}

	.avatar-img {
		width: 84rpx;
		height: 84rpx;
		border-radius: 12rpx;
		display: block;
		flex-shrink: 0;
	}

	.message-content {
		max-width: 66%;
		display: flex;
		flex-direction: column;
	}

	.msg-row-other .message-content {
		align-items: flex-start;
	}

	.msg-row-self .message-content {
		align-items: flex-end;
	}

	/* 气泡 */
	.bubble {
		border-radius: 20rpx;
		word-break: break-all;
		padding: 20rpx 24rpx;
	}

	.other-bubble {
		background: #fff;
		border-top-left-radius: 4rpx;
	}

	.self-bubble {
		background: #95ec69;
		border-top-right-radius: 4rpx;
	}

	.bubble-text {
		font-size: 30rpx;
		color: #1a1a1a;
		line-height: 1.6;
	}

	/* 语音 */
	.voice-bubble {
		padding: 20rpx 28rpx !important;
		min-width: 130rpx;
	}

	.voice-inner {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.voice-inner-self {
		flex-direction: row-reverse;
	}

	.voice-waves {
		display: flex;
		align-items: center;
		gap: 5rpx;
		height: 32rpx;
	}

	.wave {
		width: 5rpx;
		background: #555;
		border-radius: 4rpx;
	}

	.wave1 {
		height: 14rpx;
	}

	.wave2 {
		height: 26rpx;
	}

	.wave3 {
		height: 18rpx;
	}

	.playing .wave1 {
		animation: waveAnim 0.6s ease-in-out 0s infinite alternate;
	}

	.playing .wave2 {
		animation: waveAnim 0.6s ease-in-out 0.15s infinite alternate;
	}

	.playing .wave3 {
		animation: waveAnim 0.6s ease-in-out 0.3s infinite alternate;
	}

	@keyframes waveAnim {
		from {
			height: 6rpx;
		}

		to {
			height: 32rpx;
		}
	}

	.voice-duration {
		font-size: 26rpx;
		color: #555;
	}

	/* 图片 */
	.image-bubble {
		border-radius: 16rpx;
		overflow: hidden;
	}

	.msg-image {
		width: 320rpx;
		height: 240rpx;
		display: block;
	}

	/* 位置 */
	.location-bubble {
		width: 380rpx;
		border-radius: 16rpx;
		overflow: hidden;
		background: #fff;
	}

	.location-map {
		height: 180rpx;
		background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
	}

	.map-bg {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.map-pin {
		font-size: 56rpx;
		animation: pinBounce 1.5s ease-in-out infinite;
	}

	@keyframes pinBounce {

		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-10rpx);
		}
	}

	.location-info {
		padding: 16rpx 20rpx 20rpx;
	}

	.location-name {
		font-size: 28rpx;
		color: #1a1a1a;
		font-weight: 600;
		display: block;
	}

	.location-address {
		font-size: 22rpx;
		color: #999;
		margin-top: 6rpx;
		display: block;
	}

	/* 底部 */
	.bottom-area {
		flex-shrink: 0;
		background: #f7f7f7;
		border-top: 1rpx solid #e0e0e0;
		box-sizing: border-box;
	}

	.input-bar {
		display: flex;
		align-items: center;
		padding: 16rpx;
		gap: 12rpx;
		box-sizing: border-box;
	}

	.btn-icon {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-radius: 18rpx;
		transition: background-color 0.2s ease;
	}

	.btn-icon.active {
		background: rgba(7, 193, 96, 0.12);
	}

	.icon-font {
		font-size: 46rpx;
	}

	.text-input {
		flex: 1;
		height: 76rpx;
		background: #fff;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 30rpx;
		color: #333;
		border: 1rpx solid #e0e0e0;
		box-sizing: border-box;
		min-width: 0;
	}

	.voice-press-btn {
		flex: 1;
		height: 76rpx;
		background: #fff;
		border-radius: 10rpx;
		border: 1rpx solid #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-width: 0;
	}

	.voice-press-btn.recording {
		background: #d0f0b8;
	}

	.voice-press-text {
		font-size: 28rpx;
		color: #333;
	}

	.action-slot {
		width: 88rpx;
		height: 76rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-image {
		width: 60rpx;
		height: 60rpx;
	}

	.action-slot .btn-icon {
		width: 76rpx !important;
		height: 76rpx !important;
	}

	.action-slot .send-btn {
		width: 100%;
		min-width: 76rpx;
		padding: 0 16rpx;
	}

	.send-btn {
		height: 76rpx;
		background: #07c160;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 100%;
		padding: 0 16rpx;
		min-width: 76rpx;
	}

	.send-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}

	/* 面板 */
	.panel {
		background: #f7f7f7;
		animation: slideUp 0.2s ease;
		border-top: 1rpx solid #ececec;
		box-sizing: border-box;
	}

	.emoji-panel {
		padding: 20rpx 16rpx;
		max-height: 420rpx;
	}

	.extra-panel {
		padding: 20rpx;
		/* max-height: 460rpx; */
		margin-bottom: 20rpx;
	}

	.emoji-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.extra-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 10rpx;
	}

	.emoji-panel,
	.extra-panel {
		overflow-y: auto;
	}

	.emoji-item {
		width: 12.5%;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.emoji-text {
		font-size: 44rpx;
	}

	.extra-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.extra-icon-wrap {
		width: 104rpx;
		height: 104rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	}

	.extra-icon-img {
		width: 54rpx;
		height: 54rpx;
	}

	.extra-label {
		font-size: 22rpx;
		color: #888;
	}

	.safe-area-bottom {
		height: env(safe-area-inset-bottom);
		min-height: 0;
	}

	/* 录音 */
	.record-mask {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.record-box {
		background: rgba(30, 30, 30, 0.92);
		border-radius: 32rpx;
		padding: 64rpx 96rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 36rpx;
	}

	.record-wave-wrap {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.record-circle {
		position: absolute;
		border-radius: 50%;
		animation: ripple 1.5s ease-out infinite;
	}

	.r1 {
		width: 160rpx;
		height: 160rpx;
		background: rgba(7, 193, 96, 0.25);
	}

	.r2 {
		width: 120rpx;
		height: 120rpx;
		background: rgba(7, 193, 96, 0.35);
		animation-delay: 0.3s;
	}

	.r3 {
		width: 80rpx;
		height: 80rpx;
		background: rgba(7, 193, 96, 0.5);
		animation-delay: 0.6s;
	}

	@keyframes ripple {
		0% {
			transform: scale(0.9);
			opacity: 1;
		}

		100% {
			transform: scale(1.15);
			opacity: 0.2;
		}
	}

	.record-mic {
		font-size: 64rpx;
		position: relative;
		z-index: 1;
	}

	.record-tip {
		font-size: 26rpx;
		color: #ccc;
	}

	/* Toast */
	.tab-note {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.72);
		color: #fff;
		padding: 16rpx 32rpx;
		border-radius: 16rpx;
		font-size: 26rpx;
		z-index: 9999;
		pointer-events: none;
		white-space: nowrap;
	}

	@keyframes slideUp {
		from {
			transform: translateY(40rpx);
			opacity: 0;
		}

		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* 隱藏滾動條 */
	.emoji-panel::-webkit-scrollbar,
	.extra-panel::-webkit-scrollbar,
	page::-webkit-scrollbar {
		display: none;
		width: 0;
	}

	.emoji-panel,
	.extra-panel,
	page {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>