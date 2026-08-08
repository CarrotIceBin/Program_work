// 数据导入导出工具
// 使用 CSV 格式(Excel/WPS 可直接打开),无需第三方库
// 跨平台:H5 / APP-PLUS / MP-WEIXIN 全支持

import {
	getProducts, getSales, getPurchases,
	saveProduct, saveSale, savePurchase
} from './storage.js';

// 字段定义
const PRODUCT_FIELDS = [
	['商品名称', 'name'], ['分类', 'category'], ['编码', 'sku'],
	['单位', 'unit'], ['库存', 'stock'], ['进货价', 'costPrice'],
	['销售价', 'salePrice'], ['备注', 'remark']
];
const SALE_FIELDS = [
	['商品名称', 'productName'], ['数量', 'quantity'], ['单价', 'unitPrice'],
	['总额', 'totalAmount'], ['客户', 'customer'], ['手机号', 'phone'],
	['地址', 'address'], ['销售日期', 'saleDate'], ['备注', 'remark']
];
const PURCHASE_FIELDS = [
	['商品名称', 'productName'], ['数量', 'quantity'], ['单价', 'unitCost'],
	['总额', 'totalCost'], ['供应商', 'supplier'], ['进货日期', 'purchaseDate'],
	['备注', 'remark']
];

// ========== CSV 工具 ==========

function csvEscape(val) {
	if (val === null || val === undefined) return '';
	const s = String(val);
	if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
		return '"' + s.replace(/"/g, '""') + '"';
	}
	return s;
}

function buildCSV(headers, rows) {
	const headLine = headers.map(([label]) => csvEscape(label)).join(',');
	const dataLines = rows.map(row =>
		headers.map(([, field]) => csvEscape(row[field] || '')).join(',')
	);
	return '\uFEFF' + [headLine, ...dataLines].join('\r\n');
}

function parseCSV(text) {
	if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
	const rows = [];
	let cur = [], field = '', inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
			else if (ch === '"') { inQuotes = false; }
			else { field += ch; }
		} else {
			if (ch === '"') { inQuotes = true; }
			else if (ch === ',') { cur.push(field); field = ''; }
			else if (ch === '\r' && text[i + 1] === '\n') { cur.push(field); field = ''; rows.push(cur); cur = []; i++; }
			else if (ch === '\n' || ch === '\r') { cur.push(field); field = ''; rows.push(cur); cur = []; }
			else { field += ch; }
		}
	}
	if (field || cur.length) { cur.push(field); rows.push(cur); }
	return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function rowsToObjects(rows, fieldDefs) {
	if (rows.length < 2) return [];
	const header = rows[0];
	return rows.slice(1).map(row => {
		const obj = {};
		fieldDefs.forEach(([label, field]) => {
			const idx = header.findIndex(h => h.trim() === label);
			obj[field] = idx >= 0 ? (row[idx] || '').trim() : '';
		});
		return obj;
	}).filter(obj => Object.values(obj).some(v => v !== ''));
}

// ========== 数据生成 ==========

function generateCSVSet() {
	return {
		productsCSV: buildCSV(PRODUCT_FIELDS, getProducts()),
		salesCSV: buildCSV(SALE_FIELDS, getSales()),
		purchasesCSV: buildCSV(PURCHASE_FIELDS, getPurchases())
	};
}

// ========== 导出 ==========

/**
 * 导出所有数据
 */
export function exportData() {
	const { productsCSV, salesCSV, purchasesCSV } = generateCSVSet();
	const ts = new Date().toISOString().slice(0, 10);
	const prefix = `家电记账_${ts}`;

	const files = [
		{ content: productsCSV, name: `${prefix}_商品.csv` },
		{ content: salesCSV, name: `${prefix}_销售.csv` },
		{ content: purchasesCSV, name: `${prefix}_进货.csv` }
	];

	// #ifdef H5
	h5Export(files);
	return;
	// #endif

	// #ifdef APP-PLUS
	appExport(files);
	return;
	// #endif

	// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
	mpExport(files);
	return;
	// #endif

	// #ifndef H5 || APP-PLUS || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
	uni.showToast({ title: '当前平台暂不支持导出', icon: 'none' });
	// #endif
}

// H5 导出
function h5Export(files) {
	files.forEach((f, i) => {
		setTimeout(() => {
			const blob = new Blob([f.content], { type: 'text/csv;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = f.name;
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}, i * 200);
	});
	uni.showToast({ title: '已导出 3 个文件', icon: 'success' });
}

// App 导出
function appExport(files) {
	// #ifdef APP-PLUS
	const fsEntry = plus.io.convertLocalFileSystemURL('_doc/');
	Promise.all(files.map(f => new Promise((resolve, reject) => {
		const fullPath = fsEntry + f.name;
		plus.io.resolveLocalFileSystemURL(fsEntry, (dirEntry) => {
			dirEntry.getFile(f.name, { create: true }, (fileEntry) => {
				fileEntry.createWriter((writer) => {
					writer.onwrite = () => resolve(fullPath);
					writer.onerror = () => reject(new Error('写入失败'));
					const blob = new Blob([f.content], { type: 'text/csv;charset=utf-8' });
					writer.write(blob);
				});
			}, reject);
		}, reject);
	}))).then(paths => {
		uni.showModal({
			title: '导出成功',
			content: `已导出 ${paths.length} 个文件至 _doc 目录`,
			showCancel: false
		});
	}).catch(() => {
		uni.showToast({ title: '保存失败', icon: 'none' });
	});
	// #endif
}

// 小程序导出（微信/支付宝/百度/头条）
function mpExport(files) {
	// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
	const fs = uni.getFileSystemManager();
	const savedPaths = [];
	files.forEach((f) => {
		// CSV 内容转 ArrayBuffer
		const buffer = new ArrayBuffer(f.content.length);
		const view = new Uint8Array(buffer);
		for (let j = 0; j < f.content.length; j++) {
			view[j] = f.content.charCodeAt(j);
		}
		let filePath = '';
		// #ifdef MP-WEIXIN
		filePath = `${wx.env.USER_DATA_PATH}/${f.name}`;
		// #endif
		// #ifndef MP-WEIXIN
		filePath = `${uni.env.USER_DATA_PATH}/${f.name}`;
		// #endif
		try {
			fs.writeFileSync(filePath, buffer, 'binary');
			savedPaths.push(filePath);
		} catch (e) {
			console.error('写入失败', f.name, e);
		}
	});

	if (!savedPaths.length) {
		uni.showToast({ title: '导出失败', icon: 'none' });
		return;
	}

	if (savedPaths.length === 1) {
		uni.showModal({
			title: '导出成功',
			content: `已保存至:${savedPaths[0]}`,
			showCancel: false
		});
	} else {
		uni.showModal({
			title: '导出成功',
			content: `已导出 ${savedPaths.length} 个文件`,
			showCancel: false,
			success: () => {
				uni.openDocument({
					filePath: savedPaths[0],
					fileType: 'csv',
					showMenu: true,
					fail: () => {
						uni.showToast({ title: '文件已保存', icon: 'success' });
					}
				});
			}
		});
	}
	// #endif
}

// ========== 导入 ==========

/**
 * 从 CSV 文件导入数据
 */
export function importData() {
	// #ifdef H5
	h5Import();
	return;
	// #endif

	// #ifdef APP-PLUS
	appImport();
	return;
	// #endif

	// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
	mpImport();
	return;
	// #endif

	// #ifndef H5 || APP-PLUS || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
	uni.showToast({ title: '当前平台暂不支持导入', icon: 'none' });
	// #endif
}

// H5 导入
function h5Import() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.csv';
	input.multiple = true;
	input.onchange = (e) => {
		const files = Array.from(e.target.files);
		if (!files.length) return;
		const readers = files.map(file => new Promise((resolve) => {
			const r = new FileReader();
			r.onload = (ev) => resolve({ name: file.name, text: ev.target.result });
			r.readAsText(file, 'UTF-8');
		}));
		Promise.all(readers).then(results => {
			let total = 0;
			results.forEach(r => { total += importOneFile(r.text, r.name); });
			uni.showModal({
				title: '导入完成',
				content: `共导入 ${total} 条数据`,
				showCancel: false
			});
		});
	};
	input.click();
}

// App 导入
function appImport() {
	// #ifdef APP-PLUS
	plus.io.resolveLocalFileSystemURL('_doc/', (dirEntry) => {
		dirEntry.createReader().readEntries((entries) => {
			const csvFiles = entries
				.filter(e => e.name.endsWith('.csv'))
				.sort((a, b) => b.name.localeCompare(a.name));
			if (!csvFiles.length) {
				uni.showModal({
					title: '无文件',
					content: '_doc 目录下没有 CSV 文件，请先导出',
					showCancel: false
				});
				return;
			}
			const names = csvFiles.map(f => f.name);
			uni.showActionSheet({
				itemList: names,
				success: (res) => {
					const fileEntry = csvFiles[res.tapIndex];
					fileEntry.file((file) => {
						const reader = new plus.io.FileReader();
						reader.onloadend = (e) => {
							const total = importOneFile(e.target.result, fileEntry.name);
							uni.showModal({
								title: '导入完成',
								content: `共导入 ${total} 条数据`,
								showCancel: false
							});
						};
						reader.readAsText(file, 'UTF-8');
					});
				}
			});
		});
	});
	// #endif
}

// 小程序导入
function mpImport() {
	// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
	uni.chooseMessageFile({
		count: 10,
		type: 'file',
		extension: ['csv'],
		success: (res) => {
			const files = res.tempFiles;
			if (!files.length) return;
			let processed = 0;
			let total = 0;
			const finish = () => {
				processed++;
				if (processed >= files.length) {
					uni.showModal({
						title: '导入完成',
						content: `共导入 ${total} 条数据`,
						showCancel: false
					});
				}
			};
			files.forEach((f) => {
				// 优先用 utf-8 编码直接读取
				uni.getFileSystemManager().readFile({
					filePath: f.path,
					encoding: 'utf-8',
					success: (res2) => {
						total += importOneFile(res2.data, f.name);
						finish();
					},
					fail: () => {
						// 降级：二进制读取后手动解码
						uni.getFileSystemManager().readFile({
							filePath: f.path,
							success: (res3) => {
								const text = decodeUTF8(res3.data);
								total += importOneFile(text, f.name);
								finish();
							},
							fail: () => {
								uni.showToast({ title: `${f.name} 读取失败`, icon: 'none' });
								finish();
							}
						});
					}
				});
			});
		},
		fail: () => {
			uni.showToast({ title: '选择文件取消', icon: 'none' });
		}
	});
	// #endif
}

// 简单 UTF-8 解码（ArrayBuffer -> String）
function decodeUTF8(buffer) {
	const bytes = new Uint8Array(buffer);
	let result = '';
	let i = 0;
	while (i < bytes.length) {
		const b1 = bytes[i++];
		if (b1 < 0x80) {
			result += String.fromCharCode(b1);
		} else if (b1 < 0xE0) {
			const b2 = bytes[i++];
			result += String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
		} else if (b1 < 0xF0) {
			const b2 = bytes[i++], b3 = bytes[i++];
			result += String.fromCharCode(((b1 & 0x0F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F));
		} else {
			const b2 = bytes[i++], b3 = bytes[i++], b4 = bytes[i++];
			const cp = ((b1 & 0x07) << 18) | ((b2 & 0x3F) << 12) | ((b3 & 0x3F) << 6) | (b4 & 0x3F);
			if (cp > 0xFFFF) {
				result += String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10), 0xDC00 + ((cp - 0x10000) & 0x3FF));
			} else {
				result += String.fromCharCode(cp);
			}
		}
	}
	return result;
}

// ========== 核心：单文件导入 ==========

function importOneFile(text, filename) {
	try {
		const rows = parseCSV(text);
		if (rows.length < 2) {
			uni.showToast({ title: `${filename} 为空`, icon: 'none' });
			return 0;
		}
		const header = rows[0].map(h => h.trim());

		if (header.includes('商品名称') && header.includes('库存')) {
			const list = rowsToObjects(rows, PRODUCT_FIELDS);
			list.forEach(p => saveProduct({
				name: p.name, category: p.category, sku: p.sku,
				unit: p.unit || '件', stock: Number(p.stock) || 0,
				costPrice: Number(p.costPrice) || 0, salePrice: Number(p.salePrice) || 0,
				remark: p.remark
			}));
			return list.length;
		}
		if (header.includes('销售日期') && header.includes('客户')) {
			const list = rowsToObjects(rows, SALE_FIELDS);
			list.forEach(s => saveSale({
				productId: '', productName: s.productName,
				quantity: Number(s.quantity) || 0, unitPrice: Number(s.unitPrice) || 0,
				customer: s.customer, phone: s.phone, address: s.address,
				saleDate: s.saleDate, remark: s.remark
			}));
			return list.length;
		}
		if (header.includes('进货日期') && header.includes('供应商')) {
			const list = rowsToObjects(rows, PURCHASE_FIELDS);
			list.forEach(p => savePurchase({
				productId: '', productName: p.productName,
				quantity: Number(p.quantity) || 0, unitCost: Number(p.unitCost) || 0,
				supplier: p.supplier, purchaseDate: p.purchaseDate, remark: p.remark
			}));
			return list.length;
		}
		uni.showToast({ title: `${filename} 格式不识别`, icon: 'none' });
		return 0;
	} catch (e) {
		console.error('导入解析失败', e);
		uni.showToast({ title: `${filename} 解析失败`, icon: 'none' });
		return 0;
	}
}
