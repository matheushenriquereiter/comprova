package org.example.comprova.repository;

import org.example.comprova.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);
}
