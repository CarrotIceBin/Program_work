<template>
	<view class="container">
		<uni-nav-bar class="nav-bar-top" :fixed="true" :statusBar="true" :border="false" backgroundColor="#F7F7F7">
			<block slot="left">
				<view class="user-info" @click="backClick">
					<uni-icons type="closeempty" size="24" color="#333"></uni-icons>
				</view>
			</block>
			<block slot="right">
				<view class="nav-right" @click="releaseClick">
					<view class="more-title">发布</view>
				</view>
			</block>
		</uni-nav-bar>

		<view class="content-section" :style="'padding-top:'+ topHeight +'px;'">
			<view class="content-header">
				<view class="content-info">
					<view class="avatar-wrapper">
						<image :src="userIInfo.imgUrl || '/static/missing-face.png'" mode="aspectFill"></image>
					</view>
					<view class="content-detail">
						<view class="contentname">{{ userIInfo.userName }}</view>
						<view class="privacy-setting">
							<view class="privacy-text">公开</view>
							<uni-icons type="right" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
			</view>
			<view class="content-editor">
				<textarea v-model="discussTitle" placeholder="此时此地，想和大家分享什么" class="content-textarea" maxlength="500"
					auto-height :auto-focus="true"></textarea>

				<!-- 发布方式选择 -->
				<view class="publish-type-section">
					<view class="publish-type-grid">
						<view
							class="publish-type-item"
							v-for="(item, index) in publishTypes"
							:key="index"
							:class="{ active: publishType === item.value }"
							@click="selectPublishType(item.value)"
						>
							<view class="type-icon-wrap">
								<text class="type-icon">{{ item.icon }}</text>
							</view>
							<view class="type-name">{{ item.label }}</view>
						</view>
					</view>

					<view class="add-word-row">
						<view class="add-word-item" @click="toggleAddWord('image')">
							<text class="add-word-label">图片加字</text>
							<view class="switch-dot" :class="{ active: addWordImage }"></view>
						</view>
						<view class="add-word-item" @click="toggleAddWord('video')">
							<text class="add-word-label">视频加字</text>
							<view class="switch-dot" :class="{ active: addWordVideo }"></view>
						</view>
					</view>
				</view>

				<!-- 图片 / 视频上传 -->
				<view class="upload-section">
					<view class="selected-video" v-if="selectedMediaType == 'video' && uploadedImages.length > 0">
						<view class="image-item">
							<video :src="uploadedImages[0]" class="selected-img" :controls="false"
								:show-center-play-btn="false" :enable-progress-gesture="false"
								:show-fullscreen-btn="false" :show-progress="false" :show-play-btn="false"></video>
							<view class="delete-btn" @click="deleteImage(0)">
								<uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
							</view>
						</view>
					</view>

					<view class="selected-images" v-else-if="uploadedImages.length > 0">
						<view class="image-item" v-for="(img, index) in uploadedImages" :key="index">
							<image :src="img" mode="aspectFill" class="selected-img"></image>
							<view class="delete-btn" @click="deleteImage(index)">
								<uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
							</view>
						</view>
						<view class="add-image-btn" v-if="uploadedImages.length < 9 && selectedMediaType !== 'video'"
							@click="showImagePicker">
							<uni-icons type="plusempty" size="32" color="#999"></uni-icons>
						</view>
					</view>
					<view class="add-image-btn" v-else>
						<view v-if="selectedMediaType == 'video' && uploadingVideo" class="uploading-text">
							正在上传中
						</view>
						<view v-else @click="showImagePicker">
							<uni-icons type="plusempty" size="32" color="#999"></uni-icons>
						</view>
					</view>
				</view>

				<!-- 底部提示文字 -->
				<view class="tip-section">
					<view class="tip-line tip-yellow">开心为快乐之本，知足为幸福之源。</view>
					<view class="tip-line">请用户正确选择信息来源，发布符合平台规则的心情。</view>
					<view class="tip-line tip-red">避免法律风险，平台优先推广自创作品。</view>
					<view class="tip-line">如果您对本平台满意，可推荐给您周边的人。</view>
				</view>
			</view>
		</view>

		<uni-popup ref="popup" :mask-click="false" background-color="#ffffff">
			<view class="popup-content">
				<view class="popup-header">
					<view class="popup-title">视频分类</view>
					<view class="popup-close" @click="confirmVideoFl">确定</view>
				</view>
				<view class="popup-list" v-if="userBotomData.length">
					<view class="popup-item" v-for="(item, index) in userBotomData" :key="index"
						:class="{ active: item.selectValue == videoFlID }" @click="chooseVideoFl(item)">
						<text class="popup-item-text">{{ item.selectTxt }}</text>
					</view>
				</view>
				<view class="popup-empty" v-else>
					暂无视频分类
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { qiniuUrl } from "@/utils/api.js"
export default {
	data() {
		return {
			newsFlID: 0,
			topHeight: 0,
			discussTitle: "",
			userIInfo: {},
			uploadedImages: [],
			imageValue: [],
			selectedMediaType: '',
			videoFlID: 0,
			userBotomData: [],
			uploadingVideo: false,
			publishType: 1,
			addWordImage: false,
			addWordVideo: false,
			publishTypes: [
				{ value: 1, label: '拍摄', icon: '📸' },
				{ value: 2, label: '自创', icon: '✏️' },
				{ value: 3, label: '录制', icon: '🎬' },
				{ value: 4, label: '截屏', icon: '📱' },
				{ value: 5, label: '转载', icon: '🔄' },
				{ value: 6, label: 'AI制作', icon: '🤖' }
			]
		}
	},
	onLoad(options) {
		const { newsFlID } = options;
		const getInfo = uni.getWindowInfo()
		this.topHeight = getInfo.statusBarHeight ? Number(getInfo.statusBarHeight) + 60 : 60;
		this.userInfo();
	},
	methods: {
		showToast(title) {
			uni.showToast({ title, icon: 'none' });
		},
		selectPublishType(value) {
			const selected = this.publishTypes.find(t => t.value === value);
			console.log('选择发布类型:', selected ? selected.label : '未知', 'value:', value);
			this.publishType = value;
		},
		toggleAddWord(type) {
			if (type === 'image') {
				this.addWordImage = !this.addWordImage;
			} else {
				this.addWordVideo = !this.addWordVideo;
			}
		},
		remainingImageSlots() {
			if (this.selectedMediaType == 'video') return 0;
			return Math.max(0, 9 - this.uploadedImages.length);
		},
		userInfo() {
			this.$http("userInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.code == 0) {
					this.userIInfo = res.userInfo
				} else {
					this.showToast(res.msg);
				}
			}).catch(err => {
				console.log(err);
			})
		},
		backClick() {
			uni.navigateBack({ delta: 1 });
		},
		showImagePicker() {
			const canUseChooseMedia = typeof uni.chooseMedia == 'function';
			if (this.selectedMediaType == 'video') {
				this.showToast('视频只能选择1个，如需更换请先删除已选视频');
				return;
			}
			if (canUseChooseMedia) {
				uni.chooseMedia({
					count: this.remainingImageSlots(),
					mediaType: ['image', 'video'],
					success: (res) => {
						const videos = res.tempFiles.filter(file => file.fileType == 'video');
						const images = res.tempFiles.filter(file => file.fileType != 'video');
						if (videos.length > 1) {
							this.showToast('视频最多只能选择1个');
							return;
						}
						if (videos.length == 1) {
							if (images.length > 0) {
								this.showToast('视频不能和图片同时选择');
								return;
							}
							if (this.uploadedImages.length > 0) {
								this.showToast('视频不能和图片同时选择');
								return;
							}
							this.selectedMediaType = 'video';
						} else {
							if (this.selectedMediaType == 'video') {
								this.showToast('已选择视频，无法再添加图片');
								return;
							}
							this.selectedMediaType = 'image';
						}
						res.tempFiles.forEach(file => {
							this.upload2qiniu({
								path: file.tempFilePath
							});
						});
					},
					fail: (err) => {
						console.log('chooseMedia 失败，使用 chooseImage:', err);
						this.useFallbackPicker();
					}
				})
			} else {
				this.useFallbackPicker();
			}
		},
		useFallbackPicker() {
			const allowVideo = this.selectedMediaType != 'image' && this.uploadedImages.length == 0;
			const options = [];
			const actionMap = [];
			if (this.selectedMediaType != 'video') {
				options.push('选择图片');
				actionMap.push('image');
			}
			if (allowVideo) {
				options.push('选择视频');
				actionMap.push('video');
			}
			if (options.length == 0) {
				this.showToast('当前选择不支持继续添加资源');
				return;
			}
			uni.showActionSheet({
				itemList: options,
				success: (res) => {
					const action = actionMap[res.tapIndex];
					if (action == 'image') {
						if (this.selectedMediaType == 'video') {
							this.showToast('已选择视频，无法再添加图片');
							return;
						}
						uni.chooseImage({
							count: this.remainingImageSlots(),
							success: (imgRes) => {
								this.selectedMediaType = 'image';
								imgRes.tempFilePaths.forEach(path => {
									this.upload2qiniu({
										path
									});
								});
							},
							fail: err => {
								console.log('chooseImage 失败:', err);
							}
						});
					} else if (action == 'video') {
						uni.chooseVideo({
							sourceType: ['album', 'camera'],
							success: (videoRes) => {
								if (this.selectedMediaType == 'image' || this.uploadedImages.length > 0) {
									this.showToast('视频不能和图片同时选择');
									return;
								}
								this.selectedMediaType = 'video';
								this.upload2qiniu({
									path: videoRes.tempFilePath
								});
							},
							fail: err => {
								console.log('chooseVideo 失败:', err);
							}
						});
					}
				}
			});
		},
		deleteImage(index) {
			this.uploadedImages.splice(index, 1);
			if (this.uploadedImages.length == 0) {
				this.selectedMediaType = '';
			}
		},
		async upload2qiniu(file) {
			const isVideoUpload = this.selectedMediaType == 'video';
			if (isVideoUpload) {
				this.uploadingVideo = true;
			}
			try {
				const upToken = await this.fetchQiNiuToken();
				const uploadResult = await this.uploadFile(file.path, upToken);
				this.uploadedImages.push(`${qiniuUrl}${uploadResult.hash}`);
			} catch (err) {
				console.log('上传失败:', err);
				this.showToast('上传失败，请稍后重试');
			} finally {
				if (isVideoUpload) {
					this.uploadingVideo = false;
				}
			}
		},
		fetchQiNiuToken() {
			return this.$http("qiNiuToken", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => res.para.upToken);
		},
		uploadFile(filePath, upToken) {
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: 'https://upload.qiniup.com',
					filePath,
					name: 'file',
					formData: {
						token: upToken
					},
					success: (uploadRes) => {
						if (uploadRes.statusCode == 200) {
							try {
								resolve(JSON.parse(uploadRes.data));
							} catch (e) {
								reject(new Error('解析上传结果失败'));
							}
						} else {
							reject(new Error('上传失败，状态码：' + uploadRes.statusCode));
						}
					},
					fail: reject
				})
			});
		},
		releaseClick() {
			if (this.selectedMediaType == 'video') {
				if (!this.discussTitle) {
					this.showToast('请输入动态内容');
					return;
				}
				this.selectVideoItem();
			} else {
				// 内容校验：文字和图片至少要有一个
				const hasText = !!(this.discussTitle && this.discussTitle.trim());
				const hasImages = this.uploadedImages.length > 0;
				if (!hasText && !hasImages) {
					this.showToast('请输入文字内容或添加图片后再发布');
					return;
				}
				const submitData = {
					newsTitle: '',
					iconUrl: this.uploadedImages.join(),
					newsFlid: 1,
					remark: this.discussTitle,
					typeID: this.publishType,
					publish_type: this.publishType,
					location: this.currentLocation || '',
					addWordImage: this.addWordImage ? 1 : 0,
					addWordVideo: this.addWordVideo ? 1 : 0,
					token: uni.getStorageSync("token")
				};
				const typeLabel = (this.publishTypes.find(t => t.value === this.publishType) || {}).label;
				console.log('提交发布数据:', { typeID: this.publishType, typeLabel: typeLabel, remark: this.discussTitle });
				this.$http("newsUserAdd", JSON.stringify(submitData)).then(res => {
					this.showToast(res.msg);
					uni.navigateBack()
				}).catch(err => {
					console.log('提交失败:', err);
				})
			}
		},
		selectVideoItem() {
			this.$http("selectItemList", JSON.stringify({
				tag: "video_fl",
				token: uni.getStorageSync("token") || ''
			})).then(res => {
				if (res.code == 0) {
					this.userBotomData = res.itemList || [];
					this.$refs.popup.open('bottom');
				} else {
					console.log('获取视频分类失败:', res.msg);
				}
			}).catch(err => {
				console.log(err);
			})
		},
		chooseVideoFl(item) {
			this.videoFlID = item.selectValue;
		},
		confirmVideoFl() {
			if (!this.videoFlID) {
				this.showToast('请选择一个视频分类');
				return;
			}
			this.$refs.popup.close();
			this.$http("videoAddUser", JSON.stringify({
				title: this.discussTitle,
				url: this.uploadedImages.join(),
				videoFlid: this.videoFlID,
				remark: '',
				typeID: this.publishType,
				publish_type: this.publishType,
				location: this.currentLocation || '',
				addWordImage: this.addWordImage ? 1 : 0,
				addWordVideo: this.addWordVideo ? 1 : 0,
				token: uni.getStorageSync("token")
			})).then(res => {
				this.showToast(res.msg);
				uni.navigateBack()
			}).catch(err => {
				console.log('提交失败:', err);
			})
		},
	}
}
</script>

<style scoped lang="scss">
.nav-bar-top {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	z-index: 100;
	padding-top: constant(safe-area-inset-top);
	padding-top: env(safe-area-inset-top);
}

.nav-bar-top ::v-deep .uni-navbar__header-container {
	display: none !important;
}

.nav-bar-top ::v-deep .uni-navbar__header-btns-left {
	width: 140px !important;
}

.nav-bar-top ::v-deep .uni-navbar__header-btns-right {
	display: flex;
	justify-content: flex-end;
	width: 100% !important;
}

.user-info {
	display: flex;
	align-items: center;
}

.nav-right {
	display: flex;
	align-items: center;
	background-color: #FD7031;
	padding: 6px 16px;
	border-radius: 50px;
}

.more-title {
	font-size: 14px;
	color: #FFF;
}

.content-section {
	padding: 0 20rpx;
	background-color: #FFFFFF;
}

.content-info {
	display: flex;
	align-items: center;
	width: 100%;
}

.avatar-wrapper {
	width: 80rpx;
	height: 80rpx;
	image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
}

.content-detail {
	flex: 1;
	margin-left: 20rpx;
}

.contentname {
	font-size: 32rpx;
	color: #333333;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.privacy-setting {
	display: flex;
	align-items: center;
}

.privacy-text {
	font-size: 26rpx;
	color: #666666;
}

.content-editor {
	margin: 30rpx 0;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
}

.content-textarea {
	width: 100%;
	min-height: 200rpx;
	font-size: 30rpx;
	line-height: 1.6;
	color: #333333;
	margin-bottom: 30rpx;
}

.content-textarea::placeholder {
	color: #999999;
}

// 发布方式选择
.publish-type-section {
	margin-bottom: 30rpx;
}

.publish-type-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
}

.publish-type-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 24rpx 0;
	background: #f9f9f9;
	border-radius: 16rpx;
	border: 2rpx solid transparent;
	transition: all 0.2s;
}

.publish-type-item.active {
	background: #fff5f0;
	border-color: #FD7031;
}

.type-icon-wrap {
	width: 60rpx;
	height: 60rpx;
	border: 2rpx dashed #ccc;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
}

.publish-type-item.active .type-icon-wrap {
	border-color: #FD7031;
}

.type-icon {
	font-size: 32rpx;
	color: #999;
}

.publish-type-item.active .type-icon {
	color: #FD7031;
}

.type-name {
	font-size: 26rpx;
	color: #333;
}

.publish-type-item.active .type-name {
	color: #FD7031;
	font-weight: 600;
}

.add-word-row {
	display: flex;
	justify-content: flex-end;
	gap: 40rpx;
	margin-top: 20rpx;
}

.add-word-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.add-word-label {
	font-size: 26rpx;
	color: #666;
}

.switch-dot {
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background: #ddd;
	transition: all 0.2s;
}

.switch-dot.active {
	background: #FD7031;
}

// 上传区域
.upload-section {
	margin-top: 20rpx;
}

.selected-images {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.image-item {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 16rpx;
	overflow: hidden;
}

.selected-img {
	width: 100%;
	height: 100%;
}

.delete-btn {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	width: 40rpx;
	height: 40rpx;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.selected-video .delete-btn {
	z-index: 2;
	pointer-events: auto;
}

.selected-video video {
	pointer-events: none;
	object-fit: cover;
}

.add-image-btn {
	width: 200rpx;
	height: 200rpx;
	border: 2rpx dashed #ddd;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f9f9f9;
}

.uploading-text {
	font-size: 26rpx;
	color: #666;
}

// 底部提示
.tip-section {
	margin-top: 40rpx;
	padding: 30rpx 20rpx;
	background: #fff9e6;
	border-radius: 12rpx;
}

.tip-line {
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
	text-align: center;
}

.tip-yellow {
	color: #b8860b;
	font-weight: 600;
	font-size: 28rpx;
}

.tip-red {
	color: #e74c3c;
	font-weight: 600;
}

// 视频分类弹窗
.popup-content {
	padding: 40rpx;
	.popup-header {
		display: flex;
		justify-content: space-between;
		font-size: 32rpx;
	}
	.popup-title {
		font-weight: 600;
		margin-bottom: 20rpx;
	}
	.popup-close {
		color: #FD7031;
	}
}

.popup-list {
	max-height: 600rpx;
	overflow-y: auto;
}

.popup-item {
	padding: 20rpx 24rpx;
	border-radius: 12rpx;
	margin-bottom: 16rpx;
	background-color: #f7f7f7;
}

.popup-item.active {
	background-color: #FD7031;
}

.popup-item-text {
	font-size: 28rpx;
	color: #333;
}

.popup-item.active .popup-item-text {
	color: #fff;
}

.popup-empty {
	font-size: 28rpx;
	color: #999;
	padding: 40rpx 0;
	text-align: center;
}
</style>
