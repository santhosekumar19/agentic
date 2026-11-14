package com.aegisflow.policy;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class PolicyControllerTest {
    final PolicyController controller = new PolicyController();

    @Test void analystCannotRunEvaluations() {
        var result = controller.decide(new PolicyController.PolicyRequest("user", "demo-bank", List.of("analyst"), "eval", "evaluation"));
        assertFalse(result.allowed());
    }
    @Test void adminCanRunEvaluations() {
        var result = controller.decide(new PolicyController.PolicyRequest("user", "demo-bank", List.of("admin"), "eval", "evaluation"));
        assertTrue(result.allowed());
    }
    @Test void unknownTenantIsRejected() {
        var result = controller.decide(new PolicyController.PolicyRequest("user", "untrusted", List.of("admin"), "ask", "knowledge"));
        assertFalse(result.allowed());
    }
}
