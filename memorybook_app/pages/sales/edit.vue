<template>
	<view class="container">
		<!-- 商品选择区 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar"></text>
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
					<text :class="['stock-text', currentStock <= 5 ? 'text-danger' : 'text-success']">
						{{ currentStock }} {{ unit }}
					</text>
				</view>
			</view>
		</view>

		<!-- 销售信息区 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar"></text>
				销售信息
			</view>
			<view class="form-group">
				<text class="form-label form-label-required">销售数量</text>
				<input class="form-input" type="digit" v-model="form.quantity" placeholder="0" @input="calcTotal" />
			</view>
			<view class="form-group">
				<text class="form-label">销售单价</text>
				<input class="form-input" type="digit" v-model="form.unitPrice" placeholder="0.00" @input="calcTotal" />
			</view>
			<view class="form-group">
				<text class="form-label">销售总额</text>
				<view class="form-input">
					<text class="total-amount text-primary">¥{{ formatMoney(form.totalAmount) }}</text>
				</view>
			</view>
			<view class="form-group">
				<text class="form-label">销售日期</text>
				<picker mode="date" :value="form.saleDate" @change="onDateChange">
					<view class="form-input form-input--clickable">
						{{ form.saleDate }}
						<text class="chevron">›</text>
					</view>
				</picker>
			</view>
		</view>

		<!-- 客户信息区 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar"></text>
				客户信息
				<text class="section-optional">可选</text>
			</view>
			<view class="form-group">
				<text class="form-label">客户姓名</text>
				<input class="form-input" v-model="form.customer" placeholder="如：王先生" />
			</view>
			<view class="form-group">
				<text class="form-label">手机号</text>
				<input class="form-input" type="number" v-model="form.phone" placeholder="如：138****8888" maxlength="11" />
			</view>
			<view class="form-group">
				<text class="form-label">送货地址</text>
				<input class="form-input" v-model="form.address" placeholder="如：北京市朝阳区xxx" />
			</view>
			<view class="form-group">
				<text class="form-label">备注</text>
				<input class="form-input" v-model="form.remark" placeholder="如：新房装修、团购等" />
			</view>
		</view>

		<view class="btn-primary" @click="submit">保存销售记录</view>
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
							<view class="goods-avatar">{{ (p.name || '?').charAt(0) }}</view>
							<view class="picker-item-info">
								<view class="pi-name">{{ p.name }}</view>
								<view class="text-muted">
									库存 {{ p.stock }} {{ p.unit || '件' }} · 售价 ¥{{ formatMoney(p.salePrice) }}
								</view>
							</view>
						</view>
						<view :class="['tag', p.stock <= 5 ? 'tag-red' : 'tag-blue']">
							{{ p.stock <= 5 ? '库存低' : '可选' }}
						</view>
					</view>
					<view class="empty" v-if="!products.length">请先在库存中添加商品</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getProducts, getProductById, getSales, saveSale, deleteSale, formatMoney, todayStr } from '@/utils/storage.js';

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
					unitPrice: '',
					totalAmount: 0,
					customer: '',
					phone: '',
					address: '',
					saleDate: todayStr(),
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
				const item = getSales().find(s => s.id === options.id);
				if (item) {
					this.isEdit = true;
					this.form = { ...item, quantity: String(item.quantity), unitPrice: String(item.unitPrice) };
				}
			}
		},
		methods: {
			formatMoney,
			chooseProduct(p) {
				this.form.productId = p.id;
				this.form.productName = p.name;
				this.form.unitPrice = String(p.salePrice || '');
				this.calcTotal();
				this.showPicker = false;
			},
			calcTotal() {
				const q = Number(this.form.quantity) || 0;
				const up = Number(this.form.unitPrice) || 0;
				this.form.totalAmount = Number((q * up).toFixed(2));
			},
			onDateChange(e) {
				this.form.saleDate = e.detail.value;
			},
			submit() {
				if (!this.form.productId) {
					return uni.showToast({ title: '请选择商品', icon: 'none' });
				}
				const q = Number(this.form.quantity);
				if (!q || q <= 0) {
					return uni.showToast({ title: '请输入销售数量', icon: 'none' });
				}
				if (!this.isEdit) {
					const p = getProductById(this.form.productId);
					if (p && Number(p.stock) < q) {
						return uni.showToast({ title: `库存不足，当前仅 ${p.stock} ${p.unit || '件'}`, icon: 'none' });
					}
				}
				saveSale({ ...this.form });
				uni.showToast({ title: '保存成功', icon: 'success' });
				setTimeout(() => uni.navigateBack(), 800);
			},
			remove() {
				uni.showModal({
					title: '提示',
					content: '删除后将自动回补库存，确定删除？',
					success: (res) => {
						if (res.confirm) {
							deleteSale(this.form.id);
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
