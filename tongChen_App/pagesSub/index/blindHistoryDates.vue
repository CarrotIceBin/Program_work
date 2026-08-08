<template>
	<view class="blind_history">
		<block v-for="(item, index) in newsUserMyData" :key="index">
			<view class="blind_history_list">
				<view class="blind_1">
					<view class="blind_1_image">
						<image :src="item.iconUrl" mode=""></image>
					</view>
					<view class="blind_1_1">
						<view class="blind_1_1_1">{{item.newsTitle}}</view>
						<view class="">{{item.remark}}</view>
					</view>
				</view>
			</view>
		</block>
		<view class="blind_wdxq" @click="releaseClick">
			<text class="blind_wdtext">发布</text>
		</view>
		<uni-load-more :status="statusLoadMore" :content-text="contentText" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			pages: 0,
			newsFlID: 0,
			newsUserMyData: [],
			
			statusLoadMore: "more",
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				contentnomore: '没有更多数据了'
			},
			pagesInfo: {
				total_num: 0,
				per_num: 0
			}
		}
	},
	onLoad(options) {
		if(options.type){
			this.newsFlID = options.type
			
			switch (Number(options.type)) {
				case 1:
					uni.setNavigationBarTitle({
						title: '我的心情'
					});
				break;
				case 2:
					uni.setNavigationBarTitle({
						title: '我的交友'
					});
				break;
				case 3:
					uni.setNavigationBarTitle({
						title: '我的相亲'
					});
				break;
			}
		}
		
		this.newsUserMy();
		uni.$on('blindHistory', this.blindHistory)
	},
	onReachBottom() {
		if(parseFloat(this.pagesInfo.total_num) > parseFloat(this.pagesInfo.per_num)){
			this.statusLoadMore = "loading"
			this.pages ++
			this.newsUserMy()
			
			var that = this
			setTimeout(function() {	
				// 显示没有更多数据了
				that.statusLoadMore = "nomore"
			}, 1000)
		}
	},
	methods: {
		blindHistory(index){
			this.newsFlID = index
			this.newsUserMy();
		},
		newsUserMy(){
			this.$http("newsUserListMy", JSON.stringify({
				newsFlid: this.newsFlID,
				pg: this.pages,
				token: uni.getStorageSync("token")
			})).then(res=>{
				if (res.code == 0) {
					const couponPg = res.newsList.pgInfo
					this.newsUserMyData = res.newsList.datas
					
					if(parseFloat(couponPg.total_num) != 0){
						if(parseFloat(couponPg.total_num) <= parseFloat(couponPg.per_num)){
							this.contentText.contentdown = '没有更多数据了'
						} else {
							this.pagesInfo = couponPg
						}
					} else {
						this.contentText.contentdown = '暂无数据'
					}
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		releaseClick(){
			uni.navigateTo({
				url: '/pages/friends/release?type=' + this.newsFlID
			})
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

.blind_history{
	padding: 0 10px 55px;
	overflow-y: scroll;
	height: calc(100vh - 45px);
	
	.blind_history_list{
		padding-top: 10px;
		margin-bottom: 10px;
	}
}

.blind_1{
	@include fron-display('', '');
	.blind_1_image{
		width: 120px;
		height: 120px;
		
		image{
			width: 100%;
			height: 100%;
			border-radius: 6px;
		}
	}
	.blind_1_1{
		padding-left: 10px;
		font-size: 15px;
		line-height: 23px;
		width: 70%;
		.blind_1_1_1{
			font-size: 16px;
			font-weight: bold;
		}
	}
}
.blind_wdxq{
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #FFF;
	padding: 5px 10px;
	height: 55px;
	.blind_wdtext{
		@include fron-display(center, center);
		background: #00aa7f;
		color: #FFF;
		font-size: 15px;
		width: 100%;
		height: 100%;
		border-radius: 4px;
	}
}
</style>