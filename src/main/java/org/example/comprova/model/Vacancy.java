package org.example.comprova.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vacancies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vacancy_seq_gen")
    @SequenceGenerator(
            name = "vacancy_seq_gen",
            sequenceName = "vacancy_seq",
            allocationSize = 1
    )
    private Long id;

    @NotBlank(message = "Vacancy title cannot be null or empty")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Vacancy description cannot be null or empty")
    @Column(nullable = false)
    private String description;

    @NotBlank(message = "Vacancy company cannot be null or empty")
    @Column(nullable = false)
    private String company;

    public Vacancy(String title, String description, String company) {
        this.title = title;
        this.description = description;
        this.company = company;
    }
}
