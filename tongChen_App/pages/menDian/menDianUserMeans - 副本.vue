<template>
	<view class="page-container">
		<view class="form-card">
			<view class="upload-section">
				<text class="label">走马灯</text>
				<uni-file-picker 
					:value="viewImages"
					file-mediatype="image"
					file-extname="png,jpg,jpeg"
					:limit="2"
					@select="handleViewFileSelect"
					@delete="handleViewFileDelete"
				></uni-file-picker>
			</view>
			
			<view class="upload-section">
				<text class="label">详情图</text>
				<uni-file-picker 
					:value="detailImages"
					file-mediatype="image"
					file-extname="png,jpg,jpeg"
					:limit="8"
					@select="handleDetailFileSelect"
					@delete="handleDetailFileDelete"
				></uni-file-picker>
			</view>
			
			<button class="submit-btn" :loading="isSubmitting" @click="handleSubmit">
				{{ isSubmitting ? '提交中...' : '确定' }}
			</button>
		</view>
	</view>
</template>

<script>
import { qiniuUrl } from "@/utils/api.js"

export default {
	data() {
		return {
			isMenDian: 0,
			menDianID: 0,
			menDianNum: 0,
			isSubmitting: false,
			menDianImageData: [],    // 原始图片数据
			availableImgIDs: {        // 可复用的imgID
				view: [],            // 走马灯可用ID
				detail: []           // 详情图可用ID
			},
			viewImages: [],
			detailImages: [],
			pendingFiles: {
				view: [],
				detail: []
			}
		}
	},
	
	onLoad(option) {
		const { menDianID, menDianNum } = option;
		this.menDianID = menDianID || 0
		this.menDianNum = menDianNum || 0
		this.loadImageList()
	},
	
	methods: {
		async loadImageList() {
			try {
				const res = await this.$http("imgPoolListManageByUser", {
					imgID: this.menDianID,
					num: this.menDianNum,
					token: uni.getStorageSync('token') || ""
				})
				
				if (res.code == 0) {
					this.processImageData(res.imgList)
				} else {
					uni.showToast({ title: res.msg, icon: 'none' })
				}
			} catch (error) {
				console.error('加载图片失败:', error)
				uni.showToast({ title: '加载失败', icon: 'none' })
			}
		},
		
		processImageData(data = []) {
			this.menDianImageData = data
			
			// 初始化可用ID列表
			this.availableImgIDs = {
				view: data
					.filter(item => item.sortName === '走马灯' && (!item.url || item.url.trim() === ''))
					.map(item => item.imgID),
				detail: data
					.filter(item => item.sortName === '详情图' && (!item.url || item.url.trim() === ''))
					.map(item => item.imgID)
			}
			
			const configs = [
				{ key: 'viewImages', sortName: '走马灯' },
				{ key: 'detailImages', sortName: '详情图' }
			]
			
			configs.forEach(config => {
				this[config.key] = data
					.filter(item => item.sortName === config.sortName && item.url && item.url.trim() !== '')
					.map(item => this.createImageItem(item, false))
			})
		},
		
		createImageItem(item, isLocal = false) {
			const baseItem = {
				imgID: item.imgID || 0,
				url: item.url || '',
				remark: item.remark || '',
				sortName: item.sortName || ''
			}
			
			return isLocal ? {
				...baseItem,
				url: item.path,
				extname: item.extname || 'jpg',
				size: item.size,
				isLocal: true,
				localPath: item.path,
				file: item
			} : {
				...baseItem,
				extname: this.getFileExtension(item.url),
				isLocal: false
			}
		},
		
		getFileExtension(url) {
			return url?.match(/\.(png|jpg|jpeg)$/i)?.[1]?.toLowerCase() || 'jpg'
		},
		
		handleViewFileSelect(e) {
			this.handleFileSelect(e.tempFiles || [], 'view')
		},
		handleViewFileDelete(e) {
			this.handleFileDelete(e, 'view')
		},
		handleDetailFileSelect(e) {
			this.handleFileSelect(e.tempFiles || [], 'detail')
		},
		handleDetailFileDelete(e) {
			this.handleFileDelete(e, 'detail')
		},
		
		handleFileSelect(files, type) {
			files.forEach(file => {
				const imageItem = this.createImageItem({ 
					...file, 
					sortName: type === 'view' ? '走马灯' : '详情图' 
				}, true)
				this[`${type}Images`].push(imageItem)
				this.pendingFiles[type].push(file)
			})
		},
		
		async handleFileDelete(e, type) {
			const index = e.index
			const images = this[`${type}Images`]
			
			if (index < 0 || index >= images.length) return
			
			const item = images[index]
			
			// 判断是否为已存在的远程图片（有imgID且不是本地文件）
			const isRemoteImage = item.imgID && item.imgID > 0 && !item.isLocal
			
			if (isRemoteImage) {
				try {
					uni.showLoading({ title: '删除中...', icon: 'none' })
					const res = await this.$http("imgPoolDel", {
						imgID: item.imgID,
						token: uni.getStorageSync("token")
					})
					
					if (res.code == 0) {
						// 将imgID添加到可用ID列表中，以便后续上传使用
						this.availableImgIDs[type].push(item.imgID)
						
						// 从原始数据中更新状态
						const dataIndex = this.menDianImageData.findIndex(
							dataItem => dataItem.imgID == item.imgID
						)
						if (dataIndex > -1) {
							this.menDianImageData[dataIndex].url = ''
						}
						
						uni.showToast({ title: '删除成功', icon: 'none' })
					} else {
						uni.showToast({ title: res.msg || '删除失败', icon: 'none' })
						return // 删除失败，不执行后续操作
					}
				} catch (error) {
					console.error('删除图片失败:', error)
				} finally {
					uni.hideLoading()
				}
			}
			
			// 如果是本地文件，从待上传列表中移除
			if (item.isLocal) {
				const fileIndex = this.pendingFiles[type].findIndex(f => 
					f.path === item.localPath
				)
				if (fileIndex > -1) {
					this.pendingFiles[type].splice(fileIndex, 1)
				}
			}
			
			// 移除图片
			images.splice(index, 1)
		},
		
		async uploadFileToQiniu(file) {
			const tokenRes = await this.$http("qiNiuToken", {
				token: uni.getStorageSync("token")
			})
			
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: 'https://upload.qiniup.com',
					filePath: file.path,
					name: 'file',
					formData: { token: tokenRes.para.upToken },
					success: (res) => {
						if (res.statusCode == 200) {
							try {
								const result = JSON.parse(res.data)
								resolve(qiniuUrl + result.hash)
							} catch {
								reject(new Error('解析结果失败'))
							}
						} else {
							reject(new Error('上传失败'))
						}
					},
					fail: reject
				})
			})
		},
		
		async uploadPendingFiles() {
			const result = { viewList: [], detailList: [] }
			
			for (const type of ['view', 'detail']) {
				const pendingCount = this.pendingFiles[type].length
				const availableIDs = this.availableImgIDs[type] || []
				
				// 只上传有可用ID的图片
				let usedIDs = [] // 记录已使用的ID
				for (let i = 0; i < Math.min(pendingCount, availableIDs.length); i++) {
					try {
						const url = await this.uploadFileToQiniu(this.pendingFiles[type][i])
						const imgID = availableIDs[i]
						usedIDs.push(imgID) // 记录使用的ID
						
						result[`${type}List`].push({
							imgID: imgID,
							url,
							remark: '',
							sortName: type === 'view' ? '走马灯' : '详情图'
						})
					} catch (error) {
						console.error(`${type}图片上传失败:`, error)
					}
				}
				
				// 从可用ID列表中移除已使用的ID
				if (usedIDs.length > 0) {
					this.availableImgIDs[type] = availableIDs.filter(id => !usedIDs.includes(id))
				}
			}
			
			return result
		},
		
		getExistingImages(type) {
			return this[`${type}Images`]
				.filter(item => {
					// 过滤条件：不是本地文件、有imgID、有URL、URL不为空、且URL不是以qiniuUrl开头
					return !item.isLocal && 
						   item.imgID > 0 && 
						   item.url && 
						   item.url.trim() !== '' &&
						   !item.url.startsWith(qiniuUrl)
				})
				.map(item => ({
					imgID: item.imgID,
					url: item.url,
					remark: item.remark || '',
					sortName: item.sortName
				}))
		},
		
		async handleSubmit() {
			if (this.isSubmitting) return
			
			this.isSubmitting = true
			
			try {
				// 上传新图片
				let uploadedUrls = { viewList: [], detailList: [] }
				if (this.pendingFiles.view.length || this.pendingFiles.detail.length) {
					uni.showLoading({ title: '正在上传图片...', mask: true })
					uploadedUrls = await this.uploadPendingFiles()
					uni.hideLoading()
				}
				
				// 合并所有图片数据
				const allImageList = [
					...this.getExistingImages('view'),
					...this.getExistingImages('detail'),
					...uploadedUrls.viewList,
					...uploadedUrls.detailList
				]
				
				if (!allImageList.length) {
					uni.showToast({ title: '请至少上传一张图片', icon: 'none' })
					return
				}
				
				// 批量提交
				const { success, fail } = await this.batchSubmitImages(allImageList)
				
				// 显示结果
				this.showSubmitResult(success, fail)
				
				// 清空并返回
				this.pendingFiles = { view: [], detail: [] }
				setTimeout(() => {
					// #ifdef MP-WEIXIN
					const pages = getCurrentPages();
					const prevPage = pages[pages.length - 2];
					prevPage.$vm.isMenDian = this.isMenDian;
					prevPage.onShow()
					// #endif
					
					// #ifdef APP || H5
					uni.$emit('menDianMeans');
					// #endif

					uni.navigateBack({ delta: 1 });
				}, 500)
				
			} catch (error) {
				console.error('提交失败:', error)
				uni.showToast({ 
					title: error.message || '网络错误，请重试', 
					icon: 'none' 
				})
			} finally {
				this.isSubmitting = false
			}
		},
		
		async batchSubmitImages(imageList) {
			let success = 0, fail = 0
			
			for (const imageItem of imageList) {
				try {
					const res = await this.$http("imgPoolEdit", {
						imgID: imageItem.imgID || 0,
						url: imageItem.url || '',
						remark: imageItem.remark || '',
						sortName: imageItem.sortName || '',
						token: uni.getStorageSync("token")
					})
					
					if (res.code == 0) {
						success++
					} else {
						fail++
						console.error('单条图片保存失败:', res.msg)
					}
				} catch (error) {
					fail++
					console.error('单条图片提交失败:', error)
				}
				
				await this.delay(100)
			}
			
			return { success, fail }
		},
		
		showSubmitResult(success, fail) {
			if (fail === 0) {
				uni.showToast({ title: `保存成功，共${success}张图片`, icon: 'none', duration: 3000 })
			} else {
				uni.showToast({  title: `保存完成，成功${success}张，失败${fail}张`, icon: 'none', duration: 3000 })
			}
		},
		
		delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms))
		}
	}
}
</script>

<style scoped lang="scss">
.page-container {
	background-color: #f8f9fa;
	padding: 20rpx;
	height: 100vh;
	touch-action: none;
}

.form-card {
	background: #fff;
	border-radius: 10rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.upload-section {
	display: flex;
	flex-direction: column;
	padding-bottom: 20rpx;
	
	&:last-child {
		border-bottom: none;
		margin-bottom: 0;
	}
}

.label {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 20rpx;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	margin-top: 20rpx;
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
</style>