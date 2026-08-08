<template>
	<view class="people_nearby">
		<block v-for="(item, index) in userNearbyData" :key="index">
			<view class="people_list">
				<view class="people_1">
					<view class="people_image">
						<image :src="item.imgUrl || '/static/missing-face.png'" mode=""></image>
					</view>
					<view class="people_title_age">
						<view class="people_name">{{item.userName}}</view>
						<view class="people_sex_age">
							<view class="">
								<text v-if="item.sex != '隐私'">{{item.sex}}</text>
								<text>{{item.age}}</text>
							</view>
						</view>
						<view class="people_2">1111</view>
					</view>
				</view>
				<view class="people_3">{{item.remark}}</view>
			</view>
		</block>
		<uni-load-more :status="statusLoadMore" :content-text="contentText" />
	</view>
</template>

<script>
export default {
	data(){
		return {
			pages: 0,
			userNearbyData: [],
			
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
	onLoad() {
		this.userNearby();
	},
	onReachBottom() {
		if(parseFloat(this.pagesInfo.total_num) > parseFloat(this.pagesInfo.per_num)){
			this.statusLoadMore = "loading"
			this.pages ++
			this.userNearby()
			
			var that = this
			setTimeout(function() {	
				// 显示没有更多数据了
				that.statusLoadMore = "nomore"
			}, 1000)
		}
	},
	methods: {
		userNearby(){
			this.$http("userListNearby", JSON.stringify({
				pg: this.pages,
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.code == 0) {
					const couponPg = res.userList.pgInfo
					this.userNearbyData = [...this.userNearbyData, ...res.userList.datas]
					
					this.userNearbyData.forEach(item => {
						item.age = this.calculateAge(item.birthday)
					})
					
					if(parseFloat(couponPg.total_num) != 0){
						if(parseFloat(couponPg.total_num) <= parseFloat(couponPg.per_num)){
							this.contentText.contentdown = '没有更多数据了'
						} else {
							this.pagesInfo = couponPg
						}
					} else {
						this.contentText.contentdown = '暂无数据'
					}
				}
			}).catch(err => {
				console.log(err);
			})
		},
		calculateAge(birthday) {
		  const birthDate = new Date(birthday);
		  const today = new Date();
		  
		  let age = today.getFullYear() - birthDate.getFullYear();
		  const monthDiff = today.getMonth() - birthDate.getMonth();
		  
		  // 如果当前月份小于出生月份，或者月份相同但日期未到生日
		  if (monthDiff < 0 || (monthDiff == 0 && today.getDate() < birthDate.getDate())) {
		    age--;
		  }
		  
		  return age;
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

.people_list{
	@include fron-display(space-between, '');
	padding: 0 10px;
	margin-bottom: 20px;
	
	.people_1{
		@include fron-display('', center);
		.people_image{
			width: 70px;
			height: 70px;
			image{
				width: 100%;
				height: 100%;
			}
		}
		.people_title_age{
			padding-left: 10px;
			line-height: 23px;
			.people_name{
				font-size: 16px;
				font-weight: bold;
			}
			.people_sex_age{
				font-size: 14px;
			}
		}
		.people_2{
			font-size: 14px;
			color: #808080;
		}
	}
	.people_3{
		font-size: 14px;
		color: #808080;
	}
}
</style>