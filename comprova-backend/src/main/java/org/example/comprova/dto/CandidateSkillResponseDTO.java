package org.example.comprova.dto;

import org.example.comprova.enums.SkillLevel;

public record CandidateSkillResponseDTO(

        Long skillId,
        String skillName,
        SkillLevel declaredLevel,
        Integer validatedScore

) {
}