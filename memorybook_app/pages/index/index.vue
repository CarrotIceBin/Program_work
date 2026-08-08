<template>
	<view class="container">
		<!-- 顶部欢迎带封面图 -->
		<view class="hero">
			<image class="hero-bg" src="/static/hero-bg.svg" mode="aspectFill"></image>
			<view class="hero-overlay"></view>
			<view class="hero-content">
				<view class="hero-title">家电记账</view>
				<view class="hero-sub">轻松管理销售 · 进货 · 库存</view>
			</view>
		</view>

		<!-- 汇总卡片 -->
		<view class="stat-grid">
			<view class="stat-card stat-card--primary">
				<view class="stat-icon">💰</view>
				<view class="stat-info">
					<view class="stat-value">¥{{ formatMoney(todaySales) }}</view>
					<view class="stat-label">今日销售额</view>
				</view>
			</view>
			<view class="stat-card">
				<view class="stat-icon">📊</view>
				<view class="stat-info">
					<view class="stat-value">¥{{ formatMoney(totalSales) }}</view>
					<view class="stat-label">累计销售额</view>
				</view>
			</view>
			<view class="stat-card">
				<view class="stat-icon">📈</view>
				<view class="stat-info">
					<view class="stat-value text-success">¥{{ formatMoney(totalProfit) }}</view>
					<view class="stat-label">累计利润</view>
				</view>
			</view>
			<view class="stat-card">
				<view class="stat-icon">📦</view>
				<view class="stat-info">
					<view class="stat-value">{{ stockKinds }}</view>
					<view class="stat-label">库存种类</view>
				</view>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="section-title">
			<text class="section-bar"></text>
			快捷操作
		</view>
		<view class="action-grid">
			<view class="action-item" @click="go('/pages/sales/edit')">
				<view class="action-icon icon-sale">
					<text class="icon-emoji">💸</text>
				</view>
				<view class="action-text">记一笔销售</view>
			</view>
			<view class="action-item" @click="go('/pages/purchase/edit')">
				<view class="action-icon icon-buy">
					<text class="icon-emoji">📥</text>
				</view>
				<view class="action-text">记一笔进货</view>
			</view>
			<view class="action-item" @click="go('/pages/inventory/edit')">
				<view class="action-icon icon-goods">
					<text class="icon-emoji">➕</text>
				</view>
				<view class="action-text">新增商品</view>
			</view>
			<view class="action-item" @click="go('/pages/inventory/index')">
				<view class="action-icon icon-stock">
					<text class="icon-emoji">📋</text>
				</view>
				<view class="action-text">查看库存</view>
			</view>
		</view>

		<!-- 库存预警 -->
		<view class="section-title">
			<text class="section-bar section-bar--warn"></text>
			库存预警
			<text class="tag tag-red" v-if="lowStockList.length">{{ lowStockList.length }} 项</text>
		</view>
		<view class="card" v-if="lowStockList.length">
			<view class="warn-item" v-for="p in lowStockList" :key="p.id">
				<view class="warn-bar"></view>
				<view class="warn-body">
					<view class="flex-between">
						<view class="goods-name">{{ p.name }}</view>
						<view class="stock-tag tag-red">剩 {{ p.stock }} {{ p.unit || '件' }}</view>
					</view>
					<view class="text-muted mt-sm">{{ p.category || '未分类' }} · 编码 {{ p.sku || '-' }}</view>
				</view>
			</view>
		</view>
		<view class="empty" v-else>
			<text class="empty-emoji">✅</text>
			<view class="empty-text">库存充足，暂无预警</view>
		</view>

		<!-- 数据管理（可折叠） -->
		<view class="section-title" @click="toolsExpanded = !toolsExpanded">
			<text class="section-bar"></text>
			数据管理
			<text class="expand-arrow" :class="{ expanded: toolsExpanded }">▼</text>
		</view>
		<view class="card" v-if="toolsExpanded">
			<view class="tool-row" @click="doExport">
				<view class="tool-icon icon-export">📤</view>
				<view class="tool-desc">
					<view class="tool-title">导出数据</view>
					<view class="text-muted mt-sm">导出 3 个 CSV 文件，Excel/WPS 可直接打开</view>
				</view>
				<view class="tool-arrow">›</view>
			</view>
			<view class="tool-row" @click="doImport">
				<view class="tool-icon icon-import">📥</view>
				<view class="tool-desc">
					<view class="tool-title">导入数据</view>
					<view class="text-muted mt-sm">从 CSV 文件批量导入，支持多文件</view>
				</view>
				<view class="tool-arrow">›</view>
			</view>
			<view class="divider"></view>
			<!-- <view class="tool-row" @click="loadMock">
				<view class="tool-icon icon-mock">🗂</view>
				<view class="tool-desc">
					<view class="tool-title">加载演示数据</view>
					<view class="text-muted mt-sm">6 种商品 + 9 笔进货 + 13 笔销售</view>
				</view>
				<view class="tool-arrow">›</view>
			</view> -->
			<view class="tool-row" @click="clearAll">
				<view class="tool-icon icon-clear">🗑</view>
				<view class="tool-desc">
					<view class="tool-title text-danger">清空全部数据</view>
					<view class="text-muted mt-sm">删除所有记录，不可恢复</view>
				</view>
				<view class="tool-arrow">›</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatMoney,
		getTodaySalesAmount,
		getTotalSalesAmount,
		getTotalProfit,
		getStockKinds,
		getProducts
	} from '@/utils/storage.js';
	import { initMockData, clearAllData, hasAnyData } from '@/utils/initMockData.js';
	import { exportData, importData } from '@/utils/exchange.js';

	export default {
		data() {
			return {
				todaySales: 0,
				totalSales: 0,
				totalProfit: 0,
				stockKinds: 0,
				lowStockList: [],
				toolsExpanded: false
			};
		},
		onShow() {
			this.loadStat();
			if (!hasAnyData()) {
				setTimeout(() => this.loadMock(true), 300);
			}
		},
		methods: {
			formatMoney,
			loadStat() {
				this.todaySales = getTodaySalesAmount();
				this.totalSales = getTotalSalesAmount();
				this.totalProfit = getTotalProfit();
				this.stockKinds = getStockKinds();
				this.lowStockList = getProducts().filter(p => (Number(p.stock) || 0) <= 5);
			},
			go(url) {
				uni.navigateTo({ url });
			},
			loadMock(silent) {
				if (hasAnyData() && !silent) {
					return uni.showModal({
						title: '提示',
						content: '当前已有数据，加载演示数据会先清空，确定吗？',
						success: (res) => {
							if (res.confirm) {
								clearAllData();
								const r = initMockData();
								this.loadStat();
								uni.showToast({ title: `已加载 ${r.products}商品/${r.purchases}进货/${r.sales}销售`, icon: 'none' });
							}
						}
					});
				}
				const r = initMockData();
				this.loadStat();
				if (!silent) uni.showToast({ title: '演示数据加载成功', icon: 'success' });
			},
			clearAll() {
				uni.showModal({
					title: '确认清空',
					content: '将删除所有商品、销售、进货记录，且不可恢复，确定吗？',
					success: (res) => {
						if (res.confirm) {
							clearAllData();
							this.loadStat();
							uni.showToast({ title: '已清空', icon: 'none' });
						}
					}
				});
			},
			doExport() {
				if (!hasAnyData()) {
					return uni.showToast({ title: '暂无数据可导出', icon: 'none' });
				}
				exportData();
			},
			doImport() {
				importData();
				setTimeout(() => this.loadStat(), 500);
			}
		}
	};
</script>

<style scoped>
	.hero {
		background: linear-gradient(135deg, #3a7afe 0%, #5b9bff 100%);
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
		margin-bottom: 24rpx;
		position: relative;
		overflow: hidden;
	}

	.hero-content {
		position: relative;
		z-index: 1;
	}

	.hero-title {
		font-size: 44rpx;
		font-weight: 700;
		color: #fff;
	}

	.hero-sub {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 8rpx;
	}

	.hero-decoration {
		position: absolute;
		right: -40rpx;
		top: -40rpx;
		width: 200rpx;
		height: 200rpx;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 50%;
	}

	.stat-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.stat-card {
		width: 48.5%;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.stat-card--primary {
		background: linear-gradient(135deg, #fff 0%, #f0f6ff 100%);
	}

	.stat-icon {
		font-size: 40rpx;
		margin-right: 20rpx;
	}

	.stat-info {
		flex: 1;
	}

	.stat-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #1a1a1a;
	}

	.stat-label {
		font-size: 24rpx;
		color: #999;
		margin-top: 6rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin: 20rpx 8rpx 20rpx;
		display: flex;
		align-items: center;
	}

	.section-bar {
		width: 8rpx;
		height: 28rpx;
		background: linear-gradient(180deg, #3a7afe, #5b9bff);
		border-radius: 4rpx;
		margin-right: 16rpx;
	}

	.section-bar--warn {
		background: linear-gradient(180deg, #ff976a, #ffb99a);
	}

	.expand-arrow {
		margin-left: auto;
		font-size: 22rpx;
		color: #bbb;
		transition: transform 0.3s;
	}

	.expand-arrow.expanded {
		transform: rotate(180deg);
	}

	.action-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.action-item {
		width: 48.5%;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		transition: transform 0.15s;
	}

	.action-item:active {
		transform: scale(0.97);
	}

	.action-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 24rpx;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.icon-emoji {
		font-size: 40rpx;
	}

	.icon-sale {
		background: linear-gradient(135deg, #3a7afe, #6aa6ff);
	}

	.icon-buy {
		background: linear-gradient(135deg, #07c160, #4dd68a);
	}

	.icon-goods {
		background: linear-gradient(135deg, #ff976a, #ffb99a);
	}

	.icon-stock {
		background: linear-gradient(135deg, #9b7aff, #c0a8ff);
	}

	.action-text {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.warn-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.warn-item:last-child {
		border-bottom: none;
	}

	.warn-bar {
		width: 6rpx;
		background: linear-gradient(180deg, #ff976a, #ffb99a);
		border-radius: 3rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.warn-body {
		flex: 1;
	}

	.goods-name {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.stock-tag {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		border-radius: 16rpx;
	}

	.tool-row {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.tool-row:last-child {
		border-bottom: none;
	}

	.tool-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.icon-export {
		background: #e8f3ff;
	}

	.icon-import {
		background: #e6f9f0;
	}

	.icon-mock {
		background: #fff5e6;
	}

	.icon-clear {
		background: #fff0ed;
	}

	.tool-desc {
		flex: 1;
	}

	.tool-title {
		font-size: 30rpx;
		color: #1a1a1a;
		font-weight: 500;
	}

	.tool-arrow {
		font-size: 36rpx;
		color: #ccc;
	}

	.empty-emoji {
		font-size: 60rpx;
		display: block;
		margin-bottom: 16rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #bbb;
	}
</style>
