# AI Personality & UI/UX Skills Implementation Guide

**Author**: Manus AI
**Date**: April 4, 2026

## 1. Executive Summary

Following the recent changes in Anthropic's OAuth token policies for third-party tools like OpenClaw and Hermes [1], migrating to alternative AI models (such as GLM 5.1 via Z.AI, Minimax 2.7, or OpenAI Codex) is a strategic necessity for cost efficiency and uninterrupted operations [1]. 

While these alternative models often match or exceed Claude's coding capabilities [2], they can sometimes lack the "taste," conversational nuance, and UI/UX design intelligence that Claude naturally possesses [1]. This guide details the "Personality Layers" and UI/UX skills required to bridge that gap, ensuring your new AI deployment operates with the same high-quality output and emotional intelligence as Claude.

## 2. The Core Skills Repositories

To replicate Claude's capabilities in alternative models, we must inject specific skills into your AI harness (OpenClaw, Hermes, or Claude Code). The following three repositories are the gold standard for this implementation:

### A. UI UX Pro Max Skill (The Flagship Design Engine)
This is the most critical skill for replacing Claude's design intuition. It provides an AI-powered reasoning engine that analyzes project requirements and generates complete, tailored design systems [3].

*   **Repository**: `nextlevelbuilder/ui-ux-pro-max-skill`
*   **Key Features**:
    *   161 Industry-Specific Reasoning Rules (matching products to UI categories).
    *   67 UI Styles (Glassmorphism, Bento Grid, etc.).
    *   161 Color Palettes and 57 Font Pairings.
    *   Stack-specific guidelines (React, Next.js, Vue, SwiftUI, Tailwind).
*   **Implementation**:
    This skill can be installed globally via CLI to work with almost any AI assistant:
    ```bash
    npm install -g uipro-cli
    uipro init --ai all
    ```

### B. Anthropic Agent Skills
Anthropic's official repository containing implementations of skills that demonstrate how to complete specific tasks in a repeatable way [4].

*   **Repository**: `anthropics/skills`
*   **Key Features**:
    *   Contains the document creation and editing skills that power Claude's internal capabilities (`docx`, `pdf`, `pptx`, `xlsx`).
    *   Provides templates for creating custom skills with strict formatting and guidelines.
*   **Implementation**:
    These can be added directly via the Claude Code marketplace:
    ```bash
    /plugin marketplace add anthropics/skills
    /plugin install document-skills@anthropic-agent-skills
    ```

### C. Vercel Agent Skills
Vercel's official collection of skills focused heavily on modern web development best practices, performance, and accessibility [5].

*   **Repository**: `vercel-labs/agent-skills`
*   **Key Features**:
    *   `react-best-practices`: 40+ rules for Next.js/React performance optimization.
    *   `web-design-guidelines`: Audits code for 100+ rules covering accessibility, UX, and performance.
    *   `react-view-transitions`: Guidelines for native-feeling animations.
*   **Implementation**:
    ```bash
    npx skills add vercel-labs/agent-skills
    ```

## 3. Implementing the "Personality Layer"

To evolve the personality of your alternative agents (like GLM or Codex) so they feel more like Claude, you must explicitly prompt the agent to adopt these skills and adjust its behavior.

### The Migration Prompt Strategy
When setting up your agent in OpenClaw or Hermes, use the following framework in your system prompt or initial instructions:

> **System Instruction Update**:
> "You are transitioning from a Claude-based architecture to a new model architecture. Your primary directive is to assess and upgrade yourself using the provided UI/UX and Personality skills. You must maintain a high level of conversational nuance, emotional intelligence, and 'good taste' in design. When generating code or UI, strictly adhere to the guidelines provided in the `ui-ux-pro-max-skill` and `web-design-guidelines` skills. Prioritize accessibility, smooth transitions, and industry-appropriate color palettes. If you are operating within OpenClaw, utilize the Souls MD system to deeply integrate this personality layer."

### Key Personality Traits to Enforce:
1.  **Conversational Tone**: Professional, helpful, slightly informal but never overly casual. (For VETS: Incorporate a female voice, light-heartedness, some humor, and straight-talking military precision).
2.  **Design Taste**: Avoid bright neon colors, harsh animations, and generic "AI gradients." Prefer soft shadows, subtle depth, and high-contrast accessibility [3].
3.  **Proactive Auditing**: Always self-audit generated UI against the Vercel `web-design-guidelines` before presenting the final code [5].

## 4. Integration with the Command Center Blueprint

These skills integrate directly into Phase 3 of your Command Center Blueprint. When deploying Claude Code with the GLM Coding Plan on your VPS, the automation script should be updated to install these skills automatically.

### Updated Automation Steps for VPS:
1.  Install Claude Code globally.
2.  Configure the Z.AI API endpoint and model mappings (GLM-4.7, GLM-4.5-Air).
3.  Install the `uipro-cli` and initialize the UI UX Pro Max skill.
4.  Add the Vercel and Anthropic skill repositories to the agent's environment.

By layering these skills on top of the highly capable (and cost-effective) GLM or Codex models, you achieve the perfect balance: the raw coding power and cost savings of the alternative models, combined with the refined taste and conversational intelligence of Claude.

***

## References

[1] Meta Alchemist. "The Best Claude Alternatives for Openclaw & Hermes + Guide To Make Them Even Better". X (formerly Twitter). https://x.com/meta_alchemist/status/2040416725775352258
[2] KiloCode Blog. "We tested Minimax M27 against Claude". https://blog.kilo.ai/p/we-tested-minimax-m27-against-claude
[3] NextLevelBuilder. "UI UX Pro Max Skill Repository". GitHub. https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
[4] Anthropic. "Anthropic Agent Skills Repository". GitHub. https://github.com/anthropics/skills
[5] Vercel Labs. "Vercel Agent Skills Repository". GitHub. https://github.com/vercel-labs/agent-skills
