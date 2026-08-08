<template>
	<view class="page-container">
		<view class="form-card">
			<view class="upload-section">
				<text class="label label-required">门店招牌图片</text>
				<uni-file-picker v-model="fileList" file-mediatype="image" file-extname="png,jpg,jpeg" :limit="1"
					@select="handleFileSelect" @delete="handleFileDelete"></uni-file-picker>
			</view>
			<view class="form-item" @click="openCategoryPopup">
				<text class="label">分类名称</text>
				<view class="value">{{ formData.menDianFlmc || '请选择' }}</view>
			</view>
			<view class="form-item">
				<text class="label">门店名称</text>
				<input class="input" v-model="formData.mdmc" placeholder="请输入门店名称" maxlength="18" />
			</view>

			<view class="form-item">
				<text class="label">联系人</text>
				<input class="input" v-model="formData.contract" placeholder="请输入联系人" maxlength="8" />
			</view>

			<view class="form-item">
				<text class="label">联系电话</text>
				<input class="input" type="number" v-model="formData.mobile" placeholder="请输入联系电话" maxlength="11" />
			</view>

			<view class="form-item">
				<text class="label">省</text>
				<hi-picker class="picker" :isPrCiArea="'province'" :dataList="provinceData"
					:valuePicker="formData.sheng" @update:modelValue="handleAreaChange" />
			</view>

			<view class="form-item">
				<text class="label">市</text>
				<hi-picker class="picker" :isPrCiArea="'city'" :dataList="cityData" :disabled="!provinceCode"
					:valuePicker="formData.shi" @update:modelValue="handleAreaChange" />
			</view>

			<view class="form-item">
				<text class="label">县/区</text>
				<hi-picker class="picker" :isPrCiArea="'area'" :dataList="areaData" :disabled="!cityCode"
					:valuePicker="formData.qu" @update:modelValue="handleAreaChange" />
			</view>

			<view class="form-item-textarea">
				<text class="label">详细地址</text>
				<textarea class="textarea" v-model="formData.xxdz" placeholder="请输入详细地址" maxlength="50" />
			</view>

			<!-- 协议勾选 -->
			<view class="agreement-section">
				<view class="agreement-check" @click="toggleAgree">
					<view class="checkbox" :class="{ checked: agreed }">
						<uni-icons v-if="agreed" type="checkmarkempty" size="14" color="#fff"></uni-icons>
					</view>
					<text class="agreement-text">
						我已阅读并同意
						<text class="agreement-link" @click.stop="showAgreement">《同城圈门店入驻协议》</text>
					</text>
				</view>
			</view>

			<button class="submit-btn" :loading="isSubmitting" @click="handleSubmit">
				{{ isSubmitting ? '提交中...' : '保存' }}
			</button>
		</view>

		<!-- 协议弹窗 -->
		<uni-popup ref="agreePopup" type="bottom" border-radius="20rpx 20rpx 0 0">
			<view class="agree-popup">
				<view class="agree-header">
					<text class="agree-title">同城圈门店入驻协议</text>
					<text class="agree-close" @click="$refs.agreePopup.close()">×</text>
				</view>
				<scroll-view class="agree-content" scroll-y>
					<view class="agree-section">
						<text class="agree-text">第一条 协议目的</text>
						<text class="agree-detail">本协议是您（入驻商家）与同城圈平台之间就门店入驻事宜所订立的具有法律约束力的协议。请您在提交入驻申请前仔细阅读本协议的全部内容。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第二条 入驻条件</text>
						<text class="agree-detail">1. 您必须持有合法有效的营业执照及相关资质证明；\n2. 您经营的商品/服务必须符合国家法律法规及平台规定；\n3. 您需提供真实、完整的门店信息及联系方式。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第三条 权责义务</text>
						<text class="agree-detail">1. 您承诺所发布的商品/服务信息真实准确，不存在虚假宣传；\n2. 您需对消费者的合法权益负责，提供优质的商品和服务；\n3. 您需遵守平台的各项规则和管理制度；\n4. 您不得利用平台从事任何违法违规活动。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第四条 费用结算</text>
						<text class="agree-detail">1. 平台按照约定比例收取服务费；\n2. 交易款项通过平台指定渠道结算；\n3. 您需按规定开具发票。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第五条 违约处理</text>
						<text class="agree-detail">如您违反本协议任何条款，平台有权采取以下措施：\n1. 警告通知；\n2. 限制或暂停店铺运营；\n3. 扣除相应保证金；\n4. 终止合作协议；\n5. 追究法律责任。</text>
					</view>
					<view class="agree-section">
						<text class="agree-text">第六条 其他条款</text>
						<text class="agree-detail">1. 本协议自您签署之日起生效；\n2. 本协议解释权归平台所有；\n3. 如您对协议内容有异议，请停止使用平台服务。</text>
					</view>
				</scroll-view>
				<view class="agree-bottom">
					<button class="agree-btn" @click="agreeAndClose">我已阅读并同意</button>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0">
			<view class="popup-content">
				<view class="popup-header">门店分类</view>
				<scroll-view class="category-list" scroll-y>
					<view class="category-item" v-for="item in categoryList" :key="item.selectValue"
						@click="selectCategory(item)">
						{{ item.selectTxt }}
					</view>
				</scroll-view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { qiniuUrl } from "@/utils/api.js"

export default {
	data() {
		return {
			isMenDian: 0,
			menDianID: 0,
			fileList: [],
			formData: {
				sheng: '',
				shi: '',
				qu: '',
				xxdz: '',
				menDianFlmc: '',
				menDianFlid: '',
				mdmc: '',
				contract: '',
				mobile: '',
				iconUrl: '',
			},
			provinceCode: '',
			cityCode: '',
			areaCode: '',
			categoryList: [],
			provinceData: [],
			cityData: [],
			areaData: [],
			isSubmitting: false,
			agreed: false
		}
	},
	computed: {
		isFormValid() {
			const { mdmc, contract, mobile, sheng, shi, qu, xxdz, menDianFlid } = this.formData
			const phoneRegex = /^1[3-9]\d{9}$/

			return (
				menDianFlid &&
				mdmc.trim() &&
				contract.trim() &&
				mobile &&
				phoneRegex?.test(mobile) &&
				sheng &&
				shi &&
				qu &&
				xxdz.trim()
			)
		}
	},
	onLoad(option) {
		this.isMenDian = Number(option.isMenDian || 0)

		if (option.isMenDian) {
			const title = this.isMenDian == 1 ? '编辑门店' : '添加门店'
			uni.setNavigationBarTitle({ title })
		}

		if (option.menDianID) {
			this.menDianID = option.menDianID
		}

		this.initPage()
	},
	methods: {
		async initPage() {
			try {
				const tasks = [
					this.loadCategoryList(),
					this.loadProvinceList()
				]

				if (this.menDianID) {
					tasks.push(this.getMenDianInfo())
				}

				await Promise.all(tasks)
			} catch (error) {
				console.error('页面初始化失败:', error)
			}
		},

		async getMenDianInfo() {
			try {
				const res = await this.$http("menDianInfo", JSON.stringify({
					mdID: this.menDianID,
					token: uni.getStorageSync('token') || ""
				}))

				if (res.code == 0) {
					this.formData = res.newsInfo
					const fileImage = res.newsInfo.iconUrl
					const menDianAddress = res.newsInfo.areaName

					if (fileImage) {
						this.fileList = [{ url: fileImage, name: '门店图片' }]
					}

					if (menDianAddress) {
						const parts = menDianAddress.split(" ");
						this.formData.sheng = parts[0] || '';
						this.formData.shi = parts[1] || '';
						this.formData.qu = parts[2] || '';
						this.formData.xxdz = this.formData.address || '';

						// 确保省份数据已加载
						if (this.provinceData.length == 0) {
							await this.loadProvinceList()
						}

						// 根据省份名称找到对应的 code
						if (this.formData.sheng && this.provinceData.length > 0) {
							const provinceItem = this.provinceData.find(item => item.name == this.formData.sheng);
							if (provinceItem) {
								this.provinceCode = provinceItem.code;
								// 加载城市列表
								await this.loadCityList();
								// 根据城市名称找到对应的 code
								if (this.formData.shi && this.cityData.length > 0) {
									const cityItem = this.cityData.find(item => item.name == this.formData.shi);
									if (cityItem) {
										this.cityCode = cityItem.code;
										// 加载区域列表
										await this.loadAreaList();
										if (this.formData.qu && this.areaData.length > 0) {
											const areaItem = this.areaData.find(item => item.name == this.formData.qu);
											if (areaItem) {
												this.areaCode = areaItem.code;
											}
										}
									}
								}
							}
						}
					}
				} else {
					uni.showToast({ title: res.msg, icon: "none" })
				}
			} catch (err) {
				console.error('获取信息失败:', err)
			}
		},

		async loadCategoryList() {
			try {
				const res = await this.$http("selectItemList", JSON.stringify({
					tag: "mendian_fl",
					token: uni.getStorageSync("token") || ''
				}))

				if (res.code == 0) {
					this.categoryList = res.itemList || []
				}
			} catch (error) {
				console.error('加载分类失败:', error)
			}
		},

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
				return Promise.resolve()
			}

			try {
				const res = await this.$http("cityListClient", {
					code: this.provinceCode,
					token: uni.getStorageSync("token")
				})

				if (res.code == 0) {
					this.cityData = res.city || []
				}
				return Promise.resolve()
			} catch (error) {
				console.error('加载城市失败:', error)
				return Promise.resolve()
			}
		},

		async loadAreaList() {
			if (!this.cityCode) {
				this.areaData = []
				return Promise.resolve()
			}

			try {
				const res = await this.$http("areaListClient", {
					code: this.cityCode,
					token: uni.getStorageSync("token")
				})
				if (res.code == 0) {
					this.areaData = res.city || []
				}
				return Promise.resolve()
			} catch (error) {
				console.error('加载区域失败:', error)
				return Promise.resolve()
			}
		},

		handleAreaChange(code, type, value) {
			if (type == 'province') {
				this.provinceCode = code
				this.formData.sheng = value
				this.resetChildData('city')
				this.loadCityList()
			} else if (type == 'city') {
				this.cityCode = code
				this.formData.shi = value
				this.resetChildData('area')
				this.loadAreaList()
			} else if (type == 'area') {
				this.areaCode = code
				this.formData.qu = value
			}
		},

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

		openCategoryPopup() {
			this.$refs.popup.open('bottom')
		},

		selectCategory(item) {
			this.formData.menDianFlid = item.selectValue
			this.formData.menDianFlmc = item.selectTxt
			this.$refs.popup.close()
		},

		handleFileSelect(e) {
			const file = e.tempFiles[0]
			if (file) {
				this.uploadToQiniu(file)
			}
		},

		handleFileDelete() {
			this.formData.iconUrl = ""
			this.fileList = []
		},

		async uploadToQiniu(file) {
			try {
				const tokenRes = await this.$http("qiNiuToken", JSON.stringify({
					token: uni.getStorageSync("token")
				}))

				const uploadResult = await new Promise((resolve, reject) => {
					uni.uploadFile({
						url: 'https://upload.qiniup.com',
						filePath: file.path,
						name: 'file',
						formData: {
							'token': tokenRes.para.upToken
						},
						success: (res) => {
							if (res.statusCode === 200) {
								try {
									resolve(JSON.parse(res.data))
								} catch (e) {
									reject(new Error('解析结果失败'))
								}
							} else {
								reject(new Error('上传失败'))
							}
						},
						fail: reject
					})
				})

				const imageUrl = qiniuUrl + uploadResult.hash

				this.formData.iconUrl = imageUrl
				this.fileList = [{
					url: imageUrl,
					extname: file.extname,
					name: file.name,
					size: file.size
				}]
			} catch (error) {
				console.error('上传失败:', error)
				uni.showToast({ title: '图片上传失败', icon: 'none' })
				this.fileList = []
			}
		},

		toggleAgree() {
			this.agreed = !this.agreed
		},

		showAgreement() {
			this.$refs.agreePopup.open('bottom')
		},

		agreeAndClose() {
			this.agreed = true
			this.$refs.agreePopup.close()
		},

		async handleSubmit() {
			// 1. 防止重复提交
			if (this.isSubmitting) {
				uni.showToast({ title: '正在提交，请稍候...', icon: 'none', duration: 1500 })
				return;
			}

			// 检查是否同意协议
			if (!this.agreed) {
				uni.showToast({ title: '请先阅读并同意协议', icon: 'none', duration: 2000 })
				return;
			}

			// 2. 表单验证
			if (!this.isFormValid) {
				const missing = []
				if (!this.formData.menDianFlid) missing.push('分类')
				if (!this.formData.mdmc || !this.formData.mdmc.trim()) missing.push('门店名称')
				if (!this.formData.contract || !this.formData.contract.trim()) missing.push('联系人')
				if (!this.formData.mobile) missing.push('联系电话')
				else if (!/^1[3-9]\d{9}$/.test(this.formData.mobile)) missing.push('联系电话格式')
				if (!this.formData.sheng) missing.push('省')
				if (!this.formData.shi) missing.push('市')
				if (!this.formData.qu) missing.push('县/区')
				if (!this.formData.xxdz || !this.formData.xxdz.trim()) missing.push('详细地址')
				
				uni.showToast({ title: `请填写: ${missing.join('、')}`, icon: 'none', duration: 2000 })
				return;
			}

			this.isSubmitting = true

			try {
				let res;
				const submitData = this.prepareSubmitData()
				
				if (this.isMenDian == 1) {
					submitData.mdID = this.menDianID
					res = await this.$http("menDianMyEdit", submitData)
				} else {
					res = await this.$http("menDianSqdAddByUser", submitData)
				}

				if (res.code == 0) {
					await this.handleSuccess()
				} else {
					throw new Error(res.msg || '提交失败')
				}

			} catch (error) {
				uni.showToast({ title: error.msg, icon: 'none' })
			} finally {
				this.isSubmitting = false
			}
		},

		prepareSubmitData() {
			return {
				rangeID: 1,
				percentSx: 0,
				menDianFlid: this.formData.menDianFlid,
				mdmc: this.formData.mdmc || '',
				contract: this.formData.contract || '',
				mobile: this.formData.mobile || '',
				address: (this.formData.xxdz || '').trim(),
				areaCode: this.areaCode || '',
				iconUrl: this.formData.iconUrl || '',
				remark: this.formData.remark || '',
				token: uni.getStorageSync("token")
			}
		},

		async handleSuccess() {
			const msg = this.isMenDian == 1 ? '保存成功' : '添加成功'
			uni.showToast({ title: msg, icon: 'none' })

			await new Promise(resolve => setTimeout(resolve, 800))

			// #ifdef MP-WEIXIN
			const pages = getCurrentPages()
			const prevPage = pages[pages.length - 2]
			prevPage.$vm.isMenDian = this.isMenDian
			prevPage.onShow && prevPage.onShow()
			// #endif

			// #ifdef APP || H5
			uni.$emit('menDianPage', this.isMenDian)
			// #endif

			uni.navigateBack({ delta: 1 })
		}
	}
}
</script>

<style scoped lang="scss">
.page-container {
	background-color: #f8f9fa;
	padding: 20rpx;
	height: 100vh;
}

.form-card {
	background: #fff;
	border-radius: 10rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.upload-section {
	display: flex;
	align-items: center;
	padding-bottom: 15px;
	border-bottom: 0.5px solid #f0f0f0;
}

.form-item {
	display: flex;
	align-items: center;
	height: 100rpx;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-of-type {
		border-bottom: none;
	}
}

.label {
	flex-shrink: 0;
	width: 160rpx;
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.label-required {
	color: #ff0000;
	font-weight: bold;
}

.input {
	flex: 1;
	font-size: 30rpx;
	color: #333;
	height: 100rpx;
	line-height: 100rpx;
}

.value {
	flex: 1;
	font-size: 30rpx;
	color: #333;
	height: 100rpx;
	line-height: 100rpx;
}

.picker {
	flex: 1;
}

.form-item-textarea {
	display: flex;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.textarea {
	flex: 1;
	max-height: 180rpx;
	font-size: 30rpx;
	color: #333;
	line-height: 1.5;
}

/* 协议勾选样式 */
.agreement-section {
	padding: 30rpx 0 10rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.agreement-check {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.checkbox {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #ddd;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	transition: all 0.2s;

	&.checked {
		background: linear-gradient(135deg, #FD7031, #FF8F5E);
		border-color: #FD7031;
	}
}

.agreement-text {
	font-size: 26rpx;
	color: #666;
}

.agreement-link {
	color: #FD7031;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	margin-top: 40rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #fff;
	background: linear-gradient(135deg, #FD7031, lighten(#FD7031, 8%));
	border: none;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 16rpx rgba(#FD7031, 0.3);

	&[disabled] {
		background: #c0c4cc;
		color: #fff;
		box-shadow: none;
	}
}

/* 协议弹窗样式 */
.agree-popup {
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.agree-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.agree-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.agree-close {
	font-size: 48rpx;
	color: #999;
	line-height: 1;
	padding: 0 20rpx;
}

.agree-content {
	flex: 1;
	padding: 30rpx;
	max-height: 60vh;
}

.agree-section {
	margin-bottom: 30rpx;
}

.agree-text {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
}

.agree-detail {
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
	white-space: pre-line;
}

.agree-bottom {
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.agree-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #FD7031, lighten(#FD7031, 8%));
	color: #fff;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 12rpx;
	border: none;
}

/* 弹窗样式 */
.popup-content {
	background: #fff;
	padding: 30rpx 0;
}

.popup-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 30rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
}

.category-list {
	max-height: 600rpx;
}

.category-item {
	padding: 30rpx;
	font-size: 30rpx;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;

	&:active {
		background-color: #f5f5f5;
	}
}

.placeholder {
	color: #c0c4cc;
	font-size: 30rpx;
}
</style>
