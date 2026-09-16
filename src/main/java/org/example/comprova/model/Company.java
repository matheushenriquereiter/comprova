package org.example.comprova.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company extends User {
    @Column(nullable = false)
    private String legalName;

    public Company(String username, String email, String password, String legalName) {
        super(username, email, password);

        this.legalName = legalName;
        this.setRole("ROLE_COMPANY");
    }
}