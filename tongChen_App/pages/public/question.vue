<template>
	<view class="container">
		<view class="form-container">
			<!-- 当需要验证账号时，显示账号输入框 -->
			<view class="form-item" v-if="isQuestion == 1">
				<view class="label">手机号码</view>
				<input class="input" type="text" v-model="userid" placeholder="请输入手机号码" maxlength="11" />
			</view>

			<!-- 动态渲染密保问题列表 -->
			<block v-for="(item, index) in selectQuestionData" :key="index">
				<view class="form-item">
					<view class="label">{{ item.selectTxt }}</view>
					<input class="input" type="text" v-model="questionInfo[item.selectValue]" :placeholder="'请输入密保答案'" maxlength="50" />
				</view>
			</block>
			<view class="form-text" v-if="isIndex == 1">注意：如果密保错误,将失去该号,请谨慎填写</view>

			<view class="confirm-btn" @click="handleConfirm">确认</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isIndex: 0,
			isQuestion: 0,
			token: '',
			userid: '',
			questionInfo: {},
			selectQuestionData: []
		};
	},
	onLoad(options) {
		const { token, isIndex, isQuestion } = options;
		this.token = token || '';
		this.isIndex = isIndex || 0;
		this.isQuestion = parseInt(isQuestion) || 0;

		this.selectItemQuestion();
	},
	methods: {
		selectItemQuestion() {
			this.$http('selectItemExtClient', JSON.stringify({
				tag: 'question',
				para: 0,
				token: this.token
			})).then((res) => {
				if (res.code == 0) {
					this.selectQuestionData = res.itemList || [];
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('获取密保问题失败:', err);
			});
		},

		// 统一处理确认点击
		handleConfirm() {
			if (!this.checkAnswersComplete()) return;

			if (this.isQuestion == 1) {
				if (!this.userid) {
					uni.showToast({ title: '请输入手机号码', icon: 'none' });
					return;
				}
				this.questionCheck();
			} else {
				this.questionClick();
			}
		},

		checkAnswersComplete() {
			for (let item of this.selectQuestionData) {
				const answer = this.questionInfo[item.selectValue];
				if (!answer || answer.trim() == '') {
					uni.showToast({ title: `请输入密保答案`, icon: 'none' });
					return false;
				}
			}
			return true;
		},

		questionClick() {
			this.$http('userPwdQuestionSet', JSON.stringify({
				answer1: this.questionInfo[1],
				answer2: this.questionInfo[2],
				answer3: this.questionInfo[3],
				answer4: this.questionInfo[4],
				answer5: this.questionInfo[5],
				token: this.token
			})).then((res) => {
				if (res.code == 0) {
					uni.showToast({ title: res.msg, icon: 'none' });
					
					setTimeout(()=>{
						uni.redirectTo({
							url: '/pages/public/loginPwd'
						})
					}, 1000)
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('密保验证失败:', err);
			});
		},

		questionCheck() {
			this.$http('userPwdQuestionCheck', JSON.stringify({
				answer1: this.questionInfo[1],
				answer2: this.questionInfo[2],
				answer3: this.questionInfo[3],
				answer4: this.questionInfo[4],
				answer5: this.questionInfo[5],
				userid: this.userid
			})).then((res) => {
				if (res.code == 0) {
					uni.redirectTo({
						url: '/pages/public/pwdResetCheck?token=' + res.data
					});
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('账号密保验证失败:', err);
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
	padding: 40rpx 20rpx;
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
.form-text{
	font-weight: bold;
	color: #ff0000;
}
</style>
