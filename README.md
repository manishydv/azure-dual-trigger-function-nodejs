# Azure Dual-Trigger Function with Shared Logic

This project demonstrates an Azure Function setup where two different triggers—a Timer trigger and a Queue trigger—execute a single, shared piece of Node.js code. This pattern is useful for scenarios where the same logic needs to be initiated by both a schedule and an ad-hoc event.

## Project Structure

```
.
├── QueueTriggerFunction
│   └── function.json      // Configuration for the Queue trigger
├── SharedLogic
│   └── index.js           // The shared business logic for both triggers
├── TimerTriggerFunction
│   └── function.json      // Configuration for the Timer trigger
├── .gitignore
├── host.json              // Global configuration for the Function App
├── local.settings.json    // Local development settings (DO NOT COMMIT)
└── package.json           // Node.js project dependencies
```

- **`SharedLogic/index.js`**: This is the core of the function. It contains the logic that fetches a quote of the day. It inspects the `context.bindings` to determine whether it was triggered by the timer (`myTimer`) or a queue message (`myQueueItem`).
- **`TimerTriggerFunction/function.json`**: Defines the Timer trigger. By default, it is scheduled to run every day at 6 PM UTC. It points to `../SharedLogic/index.js` as its script file.
- **`QueueTriggerFunction/function.json`**: Defines the Queue trigger. It listens for new messages on a queue named `js-queue-items`. It also points to the shared logic script.

## Permissions and Security

This function is designed to be secure and avoid storing secrets in the application settings by using a **User-Assigned Managed Identity**.

### Required Permissions

The Managed Identity assigned to this Function App needs the following role assignments:

1.  **Storage Queue Data Contributor**: This permission is required on the Azure Storage Account that hosts the queue (`js-queue-items`). It allows the function to read and process messages from the queue.

### How to Configure Managed Identity

1.  **Create a User-Assigned Managed Identity** in the Azure portal.
2.  **Assign the Identity to the Function App**:
    - In the Function App's portal page, go to **Settings > Identity**.
    - Select the **User assigned** tab and add the identity you created.
3.  **Grant Permissions**:
    - Navigate to the target Azure Storage Account.
    - Go to **Access control (IAM)**.
    - Click **Add > Add role assignment**.
    - Select the `Storage Queue Data Contributor` role.
    - Assign access to **Managed identity** and select the identity you created.

## Environment Variables / Application Settings

The following application settings must be configured in your Function App.

| Setting Key                     | Description                                                                                                                                 | Example Value                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `AzureWebJobsStorage__accountName` | The name of the storage account for the queue trigger. Using this format tells the runtime to connect using a managed identity. **Required for Queue Trigger**. | `yourstorageaccountname`       |
| `FUNCTIONS_WORKER_RUNTIME`      | The language worker runtime.                                                                                                                | `node`                         |
| `QUOTE_API_URL`                 | (Optional) The URL for the quote API. If not set, it defaults to `https://zenquotes.io/api/today`.                                            | `https://your.api/endpoint`    |

**Note**: When running locally, you would typically use a connection string in `local.settings.json` for `AzureWebJobsStorage`. The `__accountName` syntax is for when the function is deployed to Azure and using a managed identity.

## Deployment

This function can be deployed directly from a ZIP file.

1.  **Create a ZIP file**: Compress the contents of the project directory. Ensure that files like `host.json`, `package.json`, and the function folders are at the root of the archive.
2.  **Deploy via Kudu**:
    - In the Azure portal, navigate to your Function App.
    - Go to **Development Tools > Advanced Tools** and click **Go**.
    - In the Kudu console, select **Tools > Zip Push Deploy**.
    - Drag and drop your ZIP file into the deployment area.

This will deploy the function, and it will be ready to run based on the timer schedule or messages in the configured queue.

## How to Test in Kudu Console

You can manually trigger the functions for testing directly from the Kudu console using `curl`. This is useful for immediate feedback without waiting for the trigger to fire.

### 1. Get the Master Key

You need the Function App's master key to authenticate the request.

1.  In the Azure portal, navigate to your Function App.
2.  Under **Functions**, select **App keys**.
3.  Copy the value of the `_master` key.

### 2. Open Kudu Debug Console

1.  In your Function App, go to **Development Tools > Advanced Tools** and click **Go**.
2.  This opens the Kudu portal. Select **Debug console > CMD**.

### 3. Trigger the Function

Use the following `curl` commands in the Kudu console. Replace `<your-function-app-name>` with your app's name and `<_master_key>` with the key you copied.

#### Testing the Timer Trigger

To test the timer-triggered function, you send a POST request with an empty input.

```sh
curl -X POST "https://<your-function-app-name>.azurewebsites.net/admin/functions/TimerTriggerFunction" -H "x-functions-key: <_master_key>" -H "Content-Type: application/json" -d "{'input':''}"
```

#### Testing the Queue Trigger

To test the queue-triggered function, you send the message content in the `input` field of the request body.

```sh
# Example: Send a message to the queue to get a quote for the month of May
curl -X POST "https://<your-function-app-name>.azurewebsites.net/admin/functions/QueueTriggerFunction" -H "x-functions-key: <_master_key>" -H "Content-Type: application/json" -d "{'input':'{\"month\": \"5\"}'}"
```

After running these commands, you can view the execution logs in the **Log stream** section of your Function App in the Azure portal to see the output and confirm that the function ran successfully.
