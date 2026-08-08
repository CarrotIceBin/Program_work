<template>
	<view class="content">
		<view class="category-list" ref="categoryRef">
			<block v-for="(item, index) in newsFlData" :key="index">
				<view class="category-item" :class="{ newsFlActive: newsFlIndex == item.selectValue }"
					@tap="selectCategory(index)">
					{{ item.selectTxt }}
				</view>
			</block>
		</view>
		
		<view class="news_list">
			<block v-for="(item, index) in newsData" :key="index">
				<view class="news_item" @tap="newsInfoClick(item.newsID)">
					<view class="news_img">
						<image :src="item.iconUrl" mode="aspectFill"></image>
					</view>
					<view class="info_container">
						<view class="news_title line-clamp-2">{{ item.newsTitle }}</view>
						<view class="meta_container line-clamp-1">{{ item.remark }}</view>
						<view class="time_container">{{ item.inputTime }}</view>
					</view>
				</view>
			</block>
			<!-- 加载更多 -->
			<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		</view>
	</view>
</template>

<script>
import { commonApi } from '@/utils/common.js'

export default {
	data() {
		return {
			newsFlData: [],
			newsData: [], 
			newsFlIndex: 0, 
			pages: 0,  
			
			// 加载状态
			statusLoadMore: "more",
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				contentnomore: '没有更多数据了'
			},
			// 分页信息
			pagesInfo: {
				total_num: 0,
				per_num: 0
			}
		}
	},
	onLoad() {
		this.selectItemNews();
	},
	onReachBottom() {
		if (this.hasMoreData()) {
			this.statusLoadMore = "loading";
			this.pages++;
			this.newsClient();
		}
	},
	onPullDownRefresh() {
		this.pages = 0;
		this.newsData = [];
		this.newsClient();
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	methods: {
		hasMoreData() {
			return parseFloat(this.pagesInfo.total_num) > parseFloat(this.pagesInfo.per_num);
		},
		
		async selectItemNews() {
			const newsFlData = await commonApi().selectItem('news_fl');
			  
			this.newsFlData = newsFlData;
			this.newsFlIndex = newsFlData[0]?.selectValue || '';
			this.pages = 0;
			this.newsData = [];
			  
			// 并行执行，提高性能
			await Promise.all([
				this.newsClient(),
				this.scrollToActive('categoryRef', 'newsFlActive')
			]);
		},
		
		newsClient(){
			this.$http("newsListClient", JSON.stringify({
				token: uni.getStorageSync("token"),
				newsTitle: "",
				newsFlid: this.newsFlIndex,
				pg: this.pages
			})).then(res => {
				if (res.code == 0) {
					// 分页数据处理
					if (this.pages == 0) {
						this.newsData = res.newsList.datas || [];
					} else {
						this.newsData = [...this.newsData, ...(res.newsList.datas || [])];
					}
					
					const newsInfo = res.newsList.pgInfo;
					this.pagesInfo = newsInfo || {};
					this.updateLoadMoreStatus();
				} else {
					uni.showToast({ title: res.msg, icon: "none" })
				}
			}).catch(err => {
				console.log(err)
				uni.showToast({ title: '请求失败', icon: "none" })
			})
		},
		
		selectCategory(index) {
			const newsFlIndex = this.newsFlData[index].selectValue;
			if(this.newsFlIndex == newsFlIndex) return;
			
			this.newsFlIndex = newsFlIndex;
			this.scrollToActive('categoryRef', 'newsFlActive');
			this.pages = 0;
			this.newsData = [];
			this.newsClient();
		},
		
		newsInfoClick(newsID){
			uni.navigateTo({
				url: '/pages/news/newsDetail?newsID=' + newsID
			})
		},
		
		scrollToActive(refName, activeClass) {
			this.$nextTick(() => {
				const container = this.$refs[refName]?.$el || this.$refs[refName];
				if (!container) return;
				
				const activeItem = container.querySelector(`.${activeClass}`);
				if (activeItem) {
					const scrollLeft = activeItem.offsetLeft - (container.offsetWidth - activeItem.offsetWidth) / 2;
					container.scrollTo({
						left: scrollLeft,
						behavior: 'smooth'
					});
				}
			});
		},
		
		// 更新加载状态
		updateLoadMoreStatus() {
			if (this.newsData.length == 0) {
				this.statusLoadMore = "more";
				this.contentText.contentdown = '暂无数据';
			} else if (this.newsData.length >= this.pagesInfo.total_num) {
				this.statusLoadMore = "noMore";
				this.contentText.contentdown = '没有更多数据了';
			} else {
				this.statusLoadMore = "more";
				this.contentText.contentdown = '';
			}
		}
	}
}
</script>

<style scoped lang="scss">
.content{
	min-height: 100vh;
	padding: 0 20rpx;
	padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
/* 分类标签样式优化 */
.category-list {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 0;
    overflow-x: auto;
    position: relative;
}

.category-list::-webkit-scrollbar {
    display: none;
}

.category-item {
    flex: 0 0 auto;
    padding: 20rpx 22rpx;
    border-radius: 10rpx;
    font-size: 28rpx;
    font-weight: 500;
    background: #ffffff;
    color: #666666;
    border: 2rpx solid #e8e8e8;
    transition: all 0.3s ease;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
    user-select: none;
}

.category-item.newsFlActive {
    background: linear-gradient(135deg, #FD7031, #FF9447);
    color: #ffffff;
    border-color: transparent;
}

/* 新闻列表样式优化 */
.news_list {
    overflow-y: auto;
    padding-bottom: 20rpx;
}

.news_list::-webkit-scrollbar {
    width: 6rpx;
}

.news_list::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #FD7031, #FF9447);
    border-radius: 6rpx;
}

.news_list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6rpx;
}

.news_item {
    display: flex;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background: #ffffff;
    border-radius: 10rpx;
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.news_item:last-child {
    margin-bottom: 0;
}

.news_img {
    width: 200rpx;
    height: 200rpx;
    flex-shrink: 0;
}

.news_img image {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
    background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}

.info_container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-left: 20rpx;
    overflow: hidden;
}

.news_title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6rpx;
}

.meta_container {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 20rpx;
    font-weight: 400;
}

.time_container {
    font-size: 24rpx;
    color: #999;
    margin-top: auto;
    font-weight: 400;
}

.time_container::before {
    font-size: 22rpx;
}

/* 文本截断优化 */
.line-clamp-1 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-height: 1.4;
}

.line-clamp-2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.5;
}

/* 加载更多样式 */
.uni-load-more {
    margin: 50rpx 0 30rpx;
}
</style>