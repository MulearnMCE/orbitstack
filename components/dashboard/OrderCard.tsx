import { formatCents, formatDate, relativeDate, shortOrderId } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OrderItemRow } from './OrderItemRow';
import { DuplicateOrderButton } from './DuplicateOrderButton';
import type { Order, OrderStatus } from '@/types';

interface OrderCardProps {
  order: Order & { items: NonNullable<Order['items']> };
}

const statusVariant: Record<OrderStatus, 'default' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card className="space-y-4" id={`order-card-${order.id}`}>
      {}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-lunar-500">{shortOrderId(order.id)}</p>
          <p className="mt-0.5 text-sm text-lunar-400" title={formatDate(order.createdAt)}>
            {relativeDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant[order.status]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {}
      <ul className="space-y-2">
        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </ul>

      {}
      <div className="border-t border-space-700 pt-3 text-sm space-y-1">
        <div className="flex justify-between text-lunar-400">
          <span>Subtotal</span>
          <span>{formatCents(order.subtotalCents)}</span>
        </div>
        {order.discountCents > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Discount</span>
            <span>−{formatCents(order.discountCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-lunar-400">
          <span>Shipping</span>
          <span>
            {order.shippingCents === 0 ? (
              <span className="text-emerald-400">Free</span>
            ) : (
              formatCents(order.shippingCents)
            )}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-lunar-100">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </div>

      <div className="border-t border-space-700 pt-3 flex justify-end">
        <DuplicateOrderButton orderId={order.id} />
      </div>
    </Card>
  );
}
