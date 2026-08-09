<template>
	<scroll-view scroll-y class="container" :show-scrollbar="false">
		<view class="podium">讲 台</view>
		<view class="classroom" :class="{ 'move-mode': moveMode }">
			<view class="row" v-for="row in totalRows" :key="row">
				<view class="seat-group seat-group-left">
					<view
						class="seat"
						v-for="col in leftCols"
						:key="'l-' + col"
						:class="getSeatClass(row, col)"
						@click="onSeatClick(row, col)"
					>
						<block v-if="getStudent(row, col)">
							<view class="cadre-badge" v-if="getStudent(row, col).isClassCadre">★</view>
							<text class="seat-name">{{ getStudent(row, col).name }}</text>
						</block>
						<block v-else>
							<text class="seat-empty">+</text>
						</block>
					</view>
				</view>
				<view class="aisle" v-if="row === 1">
					<text class="aisle-text">过道</text>
				</view>
				<view class="aisle-placeholder" v-else></view>
				<view class="seat-group seat-group-mid">
					<view
						class="seat"
						v-for="col in midCols"
						:key="'m-' + col"
						:class="getSeatClass(row, col)"
						@click="onSeatClick(row, col)"
					>
						<block v-if="getStudent(row, col)">
							<view class="cadre-badge" v-if="getStudent(row, col).isClassCadre">★</view>
							<text class="seat-name">{{ getStudent(row, col).name }}</text>
						</block>
						<block v-else>
							<text class="seat-empty">+</text>
						</block>
					</view>
				</view>
				<view class="aisle" v-if="row === 1">
					<text class="aisle-text">过道</text>
				</view>
				<view class="aisle-placeholder" v-else></view>
				<view class="seat-group seat-group-right">
					<view
						class="seat"
						v-for="col in rightCols"
						:key="'r-' + col"
						:class="getSeatClass(row, col)"
						@click="onSeatClick(row, col)"
					>
						<block v-if="getStudent(row, col)">
							<view class="cadre-badge" v-if="getStudent(row, col).isClassCadre">★</view>
							<text class="seat-name">{{ getStudent(row, col).name }}</text>
						</block>
						<block v-else>
							<text class="seat-empty">+</text>
						</block>
					</view>
				</view>
			</view>
		</view>
		<view class="legend">
			<view class="legend-item">
				<view class="legend-color male"></view>
				<text class="legend-text">男生</text>
			</view>
			<view class="legend-item">
				<view class="legend-color female"></view>
				<text class="legend-text">女生</text>
			</view>
			<view class="legend-item">
				<view class="legend-color cadre">★</view>
				<text class="legend-text">班委</text>
			</view>
			<view class="legend-item" v-if="moveMode">
				<view class="legend-color selected"></view>
				<text class="legend-text">已选中</text>
			</view>
		</view>
		<view class="toolbar">
			<block v-if="!moveMode">
				<button class="btn-add" @click="onAddStudent">+ 添加学生</button>
				<button class="btn-move" @click="onEnterMoveMode">移动座位</button>
				<button class="btn-roster" @click="onViewRoster">学生名单</button>
			</block>
			<block v-else>
				<view class="move-tip">
					<text class="tip-icon">💡</text>
					<text class="tip-text">{{ selectedStudent ? '已选中「' + selectedStudent.name + '」，点击目标座位' : '请点击要移动的学生' }}</text>
				</view>
				<button class="btn-cancel" @click="onCancelMove">取消</button>
			</block>
		</view>
	</scroll-view>
</template>

<script>
	import { getStudentList, resetStudents, saveStudentList } from '@/utils/storage.js'

	export default {
		data() {
			return {
				students: [],
				totalRows: 6,
				leftCols: [1, 2, 3],
				midCols: [4, 5, 6, 7],
				rightCols: [8, 9, 10],
				moveMode: false,
				selectedStudentId: null
			}
		},
		computed: {
			selectedStudent() {
				if (!this.selectedStudentId) return null
				return this.students.find(s => s.id === this.selectedStudentId)
			}
		},
		onShow() {
			this.students = getStudentList()
			this.moveMode = false
			this.selectedStudentId = null
		},
		methods: {
			getStudent(row, col) {
				return this.students.find(s => s.row === row && s.col === col)
			},
			getSeatClass(row, col) {
				const s = this.getStudent(row, col)
				const classes = []
				if (!s) {
					classes.push('empty-seat')
				} else {
					if (s.gender === 'female') {
						classes.push('has-student', 'female')
					} else {
						classes.push('has-student', 'male')
					}
					if (s.isClassCadre) {
						classes.push('is-cadre')
					}
					if (this.moveMode && s.id === this.selectedStudentId) {
						classes.push('selected-for-move')
					}
				}
				if (this.moveMode && s && s.id !== this.selectedStudentId) {
					classes.push('move-target')
				}
				if (this.moveMode && !s) {
					classes.push('move-target-empty')
				}
				return classes.join(' ')
			},
			onSeatClick(row, col) {
				if (this.moveMode) {
					this.onMoveSeatClick(row, col)
				} else {
					const student = this.getStudent(row, col)
					if (student) {
						uni.navigateTo({
							url: '/pages/detail/detail?id=' + student.id
						})
					} else {
						uni.navigateTo({
							url: '/pages/detail/detail?row=' + row + '&col=' + col
						})
					}
				}
			},
			onEnterMoveMode() {
				this.moveMode = true
				this.selectedStudentId = null
				uni.showToast({ title: '进入移动模式', icon: 'none' })
			},
			onCancelMove() {
				this.moveMode = false
				this.selectedStudentId = null
			},
			onMoveSeatClick(row, col) {
				const targetStudent = this.getStudent(row, col)
				if (!this.selectedStudentId) {
					if (targetStudent) {
						this.selectedStudentId = targetStudent.id
						uni.vibrateShort && uni.vibrateShort({ type: 'light' })
					} else {
						uni.showToast({ title: '请选择一个有学生的座位', icon: 'none' })
					}
					return
				}
				const selected = this.selectedStudent
				if (!selected) {
					this.selectedStudentId = null
					return
				}
				if (targetStudent && targetStudent.id === selected.id) {
					this.selectedStudentId = null
					return
				}
				if (targetStudent) {
					const tempRow = selected.row
					const tempCol = selected.col
					selected.row = targetStudent.row
					selected.col = targetStudent.col
					targetStudent.row = tempRow
					targetStudent.col = tempCol
					uni.showToast({ title: '已交换座位', icon: 'success' })
				} else {
					selected.row = row
					selected.col = col
					uni.showToast({ title: '已移动座位', icon: 'success' })
				}
				saveStudentList(this.students)
				this.selectedStudentId = null
			},
			onAddStudent() {
				uni.navigateTo({
					url: '/pages/detail/detail'
				})
			},
			onViewRoster() {
				uni.navigateTo({
					url: '/pages/roster/roster'
				})
			},
			onReset() {
				uni.showModal({
					title: '确认重置',
					content: '重置后所有学生信息将恢复初始状态，确定要重置吗？',
					success: (res) => {
						if (res.confirm) {
							this.students = resetStudents()
							uni.showToast({ title: '已重置', icon: 'success' })
						}
					}
				})
			}
		}
	}
</script>

<style>
	.container {
		padding: 16rpx 12rpx;
		background: linear-gradient(180deg, #edf2f7 0%, #f8fafc 100%);
		min-height: 100vh;
		box-sizing: border-box;
	}

	.podium {
		width: 50%;
		margin: 4rpx auto 16rpx;
		padding: 10rpx 0;
		text-align: center;
		font-size: 24rpx;
		font-weight: bold;
		letter-spacing: 12rpx;
		color: #fff;
		background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(90, 103, 216, 0.3);
	}

	.classroom {
		background: #fff;
		border-radius: 20rpx;
		padding: 16rpx 12rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #edf0f5;
		transition: all 0.3s ease;
	}

	.classroom.move-mode {
		border: 3rpx solid #f59e0b;
		box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.2);
	}

	.row {
		display: flex;
		align-items: stretch;
		margin-bottom: 12rpx;
	}

	.row:last-child {
		margin-bottom: 0;
	}

	.seat-group {
		display: flex;
		gap: 4rpx;
	}

	.seat-group-left {
		flex: 3;
	}

	.seat-group-mid {
		flex: 4;
	}

	.seat-group-right {
		flex: 3;
	}

	.seat {
		flex: 1;
		aspect-ratio: 1;
		min-width: 0;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18rpx;
		transition: all 0.18s ease;
		box-sizing: border-box;
		position: relative;
		padding: 2rpx;
	}

	.seat.has-student.male {
		background: linear-gradient(160deg, #5eb4ff 0%, #3d9af5 60%, #2979db 100%);
		color: #fff;
		box-shadow: 0 4rpx 10rpx rgba(61, 154, 245, 0.35), inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
		border: none;
	}

	.seat.has-student.female {
		background: linear-gradient(160deg, #ffb3d1 0%, #f472b6 60%, #db2777 100%);
		color: #fff;
		box-shadow: 0 4rpx 10rpx rgba(244, 114, 182, 0.35), inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
		border: none;
	}

	.seat.has-student.is-cadre.male {
		border: 2rpx solid #f59e0b;
		box-shadow: 0 4rpx 10rpx rgba(61, 154, 245, 0.35), 0 0 8rpx rgba(245, 158, 11, 0.4), inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
	}

	.seat.has-student.is-cadre.female {
		border: 2rpx solid #f59e0b;
		box-shadow: 0 4rpx 10rpx rgba(244, 114, 182, 0.35), 0 0 8rpx rgba(245, 158, 11, 0.4), inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
	}

	.cadre-badge {
		position: absolute;
		top: -2rpx;
		right: -2rpx;
		width: 16rpx;
		height: 16rpx;
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		border-radius: 50%;
		font-size: 10rpx;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1rpx 3rpx rgba(245, 158, 11, 0.5);
		border: 1rpx solid #fff;
		z-index: 2;
	}

	.seat.has-student:active {
		transform: scale(0.9);
	}

	.seat.selected-for-move {
		animation: pulse 0.8s infinite;
		box-shadow: 0 0 0 3rpx #f59e0b, 0 6rpx 16rpx rgba(245, 158, 11, 0.5) !important;
		transform: scale(1.08);
		z-index: 10;
	}

	.seat.move-target-empty {
		background: #fef3c7 !important;
		border: 1rpx dashed #f59e0b !important;
		color: #d97706 !important;
		animation: emptyPulse 1.5s infinite;
	}

	.seat.move-target-empty .seat-empty {
		color: #d97706;
	}

	@keyframes pulse {
		0%, 100% {
			box-shadow: 0 0 0 3rpx #f59e0b, 0 6rpx 16rpx rgba(245, 158, 11, 0.5);
		}
		50% {
			box-shadow: 0 0 0 6rpx #fbbf24, 0 6rpx 20rpx rgba(245, 158, 11, 0.7);
		}
	}

	@keyframes emptyPulse {
		0%, 100% { background: #fef3c7; }
		50% { background: #fde68a; }
	}

	.seat-name {
		font-size: 18rpx;
		font-weight: 600;
		color: #fff;
		text-align: center;
		line-height: 1.1;
		word-break: keep-all;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.seat.empty-seat {
		background: #f7f9fc;
		border: 1rpx dashed #d5dbe3;
		color: #c0c8d3;
	}

	.seat-empty {
		font-size: 20rpx;
		color: #c0c8d3;
		font-weight: 300;
	}

	.aisle {
		width: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(180deg, #e8ecf1 0%, #dfe4eb 100%);
		border-top: 2rpx solid #c4cbd4;
		border-bottom: 2rpx solid #c4cbd4;
		border-radius: 3rpx;
		position: relative;
		flex-shrink: 0;
	}

	.aisle-text {
		font-size: 10rpx;
		color: #6b7a8d;
		letter-spacing: 1rpx;
		writing-mode: vertical-rl;
		text-orientation: upright;
		font-weight: 500;
		z-index: 1;
	}

	.aisle-placeholder {
		width: 20rpx;
		flex-shrink: 0;
		border-top: 2rpx solid #cdd3db;
		border-bottom: 2rpx solid #cdd3db;
		border-radius: 3rpx;
		background: linear-gradient(180deg, #eef1f5 0%, #e6ebf0 100%);
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: 24rpx;
		margin-top: 12rpx;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.legend-color {
		width: 20rpx;
		height: 20rpx;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12rpx;
		color: #fff;
	}

	.legend-color.male {
		background: linear-gradient(160deg, #5eb4ff 0%, #3d9af5 60%, #2979db 100%);
	}

	.legend-color.female {
		background: linear-gradient(160deg, #ffb3d1 0%, #f472b6 60%, #db2777 100%);
	}

	.legend-color.cadre {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		border: 1rpx solid #fff;
	}

	.legend-color.selected {
		background: linear-gradient(160deg, #fbbf24 0%, #f59e0b 100%);
	}

	.legend-text {
		font-size: 20rpx;
		color: #6b7a8d;
	}

	.toolbar {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 16rpx;
		gap: 12rpx;
		flex-wrap: wrap;
	}

	.btn-add, .btn-move, .btn-roster, .btn-cancel {
		font-size: 24rpx;
		padding: 12rpx 28rpx;
		border-radius: 30rpx;
		border: none;
		white-space: nowrap;
		line-height: 1.4;
	}

	.btn-add {
		background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
		color: #fff;
		box-shadow: 0 4rpx 14rpx rgba(72, 187, 120, 0.35);
		font-weight: 500;
	}

	.btn-add:active { transform: scale(0.95); }

	.btn-move {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: #fff;
		box-shadow: 0 4rpx 14rpx rgba(245, 158, 11, 0.35);
		font-weight: 500;
	}

	.btn-move:active { transform: scale(0.95); }

	.btn-roster {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		box-shadow: 0 4rpx 14rpx rgba(102, 126, 234, 0.35);
		font-weight: 500;
	}

	.btn-roster:active { transform: scale(0.95); }

	.btn-cancel {
		background: #fff;
		color: #6b7a8d;
		border: 2rpx solid #e2e8f0;
		font-weight: 500;
	}

	.btn-cancel:active { background: #f7f9fc; }

	.move-tip {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 10rpx 16rpx;
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		border-radius: 30rpx;
		border: 2rpx solid #f59e0b;
	}

	.tip-icon { font-size: 20rpx; }
	.tip-text { font-size: 20rpx; color: #92400e; font-weight: 500; }
</style>