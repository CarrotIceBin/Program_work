<template>
	<view class="page">
		<view class="card">
			<view class="row" v-for="item in userMyData" :key="item.moduleID" @click="navigateToUserMeans(item)">
				<text class="label">{{ item.moduleName }}</text>
				<view class="row-right">
					<text class="value">{{ item.infoTxt || '' }}</text>
					<uni-icons type="right" size="18" color="#ccc" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			groupInfo: 0,
			userMyData: []
		};
	},
	onLoad(options) {
		options = options || {};
		this.groupInfo = options.groupInfo || 1;
		uni.$on('userMeans', this.loadUserInfo);
	},
	onShow() {
		this.loadUserInfo();
	},
	onUnload() {
		uni.$off('userMeans', this.loadUserInfo);
	},
	methods: {
		loadUserInfo() {
			this.$http('userInfoListMy', JSON.stringify({ 
				groupInfo: this.groupInfo,
				groupModule: 1,
				token: uni.getStorageSync('token')
			})).then((res) => {
				if (res.code == 0) {
					this.userMyData = res.infoList
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('基本资料:', err);
			});
		},
		navigateToUserMeans(item) {
			const data = encodeURIComponent(JSON.stringify({
				moduleID: item.moduleID,
				moduleName: item.moduleName,
				infoTxt: item.infoTxt,
				typeID: item.typeID,
				groupInfo: this.groupInfo,
				enumList: item.enumList ? item.enumList : []
			}));
			
			uni.navigateTo({ 
				url: `/pagesSub/user/userMeans?data=${data}`
			});
		}
	}
};
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 12px;
	overflow-y: scroll;
}

.card {
	background: #fff;
	border-radius: 6px;
	overflow: hidden;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 16px;
	font-size: 15px;
	border-bottom: 1px solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}
}

.label {
	color: #1a1a1a;
}

.value {
	color: #999;
	font-size: 14px;
}

.row-right {
	display: flex;
	align-items: center;
	gap: 4px;

	.value {
		margin-right: 2px;
	}
}
</style>
