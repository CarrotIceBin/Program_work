<template>
	<view class="container">
		<!-- 生日编辑 -->
		<view class="address_list" v-if="isUser == 1">
			<view class="address_item1">
				<text class="item_texe">生日</text>
				<view class="item_picker" @click="openDatetimePicker">{{ birthday }}</view>
				<uni-icons type="right" size="20"></uni-icons>
			</view>
		</view>

		<!-- 性别编辑 -->
		<view class="address_list" v-if="isUser == 2">
			<view class="address_item">
				<text class="item_texe">性别</text>
				<uni-data-select v-model="formData.sex" :localdata="sexOptions" @change="sexChange" />
			</view>
		</view>

		<!-- 婚姻状态 -->
		<view class="address_list" v-if="isUser == 3">
			<view class="address_item">
				<text class="item_texe">婚否</text>
				<uni-data-select v-model="formData.hyzt" :localdata="hyztOptions" @change="hyztChange" />
			</view>
		</view>

		<!-- 地区编辑 -->
		<view class="address_list" v-if="isUser == 4">
			<view class="address_item">
				<text class="item_texe">省</text>
				<hi-picker style="width: 100%;" :isPrCiArea="'province'" :dataList="provinceData" 
					:valuePicker="formData.sheng" @update:modelValue="(code, type, value) => handleAreaChange(code, type, 'sheng')"/>
			</view>
			
			<view class="address_item">
				<text class="item_texe">市</text>
				<hi-picker style="width: 100%;" :isPrCiArea="'city'" :dataList="cityData" :disabled="!formData.sheng"
					:valuePicker="formData.shi" @update:modelValue="(code, type, value) => handleAreaChange(code, type, 'shi')"/>
			</view>
			
			<view class="address_item">
				<text class="item_texe">区</text>
				<hi-picker style="width: 100%;" :isPrCiArea="'area'" :dataList="areaData" :disabled="!formData.shi"
					:valuePicker="formData.qu" @update:modelValue="(code, type, value) => handleAreaChange(code, type, 'qu')"/>
			</view>
		</view>
		
		<view class="address_list" v-if="isUser == 5">
			<view class="address_item">
				<text class="item_texe">文化</text>
				<input class="item_input" v-model="formData.wenHua" placeholder="请输入文化程度" maxlength="20"/>
			</view>
		</view>
		
		<view class="address_list" v-if="isUser == 6">
			<view class="address_item">
				<text class="item_texe">毕业学校</text>
				<input class="item_input" v-model="formData.biYeYuanXiao" placeholder="请输入毕业学校" maxlength="20"/>
			</view>
		</view>
		
		<view class="address_list" v-if="isUser == 7">
			<view class="address_item">
				<text class="item_texe">工作职业</text>
				<input class="item_input" v-model="formData.zhiYe" placeholder="请输入工作职业" maxlength="20"/>
			</view>
		</view>
		
		<view class="address_list" v-if="isUser == 8">
			<view class="address_item">
				<text class="item_texe">工作地点</text>
				<input class="item_input" v-model="formData.gongZuoDi" placeholder="请输入工作地点" maxlength="20"/>
			</view>
		</view>
		<view class="address_list" v-if="isUser == 9">
			<view class="address_item">
				<text class="item_texe">身高(cm)</text>
				<input class="item_input" type="number" v-model="formData.shengGao" placeholder="请输入身高(cm)" maxlength="4"/>
			</view>
		</view>
		<view class="address_list" v-if="isUser == 10">
			<view class="address_item">
				<text class="item_texe">星座</text>
				<input class="item_input" v-model="formData.xinZuo" placeholder="请输入星座" maxlength="10"/>
			</view>
		</view>
		<view class="address_list" v-if="isUser == 11">
			<view class="address_item">
				<text class="item_texe">座右铭</text>
				<input class="item_input" v-model="formData.zuoYouMin" placeholder="请输入座右铭" maxlength="20"/>
			</view>
		</view>
		<buuug7-simple-datetime-picker
		    ref="myPicker"
		    @submit="handleSubmit"
		    :start-year="1980"
		    :end-year="2100"
		    :time-init="currentTimestamp"
		    :time-hide="[true, true, true, false, false, false]"
		    :time-label="['年', '月', '日', '时', '分', '秒']"/>

		<button class="add-btn" @click="userMeansClick">保存</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isUser: 0,
			birthday: '',
			formData: {
				sex: '',
				hyzt: '',
				sheng: '',
				shi: '',
				qu: ''
			},
			provinceCode: '',
			cityCode: '',
			areaCode: '',
			provinceData: [],
			cityData: [],
			areaData: [],
			sexOptions: [],
			hyztOptions: [],
			currentTimestamp: Date.now()
		}
	},

	onLoad(options) {
		this.isUser = Number(options.isUser) || 0
		this.loadUserInfo()
	},

	methods: {
		async loadUserInfo() {
			try {
				const res = await this.$http("userInfo", {
					token: uni.getStorageSync("token")
				})

				if (res.code == 0) {
					this.userIInfo = res.userInfo
					this.setFormData(res.userInfo)
					
					// 加载地区数据
					if (this.isUser == 4 && res.userInfo.remark) {
						await this.processAreaData(res.userInfo.remark)
					}
				}
			} catch (error) {
				console.error('获取用户信息失败:', error)
			}
		},

		// 设置表单数据
		setFormData(userInfo) {
			this.formData = {
				sex: userInfo.sex || '',
				hyzt: userInfo.hyzt || '',
				sheng: '',
				shi: '',
				qu: ''
			}
			
			this.birthday = userInfo.birthday || ''

			// 加载选项数据
			this.loadOptions()
		},

		// 加载选项数据
		async loadOptions() {
			if (this.isUser == 2) {
				await this.userSexSelectItem()
			} else if (this.isUser == 3) {
				await this.userHyztSelectItem()
			} else if (this.isUser == 4) {
				await this.loadProvinceList()
			}
		},

		// 加载性别选项
		async userSexSelectItem() {
			try {
				const res = await this.$http("selectItemList", {
					tag: "sex",
					token: uni.getStorageSync("token")
				})
				
				if (res.code == 0) {
					this.sexOptions = res.itemList.map(item => ({
						value: item.selectValue,
						text: item.selectTxt
					}))
				}
			} catch (error) {
				console.error('加载性别选项失败:', error)
			}
		},

		// 加载婚姻状态选项
		async userHyztSelectItem() {
			try {
				const res = await this.$http("selectItemList", {
					tag: "hyzt",
					token: uni.getStorageSync("token")
				})
				
				if (res.code == 0) {
					this.hyztOptions = res.itemList.map(item => ({
						value: item.selectValue,
						text: item.selectTxt
					}))
				}
			} catch (error) {
				console.error('加载婚姻选项失败:', error)
			}
		},

		// 处理地区数据
		async processAreaData(remark) {
			const remarkArray = remark.split(" ")
			this.formData.sheng = remarkArray[0] || ''
			this.formData.shi = remarkArray[1] || ''
			this.formData.qu = remarkArray[2] || ''

			if (this.formData.sheng && this.provinceData.length > 0) {
				// 根据省份名称找到对应的 code
				const provinceItem = this.provinceData.find(item => item.name == this.formData.sheng)
				if (provinceItem) {
					this.provinceCode = provinceItem.code
					// 加载城市列表
					await this.loadCityList()
					
					// 根据城市名称找到对应的 code
					if (this.formData.shi && this.cityData.length > 0) {
						const cityItem = this.cityData.find(item => item.name == this.formData.shi)
						if (cityItem) {
							this.cityCode = cityItem.code
							// 加载区域列表
							await this.loadAreaList()
							
							// 根据区域名称找到对应的 code
							if (this.formData.qu && this.areaData.length > 0) {
								const areaItem = this.areaData.find(item => item.name == this.formData.qu)
								if (areaItem) {
									this.areaCode = areaItem.code
								}
							}
						}
					}
				}
			}
		},

		// 地区相关方法
		async loadProvinceList() {
			try {
				const res = await this.$http("provinceListClient", {
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.provinceData = res.province || []
				}
			} catch (error) {
				console.error('加载省份失败:', error)
			}
		},

		async loadCityList() {
			if (!this.provinceCode) {
				this.cityData = []
				return
			}
			
			try {
				const res = await this.$http("cityListClient", {
					code: this.provinceCode,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.cityData = res.city || []
				}
			} catch (error) {
				console.error('加载城市失败:', error)
			}
		},

		async loadAreaList() {
			if (!this.cityCode) {
				this.areaData = []
				return
			}
			
			try {
				const res = await this.$http("areaListClient", {
					code: this.cityCode,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.areaData = res.city || []
				}
			} catch (error) {
				console.error('加载区域失败:', error)
			}
		},
		sexChange(val) {
			this.formData.sex = val
		},
		hyztChange(val) {
			this.formData.hyzt = val
		},

		async handleAreaChange(code, type, field) {
			if (type == 'province') {
				this.provinceCode = code
				this.formData.sheng = this.getAreaName('province', code)
				this.resetChildData('city')
				await this.loadCityList()
			} else if (type == 'city') {
				this.cityCode = code
				this.formData.shi = this.getAreaName('city', code)
				this.resetChildData('area')
				await this.loadAreaList()
			} else if (type == 'area') {
				this.areaCode = code
				this.formData.qu = this.getAreaName('area', code)
			}
		},

		// 重置子级数据
		resetChildData(level) {
			if (level == 'city') {
				this.cityData = []
				this.areaData = []
				this.formData.shi = ''
				this.formData.qu = ''
				this.cityCode = ''
				this.areaCode = ''
			} else if (level == 'area') {
				this.areaData = []
				this.formData.qu = ''
				this.areaCode = ''
			}
		},

		// 获取地区名称
		getAreaName(type, code) {
			let dataList = []
			if (type == 'province') dataList = this.provinceData
			else if (type == 'city') dataList = this.cityData
			else if (type == 'area') dataList = this.areaData
			
			const area = dataList.find(item => item.code == code)
			return area ? area.name : ''
		},

		// 保存数据
		async userMeansClick() {
			switch (this.isUser) {
				case 1:
					await this.userBirthUpdate()
					break
				case 2:
					await this.userSexUpdate()
					break
				case 3:
					await this.userHyUpdate()
					break
				case 4:
					await this.userAreaUpdate()
					break
				case 5:
					await this.userWenHuaUpdate()
					break
				case 6:
					await this.userBiYeYuanXiaoUpdate()
					break
				case 7:
					await this.userZhiYeUpdate()
					break
				case 8:
					await this.userGongZuoDiUpdate()
					break
				case 9:
					await this.userShengGaoUpdate()
					break
				case 10:
					await this.userXinZuoUpdate()
					break
				case 11:
					await this.userZuoYouMinUpdate()
					break
			}
		},

		async userBirthUpdate() {
			if (!this.birthday) {
				uni.showToast({ title: '请选择生日', icon: 'none' });
				return;
			}
			    
			if (!this.isAdult(this.birthday)) {
				uni.showToast({ title: '年龄必须满18岁', icon: 'none' });
				return;
			}
			
			try {
				const res = await this.$http("userBirthdayUpdate", {
					birthday: this.birthday,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新生日失败:', error)
			}
		},

		async userSexUpdate() {
			try {
				const res = await this.$http("userSexUpdate", {
					sex: this.formData.sex,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新性别失败:', error)
			}
		},

		async userHyUpdate() {
			try {
				const res = await this.$http("userHyztUpdate", {
					hyzt: this.formData.hyzt,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新婚姻状态失败:', error)
			}
		},

		async userAreaUpdate() {
			try {
				const res = await this.$http("userAreacodeUpdate", {
					areacode: this.areaCode,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新地区失败:', error)
			}
		},
		
		async userWenHuaUpdate() {
			try {
				const res = await this.$http("userWenHuaUpdate", {
					wenHua: this.formData.wenHua,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新文化状态失败:', error)
			}
		},
		
		async userBiYeYuanXiaoUpdate() {
			try {
				const res = await this.$http("userBiYeYuanXiaoUpdate", {
					biYeYuanXiao: this.formData.biYeYuanXiao,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新毕业学校状态失败:', error)
			}
		},
		
		async userZhiYeUpdate() {
			try {
				const res = await this.$http("userZhiYeUpdate", {
					zhiYe: this.formData.zhiYe,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新工作职业状态失败:', error)
			}
		},
		
		async userGongZuoDiUpdate() {
			try {
				const res = await this.$http("userGongZuoDiUpdate", {
					gongZuoDi: this.formData.gongZuoDi,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新工作地点状态失败:', error)
			}
		},
		
		async userShengGaoUpdate() {
			try {
				const res = await this.$http("userShengGaoUpdate", {
					shengGao: this.formData.shengGao,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新身高状态失败:', error)
			}
		},
		
		async userXinZuoUpdate() {
			try {
				const res = await this.$http("userXinZuoUpdate", {
					xinZuo: this.formData.xinZuo,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新星座状态失败:', error)
			}
		},
		
		async userZuoYouMinUpdate() {
			try {
				const res = await this.$http("userZuoYouMinUpdate", {
					zuoYouMin: this.formData.zuoYouMin,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.onSuccess()
				}
			} catch (error) {
				console.error('更新座右铭状态失败:', error)
			}
		},
		openDatetimePicker() {
		    this.$refs.myPicker.show();
		},
		// 关闭picker
		closeDatetimePicker() {
		  this.$refs.myPicker.hide();
		},
		handleSubmit(e) {
		  this.birthday = `${e.year}-${e.month}-${e.day}`;
		},

		onSuccess() {
			uni.$emit('userMeans')
			uni.navigateBack()
		},
		// 验证生日是否满18岁
		isAdult(birthday) {
		    if (!birthday) return false;
		    
		    const birthDate = new Date(birthday);
		    const today = new Date();
		    
		    let age = today.getFullYear() - birthDate.getFullYear();
		    const monthDiff = today.getMonth() - birthDate.getMonth();
		    
		    if (monthDiff < 0 || (monthDiff == 0 && today.getDate() < birthDate.getDate())) {
		        age--;
		    }
		    
		    return age >= 18;
		}
	}
}
</script>

<style scoped lang="scss">
@mixin fron-display($justify, $align){
	display: flex;
	justify-content: $justify;
	align-items: $align;
}

::v-deep .uni-select{
	border: 0;
	padding: 0;
	padding-left: 0;
	.uni-select__input-text{
		font-size: 32rpx;
	}
}

.container{
	background-color: #F0F0F0;
	padding-top: 20rpx;
	height: 100vh;
	touch-action: none;
}

.address_list{
	padding: 0 40rpx;
	background: #fff;
}

.address_item {
	@include fron-display('', center);
	border-bottom: 1rpx solid #e5e5e5;
	height: 100rpx;
	font-size: 32rpx;
	
	.item_texe {
		width: 180rpx;
	}
	.item_input {
		flex: 1;
		font-size: 32rpx;
	}
	
	&:last-of-type {
		border-bottom: none;
	}
}

.address_item1 {
	@include fron-display(space-between, center);
	border-bottom: 1rpx solid #e5e5e5;
	height: 100rpx;
	font-size: 32rpx;
	
	.item_texe {
		width: 180rpx;
	}
	.item_picker{
		@include fron-display(flex-end, center);
		width: 100%;
		padding-right: 20rpx;
		color: #999;
	}
}

.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690rpx;
	height: 88rpx;
	margin: 60rpx auto;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10rpx;
	background: #FD7031;
}
</style>