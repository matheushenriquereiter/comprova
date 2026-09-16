package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.*;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.Company;
import org.example.comprova.model.User;
import org.example.comprova.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public void signUpCandidate(CandidateRegisterDTO candidateRegisterDTO) {
        Optional<User> userWithSameEmail = userRepository.getUserByEmail(candidateRegisterDTO.email());
        Optional<User> userWithSameUsername = userRepository.getUserByUsername(candidateRegisterDTO.username());

        if (userWithSameEmail.isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email already taken");
        }

        if (userWithSameUsername.isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Username already taken");
        }

        String encodedPassword = passwordEncoder.encode(candidateRegisterDTO.password());

        userRepository.save(new Candidate(candidateRegisterDTO.username(), candidateRegisterDTO.email(), encodedPassword, candidateRegisterDTO.cpf()));
    }

    public void signUpCompany(UserRegisterDTO userRegisterDTO) {
        Optional<User> userWithSameEmail = userRepository.getUserByEmail(userRegisterDTO.email());
        Optional<User> userWithSameUsername = userRepository.getUserByUsername(userRegisterDTO.username());

        if (userWithSameEmail.isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email already taken");
        }

        if (userWithSameUsername.isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Username already taken");
        }

        String encodedPassword = passwordEncoder.encode(userRegisterDTO.password());
        User userToRegister = new Company(userRegisterDTO.username(), userRegisterDTO.email(), encodedPassword, "Jorge");

        userRepository.save(userToRegister);
    }

    public TokenDTO signIn(UserLoginDTO userLoginDTO) {
        User user = userRepository.getUserByEmail(userLoginDTO.email()).orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Invalid credentials"));

        if (!passwordEncoder.matches(userLoginDTO.password(), user.getPassword())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }

        return new TokenDTO(jwtService.generateToken(user.getUsername(), user.getAuthorities()));
    }

    public UserResponseDTO me(String username) {
        User user = userRepository.getUserByUsername(username).orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "User not found"));

        return new UserResponseDTO(user.getUsername(), user.getEmail(), user.getRole());
    }
}
