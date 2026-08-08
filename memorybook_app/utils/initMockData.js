// 模拟数据初始化工具
// 调用 initMockData() 即可一次性写入演示数据
import {
	saveProduct,
	savePurchase,
	saveSale,
	getProducts,
	getPurchases,
	getSales
} from './storage.js';

function fmtDate(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

// 构造过去 N 天的日期
function daysAgo(n) {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d;
}

export function hasAnyData() {
	return getProducts().length > 0 || getPurchases().length > 0 || getSales().length > 0;
}

export function clearAllData() {
	uni.removeStorageSync('appliance_products');
	uni.removeStorageSync('appliance_sales');
	uni.removeStorageSync('appliance_purchases');
}

export function initMockData() {
	// ---------- 商品 ----------
	const p1 = saveProduct({
		name: '海尔对开门冰箱 BCD-520',
		category: '大家电/冰箱',
		sku: 'HR-BCD520-W',
		unit: '台',
		stock: 0,
		costPrice: 2800,
		salePrice: 3599,
		remark: '一级能效 风冷无霜'
	});

	const p2 = saveProduct({
		name: '美的滚筒洗衣机 10kg',
		category: '大家电/洗衣机',
		sku: 'MD-MG100V11D',
		unit: '台',
		stock: 0,
		costPrice: 1800,
		salePrice: 2399,
		remark: '变频静音 除菌洗'
	});

	const p3 = saveProduct({
		name: '格力变频空调 1.5匹挂机',
		category: '大家电/空调',
		sku: 'GL-KFR-35GW',
		unit: '台',
		stock: 0,
		costPrice: 2200,
		salePrice: 2899,
		remark: '一级能效 冷静王'
	});

	const p4 = saveProduct({
		name: '小米65寸4K电视',
		category: '大家电/电视',
		sku: 'MI-L65M7-EA',
		unit: '台',
		stock: 0,
		costPrice: 2100,
		salePrice: 2699,
		remark: '4K超高清 HDR'
	});

	const p5 = saveProduct({
		name: '九阳破壁机',
		category: '小家电/厨房',
		sku: 'JY-Y91C',
		unit: '台',
		stock: 0,
		costPrice: 420,
		salePrice: 599,
		remark: '静音多功能'
	});

	const p6 = saveProduct({
		name: '美的微波炉 23L',
		category: '小家电/厨房',
		sku: 'MD-M3-L233B',
		unit: '台',
		stock: 0,
		costPrice: 380,
		salePrice: 499,
		remark: '智能变频 光波炉'
	});

	// ---------- 进货记录（10~30天前分批进） ----------
	const purchases = [
		{ product: p1, q: 8,  cost: 2800, date: daysAgo(25), supplier: '海尔华北总代' },
		{ product: p2, q: 10, cost: 1800, date: daysAgo(23), supplier: '美的直营仓' },
		{ product: p3, q: 12, cost: 2200, date: daysAgo(20), supplier: '格力经销商' },
		{ product: p4, q: 6,  cost: 2100, date: daysAgo(18), supplier: '小米线下渠道' },
		{ product: p5, q: 15, cost: 420,  date: daysAgo(15), supplier: '九阳专卖店' },
		{ product: p6, q: 20, cost: 380,  date: daysAgo(14), supplier: '美的直营仓' },
		// 补货
		{ product: p1, q: 3,  cost: 2850, date: daysAgo(6), supplier: '海尔华北总代' },
		{ product: p3, q: 4,  cost: 2220, date: daysAgo(5), supplier: '格力经销商' },
		{ product: p5, q: 8,  cost: 430,  date: daysAgo(3), supplier: '九阳专卖店' }
	];
	purchases.forEach(r => {
		savePurchase({
			productId: r.product.id,
			productName: r.product.name,
			quantity: r.q,
			unitCost: r.cost,
			supplier: r.supplier,
			purchaseDate: fmtDate(r.date),
			remark: ''
		});
	});

	// ---------- 销售记录（0~10天前） ----------
	const sales = [
		{ product: p1, q: 1, price: 3599, date: daysAgo(10), customer: '王女士（新房装修）', phone: '13812345678', address: '北京市朝阳区建国路88号SOHO现代城A座' },
		{ product: p3, q: 2, price: 2899, date: daysAgo(9),  customer: '张先生', phone: '13611112222', address: '北京市海淀区中关村大街1号' },
		{ product: p5, q: 1, price: 599,  date: daysAgo(9),  customer: '散客', phone: '15933334444', address: '' },
		{ product: p2, q: 1, price: 2399, date: daysAgo(8),  customer: '李阿姨', phone: '13755556666', address: '北京市西城区金融街15号' },
		{ product: p4, q: 1, price: 2699, date: daysAgo(7),  customer: '赵总（员工福利）', phone: '18812340000', address: '北京市东城区东单3条' },
		{ product: p6, q: 2, price: 499,  date: daysAgo(6),  customer: '散客', phone: '', address: '' },
		{ product: p5, q: 3, price: 579,  date: daysAgo(5),  customer: '小区团购', phone: '13588887777', address: '北京市丰台区望京花园15号楼' },
		{ product: p1, q: 1, price: 3500, date: daysAgo(4),  customer: '老客户', phone: '13600001111', address: '北京市通州区万达广场B座' },
		{ product: p3, q: 1, price: 2899, date: daysAgo(3),  customer: '散客', phone: '', address: '' },
		{ product: p2, q: 1, price: 2350, date: daysAgo(2),  customer: '苏宁易购转单', phone: '13912345678', address: '天津市和平区南京路' },
		{ product: p6, q: 1, price: 499,  date: daysAgo(1),  customer: '散客', phone: '', address: '' },
		{ product: p5, q: 1, price: 599,  date: daysAgo(0),  customer: '今日到店客', phone: '13711112222', address: '北京市海淀区五道口华清嘉园' },
		{ product: p3, q: 1, price: 2899, date: daysAgo(0),  customer: '今日到店客', phone: '13899998888', address: '北京市朝阳区望京SOHO T3' }
	];
	sales.forEach(r => {
		saveSale({
			productId: r.product.id,
			productName: r.product.name,
			quantity: r.q,
			unitPrice: r.price,
			customer: r.customer,
			phone: r.phone,
			address: r.address,
			saleDate: fmtDate(r.date),
			remark: ''
		});
	});

	return {
		products: getProducts().length,
		purchases: getPurchases().length,
		sales: getSales().length
	};
}
