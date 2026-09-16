package org.example.comprova.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
public class Candidate extends User {
    @Column(nullable = false, unique = true)
    private String cpf;

    public Candidate(String username, String email, String password, String cpf) {
        super(username, email, password);

        this.cpf = cpf;
        this.setRole("ROLE_CANDIDATE");
    }
}