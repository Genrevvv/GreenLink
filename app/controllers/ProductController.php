<?php
    class ProductController {
        private Product $product;

        public function __construct(Product $product) {
            $this->product = $product;
        }

        public function getAll() {
            try {
                $products = $this->product->getAll();

                $formattedProducts = array_map(function ($product) {
                    return [
                        'id' => (int) $product['id'],
                        'name' => $product['name'],
                        'category' => $product['category'],
                        'description' => $product['description'],
                        'inStock' => (bool) $product['in_stock'],
                        'isArchived' => (bool) $product['is_archived']
                    ];
                }, $products);

                json_response([
                    'success' => true,
                    'products' => $formattedProducts
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve products.'
                ]);
            }
        }

        public function updateStock(): void {
            $data = get_json_input();

            try {
                $this->product->updateStock(
                    (int) $data['id'],
                    (bool) $data['inStock']
                );

                json_response([
                    'success' => true,
                    'message' => 'Product stock updated successfully.'
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to update product stock.'
                ]);
            }
        }
    }
?>