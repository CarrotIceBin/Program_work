<template>
	<view class="blind_date">
		<block v-for="(item, index) in newsUserData" :key="index">
			<view class="blind_list">
				<view class="blind_1">
					<view class="blind_1_image">
						<image :src="item.iconUrl" mode=""></image>
					</view>
					<view class="blind_1_1">
						<view class="blind_1_1_1">{{item.newsTitle}}</view>
						<view class="">{{item.remark}}</view>
					</view>
				</view>
				<view class="blind_2">
					<view class="" @click="numDianClick(item)">
						<text>点赞</text>
						<text class="blind_text" v-if="item.numDianZan != 0">{{ item.numDianZan }}</text>
					</view>
					<view class="" @click="numSouClick(item)">
						<text>收藏</text>
						<text class="blind_text" v-if="item.numSouCang != 0">{{ item.numSouCang }}</text>
					</view>
					<view class="">评论</view>
					<view class="">私信</view>
				</view>
			</view>
		</block>
		<view class="blind_wdxq" @click="blindHistoryClick">
			<text class="blind_wdtext">{{blindTitle}}</text>
		</view>
		<uni-load-more :status="statusLoadMore" :content-text="contentText" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			blindTitle: '',
			pages: 0,
			newsFlID: 0,
			newsUserData: [],
			
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
					this.blindTitle = '我的心情'
				break;
				case 2:
					uni.setNavigationBarTitle({
						title: '我的交友'
					});
					this.blindTitle = '我的交友'
				break;
				case 3:
					uni.setNavigationBarTitle({
						title: '我的相亲'
					});
					this.blindTitle = '我的相亲'
				break;
			}
		}
		this.newsUserClient();
	},
	onReachBottom() {
		if(parseFloat(this.pagesInfo.total_num) > parseFloat(this.pagesInfo.per_num)){
			this.statusLoadMore = "loading"
			this.pages ++
			this.newsUserClient()
			
			var that = this
			setTimeout(function() {	
				// 显示没有更多数据了
				that.statusLoadMore = "nomore"
			}, 1000)
		}
	},
	methods: {
		newsUserClient(){
			this.$http("newsUserListClient", JSON.stringify({
				newsTitle: "",
				newsFlid: this.newsFlID,
				pg: this.pages,
				token: uni.getStorageSync("token")
			})).then(res=>{
				if (res.code == 0) {
					const couponPg = res.newsList.pgInfo
					this.newsUserData = res.newsList.datas
					
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
		numDianClick(item){
			this.$http("newsUserDianZan", JSON.stringify({
				newsID: item.newsID,
				token: uni.getStorageSync("token")
			})).then(res=>{
				if (res.code == 0) {
					this.newsUserData.forEach(item1 => {
						if(item.newsID == item1.newsID){
							if(item.isDianZan == 0){
								item1.isDianZan = 1;
								item1.numDianZan ++;
							} else {
								item1.isDianZan = 0;
								item1.numDianZan --;
							}
						}
					})
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		numSouClick(item){
			this.$http("newsUserSouCang", JSON.stringify({
				newsID: item.newsID,
				token: uni.getStorageSync("token")
			})).then(res=>{
				if (res.code == 0) {
					this.newsUserData.forEach(item1 => {
						if(item.newsID == item1.newsID){
							if(item.isSouCang == 0){
								item1.isSouCang = 1;
								item1.numSouCang ++;
							} else {
								item1.isSouCang = 0;
								item1.numSouCang --;
							}
						}
					})
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		blindHistoryClick(){
			uni.navigateTo({
				url: '/pagesSub/index/blindHistoryDates?type=' + this.newsFlID
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

.blind_date{
	padding: 0 10px 55px;
	overflow-y: scroll;
	height: calc(100vh - 45px);
	.blind_list{
		padding: 10px 0;
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
.blind_2{
	@include fron-display(space-evenly, '');
	padding-top: 15px;
	.blind_text{
		margin-left: 4px;
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