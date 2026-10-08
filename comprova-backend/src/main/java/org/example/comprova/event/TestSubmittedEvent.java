package org.example.comprova.event;

import org.springframework.context.ApplicationEvent;

public class TestSubmittedEvent extends ApplicationEvent {
    private final Long applicationId;

    public TestSubmittedEvent(Object source, Long applicationId) {
        super(source);
        this.applicationId = applicationId;
    }

    public Long getApplicationId() {
        return applicationId;
    }
}
