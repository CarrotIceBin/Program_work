<template>
	<view class="container">
		<view class="summary-bar">
			<view class="summary-item">
				<view class="summary-num text-danger">¥{{ formatMoney(totalCost) }}</view>
				<view class="summary-label">累计进货成本</view>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<view class="summary-num">{{ list.length }}</view>
				<view class="summary-label">进货笔数</view>
			</view>
		</view>

		<view class="record-card" v-for="p in list" :key="p.id" @click="edit(p.id)">
			<view class="record-bar record-bar--purchase"></view>
			<view class="record-body">
				<view class="flex-between">
					<view class="goods-name">{{ p.productName || '（商品已删除）' }}</view>
					<view class="amount text-danger">-¥{{ formatMoney(p.totalCost) }}</view>
				</view>
				<view class="record-meta">
					<text class="meta-item">📅 {{ p.purchaseDate }}</text>
					<text class="meta-item">🏭 {{ p.supplier || '未知供应商' }}</text>
					<text class="meta-item">×{{ p.quantity }} {{ unitOf(p.productId) }}</text>
				</view>
				<view class="remark-line" v-if="p.remark">
					<text class="remark-tag">备注</text>
					<text class="remark-text">{{ p.remark }}</text>
				</view>
				<view class="record-footer">
					<text class="text-muted">进价 ¥{{ formatMoney(p.unitCost) }}</text>
				</view>
			</view>
		</view>

		<view class="empty" v-if="!list.length">
			<text class="empty-emoji">📦</text>
			<view class="empty-text">暂无进货记录</view>
			<view class="empty-hint">点击右下角按钮添加</view>
		</view>

		<view class="fab fab--green" @click="edit()">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script>
	import { getPurchases, getProductById, formatMoney } from '@/utils/storage.js';

	export default {
		data() {
			return {
				list: [],
				totalCost: 0
			};
		},
		onShow() {
			this.list = getPurchases();
			this.totalCost = this.list.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
		},
		methods: {
			formatMoney,
			unitOf(productId) {
				const p = getProductById(productId);
				return p ? (p.unit || '件') : '件';
			},
			edit(id) {
				const url = id ? `/pages/purchase/edit?id=${id}` : '/pages/purchase/edit';
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

	.record-bar--purchase {
		background: linear-gradient(180deg, #07c160, #2dd47a);
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
	}

	.meta-item {
		font-size: 24rpx;
		color: #666;
		margin-right: 16rpx;
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
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 28rpx rgba(58, 122, 254, 0.4);
	}

	.fab--green {
		background: linear-gradient(135deg, #07c160, #2dd47a);
		box-shadow: 0 8rpx 28rpx rgba(7, 193, 96, 0.4);
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
