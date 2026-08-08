<template>
	<view class="page">
		<view class="card">
			<view class="row" v-for="item in switchItems" :key="item.fieID">
				<text class="label">{{ item.label }}</text>
				<switch :checked="userData[item.fieID]" @change="(e) => switchChange(e, item.fieID)" color="#FD7031" style="transform: scale(0.8)" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userData: {
				1: false,
				2: false, 
				3: false, 
				4: false
			},
			switchItems: [
				{ label: '交友通知', fieID: 1 },
				{ label: '单身通知', fieID: 2 },
				{ label: '相亲通知', fieID: 3 },
				{ label: '店铺咨询通知', fieID: 4 }
			]
		}
	},
	onLoad() {
		this.loadNotificationSettings();
	},
	methods: {
		switchChange(e, fieID) {
			const value = e.detail.value;
			this.$set(this.userData, fieID, value);
			// 调用接口保存设置
			this.saveNotificationSetting(fieID, value);
		},
		
		// 获取用户通知设置
		loadNotificationSettings() {
			// 从本地缓存或接口获取
			// #ifdef APP-PLUS
			// App端从本地存储读取
			const savedSettings = uni.getStorageSync('notificationSettings');
			if (savedSettings) {
				this.userData = { ...this.userData, ...savedSettings };
			}
			// #endif
			
			// 或者调用后端接口
			// this.$api.getNotificationSettings().then(res => {
			//     if (res.data) {
			//         this.userData = { ...this.userData, ...res.data };
			//     }
			// });
		},
		
		// 保存通知设置到服务器
		saveNotificationSetting(fieID, value) {
			// 显示加载提示
			uni.showLoading({ title: '保存中...' });
			
			// 调用接口保存
			// this.$api.updateNotificationSetting({ fieID, value }).then(res => {
			//     uni.hideLoading();
			//     uni.showToast({ title: '设置成功', icon: 'success' });
			// }).catch(err => {
			//     uni.hideLoading();
			//     uni.showToast({ title: '保存失败', icon: 'none' });
			//     // 失败时回滚数据
			//     this.$set(this.userData, fieID, !value);
			// });
			
			// 模拟保存（实际开发请删除）
			setTimeout(() => {
				uni.hideLoading();
				console.log(`通知设置已保存：fieID=${fieID}, value=${value}`);
				
				// #ifdef APP-PLUS
				// 保存到本地缓存
				uni.setStorageSync('notificationSettings', this.userData);
				// #endif
			}, 500);
		}
	}
}
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 12px;
}

.card {
	background: #fff;
	border-radius: 6px;
	overflow: hidden;
	padding: 0 16px;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 0;
	border-bottom: 1px solid #f5f5f5;
	
	.label {
		font-size: 28rpx;
		color: #333;
	}
}
</style>