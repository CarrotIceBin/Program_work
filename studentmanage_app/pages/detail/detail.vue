<template>
	<view class="container">
		<view class="card">
			<view class="avatar" :class="[student.gender, { 'is-cadre': student.isClassCadre }]">
				<text class="avatar-text">{{ student.name ? student.name.charAt(0) : '?' }}</text>
				<view class="avatar-badge" v-if="student.isClassCadre">★</view>
			</view>
			<view class="form-item">
				<text class="label">姓名</text>
				<input
					class="input"
					v-model="student.name"
					placeholder="请输入学生姓名"
					maxlength="20"
				/>
			</view>
			<view class="form-item">
				<text class="label">性别</text>
				<view class="gender-selector">
					<view
						class="gender-option male"
						:class="{ active: student.gender === 'male' }"
						@click="student.gender = 'male'"
					>
						<text class="gender-icon">♂</text>
						<text class="gender-label">男</text>
					</view>
					<view
						class="gender-option female"
						:class="{ active: student.gender === 'female' }"
						@click="student.gender = 'female'"
					>
						<text class="gender-icon">♀</text>
						<text class="gender-label">女</text>
					</view>
				</view>
			</view>
			<view class="form-item">
				<text class="label">身份</text>
				<view class="gender-selector">
					<view
						class="gender-option normal"
						:class="{ active: !student.isClassCadre }"
						@click="student.isClassCadre = false"
					>
						<text class="gender-icon">👤</text>
						<text class="gender-label">普通学生</text>
					</view>
					<view
						class="gender-option cadre"
						:class="{ active: student.isClassCadre }"
						@click="student.isClassCadre = true"
					>
						<text class="gender-icon">★</text>
						<text class="gender-label">班委</text>
					</view>
				</view>
			</view>
			<view class="form-item" v-if="isEdit">
				<text class="label">位置</text>
				<text class="seat-info">第 {{ student.row }} 行 第 {{ student.col }} 列</text>
			</view>
			<view class="form-item column" v-else>
				<text class="label">选择座位</text>
				<view class="seat-picker">
					<view class="picker-podium">讲台</view>
					<view class="picker-classroom">
						<view class="picker-row" v-for="r in totalRows" :key="r">
							<view class="picker-group picker-group-left">
								<view
									class="picker-seat"
									v-for="c in leftCols"
									:key="'pl-' + r + '-' + c"
									:class="getSeatClass(r, c)"
									@click="onSeatPick(r, c)"
								>
									<block v-if="getStudentAt(r, c)">
										<text class="picker-seat-name">{{ getStudentAt(r, c).name }}</text>
									</block>
									<block v-else>
										<text class="picker-seat-empty">+</text>
									</block>
								</view>
							</view>
							<view class="picker-aisle" v-if="r === 1">
								<text class="picker-aisle-text">过道</text>
							</view>
							<view class="picker-aisle-ph" v-else></view>
							<view class="picker-group picker-group-mid">
								<view
									class="picker-seat"
									v-for="c in midCols"
									:key="'pm-' + r + '-' + c"
									:class="getSeatClass(r, c)"
									@click="onSeatPick(r, c)"
								>
									<block v-if="getStudentAt(r, c)">
										<text class="picker-seat-name">{{ getStudentAt(r, c).name }}</text>
									</block>
									<block v-else>
										<text class="picker-seat-empty">+</text>
									</block>
								</view>
							</view>
							<view class="picker-aisle" v-if="r === 1">
								<text class="picker-aisle-text">过道</text>
							</view>
							<view class="picker-aisle-ph" v-else></view>
							<view class="picker-group picker-group-right">
								<view
									class="picker-seat"
									v-for="c in rightCols"
									:key="'pr-' + r + '-' + c"
									:class="getSeatClass(r, c)"
									@click="onSeatPick(r, c)"
								>
									<block v-if="getStudentAt(r, c)">
										<text class="picker-seat-name">{{ getStudentAt(r, c).name }}</text>
									</block>
									<block v-else>
										<text class="picker-seat-empty">+</text>
									</block>
								</view>
							</view>
						</view>
					</view>
					<view class="picker-hint">
						<text class="hint-available">可选</text>
						<text class="hint-taken-male">男生</text>
						<text class="hint-taken-female">女生</text>
						<text class="hint-selected">已选</text>
					</view>
					<view class="selected-info">
						<text class="selected-label">已选位置：</text>
						<text class="selected-value">第 {{ student.row }} 行 第 {{ student.col }} 列</text>
					</view>
				</view>
			</view>
			<view class="form-item column">
				<text class="label">个人信息</text>
				<textarea
					class="textarea"
					v-model="student.info"
					placeholder="请输入学生的个人信息，如：&#10;性别、年龄、爱好、备注等..."
					auto-height
					maxlength="500"
				/>
				<text class="count">{{ student.info.length }}/500</text>
			</view>
		</view>
		<view class="actions">
			<button class="btn-save" @click="onSave">保存</button>
			<button v-if="isEdit" class="btn-delete" @click="onDelete">删除</button>
		</view>
	</view>
</template>

<script>
	import { getStudentById, getStudentList, saveStudent, deleteStudent, isSeatTaken } from '@/utils/storage.js'

	export default {
		data() {
			return {
				student: {
					id: '',
					name: '',
					gender: 'male',
					row: 1,
					col: 1,
					info: '',
					isClassCadre: false
				},
				isEdit: false,
				allStudents: [],
				totalRows: 6,
				leftCols: [1, 2, 3],
				midCols: [4, 5, 6, 7],
				rightCols: [8, 9, 10]
			}
		},
		onLoad(options) {
			this.allStudents = getStudentList()
			if (options.id) {
				const s = getStudentById(options.id)
				if (s) {
					this.student = { ...s }
					if (this.student.isClassCadre === undefined) {
						this.student.isClassCadre = false
					}
					this.isEdit = true
					uni.setNavigationBarTitle({ title: s.name })
				}
			} else {
				this.isEdit = false
				if (options.row) this.student.row = parseInt(options.row)
				if (options.col) this.student.col = parseInt(options.col)
				uni.setNavigationBarTitle({ title: '添加学生' })
			}
		},
		methods: {
			getStudentAt(row, col) {
				return this.allStudents.find(s => s.row === row && s.col === col)
			},
			isCurrentStudent(row, col) {
				return this.student.row === row && this.student.col === col
			},
			getSeatClass(row, col) {
				const occupied = this.getStudentAt(row, col)
				const isCurrent = this.isCurrentStudent(row, col)
				if (isCurrent) {
					return 'seat-selected'
				}
				if (occupied) {
					return occupied.gender === 'female' ? 'seat-taken female' : 'seat-taken male'
				}
				return 'seat-available'
			},
			onSeatPick(row, col) {
				if (this.isEdit) return
				const occupied = this.getStudentAt(row, col)
				if (occupied) {
					uni.showToast({ title: '该位置已被占用', icon: 'none' })
					return
				}
				this.student.row = row
				this.student.col = col
			},
			onSave() {
				if (!this.student.name || !this.student.name.trim()) {
					uni.showToast({ title: '请输入姓名', icon: 'none' })
					return
				}
				if (!this.isEdit && isSeatTaken(this.student.row, this.student.col)) {
					uni.showToast({ title: '该位置已被占用', icon: 'none' })
					return
				}
				saveStudent(this.student)
				uni.showToast({ title: '保存成功', icon: 'success' })
				setTimeout(() => {
					uni.navigateBack()
				}, 800)
			},
			onDelete() {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除学生 "' + this.student.name + '" 吗？',
					success: (res) => {
						if (res.confirm) {
							deleteStudent(this.student.id)
							uni.showToast({ title: '已删除', icon: 'success' })
							setTimeout(() => {
								uni.navigateBack()
							}, 800)
						}
					}
				})
			}
		}
	}
</script>

<style>
	.container {
		padding: 30rpx;
		background: linear-gradient(180deg, #e8f4fd 0%, #f5f7fa 100%);
		min-height: 100vh;
		box-sizing: border-box;
	}

	.card {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		margin: 0 auto 40rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.avatar.male {
		background: linear-gradient(135deg, #3d9af5 0%, #2979db 100%);
		box-shadow: 0 8rpx 24rpx rgba(61, 154, 245, 0.4);
	}

	.avatar.female {
		background: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
		box-shadow: 0 8rpx 24rpx rgba(244, 114, 182, 0.4);
	}

	.avatar.is-cadre {
		border: 4rpx solid #f59e0b;
	}

	.avatar-text {
		font-size: 64rpx;
		font-weight: bold;
		color: #fff;
	}

	.avatar-badge {
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		width: 40rpx;
		height: 40rpx;
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		border-radius: 50%;
		font-size: 24rpx;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(245, 158, 11, 0.5);
		border: 3rpx solid #fff;
	}

	.form-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-item.column {
		flex-direction: column;
		align-items: flex-start;
	}

	.label {
		width: 160rpx;
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
		flex-shrink: 0;
	}

	.form-item.column .label {
		margin-bottom: 20rpx;
	}

	.gender-selector {
		display: flex;
		gap: 20rpx;
		flex: 1;
	}

	.gender-option {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		padding: 14rpx 32rpx;
		border-radius: 40rpx;
		border: 2rpx solid #e0e4ea;
		background: #f8f9fa;
		transition: all 0.2s ease;
	}

	.gender-option.male.active {
		background: linear-gradient(135deg, #3d9af5 0%, #2979db 100%);
		border-color: transparent;
		box-shadow: 0 4rpx 12rpx rgba(61, 154, 245, 0.35);
	}

	.gender-option.female.active {
		background: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
		border-color: transparent;
		box-shadow: 0 4rpx 12rpx rgba(244, 114, 182, 0.35);
	}

	.gender-option.normal.active {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		border-color: transparent;
		box-shadow: 0 4rpx 12rpx rgba(107, 114, 128, 0.35);
	}

	.gender-option.cadre.active {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		border-color: transparent;
		box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.35);
	}

	.gender-icon {
		font-size: 32rpx;
		color: inherit;
	}

	.gender-option.male .gender-icon,
	.gender-option.male .gender-label {
		color: #6b7a8d;
	}

	.gender-option.female .gender-icon,
	.gender-option.female .gender-label {
		color: #6b7a8d;
	}

	.gender-option.normal .gender-icon,
	.gender-option.normal .gender-label {
		color: #6b7a8d;
	}

	.gender-option.cadre .gender-icon,
	.gender-option.cadre .gender-label {
		color: #6b7a8d;
	}

	.gender-option.male.active .gender-icon,
	.gender-option.male.active .gender-label {
		color: #fff;
	}

	.gender-option.female.active .gender-icon,
	.gender-option.female.active .gender-label {
		color: #fff;
	}

	.gender-option.normal.active .gender-icon,
	.gender-option.normal.active .gender-label {
		color: #fff;
	}

	.gender-option.cadre.active .gender-icon,
	.gender-option.cadre.active .gender-label {
		color: #fff;
	}

	.gender-label {
		font-size: 28rpx;
		font-weight: 500;
	}

	.input {
		flex: 1;
		font-size: 30rpx;
		color: #333;
		text-align: right;
	}

	.seat-info {
		flex: 1;
		font-size: 30rpx;
		color: #4facfe;
		text-align: right;
		font-weight: 500;
	}

	.seat-picker {
		width: 100%;
	}

	.picker-podium {
		width: 45%;
		margin: 0 auto 16rpx;
		padding: 10rpx 0;
		text-align: center;
		font-size: 20rpx;
		font-weight: bold;
		letter-spacing: 10rpx;
		color: #fff;
		background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
		border-radius: 8rpx;
	}

	.picker-classroom {
		background: #f8fafc;
		border-radius: 12rpx;
		padding: 16rpx 10rpx;
		border: 1rpx solid #e2e8f0;
	}

	.picker-row {
		display: flex;
		align-items: stretch;
		margin-bottom: 8rpx;
	}

	.picker-row:last-child {
		margin-bottom: 0;
	}

	.picker-group {
		display: flex;
		flex: 1;
		gap: 3rpx;
	}

	.picker-group-left {
		flex: 3;
	}

	.picker-group-mid {
		flex: 4;
	}

	.picker-group-right {
		flex: 3;
	}

	.picker-seat {
		flex: 1;
		aspect-ratio: 1;
		min-width: 0;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14rpx;
		box-sizing: border-box;
		transition: all 0.15s ease;
		padding: 1rpx;
	}

	.picker-seat.seat-available {
		background: #fff;
		border: 1rpx dashed #93c5fd;
		color: #60a5fa;
		cursor: pointer;
	}

	.picker-seat.seat-available:active {
		background: #dbeafe;
		transform: scale(0.92);
	}

	.picker-seat.seat-taken.male {
		background: linear-gradient(160deg, #5eb4ff 0%, #3d9af5 100%);
		color: #fff;
		border: none;
		cursor: not-allowed;
		opacity: 0.9;
	}

	.picker-seat.seat-taken.female {
		background: linear-gradient(160deg, #ffb3d1 0%, #f472b6 100%);
		color: #fff;
		border: none;
		cursor: not-allowed;
		opacity: 0.9;
	}

	.picker-seat.seat-selected {
		background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
		color: #fff;
		border: none;
		box-shadow: 0 3rpx 10rpx rgba(72, 187, 120, 0.4);
	}

	.picker-seat-name {
		font-size: 14rpx;
		font-weight: 500;
		color: inherit;
		text-align: center;
		line-height: 1.1;
		word-break: keep-all;
	}

	.picker-seat-empty {
		font-size: 20rpx;
		color: inherit;
		font-weight: 300;
	}

	.picker-aisle {
		width: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(180deg, #e8ecf1 0%, #dfe4eb 100%);
		border-top: 1rpx solid #c4cbd4;
		border-bottom: 1rpx solid #c4cbd4;
		border-radius: 2rpx;
		flex-shrink: 0;
		margin: 0 1rpx;
	}

	.picker-aisle-text {
		font-size: 8rpx;
		color: #6b7a8d;
		writing-mode: vertical-rl;
		text-orientation: upright;
		letter-spacing: 1rpx;
	}

	.picker-aisle-ph {
		width: 16rpx;
		flex-shrink: 0;
		margin: 0 1rpx;
	}

	.picker-hint {
		display: flex;
		justify-content: center;
		gap: 24rpx;
		margin-top: 16rpx;
		font-size: 22rpx;
	}

	.hint-available {
		color: #60a5fa;
	}

	.hint-taken-male {
		color: #3d9af5;
	}

	.hint-taken-female {
		color: #f472b6;
	}

	.hint-selected {
		color: #22c55e;
	}

	.selected-info {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 16rpx;
		padding: 14rpx 20rpx;
		background: #f0f9ff;
		border-radius: 10rpx;
		border: 1rpx solid #bae6fd;
	}

	.selected-label {
		font-size: 26rpx;
		color: #64748b;
	}

	.selected-value {
		font-size: 28rpx;
		font-weight: 600;
		color: #0284c7;
	}

	.textarea {
		width: 100%;
		min-height: 240rpx;
		font-size: 28rpx;
		color: #333;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
		box-sizing: border-box;
		line-height: 1.6;
	}

	.count {
		align-self: flex-end;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.actions {
		display: flex;
		gap: 30rpx;
		margin-top: 50rpx;
	}

	.btn-save {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 32rpx;
		font-weight: 500;
		color: #fff;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		border-radius: 44rpx;
		border: none;
		box-shadow: 0 6rpx 20rpx rgba(79, 172, 254, 0.35);
	}

	.btn-save:active {
		transform: scale(0.98);
	}

	.btn-delete {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 32rpx;
		font-weight: 500;
		color: #ff4d4f;
		background: #fff;
		border-radius: 44rpx;
		border: 2rpx solid #ff4d4f;
	}

	.btn-delete:active {
		background: #fff1f0;
	}
</style>