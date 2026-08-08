<template>
	<view class="container">
		<view class="wrapper">
			<view class="input-content">
				<view class="input-item">
					<input class="biaoti" v-model="phoneno" type="number" maxlength="11" placeholder="请输入手机号" />
				</view>
				<view class="input-item1">
					<input class="biaoti" v-model="valiCode" type="number" maxlength="7" placeholder="请输入动态验证码" />
					<view class="yzm" :class="{ yzms: second > 0 }" @tap="getcode">{{yanzheng}}</view>
				</view>
			</view>
			
			<button class="confirm-btn" @click="toLogin">登录</button>
			
			<view class="cbtn">
				<label class="radio">
					<checkbox-group @change="checkboxChange">
						<checkbox value="1" :checked="check" />
					</checkbox-group>
				</label>
				阅读并同意
				<text class="yhxy" @click="openweb('yongHuXieYi')">《用户协议》</text>
				<text class="yhxy" @click="openweb('yinSiXieYi')">《隐私政策》</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			phoneno: '',
			valiCode: '',
			second: 0,
			js: 0,
			yqmsm: '',
			yanzheng: '',
			check: false
		}
	},
	onLoad(){
		this.yanzhengma()
	},
	onUnload() {
		clearInterval(this.js);
		this.second = 0;
	},
	methods: {
		yanzhengma() {
			if (this.second == 0) {
				this.yanzheng = '获取验证码'
				return false;
			} else {
				if (this.second < 10) {
					this.yanzheng = '重新获取0' + this.second
					return false;
				} else {
					this.yanzheng = '重新获取' + this.second
					return false;
				}
			}
		},
		getcode() {
			var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
			
			if (this.second > 0) {
				return false
			}
			
			if (this.phoneno == '') {
				uni.showToast({ title: '手机号码不能为空', icon: 'none' });
				return false
			}
		
			if (!myreg.test(this.phoneno)) {
				uni.showToast({ title: '请输入正确的11位手机号码', icon: 'none' });
				return false
			}
			
			this.second = 60;
			this.$http("valicodeForLogin", JSON.stringify({
				mobile: this.phoneno
			})).then(res => {
				if (res.code == 0) {
					this.js = setInterval(this.secondDesc, 3000);
				} else {
					this.second = 0;
				}
				
				uni.showToast({ title: res.msg, icon: 'none'});
			}).catch(err => {
				console.log(err);
			})
		},
		secondDesc(){
			this.second --
			
			if (this.second == 0) {
				clearInterval(this.js);
			}
		},
		checkboxChange(e) {
			if(e.detail.value == '1'){
				this.check = true
			} else {
				this.check = false
			}		
		},
		toLogin() {
			if(this.phoneno == ''){
				uni.showToast({ title: '登陆帐号不能为空', icon: 'none'})
				return false
			}
			
			if(this.valiCode == ''){
				uni.showToast({ title: '验证码不能为空', icon: 'none'})
				return false
			}
			
			if (this.check == false){
				uni.showToast({ title: '请勾选是否同意服务协议', icon: 'none' })
				return false
			}
			
			clearInterval(this.js);
			this.$http('userLoginBySms', JSON.stringify({
				userid: this.phoneno,
				valicode: this.valiCode
			})).then(res => {
				if (res.code == 0) {
					uni.setStorage({ key: 'userid', data: this.phoneno })
					uni.setStorage({ key: 'token', data: res.data })
					
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}, 500)
				}
				uni.showToast({ title: res.msg, icon: 'none'})
			}).catch(err => {
				console.log(err)
			})
		},
		openweb(cfgKey) {
			this.$http("systemCfgInfoClient", JSON.stringify({
				token: uni.getStorageSync("token") || '',
				cfgKey: cfgKey
			})).then(res =>{
				let cfgValue = res.systemCfgInfo.cfgValue
				
				if(cfgValue){
					if(cfgValue.slice(0, 6) == '/pages'){
						uni.navigateTo({
							url: cfgValue
						})
					} else if(cfgValue.slice(0, 4) == 'http') {
						uni.navigateTo({
							url: '/pages/public/web?u=' + cfgValue
						})
					}
				}
			}).catch(err=>{
				console.log(err);
			})
		}
	}
}
</script>

<style scoped lang="scss">
.container {
	padding-top: 280upx;
}
.wrapper{
	position: relative;
	z-index: 90;
	background: #fff;
	padding: 0 40upx;
}

.input-item{
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 0 20upx;
	background: #ebebeb;
	height: 80upx;
	border-radius: 4px;
	margin-bottom: 30upx;
	.biaoti{
		font-size: 30upx;
	}
}

.input-item1{
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	background: #ebebeb;
	height: 80upx;
	border-radius: 8upx;
	margin-bottom: 30upx;
	.biaoti{
		font-size: 30upx;
	}
	
	.yzm{
		z-index: 2;
		color: #FFFFFF;
		font-size: 24upx;
		border-radius: 0 8upx 8upx 0;
		background: #e64340;
		height: 100%;
		display: flex;
		align-items: center;
		padding: 0 20upx;
	}
	
	.yzms{
		border: 1upx solid #999999;
	}
}

.confirm-btn{
	height: 80upx;
	line-height: 80upx;
	color: #FFFFFF;
	font-size: 30upx;
	margin-top: 40px;
	background: #00aa7f;
}
.forget-section{
	font-size: 30upx;
	color: #00aa7f;
	float: right;
}
.xypwd{
	font-size: 28upx;
	padding-top: 20upx;
}
.yhxy{
	color: #1492e6;
}
.cbtn{
	font-size: 28upx;
	padding-top: 20px;

	.radio{
		display: block;
		float: left;
	}
}
</style>
