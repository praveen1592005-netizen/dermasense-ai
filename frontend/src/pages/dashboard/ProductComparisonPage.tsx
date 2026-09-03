import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Plus } from 'lucide-react';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { ProductComparisonTable } from '../../components/comparison/ProductComparisonTable';
import { IngredientComparisonMatrix } from '../../components/comparison/IngredientComparisonMatrix';

export const ProductComparisonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load passed products from navigation state, or fallback to first 2 catalog products for demo
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const init = async () => {
      const stateProducts = (location.state as any)?.products as Product[] | undefined;
      if (stateProducts && stateProducts.length > 0) {
        setComparedProducts(stateProducts);
      } else {
        const all = await productService.getProducts();
        setComparedProducts(all.slice(0, 2));
      }
    };
    init();
  }, [location.state]);

  const handleRemove = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearAll = () => {
    setComparedProducts([]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard/products')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Products
          </Button>
          <PageHeader
            title="Product & Ingredient Comparison"
            subtitle="Compare active ingredients, skin compatibility, and prices across verified stores."
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/products')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add More Products
        </Button>
      </div>

      {/* Side-by-Side Product Comparison Table */}
      <ProductComparisonTable
        products={comparedProducts}
        onRemoveProduct={handleRemove}
        onClearAll={handleClearAll}
      />

      {/* Active Ingredient Overlap Matrix */}
      {comparedProducts.length >= 2 && (
        <IngredientComparisonMatrix products={comparedProducts} />
      )}
    </div>
  );
};
