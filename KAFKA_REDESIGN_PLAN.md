# Kafka Messages - Complete Redesign Plan

## Overview
The Kafka Messages interface will be completely redesigned to support full CRUD operations (Create, Read, Update, Delete) on Kafka messages. All operations will send data to backend APIs.

## Key Features

### 1. Connection Configuration (Always Visible)
- **Broker URL**: Input field for Kafka broker address (e.g., "kafka.production.local:9092")
- **Topic Name**: Input field for topic name
- **Username & Password**: Authentication fields

### 2. Operation Tabs
The interface will use tabs to organize different operations:

#### Tab 1: View/Get Messages
- **Purpose**: Retrieve and view messages from the topic
- **Features**:
  - Search/Filter by JSON field (e.g., userId=12345)
  - Pagination support
  - Export format selection (JSON/CSV/TXT)
  - Max messages limit input
- **API Call**: POST /api/kafka/get-messages
  ```json
  {
    "brokerUrl": "kafka.production.local:9092",
    "topic": "orders-topic",
    "username": "admin",
    "password": "pass123",
    "filter": {
      "key": "userId",
      "value": "12345"
    },
    "limit": 100,
    "exportFormat": "json"
  }
  ```

#### Tab 2: Send/Add Message
- **Purpose**: Publish a new message to the topic
- **Features**:
  - Large text area for JSON message content
  - Message key input (optional)
  - Partition selection (auto/specific)
  - JSON validation
- **API Call**: POST /api/kafka/send-message
  ```json
  {
    "brokerUrl": "kafka.production.local:9092",
    "topic": "orders-topic",
    "username": "admin",
    "password": "pass123",
    "message": {
      "orderId": "12345",
      "status": "pending"
    },
    "key": "order-12345",
    "partition": "auto"
  }
  ```

#### Tab 3: Delete Messages
- **Purpose**: Remove messages from the topic
- **Options**:
  - Delete ALL messages (purge topic)
  - Delete by filter (JSON field match)
  - Delete by message ID/offset range
- **API Call**: POST /api/kafka/delete-messages
  ```json
  {
    "brokerUrl": "kafka.production.local:9092",
    "topic": "orders-topic",
    "username": "admin",
    "password": "pass123",
    "deleteAll": false,
    "filter": {
      "key": "status",
      "value": "cancelled"
    }
  }
  ```

#### Tab 4: Update Message
- **Purpose**: Update an existing message
- **Features**:
  - Message ID/offset input
  - Search to find message first
  - Text area for new JSON content
  - Preview old vs new
- **API Call**: POST /api/kafka/update-message
  ```json
  {
    "brokerUrl": "kafka.production.local:9092",
    "topic": "orders-topic",
    "username": "admin",
    "password": "pass123",
    "messageId": "offset-12345",
    "newMessage": {
      "orderId": "12345",
      "status": "completed"
    }
  }
  ```

## UI Design Principles
1. **Clean Layout**: Tabs separate operations clearly
2. **Validation**: JSON validation for message content
3. **Feedback**: Loading states and success/error messages
4. **Safety**: Confirmation dialogs for destructive operations (delete all)
5. **Flexibility**: Works with ANY Kafka broker and topic
6. **Professional**: Follows the existing design system

## Execution Flow
1. User fills in connection details
2. User selects operation tab
3. User configures operation-specific options
4. User clicks Execute/Send/Delete button
5. Dialog shows progress stages
6. Success message with results or error handling
