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
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company extends User {
    @Column(nullable = false)
    private String legalName;

    @Column(nullable = false)
    private String tradeName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String cnpj;

    @OneToMany(mappedBy = "company")
    private Set<JobPosting> jobPostings;

    public Company(String username, String email, String password, String legalName, String tradeName, String phone, String cnpj) {
        super(username, email, password);

        this.legalName = legalName;
        this.tradeName = tradeName;
        this.phone = phone;
        this.cnpj = cnpj;
        this.setRole("ROLE_COMPANY");
    }
}