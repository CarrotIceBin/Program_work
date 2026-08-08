<script>
	/**
	 * vuex管理登陆状态，具体可以参考官方登陆模板示例
	 */
	import {
		mapMutations
	} from 'vuex';
	export default {
		methods: {
			...mapMutations(['login'])
		},
		onLaunch: function() {
			let userInfo = uni.getStorageSync('userInfo') || '';
			if(userInfo.id){
				//更新登陆状态
				uni.getStorage({
					key: 'userInfo',
					success: (res) => {
						this.login(res.data);
					}
				});
			}
			
			const updateManager = uni.getUpdateManager();
			updateManager.onCheckForUpdate(function(res) {
				// 请求完新版本信息的回调
				if (res.hasUpdate) {
					updateManager.onUpdateReady(function(res2) {
						uni.showModal({
							title: '更新提示',
							content: '发现新版本，是否重启应用?',
							cancelColor:'#eeeeee',
							confirmColor:'#000000',
							success(res2) {
								if (res2.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate();
								}
							}
						});
					});
				}
			 });
				
			 updateManager.onUpdateFailed(function(res) {
				// 新的版本下载失败
				uni.showModal({
					title: '提示',
					content: '检查到有新版本，但下载失败，请检查网络设置',
					success(res) {
						if (res.confirm) {
							// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
							updateManager.applyUpdate();
						}
					}
				});
			});
			
		},
		onShow: function() {
			//console.log('App Show')			
		},
		onHide: function() {
			//console.log('App Hide')
		},
	}
</script>

<style lang='scss'>
	@font-face {
		font-family: yticon;
		font-weight: normal;
		font-style: normal;
		src: url('https://at.alicdn.com/t/font_1078604_w4kpxh0rafi.ttf') format('truetype');
	}

	.yticon {
		font-family: "yticon" !important;
		font-size: 16px;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.icon-iconfontshanchu1:before {
		content: "\e619";
	}

	.icon-alipay:before {
		content: "\e636";
	}

	.icon-shang:before {
		content: "\e624";
	}

	.icon-fenxiang2:before {
		content: "\e61e";
	}

	.icon-shoucang:before {
		content: "\e645";
	}

	.icon-xuanzhong2:before {
		content: "\e62f";
	}

	.icon-bianji:before {
		content: "\e646";
	}

	.icon-xiatubiao--copy:before {
		content: "\e608";
	}

	.icon-bangzhu1:before {
		content: "\e63d";
	}

	.icon-zuojiantou-up:before {
		content: "\e605";
	}

	.icon-weixinzhifu:before {
		content: "\e61a";
	}

	.icon-fenlei1:before {
		content: "\e620";
	}

	.icon-you:before {
		content: "\e606";
	}

	.icon-fork:before {
		content: "\e61b";
	}

	.icon-gouwuche:before {
		content: "\e609";
	}
	
	.icon-xingxing:before {
		content: "\e70b";
	}

	.icon-shouhuodizhi:before {
		content: "\e712";
	}

	view,
	scroll-view,
	swiper,
	swiper-item,
	cover-view,
	cover-image,
	icon,
	text,
	rich-text,
	progress,
	button,
	checkbox,
	form,
	input,
	label,
	radio,
	slider,
	switch,
	textarea,
	navigator,
	audio,
	camera,
	image,
	video {
		box-sizing: border-box;
	}
	
	.clamp {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	/*边框*/
	.b-b:after,
	.b-t:after {
		position: absolute;
		z-index: 3;
		left: 0;
		right: 0;
		height: 0;
		content: '';
		transform: scaleY(.5);
		border-bottom: 1px solid $border-color-base;
	}

	.b-b:after {
		bottom: 0;
	}

	.b-t:after {
		top: 0;
	}

	/* button样式改写 */
	uni-button,
	button {
		height: 80upx;
		line-height: 80upx;
		font-size: $font-lg + 2upx;
		font-weight: normal;

		&.no-border:before,
		&.no-border:after {
			border: 0;
		}
	}

	uni-button[type=default],
	button[type=default] {
		color: $font-color-dark;
	}

	.placeholder {
		color: #999999;
	}
	
	/* 设置默认颜色 */
	.ymcode_ml {
		background-color: #FD7031;
	}
	
	::-webkit-scrollbar {
	  display: none !important;
	  width: 0 !important;
	  height: 0 !important;
	  -webkit-appearance: none;
	  background: transparent !important;
	}
	
	* {
	    -ms-overflow-style: none;  /* IE/Edge */
	    scrollbar-width: none;     /* Firefox */
	}
</style>
