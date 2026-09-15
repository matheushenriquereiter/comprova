package org.example.comprova.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq_gen")
    @SequenceGenerator(name = "user_seq_gen", sequenceName = "user_seq", allocationSize = 1)
    private Long id;

    @NotBlank(message = "User username cannot be null or empty")
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank(message = "User email cannot be null or empty")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "User password cannot be null or empty")
    @Column(nullable = false)
    private String password;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
