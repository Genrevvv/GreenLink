<?php
    // Scheduling settings, appointment type rules and admin-blocked periods (see schema.sql).
    class Schedule {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        public function getSettings(): ?array {
            $stmt = $this->db->prepare('
                SELECT
                    open_time,
                    close_time,
                    slot_interval_minutes,
                    half_day_split_time,
                    visitor_capacity
                FROM scheduling_settings
                WHERE id = 1
            ');
            $stmt->execute();

            $settings = $stmt->fetch(PDO::FETCH_ASSOC);

            return $settings ?: null;
        }

        public function getTypeRules(): array {
            $stmt = $this->db->prepare('
                SELECT
                    purpose,
                    allowed_durations,
                    min_duration_minutes,
                    max_duration_minutes,
                    allowed_days,
                    min_advance_hours,
                    max_visitors
                FROM appointment_type_rules
                ORDER BY id ASC
            ');
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getUnavailablePeriods(string $fromDate): array {
            $stmt = $this->db->prepare('
                SELECT
                    id,
                    unavailable_date,
                    start_time,
                    end_time,
                    reason
                FROM unavailable_periods
                WHERE unavailable_date >= :from_date
                ORDER BY unavailable_date ASC, start_time ASC
            ');
            $stmt->execute(['from_date' => $fromDate]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getUnavailableByDate(string $date): array {
            $stmt = $this->db->prepare('
                SELECT
                    start_time,
                    end_time,
                    reason
                FROM unavailable_periods
                WHERE unavailable_date = :unavailable_date
            ');
            $stmt->execute(['unavailable_date' => $date]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function addUnavailablePeriod(string $date, ?string $startTime, ?string $endTime, string $reason): int {
            $stmt = $this->db->prepare('
                INSERT INTO unavailable_periods (unavailable_date, start_time, end_time, reason)
                VALUES (:unavailable_date, :start_time, :end_time, :reason)
            ');
            $stmt->execute([
                'unavailable_date' => $date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'reason' => $reason
            ]);

            return (int) $this->db->lastInsertId();
        }

        public function deleteUnavailablePeriod(int $id): bool {
            $stmt = $this->db->prepare('DELETE FROM unavailable_periods WHERE id = :id');
            $stmt->execute(['id' => $id]);

            return $stmt->rowCount() > 0;
        }
    }
?>
