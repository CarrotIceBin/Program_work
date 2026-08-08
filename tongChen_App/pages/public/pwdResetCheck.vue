<template>
	<view class="container">
		<view class="form-container">
			<view class="form-item">
				<view class="label">新密码</view>
				<input class="input" type="text" v-model="resetPwd" placeholder="请输入新密码" maxlength="20"/>
			</view>

			<view class="form-item">
				<view class="label">确认密码</view>
				<input class="input" type="text" v-model="resetAfterPwd" placeholder="请再次输入新密码" maxlength="20" />
			</view>

			<view class="tips">
				<text>密码建议：8-20位，包含字母、数字或符号</text>
			</view>

			<view class="confirm-btn" @click="handleSubmit">确认重置</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			token: '',
			resetPwd: '',
			resetAfterPwd: ''
		};
	},
	onLoad(options) {
		const { token } = options;
		this.token = token || '';
	},
	methods: {
		validateForm() {
			if (!this.resetPwd || this.resetPwd.trim() == '') {
				uni.showToast({ title: '请输入新密码', icon: 'none' });
				return false;
			}

			if (this.resetPwd.length < 6) {
				uni.showToast({ title: '密码长度不能少于6位', icon: 'none' });
				return false;
			}

			if (this.resetPwd.length > 20) {
				uni.showToast({ title: '密码长度不能超过20位', icon: 'none' });
				return false;
			}

			if (this.resetPwd !== this.resetAfterPwd) {
				uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
				return false;
			}

			return true;
		},

		// 提交重置
		handleSubmit() {
			if (!this.validateForm()) return;

			uni.showLoading({ title: '正在重置...', mask: true });

			this.$http('userPwdResetAfterCheck', JSON.stringify({
				pwdLogin: this.resetAfterPwd,
				token: this.token
			})).then((res) => {
				uni.hideLoading();
				if (res.code == 0) {
					uni.showToast({ title: res.msg || '密码重置成功', icon: 'none' });

					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/public/loginPwd'
						});
					}, 1500);
				} else {
					uni.showToast({ title: res.msg || '重置失败，请重试', icon: 'none' });
				}
			}).catch((err) => {
				uni.hideLoading();
				console.error('密码重置失败:', err);
			});
		}
	}
};
</script>

<style scoped lang="scss">
.container {
	padding: 20rpx;
}

.form-container {
	padding: 60rpx 40rpx;
}

.form-item {
	margin-bottom: 30rpx;

	.label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 16rpx;
	}

	.input {
		height: 80rpx;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		background-color: #fff;
	}
}

.tips {
	font-size: 24rpx;
	color: #999;
	margin-top: -10rpx;
	margin-bottom: 40rpx;
	padding-left: 8rpx;
}

.confirm-btn {
	background: #FD7031;
	color: #fff;
	text-align: center;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 10rpx;
	font-size: 32rpx;
	margin-top: 60rpx;

	&:active {
		opacity: 0.8;
	}
}
</style>
