'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Button
      id={`add-to-cart-${product.id}`}
      variant={added ? 'secondary' : 'primary'}
      size="sm"
      className="w-full"
      onClick={handleAdd}
      disabled={disabled}
    >
      {added ? '✓ Added' : 'Add to Cart'}
    </Button>
  );
}
