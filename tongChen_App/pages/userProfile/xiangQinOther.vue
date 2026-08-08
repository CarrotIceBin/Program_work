<template>
	<view class="page">
		<view v-if="xiangQinFields.length" class="card">
			<view class="row" v-for="field in xiangQinFields" :key="field.key" @click="navigateToUserMeansByField(field)">
				<text class="label">{{ field.label }}</text>
				<view class="row-right">
					<text class="value">{{ field.value || '' }}</text>
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>
		</view>
		<view v-else class="empty">
			<text>暂无他人相亲资料</text>
		</view>

		<view class="image-section">
			<view class="section-title">照片</view>
			<view class="image-grid">
				<view class="image-slot" v-for="(img, index) in xiangQinImages" :key="'img-' + index">
					<image class="uploaded-img" :src="img" mode="aspectFill" @click="previewImage(index)"></image>
					<view class="delete-btn" @click="deleteImage(index)">
						<uni-icons type="closeempty" size="16" color="#fff" />
					</view>
				</view>
				<view class="image-slot add-slot" v-if="xiangQinImages.length < 6" @click="chooseAndUploadImage">
					<uni-icons type="camera" size="28" color="#999" />
					<text class="add-text">上传照片</text>
				</view>
			</view>
			<view class="image-count">{{ xiangQinImages.length }}/6</view>
		</view>
	</view>
</template>

<script>
import { qiniuUrl } from '@/utils/api.js';
const IMAGE_STORAGE_KEY = 'xiangQinOther_images';
const MAX_IMAGES = 6;
const PHOTOS_MODULE_ID = 'photos';
const GROUP_INFO = 2;

export default {
	data() {
		return {
			xiangQinRawData: [],
			xiangQinImages: [],
			excludeFieldList: ['tall', 'star', 'centence'],
			xiangQinFieldList: [
				{ key: 'nick_name', label: '姓氏：' },
				{ key: 'sex', label: '性别：' },
				{ key: 'birthday', label: '出生年份：' },
				{ key: 'age', label: '年龄：' },
				{ key: 'marrry', label: '婚姻状况：' },
				{ key: 'area_code', label: '成长地：' },
				{ key: 'area_code_work', label: '工作地：' },
				{ key: 'work_name', label: '职业：' },
				{ key: 'degree', label: '文化程度：' },
				{ key: 'education', label: '所学专业：' },
				{ key: 'age_range', label: '愿意另一半年龄区间：', forceText: true },
				{ key: 'bride_price', label: '与父母商量后的彩礼金额：', forceText: true },
				{ key: 'bottom_line', label: '希望双方各拿多少聘金来组建家庭：', forceText: true },
				{ key: 'family_status', label: '家庭现：', forceText: true },
				{ key: 'family_affection', label: '亲情现：', forceText: true },
				{ key: 'advantage', label: '优点：', forceText: true },
				{ key: 'hobby', label: '爱好：', forceText: true },
				{ key: 'ideal_partner', label: '希望心仪对象的条件：', forceText: true },
				{ key: 'hometown_way', label: '家务选择方式：', forceText: true }
			]
		};
	},
	computed: {
		xiangQinFields() {
			const birthdayItem = this.xiangQinRawData.find(item => item.moduleID === 'birthday');
			const birthdayValue = birthdayItem ? birthdayItem.infoTxt : '';
			const calculatedAge = birthdayValue ? this.calcAge(birthdayValue) : '';

			const predefined = this.xiangQinFieldList.map(field => {
				let matched = this.xiangQinRawData.find(
					item => item.moduleID === field.key || item.moduleName === field.label
				);

				let value = matched ? matched.infoTxt : '';
				
				if (field.key === 'age' && calculatedAge) {
					value = calculatedAge + '岁';
				}

				if (field.forceText) {
					const localKey = `xiangQinOther_${field.key}`;
					const localValue = uni.getStorageSync(localKey);
					if (localValue) {
						value = localValue;
					}
				}

				return {
					key: field.key,
					label: field.label,
					value: value,
					forceText: field.forceText || false,
					raw: matched || null
				};
			});

			const predefinedKeys = this.xiangQinFieldList.map(f => f.key);
			const extraFields = this.xiangQinRawData
				.filter(item => !predefinedKeys.includes(item.moduleID) && !this.excludeFieldList.includes(item.moduleID))
				.map(item => ({
					key: item.moduleID,
					label: item.moduleName,
					value: item.infoTxt || '',
					forceText: false,
					raw: item
				}));

			return [...predefined, ...extraFields];
		}
	},
	onLoad() {
		uni.$on('userMeans', this.loadData);
	},
	onShow() {
		this.loadData();
		this.loadImages();
	},
	onUnload() {
		uni.$off('userMeans', this.loadData);
	},
	methods: {
		calcAge(birthday) {
			if (!birthday) return '';
			const parts = birthday.split(/[-\/]/);
			if (parts.length !== 3) return '';
			const year = parseInt(parts[0]);
			const month = parseInt(parts[1]);
			const day = parseInt(parts[2]);
			const now = new Date();
			let age = now.getFullYear() - year;
			if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) {
				age--;
			}
			return age > 0 ? age : '';
		},
		loadData() {
			this.$http('userInfoListMy', JSON.stringify({ 
				groupInfo: GROUP_INFO,
				groupModule: 1,
				token: uni.getStorageSync('token')
			})).then((res) => {
				if (res.code == 0) {
					this.xiangQinRawData = res.infoList;
					this.loadImagesFromApi(res.infoList);
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('他人相亲资料:', err);
			});
		},
		loadImagesFromApi(infoList) {
			const photosItem = infoList.find(item => item.moduleID === PHOTOS_MODULE_ID);
			if (photosItem && photosItem.infoTxt) {
				try {
					const images = JSON.parse(photosItem.infoTxt);
					if (Array.isArray(images)) {
						this.xiangQinImages = images;
						this.saveImages();
						return;
					}
				} catch (e) {
					console.error('解析图片数据失败:', e);
				}
			}
			const saved = uni.getStorageSync(IMAGE_STORAGE_KEY);
			this.xiangQinImages = Array.isArray(saved) ? saved : [];
		},
		loadImages() {
			const saved = uni.getStorageSync(IMAGE_STORAGE_KEY);
			this.xiangQinImages = Array.isArray(saved) ? saved : [];
		},
		async saveImages() {
			uni.setStorageSync(IMAGE_STORAGE_KEY, this.xiangQinImages);
			try {
				await this.$http('userInfoSet', {
					groupInfo: GROUP_INFO,
					moduleID: PHOTOS_MODULE_ID,
					infoTxt: JSON.stringify(this.xiangQinImages),
					token: uni.getStorageSync('token')
				});
			} catch (err) {
				console.error('保存图片到服务器失败:', err);
			}
		},
		chooseAndUploadImage() {
			if (this.xiangQinImages.length >= MAX_IMAGES) {
				uni.showToast({ title: '最多上传6张照片', icon: 'none' });
				return;
			}
			this.chooseImage().then(filePath => {
				this.uploadImage(filePath);
			}).catch(() => {});
		},
		chooseImage() {
			return new Promise((resolve, reject) => {
				uni.chooseImage({
					count: MAX_IMAGES - this.xiangQinImages.length,
					sizeType: ['compressed'],
					sourceType: ['camera', 'album'],
					success: (res) => resolve(res.tempFilePaths[0]),
					fail: reject
				});
			});
		},
		async uploadImage(filePath) {
			try {
				uni.showLoading({ title: '上传中...' });
				const tokenRes = await this.$http('qiNiuToken', JSON.stringify({ token: uni.getStorageSync('token') }));
				if (!tokenRes?.para?.upToken) throw new Error('获取上传凭证失败');
				const uploadRes = await this.uploadToQiniu(filePath, tokenRes.para.upToken);
				const { hash } = JSON.parse(uploadRes.data);
				if (!hash) throw new Error('上传失败');
				const newUrl = qiniuUrl + hash;
				this.xiangQinImages.push(newUrl);
				this.saveImages();
				uni.showToast({ title: '上传成功', icon: 'success' });
			} catch (err) {
				console.error('上传失败:', err);
				uni.showToast({ title: err.message || '上传失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		uploadToQiniu(filePath, token) {
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: 'https://upload.qiniup.com',
					filePath,
					name: 'file',
					formData: { token },
					success: resolve,
					fail: reject
				});
			});
		},
		deleteImage(index) {
			uni.showModal({
				title: '提示',
				content: '确定要删除这张照片吗？',
				success: (res) => {
					if (res.confirm) {
						this.xiangQinImages.splice(index, 1);
						this.saveImages();
					}
				}
			});
		},
		previewImage(index) {
			uni.previewImage({
				current: this.xiangQinImages[index],
				urls: this.xiangQinImages
			});
		},
		navigateToUserMeansByField(field) {
			let item = field.raw;
			
			if (!item && !field.forceText) {
				uni.showToast({ title: '该字段暂无数据', icon: 'none' });
				return;
			}
			
			let infoTxt = '';
			
			if (!item && field.forceText) {
				const localKey = `xiangQinOther_${field.key}`;
				infoTxt = uni.getStorageSync(localKey) || '';
				item = {
					moduleID: field.key,
					moduleName: field.label,
					infoTxt: infoTxt,
					typeID: 1,
					enumList: []
				};
			} else if (field.forceText) {
				const localKey = `xiangQinOther_${field.key}`;
				infoTxt = uni.getStorageSync(localKey) || item.infoTxt;
				item.infoTxt = infoTxt;
			}
			
			const typeID = field.forceText ? 1 : item.typeID;
			const data = encodeURIComponent(JSON.stringify({
				moduleID: item.moduleID,
				moduleName: item.moduleName,
				infoTxt: infoTxt,
				typeID: typeID,
				groupInfo: 2,
				enumList: field.forceText ? [] : (item.enumList ? item.enumList : []),
				localSave: field.forceText || false,
				localKey: field.forceText ? `xiangQinOther_${field.key}` : ''
			}));
			
			uni.navigateTo({ 
				url: `/pagesSub/user/userMeans?data=${data}`
			});
		}
	}
};
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 20rpx;
}

.card {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	
	&:last-child {
		border-bottom: none;
	}
}

.label {
	font-size: 28rpx;
	color: #333;
}

.row-right {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.value {
	font-size: 28rpx;
	color: #666;
}

.empty {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 400rpx;
	color: #999;
	font-size: 28rpx;
}

.image-section {
	margin-top: 20rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
}

.section-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 24rpx;
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.image-slot {
	position: relative;
	width: calc((100% - 60rpx) / 4);
	padding-bottom: calc((100% - 60rpx) / 4);
	background: #f5f5f5;
	border-radius: 12rpx;
	overflow: hidden;
}

.uploaded-img {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.delete-btn {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 44rpx;
	height: 44rpx;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
}

.add-slot {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 2rpx dashed #ddd;
	background: #fafafa;

	uni-icons {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%);
	}

	.add-text {
		position: absolute;
		bottom: 20%;
		left: 0;
		right: 0;
		text-align: center;
		font-size: 24rpx;
		color: #999;
	}
}

.image-count {
	margin-top: 20rpx;
	text-align: right;
	font-size: 24rpx;
	color: #999;
}
</style>
