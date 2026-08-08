<template>
	<view class="container">
		<view class="search-bar">
			<view class="search-input-wrap">
				<text class="search-icon">🔍</text>
				<input class="search-input" v-model="keyword" placeholder="搜索商品名称/分类/编码" confirm-type="search" />
				<text class="search-clear" v-if="keyword" @click="keyword = ''">×</text>
			</view>
		</view>

		<view class="goods-card" v-for="p in filterList" :key="p.id" @click="edit(p.id)">
			<view class="goods-left">
				<view class="goods-avatar">{{ (p.name || '?').charAt(0) }}</view>
				<view class="goods-info">
					<view class="goods-name-row">
						<text class="goods-name">{{ p.name }}</text>
						<view :class="['tag', p.stock <= 5 ? 'tag-red' : 'tag-green']">
							{{ p.stock <= 5 ? '⚠ 库存低' : '✓ 充足' }}
						</view>
					</view>
					<view class="goods-meta">
						{{ p.category || '未分类' }} · 编码 {{ p.sku || '-' }}
					</view>
					<view class="goods-price-row">
						<view class="price-item">
							<text class="price-label">进价</text>
							<text class="price-value">¥{{ formatMoney(p.costPrice) }}</text>
						</view>
						<view class="price-item">
							<text class="price-label">售价</text>
							<text class="price-value price-value--sale">¥{{ formatMoney(p.salePrice) }}</text>
						</view>
						<view class="price-item" v-if="p.salePrice && p.costPrice">
							<text class="price-label">毛利</text>
							<text class="price-value price-value--profit">¥{{ formatMoney(p.salePrice - p.costPrice) }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="goods-stock">
				<view class="stock-num">{{ p.stock }}</view>
				<view class="stock-unit">{{ p.unit || '件' }}</view>
			</view>
		</view>

		<view class="empty" v-if="!filterList.length">
			<text class="empty-emoji">📦</text>
			<view class="empty-text">暂无商品</view>
			<view class="empty-hint">点击右下角按钮添加</view>
		</view>

		<view class="fab" @click="edit()">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script>
	import { getProducts, formatMoney } from '@/utils/storage.js';

	export default {
		data() {
			return {
				list: [],
				keyword: ''
			};
		},
		computed: {
			filterList() {
				const kw = this.keyword.trim();
				if (!kw) return this.list;
				return this.list.filter(p =>
					(p.name || '').includes(kw) || (p.category || '').includes(kw) || (p.sku || '').includes(kw)
				);
			}
		},
		onShow() {
			this.list = getProducts();
		},
		methods: {
			formatMoney,
			edit(id) {
				const url = id ? `/pages/inventory/edit?id=${id}` : '/pages/inventory/edit';
				uni.navigateTo({ url });
			}
		}
	};
</script>

<style scoped>
	.search-bar {
		margin-bottom: 20rpx;
	}

	.search-input-wrap {
		background-color: #fff;
		border-radius: 40rpx;
		padding: 18rpx 32rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.search-icon {
		font-size: 28rpx;
		margin-right: 16rpx;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
	}

	.search-clear {
		font-size: 32rpx;
		color: #ccc;
		padding: 0 12rpx;
	}

	.goods-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 24rpx 28rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.goods-left {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.goods-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 22rpx;
		background: linear-gradient(135deg, #ff976a, #ffb99a);
		color: #fff;
		font-size: 36rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.goods-info {
		flex: 1;
		min-width: 0;
	}

	.goods-name-row {
		display: flex;
		align-items: center;
		margin-bottom: 6rpx;
	}

	.goods-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #1a1a1a;
		margin-right: 12rpx;
	}

	.goods-meta {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 12rpx;
	}

	.goods-price-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.price-item {
		display: flex;
		align-items: center;
	}

	.price-label {
		font-size: 22rpx;
		color: #999;
		margin-right: 6rpx;
	}

	.price-value {
		font-size: 26rpx;
		font-weight: 600;
		color: #1a1a1a;
	}

	.price-value--sale {
		color: #3a7afe;
	}

	.price-value--profit {
		color: #07c160;
	}

	.goods-stock {
		text-align: center;
		padding-left: 20rpx;
		border-left: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.stock-num {
		font-size: 40rpx;
		font-weight: 700;
		color: #1a1a1a;
	}

	.stock-unit {
		font-size: 22rpx;
		color: #999;
	}

	.fab {
		position: fixed;
		right: 40rpx;
		bottom: 60rpx;
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #ff976a, #ffb99a);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 28rpx rgba(255, 151, 106, 0.4);
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
