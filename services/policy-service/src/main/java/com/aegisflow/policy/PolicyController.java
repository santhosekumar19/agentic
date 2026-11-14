package com.aegisflow.policy;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Educational ABAC/RBAC policy example. Replace demo identity headers with verified JWTs in production. */
@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class PolicyController {
    private static final Set<String> KNOWN_TENANTS = Set.of("demo-bank", "demo-insure");

    public record PolicyRequest(@NotBlank String userId,
                                @NotBlank String tenantId,
                                @NotEmpty List<@NotBlank String> roles,
                                @NotBlank String action,
                                @NotBlank String resource) {}

    public record PolicyDecision(boolean allowed, String reason, String policyVersion) {}

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "policy-service", "status", "ok");
    }

    @PostMapping(path = "/v1/policies/check", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PolicyDecision decide(@Valid @RequestBody PolicyRequest request) {
        if (!KNOWN_TENANTS.contains(request.tenantId()))
            return new PolicyDecision(false, "Unknown tenant", "demo-v1");
        if (request.action().equals("eval") && request.resource().equals("evaluation"))
            return new PolicyDecision(request.roles().contains("admin"), "Admin-only evaluation", "demo-v1");
        if ((request.action().equals("search") || request.action().equals("ask")) && request.resource().equals("knowledge")) {
            boolean allowed = request.roles().stream().anyMatch(Set.of("analyst", "operator", "admin")::contains);
            return new PolicyDecision(allowed, "Knowledge access by role", "demo-v1");
        }
        return new PolicyDecision(false, "No matching policy", "demo-v1");
    }
}
