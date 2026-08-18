<?php
  class Database {
        private $db = null;

        public function __construct($config) {
            try {
                $this->db = new PDO(
                    "mysql:host={$config['db_host']};
                        dbname={$config['db_name']}",
                        $config['db_user'],
                        $config['db_pass']
                );

               $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            catch (PDOException $e) {
                echo json_encode(['error' => 'Unable to connect', 'log' => $e->getMessage()]);
                exit();
            }
        }

        public function getConnection(): PDO {
            return $this->db;
        }
  }
?>