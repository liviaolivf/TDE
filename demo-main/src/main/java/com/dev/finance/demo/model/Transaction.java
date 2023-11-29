package com.dev.finance.demo.model;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@SequenceGenerator(name = "transaction_seq", sequenceName = "transaction_seq", initialValue = 1, allocationSize = 1)
@Table(name = "transactions")
public class Transaction {
    public enum Type {
        income,
        expense
    }

    public enum Category {
        agua,
        alimentacao,
        aluguel,
        animal_de_estimacao,
        compras,
        energia,
        internet,
        lazer,
        outros,
        salario
    }

    @Id
    private long id;
    @Column(name = "description", nullable = false, length = 100)
    private String description;
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    @Column(name = "`type`", nullable = false, length = 10)
    private Type type;
    @Enumerated(EnumType.STRING)
    @Column(name = "`category`", nullable = false, length = 20)
    private Category category;
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime created_at;

    public Transaction() {
    }

    public Transaction(long id, String description, BigDecimal amount, Type type, Category category,
            ZonedDateTime created_at) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.created_at = created_at;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal value) {
        this.amount = value;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public ZonedDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(ZonedDateTime created_at) {
        this.created_at = created_at;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setCreated_at(String created_at) {
        this.created_at = ZonedDateTime.parse(created_at, DateTimeFormatter.ISO_DATE_TIME);
    }
}
