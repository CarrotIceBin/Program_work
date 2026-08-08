<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	page {
		background-color: #f5f6fa;
		font-family: -apple-system, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
		font-size: 28rpx;
		color: #333;
		-webkit-font-smoothing: antialiased;
	}

	.container {
		padding: 24rpx;
		padding-bottom: 60rpx;
	}

	.card {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.flex-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.flex-between {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.flex-col {
		display: flex;
		flex-direction: column;
	}

	.text-muted {
		color: #999;
		font-size: 24rpx;
	}

	.text-primary {
		color: #3a7afe;
	}

	.text-danger {
		color: #ee0a24;
	}

	.text-success {
		color: #07c160;
	}

	.text-warning {
		color: #ff976a;
	}

	.mt-sm {
		margin-top: 12rpx;
	}

	.mt-md {
		margin-top: 24rpx;
	}

	.mt-lg {
		margin-top: 40rpx;
	}

	.empty {
		text-align: center;
		padding: 100rpx 0;
		color: #bbb;
		font-size: 26rpx;
	}

	/* 表单 - 上下布局 */
	.form-group {
		background-color: #fff;
		padding: 24rpx 28rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-group:last-child {
		border-bottom: none;
	}

	.form-label {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 12rpx;
		display: block;
	}

	.form-label-required::after {
		content: ' *';
		color: #ee0a24;
	}

	.form-input {
		font-size: 30rpx;
		color: #1a1a1a;
		width: 100%;
	}

	.form-input-placeholder {
		color: #bbb;
	}

	/* 按钮 */
	.btn-primary {
		background: linear-gradient(135deg, #3a7afe, #5b9bff);
		color: #fff;
		border-radius: 48rpx;
		text-align: center;
		padding: 26rpx 0;
		font-size: 32rpx;
		font-weight: 600;
		margin-top: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(58, 122, 254, 0.3);
	}

	.btn-primary:active {
		opacity: 0.85;
		transform: scale(0.98);
	}

	.btn-success {
		background: linear-gradient(135deg, #07c160, #2dd47a);
		color: #fff;
		border-radius: 48rpx;
		text-align: center;
		padding: 26rpx 0;
		font-size: 32rpx;
		font-weight: 600;
		margin-top: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
	}

	.btn-danger {
		color: #ee0a24;
		font-size: 28rpx;
		text-align: center;
		padding: 20rpx 0;
	}

	/* 标签 tag */
	.tag {
		display: inline-block;
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}

	.tag-blue {
		background-color: #e8f3ff;
		color: #3a7afe;
	}

	.tag-green {
		background-color: #e6f9f0;
		color: #07c160;
	}

	.tag-red {
		background-color: #fff0ed;
		color: #ee0a24;
	}

	.tag-orange {
		background-color: #fff5e6;
		color: #ff976a;
	}

	/* 分割线 */
	.divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 20rpx 0;
	}

	/* 圆角头像/图标容器 */
	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-weight: 700;
		font-size: 32rpx;
	}
</style>
