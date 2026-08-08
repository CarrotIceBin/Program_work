<template>
	<view class="username">
		<view class="updatePassword_item b-b">
			<text class="item_texe">昵称</text>
			<input class="item_input" v-model="userName" placeholder="请输入昵称" maxlength="20"/>
		</view>
		
		<view class="username_title">设置后，其他人将看到你的昵称</view>
		
		<button class="add-btn" @click="username">确定提交</button>
	</view>
</template>

<script>
export default{
	data(){
		return{
			userName: ''
		}
	},
	onLoad(option){
		this.userName = option.nickname
	},
	methods: {
		username(){
			this.$http("usernameUpd", JSON.stringify({
				token: uni.getStorageSync("token"),
				userName: this.userName,
			})).then(res => {
				if (res.code == 0) {
					setTimeout(() => {
						let pages = getCurrentPages();
						let prevPage = pages[ pages.length - 2 ];
						
						uni.navigateBack({
							delta: 1
						})
					}, 500)
				}
				uni.showToast({ title: res.msg, icon: 'none'})
			}).catch(err => {
				console.log(err);
			})
		}
	}
}
</script>

<style scoped lang="scss">
.username{
	background-color: #F0F0F0F0;
	padding-top: 20rpx;
	min-height: 100vh;
	touch-action: none;
}
.updatePassword_item {
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 10rpx;
	height: 110rpx;
	background: #fff;
	padding: 0 30rpx;

	.item_texe {
		flex-shrink: 0;
		width: 250rpx;
		font-size: 32rpx;
		color: #303133;
	}

	.item_input {
		flex: 1;
		font-size: 32rpx;
		color: #303133;
	}

	.icon-shouhuodizhi {
		font-size: 36rpx;
		color: #303133;
	}
}
.username_title{
	font-size: 30rpx;
	padding: 20rpx 30rpx 0;
	color: #a5a5a5;
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690rpx;
	height: 88rpx;
	margin: 60rpx auto;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10rpx;
	background: #FD7031;
}
</style>