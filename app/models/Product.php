<?php
    class Product {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        public function getAll(): array {
            $sql = '
                SELECT
                    id,
                    name,
                    category,
                    description,
                    in_stock,
                    is_archived
                FROM products
                ORDER BY id DESC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function updateStock(int $productId, bool $inStock): void {
            $sql = 'UPDATE products SET in_stock = :in_stock WHERE id = :product_id';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'in_stock' => (int) $inStock,
                'product_id' => $productId
            ]);
        }
    }
?>