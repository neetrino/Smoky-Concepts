'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card, Button } from '@shop/ui';

interface BulkSelectionControlsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  bulkDeleting: boolean;
}

export function BulkSelectionControls({
  selectedCount,
  onBulkDelete,
  bulkDeleting,
}: BulkSelectionControlsProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {t('admin.orders.selectedOrders').replace('{count}', selectedCount.toString())}
        </div>
        <Button
          variant="outline"
          onClick={onBulkDelete}
          disabled={bulkDeleting || selectedCount === 0}
        >
          {bulkDeleting ? t('admin.orders.deleting') : t('admin.orders.deleteSelected')}
        </Button>
      </div>
    </Card>
  );
}

