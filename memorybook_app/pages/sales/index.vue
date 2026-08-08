<template>
	<view class="container">
		<view class="summary-bar">
			<view class="summary-item">
				<view class="summary-num text-primary">¥{{ formatMoney(totalAmount) }}</view>
				<view class="summary-label">累计销售额</view>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<view class="summary-num">{{ list.length }}</view>
				<view class="summary-label">销售笔数</view>
			</view>
		</view>

		<view class="record-card" v-for="s in list" :key="s.id" @click="edit(s.id)">
			<view class="record-bar record-bar--sale"></view>
			<view class="record-body">
				<view class="flex-between">
					<view class="goods-name">{{ s.productName || '（商品已删除）' }}</view>
					<view class="amount text-primary">+¥{{ formatMoney(s.totalAmount) }}</view>
				</view>
				<view class="record-meta">
					<text class="meta-item">📅 {{ s.saleDate }}</text>
					<text class="meta-item">👤 {{ s.customer || '散客' }}</text>
					<text class="meta-item">×{{ s.quantity }} {{ unitOf(s.productId) }}</text>
				</view>
				<view class="customer-info" v-if="s.phone || s.address">
					<view class="info-item" v-if="s.phone">📱 {{ s.phone }}</view>
					<view class="info-item" v-if="s.address">📍 {{ s.address }}</view>
				</view>
				<view class="remark-line" v-if="s.remark">
					<text class="remark-tag">备注</text>
					<text class="remark-text">{{ s.remark }}</text>
				</view>
				<view class="record-footer">
					<text class="text-muted">单价 ¥{{ formatMoney(s.unitPrice) }}</text>
				</view>
			</view>
		</view>

		<view class="empty" v-if="!list.length">
			<text class="empty-emoji">📝</text>
			<view class="empty-text">暂无销售记录</view>
			<view class="empty-hint">点击右下角按钮添加</view>
		</view>

		<view class="fab" @click="edit()">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script>
	import { getSales, getProductById, formatMoney } from '@/utils/storage.js';

	export default {
		data() {
			return {
				list: [],
				totalAmount: 0
			};
		},
		onShow() {
			this.list = getSales();
			this.totalAmount = this.list.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
		},
		methods: {
			formatMoney,
			unitOf(productId) {
				const p = getProductById(productId);
				return p ? (p.unit || '件') : '件';
			},
			edit(id) {
				const url = id ? `/pages/sales/edit?id=${id}` : '/pages/sales/edit';
				uni.navigateTo({ url });
			}
		}
	};
</script>

<style scoped>
	.summary-bar {
		display: flex;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 32rpx 0;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.summary-item {
		flex: 1;
		text-align: center;
	}

	.summary-divider {
		width: 1rpx;
		background-color: #f0f0f0;
	}

	.summary-num {
		font-size: 40rpx;
		font-weight: 700;
		color: #1a1a1a;
	}

	.summary-label {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.record-card {
		background-color: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}

	.record-bar {
		width: 8rpx;
		flex-shrink: 0;
	}

	.record-bar--sale {
		background: linear-gradient(180deg, #3a7afe, #5b9bff);
	}

	.record-body {
		flex: 1;
		padding: 24rpx 28rpx;
	}

	.goods-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #1a1a1a;
	}

	.amount {
		font-size: 36rpx;
		font-weight: 700;
	}

	.record-meta {
		display: flex;
		flex-wrap: wrap;
		margin-top: 12rpx;
		gap: 16rpx;
	}

	.meta-item {
		font-size: 24rpx;
		color: #666;
		margin-right: 16rpx;
	}

	.customer-info {
		margin-top: 12rpx;
		padding: 16rpx 20rpx;
		background-color: #f8f9fc;
		border-radius: 12rpx;
	}

	.info-item {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 6rpx;
	}

	.info-item:last-child {
		margin-bottom: 0;
	}

	.remark-line {
		display: flex;
		align-items: flex-start;
		margin-top: 12rpx;
	}

	.remark-tag {
		font-size: 22rpx;
		color: #999;
		background: #f5f5f5;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-right: 12rpx;
		flex-shrink: 0;
	}

	.remark-text {
		font-size: 26rpx;
		color: #666;
		flex: 1;
	}

	.record-footer {
		margin-top: 12rpx;
		padding-top: 12rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.fab {
		position: fixed;
		right: 40rpx;
		bottom: 60rpx;
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3a7afe, #5b9bff);
		color: #fff;
		text-align: center;
		line-height: 110rpx;
		box-shadow: 0 8rpx 28rpx rgba(58, 122, 254, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fab:active {
		transform: scale(0.95);
	}

	.fab-icon {
		font-size: 64rpx;
		font-weight: 300;
		line-height: 1;
	}

	.empty-emoji {
		font-size: 64rpx;
		display: block;
		margin-bottom: 16rpx;
	}

	.empty-text {
		font-size: 30rpx;
		color: #999;
	}

	.empty-hint {
		font-size: 24rpx;
		color: #ccc;
		margin-top: 8rpx;
	}
</style>
