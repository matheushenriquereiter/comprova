sed -i 's/private final org.springframework.context.ApplicationEventPublisher eventPublisher;/private final AiEvaluationService aiEvaluationService;/g' comprova-backend/src/main/java/org/example/comprova/service/JobPostingService.java
sed -i 's/public void submitApplicationTest(/public Integer submitApplicationTest(/g' comprova-backend/src/main/java/org/example/comprova/service/JobPostingService.java
sed -i '/eventPublisher.publishEvent/d' comprova-backend/src/main/java/org/example/comprova/service/JobPostingService.java
sed -i '/jobApplicationRepository.save(app);/a \        return aiEvaluationService.evaluateApplicationTestSync(app);' comprova-backend/src/main/java/org/example/comprova/service/JobPostingService.java
