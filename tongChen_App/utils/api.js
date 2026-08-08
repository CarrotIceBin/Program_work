export const baseUrl = 'http://47.106.118.22:8081/'
export const qiniuUrl = 'http://zddimages.abillchen.top/'

//默认post请求				
const request = (url = '', date = {}, type = 'POST', header = {
}) => {
    return new Promise((resolve, reject) => {
        uni.request({
            method: type,
            url: baseUrl + url,
            data: date,
            header: {
				'content-type': 'application/json' ,// 默认值
				'rangeID':'1',
				'projectName':'beizen'
			},
            dataType: 'json',         
        }).then((response) => {
            let [error, res] = response; 
			const resData = res.data
			if(resData.code == 99){
				uni.removeStorageSync('token');
				uni.removeStorageSync('userid');
				uni.reLaunch({
					url:"/pages/public/loginPwd"
				})
				return resolve(resData)
			} else {
				resolve(resData);
			}
        }).catch(error => {
            let [err, res] = error;
            reject(err.data)
        })
    });
}

export default request