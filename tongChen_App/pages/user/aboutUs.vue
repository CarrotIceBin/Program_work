<template>
<view class="yqmtxt" v-if="aboutUs != ''" :style="'color:' + txtColor + ';'">{{aboutUs}}</view>
<view class="yqmtxt1" v-else>暂无数据</view>
</template>

<script>
	export default{
		onLoad(){
			this.getAboutUs();
		},
		data(){
			return{
				aboutUs:"",
				txtColor: ""
			}
		},
		methods:{
			getAboutUs() {
				this.$http("appTxtGet", JSON.stringify({
					token: 'token',
					txtID: 'aboutUs'
				})).then(res => {
					if (res.code != 0) {
						if(res.code != 4){
							uni.showToast({title: res.msg,icon: 'none'});
						}
					} else {
						this.aboutUs = res.txtInfo.txt;
						this.txtColor = res.txtInfo.txtColor;
					}
				}).catch(err => {
					console.log(err);
				})
			}
		}
	}
</script>

<style scoped lang="scss">
.yqmtxt {
	font-size: $font-sm+4upx;
	color: $font-color-base;
}

.yqmtxt1{
	font-size: $font-sm+4upx;
	color: $font-color-base;
	display: flex;
	justify-content: center;
}
</style>