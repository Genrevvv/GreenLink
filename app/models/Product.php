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

        public function addProduct(string $name, string $category, string $description): int {
            $sql = 'INSERT INTO products (name, category, description, in_stock, is_archived)
                    VALUES (:name, :category, :description, 1, 0)';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'name' => $name,
                'category' => $category,
                'description' => $description
            ]);

            return (int) $this->db->lastInsertId();
        }

        public function updateProduct(int $id, string $name, string $category, string $description): void {
            $sql = 'UPDATE products
                    SET name = :name,
                        category = :category,
                        description = :description
                    WHERE id = :id';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'name' => $name,
                'category' => $category,
                'description' => $description,
                'id' => $id
            ]);
        }
        
        public function updateStockStatus(int $id, bool $inStock): void {
            $sql = 'UPDATE products SET in_stock = :in_stock WHERE id = :product_id';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'in_stock' => (int) $inStock,
                'product_id' => $id
            ]);
        }

        public function updateArchiveStatus(int $id, bool $isArchived): void {
            $sql = 'UPDATE products SET is_archived = :is_archived WHERE id = :product_id';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'is_archived' => (int) $isArchived,
                'product_id' => $id
            ]);
        }
    }
?>