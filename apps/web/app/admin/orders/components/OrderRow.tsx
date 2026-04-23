'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { ADMIN_PRICE_CURRENCY, amountToUsd, formatPriceInCurrency } from '../../../../lib/currency';
import { getStatusColor, getPaymentStatusColor, getColorValue } from '../utils/orderUtils';
import type { Order } from '../useOrders';

interface OrderRowProps {
  order: Order;
  selected: boolean;
  updatingStatus: boolean;
  updatingPaymentStatus: boolean;
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onStatusChange: (newStatus: string) => void;
  onPaymentStatusChange: (newPaymentStatus: string) => void;
}

export function OrderRow({
  order,
  selected,
  updatingStatus,
  updatingPaymentStatus,
  onToggleSelect,
  onViewDetails,
  onStatusChange,
  onPaymentStatusChange,
}: OrderRowProps) {
  const { t } = useTranslation();

  const calculateTotalWithoutShipping = () => {
    if (order.subtotal !== undefined && order.discountAmount !== undefined && order.taxAmount !== undefined) {
      const subtotalUsd = amountToUsd(order.subtotal, order.currency);
      const discountUsd = amountToUsd(order.discountAmount, order.currency);
      const taxUsd = amountToUsd(order.taxAmount, order.currency);
      return formatPriceInCurrency(subtotalUsd - discountUsd + taxUsd, ADMIN_PRICE_CURRENCY);
    }
    const totalUsd = amountToUsd(order.total, order.currency);
    const shippingUsd = amountToUsd(order.shippingAmount || 0, order.currency);
    return formatPriceInCurrency(totalUsd - shippingUsd, ADMIN_PRICE_CURRENCY);
  };

  const previews = order.colorSizePreviews || [];

  return (
    <tr className="hover:bg-[#dcc090]/10">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          aria-label={t('admin.orders.selectOrder').replace('{number}', order.number)}
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>
      <td
        className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-[#dcc090]/10"
        onClick={onViewDetails}
      >
        <div className="text-sm font-medium text-[#122a26]">{order.number}</div>
      </td>
      <td
        className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-[#dcc090]/10"
        onClick={onViewDetails}
      >
        <div className="text-sm font-medium text-[#122a26]">
          {[order.customerFirstName, order.customerLastName].filter(Boolean).join(' ') || t('admin.orders.unknownCustomer')}
        </div>
        {order.customerPhone && (
          <div className="text-sm text-[#414141]/55">{order.customerPhone}</div>
        )}
        <div className="mt-1 text-xs text-[#122a26]">{t('admin.orders.viewOrderDetails')}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#122a26]">
        {calculateTotalWithoutShipping()}
      </td>
      <td className="px-6 py-4 text-sm text-[#414141]/60">
        {previews.length > 0 ? (
          <div className="flex max-w-[260px] flex-wrap items-center gap-1.5">
            {previews.map((preview) => {
              const swatchColor = preview.colorHex || (preview.colorLabel ? getColorValue(preview.colorLabel) : undefined);
              return (
                <span
                  key={`${order.id}-${preview.label}-${preview.imageUrl || ''}-${preview.colorHex || ''}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dcc090]/30 bg-white px-2 py-1 text-xs text-[#414141]/75"
                  title={preview.label}
                >
                  {preview.imageUrl ? (
                    <img
                      src={preview.imageUrl}
                      alt={preview.label}
                      className="h-4 w-4 rounded border border-[#dcc090]/35 object-cover"
                    />
                  ) : null}
                  {swatchColor ? (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-[#dcc090]/35"
                      style={{ backgroundColor: swatchColor }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="max-w-[120px] truncate">{preview.label}</span>
                </span>
              );
            })}
            {order.colorSizePreviewsHasMore && order.colorSizePreviewsHasMore > 0 ? (
              <span className="text-xs text-[#414141]/55">+{order.colorSizePreviewsHasMore}</span>
            ) : null}
          </div>
        ) : (
          <span className="block max-w-[220px] truncate" title={order.colorSizeSummary || undefined}>
            {order.colorSizeSummary || '—'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {updatingStatus ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#122a26]"></div>
              <span className="text-xs text-[#414141]/55">{t('admin.orders.updating')}</span>
            </div>
          ) : (
            <select
              value={order.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={`px-2 py-1 text-xs font-medium rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-[#dcc090] cursor-pointer ${getStatusColor(order.status)}`}
            >
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="completed">{t('admin.orders.completed')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {updatingPaymentStatus ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#122a26]"></div>
              <span className="text-xs text-[#414141]/55">{t('admin.orders.updating')}</span>
            </div>
          ) : (
            <select
              value={order.paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className={`px-2 py-1 text-xs font-medium rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-[#dcc090] cursor-pointer ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              <option value="paid">{t('admin.orders.paid')}</option>
              <option value="pending">{t('admin.orders.pendingPayment')}</option>
              <option value="failed">{t('admin.orders.failed')}</option>
            </select>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414141]/60">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}
