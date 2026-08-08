<template>
	<view class="login-container">
		<view class="right-top-sign"></view>
		<view class="content-wrapper">
			<view class="login-title"></view>
			<view class="input-group">
				<view class="input-item">
					<text class="label">手机号码</text>
					<input class="input" v-model="userid" type="number" maxlength="11" placeholder="请输入手机号码" />
				</view>
				<view class="input-item">
					<text class="label">密码</text>
					<input class="input" v-model="password" type="password" maxlength="14" placeholder="请输入密码" />
				</view>
			</view>
			<view class="agreement-section">
				<label class="agreement-checkbox">
					<checkbox-group @change="handleCheckboxChange">
						<checkbox value="1" :checked="agreementChecked" color="#FD7031" />
					</checkbox-group>
				</label>
				<view class="agreement-text">
					已阅读并同意
					<text class="agreement-link" @click="openWebPage('yongHuXieYi')">《用户协议》</text>
					<text>和</text>
					<text class="agreement-link" @click="openWebPage('yinSiXieYi')">《隐私政策》</text>
				</view>
			</view>
			
			<button class="login-btn" @click="handleLogin">登录</button>
			
			<view class="action-links">
				<view class="link-item" @click="navigateToRegister">注册</view>
				<view class="link-item" @click="navigateToForgetPassword">忘记密码</view>
			</view>
			
			<view class="other-login-section">
				<text class="other-login-title">其他登录方式</text>
				<view class="other-login-icons">
					<block v-for="(item, index) in loginMethodData" :key="index">
						<view class="login-icon" @click="switchLoginMethod(item.methodID)">
							<image :src="item.image" mode="widthFix" class="icon-img"></image>
							<text class="icon-text">{{ item.methodName }}</text>
						</view>
					</block>
				</view>
			</view>
		</view>
		
		<uni-popup ref="popup" background-color="#fff">
			<view class="share-popup">
				<view class="share-title">用户使用协议</view>
				<view class="share-platforms">
					<text class="with-newline">请您阅读并同意</text>
					<text class="agreement-link" @click="openWebPage('yongHuXieYi')">《用户协议》</text>
					<text>和</text>
					<text class="agreement-link" @click="openWebPage('yinSiXieYi')">《隐私政策》</text>
					<text>,并知晓同城有缘的注册和使用</text>
				</view>
				<view class="button-group">
				    <view class="agree-btn" @click="handleAgree">同意</view>
				    <view class="disagree-btn" @click="handleDisagree">暂不同意</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userid: '',
			password: '',
			agreementChecked: false,
			loginMethodData: [
				{ methodID: 1, methodName: "微信", image: "/static/public/wxImage1.png" },
				// { methodID: 2, methodName: "验证码", image: "/static/public/auth_code.png" }
			]
		}
	},
	methods: {
		handleLogin() {
			if (!this.userid) {
				this.showToast('手机号码不能为空');
				return;
			}
			if (!this.password) {
				this.showToast('密码不能为空');
				return;
			}
			if(this.agreementChecked){
				this.userLoginByPwd();
			} else {
				this.$refs.popup.open();
			}
		},
		
		userQuestionExists(token){
			this.$http('userPwdQuestionExists', JSON.stringify({
				token: token,
			})).then(res => {
				if (res.code == 0) {
					uni.setStorage({ key: 'token', data: token });
					
					setTimeout(() => {
						uni.switchTab({ url: '/pages/index/index' });
					}, 500);
				} else {
					uni.removeStorageSync('userid');
					uni.redirectTo({
						url: '/pages/public/question?isIndex=1&token=' + token
					})
				}
			}).catch(err => {
				console.error('登录失败:', err);
			})
		},
		
		handleCheckboxChange(e) {
			this.agreementChecked = e.detail.value.includes('1');
		},
		
		openWebPage(cfgKey) {
			this.$http("systemCfgInfoClient", JSON.stringify({
				token: uni.getStorageSync("token") || '',
				cfgKey: cfgKey
			})).then(res => {
				const cfgValue = res.systemCfgInfo.cfgValue;
				this.navigateByUrl(cfgValue);
			}).catch(err => {
				console.error('获取配置失败:', err);
			})
		},
		
		navigateByUrl(url) {
			if (url.startsWith('/pages')) {
				uni.navigateTo({ url });
			} else if (url.startsWith('http')) {
				uni.navigateTo({
					url: '/pages/public/web?u=' + url
				})
			}
		},
		
		navigateToRegister() {
			uni.navigateTo({ url: '/pages/public/reg' });
		},
		
		navigateToForgetPassword() {
			uni.navigateTo({ url: '/pages/public/question?isQuestion=1' });
		},
		showToast(message) {
			uni.showToast({ title: message, icon: 'none' });
		},
		handleAgree(){
			this.$refs.popup.close();
			this.userLoginByPwd();
		},
		handleDisagree(){
			this.$refs.popup.close();
		},
		userLoginByPwd(){
			this.$http('userLoginByPwd', JSON.stringify({
				userid: this.userid,
				pwdLogin: this.password
			})).then(res => {
				if (res.code == 0) {
					this.userQuestionExists(res.data);
					uni.setStorage({ key: "userid", data: this.userid });
				} else {
					this.showToast(res.msg);
				}
			}).catch(err => {
				console.error('登录失败:', err);
			})
		},
		switchLoginMethod(methodID) {
			if (methodID == 1) {
				uni.navigateTo({
					url: '/pages/public/login'
				});
			} else if (methodID == 2) {
				uni.navigateTo({
					url: '/pages/public/phonLogin'
				});
			}
		},
	}
}
</script>

<style scoped lang='scss'>
page {
	background: #ffffff;
}

.login-container {
	padding-top: 50px;
	width: 100vw;
	background: #ffffff;
}

.right-top-sign {
	position: absolute;
	top: 40px;
	right: -15px;
	z-index: 95;
}

.content-wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
	padding: 0 20px 20px;
}

.login-title {
	font-size: 60px;
	color: #f8f8f8;
	margin-left: -8px;
	margin-bottom: 30px;
}

.input-group {
	margin-bottom: 20px;
}

.input-item {
	display: flex;
	flex-direction: column;
	padding: 0 15px;
	background: #f8f6fc;
	height: 60px;
	border-radius: 4px;
	margin-bottom: 15px;

	&:last-child {
		margin-bottom: 0;
	}

	.label {
		height: 25px;
		line-height: 28px;
		font-size: 13px;
		color: #606266;
	}

	.input {
		height: 30px;
		font-size: 14px;
		color: #303133;
		width: 100%;
	}
}

.agreement-section {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
	font-size: 13px;
	color: #606266;
}

.agreement-checkbox {
	margin-right: 10px;
}

.agreement-text {
	font-size: 28rpx;
	color: #666;
	flex: 1;
	line-height: 1.5;
}

.agreement-link {
	color: #FD7031;
	font-size: 14px;
}

.login-btn {
	width: 100%;
	height: 44px;
	line-height: 44px;
	border-radius: 5px;
	color: #ffffff;
	font-size: 16px;
	background: #FD7031;
}

.action-links {
	display: flex;
	justify-content: space-around;
	font-size: 15px;
	margin-top: 10px;
}

.link-item {
	color: #FD7031;
	padding: 10px 0;
}

.login-container .uni-popup{
	/deep/ .uni-popup__wrapper{
		margin: 0 20px;
		border-radius: 8px;
	}
	
	.share-popup {
		padding: 20px;
		background: #fff;
		border-radius: 8px;
		
		.share-title {
			text-align: center;
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 10px;
		}
		
		.share-platforms{
			font-size: 14px;
			.with-newline {
				white-space: pre-line;
			}
		}
		
		.button-group {
			display: flex;
			gap: 10px;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-top: 16px;
			.agree-btn {
				width: 60%;
				height: 44px;
				line-height: 44px;
				border-radius: 5px;
				color: #ffffff;
				font-size: 15px;
				background: #FD7031;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		  
			.disagree-btn {
				background: #f5f5f5;
				color: #666;
				font-size: 15px;
			}
		}
	}
}

.other-login-section {
	margin-top: 20rpx;
	text-align: center;
}

.other-login-title {
	display: block;
	font-size: 28rpx;
	color: #909399;
	margin-bottom: 30rpx;
}

.other-login-icons {
	display: flex;
	justify-content: center;
	gap: 60rpx;
}

.login-icon {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.icon-img {
	width: 70rpx;
	height: 70rpx;
	margin-bottom: 10rpx;
}

.icon-text {
	font-size: 24rpx;
	color: #606266;
}
</style>