<template>
	<view class="dynamic-container">
		<!-- 顶部导航栏 -->
		<uni-nav-bar :fixed="true" :statusBar="true" :border="false" class="nav-bar-top">
			<block slot="left">
				<view class="user-info" @click="backClick">
					<uni-icons type="left" size="24"></uni-icons>
					<view class="user-main">
						<view class="avatar">
							<image :src="userNewsInfo.imgUrl || '/static/missing-face.png'" mode="aspectFill"></image>
						</view>
						<view class="user-details">
							<view class="username">{{ userNewsInfo.userName }}</view>
							<view class="meta-info">
								<view class="time">1天前</view>
								<!-- <view class="dot">·</view>
								<view class="distance">9.64km</view> -->
							</view>
						</view>
					</view>
				</view>
			</block>
			<!-- <block slot="right">
				<view class="nav-right">
					<view class="follow-btn" v-if="newsInfo.isSouCang == 0" @click="handleFollow">关注</view>
					<view class="more-btn">
						<image src="/static/index/threeDots.png" mode=""></image>
					</view>
				</view>
			</block> -->
		</uni-nav-bar>

		<!-- 动态内容 -->
		<view class="content-section" :style="'padding-top:'+ topHeight +'px;'">
			<view class="content-text" v-if="newsInfo.remark">{{ newsInfo.remark }}</view>
            <view class="image-grid" v-if="newsInfo.iconUrl1 != ''">
                <block v-for="(item, index) in newsInfo.iconUrl1" :key="index">
                    <view class="image-item" @click="previewImage(item, index)">
                        <image :src="item" mode="aspectFill"></image>
                    </view>
                </block>
            </view>

			<!-- 操作按钮 -->
			<view class="action-bar">
				<view class="action-group">
					<view class="action-item" @click="handleLike(newsInfo.newsID)">
						<uni-icons :type="newsInfo.isDianZan == 1 ? 'hand-up-filled' : 'hand-up'" size="26" ></uni-icons>
						<view class="action-title">{{ newsInfo.numDianZan!=0 ? newsInfo.numDianZan : '赞' }}</view>
					</view>
					<view class="action-item" @click="handleComment(newsInfo.newsID)">
						<uni-icons type="compose" size="26" color="#666"></uni-icons>
						<view class="action-title">{{ newsInfo.numPinLun!=0 ? newsInfo.numPinLun : '评论' }}</view>
					</view>
					<!-- <view class="action-item" @click="handleGreet(newsInfo.userid)">
						<uni-icons type="chat" size="26" color="#666"></uni-icons>
						<view class="action-title">上热点</view>
					</view>
					<view class="action-item" @click="showSharePopup('转到', 'switched')">
						<uni-icons type="redo" size="26" />
						<view class="action-title">转到</view>
					</view> -->
				</view>
				<!-- <view class="more-btn">
					<image src="/static/index/threeDots.png" mode="aspectFit" />
				</view> -->
			</view>

			<!-- 评论列表 -->
			<view class="comment-section" v-if="commentsData.length > 0">
				<view class="comment-header">全部评论({{ commentsData.length }})</view>
				<view class="comment-list">
					<block v-for="(item, index) in commentsData" :key="index">
						<view class="comment-item">
							<view class="comment-main">
								<view class="comment-user">
									<view class="comment-avatar">
										<image :src="item.imgUrl || '/static/missing-face.png'" mode="aspectFill"></image>
									</view>
									<view class="comment-name">{{ item.userName }}</view>
								</view>
								<view class="comment-con">
									<view class="comment-content">{{ item.remark }}</view>
									<view class="comment-meta">
										<view class="comment-time">{{ item.inputTime }}</view>
										<view class="comment-location" v-if="getItemLocation(item)">{{ getItemLocation(item) }}</view>
										<view class="comment-delete" v-if="isOwnComment(item)" @click="deleteComment(item)">
											<uni-icons type="trash" size="14" color="#ff4d4f"></uni-icons>
										</view>
									</view>
								</view>
							</view>
							<!-- <view class="comment-actions">
								<view class="like-action" @click="likeClick(item.plID)">
									<uni-icons :type="item.isDianZan == 1 ? 'hand-up-filled' : 'hand-up'" size="20"></uni-icons>
									<view class="like-count" v-if="item.numDianZan">{{ item.numDianZan }}</view>
									<view class="like-count1" v-else>0</view>
								</view>
							</view> -->
						</view>
					</block>
				</view>
			</view>
		</view>
        <view class="comment-input-container" v-if="isDiscuss">
			<view class="input-wrapper">
				<input class="comment-input" type="text"  v-model="discussContent" :placeholder="placeholder" placeholder-class="placeholder"
					maxlength="200"/>
				<!-- 表情 -->
				<!-- <view class="comment-img">
					<image src="/static/index/brow.png" mode=""></image>
				</view> -->
				<view class="send-btn" @click="sendComment">评论</view>
			</view>
		</view>
		
		<uni-popup ref="popup" background-color="#fff">
			<view class="share-popup">
				<view class="share-title">{{ popupTitle }}</view>
				<view class="share-platforms">
					<view v-for="(item, index) in shareData" :key="index" class="platform-item" @click="handleShare(item)">
						<image class="platform-icon" :src="item.imgUrl" mode="aspectFit" />
						<view>{{ item.name }}</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data(){
		return {
			discussContent: "",
			placeholder: "",
			isDiscuss: false,
			topHeight: 0,
            platform: "",
			userID: "",
			popupTitle: "",
			newsID: 0,
			currentUserid: "",
			userInfoCache: {},
			userNewsInfo: {},
			newsInfo: {},
			commentsData: [],
			shareData: [],
			shareConfig: {
				switched: [
					{ name: '微信好友', imgUrl: '/static/index/qqFriends.png' },
					{ name: '朋友圈', imgUrl: '/static/index/moments.png' },
					{ name: 'QQ好友', imgUrl: '/static/index/wechatFriends.png' },
					{ name: '其他APP', imgUrl: '/static/index/app.png' },
					{ name: '保存', imgUrl: '/static/index/save.png' },
					{ name: '举报', imgUrl: '/static/index/report.png' },
					{ name: '不感兴趣', imgUrl: '/static/index/unconcern.png' }
				]
			}
		}
	},
	onLoad(options) {
        const getInfo = uni.getWindowInfo()
        this.topHeight = getInfo.statusBarHeight ? Number(getInfo.statusBarHeight) + 60 : 60;
		this.currentUserid = String(uni.getStorageSync('userid') || '');
		
		if(options.userID){
			this.userID = options.userID
		}
		
		if(options.newsID){
			this.newsID = options.newsID
		}
		this.userPublic();
		this.newsIInfo();
	},
	methods: {
		userPublic(){
			this.$http("userInfoPublic", JSON.stringify({
				userid: this.userID,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				if (res.code == 0) {
					this.userNewsInfo = res.userInfo
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		newsIInfo(){
			this.$http("newsUserInfo", JSON.stringify({
				newsID: this.newsID,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				if (res.code == 0) {
					this.newsInfo = res.newsInfo
					this.newsInfo.iconUrl1 = this.newsInfo.iconUrl.split(',')
					this.newsPinLunClient();
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		newsPinLunClient(){
			this.$http("newsPinLunListClient", JSON.stringify({
				newsID: this.newsID,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				if (res.code == 0) {
					this.commentsData = res.pinlunList;
					// 为评论补充用户经纬度和地址
					this.fillCommentLocation();
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		// 填充评论的地址信息
		fillCommentLocation() {
			const token = uni.getStorageSync('token') || '';
			// 去重获取用户id
			const userids = [...new Set(this.commentsData.map(i => i.userid).filter(Boolean))];
			console.log('[评论定位] 需要获取地址的用户数=' + userids.length);
			userids.forEach(userid => {
				// 缓存中已有地址则直接填充
				if (this.userInfoCache[userid] && this.userInfoCache[userid].address) {
					this.applyAddressToComments(userid, this.userInfoCache[userid].address);
					return;
				}
				// 调userInfoPublic获取经纬度
				this.$http('userInfoPublic', JSON.stringify({
					userid: userid,
					token: token
				})).then(res => {
					if (res.code == 0 && res.userInfo && res.userInfo.lat && res.userInfo.lon) {
						const u = res.userInfo;
						console.log('[评论定位] userid=' + userid + ' 经纬度: lat=' + u.lat + ', lon=' + u.lon);
						if (!this.userInfoCache[userid]) this.userInfoCache[userid] = {};
						this.userInfoCache[userid].lat = u.lat;
						this.userInfoCache[userid].lon = u.lon;
						// 高德逆地理
						this.reverseGeoComment(userid, Number(u.lon), Number(u.lat));
					} else {
						console.log('[评论定位] userid=' + userid + ' 无经纬度数据');
						// 没有经纬度时不显示地址
						this.applyAddressToComments(userid, '');
					}
				}).catch(err => {
					console.log('[评论定位] userid=' + userid + ' userInfoPublic失败:', err);
				});
			});
		},
		// 高德逆地理编码（评论专用）
		reverseGeoComment(userid, lon, lat) {
			const key = '93d81e19f28196780e2e7cb2120222ab';
			const url = `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${lon},${lat}&extensions=base`;
			console.log('[评论定位] userid=' + userid + ' 调高德逆地理');
			uni.request({
				url: url,
				method: 'GET',
				success: (r) => {
					console.log('[评论定位] 高德响应:', JSON.stringify(r.data).substring(0, 300));
					if (r.data && r.data.status === '1' && r.data.regeocode) {
						const comp = r.data.regeocode.addressComponent || {};
						const province = comp.province || '';
						const city = comp.city || '';
						const district = comp.district || '';
						const parts = [city, district].filter(Boolean);
						const address = parts.join('-');
						console.log('[评论定位] userid=' + userid + ' 逆地理结果: ' + address);
						if (address) {
							if (!this.userInfoCache[userid]) this.userInfoCache[userid] = {};
							this.userInfoCache[userid].address = address;
							this.applyAddressToComments(userid, address);
						}
					} else {
						console.log('[评论定位] userid=' + userid + ' 逆地理失败:', r.data ? r.data.info : '无数据');
					}
				},
				fail: (err) => {
					console.log('[评论定位] userid=' + userid + ' 逆地理请求失败:', err);
				}
			});
		},
		// 将地址写回该用户的所有评论
		applyAddressToComments(userid, address) {
			this.commentsData.forEach((item, idx) => {
				if (String(item.userid) === String(userid)) {
					this.$set(this.commentsData[idx], 'ipLocation', address);
				}
			});
		},
		newsPinLunAdd(){
			this.$http("newsPinLunAdd", JSON.stringify({
				newsID: this.newsID,
				superID: this.superID,
				remark: this.discussContent,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				if (res.code == 0) {
					this.isDiscuss = false;
					this.discussContent = "";
					
					this.newsPinLunClient();
				} else {
					uni.showToast({ title: res.msg, icon: 'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		newsUserDianZan(){
			this.$http("newsUserDianZan", JSON.stringify({
				newsID: this.newsID,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				uni.showToast({ title: res.msg, icon: 'none'});
			}).catch(err => {
				console.log(err);
			})
		},
		backClick(){
			uni.navigateBack({ delta: 1 });
		},
		// 关注
		handleFollow(){
			this.$http("newsUserSouCang", JSON.stringify({
				newsID: this.newsID,
				token: uni.getStorageSync('token') || ""
			})).then(res=>{
				uni.showToast({ title: res.msg, icon: 'none'});
			}).catch(err => {
				console.log(err);
			})
		},
        previewImage(list, index){
            const urls = (list || []);
            uni.previewImage({
                urls: urls,
                current: urls[index || 0]
            });
		},
		handleLike(newsID){
			this.newsInfo.isDianZan = this.newsInfo.isDianZan == 1 ? 0 : 1;
			this.newsInfo.numDianZan = this.newsInfo.isDianZan == 1 ? Number(this.newsInfo.numDianZan) + 1 : Number(this.newsInfo.numDianZan) - 1;
			this.newsID = newsID
			this.newsUserDianZan();
		},
		handleComment(newsID){
			this.placeholder = "发布评论"
			this.newsID = newsID
			this.isDiscuss = !this.isDiscuss;
		},
		// 打招呼
		handleGreet(userID){
			// uni.navigateTo({
			// 	url: `/pages/makingFriends/malingUser?userID=${userID}`
			// });
		},
		showSharePopup(title, index) {
			this.popupTitle = title;
			this.shareData = this.shareConfig[index] || [];
			this.$refs.popup.open('bottom');
		},
		likeClick(plID){
			this.commentsData.forEach(item => {
				if(plID == item.plID){
					item.isDianZan = item.isDianZan == 1 ? 0 : 1;
					item.dianZan = item.isDianZan == 1 ? Number(item.dianZan) + 1 : Number(item.dianZan) - 1;
				}
			})
		},
		restoreClick(item){
			this.discussContent = "";
			this.isDiscuss = true;
			this.placeholder = "回复 " + item.userName
		},
		sendComment(){
			this.newsPinLunAdd();
		},
		// 分享到
		handleShare(){
			
		},
		// 判断是否为当前用户的评论
		isOwnComment(item) {
			if (!item || !item.userid) return false;
			return String(item.userid) === this.currentUserid;
		},
		// 删除评论
		deleteComment(item) {
			uni.showModal({
				title: '提示',
				content: '确定删除这条评论吗？',
				success: (res) => {
					if (res.confirm) {
						this.$http('newsPinLunDel', JSON.stringify({
							plID: item.plID,
							token: uni.getStorageSync('token') || ""
						})).then(res => {
							if (res.code == 0) {
								uni.showToast({ title: '删除成功', icon: 'success' });
								this.newsPinLunClient();
							} else {
								uni.showToast({ title: res.msg || '删除失败', icon: 'none' });
							}
						}).catch(err => {
							console.log('删除评论失败:', err);
							// 兜底：本地删除
							const idx = this.commentsData.findIndex(i => i.plID === item.plID);
							if (idx !== -1) {
								this.commentsData.splice(idx, 1);
								uni.showToast({ title: '已删除', icon: 'success' });
							}
						});
					}
				}
			});
		},
		// 获取评论的位置显示
		getItemLocation(item) {
			if (!item) return '';
			// 1. 优先显示省市区（逆地理结果）
			if (item.ipLocation) return item.ipLocation;
			// 2. 用经纬度兜底
			if (item.lat && item.lon && String(item.lat) !== '0' && String(item.lon) !== '0') {
				return '📍 ' + Number(item.lat).toFixed(4) + ', ' + Number(item.lon).toFixed(4);
			}
			return '';
		}
	}
}
</script>

<style scoped lang="scss">
.dynamic-container {
	background-color: #ffffff;
	// min-height: 100vh;
	position: relative;
}

.nav-bar-top{
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	background-color: #FFF;
	z-index: 100;
	display: flex;
	align-items: center;
    /* 劉海屏頂部安全區 */
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
}

.nav-bar-top ::v-deep .uni-navbar__header-container {
	display: none !important;
}
.nav-bar-top ::v-deep .uni-navbar__header-btns-left {
	width: 250px !important;
}
.nav-bar-top ::v-deep .uni-navbar__header-btns-right{
	width: 100% !important;
}

.user-info {
	display: flex;
	align-items: center;
}

.user-main {
	display: flex;
	align-items: center;
	margin-left: 10px;
}

.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 10px;
}

.avatar image {
	width: 100%;
	height: 100%;
}

.user-details {
	display: flex;
	flex-direction: column;
}

.username {
	font-size: 15px;
	font-weight: bold;
	color: #333;
}

.meta-info {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: #999;
	margin-top: 4px;
}

.dot {
	margin: 0 5px;
}

.nav-right {
	display: flex;
	align-items: center;
}

.follow-btn {
	padding: 4px 12px;
	background-color: #FD7031;
	color: white;
	border-radius: 20px;
	font-size: 14px;
}

.more-btn {
	padding: 8rpx;
	width: 35px;
	height: 35px;
	image{
		width: 100%;
		height: 100%;
	}
}

.content-section {
	padding: 0 15px;
}

.content-text {
	font-size: 16px;
	line-height: 1.6;
	color: #333;
	margin-bottom: 15px;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 5px;
	margin-bottom: 15px;
}

.image-item {
	aspect-ratio: 1;
	border-radius: 5px;
	overflow: hidden;
	image {
		width: 100%;
		height: 100%;
	}
}

.action-bar {
	padding-bottom: 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.action-group {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 8px;
}

.action-item {
	display: flex;
	align-items: center;
	gap: 3px;
	color: #666;
	font-size: 12px;
	
	.action-title{
		width: 40px;
	}
}

.comment-section{
	padding-bottom: 20px;
}
.comment-header {
	font-size: 16px;
	font-weight: bold;
	color: #333;
}

.comment-bottom{
	margin-left: 36px;
}

.comment-item {
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	position: relative;
}
.comment-item:last-child::after {
  content: none;
}
.comment-item::after {
	content: '';
    position: absolute;
    bottom: 0;
    left: 55%;
    transform: translateX(-50%);
    width: 90%; /* 设置下划线的长度 */
    height: 0.5px; /* 设置下划线的粗细 */
    background-color: #E5E5E5;
}

.comment-user {
	display: flex;
	align-items: center;
	margin-bottom: 4px;
}

.comment-avatar {
	width: 34px;
	height: 34px;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 8px;
	image {
		width: 100%;
		height: 100%;
	}
}

.comment-name {
	font-size: 14px;
	color: #333;
	font-weight: 500;
}
.comment-con{
	margin-left: 38px;
}

.comment-content {
	font-size: 14px;
	line-height: 1.5;
	color: #333;
	margin-bottom: 7px;
}

.comment-meta {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: #999;
	gap: 10px;
}

.comment-location {
	color: #4A90E2;
	font-size: 11px;
}

.comment-delete {
	margin-left: auto;
	padding: 2px 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: background-color 0.2s;
}

.comment-delete:hover {
	background-color: #ffe8e8;
}

.comment-actions {
	display: flex;
	align-items: center;
	margin-left: 15px;
}

.like-action {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.like-count {
	font-size: 12px;
	color: #999;
}
.like-count1 {
	font-size: 12px;
	color: #ffffff;
}


.comment-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f8f8f8;
  margin: 10px 15px;
  z-index: 999;
  /* 适配刘海屏 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #E5E5E5;
  border-radius: 40px;
  height: 40px;
}

.comment-input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  color: #333;
  padding: 0 10px 0 10px;
  background: transparent;
}

.comment-img{
	width: 22px;
	height: 22px;
	margin-right: 10px;
	image{
		width: 100%;
		height: 100%;
	}
}

.placeholder {
  color: #999;
  font-size: 14px;
}

.send-btn {
  padding: 10px 24px;
  background: #FD7031;
  color: #ffffff;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

/* 输入框聚焦状态 */
.input-wrapper:focus-within {
  background: #f0f0f0;
  box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.2);
}

.share-popup {
	padding: 20px 15px 20px;
	background: #fff;
	border-radius: 10px 10px 0 0;
}

.share-title {
	text-align: center;
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 20px;
}

.share-platforms {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 18px;
}

.platform-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 12px;
	color: #666;
}

.platform-icon {
	width: 30px;
	height: 30px;
	margin-bottom: 6px;
}
</style>