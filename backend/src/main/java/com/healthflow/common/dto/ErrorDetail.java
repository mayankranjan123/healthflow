package com.healthflow.common.dto;

public class ErrorDetail {

    private String field;
    private String issue;

    public ErrorDetail() {}

    public ErrorDetail(String field, String issue) {
        this.field = field;
        this.issue = issue;
    }

    // Getters and Setters
    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }
}
