// 本地存储工具层
// 数据结构：
//   商品 product: { id, name, category, sku, unit, stock, costPrice, salePrice, remark, createTime }
//   销售 sale:    { id, productId, productName, quantity, unitPrice, totalAmount, customer, phone, address, saleDate, remark, createTime }
//   进货 purchase:{ id, productId, productName, quantity, unitCost, totalCost, supplier, purchaseDate, remark, createTime }

const KEY_PRODUCTS = 'appliance_products';
const KEY_SALES = 'appliance_sales';
const KEY_PURCHASES = 'appliance_purchases';

// 生成唯一 id
function genId() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 通用读取
function readList(key) {
	try {
		const data = uni.getStorageSync(key);
		return Array.isArray(data) ? data : [];
	} catch (e) {
		return [];
	}
}

// 通用写入
function writeList(key, list) {
	uni.setStorageSync(key, list);
}

// ---------------- 商品 / 库存 ----------------

export function getProducts() {
	return readList(KEY_PRODUCTS).sort((a, b) => b.createTime - a.createTime);
}

export function getProductById(id) {
	return readList(KEY_PRODUCTS).find(p => p.id === id);
}

export function saveProduct(product) {
	const list = readList(KEY_PRODUCTS);
	if (product.id) {
		const idx = list.findIndex(p => p.id === product.id);
		if (idx > -1) list[idx] = { ...list[idx], ...product };
	} else {
		product.id = genId();
		product.createTime = Date.now();
		product.stock = Number(product.stock) || 0;
		list.push(product);
	}
	writeList(KEY_PRODUCTS, list);
	return product;
}

export function deleteProduct(id) {
	const list = readList(KEY_PRODUCTS).filter(p => p.id !== id);
	writeList(KEY_PRODUCTS, list);
}

// 直接调整库存（内部使用）
function adjustStock(productId, delta) {
	const list = readList(KEY_PRODUCTS);
	const p = list.find(x => x.id === productId);
	if (p) {
		p.stock = (Number(p.stock) || 0) + delta;
		writeList(KEY_PRODUCTS, list);
	}
}

// ---------------- 销售记录 ----------------

export function getSales() {
	return readList(KEY_SALES).sort((a, b) => b.createTime - a.createTime);
}

export function saveSale(sale) {
	const list = readList(KEY_SALES);
	sale.quantity = Number(sale.quantity) || 0;
	sale.unitPrice = Number(sale.unitPrice) || 0;
	sale.totalAmount = Number((sale.quantity * sale.unitPrice).toFixed(2));

	if (sale.id) {
		// 编辑：先回滚旧库存，再扣减新库存
		const idx = list.findIndex(s => s.id === sale.id);
		if (idx > -1) {
			const old = list[idx];
			if (old.productId) adjustStock(old.productId, old.quantity);
			if (sale.productId) adjustStock(sale.productId, -sale.quantity);
			list[idx] = { ...old, ...sale };
		}
	} else {
		sale.id = genId();
		sale.createTime = Date.now();
		if (sale.productId) adjustStock(sale.productId, -sale.quantity);
		list.push(sale);
	}
	writeList(KEY_SALES, list);
	return sale;
}

export function deleteSale(id) {
	const list = readList(KEY_SALES);
	const item = list.find(s => s.id === id);
	if (item && item.productId) {
		// 删除时回补库存
		adjustStock(item.productId, item.quantity);
	}
	writeList(KEY_SALES, list.filter(s => s.id !== id));
}

// ---------------- 进货记录 ----------------

export function getPurchases() {
	return readList(KEY_PURCHASES).sort((a, b) => b.createTime - a.createTime);
}

export function savePurchase(purchase) {
	const list = readList(KEY_PURCHASES);
	purchase.quantity = Number(purchase.quantity) || 0;
	purchase.unitCost = Number(purchase.unitCost) || 0;
	purchase.totalCost = Number((purchase.quantity * purchase.unitCost).toFixed(2));

	if (purchase.id) {
		const idx = list.findIndex(p => p.id === purchase.id);
		if (idx > -1) {
			const old = list[idx];
			if (old.productId) adjustStock(old.productId, -old.quantity);
			if (purchase.productId) adjustStock(purchase.productId, purchase.quantity);
			list[idx] = { ...old, ...purchase };
		}
	} else {
		purchase.id = genId();
		purchase.createTime = Date.now();
		if (purchase.productId) adjustStock(purchase.productId, purchase.quantity);
		list.push(purchase);
	}
	writeList(KEY_PURCHASES, list);
	return purchase;
}

export function deletePurchase(id) {
	const list = readList(KEY_PURCHASES);
	const item = list.find(p => p.id === id);
	if (item && item.productId) {
		adjustStock(item.productId, -item.quantity);
	}
	writeList(KEY_PURCHASES, list.filter(p => p.id !== id));
}

// ---------------- 统计汇总 ----------------

// 格式化金额
export function formatMoney(n) {
	n = Number(n) || 0;
	return n.toFixed(2);
}

// 今日销售额
export function getTodaySalesAmount() {
	const today = new Date();
	const y = today.getFullYear();
	const m = String(today.getMonth() + 1).padStart(2, '0');
	const d = String(today.getDate()).padStart(2, '0');
	const todayStr = `${y}-${m}-${d}`;
	return getSales()
		.filter(s => s.saleDate === todayStr)
		.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
}

// 总销售额
export function getTotalSalesAmount() {
	return getSales().reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
}

// 总进货成本
export function getTotalPurchaseCost() {
	return getPurchases().reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
}

// 总利润 = 总销售额 - 已售商品成本
export function getTotalProfit() {
	let cost = 0;
	getSales().forEach(s => {
		const p = getProductById(s.productId);
		if (p) cost += (Number(p.costPrice) || 0) * (Number(s.quantity) || 0);
	});
	return getTotalSalesAmount() - cost;
}

// 库存总值（按成本价）
export function getStockValue() {
	return getProducts().reduce((sum, p) => sum + (Number(p.costPrice) || 0) * (Number(p.stock) || 0), 0);
}

// 库存种类数
export function getStockKinds() {
	return getProducts().length;
}

// 今日日期字符串
export function todayStr() {
	const t = new Date();
	const y = t.getFullYear();
	const m = String(t.getMonth() + 1).padStart(2, '0');
	const d = String(t.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}
