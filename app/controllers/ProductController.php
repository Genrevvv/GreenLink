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

        public function addProduct(): void {
            $data = get_json_input();

            $name = trim($data['name'] ?? '');
            $category = $data['category'] ?? 'vegetables';
            $description = trim($data['description'] ?? '');

            if ($name === '' || $category === '') {
                json_response([
                    'success' => false,
                    'message' => 'Product name and category are required.'
                ]);
                return;
            }

            $productId = $this->product->addProduct($name, $category, $description);

            json_response([
                'success' => true,
                'message' => 'Product added successfully.',
                'id' => $productId
            ]);
        }

        public function updateProduct(): void {
            $data = get_json_input();

            $id = (int) ($data['id'] ?? 0);
            $name = trim($data['name'] ?? '');
            $category = $data['category'] ?? '';
            $description = trim($data['description'] ?? '');

            if ($id <= 0 || $name === '' || $category === '' || $description === '') {
                json_response([
                    'success' => false,
                    'message' => 'Please provide all required product information.'
                ]);
                return;
            }

            $this->product->updateProduct($id, $name, $category, $description);

            json_response([
                'success' => true,
                'message' => 'Product updated successfully.'
            ]);
        }

        public function updateStockStatus(): void {
            $data = get_json_input();

            try {
                $this->product->updateStockStatus(
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

        public function updateArchiveStatus(): void {
            $data = get_json_input();

            try {
                $this->product->updateArchiveStatus(
                    (int) $data['id'],
                    (bool) $data['isArchived']
                );

                json_response([
                    'success' => true,
                    'message' => 'Product archived successfully.'
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to archive product.'
                ]);
            }
        }
    }
?>