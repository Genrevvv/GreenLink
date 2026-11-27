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
                    max_visitors,
                    is_active
                FROM appointment_type_rules
                ORDER BY id ASC
            ');
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function addTypeRule(string $purpose): bool {
            $stmt = $this->db->prepare('
                SELECT id
                FROM appointment_type_rules
                WHERE purpose = :purpose
                LIMIT 1
            ');
            $stmt->execute(['purpose' => $purpose]);

            if ($stmt->fetchColumn() !== false) {
                return false;
            }

            try {
                $stmt = $this->db->prepare('
                    INSERT INTO appointment_type_rules (purpose)
                    VALUES (:purpose)
                ');
                $stmt->execute(['purpose' => $purpose]);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') {
                    return false;
                }

                throw $e;
            }

            return true;
        }

        public function saveBookingSettings(array $settings, array $typeRules): void {
            $this->db->beginTransaction();

            try {
                if ($this->getSettings() === null) {
                    throw new RuntimeException('Scheduling settings row is missing.');
                }

                $stmt = $this->db->prepare('
                    UPDATE scheduling_settings
                    SET open_time = :open_time,
                        close_time = :close_time,
                        slot_interval_minutes = :slot_interval_minutes,
                        half_day_split_time = :half_day_split_time,
                        visitor_capacity = :visitor_capacity
                    WHERE id = 1
                ');
                $stmt->execute([
                    'open_time' => $settings['openTime'],
                    'close_time' => $settings['closeTime'],
                    'slot_interval_minutes' => $settings['slotInterval'],
                    'half_day_split_time' => $settings['halfDaySplitTime'],
                    'visitor_capacity' => $settings['visitorCapacity']
                ]);

                $appointmentsUsingType = $this->db->prepare('
                    SELECT COUNT(*)
                    FROM appointments
                    WHERE purpose = :purpose
                ');
                $renameType = $this->db->prepare('
                    UPDATE appointment_type_rules
                    SET purpose = :new_purpose
                    WHERE purpose = :old_purpose
                ');
                $archiveType = $this->db->prepare('
                    UPDATE appointment_type_rules
                    SET is_active = 0
                    WHERE purpose = :purpose
                ');
                $saveType = $this->db->prepare('
                    UPDATE appointment_type_rules
                    SET allowed_durations = :allowed_durations,
                        min_duration_minutes = NULL,
                        max_duration_minutes = NULL,
                        allowed_days = :allowed_days,
                        min_advance_hours = :min_advance_hours,
                        max_visitors = :max_visitors,
                        is_active = 1
                    WHERE purpose = :purpose
                ');

                foreach ($typeRules as $rule) {
                    if ($rule['originalPurpose'] !== $rule['purpose']) {
                        $appointmentsUsingType->execute(['purpose' => $rule['originalPurpose']]);

                        if ((int) $appointmentsUsingType->fetchColumn() > 0) {
                            throw new DomainException('Visit types with appointments cannot be renamed. Archive the type and add a new one instead.');
                        }

                        $renameType->execute([
                            'new_purpose' => $rule['purpose'],
                            'old_purpose' => $rule['originalPurpose']
                        ]);
                    }

                    if (!$rule['enabled']) {
                        $archiveType->execute(['purpose' => $rule['purpose']]);
                        continue;
                    }

                    $saveType->execute([
                        'allowed_durations' => $rule['allowedDurations'] === null
                            ? null
                            : implode(',', $rule['allowedDurations']),
                        'allowed_days' => $rule['allowedDays'] === null
                            ? null
                            : implode(',', $rule['allowedDays']),
                        'min_advance_hours' => $rule['minAdvanceHours'],
                        'max_visitors' => $rule['maxVisitors'],
                        'purpose' => $rule['purpose']
                    ]);
                }

                $this->db->commit();
            } catch (Throwable $e) {
                if ($this->db->inTransaction()) {
                    $this->db->rollBack();
                }

                throw $e;
            }
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
