---
description: How to customize Springroll for any document type via conversation
---

# Platform Customization Workflow

This workflow explains how to use Springroll as a "Meta-Agent" to build new document modules and pipelines.

## Step 1: Define the Use Case
*   **Conversational Trigger**: Tell the agent: "I need a new pipeline for [Document Type] (e.g., 'Immigration Visas' or 'Supply Chain BOMs')".
*   **Context Gathering**: Springroll will ask:
    *   What are the 3-5 key phases of this process?
    *   Are there specific legal or compliance rules to follow?
    *   What local files should I reference as templates?

## Step 2: Agentic Generation
*   **Workflow Creation**: The agent creates a new `.agent/workflows/[module-name].md` file.
*   **Module Registration**: The agent updates the `INITIAL_MODULES` configuration in the frontend (or a local `config.json` in the future).
*   **UI Tailoring**: The agent selects the appropriate UI type (Agentic Chat vs. Structured Pipeline) based on the use case.

## Step 3: Local Data Binding
*   **File Indexing**: Point the agent to the folder containing your historical examples for this document type.
*   **Template Mapping**: Define which variables the agent needs to "find" and "fill" (e.g., Names, Dates, Technical Specs).

## Step 4: Live Test & Refine
*   **Mock Execution**: Run a test generation of the first step.
*   **UI Feedback**: Tell the agent if the status labels or tracking steps need adjustment.
