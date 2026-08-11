<template>
	<view class="page">
		<!-- APP 禁止页面滚动 -->
		<page-meta :page-style="'overflow:hidden'" />

		<!-- 固定导航 -->
		<view class="nav-bar-a">
			<view :style="{ height: statusBarHeight + 'px', background: '#FFFFFF' }"></view>
			<uni-nav-bar
				:backgroundColor="navBgColor"
				:left-icon="leftIcon"
				:leftText="navTitle"
				right-icon="more-filled"
				:color="navTextColor"
				:statusBar="false"
				:leftWidth="300"
				@clickLeft="leftClick"
				@clickRight="cightClick"
			/>
		</view>

		<!-- 吸顶 Tab（fixed，始终存在，通过 opacity/visibility 控制显隐） -->
		<view class="tabs-fixed" :style="{ top: statusBarHeight + 44 + 'px', opacity: isSticky ? 1 : 0, pointerEvents: isSticky ? 'auto' : 'none' }">
			<view v-for="(tab, i) in tabs" :key="i" class="tab" :class="{ 'tab-active': isCurrent == i }" @click="tabsCurrent(i)">
				<text>{{ tab }}</text>
				<view v-if="isCurrent == i" class="tab-line" />
			</view>
		</view>

		<!-- 滚动区 -->
		<scroll-view class="scroll" scroll-y :show-scrollbar="false" :style="{ height: scrollHeight + 'px' }" @scroll="onScroll">
			<!-- 封面 -->
			<view class="cover">
				<image class="cover-img" :src="userInfo.imgUrl" mode="aspectFill" />
				<view class="cover-mask" />
				<view class="avatar-box">
					<image class="avatar-img" :src="userInfo.imgUrl || '/static/missing-face.png'" mode="aspectFill" />
				</view>
			</view>

			<!-- 用户信息卡 -->
			<view class="info-card">
				<view class="info-row">
					<text class="info-name">{{ userInfo.userName || '未知' }}</text>
					<view class="gender-badge" :style="{ background: userInfo.sex ? (userInfo.sex == '男' ? '#0dc6e0' : '#ff6b8a') : '#cccccc' }">
						<text>{{ userInfo.sex ? (userInfo.sex == '男' ? '♂' : '♀') : '未知' }}</text>
						<text>{{ userInfo.userOld }}</text>
					</view>
				</view>
				<view class="info-meta">
					<view v-if="userInfo.gongZuoDi" class="meta-pill meta-loc">📍 {{ userInfo.gongZuoDi }}</view>
					<view class="meta-pill meta-like">❤ {{ likeCount }}获赞</view>
					<view v-if="daysOnPlatform" class="meta-pill meta-days">🎯 来同城{{ daysOnPlatform }}天</view>
				</view>
			</view>

			<!-- 内嵌 Tab（未吸顶时显示） -->
			<view class="tabs-inline" id="tabs-inline">
				<view v-for="(tab, i) in tabs" :key="i" class="tab" :class="{ 'tab-active': isCurrent == i }" @click="tabsCurrent(i)">
					<text>{{ tab }}</text>
					<view v-if="isCurrent == i" class="tab-line" />
				</view>
			</view>

			<!-- 关于她 -->
			<view v-if="isCurrent == 0" class="panel">
				<!-- 自己相亲：使用 xiangQinData -->
				<template v-if="userInfo.xiangQinSelf == 1">
					<view v-if="keyInfoList.length || mottoText" class="section">
						<view class="section-title">个人信息</view>
						<view v-if="keyInfoList.length" class="tags">
							<text v-for="(tag, i) in keyInfoList" :key="i" class="tag">{{ tag }}</text>
						</view>
						<view v-if="mottoText" class="motto-box">
							<text class="motto-title">座右铭</text>
							<text class="motto-content">{{ mottoText }}</text>
						</view>
					</view>

					<view v-if="xiangQinData.length" class="section">
						<view class="section-title1">相亲资料</view>
						<view class="xiangqin-grid">
							<view class="xiangqin-col">
								<view 
									v-for="(item, index) in xiangQinLeftList" 
									:key="'xq-left-' + index" 
									class="xiangqin-item"
								>
									<view class="xq-label">{{ item.moduleName }}：</view>
									<view class="xq-value">{{ item.infoTxt || '未填写' }}</view>
								</view>
							</view>
							<view class="xiangqin-col">
								<view 
									v-for="(item, index) in xiangQinRightList" 
									:key="'xq-right-' + index" 
									class="xiangqin-item"
								>
									<view class="xq-label">{{ item.moduleName }}：</view>
									<view class="xq-value">{{ item.infoTxt || '未填写' }}</view>
								</view>
							</view>
						</view>
					</view>
					
					<view v-if="selfImages.length" class="section">
						<view class="section-title">照片</view>
						<view class="image-grid">
							<image 
								v-for="(img, index) in selfImages" 
								:key="'self-img-' + index" 
								class="display-img" 
								:src="img" 
								mode="aspectFill"
								@click="previewImage(selfImages, index)"
							/>
						</view>
					</view>
					<view v-if="!keyInfoList.length && !mottoText && !xiangQinData.length && !selfImages.length" class="empty">
						<text>暂无资料</text>
					</view>
				</template>

				<!-- 他人相亲：使用 userOtherData -->
				<template v-else-if="userInfo.xiangQinOther == 1">
					<view v-if="otherKeyInfoList.length || otherMottoText" class="section">
						<view class="section-title">个人信息</view>
						<view v-if="otherKeyInfoList.length" class="tags">
							<text v-for="(tag, i) in otherKeyInfoList" :key="'other-tag-' + i" class="tag">{{ tag }}</text>
						</view>
						<view v-if="otherMottoText" class="motto-box">
							<text class="motto-title">座右铭</text>
							<text class="motto-content">{{ otherMottoText }}</text>
						</view>
					</view>
					<view v-if="userOtherData.length" class="section">
						<view class="section-title1">他人相亲资料</view>
						<view class="xiangqin-grid">
							<view class="xiangqin-col">
								<view 
									v-for="(item, index) in otherLeftList" 
									:key="'other-left-' + index" 
									class="xiangqin-item"
								>
									<view class="xq-label">{{ item.moduleName }}：</view>
									<view class="xq-value">{{ item.infoTxt || '未填写' }}</view>
								</view>
							</view>
							<view class="xiangqin-col">
								<view 
									v-for="(item, index) in otherRightList" 
									:key="'other-right-' + index" 
									class="xiangqin-item"
								>
									<view class="xq-label">{{ item.moduleName }}：</view>
									<view class="xq-value">{{ item.infoTxt || '未填写' }}</view>
								</view>
							</view>
						</view>
					</view>
					<view v-if="otherImages.length" class="section">
						<view class="section-title">照片</view>
						<view class="image-grid">
							<image 
								v-for="(img, index) in otherImages" 
								:key="'other-img-' + index" 
								class="display-img" 
								:src="img" 
								mode="aspectFill"
								@click="previewImage(otherImages, index)"
							/>
						</view>
					</view>
					<view v-if="!otherKeyInfoList.length && !otherMottoText && !userOtherData.length && !otherImages.length" class="empty">
						<text>暂无资料</text>
					</view>
				</template>

				<view v-else class="empty">
					<text>暂无个人信息</text>
				</view>
			</view>

			<!-- 动态 -->
			<view v-if="isCurrent == 1" class="panel">
				<view v-for="(post, i) in postsData" :key="i" class="post">
					<view class="post-head">
						<image class="post-avatar" :src="userInfo.imgUrl || '/static/missing-face.png'" mode="aspectFill" />
						<view class="post-meta">
							<text class="post-name">{{ userInfo.userName }}</text>
							<view class="gender-badge" :style="{ background: userInfo.sex ? (userInfo.sex == '男' ? '#0dc6e0' : '#ff6b8a') : '#cccccc' }">
								<text>{{ userInfo.sex ? (userInfo.sex == '男' ? '♂' : '♀') : '未知' }}</text>
								<text>{{ userInfo.userOld }}</text>
							</view>
						</view>
					</view>
					<text class="post-body">{{ post.remark }}</text>
					<view v-if="post.images && post.images.length" class="post-imgs">
						<image v-for="(img, j) in post.images" :key="j" class="post-img" :src="img" mode="aspectFill" />
					</view>
					<view class="action-bar">
						<view class="action-group">
							<view class="action-item" @click="handleDianzan(post.newsID)">
								<uni-icons :type="post.isDianZan == 1 ? 'hand-up-filled' : 'hand-up'" size="22" />
								<text class="action-title">{{ post.numDianZan || '赞' }}</text>
							</view>
							<view class="action-item" @click="handleDiscuss(post)">
								<uni-icons type="compose" size="22" />
								<text class="action-title">{{ post.numPinLun || '评论' }}</text>
							</view>
							<view class="action-item" @click="handleViewCount(post)">
								<uni-icons type="eye" size="22" />
								<text class="action-title">{{ post.viewNum || 0 }}次浏览</text>
							</view>
							<view class="action-item" @click="showSharePopup('转到', 'switched')">
								<uni-icons type="redo" size="22" />
								<text class="action-title">转到</text>
							</view>
							<view v-if="isOwnPost(post)" class="action-item" @click="handleDeleteNews(post)">
								<uni-icons type="trash" size="22" color="#ff4d4f" />
								<text class="action-title" style="color:#ff4d4f">删除</text>
							</view>
						</view>
						<view class="more-btn">
							<image src="/static/index/threeDots.png" mode="aspectFit" />
						</view>
					</view> 
				</view>
				<view v-if="!postsData.length" class="empty"><text>暂无动态</text></view>
			</view>

			<view style="height: 80px" />
		</scroll-view>

		<!-- 底部栏 -->
		<view class="bottom">
			<!-- <view class="btn-hello" @tap="greet"><text>打招呼</text></view> -->
			<view class="btn-follow" @tap="toggleFollow">
				<text>{{ isFollowed ? '已关注' : '+ 关注' }}</text>
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
	data() {
		return {
			pages: 0,
			statusBarHeight: 20,
			scrollHeight: 0,
			navOpacity: 0,
			navBgColor: 'transparent',
			navTextColor: '#FF6600',
			navTitle: '',
			leftIcon: 'left',
			btnBgColor: 'rgba(0,0,0,0.45)',
			isSticky: false,
			isCurrent: 0,
			viewMode: 0,
			isFollowed: false,
			userid: '',
			tabs: ['关于', '同城'],
			lastActive: '18分钟前',
			likeCount: 0,
			userInfo: { userOld: 0, imgUrl: '' },
			postsData: [],
			userOtherData: [],
			userBasicData: [],
			xiangQinData: [],
			selfImages: [],
			otherImages: [],
			
			popupTitle: '',
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
		};
	},
	onLoad(options) {
		const { userid, tab } = options;
		const sys = uni.getSystemInfoSync();
		this.statusBarHeight = sys.statusBarHeight || 20;
		this.scrollHeight = sys.windowHeight;
		this.userid = userid;
		this.fetchUser();
		if (tab == '1') {
			this.$nextTick(() => {
				this.tabsCurrent(1);
			});
		}
	},
	onShow() {
		if (this.isCurrent == 1 && this.userid) {
			this.newsUserMy();
		}
	},
		computed: {
		isSelf() {
			return String(uni.getStorageSync('userid')) === String(this.userid);
		},
		daysOnPlatform() {
			const inputTime = this.userInfo.inputTime;
			if (!inputTime) return '';
			const joinDate = new Date(inputTime.replace(/-/g, '/'));
			if (isNaN(joinDate.getTime())) return '';
			const now = new Date();
			const diff = now.getTime() - joinDate.getTime();
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			if (days < 0) return '';
			return days;
		},
		keyInfoList() {
			return this.buildKeyInfoFromUserInfo();
		},
		mottoText() {
			return this.userInfo.zuoYouMin || '';
		},
		xiangQinLeftList() {
			return this.buildXiangQinFromUserInfo();
		},
		xiangQinRightList() {
			return [];
		},
		otherKeyInfoList() {
			return this.buildKeyInfoFromUserInfo();
		},
		otherMottoText() {
			return this.userInfo.zuoYouMin || '';
		},
		otherLeftList() {
			return this.buildXiangQinFromUserInfo();
		},
		otherRightList() {
			return [];
		}
	},
	methods: {
		fetchUser() {
			uni.showLoading({ title: '加载中...' });
			this.$http('userInfoPublic', JSON.stringify({
				token: uni.getStorageSync('token'),
				userid: this.userid,
			})).then((res) => {
				uni.hideLoading();
				if (res.code == 0) {
					this.userInfo = res.userInfo;
					this.userInfo.userOld = this.calcAge(res.userInfo.birthday);
					this.isFollowed = this.userInfo.isFans == 1 ? true : false;
					// 计算最后活跃时间
					if (this.userInfo.inputTime) {
						this.lastActive = this.formatLastActive(this.userInfo.inputTime);
					}
					
					if (this.userInfo.xiangQinSelf == 1) {
						this.viewMode = 0;
					} else if (this.userInfo.xiangQinOther == 1) {
						this.viewMode = 1;
					}
					
					// 加载动态列表
					this.newsUserMy();
				} else {
					uni.showToast({ title: res.msg || '获取失败', icon: 'none' });
				}
			}).catch(() => {
				uni.hideLoading();
				uni.showToast({ title: '网络错误', icon: 'none' });
			});
		},
		newsUserMy(){
			this.$http('newsUserListClient', JSON.stringify({
				newsTitle: '',
				newsFlid: 1,
				pg: 0,
				token: uni.getStorageSync('token') || ''
			})).then((res) => {
				if (res.code == 0) {
					const allDatas = res.newsList.datas || [];
					// 过滤出当前用户的动态
					const datas = allDatas.filter(item => String(item.userid) === String(this.userid));
					console.log('=== newsUserListClient 返回 === 全部:', allDatas.length, '条, 过滤后用户动态:', datas.length, '条');
					if (datas.length > 0) {
						const first = datas[0];
						console.log('第一条数据 numDianZan:', first.numDianZan, 'numPinLun:', first.numPinLun, 'viewNum:', first.viewNum, 'isDianZan:', first.isDianZan);
					}
					this.postsData = datas.map(item => {
						if (item.iconUrl) {
							item.images = item.iconUrl.split(',').filter(url => url.trim() !== '');
						} else {
							item.images = [];
						}
						return item;
					});
					this.likeCount = this.postsData.reduce((sum, p) => sum + (Number(p.numDianZan) || 0), 0);
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch(() => {
				uni.showToast({ title: '网络错误', icon: 'none' });
			});
		},
		userInfoMy(index) {
			this.$http('userInfoListMy', JSON.stringify({ 
				groupInfo: index,
				groupModule: 1,
				token: uni.getStorageSync('token'),
				userid: this.userid
			})).then((res) => {
				if (res.code == 0) {
					if (index == 1) {
						this.userBasicData = res.infoList;
						// 从 userInfoListMy 返回的 birthday 字段计算年龄，补充 userInfoPublic 中为空的情况
						const birthdayItem = res.infoList.find(i => i.moduleID === 'birthday');
						if (birthdayItem && birthdayItem.infoTxt) {
							const age = this.calcAge(birthdayItem.infoTxt);
							if (age) {
								this.userInfo.userOld = age;
								this.$forceUpdate();
							}
						}
					} else {
						this.userOtherData = res.infoList;
					}
					this.fixSexInfo();
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			}).catch((err) => {
				console.error('用户信息:', err);
			});
		},
		fixSexInfo() {
			if (this.userInfo.sex) return;
			
			const findSex = (list) => {
				if (!list || !list.length) return null;
				return list.find(item => item.moduleID === 'sex' && item.infoTxt);
			};
			
			let sexItem = findSex(this.userBasicData);
			if (!sexItem) sexItem = findSex(this.xiangQinData);
			if (!sexItem) sexItem = findSex(this.userOtherData);
			
			if (sexItem) {
				this.userInfo.sex = sexItem.infoTxt;
			}
		},
		loadXiangQinData() {
			this.$http('userInfoListMy', JSON.stringify({ 
				groupInfo: 9,
				groupModule: 1,
				token: uni.getStorageSync('token'),
				userid: this.userid
			})).then((res) => {
				if (res.code == 0) {
					let data = res.infoList;
					
					// 加载图片数据
					this.loadImagesFromData(data, 'self');
					
					// 修正字段标签映射
					const fieldNameMap = {
						'age_range': '愿意另一半年龄区间',
						'bride_price': '与父母商量后的彩礼金额',
						'bottom_line': '希望双方各拿多少聘金来组建家庭',
						'family_status': '家庭现',
						'family_affection': '亲情现',
						'advantage': '优点',
						'hobby': '爱好',
						'ideal_partner': '希望心仪对象的条件',
						'hometown_way': '家务选择方式'
					};
					
					// 更新已有字段的 moduleName
					data.forEach(item => {
						if (fieldNameMap[item.moduleID]) {
							item.moduleName = fieldNameMap[item.moduleID];
						}
					});
					
					// 从本地存储读取 forceText 字段
					Object.keys(fieldNameMap).forEach(moduleID => {
						const localKey = `xiangQin_${moduleID}`;
						const localValue = uni.getStorageSync(localKey);
						if (localValue) {
							const existing = data.find(item => item.moduleID === moduleID);
							if (existing) {
								existing.infoTxt = localValue;
								existing.moduleName = fieldNameMap[moduleID];
							} else {
								data.push({
									moduleID: moduleID,
									moduleName: fieldNameMap[moduleID],
									infoTxt: localValue,
									typeID: '1',
									enumList: []
								});
							}
						}
					});
					
					// 计算年龄
					const birthdayItem = data.find(item => item.moduleID === 'birthday');
					if (birthdayItem && birthdayItem.infoTxt) {
						const age = this.calcAge(birthdayItem.infoTxt);
						if (age) {
							const ageItem = data.find(item => item.moduleID === 'age');
							if (ageItem) {
								ageItem.infoTxt = age + '岁';
							} else {
								data.push({
									moduleID: 'age',
									moduleName: '年龄',
									infoTxt: age + '岁',
									typeID: '1',
									enumList: []
								});
							}
						}
					}
					
					// 过滤掉不需要显示的字段
					const excludeKeys = ['tall', 'star', 'centence', 'photos'];
					data = data.filter(item => !excludeKeys.includes(item.moduleID));
					
					this.xiangQinData = data;
					this.fixSexInfo();
				}
			}).catch((err) => {
				console.error('相亲资料:', err);
			});
		},
		loadXiangQinOtherData() {
			this.$http('userInfoListMy', JSON.stringify({ 
				groupInfo: 2,
				groupModule: 1,
				token: uni.getStorageSync('token'),
				userid: this.userid
			})).then((res) => {
				if (res.code == 0) {
					let data = res.infoList;
					
					// 加载图片数据
					this.loadImagesFromData(data, 'other');
					
					// 修正字段标签映射
					const fieldNameMap = {
						'age_range': '愿意另一半年龄区间',
						'bride_price': '与父母商量后的彩礼金额',
						'bottom_line': '希望双方各拿多少聘金来组建家庭',
						'family_status': '家庭现',
						'family_affection': '亲情现',
						'advantage': '优点',
						'hobby': '爱好',
						'ideal_partner': '希望心仪对象的条件',
						'hometown_way': '家务选择方式'
					};
					
					// 更新已有字段的 moduleName
					data.forEach(item => {
						if (fieldNameMap[item.moduleID]) {
							item.moduleName = fieldNameMap[item.moduleID];
						}
					});
					
					// 从本地存储读取他人相亲资料的 forceText 字段
					Object.keys(fieldNameMap).forEach(moduleID => {
						const localKey = `xiangQinOther_${moduleID}`;
						const localValue = uni.getStorageSync(localKey);
						if (localValue) {
							const existing = data.find(item => item.moduleID === moduleID);
							if (existing) {
								existing.infoTxt = localValue;
								existing.moduleName = fieldNameMap[moduleID];
							} else {
								data.push({
									moduleID: moduleID,
									moduleName: fieldNameMap[moduleID],
									infoTxt: localValue,
									typeID: '1',
									enumList: []
								});
							}
						}
					});
					
					// 计算年龄
					const birthdayItem = data.find(item => item.moduleID === 'birthday');
					if (birthdayItem && birthdayItem.infoTxt) {
						const age = this.calcAge(birthdayItem.infoTxt);
						if (age) {
							const ageItem = data.find(item => item.moduleID === 'age');
							if (ageItem) {
								ageItem.infoTxt = age + '岁';
							} else {
								data.push({
									moduleID: 'age',
									moduleName: '年龄',
									infoTxt: age + '岁',
									typeID: '1',
									enumList: []
								});
							}
						}
					}
					
					// 过滤掉不需要显示的字段
					const excludeKeys = ['photos'];
					data = data.filter(item => !excludeKeys.includes(item.moduleID));
					
					this.userOtherData = data;
				}
			}).catch((err) => {
				console.error('他人相亲资料:', err);
			});
		},
		userFansOpt(){
			this.$http('userFansOpt', JSON.stringify({
				token: uni.getStorageSync('token'),
				userid: this.userid,
			})).then((res) => {
				uni.showToast({ title: res.msg, icon: 'none' });
				if (res.code == 0) {
					const str = res.msg;
					const result = str.split("：")[1];
					if(result == "已取消关注") {
						this.isFollowed = false;
					} else {
						this.isFollowed = true;
					}
				}
			}).catch(() => {
				uni.showToast({ title: '网络错误', icon: 'none' });
			});
		},
		calcAge(birthday) {
			if (!birthday) return '';
			const y = parseInt(birthday.split('-')[0]);
			return isNaN(y) ? '' : new Date().getFullYear() - y;
		},
		formatLastActive(inputtime) {
			if (!inputtime) return '';
			const joinDate = new Date(inputtime.replace(/-/g, '/'));
			if (isNaN(joinDate.getTime())) return '';
			const now = new Date();
			const diffMs = now.getTime() - joinDate.getTime();
			const diffMin = Math.floor(diffMs / (1000 * 60));
			const diffHour = Math.floor(diffMin / 60);
			const diffDay = Math.floor(diffHour / 24);
			if (diffMin < 1) return '刚刚';
			if (diffMin < 60) return diffMin + '分钟前';
			if (diffHour < 24) return diffHour + '小时前';
			if (diffDay < 30) return diffDay + '天前';
			const month = joinDate.getMonth() + 1;
			const day = joinDate.getDate();
			return `${month}月${day}日`;
		},
		// 查看他人主页时，从 userInfoPublic 数据构建个人信息标签
		// 实际字段名参考接口返回：sex, shengGao, xinZuo, wenHua, zhiYe, zuoYouMin
		buildKeyInfoFromUserInfo() {
			const list = [];
			const u = this.userInfo;
			if (!u || !u.userid) return list;
			if (u.sex) list.push(u.sex);
			if (u.userOld) list.push(`${u.userOld}岁`);
			if (u.shengGao) list.push(`身高${u.shengGao}cm`);
			if (u.xinZuo) list.push(u.xinZuo);
			if (u.wenHua) list.push(u.wenHua);
			if (u.zhiYe) list.push(u.zhiYe);
			if (u.biYeYuanXiao) list.push(u.biYeYuanXiao);
			if (u.hyzt) list.push(u.hyzt);
			return list;
		},
		// 从 userInfoPublic 构建「相亲资料」左侧条目（和 userInfoListMy 返回结构一致：{moduleID, moduleName, infoTxt}）
		buildXiangQinFromUserInfo() {
			const u = this.userInfo;
			if (!u || !u.userid) return [];
			const rows = [
				{ moduleID: 'nick_name',    moduleName: '姓名',           infoTxt: u.userName || '' },
				{ moduleID: 'sex',          moduleName: '性别',           infoTxt: u.sex || '' },
				{ moduleID: 'birthday',     moduleName: '出生年月',       infoTxt: u.birthday || '' },
				{ moduleID: 'age',          moduleName: '年龄',           infoTxt: (u.userOld ? `${u.userOld}岁` : '') },
				{ moduleID: 'hyzt',         moduleName: '婚姻状况',       infoTxt: u.hyzt || '' },
				{ moduleID: 'area_code',    moduleName: '成长地',         infoTxt: u.remark || '' },
				{ moduleID: 'area_code_work', moduleName: '工作地',       infoTxt: u.gongZuoDi || '' },
				{ moduleID: 'work_name',    moduleName: '职业',           infoTxt: u.zhiYe || '' },
				{ moduleID: 'education',    moduleName: '文化程度',       infoTxt: u.wenHua || '' },
				{ moduleID: 'degree',       moduleName: '所学专业',       infoTxt: u.biYeYuanXiao ? `毕业于${u.biYeYuanXiao}` : '' },
			];
			// 只保留有 infoTxt 的行
			return rows.filter(r => r.infoTxt);
		},
		loadImagesFromData(data, type) {
			const photosItem = data.find(item => item.moduleID === 'photos');
			if (photosItem && photosItem.infoTxt) {
				try {
					const images = JSON.parse(photosItem.infoTxt);
					if (Array.isArray(images) && images.length) {
						if (type === 'self') {
							this.selfImages = images;
						} else {
							this.otherImages = images;
						}
						return;
					}
				} catch (e) {
					console.error('解析图片数据失败:', e);
				}
			}
			const localKey = type === 'self' ? 'xiangQin_images' : 'xiangQinOther_images';
			const saved = uni.getStorageSync(localKey);
			if (Array.isArray(saved) && saved.length) {
				if (type === 'self') {
					this.selfImages = saved;
				} else {
					this.otherImages = saved;
				}
			}
		},
		previewImage(urls, index) {
			uni.previewImage({
				current: urls[index],
				urls: urls
			});
		},
		onScroll(e) {
			const top = e.detail.scrollTop;

			// Tab 吸顶阈值：封面280 + 用户信息约80 = 360，减去导航栏高度
			this.isSticky = top > 320;

			// 导航栏渐变（仅在封面范围内计算）
			const opacity = Math.min(top / 200, 1);
			this.navOpacity = opacity;

			if (opacity <= 0) {
				this.navBgColor = 'transparent';
				this.navTextColor = '#FF6600';
				this.btnBgColor = 'rgba(0,0,0,0.5)';
			} else if (opacity >= 1) {
				this.navBgColor = '#ffffff';
				this.navTextColor = '#FF6600';
				this.btnBgColor = '#3B82F6';
			} else {
				this.navBgColor = `rgba(255,255,255,${opacity})`;
				this.navTextColor = '#FF6600';
				this.btnBgColor = opacity > 0.5 ? '#3B82F6' : `rgba(0,0,0,0.5)`;
			}

			this.navTitle = opacity > 0.3 ? this.userInfo.userName || '' : '';
		},
		leftClick() {
			uni.navigateBack();
		},
		cightClick(){

		},
		greet() {
			uni.showToast({ title: '打招呼成功', icon: 'none' });
		},
		toggleFollow() {
			this.isFollowed = !this.isFollowed;
			this.userFansOpt();
		},
		handleDianzan(newsID) {
			console.log('[点赞-headshots] newsID:', newsID);
			this.$http('newsUserDianZan', JSON.stringify({
				newsID: newsID,
				token: uni.getStorageSync('token') || ''
			})).then(res => {
				console.log('[点赞-headshots] 接口返回:', res);
				if (res.code == 0) {
					uni.showToast({ title: res.msg || '操作成功', icon: 'none' });
					this.newsUserMy();
				} else {
					uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
				}
			}).catch(err => {
				console.error('点赞失败', err);
				uni.showToast({ title: '操作失败', icon: 'none' });
			});
		},
		handleViewCount(post) {
			// 浏览计数
			if (post._viewCounted) return;
			post._viewCounted = true;
			post.viewNum = (Number(post.viewNum) || 0) + 1;
			this.$http('newsViewCount', JSON.stringify({
				newsID: post.newsID,
				token: uni.getStorageSync('token') || ''
			})).then(res => {
				if (res.code == 0) {
					console.log('浏览计数成功');
				}
			}).catch(() => {
				console.log('浏览计数接口暂未实现,本地已+1');
			});
		},
		handleDiscuss(post) {
			uni.navigateTo({
				url: `/pages/index/discuss?newsID=${post.newsID}&userID=${post.userid}`
			});
		},
		handleAccost(userid) {
			// uni.navigateTo({
			// 	url: `/pages/makingFriends/malingUser?userID=${userid}`
			// });
		},
		showSharePopup(title, type) {
			this.popupTitle = title;
			this.shareData = this.shareConfig[type] || [];
			this.$refs.popup.open('bottom');
		},
		isOwnPost(item) {
			const currentUserid = uni.getStorageSync('userid');
			return item && currentUserid && String(item.userid) === String(currentUserid);
		},
		handleDeleteNews(item) {
			if (!item || !item.newsID) return;
			uni.showModal({
				title: '删除确认',
				content: '确定要删除这条动态吗？',
				success: (res) => {
					if (res.confirm) {
						this.$http('newsUserDel', JSON.stringify({
							newsID: item.newsID,
							token: uni.getStorageSync('token') || ''
						})).then(res => {
							if (res.code == 0) {
								uni.showToast({ title: '删除成功', icon: 'success' });
								this.newsUserMy();
							} else {
								uni.showToast({ title: res.msg || '删除失败', icon: 'none' });
							}
						}).catch(err => {
							console.error('删除动态失败:', err);
							uni.showToast({ title: '删除失败', icon: 'none' });
						});
					}
				}
			});
		},
		tabsCurrent(index){
			console.log("index", index);
			this.isCurrent = index
			if(index == 0){
				this.fetchUser()
			} else {
				this.fetchUser()
				this.newsUserMy()
			}
		},
		switchInfoMode(mode) {
			this.viewMode = mode;
		},
		handleShare(){
			
		}
	}
};
</script>

<style scoped lang="scss">
.page {
	height: 100vh;
	max-height: 100vh;
	overflow: hidden;
	background: #f5f5f5;
	font-family: 'PingFang SC', sans-serif;
	transform: translateZ(0);
}

/* ── 导航 ── */
.nav-bar-a {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 200;
	will-change: background-color;

	::v-deep .uni-navbar__content {
		border-bottom-width: 0 !important;
	}

	::v-deep .uni-navbar__header-btns {
		border-radius: 50%;
		width: 48px;
		height: 48px;
		transition: all 0.2s ease;
		background-color: v-bind(btnBgColor);
		will-change: all;
	}

	::v-deep .uni-navbar__header-btns:active {
		transform: scale(0.92);
	}

	::v-deep .uni-navbar__header-btns .uni-navbar-btn-icon {
		color: #FF6600 !important;
		font-size: 28px !important;
		font-weight: bold !important;
		line-height: 48px !important;
	}

	::v-deep .uni-navbar__header-btns-left {
		align-items: center;
	}
	::v-deep .uni-navbar__header-btns-right {
		align-items: center;
	}
	::v-deep .uni-navbar-btn-text {
		line-height: 23px;
		font-size: 15px !important;
	}
}

/* ── 吸顶 Tab（fixed，始终挂载，用 opacity 切换避免重排） ── */
.tabs-fixed {
	position: fixed;
	left: 0;
	right: 0;
	z-index: 100;
	background: #fff;
	display: flex;
	box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
	transition: opacity 0.15s ease;
	will-change: opacity;
}

/* ── 内嵌 Tab ── */
.tabs-inline {
	background: #fff;
	display: flex;
	margin-bottom: 2px;
}

/* ── Tab 公共样式 ── */
.tab {
	flex: 1;
	padding: 10px 0;
	text-align: center;
	position: relative;

	text {
		font-size: 15px;
		color: #999;
	}

	.tab-line {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 2.5px;
		background: #ff6b8a;
		border-radius: 2px;
	}

	&.tab-active text {
		color: #1a1a1a;
		font-weight: 600;
	}
}

/* ── 滚动区 ── */
.scroll {
	// 用精确的 px 高度，不用 100vh，避免不同平台计算差异导致抖动
	transform: translateZ(0);
}

/* ── 封面 ── */
.cover {
	position: relative;
	height: 280px;

	.cover-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.cover-mask {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100px;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent);
	}

	.avatar-box {
		position: absolute;
		bottom: 20px;
		left: 15px;
		width: 56px;
		height: 56px;
		border-radius: 8px;
		overflow: hidden;
		border: 2px solid #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

		.avatar-img {
			width: 100%;
			height: 100%;
		}
	}
}

/* ── 用户信息卡 ── */
.info-card {
	background: #fff;
	padding: 10px 15px;

	.info-row {
		margin-bottom: 8px;
	}

	.info-name {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
	}

	.info-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;

		.meta-pill {
			font-size: 12px;
			padding: 4px 12px;
			border-radius: 20px;
			font-weight: 500;
			line-height: 1.4;
		}

		.meta-loc {
			color: #0dc6e0;
			background: rgba(13, 198, 224, 0.1);
		}

		.meta-like {
			color: #ff6b8a;
			background: rgba(255, 107, 138, 0.1);
		}

		.meta-days {
			color: #FF6600;
			background: rgba(255, 102, 0, 0.1);
		}
	}
}

.gender-badge {
	display: flex;
	align-items: center;
	border-radius: 20px;
	padding: 2px 8px;
	gap: 2px;
	width: 44px;

	text {
		color: #fff;
		font-size: 11px;
		font-weight: 600;
	}
}

/* ── 内容面板 ── */
.panel {
	padding: 10px 0 15px;
}

.info-tabs {
	display: flex;
	background: #fff;
	margin-bottom: 10px;
}

.info-tab {
	flex: 1;
	padding: 10px 0;
	text-align: center;
	position: relative;

	text {
		font-size: 15px;
		color: #999;
	}

	.info-tab-line {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 2.5px;
		background: #ff6b8a;
		border-radius: 2px;
	}

	&.info-tab-active text {
		color: #1a1a1a;
		font-weight: 600;
	}
}

.section {
	background: #fff;
	padding: 18px 18px 20px;
	margin-bottom: 12px;
	border-radius: 14px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.04);

	.section-title {
		font-size: 14px;
		color: #333;
		font-weight: 600;
		margin-bottom: 14px;
		display: flex;
		align-items: center;
		gap: 6px;

		&::before {
			content: '';
			display: inline-block;
			width: 3px;
			height: 14px;
			background: linear-gradient(180deg, #FF6600, #ff9a44);
			border-radius: 2px;
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;

		.tag {
			font-size: 12px;
			color: #555;
			background: linear-gradient(135deg, #f8f9fa 0%, #eef0f2 100%);
			padding: 6px 14px;
			border-radius: 16px;
			border: 1px solid rgba(0,0,0,0.04);
			font-weight: 500;
			transition: all 0.2s;
		}

		.tag:first-child {
			background: linear-gradient(135deg, #0dc6e0 0%, #0899b0 100%);
			color: #fff;
			border-color: transparent;
		}

		.tag:nth-child(2) {
			background: linear-gradient(135deg, #ff6b8a 0%, #e94e70 100%);
			color: #fff;
			border-color: transparent;
		}

		.tag:nth-child(3) {
			background: linear-gradient(135deg, #FF6600 0%, #ff9a44 100%);
			color: #fff;
			border-color: transparent;
		}
	}

	.motto-box {
		margin-top: 14px;
		padding: 14px 16px;
		background: linear-gradient(135deg, #fff9f4 0%, #fff5ee 100%);
		border-radius: 12px;
		border-left: 3px solid #FF6600;
		display: flex;
		flex-direction: column;
		gap: 8px;

		.motto-title {
			font-size: 12px;
			color: #FF6600;
			font-weight: 600;
			letter-spacing: 1px;
		}

		.motto-content {
			font-size: 14px;
			color: #555;
			line-height: 1.7;
			font-style: italic;
		}
	}

	.xiangqin-grid {
		display: flex;
		gap: 24px;
		margin-top: 12px;
	}

	.xiangqin-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.xiangqin-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 12px;
		background: #fafafa;
		border-radius: 10px;
		border-left: 2px solid #e0e0e0;
		transition: all 0.2s;

		&:hover {
			border-left-color: #FF6600;
			background: #fff9f4;
		}
	}

	.xq-label {
		font-size: 12px;
		color: #999;
	}

	.xq-value {
		font-size: 14px;
		color: #333;
		font-weight: 600;
	}
}

/* ── 动态卡片 ── */
.post {
	background: #fff;
	padding: 15px;
	margin-bottom: 10px;

	.post-head {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.post-avatar {
		width: 42px;
		height: 42px;
		border-radius: 50%;
	}

	.post-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;

		.post-name {
			font-size: 14px;
			font-weight: 600;
			color: #1a1a1a;
		}
	}

	.post-body {
		font-size: 14px;
		color: #333;
		line-height: 1.65;
		white-space: pre-wrap;
	}

	.post-imgs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 10px;

		.post-img {
			width: calc(33.33% - 4px);
			height: 90px;
			border-radius: 6px;
		}
	}

	.action-bar {
		border-top: 1px solid #eee;
		padding-top: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10px;
	}

	.action-group {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 4px;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 3px;
		color: #666;
		font-size: 13px;

		.action-title {
			width: 40px;
		}
	}

	.more-btn {
		width: 28px;
		height: 28px;
		image {
			width: 100%;
			height: 100%;
		}
	}
}

/* ── 空状态 ── */
.empty {
	background: #fff;
	padding: 48px 20px;
	text-align: center;
	text {
		font-size: 14px;
		color: #ccc;
	}
}

/* ── 底部栏 ── */
.bottom {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 12px;
	padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1px solid #f0f0f0;
	z-index: 150;

	.btn-hello,
	.btn-follow {
		flex: 1;
		height: 46px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			font-size: 15px;
			color: #fff;
			font-weight: 600;
			letter-spacing: 0.5px;
		}
	}

	.btn-hello {
		background: #ffb800;
	}
	.btn-follow {
		background: #4a90e2;
	}
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

.section-info {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;
}

.info-item {
	display: flex;
	padding-bottom: 10px;
	border-bottom: 1px solid #f5f5f5;
	grid-column: span 1;
	
	&:nth-last-child(1):nth-child(odd) {
		// 当最后一项是奇数时，让它占满整行
		grid-column: 1 / -1;
	}
	&:last-of-type{
		border-bottom: 0;
	}
}

// 教育背景和座右铭占满整行
.info-item-full {
	grid-column: 1 / -1 !important;
}

.info-label {
	color: #666;
	font-size: 14px;
	flex-shrink: 0;
}

.info-value {
	flex: 1;
	color: #333;
	font-size: 14px;
}

.section-title1 {
	font-size: 14px;
	color: #333;
	font-weight: 600;
	margin-bottom: 14px;
	display: flex;
	align-items: center;
	gap: 8px;
	justify-content: flex-start;

	&::before {
		content: '💕';
		font-size: 16px;
	}
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 10px;
}

.display-img {
	width: calc(33.33% - 6px);
	height: 100px;
	border-radius: 6px;
}
</style>
