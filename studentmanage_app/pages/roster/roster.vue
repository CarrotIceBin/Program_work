<template>
	<view class="container">
		<view class="stats-bar">
			<view class="stat-item">
				<text class="stat-num">{{ students.length }}</text>
				<text class="stat-label">总人数</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ cadreList.length }}</text>
				<text class="stat-label">班委</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ maleCount }}</text>
				<text class="stat-label">男生</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ femaleCount }}</text>
				<text class="stat-label">女生</text>
			</view>
		</view>

		<view class="section" v-if="cadreList.length">
			<view class="section-header">
				<view class="section-icon cadre-icon">★</view>
				<text class="section-title">班委</text>
				<text class="section-count">{{ cadreList.length }}人</text>
			</view>
			<view class="student-list">
				<view
					class="student-card"
					v-for="s in cadreList"
					:key="s.id"
					:class="s.gender"
					@click="onStudentClick(s)"
				>
					<view class="avatar" :class="s.gender">
						<text class="avatar-text">{{ s.name.charAt(0) }}</text>
					</view>
					<view class="student-info">
						<text class="student-name">{{ s.name }}</text>
					</view>
					<view class="cadre-tag">班委</view>
				</view>
			</view>
		</view>

		<view class="section" v-if="normalList.length">
			<view class="section-header">
				<view class="section-icon normal-icon">●</view>
				<text class="section-title">普通学生</text>
				<text class="section-count">{{ normalList.length }}人</text>
			</view>
			<view class="student-list">
				<view
					class="student-card"
					v-for="s in normalList"
					:key="s.id"
					:class="s.gender"
					@click="onStudentClick(s)"
				>
					<view class="avatar" :class="s.gender">
						<text class="avatar-text">{{ s.name.charAt(0) }}</text>
					</view>
					<view class="student-info">
						<text class="student-name">{{ s.name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getStudentList } from '@/utils/storage.js'

	export default {
		data() {
			return {
				students: []
			}
		},
		computed: {
			cadreList() {
				return this.students
					.filter(s => s.isClassCadre)
					.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
			},
			normalList() {
				return this.students
					.filter(s => !s.isClassCadre)
					.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
			},
			maleCount() {
				return this.students.filter(s => s.gender === 'male').length
			},
			femaleCount() {
				return this.students.filter(s => s.gender === 'female').length
			}
		},
		onShow() {
			this.students = getStudentList()
		},
		methods: {
			onStudentClick(s) {
				uni.navigateTo({
					url: '/pages/detail/detail?id=' + s.id
				})
			}
		}
	}
</script>

<style>
	.container {
		padding: 24rpx 20rpx;
		background: linear-gradient(180deg, #edf2f7 0%, #f8fafc 100%);
		min-height: 100vh;
		box-sizing: border-box;
	}

	.stats-bar {
		display: flex;
		justify-content: space-around;
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		margin-bottom: 28rpx;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-num {
		font-size: 40rpx;
		font-weight: bold;
		color: #5a67d8;
	}

	.stat-label {
		font-size: 22rpx;
		color: #999;
		margin-top: 6rpx;
	}

	.section {
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 28rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #f0f2f5;
	}

	.section-icon {
		width: 40rpx;
		height: 40rpx;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		color: #fff;
	}

	.cadre-icon {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		box-shadow: 0 3rpx 10rpx rgba(245, 158, 11, 0.35);
	}

	.normal-icon {
		background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
		box-shadow: 0 3rpx 10rpx rgba(100, 116, 139, 0.3);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.section-count {
		font-size: 24rpx;
		color: #999;
		margin-left: auto;
	}

	.student-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.student-card {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 20rpx 24rpx;
		background: #f8fafc;
		border-radius: 16rpx;
		border-left: 6rpx solid #e2e8f0;
		transition: all 0.15s ease;
	}

	.student-card.male {
		border-left-color: #3d9af5;
	}

	.student-card.female {
		border-left-color: #f472b6;
	}

	.student-card:active {
		transform: scale(0.98);
		background: #f1f5f9;
	}

	.avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.avatar.male {
		background: linear-gradient(135deg, #5eb4ff 0%, #3d9af5 60%, #2979db 100%);
		box-shadow: 0 4rpx 12rpx rgba(61, 154, 245, 0.3);
	}

	.avatar.female {
		background: linear-gradient(135deg, #ffb3d1 0%, #f472b6 60%, #db2777 100%);
		box-shadow: 0 4rpx 12rpx rgba(244, 114, 182, 0.3);
	}

	.avatar-text {
		font-size: 30rpx;
		font-weight: bold;
		color: #fff;
	}

	.student-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		overflow: hidden;
	}

	.student-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.student-meta {
		font-size: 22rpx;
		color: #999;
	}

	.cadre-tag {
		padding: 6rpx 18rpx;
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: #fff;
		font-size: 22rpx;
		font-weight: 500;
		border-radius: 20rpx;
		flex-shrink: 0;
	}
</style>