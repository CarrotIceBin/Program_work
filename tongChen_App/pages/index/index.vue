<template>
	<view class="page-container">
		<!-- 自定义导航栏（和交友页面一致） -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-content">
				<view class="navbar-title">同城圈</view>
			</view>
		</view>

		<!-- 顶部Tab栏（和交友页面一致的结构） -->
		<view class="header">
			<view class="tab-bar">
				<view
					v-for="item in tabBarData"
					:key="item.tabID"
					class="tab-item"
					:class="{ active: tabIndex == item.tabID }"
					@click="tabBarClick(item.tabID)"
				>
					{{ item.name }}
				</view>
			</view>
			<view class="publish-btn" @click="publishClick">
				<text class="publish-icon">+</text>
				<text>发同城圈</text>
			</view>
		</view>

		<!-- 动态列表区域 -->
		<view class="content-list" v-if="isTabActive">
			<view class="message-card" @click="subscriptionClick" v-if="tabIndex != 4">
				<view class="icon-wrapper">
					<image src="/static/index/subscription1.png" mode="aspectFit"></image>
				</view>
				<view class="message-content">
					<view class="message-header">
						<view class="message-title">少跑路</view>
						<view class="message-time">1分钟前</view>
					</view>
				</view>
			</view>

			<!-- 顶部网络广告卡片 -->
			<view class="ad-card" v-if="adItem.img" @click="goAdDetail">
				<view class="ad-card-img-wrap">
					<image class="ad-card-img" :src="adItem.img" mode="aspectFill"></image>
					<view class="ad-badge">限时特惠</view>
					<view class="ad-card-price" v-if="adItem.price">
						<text class="ad-price-symbol">¥</text>
						<text class="ad-price-value">{{ adItem.price }}</text>
					</view>
				</view>
				<view class="ad-card-info">
					<view class="ad-card-title">{{ adItem.title }}</view>
					<view class="ad-card-desc">{{ adItem.desc }}</view>
					<view class="ad-card-bottom">
						<view class="ad-card-tag">广告</view>
						<view class="ad-card-action">
							<text>立即购买</text>
							<text class="ad-arrow">→</text>
						</view>
					</view>
				</view>
			</view>

			<view
				v-for="(item, index) in currentTabData"
				:key="index"
				class="dynamic-item"
				:id="'news-' + item.newsID"
				@click.capture="handleViewCount(item)"
			>
				<view class="user-info">
					<view class="avatar" @click="userUrlClick(item.userid)">
						<image
							:src="item.userImgUrl || '/static/missing-face.png'"
							mode="aspectFill"
						/>
					</view>
					<view class="user-detail">
						<view class="username">{{ item.userName }}</view>
						<view class="stats-row">
							<view
								class="user-stats"
								:style="{ background: item.userSex ? (item.userSex == '女' ? '#ff6b8a' : '#00d4ec') : '#cccccc' }"
							>
								<text class="age-icon">{{ item.userSex ? (item.userSex == '女' ? '♀' : '♂') : '' }}</text>
								<text class="age-num">{{ item.userOld }}</text>
							</view>
							<view class="level-badge" :class="getVipClass(item)">
								<text class="level-text">VIP{{ getUserLevel(item) }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="dynamic-content">
					<view class="content-text" v-if="item.remark">{{ item.remark }}</view>
					<view class="content-images" v-if="item.iconUrls && item.iconUrls.length">
						<image
							v-for="(imgUrl, imgIndex) in item.iconUrls"
							:key="imgIndex"
							:src="imgUrl"
							mode="aspectFill"
							@click="previewImage(imgUrl, item.iconUrls)"
						/>
					</view>
					
					<view class="item-footer">
						<view class="footer-item">
							<text class="footer-icon">🕐</text>
							<text class="footer-text">{{ formatTime(item.inputTime) }}</text>
						</view>
						<view class="footer-item">
							<text class="footer-icon">📍</text>
							<text class="footer-text">{{ item.location || '未设置' }}</text>
						</view>
						<view class="footer-item">
							<text class="footer-icon">{{ getPublishTypeIcon(item.typeID) }}</text>
							<text class="footer-text">{{ item.typeName || getPublishType(item.typeID) || '未设置' }}</text>
						</view>
						<view class="footer-item">
							<text class="footer-icon">👁</text>
							<text class="footer-text">{{ item.viewNum || 0 }}次浏览</text>
						</view>
					</view>
					<view class="action-bar">
						<view class="action-group">
							<view class="action-item" @click="handleDianzan(item.newsID)">
								<uni-icons
									:type="item.isDianZan == 1 ? 'hand-up-filled' : 'hand-up'"
									size="26"
								/>
								<view class="action-title">{{ item.numDianZan != 0 ? item.numDianZan : '赞' }}</view>
							</view>
							<view class="action-item" @click="handleDiscuss(item)">
								<uni-icons type="compose" size="26" />
								<view class="action-title">{{ item.numPinLun != 0 ? item.numPinLun : '评论' }}</view>
							</view>
							<view class="action-item promote-btn" @click="goPromote(item)">
								<uni-icons type="flag" size="26" color="#666666" />
								<view class="action-title" style="color:#666666">上热点</view>
							</view>
							<view class="action-item" @click="showSharePopup('转到', 'switched')">
								<uni-icons type="redo" size="26" color="#666666" />
								<view class="action-title" style="color:#666666">转到</view>
							</view>
						</view>
						<view class="action-right">
							<view class="action-item" @click="showPromoteTip">
								<uni-icons type="more-filled" size="26" color="#666666" class="vertical-dots" />
							</view>
						</view>
					</view>
				</view>
			</view>

			<uni-load-more :status="loadStatus" :content-text="contentText" />
		</view>

		<!-- 分享底部弹窗 -->
		<uni-popup ref="popup" background-color="#fff" type="bottom">
			<view class="share-popup">
				<view class="share-title">{{ popupTitle }}</view>
				<view class="share-platforms">
					<view
						v-for="(item, index) in shareData"
						:key="index"
						class="platform-item"
						@click="handleShare(item)"
					>
						<image class="platform-icon" :src="item.imgUrl" mode="aspectFit" />
						<view>{{ item.name }}</view>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 推广底部弹窗【重构优化版】 -->
		<uni-popup
			ref="promotePopup"
			background-color="#fff"
			type="bottom"
			@close="onPromoteClose"
			:mask-click-close="true"
		>
			<view class="promote-wrap" @touchmove.stop.prevent>
				<!-- 关闭按钮 -->
				<view class="close-icon" @click="$refs.promotePopup.close()">✕</view>
				<!-- 标题固定区域 -->
				<view class="title-box">
					<view class="big-title">提曝光</view>
					<view class="tip-text">让更多人看到这条动态</view>
				</view>
				<!-- 标签切换固定 -->
				<view class="tab-box">
					<view
						class="tab-item"
						:class="{ active: promoteTab === 0 }"
						@click="promoteTab = 0"
					>
						自定义推广
					</view>
					<view
						class="tab-item"
						:class="{ active: promoteTab === 1 }"
						@click="promoteTab = 1"
					>
						我的券包
					</view>
				</view>

				<!-- 可滚动内容区 -->
				<scroll-view scroll-y class="scroll-content">
					<!-- 自定义推广面板 -->
					<view v-if="promoteTab === 0" class="custom-promote">
						<view class="form-section">
							<view class="section-title">推广到</view>
							<view class="target-group">
								<view class="group-label">女生</view>
								<view class="btn-group">
									<view class="tag-btn" :class="{ active: promoteTarget === '同城女生' }" @click="promoteTarget = '同城女生'">同城女生</view>
									<view class="tag-btn" :class="{ active: promoteTarget === '同市女生' }" @click="promoteTarget = '同市女生'">同市女生</view>
									<view class="tag-btn" :class="{ active: promoteTarget === '同省女生' }" @click="promoteTarget = '同省女生'">同省女生</view>
									<view class="tag-btn" :class="{ active: promoteTarget === '全国女生' }" @click="promoteTarget = '全国女生'">全国女生</view>
								</view>
							</view>
							<view class="target-group">
								<view class="group-label">男生</view>
								<view class="btn-group">
									<view class="tag-btn" :class="{ active: promoteTarget === '同城男生' }" @click="promoteTarget = '同城男生'">同城男生</view>
									<view class="tag-btn" :class="{ active: promoteTarget === '同市男生' }" @click="promoteTarget = '同市男生'">同市男生</view>
									<view class="tag-btn" :class="{ active: promoteTarget === '同省男生' }" @click="promoteTarget = '同省男生'">同省男生</view>
									<view class="tag-btn" :class="{ active: promoteTarget === '全国男生' }" @click="promoteTarget = '全国男生'">全国男生</view>
								</view>
							</view>
						</view>
						<view class="form-section">
							<view class="section-title">人数</view>
							<view class="btn-group">
								<view
									class="tag-btn"
									:class="{ active: promoteCount === 2000 }"
									@click="promoteCount = 2000"
								>2000</view>
								<view
									class="tag-btn"
									:class="{ active: promoteCount === 5000 }"
									@click="promoteCount = 5000"
								>5000</view>
								<view
									class="tag-btn"
									:class="{ active: promoteCount === 8000 }"
									@click="promoteCount = 8000"
								>8000</view>
								<view
									class="tag-btn"
									:class="{ active: promoteCount === 30000 }"
									@click="promoteCount = 30000"
								>30000</view>
							</view>
						</view>
						<view class="form-section">
							<view class="section-title">金额</view>
							<view class="price-display">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ promotePrice }}</text>
							</view>
						</view>
					</view>

					<!-- 券包面板 -->
					<view v-else class="coupon-wrap">
						<view
							class="coupon-item"
							v-for="(item, index) in couponList"
							:key="index"
							@click="useCoupon(item)"
						>
							<view class="coupon-left">
								<view class="coupon-price">
									<text class="symbol">¥</text>
									<text class="num">{{ item.value }}</text>
								</view>
								<view class="coupon-condition">满{{ item.threshold }}可用</view>
							</view>
							<view class="coupon-right">
								<view class="coupon-name">{{ item.name }}</view>
								<view class="coupon-date">{{ item.expire }}</view>
								<view class="use-btn">立即使用</view>
							</view>
						</view>
						<view class="coupon-empty" v-if="couponList.length === 0">
							<view class="empty-icon">🎫</view>
							<view class="empty-text">暂无可用券包</view>
						</view>
					</view>
				</scroll-view>

				<!-- 底部提交按钮 固定悬浮 -->
				<view class="submit-btn" @click="submitPromote">
					立即推广 ¥{{ promotePrice }}
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 券包列表
			couponList: [
				{
					name: '推广曝光券',
					value: 50,
					threshold: 200,
					expire: '2026.08.30 到期'
				},
				{
					name: '新人推广券',
					value: 20,
					threshold: 100,
					expire: '2026.09.15 到期'
				},
				{
					name: '加热抵扣券',
					value: 100,
					threshold: 500,
					expire: '2026.08.10 到期'
				}
			],
			selectNewsId: '',
			statusBarHeight: 20,
			currentLocation: '定位中...',
			publishTypeMap: {},
			// 用户信息缓存，避免重复请求
			userInfoCache: {},
			// 网络广告第一个商品
			adItem: {
				id: 1,
				title: 'PUBG绝地求生超级巨星蓝色战神夹克CDK',
				desc: 'PUBG绝地求生超级巨星蓝色战神夹克CDK',
				img: '/static/2026.jpg',
				price: '28.00'
			},
			tabIndex: 1,
			page: 0,
			tabData: {
				1: [],
				2: [],
				3: [],
				4: []
			},
			pageInfo: {
				1: { total_num: 0, per_num: 0 },
				2: { total_num: 0, per_num: 0 },
				3: { total_num: 0, per_num: 0 },
				4: { total_num: 0, per_num: 0 }
			},
			loadStatus: 'more',
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				contentnomore: '没有更多数据了'
			},
			tabBarData: [
				{ tabID: 1, name: '同城圈', newsFlid: 1 },
				{ tabID: 2, name: '故乡', newsFlid: 2 },
				{ tabID: 3, name: '关注', newsFlid: 3 },
				{ tabID: 4, name: '单身', newsFlid: 4 }
			],
			shareData: [],
			loading: false,
			popupTitle: '',
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
			},
			promoteTab: 0,
			promoteTarget: '',
			promoteCount: 0
		};
	},

	computed: {
		isTabActive() {
			return [1, 2, 3, 4].includes(this.tabIndex);
		},
		currentTabData() {
			const list = this.tabData[this.tabIndex] || [];
			return list.map((item) => ({
				...item,
				iconUrls: item.iconUrl ? item.iconUrl.split(',') : []
			}));
		},
		currentPageInfo() {
			return this.pageInfo[this.tabIndex] || {};
		},
		currentNewsFlid() {
			const tab = this.tabBarData.find((item) => item.tabID == this.tabIndex);
			return tab?.newsFlid || 1;
		},
		promotePrice() {
			const priceMap = { 2000: '28.8', 5000: '58.8', 8000: '88.8', 30000: '288.8' };
			if (!this.promoteCount) return '--';
			return priceMap[this.promoteCount] || '--';
		}
	},

	onLoad() {
		// 适配状态栏高度（和交友页面一致）
		const sysInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
		
		// 获取当前位置
		this.getCurrentLocation();

		// 从后端加载拍摄方式类型映射
		this.loadPublishTypeMap();
	},
	onShow() {
		this.loadData();
		this.loadAd();
		if (uni.getStorageSync('token')) {
			this.lonLatUpdate();
		}
	},
	// 触底加载更多
	onReachBottom() {
		const { total_num, per_num } = this.currentPageInfo;
		if (total_num > per_num && this.loadStatus === 'more' && !this.loading) {
			this.page++;
			this.loadStatus = 'loading';
			this.loadData(false);
		}
	},

	methods: {
		// 加载网络广告第一个商品
		async loadAd() {
			try {
				const res = await this.$http('goodsList', {
					token: uni.getStorageSync('token') || ''
				});
				if (res.code == '0' && res.data && res.data.length > 0) {
					const d = res.data[0];
					this.adItem = {
						id: d.id || 1,
						title: d.title || '',
						desc: d.desc || '',
						img: d.img || '/static/2026.jpg',
						price: d.price || ''
					};
				}
			} catch (e) {
				console.log('广告接口未就绪，使用本地数据', e);
			} 
		},
		// 点击广告跳转商品详情
		goAdDetail() {
			console.log('点击广告卡片，跳转商品详情:', this.adItem);
			const product = {
				id: this.adItem.id,
				title: this.adItem.title,
				desc: this.adItem.desc,
				image: this.adItem.img,
				price: this.adItem.price
			};
			const productStr = encodeURIComponent(JSON.stringify(product));
			console.log('跳转URL:', `/pages/menDian/goodsDetail?product=${productStr}`);
			uni.navigateTo({
				url: `/pages/menDian/goodsDetail?product=${productStr}`,
				success: () => {
					console.log('跳转成功');
				},
				fail: (err) => {
					console.log('跳转失败:', err);
					uni.showToast({ title: '跳转失败: ' + (err.errMsg || ''), icon: 'none' });
				}
			});
		},
		getCurrentLocation() {
			const token = uni.getStorageSync('token') || '';
			if (token) {
				this.$http('userInfo', JSON.stringify({ token })).then(res => {
					if (res.code == 0 && res.userInfo) {
						const backendLocation = res.userInfo.location || res.userInfo.city || res.userInfo.district || '';
						// 过滤掉通用词（Tab名称等），只保留真实位置
						const invalidLocations = ['同城', '故乡', '关注', '单身', '定位中...'];
						if (backendLocation && !invalidLocations.includes(backendLocation)) {
							this.currentLocation = backendLocation;
							return;
						}
					}
					this.localGetLocation();
				}).catch(() => {
					this.localGetLocation();
				});
			} else {
				this.localGetLocation();
			}
		},
		localGetLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					const { latitude, longitude } = res;
					uni.request({
						url: 'https://restapi.amap.com/v3/geocode/regeo',
						data: {
							key: '7aa4914eb3c1cd78c7a70de253196e71',
							location: `${longitude},${latitude}`
						},
						success: (r) => {
							if (r.data && r.data.regeocode) {
								const addr = r.data.regeocode.formattedAddress || '';
								const district = r.data.regeocode.addressComponent?.district || '';
								const city = r.data.regeocode.addressComponent?.city || '';
								this.currentLocation = city || district || addr;
							} else {
								this.currentLocation = '同城';
							}
						},
						fail: () => {
							this.currentLocation = '同城';
						}
					});
				},
				fail: () => {
					this.currentLocation = '同城';
				}
			});
		},
		// 从后端加载拍摄方式类型映射
		loadPublishTypeMap() {
			this.$http('selectItemListExt', JSON.stringify({
				tag: 'source_type',
				token: uni.getStorageSync('token') || ''
			})).then(res => {
				if (res.code == 0 && res.itemList && res.itemList.length) {
					const map = {};
					res.itemList.forEach(item => {
						map[item.selectValue] = item.selectTxt;
					});
					this.publishTypeMap = map;
				}
			}).catch(err => {
				console.log('获取类型映射失败，使用默认映射', err);
			});
		},
		formatTime(time) {
			if (!time) return '';
			const d = new Date(time);
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${day}`;
		},
		getPublishType(type) {
			if (type === '' || type === null || type === undefined) return '';
			// 优先使用后端映射
			if (this.publishTypeMap && this.publishTypeMap[type]) {
				return this.publishTypeMap[type];
			}
			// 兜底默认映射（从1开始，与后端一致）
			const defaultMap = {
				1: '拍摄',
				2: '自创',
				3: '录制',
				4: '截屏',
				5: '转载',
				6: 'AI制作',
				7: '图片加字',
				8: '视频加字'
			};
			return defaultMap[type] || '';
		},
		getPublishTypeIcon(type) {
			console.log('getPublishTypeIcon type:', type, 'typeof:', typeof type);
			if (type === '' || type === null || type === undefined) return '📷';
			const iconMap = {
				1: '📸',
				2: '✏️',
				3: '🎬',
				4: '📱',
				5: '🔄',
				6: '🤖',
				7: '🖼️',
				8: '🎥'
			};
			const result = iconMap[type] || '📷';
			console.log('icon result:', result);
			return result;
		},
		getUserLevel(item) {
			if (!item) return 5;
			const vip = item.vip != null ? Number(item.vip) : 0;
			const level = item.level != null ? Number(item.level) : 0;
			const userLevel = item.userLevel != null ? Number(item.userLevel) : 0;
			return vip || level || userLevel || 5;
		},
		getVipClass(item) {
			const level = this.getUserLevel(item);
			return 'vip-level-' + level;
		},
		// 浏览计数:点击即计入浏览
		handleViewCount(item) {
			const rawList = this.tabData[this.tabIndex] || [];
			const idx = rawList.findIndex(i => String(i.newsID) === String(item.newsID));
			if (idx === -1) {
				console.log('浏览计数:未找到newsID', item.newsID);
				return;
			}
			const rawItem = rawList[idx];
			if (rawItem._viewCounted) {
				console.log('浏览计数:已计数过,跳过');
				return;
			}
			// 用 $set 确保 Vue 2 响应式检测
			this.$set(rawItem, '_viewCounted', true);
			this.$set(rawItem, 'viewNum', (Number(rawItem.viewNum) || 0) + 1);
			console.log('浏览计数成功,newsID:', item.newsID, 'viewNum:', rawItem.viewNum);
			// 调后端接口
			this.$http('newsViewCount', JSON.stringify({
				newsID: item.newsID,
				token: uni.getStorageSync('token') || ''
			})).then(res => {
				if (res.code == 0) {
					console.log('后端浏览计数成功');
				}
			}).catch(err => {
				console.log('浏览计数接口暂未实现,本地已+1', err);
			});
		},
		// 使用优惠券
		useCoupon(item) {
			uni.showToast({
				title: `已选择${item.name}`,
				icon: 'none'
			});
			this.promoteTab = 0;
		},

		// 打开推广弹窗，初始化数据
		goPromote(item) {
			if (!this.checkLogin() || !item?.newsID) return;
			this.promoteTab = 0;
			this.promoteTarget = '';
			this.promoteCount = 0;
			this.selectNewsId = item.newsID;
			this.$refs.promotePopup.open();
		},

		onPromoteClose() {
			this.promoteTab = 0;
			this.promoteTarget = '';
			this.promoteCount = 0;
		},

		submitPromote() {
			if (!this.promoteTarget) {
				return uni.showToast({ title: '请选择推广用户', icon: 'none' });
			}
			if (!this.promoteCount) {
				return uni.showToast({ title: '请选择推广人数', icon: 'none' });
			}
			uni.showToast({ title: `提交成功 ￥${this.promotePrice}` });
			setTimeout(() => {
				this.$refs.promotePopup.close();
			}, 1200);
		},

		// 更新经纬度
		lonLatUpdate() {
			uni.getLocation({
				type: 'wgs84',
				success: async (res) => {
					await this.$http('userLonLatUpdate', {
						lon: res.longitude,
						lat: res.latitude,
						token: uni.getStorageSync('token') || ''
					});
				},
				fail: (err) => console.log('获取定位失败', err)
			});
		},

		// 加载列表数据
		async loadData(reset = true) {
			if (this.loading) return;
			this.loading = true;
			if (reset) this.page = 0;

			try {
				const res = await this.$http('newsUserListClient', {
					newsTitle: '',
					newsFlid: this.currentNewsFlid,
					pg: this.page,
					token: uni.getStorageSync('token') || ''
				});
				if (res.code == 0) {
					this.handleData(res.newsList, reset);
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			} catch (err) {
				console.error('列表加载异常', err);
			} finally {
				this.loading = false;
			}
		},

		// 处理分页数据拼接
		handleData(newsList, reset) {
			const data = newsList.datas || [];
			// 调试：打印每条列表项的 userid、userSex、userOld
			data.forEach((item, i) => {
				console.log(`=== 列表数据[${i}] === userid:${item.userid} userSex:${item.userSex} userOld:${item.userOld} userName:${item.userName}`);
			});
			const pageInfo = newsList.pgInfo || {};
			if (reset) {
				this.tabData[this.tabIndex] = [...data];
			} else {
				this.tabData[this.tabIndex].push(...data);
			}
			this.pageInfo[this.tabIndex] = pageInfo;
			this.loadStatus = data.length >= pageInfo.total_num ? 'noMore' : 'more';
		},
		// 补全列表中缺失的性别和年龄信息（从basics基本资料获取）
		fixMissingUserInfo() {
			const list = this.tabData[this.tabIndex] || [];
			console.log(`fixMissingUserInfo: total=${list.length}, items with missing data:`);
			list.forEach((item, i) => {
				const missing = (!item.userSex || !item.userOld);
				if (missing) {
					console.log(`  [${i}] userid=${item.userid} userSex="${item.userSex}" userOld="${item.userOld}" userName=${item.userName}`);
				}
			});
			const missingUsers = list.filter(item => (!item.userSex || !item.userOld) && item.userid);
			
			if (!missingUsers.length) return;
			
			let updatedCount = 0;
			missingUsers.forEach((item) => {
				// 先检查缓存
				if (this.userInfoCache[item.userid]) {
					const info = this.userInfoCache[item.userid];
					const idx = list.findIndex(i => i.userid === item.userid);
					if (idx !== -1) {
						const newItem = { ...list[idx] };
						if (info.sex) newItem.userSex = info.sex;
						if (info.age) newItem.userOld = info.age;
						this.$set(this.tabData[this.tabIndex], idx, newItem);
						updatedCount++;
					}
					return;
				}
				this.fetchUserInfo(item.userid).then(info => {

					if (info) {
						this.userInfoCache[item.userid] = info;
						const currentList = this.tabData[this.tabIndex] || [];
						const idx = currentList.findIndex(i => i.userid === item.userid);
						if (idx !== -1) {
							const newItem = { ...currentList[idx] };
							if (info.sex) newItem.userSex = info.sex;
							if (info.age) newItem.userOld = info.age;
							this.$set(this.tabData[this.tabIndex], idx, newItem);
							console.log('Updated:', item.userid, 'sex:', newItem.userSex, 'age:', newItem.userOld);
						}
					}
				}).catch((err) => {
					console.error('获取用户信息失败:', item.userid, err);
				});
			});
		},
		// 获取单个用户的性别和年龄（优先从basics基本资料获取）
		fetchUserInfo(userid) {
			return new Promise((resolve) => {
				if (this.userInfoCache[userid]) {
					// 如果缓存的性别/年龄与当前用户一致，说明缓存的是错误数据（userInfoListMy 返回的），清除缓存
					const cached = this.userInfoCache[userid];
					const currentUserid = uni.getStorageSync('userid');
					const isOtherUser = String(userid) !== String(currentUserid);
					if (isOtherUser && cached.fromUserInfoListMy) {
						delete this.userInfoCache[userid];
						console.log('fetchUserInfo: cleared wrong cache for', userid);
					} else {
						resolve(cached);
						return;
					}
				}
				const token = uni.getStorageSync('token');
				const currentUserid = String(uni.getStorageSync('userid') || '').trim();
				const targetUserid = String(userid || '').trim();
				console.log(`fetchUserInfo compare: targetUserid="${targetUserid}" currentUserid="${currentUserid}" equal=${targetUserid === currentUserid}`);
				
				// 只有查看自己时才调 userInfoListMy（后端只认 token 不认 userid）
				// 查看他人时直接用 userInfoPublic
				if (targetUserid !== currentUserid) {
					console.log('fetchUserInfo: 他人数据，直接用 userInfoPublic, userid:', userid);
					this.fetchFromPublic(userid, token).then(resolve);
					return;
				}
				
				console.log('fetchUserInfo: 自己数据，调用 userInfoListMy, userid:', userid);
				// 优先从basics基本资料获取
				this.$http('userInfoListMy', JSON.stringify({ 
					groupInfo: 1,
					groupModule: 1,
					token: token,
					userid: userid
				})).then(res => {
					console.log('userInfoListMy response:', res.code, res.infoList ? res.infoList.length : 'no list');
					if (res.code == 0 && res.infoList && res.infoList.length > 0) {
						const sexItem = res.infoList.find(item => item.moduleID === 'sex' && item.infoTxt);
						const birthdayItem = res.infoList.find(item => item.moduleID === 'birthday' && item.infoTxt);
						
						console.log('userInfoListMy found - sex:', sexItem ? sexItem.infoTxt : 'none', 'birthday:', birthdayItem ? birthdayItem.infoTxt : 'none');
						
						const info = {};
						if (sexItem) {
							info.sex = sexItem.infoTxt;
						}
						if (birthdayItem) {
							info.age = this.calcAge(birthdayItem.infoTxt);
						}
						
						if (info.sex || info.age) {
							console.log('userInfoListMy resolved with:', info);
							info.fromUserInfoListMy = true;
							this.userInfoCache[userid] = info;
							resolve(info);
							return;
						}
					}
					// basics没数据时，尝试用userInfoPublic获取
					console.log('userInfoListMy no data, trying userInfoPublic...');
					this.fetchFromPublic(userid, token).then(resolve);
				}).catch(err => {
					console.log('userInfoListMy error:', err);
					// basics接口失败时，尝试用userInfoPublic获取
					this.fetchFromPublic(userid, token).then(resolve);
				});
			});
		},
		// 从userInfoPublic获取用户性别和年龄
		fetchFromPublic(userid, token) {
			return new Promise((resolve) => {
				console.log('fetchFromPublic: calling userInfoPublic for userid:', userid);
				this.$http('userInfoPublic', JSON.stringify({ 
					userid: userid,
					token: token
				})).then(res => {
					console.log('userInfoPublic response:', res.code, res.userInfo ? JSON.stringify(res.userInfo).substring(0, 300) : 'no userInfo');
					if (res.code == 0 && res.userInfo) {
						const userInfo = res.userInfo;
						const info = {};
						if (userInfo.sex) {
							info.sex = userInfo.sex;
						}
						if (userInfo.userOld) {
							info.age = String(userInfo.userOld);
						} else if (userInfo.birthday) {
							info.age = this.calcAge(userInfo.birthday);
						}
						console.log('userInfoPublic resolved with:', info);
						if (info.sex || info.age) {
							this.userInfoCache[userid] = info;
							resolve(info);
							return;
						}
					}
					console.log('userInfoPublic: no data found, resolving null');
					resolve(null);
				}).catch(err => {
					console.log('userInfoPublic error:', err);
					resolve(null);
				});
			});
		},
		// 根据生日计算年龄
		calcAge(birthday) {
			if (!birthday) return '';
			// 支持 "2004-07-04" 或 "2004/07/04" 格式
			const parts = birthday.split(/[-/]/);
			if (parts.length < 1) return '';
			const year = parseInt(parts[0]);
			if (isNaN(year)) return '';
			
			const now = new Date();
			const currentYear = now.getFullYear();
			let age = currentYear - year;
			
			// 如果有月份和日期，检查是否过生日
			if (parts.length >= 2) {
				const month = parseInt(parts[1]);
				if (!isNaN(month)) {
					const currentMonth = now.getMonth() + 1;
					if (currentMonth < month) {
						age--; // 还没过生日
					} else if (currentMonth === month && parts.length >= 3) {
						const day = parseInt(parts[2]);
						if (!isNaN(day) && now.getDate() < day) {
							age--; // 还没过生日
						}
					}
				}
			}
			
			return age >= 0 ? String(age) : '';
		},

		// 切换顶部标签
		tabBarClick(tabID) {
			if (this.tabIndex === tabID || !this.checkLogin()) return;
			this.tabIndex = tabID;
			this.page = 0;
			this.loadData();
		},

		// 登录校验
		checkLogin() {
			if (!uni.getStorageSync('token')) {
				uni.navigateTo({ url: '/pages/public/loginPwd' });
				return false;
			}
			return true;
		},

		// 发布动态
		publishClick() {
			if (this.checkLogin()) {
				uni.navigateTo({ url: `/pages/index/dynamic?newsFlID=${this.tabIndex}` });
			}
		},

		subscriptionClick() {
			uni.navigateTo({ url: '/pages/menDian/menDianList' });
		},

		// 点赞逻辑
		async handleDianzan(newsID) {
			if (!this.checkLogin()) return;
			try {
				const res = await this.$http('newsUserDianZan', {
					newsID: newsID,
					token: uni.getStorageSync('token') || ''
				});
				if (res.code == 0) {
					const idx = this.currentTabData.findIndex(item => item.newsID === newsID);
					if (idx > -1) {
						const item = this.currentTabData[idx];
						item.isDianZan = item.isDianZan === 1 ? 0 : 1;
						item.numDianZan = item.isDianZan ? Number(item.numDianZan) + 1 : Math.max(0, Number(item.numDianZan) - 1);
						// 响应式更新视图
						this.$set(this.tabData[this.tabIndex], idx, { ...item });
					}
					uni.showToast({ title: res.msg, icon: 'none' });
					console.log(this.currentTabData);
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			} catch (err) {
				console.error('点赞失败', err);
			}
		},

		// 跳转评论页
		handleDiscuss(item) {
			if (this.checkLogin()) {
				uni.navigateTo({
					url: `/pages/index/discuss?newsID=${item.newsID}&userID=${item.userid}`
				});
			}
		},

		// 预览图片
		previewImage(current, urls) {
			uni.previewImage({ urls: urls || [current], current });
		},

		// 打开分享弹窗
		showSharePopup(title, index) {
			this.popupTitle = title;
			this.shareData = this.shareConfig[index] || [];
			this.$refs.popup.open('bottom');
		},

		handleShare(item) {
			console.log('分享操作：', item.name);
			this.$refs.popup.close();
		},

		// 跳转用户主页
		userUrlClick(userid) {
			if (!this.checkLogin()) return;
			console.log('=== userUrlClick 跳转 === 传入userid:', userid, '当前登录userid:', uni.getStorageSync('userid'));
			uni.navigateTo({
				url: `/pages/index/headshots?userid=${userid}`
			});
		},
		// 显示推广提示
		showPromoteTip() {
			uni.showModal({
				title: '温馨提示',
				content: '不付费后台很难发现您的优秀作品，作品推广需后台人工审核，推广自己的作品请回我的同城。',
				showCancel: false,
				confirmText: '知道了'
			});
		}
	}
};
</script>

<style scoped lang="scss">
// 全局取消点击高亮
* {
	-webkit-tap-highlight-color: transparent;
}
page {
	background-color: #f7f7f9;
}

.page-container {
	background: #f7f7f9;
	min-height: 100vh;
}

// 自定义导航栏（和交友页面一致）
.navbar {
	background: #fff;
	position: sticky;
	top: 0;
	z-index: 100;
}

.navbar-content {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.navbar-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
}

// 顶部Tab栏（和交友页面一致）
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 20rpx;
	background: #fff;
	border-bottom: 1rpx solid #f0f0f0;
	box-sizing: border-box;
}

.tab-bar {
	display: flex;
	gap: 8rpx;
	flex: 1;
	justify-content: flex-start;
}

.tab-item {
	font-size: 34rpx;
	color: #666 ;
	position: relative;
	padding: 12rpx 24rpx;
	cursor: pointer;
	transition: all 0.3s;
	border-radius: 32rpx;
	&.active {
		color: #fefefe !important;
		font-weight: 500;
		background: linear-gradient(135deg, #fd7031 0%, #ff8c42 100%);
		box-shadow: 0 4rpx 16rpx rgba(253, 112, 49, 0.3);
	}
}

.publish-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12rpx 24rpx;
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
	background: linear-gradient(135deg, #fd7031 0%, #ff6b35 100%);
	border-radius: 32rpx;
	box-shadow: 0 4rpx 16rpx rgba(253, 112, 49, 0.3);
}
.publish-icon {
	font-size: 32rpx;
	font-weight: 300;
	margin-right: 6rpx;
}

// 列表内容区域
.content-list {
	padding: 24rpx;
	padding-bottom: 120rpx;
	box-sizing: border-box;
}

.message-card {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
	border-radius: 20rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(253, 112, 49, 0.08);
	border: 1rpx solid rgba(253, 112, 49, 0.1);
}

.icon-wrapper {
	width: 96rpx;
	height: 96rpx;
	margin-right: 24rpx;
	flex-shrink: 0;
	image {
		width: 100%;
		height: 100%;
		border-radius: 16rpx;
	}
}

.message-content {
	flex: 1;
}
.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}
.message-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a1a1a;
}
.message-time {
	font-size: 24rpx;
	color: #999;
}

// 动态卡片
.dynamic-item {
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
}

.user-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}
.avatar {
	width: 80rpx;
	height: 80rpx;
	flex-shrink: 0;
	image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 2rpx solid #fff;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	}
}
.user-detail {
	flex: 1;
}
.username {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 8rpx;
}
.stats-row {
	display: flex;
	align-items: center;
	gap: 10rpx;
}
.level-badge {
	border-radius: 20rpx;
	padding: 4rpx 14rpx;
	display: inline-flex;
	align-items: center;
}
.level-badge.vip-level-1 {
	background-color: #e8e8e8;
}
.level-badge.vip-level-2 {
	background-color: #2196f3;
}
.level-badge.vip-level-3 {
	background-color: #ffd700;
}
.level-badge.vip-level-4 {
	background-color: #f44336;
}
.level-badge.vip-level-5 {
	background-color: #333333;
}
.level-text {
	font-size: 20rpx;
	font-weight: 600;
	letter-spacing: 1rpx;
	color: #ffffff;
}
.vip-level-1 .level-text {
	color: #333333;
}
.vip-level-2 .level-text,
.vip-level-3 .level-text,
.vip-level-4 .level-text,
.vip-level-5 .level-text {
	color: #ffffff;
}
.user-stats {
	display: inline-flex;
	align-items: center;
	border-radius: 40rpx;
	padding: 4rpx 16rpx;
	gap: 4rpx;
	width: auto;
	flex-shrink: 0;
	.age-icon, .age-num {
		color: #fff;
		font-size: 20rpx;
		font-weight: 500;
	}
}

.content-text {
	font-size: 30rpx;
	line-height: 1.5;
	margin-bottom: 16rpx;
	word-break: break-all;
	color: #333;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.content-images {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10rpx;
	margin-bottom: 16rpx;
	image {
		width: 100%;
		height: 200rpx;
		border-radius: 10rpx;
	}
}

.action-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8rpx 0;
}
.action-group {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 4rpx;
	width: 100%;
}
.action-item {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	color: #666;
	font-size: 26rpx;
	padding: 6rpx 0;
	border-radius: 8rpx;
	transition: all 0.2s;
	&:active {
		background: #f5f5f5;
	}
	.uni-icons {
		font-size: 24rpx;
	}
	.action-title {
		width: auto;
	}
}

// 动态底部信息栏
.item-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 12rpx;
	padding-top: 12rpx;
	border-top: 1rpx solid #f5f5f5;
}
.footer-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 24rpx;
	color: #999;
}
.footer-icon {
	font-size: 24rpx;
}
.footer-text {
	font-size: 24rpx;
	color: #999;
}

// 网络广告商品卡片
.ad-card {
	display: flex;
	background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
	border-radius: 24rpx;
	margin: 20rpx 24rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(253, 112, 49, 0.15);
	border: 1rpx solid rgba(253, 112, 49, 0.1);
}
.ad-card-img-wrap {
	position: relative;
	width: 260rpx;
	height: 260rpx;
	flex-shrink: 0;
}
.ad-card-img {
	width: 100%;
	height: 100%;
}
.ad-badge {
	position: absolute;
	top: 0;
	left: 0;
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
	color: #fff;
	font-size: 18rpx;
	font-weight: bold;
	padding: 8rpx 16rpx;
	border-radius: 0 0 16rpx 0;
}
.ad-card-price {
	position: absolute;
	left: 16rpx;
	bottom: 16rpx;
	background: linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%);
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: baseline;
	box-shadow: 0 4rpx 12rpx rgba(255, 68, 68, 0.4);
}
.ad-price-symbol {
	color: #fff;
	font-size: 22rpx;
	font-weight: bold;
	margin-right: 2rpx;
}
.ad-price-value {
	color: #fff;
	font-size: 34rpx;
	font-weight: bold;
}
.ad-card-info {
	flex: 1;
	padding: 24rpx 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.ad-card-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #1a1a1a;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.ad-card-desc {
	font-size: 24rpx;
	color: #888;
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin-top: 8rpx;
}
.ad-card-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
}
.ad-card-tag {
	background: linear-gradient(135deg, #fd7031 0%, #ff8c42 100%);
	color: #fff;
	font-size: 20rpx;
	font-weight: 500;
	padding: 4rpx 14rpx;
	border-radius: 6rpx;
}
.ad-card-action {
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #fd7031 0%, #ff6b35 100%);
	color: #fff;
	font-size: 22rpx;
	font-weight: 500;
	padding: 8rpx 20rpx;
	border-radius: 24rpx;
}
.ad-arrow {
	margin-left: 8rpx;
	font-size: 20rpx;
}

// 竖排三个点
.vertical-dots {
	transform: rotate(90deg);
}

// 分享弹窗样式
.share-popup {
	padding: 40rpx 30rpx 100rpx;
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
}
.share-title {
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 40rpx;
}
.share-platforms {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 36rpx;
}
.platform-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 24rpx;
	color: #666;
}
.platform-icon {
	width: 60rpx;
	height: 60rpx;
	margin-bottom: 12rpx;
}

// ========== 推广弹窗统一样式 ==========
.promote-wrap {
	width: 100%;
	height: 85vh;
	max-height: 1400rpx;
	display: flex;
	flex-direction: column;
	padding: 70rpx 40rpx 40rpx;
	box-sizing: border-box;
	border-radius: 48rpx 48rpx 0 0;
	position: relative;
	background: #fff;
}
.close-icon {
	position: absolute;
	top: 30rpx;
	left: 30rpx;
	font-size: 48rpx;
	color: #999;
	z-index: 10;
}
.title-box {
	text-align: center;
	margin-bottom: 40rpx;
	.big-title {
		font-size: 40rpx;
		font-weight: 600;
		color: #333;
	}
	.tip-text {
		font-size: 28rpx;
		color: #999;
		margin-top: 8rpx;
	}
}
.tab-box {
	display: flex;
	border-bottom: 1rpx solid #eee;
	margin-bottom: 30rpx;
	.tab-item {
		padding: 24rpx 40rpx;
		font-size: 32rpx;
		color: #666;
		&.active {
			color: #fd7031;
			border-bottom: 3rpx solid #fd7031;
		}
	}
}
.scroll-content {
	flex: 1;
	overflow-y: auto;
}
.form-section {
	margin-bottom: 40rpx;
	.section-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 24rpx;
	}
}
.target-group {
	margin-bottom: 28rpx;
	.group-label {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 16rpx;
	}
}
.btn-group {
	display: flex;
	gap: 20rpx;
	flex-wrap: wrap;
}
.tag-btn {
	padding: 12rpx 32rpx;
	border: 1rpx solid #ddd;
	border-radius: 50rpx;
	font-size: 28rpx;
	color: #666;
	&.active {
		background-color: #fd7031;
		color: #fff;
		border-color: #fd7031;
	}
}
.price-display {
	background: #fff8f3;
	border: 1rpx solid #ffe4d4;
	border-radius: 20rpx;
	padding: 32rpx;
	display: flex;
	align-items: baseline;
	justify-content: center;
	.price-symbol {
		font-size: 32rpx;
		color: #fd7031;
		margin-right: 8rpx;
	}
	.price-value {
		font-size: 56rpx;
		font-weight: bold;
		color: #fd7031;
	}
}

// 券包样式
.coupon-wrap {
	padding: 10rpx 0;
}
.coupon-item {
	display: flex;
	background: #fff8f3;
	border-radius: 24rpx;
	margin-bottom: 32rpx;
	overflow: hidden;
	border: 1rpx solid #ffe4d4;
}
.coupon-left {
	width: 240rpx;
	padding: 40rpx 0;
	text-align: center;
	background: linear-gradient(135deg, #fd7031, #ff9955);
	color: #fff;
	position: relative;
	&::after {
		content: '';
		position: absolute;
		right: -12rpx;
		top: 50%;
		transform: translateY(-50%);
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background: #fff;
	}
}
.coupon-price {
	.symbol {
		font-size: 28rpx;
	}
	.num {
		font-size: 56rpx;
		font-weight: bold;
	}
}
.coupon-condition {
	font-size: 24rpx;
	margin-top: 8rpx;
	opacity: 0.9;
}
.coupon-right {
	flex: 1;
	padding: 32rpx 40rpx;
	position: relative;
}
.coupon-name {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 12rpx;
}
.coupon-date {
	font-size: 24rpx;
	color: #999;
}
.use-btn {
	position: absolute;
	right: 32rpx;
	top: 50%;
	transform: translateY(-50%);
	background: #fd7031;
	color: #fff;
	font-size: 24rpx;
	padding: 10rpx 28rpx;
	border-radius: 40rpx;
	pointer-events: none;
}
.coupon-empty {
	text-align: center;
	padding: 120rpx 0;
	color: #999;
	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 32rpx;
	}
	.empty-text {
		font-size: 28rpx;
	}
}

// 底部提交按钮
.submit-btn {
	width: 100%;
	height: 184rpx;
	line-height: 184rpx;
	text-align: center;
	background: #fd7031;
	color: #fff;
	border-radius: 99rpx;
	font-size: 34rpx;
	font-weight: 500;
	margin-top: 30rpx;
}
</style>