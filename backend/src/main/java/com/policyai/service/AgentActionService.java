package com.policyai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
public class AgentActionService {

    /**
     * Mock API to check leave balance.
     */
    public String checkLeaveBalance(String employeeId) {
        log.info("Agent action executed: checkLeaveBalance for {}", employeeId);
        // Mock data
        return "Employee " + employeeId + " has 14 days of Annual Leave and 5 days of Sick Leave remaining.";
    }

    /**
     * Mock API to draft a leave request.
     */
    public String draftLeaveRequest(String employeeId, String reason, String dates) {
        log.info("Agent action executed: draftLeaveRequest for {}, reason: {}, dates: {}", employeeId, reason, dates);
        return String.format("A leave request for %s has been drafted for dates %s due to %s. It is pending manager approval.", 
                employeeId, dates, reason);
    }

    /**
     * Mock API to submit an IT support ticket.
     */
    public String submitItTicket(String employeeId, String issueDescription) {
        log.info("Agent action executed: submitItTicket for {}, issue: {}", employeeId, issueDescription);
        String ticketId = "IT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return String.format("An IT support ticket has been successfully created. Ticket ID: %s. Description: %s", 
                ticketId, issueDescription);
    }
}
