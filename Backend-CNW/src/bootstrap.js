import { prisma } from './lib/prisma.js'

export async function seedMarketingData() {
  const vouchers = [
    { code: 'SUMMER2024', name: 'Giảm giá mùa hè', type: 'percentage', value: 20, minOrder: 500000, maxDiscount: 100000, quantity: 100, used: 45, startDate: new Date('2024-06-01'), endDate: new Date('2024-08-31'), status: 'active' },
    { code: 'FREESHIP50K', name: 'Miễn phí vận chuyển', type: 'fixed', value: 50000, minOrder: 200000, maxDiscount: 50000, quantity: 200, used: 156, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
    { code: 'NEWUSER100K', name: 'Khách hàng mới', type: 'fixed', value: 100000, minOrder: 300000, maxDiscount: 100000, quantity: 500, used: 234, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
    { code: 'FLASH30', name: 'Flash Sale 30%', type: 'percentage', value: 30, minOrder: 1000000, maxDiscount: 300000, quantity: 50, used: 50, startDate: new Date('2024-03-01'), endDate: new Date('2024-03-15'), status: 'expired' },
    { code: 'VIP15', name: 'Ưu đãi VIP', type: 'percentage', value: 15, minOrder: 2000000, maxDiscount: 500000, quantity: 30, used: 12, startDate: new Date('2024-03-01'), endDate: new Date('2024-06-30'), status: 'active' },
    { code: 'WEEKEND200K', name: 'Cuối tuần vui vẻ', type: 'fixed', value: 200000, minOrder: 1500000, maxDiscount: 200000, quantity: 100, used: 67, startDate: new Date('2024-03-01'), endDate: new Date('2024-04-30'), status: 'active' },
  ]

  for (const voucher of vouchers) {
    await prisma.voucher.upsert({
      where: { code: voucher.code },
      update: voucher,
      create: voucher,
    })
  }

  const shippingPartners = [
    { name: 'Giao Hàng Nhanh', code: 'GHN', logo: '🚚', type: 'express', status: 'active', totalOrders: 1234, successRate: 98.5, avgDeliveryTime: 2.5, fee: 25000, contact: '1900-1234' },
    { name: 'Giao Hàng Tiết Kiệm', code: 'GHTK', logo: '📦', type: 'economy', status: 'active', totalOrders: 987, successRate: 97.2, avgDeliveryTime: 3.5, fee: 18000, contact: '1900-5678' },
    { name: 'Viettel Post', code: 'VTP', logo: '✉️', type: 'standard', status: 'active', totalOrders: 756, successRate: 96.8, avgDeliveryTime: 3, fee: 22000, contact: '1900-8888' },
    { name: 'VN Post', code: 'VNP', logo: '📮', type: 'standard', status: 'active', totalOrders: 543, successRate: 95.5, avgDeliveryTime: 4, fee: 20000, contact: '1900-5454' },
    { name: 'J&T Express', code: 'JT', logo: '🚛', type: 'express', status: 'active', totalOrders: 892, successRate: 97.8, avgDeliveryTime: 2.8, fee: 23000, contact: '1900-1088' },
    { name: 'Ninja Van', code: 'NINJA', logo: '🥷', type: 'express', status: 'inactive', totalOrders: 234, successRate: 94.2, avgDeliveryTime: 3.2, fee: 24000, contact: '1900-6886' },
  ]

  for (const partner of shippingPartners) {
    await prisma.shippingPartner.upsert({
      where: { code: partner.code },
      update: partner,
      create: partner,
    })
  }

  const disputes = [
    { disputeCode: 'DIS-001', orderCode: 'ORD-2024-001', customer: 'Nguyễn Văn A', shop: 'Shop.vn', type: 'refund', reason: 'Sản phẩm không đúng mô tả', amount: 2500000, status: 'pending', priority: 'high', createdDate: new Date('2024-03-25') },
    { disputeCode: 'DIS-002', orderCode: 'ORD-2024-015', customer: 'Trần Thị B', shop: 'Shop.vn', type: 'return', reason: 'Sản phẩm bị lỗi', amount: 3000000, status: 'investigating', priority: 'high', createdDate: new Date('2024-03-24') },
    { disputeCode: 'DIS-003', orderCode: 'ORD-2024-032', customer: 'Lê Văn C', shop: 'Shop.vn', type: 'warranty', reason: 'Yêu cầu bảo hành', amount: 1500000, status: 'resolved', priority: 'medium', createdDate: new Date('2024-03-23') },
    { disputeCode: 'DIS-004', orderCode: 'ORD-2024-048', customer: 'Phạm Thị D', shop: 'Shop.vn', type: 'complaint', reason: 'Giao hàng chậm', amount: 4500000, status: 'investigating', priority: 'medium', createdDate: new Date('2024-03-22') },
    { disputeCode: 'DIS-005', orderCode: 'ORD-2024-056', customer: 'Hoàng Văn E', shop: 'Shop.vn', type: 'refund', reason: 'Nhận sai sản phẩm', amount: 800000, status: 'resolved', priority: 'low', createdDate: new Date('2024-03-21') },
    { disputeCode: 'DIS-006', orderCode: 'ORD-2024-067', customer: 'Vũ Thị F', shop: 'Shop.vn', type: 'return', reason: 'Đổi ý không mua', amount: 5200000, status: 'rejected', priority: 'low', createdDate: new Date('2024-03-20') },
  ]

  for (const dispute of disputes) {
    await prisma.dispute.upsert({
      where: { disputeCode: dispute.disputeCode },
      update: dispute,
      create: dispute,
    })
  }
}
