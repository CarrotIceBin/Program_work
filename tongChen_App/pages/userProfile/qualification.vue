<template>
	<view class="page">
		<!-- 备案号卡片 -->
		<view class="card">
			<view class="info-row">
				<text class="label">APP备案号</text>
				<text class="value">鄂ICP备2026019435号-2A</text>
			</view>
		</view>

		<!-- 许可证卡片 -->
		<view class="card">
			<view class="info-row">
				<text class="label">增值电信业务许可证</text>
			</view>
			<view class="license-image">
				<image src="/static/index/munications.jpg" mode="widthFix" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {};
	},
	onLoad() {},
	methods: {}
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
	padding: 16px;
	margin-bottom: 12px;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	
	.label {
		font-size: 15px;
		color: #1a1a1a;
	}
	
	.value {
		font-size: 14px;
		color: #999;
	}
}

.license-image {
	margin-top: 12px;
	
	image {
		width: 100%;
		border-radius: 8px;
	}
}
</style>