'use client';

import { useTranslation } from '../../../lib/i18n-client';
import { useOrders } from './useOrders';
import { OrdersFilters } from './components/OrdersFilters';
import { BulkSelectionControls } from './components/BulkSelectionControls';
import { OrdersTable } from './components/OrdersTable';
import { AdminShell } from '../components/AdminShell';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

export function OrdersPageContent() {
  const { t } = useTranslation();
  const {
    orders,
    loading,
    statusFilter,
    paymentStatusFilter,
    orderTypeFilter,
    searchQuery,
    page,
    meta,
    sortBy,
    sortOrder,
    updatingStatuses,
    updatingPaymentStatuses,
    updateMessage,
    selectedIds,
    bulkDeleting,
    setStatusFilter,
    setPaymentStatusFilter,
    setOrderTypeFilter,
    setSearchQuery,
    setPage,
    handleViewOrderDetails,
    toggleSelect,
    toggleSelectAll,
    handleSort,
    handleBulkDelete,
    handleStatusChange,
    handlePaymentStatusChange,
    router,
    searchParams,
  } = useOrders();

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <OrdersFilters
            statusFilter={statusFilter}
            paymentStatusFilter={paymentStatusFilter}
            orderTypeFilter={orderTypeFilter}
            searchQuery={searchQuery}
            updateMessage={updateMessage}
            setStatusFilter={setStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            setOrderTypeFilter={setOrderTypeFilter}
            setSearchQuery={setSearchQuery}
            setPage={setPage}
            router={router}
            searchParams={searchParams}
          />

          <BulkSelectionControls
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            bulkDeleting={bulkDeleting}
          />

          <OrdersTable
            orders={orders}
            loading={loading}
            selectedIds={selectedIds}
            updatingStatuses={updatingStatuses}
            updatingPaymentStatuses={updatingPaymentStatuses}
            sortBy={sortBy}
            sortOrder={sortOrder}
            page={page}
            meta={meta}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onSort={handleSort}
            onViewDetails={handleViewOrderDetails}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </AdminShell>
      </div>
    </div>
  );
}
