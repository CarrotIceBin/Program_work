<template>
	<view class="info-edit-container">
		<!-- 文本输入类型 -->
		<view class="info-item" v-if="typeID == 1">
			<text class="item-label">{{ moduleName }}</text>
			<input class="item-input" type="text" v-model="infoTxt" :placeholder="'请输入' + moduleName" maxlength="100" />
		</view>

		<!-- 日期选择类型 -->
		<view class="info-item info-item-picker" v-if="typeID == 2" @click="showDateTimePicker">
			<text class="item-label">{{ moduleName }}</text>
			<text class="item-value">{{ infoTxt || '请选择日期' }}</text>
			<uni-icons type="right" size="20" color="#999"></uni-icons>
		</view>

		<!-- 下拉选择类型 -->
		<view class="info-item" v-if="typeID == 5 || typeID == 6">
			<text class="item-label">{{ moduleName }}</text>
			<uni-data-select v-model="infoTxt" :localdata="optionsData" @change="handleSelectChange" />
		</view>

		<!-- 地址三级联动类型 -->
		<view class="info-item address-container" v-if="typeID == 8">
			<view class="address-item">
				<text class="address-label">省</text>
				<hi-picker
					style="flex: 1"
					:isPrCiArea="'province'"
					:dataList="provinceData"
					:valuePicker="formData.sheng"
					@update:modelValue="(code, type) => handleAreaChange(code, type, 'sheng')"
				/>
			</view>
			<view class="address-item">
				<text class="address-label">市</text>
				<hi-picker
					style="flex: 1"
					:isPrCiArea="'city'"
					:dataList="cityData"
					:disabled="!formData.sheng"
					:valuePicker="formData.shi"
					@update:modelValue="(code, type) => handleAreaChange(code, type, 'shi')"
				/>
			</view>
			<view class="address-item">
				<text class="address-label">区</text>
				<hi-picker
					style="flex: 1"
					:isPrCiArea="'area'"
					:dataList="areaData"
					:disabled="!formData.shi"
					:valuePicker="formData.qu"
					@update:modelValue="(code, type) => handleAreaChange(code, type, 'qu')"
				/>
			</view>
		</view>

		<!-- 日期选择器组件 -->
		<buuug7-simple-datetime-picker
			ref="datetimePicker"
			@submit="handleDateTimeSubmit"
			:start-year="1980"
			:end-year="2100"
			:time-init="currentTimestamp"
			:time-hide="[true, true, true, false, false, false]"
			:time-label="['年', '月', '日', '时', '分', '秒']"
		/>

		<view class="save-btn" @click="handleSave">保存</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			typeID: 0, // 字段类型：1文本 2日期 5/6下拉 8地址
			groupInfo: 0,
			moduleID: '', // 模块ID
			moduleName: '', // 字段名称
			infoTxt: '', // 字段值
			optionsData: [], // 下拉选项数据
			localSave: false, // 是否本地保存
			localKey: '', // 本地存储key

			// 地址相关
			provinceCode: '',
			cityCode: '',
			areaCode: '',
			provinceData: [],
			cityData: [],
			areaData: [],
			formData: {
				sheng: '',
				shi: '',
				qu: ''
			},
			currentTimestamp: Date.now()
		};
	},

	onLoad(options) {
		try {
			const data = JSON.parse(decodeURIComponent(options.data));
			this.initData(data);
		} catch (error) {
			console.error('解析参数失败:', error);
			uni.showToast({ title: '参数错误', icon: 'none' });
		}
	},

	methods: {
		initData(data) {
			const { moduleID, moduleName, infoTxt, typeID, groupInfo, enumList, localSave, localKey } = data;
			
			this.groupInfo = groupInfo || 1;
			this.typeID = typeID || 1;
			this.moduleID = moduleID || '';
			this.moduleName = moduleName || '';
			this.infoTxt = infoTxt || '';
			this.localSave = localSave || false;
			this.localKey = localKey || `xiangQin_${moduleID}`;

			// 处理下拉选项
			if (enumList && Array.isArray(enumList)) {
				this.optionsData = enumList.map((item) => ({
					value: item.selectTxt,
					text: item.selectTxt
				}));
			}

			if (this.typeID == 8) {
				this.loadProvinceList();
			}
		},

		async loadProvinceList() {
			try {
				const res = await this.$http('provinceListClient', {
					token: uni.getStorageSync('token')
				});
				if (res.code == 0 && res.province) {
					this.provinceData = res.province;
				}
			} catch (error) {
				console.error('加载省份失败:', error);
			}
		},

		async loadCityList() {
			if (!this.provinceCode) {
				this.cityData = [];
				return;
			}
			try {
				const res = await this.$http('cityListClient', {
					code: this.provinceCode,
					token: uni.getStorageSync('token')
				});
				if (res.code == 0 && res.city) {
					this.cityData = res.city;
				}
			} catch (error) {
				console.error('加载城市失败:', error);
			}
		},

		async loadAreaList() {
			if (!this.cityCode) {
				this.areaData = [];
				return;
			}
			try {
				const res = await this.$http('areaListClient', {
					code: this.cityCode,
					token: uni.getStorageSync('token')
				});
				if (res.code == 0 && res.city) {
					this.areaData = res.city;
				}
			} catch (error) {
				console.error('加载区域失败:', error);
			}
		},

		handleAreaChange(code, type, field) {
			if (type == 'province') {
				this.provinceCode = code;
				this.formData.sheng = this.getAreaName('province', code);
				this.resetChildData('city');
				this.loadCityList();
			} else if (type == 'city') {
				this.cityCode = code;
				this.formData.shi = this.getAreaName('city', code);
				this.resetChildData('area');
				this.loadAreaList();
			} else if (type == 'area') {
				this.areaCode = code;
				this.formData.qu = this.getAreaName('area', code);
				this.infoTxt = code;
			}
		},

		resetChildData(level) {
			if (level == 'city') {
				this.cityData = [];
				this.areaData = [];
				this.formData.shi = '';
				this.formData.qu = '';
				this.cityCode = '';
				this.areaCode = '';
			} else if (level == 'area') {
				this.areaData = [];
				this.formData.qu = '';
				this.areaCode = '';
			}
		},

		getAreaName(type, code) {
			const dataMap = {
				province: this.provinceData,
				city: this.cityData,
				area: this.areaData
			};
			const list = dataMap[type] || [];
			const item = list.find((item) => item.code == code);
			return item ? item.name : '';
		},

		handleSelectChange(val) {
			this.infoTxt = val;
		},

		showDateTimePicker() {
			this.$refs.datetimePicker?.show();
		},

		handleDateTimeSubmit(e) {
			const { year, month, day } = e;
			this.infoTxt = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		},

		async handleSave() {
			if (this.localSave) {
				try {
					uni.setStorageSync(this.localKey, this.infoTxt);
					uni.$emit('userMeans');
					uni.navigateBack();
				} catch (error) {
					console.error('本地保存失败:', error);
					uni.showToast({ title: '保存失败，请重试', icon: 'none' });
				}
				return;
			}

			try {
				const res = await this.$http('userInfoSet', {
					groupInfo: this.groupInfo,
					moduleID: this.moduleID,
					infoTxt: this.infoTxt,
					token: uni.getStorageSync('token')
				});

				if (res.code == 0) {
					uni.$emit('userMeans');
					uni.navigateBack();
				} else {
					uni.showToast({ title: res.msg || '保存失败', icon: 'none' });
				}
			} catch (error) {
				console.error('保存失败:', error);
				uni.showToast({ title: '保存失败，请重试', icon: 'none' });
			}
		}
	}
};
</script>

<style scoped lang="scss">
.info-edit-container {
	height: 100vh;
	background: #f5f6fa;
	padding: 20rpx;
}

.info-item {
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 10rpx;
	padding: 28rpx 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.item-label {
	font-size: 30rpx;
	color: #333333;
	width: 140rpx;
	flex-shrink: 0;
}

.item-input {
	flex: 1;
	font-size: 30rpx;
	color: #333;
	padding: 0 10rpx;

	&::placeholder {
		color: #cccccc;
	}
}

.info-item-picker {
	cursor: pointer;

	.item-value {
		flex: 1;
		font-size: 30rpx;
		color: #333;
		text-align: right;
		margin-right: 10rpx;
	}
}

// 地址样式
.address-container {
	flex-direction: column;
	align-items: stretch;
	padding: 10rpx 0;

	.address-item {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.address-label {
			font-size: 30rpx;
			color: #666;
			width: 60rpx;
			flex-shrink: 0;
		}
	}
}

// 保存按钮
.save-btn {
	margin-top: 40rpx;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	background: #FD7031;
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 10rpx;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

:deep(.uni-data-select) {
	width: 100%;

	.uni-select {
		border: none;
		padding: 0;
		min-height: auto;
	}

	.uni-select__input-text {
		font-size: 30rpx;
		color: #333;
	}
}

/deep/.picker-header {
	.cancel{
		background-color: unset !important;
	}
	.submit{
		background-color: #FD7031 !important;
	}
}
</style>
