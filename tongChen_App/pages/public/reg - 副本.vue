<template>
	<view class="container">
		<!-- <view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view> -->
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<!-- <view class="left-top-sign">LOGIN</view> -->
			<view class="welcome">
				欢迎注册同城交友
			</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">手机号码</text>
					<input class="biaoti" v-model="phoneno" type="number" maxlength="11" placeholder="请输入手机号" />
				</view>
				<view class="input-item">
					<text class="tit">用户名</text>
					<input class="biaoti" v-model="username" type="text" maxlength="11" placeholder="请输入用户名" />
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input class="biaoti" v-model="password" type="text" maxlength="32" placeholder="请设置密码" :password="!showPassword" />
				</view>
				<!-- <view class="input-item">
					<text class="tit">验证码</text>
					<input class="biaoti" v-model="code" type="number" maxlength="7" placeholder="请输入动态验证码" />
					<view class="yzm" :class="{ yzms: second>0 }" @tap="getcode">{{yanzhengma}}</view>
				</view>
				<view class="input-item">
					<text class="tit">邀请码</text>
					<input class="biaoti" v-model="invitation" type="text" maxlength="7" placeholder="请输入邀请码(可为空)" />					
				</view> -->			
			</view>
			<button class="confirm-btn" @click="bindLogin">注册</button>						
		</view>
		
		<view class="register-section">
			已有账号?
			<text @click="toRegist">去登入</text>
		</view>
	</view>
</template>

<script>
	var tha,js;
	
	export default{
		data(){
			return {
				username:'',
				phoneno:'',
				password:'',
				code:'999999',
				invitation:'0001',
				xieyi: true,
				showPassword: false,
				second: 0
			}
		},
		computed:{
			yanzhengma(){
				if(this.second==0){
					return '获取验证码';
				}else{
					if(this.second<10){
						return '重新获取0'+this.second;
					}else{
						return '重新获取'+this.second;
					}
				}
			}
		},
		onLoad() {
			
			// setTimeout(()=>{
			// 	uni.switchTab({
			// 	  url: '/pages/user/user'
			// 	})
			// }, 1000)
			
		},

		methods: {
			
			display() {
			    this.showPassword = !this.showPassword
			},
			xieyitong(){
				this.xieyi = !this.xieyi;
			},
			getcode(){
				var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
				if(this.second>0){
					return;
				}				
				
				if(!myreg.test(this.phoneno)){
					uni.showToast({
					    icon: 'none',
					    title: '请输入正确的手机号'
					});
					return
				}
				this.second = 60;	
				this.$http("codeForReg",JSON.stringify({
					mobile: this.phoneno			
					})).then(res=>{
						if(res.status != 0){
							this.second =0;
							uni.showToast({title: res.msg, icon:'none'});
						}else{							
							uni.showToast({title: res.msg});
							js = setInterval(function(){
								tha.second--;
								if(tha.second==0){
									clearInterval(js)
								}
							},3000)												
						}
					}).catch(err=>{
						console.log(err);
					})
			},
		    bindLogin() {	
				let fkyz=/[^(^\s*)|(\s*$)]/;
				var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
				if (!myreg.test(this.phoneno)) {
				    uni.showToast({
				        icon: 'none',
				        title: '手机号不正确'
				    });
				    return;
				}
				if (!fkyz.test(this.username)) {
				    uni.showToast({
				        icon: 'none',
				        title: '用户名不能为空'
				    });
				    return;
				}
				
		        if (this.password.length < 6) {
		            uni.showToast({
		                icon: 'none',
		                title: '密码不能少于6位'
		            });
		            return;
		        }			
				
				if (this.password.length > 16) {
				    uni.showToast({
				        icon: 'none',
				        title: '密码不能大于16位'
				    });
				    return;
				}
				
				if (!fkyz.test(this.code)) {
				    uni.showToast({
				        icon: 'none',
				        title: '验证码不能为空'
				    });
				    return;
				}
																			
				this.$http("userReg",JSON.stringify({
					userid: this.phoneno,
					userName: this.username,
					mobile: this.phoneno,
					pwdLogin:this.password,
					valicode:this.code,
					userCode:this.invitation			
					})).then(res=>{
						
						if(res.code!=0){
							uni.showToast({title:res.msg,icon:'none'});								
						}else{
							uni.showToast({title:res.msg});	
							uni.setStorage({ key: 'token', data: res.data })
														
							setTimeout(()=>{
								uni.switchTab({
								  url: '/pages/user/user'
								})
							}, 1000)
						}
					}).catch(err=>{
						console.log(err);
					})												
		    },
			
			navBack(){
				uni.navigateBack();
			},
			
			getQueryParams (queryString) {
			    // 微信扫码得到的内容进行了一次编码，所以官方要求需要进行decodeURIComponent一次
				var params = ''
				
				if(queryString!=undefined){
					let url = decodeURIComponent(queryString)
					params = url.substring(url.length-4)
					
					if(params.length!=4){
						params = ''
					}	
				}
							
			   
			    return params
			},
			
			toRegist(){
				uni.navigateTo({
					url: '/pages/public/loginPwd'
				})
			}
		}

	}
</script>

<style lang='scss'>
	page{
		background: #fff;
	}
	.container{
		padding-top: 100px;
		position:relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}
	.wrapper{
		position:relative;
		z-index: 90;
		background: #fff;
		/* padding-bottom: 40upx; */
	}
	.back-btn{
		position:absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}
	.left-top-sign{
		font-size: 80upx;
		color: $page-color-base;
		position:relative;
		left: -16upx;
	}
	.right-top-sign{
		position:absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;
		&:before, &:after{
			display:block;
			content:"";
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}
		&:before{
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}
		&:after{
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
			/* background: pink; */
		}
	}
	.left-bottom-sign{
		position:absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}
	.welcome{
		position:relative;
		left: 50upx;
		/* top: -90upx; */
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0,0,0,.3);
		margin-bottom: 40rpx;
	}
	.input-content{
		padding: 0 60upx;
	}
	.input-item{
		display:flex;
		flex-direction: column;
		align-items:flex-start;
		justify-content: center;
		padding: 0 30upx;
		background:$page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 20upx;
		&:last-child{
			margin-bottom: 0;
		}
		.tit{
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}
		input{
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}	
	}
	.yzm {
		margin-left: 424rpx;
		margin-top: -75rpx;
		z-index: 2;
		color: #FF7D13;
		font-size: 24upx;
		line-height: 64upx;
		padding-left: 10upx;
		padding-right: 10upx;
		width:auto;
		height:64upx;
		border:1upx solid #FFA800;
		border-radius: 50upx;
	}
	.yzms {
		color: #999999 !important;
		border:1upx solid #999999;
	}

	.confirm-btn{
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 50upx;
		background: $uni-color-primary;
		color: #fff;
		font-size: $font-lg;
		&:after{
			border-radius: 100px;
		}
	}
	.forget-section{
		font-size: $font-sm+2upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 40upx;
	}
	.register-section{
		font-size: 35rpx;
		color: $font-color-base;
		text-align: right;
		margin: 20rpx 80rpx 0 0;
		text{
			color: #FF7D13;
			margin-left: 10upx;
		}
		
	}
	
</style>
