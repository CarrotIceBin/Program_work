<template>
	<view class="container">
		<uni-nav-bar class="nav-bar-top" :fixed="true" :statusBar="true">
			<block slot="left">
				<view class="user-info" @click="backClick">
					<uni-icons type="left" size="24" color="#333"></uni-icons>
					<view class="user-main">少跑路({{ subptionData.length || 0 }})</view>
				</view>
			</block>
			<block slot="right">
				<view class="nav-right" @click="searchClick">
					<image src="/static/index/search.png" mode="aspectFit" class="search-icon"></image>
				</view>
			</block>
		</uni-nav-bar>
		
		<view class="platform-grid" :style="'padding-top:'+ topHeight +'px;'">
		    <block v-for="(item, index) in subptionData" :key="index">
				<view class="store-item" @click="subptionClick(item.mdID)">
					<view class="store-header">
					    <view class="platform-icon">
					        <image :src="item.iconUrl" mode="aspectFill"></image>
					    </view>
						<view class="platform-state">{{ item.menDianFlmc || '新' }}</view>
					</view>
					<view class="store-content">
						<view class="store-name">{{ item.mdmc }}</view>
						<view class="store-address">{{ item.address }}</view>
						<view class="store-time">{{ item.inputTime }}</view>
					</view>
				</view>
		    </block>
			<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		</view>
	</view>
</template>

<script>
export default {
	data(){
		return {
			pages: 0,
			topHeight: 0,
			subptionData: [],
			pagesInfo: {
				total_num: 0,
				per_num: 0
			},
			statusLoadMore: "more",
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				contentnomore: '没有更多数据了'
			}
		}
	},
	onLoad() {
		const getInfo = uni.getWindowInfo()
		this.topHeight = getInfo.statusBarHeight ? Number(getInfo.statusBarHeight) + 55 : 55;
		this.menDianClient();
	},
	onReachBottom() {
		if (this.pagesInfo.total_num > this.pagesInfo.per_num) {
			this.statusLoadMore = "loading";
			this.pages++;
			this.menDianClient();
		}
	},
	methods: {
		menDianClient(){
			this.$http("menDianListClient", JSON.stringify({
				mdmc: "",
				menDianFlid: 0,
				pg: this.pages,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				if (res.code == 0) {
					this.handleSuccessMenDian(res);
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		handleSuccessMenDian(res) {
			const subptionInfo = res.mdList.pgInfo;
			
			if (this.pages == 0) {
				this.subptionData = [];
			}
			
			this.subptionData = [...this.subptionData, ...res.mdList.datas];
			this.pagesInfo = subptionInfo;
			
			this.updateLoadMoreStatus(subptionInfo);
		},
		updateLoadMoreStatus(subptionInfo) {
			if (subptionInfo.total_num == 0) {
				this.statusLoadMore = "more";
				this.contentText.contentdown = '暂无数据';
			} else if (this.subptionData.length >= subptionInfo.total_num) {
				this.statusLoadMore = "noMore";
			} else {
				this.statusLoadMore = "more";
			}
		},
		subptionClick(menDianID){
			uni.navigateTo({
				url: '/pages/menDian/menDianInfo?menDianID=' + menDianID
			})
		},
		backClick(){
			uni.navigateBack({ delta: 1 });
		},
		searchClick(){
			// 搜索功能
		}
	}
}
</script>

<style scoped lang="scss">
.container {
	background-color: #f5f5f5; /* 改为浅灰色背景 */
	min-height: 100vh;
}

.nav-bar-top{
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	background-color: #FFF;
	z-index: 100;
	box-shadow: 0 2px 10px rgba(0,0,0,0.1); /* 添加阴影 */
}

.nav-bar-top ::v-deep .uni-navbar__header-container {
	display: none !important;
}
.nav-bar-top ::v-deep .uni-navbar__header-btns-left {
	width: 140px !important;
}
.nav-bar-top ::v-deep .uni-navbar__header-btns-right{
	width: 220px !important;
}

.user-info {
	display: flex;
	align-items: center;
	height: 100%;
}

.user-main {
	font-size: 18px;
	color: #333333;
	font-weight: 600;
	margin-left: 5px;
}

.nav-right {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
}

.search-icon {
	width: 20px;
	height: 20px;
}

.platform-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
	padding: 10px;
}

.store-item {
    // background-color: #ffffff;
    // border-radius: 12px;
    // padding: 15px;
    // margin-bottom: 10px;
	position: relative;
}
.platform-icon {
    width: 100%;
    height: 90px;
    border-radius: 6px;
    overflow: hidden;
    image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.platform-state{
    position: absolute;
    top: 20px;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFF;
    background-color: #FD7031;
    border-radius: 50%;
    font-size: 12px;
    height: 54px;
    width: 54px;
    border: 2px solid #FFF;
	padding: 8px;
	text-align: center;
}

.store-content {
	position: absolute;
	top: 10px;
	left: 10px;
	color: #FFF;
	width: 76%;
    .store-name {
        font-size: 16px;
        font-weight: 600;
        // color: #333;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    
    .store-address {
        font-size: 14px;
        // color: #666;
        margin-bottom: 6px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .store-time {
        font-size: 12px;
        // color: #999;
        margin-top: 4px;
    }
}
</style>