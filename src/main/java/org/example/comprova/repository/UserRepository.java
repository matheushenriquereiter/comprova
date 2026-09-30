package org.example.comprova.repository;

import org.example.comprova.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> getUserByEmail(String email);

    Optional<User> getUserByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
