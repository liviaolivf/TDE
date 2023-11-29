package com.dev.finance.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.finance.demo.model.Transaction;
import com.dev.finance.demo.repository.TransactionRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/")
    public ResponseEntity<List<Transaction>> fetchAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> fetchTransaction(@PathVariable Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);

        if (transaction.isPresent()) {
            return ResponseEntity.ok(transaction);
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping("/")
    public ResponseEntity<Transaction> create(@RequestBody Transaction transaction) {
        Transaction newTransaction = transactionRepository.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(newTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @RequestBody Transaction updatedTransaction) {
        Optional<Transaction> optionalTransaction = transactionRepository.findById(id);

        if (optionalTransaction.isPresent()) {
            Transaction existingTransaction = optionalTransaction.get();

            existingTransaction.setDescription(updatedTransaction.getDescription());
            existingTransaction.setAmount(updatedTransaction.getAmount());
            existingTransaction.setCreated_at(updatedTransaction.getCreated_at());
            existingTransaction.setType(updatedTransaction.getType());
            existingTransaction.setCategory(updatedTransaction.getCategory());

            Transaction updated = transactionRepository.save(existingTransaction);
            return ResponseEntity.ok(updated);
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);

        if (transaction.isPresent()) {
            transactionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}
