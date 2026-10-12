package org.example.comprova.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Garante que o texto não exceda um número máximo de bytes em UTF-8.
 * Necessário para senhas: o BCrypt só aceita até 72 bytes e rejeita entradas maiores,
 * o que resultaria em erro 500 caso o limite fosse medido apenas em caracteres.
 */
@Documented
@Constraint(validatedBy = MaxUtf8BytesValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxUtf8Bytes {
    int value();

    String message() default "Value exceeds the maximum allowed size in bytes.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
