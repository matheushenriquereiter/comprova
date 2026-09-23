package org.example.comprova.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
public class Candidate extends User {
    @Column(nullable = false, unique = true)
    private String cpf;

    @OneToMany(mappedBy = "candidate")
    private Set<JobPostingCandidate> jobPostings;

    public Candidate(String username, String email, String password, String cpf) {
        super(username, email, password);

        this.cpf = cpf;
        this.setRole("ROLE_CANDIDATE");
    }
}