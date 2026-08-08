<template>
	<view class="container">
		<!-- 基本信息 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar section-bar--orange"></text>
				基本信息
			</view>
			<view class="form-group">
				<text class="form-label form-label-required">商品名称</text>
				<input class="form-input" v-model="form.name" placeholder="如：海尔冰箱" />
			</view>
			<view class="form-group">
				<text class="form-label">分类</text>
				<input class="form-input" v-model="form.category" placeholder="如：大家电 / 厨房电器" />
			</view>
			<view class="form-group">
				<text class="form-label">编码/型号</text>
				<input class="form-input" v-model="form.sku" placeholder="可选，如：BCD-216" />
			</view>
			<view class="form-group">
				<text class="form-label">计量单位</text>
				<input class="form-input" v-model="form.unit" placeholder="件 / 台 / 套" />
			</view>
		</view>

		<!-- 价格库存 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar section-bar--orange"></text>
				价格与库存
			</view>
			<view class="form-group">
				<text class="form-label form-label-required">当前库存</text>
				<input class="form-input" type="digit" v-model="form.stock" placeholder="0" />
			</view>
			<view class="form-group">
				<text class="form-label">进货价</text>
				<input class="form-input" type="digit" v-model="form.costPrice" placeholder="0.00" />
			</view>
			<view class="form-group">
				<text class="form-label">销售价</text>
				<input class="form-input" type="digit" v-model="form.salePrice" placeholder="0.00" />
			</view>
			<view class="form-group" v-if="form.salePrice && form.costPrice">
				<text class="form-label">单件毛利</text>
				<view class="form-input">
					<text class="profit-text text-success">¥{{ formatMoney(Number(form.salePrice) - Number(form.costPrice)) }}</text>
				</view>
			</view>
		</view>

		<!-- 备注 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-bar section-bar--orange"></text>
				备注
				<text class="section-optional">可选</text>
			</view>
			<view class="form-group">
				<input class="form-input" v-model="form.remark" placeholder="如：保修政策、供货商等" />
			</view>
		</view>

		<view class="btn-primary" @click="submit">保存商品</view>
		<view class="btn-danger" v-if="isEdit" @click="remove">删除商品</view>
	</view>
</template>

<script>
	import { getProductById, saveProduct, deleteProduct, formatMoney } from '@/utils/storage.js';

	export default {
		data() {
			return {
				isEdit: false,
				form: {
					id: '',
					name: '',
					category: '',
					sku: '',
					unit: '台',
					stock: 0,
					costPrice: '',
					salePrice: '',
					remark: ''
				}
			};
		},
		onLoad(options) {
			if (options.id) {
				const p = getProductById(options.id);
				if (p) {
					this.isEdit = true;
					this.form = { ...p };
				}
			}
		},
		methods: {
			formatMoney,
			submit() {
				if (!this.form.name || !this.form.name.trim()) {
					return uni.showToast({ title: '请输入商品名称', icon: 'none' });
				}
				saveProduct({ ...this.form });
				uni.showToast({ title: '保存成功', icon: 'success' });
				setTimeout(() => uni.navigateBack(), 800);
			},
			remove() {
				uni.showModal({
					title: '提示',
					content: '确定删除该商品吗？相关销售/进货记录仍会保留。',
					success: (res) => {
						if (res.confirm) {
							deleteProduct(this.form.id);
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

	.section-bar--orange {
		background: linear-gradient(180deg, #ff976a, #ffb99a);
	}

	.section-optional {
		font-size: 22rpx;
		color: #bbb;
		font-weight: normal;
		margin-left: auto;
	}

	.profit-text {
		font-size: 30rpx;
		font-weight: 600;
	}
</style>
