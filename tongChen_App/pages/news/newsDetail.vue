<template>
	<view class="content">
		<view class="newsmark-detail" v-if="newsDetailData.length > 0">
			<view class="entrance" v-if="newsViewData.length>0">
				<swiper class="entrance_ads" :autoplay="configs.autoplay" :interval="configs.interval"
					:indicator-dots="configs.indicator" :circular="configs.circular" :duration="configs.duration">
					<swiper-item v-for="(item, index) in newsViewData" :key='index'>
						<image :src="item.url" mode="aspectFill"></image>
					</swiper-item>
				</swiper>
			</view>
			<view class="newsmark-container">
				<view class="newsmark-header">
					<view class="news-title">{{ newsMarkInfo.newsTitle}}</view>
					<view class="news-time">{{ newsMarkInfo.inputTime }}</view>
				</view>
				<view class="newsmark-content">
					<block v-for="(item, index) in newsDetailData" :key="index">
						<view class="content-item">
							<view class="content-remark" v-if="item.remark"><text v-html="item.remark"></text></view>
							<view class="content-image" v-if="item.url">
								<image :src="item.url" mode="widthFix"></image>
							</view>
						</view>
					</block>
				</view>
			</view>
			<!-- 底部操作栏 -->
			<view class="bottom-action-bar" v-if="isNews == 0">
				<view class="action-buttons">
					<view class="action-btn">
						<button class="btn_action" open-type="share">
							<view class="btn_action_view">
								<uni-icons type="weixin" size="24" color="#666"></uni-icons>
								<text class="btn-text">分享</text>
							</view>
						</button>
					</view>
				</view>
				
				<view class="product_2" v-if="newsMarkInfo.href" @click="buyNowClick(newsMarkInfo.href)">{{ newsMarkInfo.hrefName || '跳转' }}</view>
			</view>
		</view>
		<view class="news_zwsj" v-if="newsDetailData.length == 0">暂无数据</view>
	</view>
</template>

<script>
export default {
	data(){
		return {
			isNews: 0,
			newsID: 0,
			newsMarkInfo: {},
			newsViewData: [],
			newsDetailData: [],
			
			configs: {
				indicator: true,
				autoplay: true,
				circular: true,
				interval: 4000,
				duration: 500
			}
		}
	},
	onLoad(options){
		const { isNews, newsID } = options;
		this.isNews = isNews || 0;
		this.newsID = newsID || 0;
		
		this.newsIInfo();
	},
	onShareAppMessage(res){
		return {
			title: this.newsMarkInfo.hrefName + '',
			path: '/pages/news/newsDetail?newsID=' + this.newsMarkInfo.newsID,
			imageUrl: this.newsMarkInfo.iconUrl + ''
		}
	},
	methods: {
		newsIInfo() {
			this.$http("newsInfo", JSON.stringify({
				token: uni.getStorageSync("token") || '',
				newsID: this.newsID,
				userid: ''
			})).then(res => {
				if (res.code == 0) {
					uni.setNavigationBarTitle({ 
						title: res.newsInfo.newsTitle
					});
					
					this.newsMarkInfo = res.newsInfo;
					this.newsViewData = res.newsInfo.imgList.viewList;
					this.newsDetailData = res.newsInfo.imgList.detailList;
				} else {
					if(res.code != 4){
						uni.showToast({ title: res.msg, icon: "none" })
					}
				}
			}).catch(err => {
				console.log(err)
			})
		},
		buyNowClick(viewUrl){
			if (!viewUrl) return;
			
			uni.navigateTo({ url: viewUrl });
		}
	}
}
</script>

<style scoped lang="scss">
.content {
    padding: 0 20rpx;
    background: #ffffff;
    min-height: 100vh;
}

.newsmark-detail {
	height: 100vh;
    display: flex;
    flex-direction: column;
}

.entrance {
    height: 400rpx;
	margin-bottom: 20rpx;
    
    .entrance_ads {
        height: 100%;
        
        image {
            width: 100%;
            height: 100%;
			border-radius: 10rpx;
        }
    }
}

.newsmark-header {
    margin-bottom: 20rpx;
}

.news-title {
    font-size: 40rpx;
    font-weight: 700;
    margin-bottom: 6rpx;
    color: #1a1a1a;
}

.news-time {
    font-size: 26rpx;
    color: #999;
}

.newsmark-content {
    display: flex;
    flex-direction: column;
	padding-bottom: calc(130rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
}

.content-item {
    display: flex;
    flex-direction: column;
	margin-bottom: -2rpx;
}

.content-remark {
    font-size: 32rpx;
    color: #444444;
    text-align: justify;
    line-height: 1.8;
}

.content-image {
    width: 100%;
    overflow: hidden;
    
    image {
        width: 100%;
        height: auto;
        display: block;
    }
}

.news_zwsj {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    font-size: 32rpx;
	margin-top: 120rpx;
}

/* 底部操作栏 */
.bottom-action-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	padding: 20rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1rpx solid #f0f0f0;
	
	.action-buttons {
		display: flex;
		align-items: center;
		margin-right: 20rpx;
		
		.action-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 80rpx;
			height: 80rpx;
			position: relative;
			
			.btn-text {
				font-size: 20rpx;
				color: #666;
				margin-top: 8rpx;
			}
		}
	}
	
	.btn_action{
		padding: 0 !important;
		background: transparent !important;
		margin: 0 !important;
		position: unset !important;
		height: unset !important;
		line-height: unset !important;
		margin-left: 10rpx;
		
		.btn_action_view{
			width: 96rpx;
			display: flex;
			color: #666;
			font-size: 22rpx;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		
		.btn-text {
			font-size: 20rpx;
			color: #666;
			margin-top: 8rpx;
		}
		
		&::after {
			border: none !important;
			content: none !important;
		}
	}
	
	.product_2{
		display: flex;
		align-items: center;
		color: #FFFFFF;
		background: #FD7031;
		border-radius: 10rpx;
		height: 88rpx;
		font-size: 32rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
		padding: 0 30rpx;
	}
}
</style>