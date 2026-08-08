<template>
	<view class="container">
		<view class="wrapper">
			<view class="welcome">欢迎注册同城交友</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">手机号码</text>
					<input class="biaoti" v-model="phoneno" type="number" maxlength="11" placeholder="请输入手机号" />
				</view>
				<view class="input-item">
					<text class="tit">用户名</text>
					<input class="biaoti" v-model="username" type="text" maxlength="20" placeholder="请输入用户名" />
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input class="biaoti" v-model="password" type="password" maxlength="32" placeholder="请设置密码" />
				</view>
			</view>
			<button class="confirm-btn" @click="bindLogin">确认</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '',
			phoneno: '',
			password: '',
			code: '999999',
			invitation: '0001'
		};
	},
	methods: {
		bindLogin() {
			let fkyz = /[^\s]/;
			var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;

			if (!myreg.test(this.phoneno)) {
				uni.showToast({ title: '手机号不正确', icon: 'none' });
				return;
			}
			if (!fkyz.test(this.username)) {
				uni.showToast({ title: '用户名不能为空', icon: 'none' });
				return;
			}
			if (this.password.length < 6) {
				uni.showToast({ title: '密码不能少于6位', icon: 'none' });
				return;
			}
			if (this.password.length > 16) {
				uni.showToast({ title: '密码不能大于16位', icon: 'none' });
				return;
			}
			if (!fkyz.test(this.code)) {
				uni.showToast({ title: '验证码不能为空', icon: 'none' });
				return;
			}

			this.$http('userReg', JSON.stringify({
				userid: this.phoneno,
				userName: this.username,
				mobile: this.phoneno,
				pwdLogin: this.password,
				valicode: this.code,
				userCode: this.invitation
			})).then((res) => {
				if (res.code == 0) {
					uni.showToast({ title: res.msg, icon: 'none'});
					uni.redirectTo({
						url: '/pages/public/question?isIndex=1&token=' + res.data
					});
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.log(err);
				uni.showToast({ title: '网络错误，请重试', icon: 'none' });
			});
		}
	}
};
</script>

<style scoped lang="scss">
page {
	background: #fff;
}

.container {
	padding-top: 100px;
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: #fff;
}

.wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
}

.welcome {
	position: relative;
	left: 50rpx;
	font-size: 46rpx;
	color: #555;
	text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
	margin-bottom: 40rpx;
}

.input-content {
	padding: 0 40rpx;
}

.input-item {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 0 30rpx;
	background: #f5f5f5;
	height: 120rpx;
	border-radius: 4px;
	margin-bottom: 20rpx;

	&:last-child {
		margin-bottom: 0;
	}

	.tit {
		height: 50rpx;
		line-height: 56rpx;
		font-size: 26rpx;
		color: #999;
	}

	input {
		height: 60rpx;
		font-size: 28rpx;
		color: #333;
		width: 100%;
	}
}

.confirm-btn {
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 10rpx;
	margin: 50rpx 40rpx 0;
	background: #FD7031;
	color: #fff;
	font-size: 32rpx;

	&:after {
		border-radius: 100px;
	}
}
</style>
