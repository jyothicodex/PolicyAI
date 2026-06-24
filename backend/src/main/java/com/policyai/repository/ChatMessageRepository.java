package com.policyai.repository;

import com.policyai.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByDocumentIdOrderByCreatedAtAsc(Long documentId);

    List<ChatMessage> findByDocumentIdIsNullOrderByCreatedAtAsc();

    void deleteByDocumentId(Long documentId);
}
