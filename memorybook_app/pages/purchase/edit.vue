<template>
	<view class="container">
		<!-- 商品选择区 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar section-bar--green"></text>
				商品信息
			</view>
			<view class="form-group" @click="showPicker = true">
				<text class="form-label form-label-required">选择商品</text>
				<view class="form-input form-input--clickable">
					<text v-if="form.productId" class="selected-goods">{{ form.productName }}</text>
					<text v-else class="placeholder">请选择商品</text>
					<text class="chevron">›</text>
				</view>
			</view>
			<view class="form-group" v-if="form.productId">
				<text class="form-label">当前库存</text>
				<view class="form-input">
					<text class="stock-text text-success">{{ currentStock }} {{ unit }}</text>
				</view>
			</view>
		</view>

		<!-- 进货信息区 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar section-bar--green"></text>
				进货信息
			</view>
			<view class="form-group">
				<text class="form-label form-label-required">进货数量</text>
				<input class="form-input" type="digit" v-model="form.quantity" placeholder="0" @input="calcTotal" />
			</view>
			<view class="form-group">
				<text class="form-label">进货单价</text>
				<input class="form-input" type="digit" v-model="form.unitCost" placeholder="0.00" @input="calcTotal" />
			</view>
			<view class="form-group">
				<text class="form-label">进货总额</text>
				<view class="form-input">
					<text class="total-amount text-primary">¥{{ formatMoney(form.totalCost) }}</text>
				</view>
			</view>
			<view class="form-group">
				<text class="form-label">进货日期</text>
				<picker mode="date" :value="form.purchaseDate" @change="onDateChange">
					<view class="form-input form-input--clickable">
						{{ form.purchaseDate }}
						<text class="chevron">›</text>
					</view>
				</picker>
			</view>
		</view>

		<!-- 其他信息区 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar section-bar--green"></text>
				其他信息
				<text class="section-optional">可选</text>
			</view>
			<view class="form-group">
				<text class="form-label">供应商</text>
				<input class="form-input" v-model="form.supplier" placeholder="如：海尔官方仓库" />
			</view>
			<view class="form-group">
				<text class="form-label">备注</text>
				<input class="form-input" v-model="form.remark" placeholder="如：批量采购、月结等" />
			</view>
		</view>

		<view class="btn btn-success" @click="submit">保存进货记录</view>
		<view class="btn-danger" v-if="isEdit" @click="remove">删除记录</view>

		<!-- 商品选择弹层 -->
		<view class="mask" v-if="showPicker" @click="showPicker = false">
			<view class="picker" @click.stop>
				<view class="picker-header">
					<text class="picker-title">选择商品</text>
					<text class="picker-close" @click="showPicker = false">×</text>
				</view>
				<scroll-view scroll-y class="picker-list">
					<view class="picker-item" v-for="p in products" :key="p.id" @click="chooseProduct(p)">
						<view class="picker-item-left">
							<view class="goods-avatar goods-avatar--green">{{ (p.name || '?').charAt(0) }}</view>
							<view class="picker-item-info">
								<view class="pi-name">{{ p.name }}</view>
								<view class="text-muted">
									库存 {{ p.stock }} {{ p.unit || '件' }} · 进价 ¥{{ formatMoney(p.costPrice) }}
								</view>
							</view>
						</view>
						<view class="tag tag-green">选择</view>
					</view>
					<view class="empty" v-if="!products.length">请先在库存中添加商品</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getProducts, getProductById, getPurchases, savePurchase, deletePurchase, formatMoney, todayStr } from '@/utils/storage.js';

	export default {
		data() {
			return {
				isEdit: false,
				showPicker: false,
				products: [],
				form: {
					id: '',
					productId: '',
					productName: '',
					quantity: '',
					unitCost: '',
					totalCost: 0,
					supplier: '',
					purchaseDate: todayStr(),
					remark: ''
				}
			};
		},
		computed: {
			currentStock() {
				const p = getProductById(this.form.productId);
				return p ? p.stock : 0;
			},
			unit() {
				const p = getProductById(this.form.productId);
				return p ? (p.unit || '件') : '件';
			}
		},
		onLoad(options) {
			this.products = getProducts();
			if (options.id) {
				const item = getPurchases().find(p => p.id === options.id);
				if (item) {
					this.isEdit = true;
					this.form = { ...item, quantity: String(item.quantity), unitCost: String(item.unitCost) };
				}
			}
		},
		methods: {
			formatMoney,
			chooseProduct(p) {
				this.form.productId = p.id;
				this.form.productName = p.name;
				this.form.unitCost = String(p.costPrice || '');
				this.calcTotal();
				this.showPicker = false;
			},
			calcTotal() {
				const q = Number(this.form.quantity) || 0;
				const uc = Number(this.form.unitCost) || 0;
				this.form.totalCost = Number((q * uc).toFixed(2));
			},
			onDateChange(e) {
				this.form.purchaseDate = e.detail.value;
			},
			submit() {
				if (!this.form.productId) {
					return uni.showToast({ title: '请选择商品', icon: 'none' });
				}
				const q = Number(this.form.quantity);
				if (!q || q <= 0) {
					return uni.showToast({ title: '请输入进货数量', icon: 'none' });
				}
				savePurchase({ ...this.form });
				uni.showToast({ title: '保存成功', icon: 'success' });
				setTimeout(() => uni.navigateBack(), 800);
			},
			remove() {
				uni.showModal({
					title: '提示',
					content: '删除后将自动扣减对应库存，确定删除？',
					success: (res) => {
						if (res.confirm) {
							deletePurchase(this.form.id);
							uni.showToast({ title: '已删除', icon: 'none' });
							setTimeout(() => uni.navigateBack(), 800);
						}
					}
				});
			}
		}
	};
</script>

<style scoped>
	.section-card {
		background-color: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.section-header {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		padding: 24rpx 28rpx 16rpx;
		display: flex;
		align-items: center;
	}

	.section-bar {
		width: 6rpx;
		height: 24rpx;
		background: linear-gradient(180deg, #3a7afe, #5b9bff);
		border-radius: 3rpx;
		margin-right: 14rpx;
	}

	.section-bar--green {
		background: linear-gradient(180deg, #07c160, #2dd47a);
	}

	.section-optional {
		font-size: 22rpx;
		color: #bbb;
		font-weight: normal;
		margin-left: auto;
	}

	.form-input--clickable {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.chevron {
		font-size: 36rpx;
		color: #ccc;
	}

	.selected-goods {
		font-size: 30rpx;
		color: #1a1a1a;
		font-weight: 500;
	}

	.stock-text {
		font-size: 30rpx;
		font-weight: 600;
	}

	.total-amount {
		font-size: 38rpx;
		font-weight: 700;
	}

	.btn {
		color: #fff;
		border-radius: 48rpx;
		text-align: center;
		padding: 26rpx 0;
		font-size: 32rpx;
		font-weight: 600;
		margin-top: 40rpx;
	}

	.btn-success {
		background: linear-gradient(135deg, #07c160, #2dd47a);
		box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
	}

	.btn-success:active {
		opacity: 0.85;
		transform: scale(0.98);
	}

	.mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
	}

	.picker {
		width: 100%;
		background-color: #fff;
		border-radius: 32rpx 32rpx 0 0;
		max-height: 75vh;
		display: flex;
		flex-direction: column;
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.picker-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1a1a1a;
	}

	.picker-close {
		font-size: 48rpx;
		color: #ccc;
		line-height: 1;
	}

	.picker-list {
		max-height: 60vh;
	}

	.picker-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.picker-item-left {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.goods-avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 18rpx;
		background: linear-gradient(135deg, #3a7afe, #5b9bff);
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.goods-avatar--green {
		background: linear-gradient(135deg, #07c160, #2dd47a);
	}

	.picker-item-info {
		flex: 1;
	}

	.pi-name {
		font-size: 30rpx;
		color: #1a1a1a;
		margin-bottom: 6rpx;
		font-weight: 500;
	}
</style>
