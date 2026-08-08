<template>
    <view class="select-picker-box">
        <view class="select-picker select-picker-border" :class="isDisabled" @click="showMaskClick">
            <view class="placeholder" :class="{'default' : selectValue!='','placeholder-center':poText == 'center'}">{{ selectText }}</view>
            <!-- 保留这个箭头的css -->
            <view class="select-picker-arrow-area" v-if="!hideArrow">
                <view class="select-picker-arrow"></view>
            </view>
        </view>
        <view :class="{ pickerMask: visable }">
            <view class="picker-box" :class="{ 'picker-show': visable }">
                <view class="operate-box">
                    <view class="cel" @click="maskClick">取消</view>
                    <view class="sumb" @click="pickerConfirm">确定</view>
                </view>
                <picker-view :value="pickerValue" @change="pickerChange" class="picker-view" :indicator-style="indicatorStyle">
                    <picker-view-column>
						<view class="picker-item" v-for="(item, index) in dataList" :key="index">
							<text v-if="unusualModule">{{ item.menDianFlmc }}</text>
							<text v-else>{{ item.name }}</text>
						</view>
					</picker-view-column>
                </picker-view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "hi-picker",
    emits: ['click', 'update:modelValue', 'input', 'change'],
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    props: {
        // 默认标题
        title: {
            type: String,
            default: '请选择'
        },
        // 下拉选择的数据
        dataList: {
            type: Array,
            default: function () {
                return []
            }
        },
		unusualModule: {
			type: Boolean,
			default: false
		},
        // TODO vue3
        modelValue: {
            type: [String, Number],
            default () {
                return '';
            }
        },
        // 是否禁用
        disabled: {
            type: [Boolean, String],
            default: false
        },
        // 是否隐藏边框
        hideBorder: {
            type: [Boolean, String],
            default: false
        },
        // 是否隐藏箭头
        hideArrow: {
            type: [Boolean, String],
            default: false
        },
        // 文字的位置
        poText: {
            type: String,
            default: ''
        },
		isPrCiArea: {
			type: String,
			default: ''
		},
		valuePicker: {
			type: [String, Number],
			default: ''
		}
    },
    data () {
        return {
            selectValue: '',
            visable: false,
            indicatorStyle: 'height: 100rpx;',
            pickerValue: [],
            valueIndex: 0
        };
    },
    created () {
        this.initSelected(this.modelValue)
    },
    computed: {
        // 选择框的文字
        selectText () {
            if (this.selectValue === '') {
                return this.title;
            }
            return this.selectValue
        },
        isDisabled () {
            if (this.disabled) {
                return 'disabled-box'
            }
        }
    },
    methods: {
        // 取消蒙层
        maskClick () {
            this.visable = false
        },
        // 打开蒙层
        showMaskClick () {
            if (this.disabled) {
                return
            }
            this.visable = true
        },
        // 点击确定
        pickerConfirm () {
			let inputVal
			if(this.unusualModule){
				inputVal = this.dataList[this.valueIndex].menDianFlid
				this.selectValue = this.dataList[this.valueIndex].menDianFlmc
			}else{
				inputVal = this.dataList[this.valueIndex].code
				this.selectValue = this.dataList[this.valueIndex].name
			}
            // // TOTO 兼容 vue3
            this.$emit('update:modelValue', inputVal, this.isPrCiArea, this.selectValue);
            this.maskClick()
        },
        // 滚动的时候触发的事件
        pickerChange (val) {
            this.valueIndex = val.detail.value[0]
        },
        // 初始化选中值
        initSelected (value) {
            if (!value) {
                this.selectValue = '';
                return false;
            }
            if (this.dataList.length > 0) {
                this.dataList.some((item, index) => {
                    if (item.value == value) {
                        this.valueIndex = index;
                        this.selectValue = this.dataList[this.valueIndex].label
                        return true;
                    }
                });
            }
        }
    },
	watch: {
	    valuePicker: {
	      immediate: true,
	      handler (newValue) {
	        if (newValue) {
	          this.selectValue = newValue;
	          // 根据文本值找到对应的索引，设置 pickerValue
	          if (this.dataList && this.dataList.length > 0) {
	            const index = this.dataList.findIndex(item => {
	              if (this.unusualModule) {
	                return item.menDianFlmc === newValue;
	              } else {
	                return item.name === newValue;
	              }
	            });
	            if (index !== -1) {
	              this.valueIndex = index;
	              this.pickerValue = [index];
	            }
	          }
	        } else {
	          this.selectValue = '';
	          this.valueIndex = 0;
	          this.pickerValue = [0];
	        }
	      }
	    },
	    dataList: {
	      immediate: true,
	      handler (newList) {
	        // 当数据列表更新时，如果 valuePicker 有值，重新查找索引
	        if (newList && newList.length > 0 && this.valuePicker) {
	          const index = newList.findIndex(item => {
	            if (this.unusualModule) {
	              return item.menDianFlmc === this.valuePicker;
	            } else {
	              return item.name === this.valuePicker;
	            }
	          });
	          if (index !== -1) {
	            this.valueIndex = index;
	            this.pickerValue = [index];
	          }
	        }
	      }
	    }
	}
}
</script>

<style lang="scss" scoped>
// 选择器相关
.pickerMask {
    position: fixed;
    z-index: 1002;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
}
.picker-box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    transition: all 0.3s ease;
    transform: translateY(100%);
    z-index: 1002;
    .operate-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18rpx 30rpx;
        background-color: #ffffff;
        text-align: center;
        font-size: 30rpx;
        border-bottom: 2rpx solid #e5e5e5;
        .sumb {
            color: rgba(36, 178, 118, 0.86);
        }
    }
}
.picker-show {
    transform: translateY(0);
}
.picker-view {
    width: 750rpx;
    height: 600rpx;
    background-color: #ffffff;
    .picker-item {
        height: 100rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
}
// 选择框相关
.select-picker {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    font-size: 1em;
    line-height: 38px;
    // padding-left: 20px;
    overflow: hidden;
    /* #ifdef APP-NVUE */
    height: 40px;
    /* #endif */
}
.select-picker-border {
    // border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);;
    // border-radius: 5px;
}
.is-input-error-border .select-picker-border {
    border-color: $uni-color-error;
}
.i-n {
    position: relative;
    width: 20px; /* #ifndef APP-NVUE */
    margin-left: auto;
    display: flex; /* #endif */
    justify-content: center;
    i {
        color: #d2d2d6;
        font-size: 8px;
    }
}
/* 可以变成箭头css 很厉害保留 */
.select-picker-arrow-area {
    position: relative;
    width: 20px; /* #ifndef APP-NVUE */
    margin-left: auto;
    display: flex; /* #endif */
    justify-content: center;
    transform: rotate(-45deg);
    transform-origin: center;
}
.select-picker-arrow {
    width: 7px;
    height: 7px;
    border-left: 1px solid #000;
    border-bottom: 1px solid #000;
}
.placeholder-center{
    width: 100%;
    text-align: right;
	color: #303133;
}
.placeholder{
	// color: grey;
    // text-indent: 0px;
}
.default {
	color: #303133;
}
.disabled-box {
    background: #f3f3f3;
}
</style>
