import Image from 'next/image';
import { formatCents } from '@/lib/utils/format';
import type { OrderItem } from '@/types';

interface OrderItemRowProps {
  item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded bg-space-800 text-sm overflow-hidden">
          {item.product.imageUrl ? (
            <Image
              src={item.product.imageUrl}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            item.product.category === 'electronics' ? '🔌' : item.product.category === 'apparel' ? '👕' : '🌙'
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-lunar-200">{item.product.name}</p>
          <p className="text-xs text-lunar-500">
            {item.quantity} × {formatCents(item.priceAtPurchase)}
            {item.priceAtPurchase !== item.product.priceCents && (
              <span className="ml-1 text-amber-500" title="Current price differs from purchase price">
                (now {formatCents(item.product.priceCents)})
              </span>
            )}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-lunar-300">
        {formatCents(item.priceAtPurchase * item.quantity)}
      </span>
    </li>
  );
}
