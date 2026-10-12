package org.example.comprova.repository;

import org.example.comprova.model.User;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, UserDetailsService {
    Optional<User> getUserByEmail(String email);

    Optional<User> getUserByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    default @NonNull UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        return getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

}
