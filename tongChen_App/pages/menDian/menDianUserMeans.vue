<template>
	<view class="page-container" :style="{ paddingTop: totalTopHeight + 'px' }">
		<view class="form-card">
			<!-- 走马灯上传区域 -->
			<view class="upload-section">
				<view class="image-grid">
					<view v-for="(item, index) in viewImageSlots" :key="index" class="image-slot">
						<view v-if="item.url" class="image-wrapper">
							<image :src="item.url" mode="aspectFill" class="preview-image" />
							<view class="delete-btn" @click="deleteImage('view', index)">
								<text class="delete-icon">×</text>
							</view>
						</view>
						<view v-else class="upload-placeholder" @click="uploadImage('view', index)">
							<text class="placeholder-icon">+</text>
							<text class="placeholder-title">{{ item.title }}</text>
							<!-- <text class="upload-hint">点击上传</text> -->
						</view>
					</view>
				</view>
			</view>

			<!-- 详情图上传区域 -->
			<view class="upload-section">
				<view class="image-grid">
					<view v-for="(item, index) in detailImageSlots" :key="index" class="image-slot">
						<view v-if="item.url" class="image-wrapper">
							<image :src="item.url" mode="aspectFill" class="preview-image" />
							<view class="delete-btn" @click="deleteImage('detail', index)">
								<text class="delete-icon">×</text>
							</view>
						</view>
						<view v-else class="upload-placeholder" @click="uploadImage('detail', index)">
							<text class="placeholder-icon">+</text>
							<text class="placeholder-title">{{ item.title }}</text>
							<!-- <text class="upload-hint">点击上传</text> -->
						</view>
					</view>
				</view>
			</view>

			<!-- 广告协议勾选 -->
			<view class="agreement-section">
				<view class="agreement-check" @click="toggleAgree">
					<view class="checkbox" :class="{ checked: agreed }">
						<uni-icons v-if="agreed" type="checkmarkempty" size="14" color="#fff"></uni-icons>
					</view>
					<text class="agreement-text">
						我已阅读并同意
						<text class="agreement-link" @click.stop="showAgreement">《同城圈广告发布协议》</text>
					</text>
				</view>
			</view>

			<button class="submit-btn" :loading="isSubmitting" @click="handleSubmit">
				{{ isSubmitting ? '提交中...' : '确定' }}
			</button>
		</view>

		<!-- 广告协议弹窗 -->
		<uni-popup ref="agreePopup" type="bottom" border-radius="20rpx 20rpx 0 0">
			<view class="agree-popup">
				<view class="agree-header">
					<text class="agree-title">同城圈广告发布协议</text>
					<text class="agree-close" @click="$refs.agreePopup.close()">×</text>
				</view>
				<scroll-view class="agree-content" scroll-y>
					<view class="agree-section">
						<text class="agree-text">第一条 协议说明</text>
						<text class="agree-detail">本协议是您与同城圈平台之间就发布门店广告事宜所订立的具有法律约束力的协议。您确认并同意本协议内容后，方可在同城圈平台发布广告。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第二条 广告内容规范</text>
						<text class="agree-detail">1. 广告内容必须真实、合法、健康，不得含有虚假、误导性信息；\n2. 不得发布违反国家法律法规的广告内容；\n3. 不得发布涉及淫秽、暴力、迷信等不良信息的广告；\n4. 广告图片需清晰、完整，不得带有水印或无关元素。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第三条 知识产权声明</text>
						<text class="agree-detail">1. 您保证所发布的广告内容、图片拥有合法的知识产权或使用权；\n2. 因侵权引起的一切法律责任由您自行承担；\n3. 您授予同城圈平台在广告展示期间免费使用您所发布内容的权利。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第四条 审核与发布</text>
						<text class="agree-detail">1. 同城圈平台有权对您提交的广告内容进行审核；\n2. 审核通过后广告方可正式发布；\n3. 审核时间一般为1-3个工作日；\n4. 平台保留对广告内容进行修改或拒绝发布的权利。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第五条 费用与结算</text>
						<text class="agree-detail">1. 广告发布需支付相应费用，具体以平台公示为准；\n2. 费用一经缴纳，除平台原因外不予退还；\n3. 广告发布期间，您需确保账户余额充足。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第六条 违约处理</text>
						<text class="agree-detail">1. 如您违反本协议，平台有权立即终止广告发布；\n2. 因您的违约行为给平台或第三方造成损失的，您需承担全部赔偿责任；\n3. 平台有权将您的违约行为通报相关部门。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第七条 其他条款</text>
						<text class="agree-detail">1. 本协议自您签署之日起生效；\n2. 本协议解释权归同城圈平台所有；\n3. 如您对协议内容有异议，请停止使用平台服务。</text>
					</view>
				</scroll-view>
				<view class="agree-bottom">
					<button class="agree-btn" @click="agreeAndClose">我已阅读并同意</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { qiniuUrl } from '@/utils/api.js';

export default {
	data() {
		return {
			statusBarHeight: 20,
			navBarHeight: 44,
			totalTopHeight: 64,
			isMenDian: 0,
			menDianID: 0,
			menDianNum: 0,
			isSubmitting: false,
			agreed: false,
			menDianImageData: [],
			viewImages: [],
			detailImages: [],
			viewImageTemplates: [
				{ title: '走马灯一', sortName: '走马灯', slotIndex: 0 },
				{ title: '走马灯二', sortName: '走马灯', slotIndex: 1 }
			],
			detailImageTemplates: [
				{ title: '门头招牌', sortName: '详情图', slotIndex: 0 },
				{ title: '门脸', sortName: '详情图', slotIndex: 1 },
				{ title: '收银台', sortName: '详情图', slotIndex: 2 },
				{ title: '左展示区一', sortName: '详情图', slotIndex: 3 },
				{ title: '左展示区二', sortName: '详情图', slotIndex: 4 },
				{ title: '左展示区三', sortName: '详情图', slotIndex: 5 },
				{ title: '右展示区一', sortName: '详情图', slotIndex: 6 },
				{ title: '右展示区二', sortName: '详情图', slotIndex: 7 },
				{ title: '右展示区三', sortName: '详情图', slotIndex: 8 },
				{ title: '中展示区一', sortName: '详情图', slotIndex: 9 },
				{ title: '中展示区二', sortName: '详情图', slotIndex: 10 },
				{ title: '中展示区三', sortName: '详情图', slotIndex: 11 },
				{ title: '营业执照', sortName: '详情图', slotIndex: 12 },
				{ title: '授权书', sortName: '详情图', slotIndex: 13 },
				{ title: '资质证明一', sortName: '详情图', slotIndex: 14 },
				{ title: '资质证明二', sortName: '详情图', slotIndex: 15 },
				{ title: '法人身份证正面', sortName: '详情图', slotIndex: 16 },
				{ title: '法人身份证反面', sortName: '详情图', slotIndex: 17 }
			]
		};
	},

	computed: {
		viewImageSlots() {
			const slots = new Array(2).fill(null).map((_, idx) => {
				const existingData = this.menDianImageData.find(
					item => item.sortName == '走马灯' && item.title == this.viewImageTemplates[idx].title
				);
				return {
					imgID: existingData ? existingData.imgID : 0,
					url: '',
					title: this.viewImageTemplates[idx].title,
					sortName: '走马灯',
					slotIndex: idx,
					isNew: false
				};
			});
			
			this.viewImages.forEach(image => {
				if (image.slotIndex !== undefined && slots[image.slotIndex]) {
					slots[image.slotIndex] = {
						...slots[image.slotIndex],
						imgID: image.imgID,
						url: image.url,
						isNew: image.isNew || false
					};
				}
			});
			
			return slots;
		},

		detailImageSlots() {
			const slots = new Array(18).fill(null).map((_, idx) => {
				const existingData = this.menDianImageData.find(
					item => item.sortName == '详情图' && item.title == this.detailImageTemplates[idx].title
				);
				return {
					imgID: existingData ? existingData.imgID : 0,
					url: '',
					title: this.detailImageTemplates[idx].title,
					sortName: '详情图',
					slotIndex: idx,
					isNew: false
				};
			});
			
			this.detailImages.forEach(image => {
				if (image.slotIndex !== undefined && slots[image.slotIndex]) {
					slots[image.slotIndex] = {
						...slots[image.slotIndex],
						imgID: image.imgID,
						url: image.url,
						isNew: image.isNew || false
					};
				}
			});
			
			return slots;
		}
	},

	onLoad(option) {
		// 获取状态栏高度和导航栏高度
		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
		
		// 微信小程序胶囊按钮位置计算导航栏高度
		if (sysInfo.platform === 'devtools' || sysInfo.environment === 'wx' || 
			(typeof wx !== 'undefined')) {
			try {
				const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
				if (menuButtonInfo) {
					this.navBarHeight = (menuButtonInfo.top - this.statusBarHeight) * 2 + menuButtonInfo.height;
				} else {
					this.navBarHeight = 44;
				}
			} catch (e) {
				this.navBarHeight = 44;
			}
		} else {
			this.navBarHeight = 44;
		}
		
		this.totalTopHeight = this.statusBarHeight + this.navBarHeight;
		
		const { menDianID, menDianNum } = option;
		this.menDianID = menDianID || 0;
		this.menDianNum = menDianNum || 0;
		this.loadImageList();
	},

	methods: {
		toggleAgree() {
			this.agreed = !this.agreed
		},

		showAgreement() {
			this.$refs.agreePopup.open('bottom')
		},

		agreeAndClose() {
			this.agreed = true
			this.$refs.agreePopup.close()
		},

		// 加载图片列表
		async loadImageList() {
			try {
				const res = await this.$http('imgPoolListManageByUser', {
					imgID: this.menDianID,
					num: this.menDianNum,
					token: uni.getStorageSync('token') || ''
				});

				if (res.code == 0) {
					this.processImageData(res.imgList);
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			} catch (error) {
				console.error('加载图片失败:', error);
				uni.showToast({ title: '加载失败', icon: 'none' });
			}
		},

		// 处理图片数据
		processImageData(data = []) {
			this.menDianImageData = data;
			
			// 处理走马灯图片
			const viewData = data.filter(item => item.sortName == '走马灯' && item.url?.trim());
			this.viewImages = viewData.map(item => {
				const template = this.viewImageTemplates.find(t => t.title == item.title);
				return {
					imgID: item.imgID,
					url: item.url,
					title: item.title,
					sortName: item.sortName,
					remark: item.remark || '',
					slotIndex: template ? template.slotIndex : -1,
					isNew: false
				};
			}).filter(item => item.slotIndex !== -1);
			
			// 处理详情图
			const detailData = data.filter(item => item.sortName == '详情图' && item.url?.trim());
			this.detailImages = detailData.map(item => {
				const template = this.detailImageTemplates.find(t => t.title == item.title);
				return {
					imgID: item.imgID,
					url: item.url,
					title: item.title,
					sortName: item.sortName,
					remark: item.remark || '',
					slotIndex: template ? template.slotIndex : -1,
					isNew: false
				};
			}).filter(item => item.slotIndex !== -1);
		},

		// 选择图片
		chooseImage() {
			return new Promise((resolve, reject) => {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: res => resolve(res.tempFiles[0]),
					fail: reject
				});
			});
		},

		// 上传图片到七牛云
		async uploadFileToQiniu(file) {
			const tokenRes = await this.$http('qiNiuToken', {
				token: uni.getStorageSync('token')
			});

			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: 'https://upload.qiniup.com',
					filePath: file.path,
					name: 'file',
					formData: { token: tokenRes.para.upToken },
					success: res => {
						if (res.statusCode == 200) {
							try {
								const result = JSON.parse(res.data);
								resolve(qiniuUrl + result.hash);
							} catch {
								reject(new Error('解析结果失败'));
							}
						} else {
							reject(new Error('上传失败'));
						}
					},
					fail: reject
				});
			});
		},

		// 上传图片
		async uploadImage(type, slotIndex) {
			const isView = type == 'view';
			const maxCount = isView ? 2 : 18;
			const images = isView ? this.viewImages : this.detailImages;
			const templates = isView ? this.viewImageTemplates : this.detailImageTemplates;
			const sortName = isView ? '走马灯' : '详情图';
			
			if (images.length >= maxCount) {
				uni.showToast({ title: `最多上传${maxCount}张图片`, icon: 'none' });
				return;
			}
			
			if (images.some(img => img.slotIndex == slotIndex)) {
				uni.showToast({ title: '该位置已有图片，请先删除', icon: 'none' });
				return;
			}

			try {
				const tempFile = await this.chooseImage();
				const template = templates[slotIndex];
				
				const existingData = this.menDianImageData.find(
					item => item.sortName == sortName && item.title == template.title
				);
				const imageID = existingData?.imgID || 0;
				
				uni.showLoading({ title: '上传中...', mask: true });
				const uploadedUrl = await this.uploadFileToQiniu(tempFile);
				uni.hideLoading();
				
				const imageItem = {
					imgID: imageID,
					url: uploadedUrl,
					title: template.title,
					sortName: sortName,
					remark: '',
					slotIndex: slotIndex,
					isNew: imageID == 0
				};
				
				if (isView) {
					this.viewImages.push(imageItem);
				} else {
					this.detailImages.push(imageItem);
				}
			} catch (error) {
				uni.hideLoading();
				console.error('上传图片失败:', error);
				uni.showToast({ title: error.message || '上传失败', icon: 'none' });
			}
		},

		// 删除图片
		async deleteImage(type, slotIndex) {
			const isView = type == 'view';
			const images = isView ? this.viewImages : this.detailImages;
			const targetIndex = images.findIndex(img => img.slotIndex == slotIndex);
			
			if (targetIndex == -1) return;
			
			const targetItem = images[targetIndex];
			
			if (targetItem.imgID > 0 && !targetItem.isNew) {
				try {
					uni.showLoading({ title: '删除中...', icon: 'none' });
					const res = await this.$http('imgPoolDel', {
						imgID: targetItem.imgID,
						token: uni.getStorageSync('token')
					});
					
					if (res.code == 0) {
						const dataIndex = this.menDianImageData.findIndex(
							item => item.imgID == targetItem.imgID
						);
						if (dataIndex > -1) {
							this.menDianImageData[dataIndex].url = '';
						}
						images.splice(targetIndex, 1);
						uni.showToast({ title: '删除成功', icon: 'none' });
					} else {
						uni.showToast({ title: res.msg || '删除失败', icon: 'none' });
					}
				} catch (error) {
					console.error('删除图片失败:', error);
					uni.showToast({ title: '删除失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			} else {
				images.splice(targetIndex, 1);
				uni.showToast({ title: '已删除', icon: 'none' });
			}
		},

		// 批量提交
		async batchSubmitImages(imageList) {
			let success = 0, fail = 0;
			
			for (const imageItem of imageList) {
				try {
					const res = await this.$http('imgPoolEdit', {
						imgID: imageItem.imgID || 0,
						url: imageItem.url || '',
						remark: imageItem.remark || '',
						sortName: imageItem.sortName || '',
						token: uni.getStorageSync('token')
					});
					
					if (res.code == 0) {
						success++;
					} else {
						fail++;
						console.error('保存失败:', res.msg);
					}
				} catch (error) {
					fail++;
					console.error('提交失败:', error);
				}
				
				await this.delay(100);
			}
			
			return { success, fail };
		},

		// 提交保存
		async handleSubmit() {
			if (this.isSubmitting) return;
			
			// 检查是否同意协议
			if (!this.agreed) {
				uni.showToast({ title: '请先阅读并同意广告发布协议', icon: 'none', duration: 2000 })
				return;
			}
			
			this.isSubmitting = true;
			uni.showLoading({ title: '保存中...', mask: true });
			
			try {
				const allImageList = [...this.viewImages, ...this.detailImages];
				
				if (!allImageList.length) {
					uni.hideLoading();
					uni.showToast({ title: '请至少上传一张图片', icon: 'none' });
					return;
				}
				
				const { success, fail } = await this.batchSubmitImages(allImageList);
				
				uni.hideLoading();
				
				if (fail == 0) {
					uni.showToast({ title: `保存成功`, icon: 'none'});
				} else {
					uni.showToast({ title: `保存完成,失败${fail}张`, icon: 'none', duration: 2000 });
				}
				
				setTimeout(() => {
					// #ifdef APP || H5
					uni.$emit('menDianMeans');
					// #endif
					
					uni.navigateBack({ delta: 1 });
				}, 1500);
			} catch (error) {
				uni.hideLoading();
				console.error('提交失败:', error);
				uni.showToast({ title: '网络错误，请重试', icon: 'none' });
			} finally {
				this.isSubmitting = false;
			}
		},

		delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
	}
};
</script>

<style scoped lang="scss">
.page-container {
	background-color: #f8f9fa;
	padding: 20rpx;
	min-height: 100vh;
	padding-bottom: 120rpx;
}

.form-card {
	background: #fff;
	border-radius: 10rpx;
	padding: 30rpx;
	padding-bottom: 40rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.upload-section {
	display: flex;
	flex-direction: column;
	padding-bottom: 20rpx;
	margin-bottom: 10rpx;
}

.label {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 20rpx;
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.image-slot {
	width: calc((100% - 48rpx) / 4);
	aspect-ratio: 1;
	border-radius: 8rpx;
	overflow: hidden;
	position: relative;
}

.image-wrapper {
	width: 100%;
	height: 100%;
	position: relative;
}

.preview-image {
	width: 100%;
	height: 100%;
	opacity: unset;
}

.delete-btn {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 40rpx;
	height: 40rpx;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.delete-icon {
	color: #fff;
	font-size: 28rpx;
	font-weight: bold;
	line-height: 1;
}

.upload-placeholder {
	width: 100%;
	height: 100%;
	border: 2rpx dashed #d9d9d9;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #fafafa;
	cursor: pointer;
}

.placeholder-icon {
	font-size: 48rpx;
	color: #ccc;
	margin-bottom: 8rpx;
}

.placeholder-title {
	font-size: 20rpx;
	color: #666;
	text-align: center;
	margin-bottom: 4rpx;
}

.upload-hint {
	font-size: 18rpx;
	color: #999;
	text-align: center;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	margin-top: 20rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #fff;
	background: linear-gradient(135deg, #fd7031, lighten(#fd7031, 8%));
	border: none;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 16rpx rgba(#fd7031, 0.3);
	
	&[disabled] {
		background: #c0c4cc;
		color: #fff;
		box-shadow: none;
	}
}

/* 协议勾选样式 */
.agreement-section {
	padding: 40rpx 0 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.agreement-check {
	display: flex;
	align-items: center;
}

.checkbox {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #ddd;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	transition: all 0.2s;
	flex-shrink: 0;

	&.checked {
		background: linear-gradient(135deg, #FD7031, #FF8F5E);
		border-color: #FD7031;
	}
}

.agreement-text {
	font-size: 26rpx;
	color: #666;
	flex: 1;
	word-break: break-all;
}

.agreement-link {
	color: #FD7031;
	text-decoration: underline;
}

/* 协议弹窗样式 */
.agree-popup {
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.agree-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.agree-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.agree-close {
	font-size: 48rpx;
	color: #999;
	line-height: 1;
	padding: 0 20rpx;
}

.agree-content {
	flex: 1;
	padding: 30rpx;
	max-height: 60vh;
}

.agree-section {
	margin-bottom: 30rpx;
}

.agree-text {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
}

.agree-detail {
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
	white-space: pre-line;
}

.agree-bottom {
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.agree-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #FD7031, lighten(#FD7031, 8%));
	color: #fff;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 12rpx;
	border: none;
}
</style>