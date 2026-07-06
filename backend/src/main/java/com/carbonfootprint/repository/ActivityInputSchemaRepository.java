package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivityInputSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityInputSchemaRepository extends JpaRepository<ActivityInputSchema, Long> {
}
