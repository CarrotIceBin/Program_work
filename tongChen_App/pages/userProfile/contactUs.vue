<template>
	<view class="page">
		<view class="card">
			<view class="contact-row" v-for="item in contactList" :key="item.label" @click="handleContactClick(item)">
				<text class="label">{{ item.label }}</text>
				<view class="row-right">
					<text class="value">{{ item.value }}</text>
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			contactList: [
				{ label: '技术邮箱', value: '582477690@qq.com', type: 'email' },
				{ label: '投诉邮箱', value: '582477690@qq.com', type: 'email' },
				{ label: '资金邮箱', value: '632668435@qq.com', type: 'email' },
				// { label: '电话', value: '17666666666', type: 'phone' }
			]
		};
	},
	onLoad() {},
	methods: {
		handleContactClick(item) {
			if (item.type == 'email') {
				// 复制邮箱
				uni.setClipboardData({
					data: item.value,
					success: () => {
						uni.showToast({ title: '已复制', icon: 'none' });
					}
				});
			} else if (item.type == 'phone') {
				// 拨打电话
				uni.makePhoneCall({
					phoneNumber: item.value,
					fail: () => {
						uni.showToast({ title: '无法拨打电话', icon: 'none' });
					}
				});
			}
		}
	}
};
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
}

.contact-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 16px;
	border-bottom: 1px solid #f5f5f5;
	
	&:last-child {
		border-bottom: none;
	}
	
	.label {
		font-size: 15px;
		color: #1a1a1a;
	}
	
	.row-right {
		display: flex;
		align-items: center;
		gap: 4px;
		
		.value {
			font-size: 14px;
			color: #999;
		}
	}
}
</style>