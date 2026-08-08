<template>
	<view class="page">
		<view class="card" style="margin-bottom: 12px">
			<view class="row avatar-row" @click="uploadAvatar">
				<text class="label">头像</text>
				<view class="row-right">
					<image class="avatar" :src="userData.imgUrl || '/static/missing-face.png'" mode="aspectFill" />
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>
		</view>

		<view class="card">
			<!-- 账号 -->
			<view class="row">
				<text class="label">账号</text>
				<text class="value readonly">{{ userData.userid || '' }}</text>
			</view>

			<!-- 昵称（可编辑） -->
			<view class="row" @click="goToNicknameEdit">
				<text class="label">昵称</text>
				<view class="row-right">
					<text class="value">{{ userData.userName || '' }}</text>
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>

			<!-- 其他菜单项 -->
			<view class="row" v-for="item in menuItems" :key="item.type" @click="handleMenuItemClick(item)">
				<text class="label">{{ item.label }}</text>
				<view class="row-right">
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>

			<!-- 注销账号 -->
			<view class="row" @click="userDestroyClick">
				<text class="label">注销账号</text>
				<view class="row-right">
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>

			<!-- 注册时间 -->
			<view class="row">
				<text class="label">注册时间</text>
				<text class="value readonly">{{ userData.inputTime || '' }}</text>
			</view>

			<!-- 开关项 -->
			<view class="row" v-for="item in switchItems" :key="item.fieID">
				<text class="label">{{ item.label }}</text>
				<view 
					class="custom-switch" 
					:class="{'active': userData[item.fieID]}"
					@click="handleSwitchToggle(item)"
				>
					<view class="switch-handle"></view>
				</view>
			</view>
		</view>

		<!-- 退出按钮 -->
		<view class="logout" @click="logout">退出账号</view>
	</view>
</template>

<script>
import { qiniuUrl } from '@/utils/api.js';

export default {
	data() {
		return {
			isSwitch: 0,
			userData: {},
			// 菜单项配置
			menuItems: [
				{ label: '基本资料', type: 1, page: '/pages/userProfile/basics?groupInfo=1' },
				{ label: '相亲资料', type: 9, page: '/pages/userProfile/xiangQin' },
				{ label: '他人相亲资料', type: 8, page: '/pages/userProfile/xiangQinOther' },
				{ label: '通知', type: 2, page: '/pages/userProfile/notice' },
				{ label: '我的门店', type: 3, page: '/pages/menDian/menDianUser' },
				{ label: '平台资质', type: 4, page: '/pages/userProfile/qualification' },
				{ label: '联系方式', type: 5, page: '/pages/userProfile/contactUs' },
				{ label: '同城有缘', type: 6, page: '/pages/userProfile/features' }
			],
			switchItems: [
				{ label: '自己相亲', fieID: 'xiangQinSe' },
				{ label: '他人相亲', fieID: 'xiangQinOth' }
			]
		};
	},

	onLoad() {
		uni.$on('userMeans', this.loadUserInfo);
	},

	onShow() {
		this.loadUserInfo();
	},

	onUnload() {
		uni.$off('userMeans', this.loadUserInfo);
	},

	methods: {
		loadUserInfo() {
			this.$http('userInfo', JSON.stringify({ 
				token: uni.getStorageSync('token')
			})).then((res) => {
				if (res.code == 0) {
					this.userData = {
						...res.userInfo,
						xiangQinSe: res.userInfo.xiangQinSelf == 1 ? true : false,
						xiangQinOth: res.userInfo.xiangQinOther == 1 ? true : false
					};
					
					if(this.userData.xiangQinOther == 1 || this.userData.xiangQinSelf == 1){
						this.isSwitch = 1;
					} else {
						this.isSwitch = 0;
					}
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('加载用户信息失败:', err);
			});
		},

		// ========== 头像上传 ==========
		async uploadAvatar() {
			try {
				// 1. 选择图片
				const tempFilePath = await this.chooseImage();
				if (!tempFilePath) return;

				// 2. 获取七牛云Token
				const tokenRes = await this.$http('qiNiuToken', JSON.stringify({ token: uni.getStorageSync('token') }));
				if (!tokenRes?.para?.upToken) throw new Error('获取上传凭证失败');

				// 3. 上传到七牛云
				const uploadRes = await this.uploadToQiniu(tempFilePath, tokenRes.para.upToken);
				const { hash } = JSON.parse(uploadRes.data);
				if (!hash) throw new Error('上传失败，未获取到文件hash');

				// 4. 更新用户头像
				const newAvatarUrl = qiniuUrl + hash;
				await this.$http('userImgurlUpd', JSON.stringify({ imgUrl: newAvatarUrl, token: uni.getStorageSync('token') }));

				// 5. 更新本地数据
				this.userData.imgUrl = newAvatarUrl;
				uni.showToast({ title: '头像更新成功', icon: 'success' });
			} catch (err) {
				console.error('头像上传失败:', err);
				uni.showToast({ title: err.message || '头像上传失败', icon: 'none' });
			}
		},

		chooseImage() {
			return new Promise((resolve, reject) => {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['camera', 'album'],
					success: (res) => resolve(res.tempFilePaths[0]),
					fail: reject
				});
			});
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

		goToNicknameEdit() {
			uni.navigateTo({ url: `/pages/userProfile/userName?nickname=${this.userData.userName || ''}` });
		},

		handleMenuItemClick(item) {
			if (item.page) {
				uni.navigateTo({ url: item.page });
			} else {
				uni.showToast({ title: `${item.label}功能开发中`, icon: 'none' });
			}
		},

		// ========== 开关互斥逻辑 ==========
		handleSwitchToggle(item) {
			const currentField = item.fieID;
			const otherField = currentField == 'xiangQinSe' ? 'xiangQinOth' : 'xiangQinSe';
			const currentKey = currentField == 'xiangQinSe' ? 'xiangQinSelf' : 'xiangQinOther';
			const otherKey = currentField == 'xiangQinSe' ? 'xiangQinOther' : 'xiangQinSelf';
			const currentApi = currentField == 'xiangQinSe' ? 'userXiangQinSelfUpdate' : 'userXiangQinOtherUpdate';
			const otherApi = currentField == 'xiangQinSe' ? 'userXiangQinOtherUpdate' : 'userXiangQinSelfUpdate';
			
			const willBeChecked = !this.userData[currentField];
			
			// 如果要打开，先关闭另一个
			if (willBeChecked && this.userData[otherField]) {
				// 先更新本地状态
				this.$set(this.userData, otherField, false);
				this.$set(this.userData, currentField, true);
				
				// 调用关闭另一个的API
				this.$http(otherApi, JSON.stringify({ 
					[otherKey]: 0, 
					token: uni.getStorageSync('token') 
				})).then(() => {
					// 再调用打开当前的API
					this.$http(currentApi, JSON.stringify({ 
						[currentKey]: 1, 
						token: uni.getStorageSync('token') 
					})).then((res) => {
						if (res.code != 0) {
							this.$set(this.userData, currentField, false);
							this.$set(this.userData, otherField, true);
							uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
						}
					}).catch((err) => {
						this.$set(this.userData, currentField, false);
						this.$set(this.userData, otherField, true);
						console.error('更新失败:', err);
						uni.showToast({ title: '操作失败，请重试', icon: 'none' });
					});
				}).catch(() => {
					// 关闭另一个失败，回滚
					this.$set(this.userData, otherField, true);
					this.$set(this.userData, currentField, false);
					uni.showToast({ title: '操作失败，请重试', icon: 'none' });
				});
			} else {
				// 普通切换（不涉及互斥）
				this.$set(this.userData, currentField, willBeChecked);
				
				this.$http(currentApi, JSON.stringify({ 
					[currentKey]: willBeChecked ? 1 : 0, 
					token: uni.getStorageSync('token') 
				})).then((res) => {
					if (res.code != 0) {
						this.$set(this.userData, currentField, !willBeChecked);
						uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
					}
				}).catch((err) => {
					this.$set(this.userData, currentField, !willBeChecked);
					console.error('更新失败:', err);
					uni.showToast({ title: '操作失败，请重试', icon: 'none' });
				});
			}
		},

		// ========== 退出登录 ==========
		logout() {
			uni.clearStorage();
			uni.reLaunch({ url: '/pages/public/loginPwd' });
		},

		// ========== 注销账号 ==========
		userDestroyClick() {
			uni.showModal({
				title: '提示',
				content: '您将注销该号码，服务器将清空一切有关信息，且不可找回，请思考后确定是否注销。',
				success: (res) => {
					if (res.confirm) {
						this.$http('userDestroy', JSON.stringify({
							token: uni.getStorageSync('token')
						})).then((res) => {
							if (res.code == 0) {
								this.logout();
							} else {
								uni.showToast({ title: res.msg, icon: 'none' });
							}
						}).catch((err) => {
							console.error('注销失败:', err);
							uni.showToast({ title: '注销失败，请重试', icon: 'none' });
						});
					}
				}
			});
		}
	}
};
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 10px 10px 40px;
}

.card {
	background: #fff;
	border-radius: 6px;
	overflow: hidden;
	padding: 0 10px;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 0;
	font-size: 15px;
	border-bottom: 1px solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}
}

.avatar-row {
	padding: 10px 0;
}

.label {
	color: #1a1a1a;
	flex-shrink: 0;
}

.value {
	color: #999;
	font-size: 14px;

	&.readonly {
		margin-right: 0;
	}
}

.row-right {
	display: flex;
	align-items: center;
	gap: 4px;

	.value {
		margin-right: 2px;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.avatar {
	width: 52px;
	height: 52px;
	border-radius: 50%;
	flex-shrink: 0;
}

.logout {
	margin-top: 16px;
	background: #fff;
	border-radius: 6px;
	text-align: center;
	padding: 16px;
	font-size: 15px;
	color: #ff4d4f;
	cursor: pointer;
}

.custom-switch {
	width: 51px;
	height: 31px;
	background: #ddd;
	border-radius: 31px;
	position: relative;
	cursor: pointer;
	transition: background 0.2s;
	flex-shrink: 0;
	
	&.active {
		background: #FD7031;
		
		.switch-handle {
			transform: translateX(20px);
		}
	}
}

.switch-handle {
	width: 27px;
	height: 27px;
	background: #fff;
	border-radius: 50%;
	position: absolute;
	top: 2px;
	left: 2px;
	transition: transform 0.2s;
	box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
</style>