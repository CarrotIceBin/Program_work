<template>
	<view class="login-container">
		<!-- 背景装饰元素 -->
		<view class="left-bottom-sign"></view>
		<view class="right-top-sign"></view>
		
		<!-- 头部区域 -->
		<view class="header" :style="headerStyle" @click="handleBack">
			<view class="back-btn">
				<uni-icons class="back-icon" type="back" size="24"></uni-icons>
				<text class="title">登录</text>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content" :style="mainContentStyle">
			<view class="logo-text"></view>
			<!-- 协议勾选 -->
			<view class="agreement-section">
				<label class="agreement-checkbox">
					<checkbox-group @change="handleAgreementChange">
						<checkbox value="1" :checked="isAgreed" color="#FD7031" />
					</checkbox-group>
				</label>
				<view class="agreement-text">
					阅读并同意
					<text class="agreement-link" @click="openWebPage('yongHuXieYi')">《用户协议》</text>
					<text class="agreement-link" @click="openWebPage('yinSiXieYi')">《隐私政策》</text>
				</view>
			</view>
			<!-- 手机号快捷登录 -->
			<button class="quick-login-btn" open-type="getPhoneNumber" @click="handlePhoneNumberAuth">微信登录</button>
			<!-- 其他登录方式 -->
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
				<view class="share-title">用户帐号</view>
				<input class="popup_index" type="number" v-model="userID" placeholder="请输入用户帐号(手机号码)" maxlength="11" />
				<view class="button-group">
				    <view class="disagree-btn disagre-agree" @click="handleDisagree">取消</view>
				    <view class="agree-btn disagre-agree" @click="handleAgree">确定</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			lastAuthCode: '',
			userCode: "",
			userOpenID: "",
			userID: "",
			regFlid: "1",
			headerStyle: "",
			mainContentStyle: "",
			isAgreed: false,
			loginMethodData: [
				{ methodID: 1, methodName: "手机号码", image: "/static/public/mobile.png" },
				// { methodID: 2, methodName: "验证码", image: "/static/public/auth_code.png" }
			]
		}
	},
	onLoad(options) {
		this.calculateHeaderPosition()
		this.initUserCode(options)
	},
	methods: {
		calculateHeaderPosition() {
			// 设置头部样式
			this.headerStyle = `
				top: 10px;
				line-height: 100px;
			`;
		
			// 设置主要内容区域的上边距，避免被头部遮挡
			this.mainContentStyle = `padding-top: 100px;`;
		},
		initUserCode(options) {
			if (options.q) {
				this.userCode = this.parseQueryParams(options.q)
			} else if (options.userCode) {
				this.userCode = options.userCode
			} else if (uni.getStorageSync("userCode")) {
				this.userCode = uni.getStorageSync("userCode")
				this.regFlid = "3"
			}
		},
		async handlePhoneNumberAuth(e) {
			if (!this.isAgreed) {
				uni.showToast({ title: '请先同意用户协议', icon: 'none' })
				return;
			}
			
			this.initWechatAuth()
		},
		async initWechatAuth() {
			// #ifndef H5
			try {
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						onlyAuthorize: true,
						success: resolve,
						fail: reject
					})
				})
				if (loginRes.code) {
					this.lastAuthCode = loginRes.code
					this.openidForApp()
				} else {
					console.error('未获取到code', loginRes)
				}
			} catch (error) {
				console.error('初始化失败:', error)
			}
			// #endif
			// #ifdef H5
			uni.showToast({ title: '该平台不支持快捷登录', icon: 'none' })
			// #endif
		},
		openidForApp(){
			this.$http('getOpenidForApp', JSON.stringify({
				code: this.lastAuthCode
			})).then(res => {
				if (res.code == 0) {
					this.userOpenID = res.data
					this.userOpenidLogin();
				} else {
					uni.showToast({ title: res.msg, icon: 'none' })
				}
			}).catch(err => {
				console.error('登录失败:', err);
			})
		},
		userOpenidLogin(){
			this.$http('userOpenidLogin', JSON.stringify({
				openID: this.userOpenID,
			})).then(res => {
				if (res.code == 0) {
					this.handleLoginSuccess(res, 1)
				} else {
					this.$refs.popup.open();
					// uni.showToast({ title: res.msg, icon: 'none' })
				}
			}).catch(err => {
				console.error('登录失败:', err);
			})
		},
		wxOpenidUserid(){
			this.$http('wxOpenidBindUserid', JSON.stringify({
				openID: this.userOpenID,
				userid: this.userID
			})).then(res => {
				if (res.code == 0) {
					this.handleLoginSuccess(res, 2)
				} else {
					this.userID = "";
					uni.showToast({ title: res.msg, icon: 'none' })
				}
			}).catch(err => {
				console.error('登录失败:', err);
			})
		},

		/**
		 * 处理登录成功
		 */
		async handleLoginSuccess(loginRes, index) {
			if(index == 1){
				uni.setStorageSync('userid', loginRes.data)
				uni.setStorageSync('token', loginRes.dataExtend)
			} else {
				uni.setStorageSync('userid', this.userID)
				uni.setStorageSync('token', loginRes.dataExtend)
				this.userID = "";
			}

			// 清理旧的用户编码
			if (this.regFlid == "3") {
				uni.removeStorageSync('userCode')
			}

			uni.showToast({ title: '登录成功', icon: 'none' })

			// 跳转到首页
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}, 500)
		},

		/**
		 * 获取用户信息
		 */
		async fetchUserInfo() {
			try {
				const res = await this.$http("userInfo", {
					token: uni.getStorageSync("token")
				})

				if (res.code == 0 && res.userInfo) {
					uni.setStorageSync('userCode', res.userInfo.userCode)
				}
			} catch (error) {
				console.error('获取用户信息失败:', error)
			}
		},

		/**
		 * 处理协议勾选
		 */
		handleAgreementChange(e) {
			this.isAgreed = e.detail.value.includes('1')
		},
		async openWebPage(cfgKey) {
			try {
				const res = await this.$http("systemCfgInfoClient", {
					token: uni.getStorageSync("token") || '',
					cfgKey
				})
		
				if (res.code == 0 && res.systemCfgInfo) {
					this.navigateToPage(res.systemCfgInfo.cfgValue)
				}
			} catch (error) {
				console.error('打开协议页面失败:', error)
				uni.showToast({ title: '打开协议失败', icon: 'none' })
			}
		},
		navigateToPage(url) {
			if (!url) return;

			if (/^\/pages(Sub)?/.test(url)) {
				uni.navigateTo({ url })
			} else if (url.startsWith('http')) {
				uni.navigateTo({
					url: `/pages/other/web?u=${encodeURIComponent(url)}`
				})
			}
		},
		parseQueryParams(queryString) {
			if (!queryString) return ''

			try {
				const decodedUrl = decodeURIComponent(queryString)
				const params = decodedUrl.substring(decodedUrl.indexOf('=') + 1)
				return params ? params : ''
			} catch (error) {
				console.error('解析参数失败:', error)
				return ''
			}
		},
		handleBack() {
			uni.switchTab({
				url: "/pages/index/index"
			})
		},
		switchLoginMethod(methodID){
			if (methodID == 1) {
				uni.navigateTo({
					url: '/pages/public/loginPwd'
				})
			} else if (methodID == 2) {
				uni.navigateTo({
					url: '/pages/public/phonLogin'
				});
			}
		},
		handleAgree(){
			this.$refs.popup.close();
			this.wxOpenidUserid();
		},
		handleDisagree(){
			this.$refs.popup.close();
			this.userID = "";
		},
	}
}
</script>

<style scoped lang="scss">
.login-container {
	background: #ffffff;
	width: 100vw;
	height: 100vh;
	position: relative;
	overflow: hidden;
}

/* 背景装饰元素 */
.right-top-sign {
	position: absolute;
	top: 80rpx;
	right: -30rpx;
	z-index: 1;
	opacity: 0.6;
}

.right-top-sign:before,
.right-top-sign:after {
	content: '';
	display: block;
	width: 400rpx;
	height: 80rpx;
	background: #b4f3e2;
}

.right-top-sign:before {
	transform: rotate(50deg);
	border-radius: 0 50px 0 0;
}

.right-top-sign:after {
	position: absolute;
	right: -198rpx;
	top: 0;
	transform: rotate(-50deg);
	border-radius: 50px 0 0 0;
}

/* 头部区域 */
.header {
	position: fixed;
	left: 0;
	right: 0;
	z-index: 100;
	padding: 0 20rpx;
}

.back-btn {
	display: flex;
	align-items: center;
	font-size: 36rpx;
	color: #303133;
}

.back-icon {
	margin-right: 10rpx;
}

.title {
	font-size: 40rpx;
}

/* 主要内容区域 */
.main-content {
	margin: 0 40rpx;
	position: relative;
	z-index: 5;
	text-align: center;
}

.logo-text {
	font-size: 120rpx;
	color: #f8f8f8;
	font-weight: 800;
	text-align: center;
	margin-bottom: 100rpx;
	letter-spacing: 8rpx;
}

/* 按钮样式优化 */
.quick-login-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 10rpx;
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	background: #00c375;
	border: none;
	margin: 0 auto;
}

.quick-login-btn[disabled] {
	background: #c0c4cc;
	transform: none;
}

/* 其他登录方式 */
.other-login-section {
	margin-top: 60rpx;
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

/* 用户协议区域优化 */
.agreement-section {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	color: #666;
	font-size: 28rpx;
	text-align: left;
}

.agreement-checkbox {
	margin-right: 10rpx;
}

.agreement-text {
	font-size: 28rpx;
	color: #666;
	flex: 1;
	line-height: 1.5;
}

.agreement-link {
	color: #FD7031;
	font-size: 28rpx;
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
		width: 370px;
		
		.share-title {
			text-align: center;
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 10px;
		}
		
		.popup_index {
			height: 80rpx;
			border: 1rpx solid #e5e5e5;
			border-radius: 8rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			margin-bottom: 30rpx;
			box-sizing: border-box;
		}
		
		.button-group {
			display: flex;
			gap: 10px;
			justify-content: center;
			align-items: center;
			margin-top: 16px;
			.agree-btn {
				color: #ffffff;
				background: #FD7031;
			}
		  
			.disagree-btn {
				background: #f5f5f5;
				color: #666;
			}
			
			.disagre-agree{
				font-size: 15px;
				width: 50%;
				height: 44px;
				display: flex;
				align-items: center;
				justify-content: center;
				line-height: 44px;
				border-radius: 5px;
			}
		}
	}
}
</style>