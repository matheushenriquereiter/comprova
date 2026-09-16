package org.example.comprova.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "competences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Competence {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "competence_seq_gen")
    @SequenceGenerator(
            name = "competence_seq_gen",
            sequenceName = "competence_seq",
            allocationSize = 1
    )
    private Long id;

    @NotBlank(message = "Competence name cannot be null or empty")
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank(message = "Competence description cannot be null or empty")
    @Column(nullable = false)
    private String description;

    public Competence(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
