<template>
	<view class="content">
		<y-video-slide video-height="100vh" :data="userVideoData" @loadMore="loadMore" @share="share"
			@fabulous="fabulous" @follow="follow" @commentFabulous="commentFabulous"></y-video-slide>
	</view>
</template>

<script>
import YVideoSlide from '@/components/y-video-slide/y-video-slide.vue'
export default {
	components: {
		YVideoSlide
	},
	data() {
		return {
			videoID: 0,
			pages: 0,
			userVideoData: [],
			isLoading: false,
			noMore: false
		}
	},
	onLoad(options) {
		if (options.videoID) {
			this.videoID = options.videoID
		}
		this.videoClient()
	},
	methods: {
		normalizeVideoList(list = []) {
			return list.map(item => {
				const processed = { ...item }
				processed.userHead = processed.userHead || '/static/missing-face.png'
				processed.userNick = processed.userNick || '短视频'
				processed.videoContent = processed.title || ''
				processed.videoUrl = processed.url || ''
				processed.posterUrl = processed.coverUrl || ''
				processed.isFollow = processed.isFollow != null ? processed.isFollow : 0
				processed.isFabulous = processed.isFabulous != null ? processed.isFabulous : 0
				processed.fabulousCount = processed.fabulousCount || 0
				processed.commentCount = processed.commentCount || 0
				processed.shareCount = processed.shareCount || 0
				if (!processed.commentObj) {
					processed.commentObj = {
						count: processed.commentCount,
						list: []
					}
				}
				return processed
			})
		},
		
		videoClient(append = false) {
			if (this.isLoading) return
			
			this.isLoading = true
			const nextPage = append ? this.pages + 1 : this.pages
			
			this.$http("videoListClient", JSON.stringify({
				videoFlid: this.videoID,
				pg: nextPage,
				token: uni.getStorageSync("token") || ''
			})).then(res => {
				if (res.code == 0) {
					const rawList = Array.isArray(res.videoList.datas) ? res.videoList.datas : []
					const processedData = this.normalizeVideoList(rawList)

					if (append) {
						if (!processedData.length) {
							this.noMore = true
							uni.showToast({ title: '没有更多数据了', icon: 'none' })
							return
						}
						this.pages = nextPage
						this.userVideoData = this.userVideoData.concat(processedData)
					} else {
						this.pages = nextPage
						this.noMore = false
						this.userVideoData = processedData
					}
				} else {
					this.loginClick()
				}
			}).catch(err => {
				console.error('视频列表加载失败:', err)
				if (!append) {
					this.userVideoData = []
				}
			}).finally(() => {
				this.isLoading = false
			})
		},
		loadMore() {
			if (this.noMore) {
				uni.showToast({ title: '没有更多数据了', icon: 'none' })
				return
			}
			this.videoClient(true)
		},
		share(video) {
			uni.showToast({ title: '分享', icon: 'none' })
		},
		fabulous(video, flag) {
			uni.showToast({ title: '点赞', icon: 'none' })
		},
		follow(video, flag) {},
		commentFabulous(comment) {}
	}
}
</script>

<style scoped lang="scss">
.content {
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
</style>