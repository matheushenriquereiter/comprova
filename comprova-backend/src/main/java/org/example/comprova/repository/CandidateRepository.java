package org.example.comprova.repository;

import org.example.comprova.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    boolean existsByCpf(String cpf);

    Optional<Candidate> findByCpf(String cpf);
}
