package com.dev.finance.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.finance.demo.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>{
    
}

