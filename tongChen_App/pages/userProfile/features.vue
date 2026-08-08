<template>
	<view class="page">
		<view class="card">
			<view class="feature-row" v-for="item in featuresData" :key="item.type" @click="handleFeatureClick(item.featuresID)">
				<text class="label">{{ item.label }}</text>
				<view class="row-right">
					<text v-if="item.type == 5" class="version-value">V{{ versionName }}</text>
					<uni-icons v-else type="right" size="18" color="#ccc" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			versionName: '',
			featuresData: [
				{ label: '功能介绍', type: 1, featuresID: 5 },
				{ label: '收费说明', type: 2, featuresID: 7 },
				{ label: '用户协议', type: 3, featuresID: 'yongHuXieYi' },
				{ label: '隐私保护', type: 4, featuresID: 'yinSiXieYi' },
				{ label: '版本号', type: 5 }
			]
		};
	},
	onLoad() {
		uni.getSystemInfo({
		    success: (res) => {
				this.versionName = res.appVersion
		        console.log('应用版本：', res.appVersion);
		    }
		});
	},
	methods: {
		handleFeatureClick(featuresID){
			if(Number(featuresID)){
				uni.navigateTo({
					url: '/pages/news/newsDetail?isNews=1&newsID=' + featuresID
				})
			} else {
				this.openWebPage(featuresID)
			}
		},
		openWebPage(cfgKey) {
			this.$http("systemCfgInfoClient", JSON.stringify({
				token: uni.getStorageSync("token") || '',
				cfgKey: cfgKey
			})).then(res => {
				const cfgValue = res.systemCfgInfo.cfgValue;
				this.navigateByUrl(cfgValue);
			}).catch(err => {
				console.error('获取配置失败:', err);
			})
		},
		navigateByUrl(url) {
			if (url.startsWith('/pages')) {
				uni.navigateTo({ url });
			} else if (url.startsWith('http')) {
				uni.navigateTo({
					url: '/pages/public/web?u=' + url
				})
			}
		}
	}
};
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 12px;
}

.card {
	background: #fff;
	border-radius: 6px;
	overflow: hidden;
}

.feature-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 16px;
	border-bottom: 1px solid #f5f5f5;
	
	&:last-child {
		border-bottom: none;
	}
	
	.label {
		font-size: 15px;
		color: #1a1a1a;
	}
	
	.row-right {
		display: flex;
		align-items: center;
		gap: 4px;
		
		.version-value {
			font-size: 14px;
			color: #999;
		}
	}
}
</style>