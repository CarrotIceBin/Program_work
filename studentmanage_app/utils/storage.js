const STORAGE_KEY = 'student_list'
const STORAGE_VERSION = 'v11'

const defaultStudents = [
	// 第1行 (离讲台最远，显示在最上面)
	{ id: '1', name: '张生杰', gender: 'male', row: 1, col: 1, info: '', isClassCadre: false },
	{ id: '2', name: '陈俊熙', gender: 'male', row: 1, col: 2, info: '', isClassCadre: false },
	// col 3 空
	{ id: '3', name: '熊晚晴', gender: 'female', row: 1, col: 4, info: '', isClassCadre: false },
	{ id: '4', name: '童梦佳', gender: 'female', row: 1, col: 5, info: '', isClassCadre: false },
	{ id: '5', name: '易晓雅', gender: 'female', row: 1, col: 6, info: '', isClassCadre: false },
	// col 7 空
	{ id: '6', name: '秦子康', gender: 'male', row: 1, col: 8, info: '', isClassCadre: false },
	{ id: '7', name: '童博涵', gender: 'female', row: 1, col: 9, info: '', isClassCadre: false },
	{ id: '8', name: '孙茂', gender: 'male', row: 1, col: 10, info: '', isClassCadre: false },

	// 第2行
	{ id: '9', name: '徐润东', gender: 'male', row: 2, col: 1, info: '', isClassCadre: false },
	{ id: '10', name: '程裕权', gender: 'male', row: 2, col: 2, info: '', isClassCadre: false },
	{ id: '11', name: '张壹', gender: 'male', row: 2, col: 3, info: '', isClassCadre: false },
	{ id: '12', name: '童均昊', gender: 'male', row: 2, col: 4, info: '', isClassCadre: false },
	{ id: '13', name: '倪致远', gender: 'male', row: 2, col: 5, info: '', isClassCadre: false },
	{ id: '14', name: '张腾跃', gender: 'male', row: 2, col: 6, info: '', isClassCadre: false },
	{ id: '15', name: '韦羽', gender: 'male', row: 2, col: 7, info: '', isClassCadre: false },
	{ id: '16', name: '朱浩宇', gender: 'male', row: 2, col: 8, info: '', isClassCadre: false },
	{ id: '17', name: '龚宇涛', gender: 'male', row: 2, col: 9, info: '', isClassCadre: false },
	{ id: '18', name: '张博浩', gender: 'male', row: 2, col: 10, info: '', isClassCadre: false },

	// 第3行
	{ id: '19', name: '王懿宸', gender: 'male', row: 3, col: 1, info: '', isClassCadre: false },
	{ id: '20', name: '周永康', gender: 'male', row: 3, col: 2, info: '', isClassCadre: false },
	{ id: '21', name: '章晧哲', gender: 'male', row: 3, col: 3, info: '', isClassCadre: false },
	{ id: '22', name: '王梦琪', gender: 'female', row: 3, col: 4, info: '', isClassCadre: false },
	{ id: '23', name: '张之涵', gender: 'female', row: 3, col: 5, info: '', isClassCadre: false },
	{ id: '24', name: '邵晨曦', gender: 'female', row: 3, col: 6, info: '', isClassCadre: false },
	{ id: '25', name: '邵嘉妮', gender: 'female', row: 3, col: 7, info: '', isClassCadre: false },
	{ id: '26', name: '戴语馨', gender: 'female', row: 3, col: 8, info: '', isClassCadre: false },
	{ id: '27', name: '方梦琪', gender: 'female', row: 3, col: 9, info: '', isClassCadre: false },
	{ id: '28', name: '徐馨怡', gender: 'female', row: 3, col: 10, info: '', isClassCadre: false },

	// 第4行
	{ id: '29', name: '童瑞', gender: 'male', row: 4, col: 1, info: '', isClassCadre: false },
	{ id: '30', name: '何佳瑞', gender: 'female', row: 4, col: 2, info: '', isClassCadre: false },
	{ id: '31', name: '周少怡', gender: 'female', row: 4, col: 3, info: '', isClassCadre: false },
	{ id: '32', name: '肖瑾萱', gender: 'female', row: 4, col: 4, info: '', isClassCadre: false },
	{ id: '33', name: '程梦琦', gender: 'female', row: 4, col: 5, info: '', isClassCadre: false },
	{ id: '34', name: '尹雯诗', gender: 'female', row: 4, col: 6, info: '', isClassCadre: false },
	{ id: '35', name: '陈思镁', gender: 'female', row: 4, col: 7, info: '', isClassCadre: false },
	{ id: '36', name: '郑欣怡', gender: 'female', row: 4, col: 8, info: '', isClassCadre: false },
	{ id: '37', name: '童佳淇', gender: 'female', row: 4, col: 9, info: '', isClassCadre: false },
	{ id: '38', name: '童沛晴', gender: 'female', row: 4, col: 10, info: '', isClassCadre: false },

	// 第5行
	{ id: '39', name: '丰瑾', gender: 'female', row: 5, col: 1, info: '', isClassCadre: false },
	{ id: '40', name: '舒泗桢', gender: 'male', row: 5, col: 2, info: '', isClassCadre: false },
	{ id: '41', name: '熊佳', gender: 'female', row: 5, col: 3, info: '', isClassCadre: false },
	{ id: '42', name: '向梦帆', gender: 'female', row: 5, col: 4, info: '', isClassCadre: false },
	{ id: '43', name: '王浩晨', gender: 'male', row: 5, col: 5, info: '', isClassCadre: false },
	{ id: '44', name: '刘佳乐', gender: 'male', row: 5, col: 6, info: '', isClassCadre: false },
	{ id: '45', name: '姚文昊', gender: 'male', row: 5, col: 7, info: '', isClassCadre: false },
	{ id: '46', name: '吴逸宸', gender: 'male', row: 5, col: 8, info: '', isClassCadre: false },
	{ id: '47', name: '向子聪', gender: 'male', row: 5, col: 9, info: '', isClassCadre: false },
	{ id: '48', name: '张扬', gender: 'male', row: 5, col: 10, info: '', isClassCadre: false },

	// 第6行 (靠近讲台，显示在最下面)
	{ id: '49', name: '童懿萱', gender: 'female', row: 6, col: 1, info: '', isClassCadre: false },
	{ id: '50', name: '杨雨彤', gender: 'female', row: 6, col: 2, info: '', isClassCadre: false },
	{ id: '51', name: '王彤彤', gender: 'female', row: 6, col: 3, info: '', isClassCadre: false },
	{ id: '52', name: '王佳', gender: 'female', row: 6, col: 4, info: '', isClassCadre: false },
	{ id: '53', name: '郑锦程', gender: 'male', row: 6, col: 5, info: '', isClassCadre: false },
	{ id: '54', name: '马雪妍', gender: 'female', row: 6, col: 6, info: '', isClassCadre: false },
	{ id: '55', name: '王佳瑶', gender: 'female', row: 6, col: 7, info: '', isClassCadre: false },
	{ id: '56', name: '朱依璇', gender: 'female', row: 6, col: 8, info: '', isClassCadre: false },
	{ id: '57', name: '詹雨涵', gender: 'female', row: 6, col: 9, info: '', isClassCadre: false },
	{ id: '58', name: '张瑜芯', gender: 'female', row: 6, col: 10, info: '', isClassCadre: false }
]

function isDataValid(list) {
	if (!list || !Array.isArray(list) || list.length === 0) return false
	const item = list[0]
	return item && typeof item.row === 'number' && typeof item.col === 'number'
}

export function getStudentList() {
	const version = uni.getStorageSync(STORAGE_KEY + '_version')
	if (version !== STORAGE_VERSION) {
		uni.removeStorageSync(STORAGE_KEY)
	}
	let list = uni.getStorageSync(STORAGE_KEY)
	if (!isDataValid(list)) {
		list = JSON.parse(JSON.stringify(defaultStudents))
		uni.setStorageSync(STORAGE_KEY, list)
		uni.setStorageSync(STORAGE_KEY + '_version', STORAGE_VERSION)
	}
	return list
}

export function getStudentById(id) {
	const list = getStudentList()
	return list.find(s => s.id === id)
}

export function saveStudent(student) {
	const list = getStudentList()
	const idx = list.findIndex(s => s.id === student.id)
	if (idx >= 0) {
		list[idx] = { ...list[idx], ...student }
	} else {
		student.id = Date.now().toString()
		if (!student.gender) student.gender = 'male'
		if (student.isClassCadre === undefined) student.isClassCadre = false
		list.push(student)
	}
	uni.setStorageSync(STORAGE_KEY, list)
	return student
}

export function deleteStudent(id) {
	let list = getStudentList()
	list = list.filter(s => s.id !== id)
	uni.setStorageSync(STORAGE_KEY, list)
}

export function saveStudentList(list) {
	uni.setStorageSync(STORAGE_KEY, list)
}

export function resetStudents() {
	const list = JSON.parse(JSON.stringify(defaultStudents))
	uni.setStorageSync(STORAGE_KEY, list)
	uni.setStorageSync(STORAGE_KEY + '_version', STORAGE_VERSION)
	return list
}

export function isSeatTaken(row, col, excludeId) {
	const list = getStudentList()
	return list.some(s => s.row === row && s.col === col && s.id !== excludeId)
}