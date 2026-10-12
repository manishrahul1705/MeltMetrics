# Project working instructions

- Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) before substantial work. Consult the referenced source files; code is the implementation authority, and historical documentation is not proof that a feature works.
- Preserve existing user changes. Inspect Git status when available; this workspace was not a Git checkout at onboarding. Do not overwrite files, restore backups, reset data or discard work to establish a baseline.
- Work in the active service folders listed in PROJECT_CONTEXT.md. Exclude backups, dependencies, virtual environments and generated output from the primary review.
- Keep fixes focused and maintain working data flows, payload translations and shared melt-flow state. Do not redesign unrelated pages.
- Keep human approval, warning acknowledgement and engineer override controls intact. Describe the project as decision support, not autonomous furnace control.
- Never expose secrets from environment files, certificates/private keys, logs or provider responses. Record variable names and configuration status only.
- Never replace failed or unavailable results with fake success messages. In particular, do not mark stock deducted unless the required operation succeeded; known acceptance-path issues are documented in PROJECT_CONTEXT.md.
- Do not send email, consume paid provider APIs, submit learning feedback, retrain models, deduct stock, reset data or start/complete heats merely for onboarding or routine inspection. Choose checks appropriate to the authorized task.
- Verify changes with checks appropriate to their scope. Distinguish source inspection, syntax/build checks, local model inference, HTTP checks and browser/end-to-end validation. A health response is not proof of workflow correctness.
- Report what changed, what was tested and what remains unverified, using simple, concise explanations.
- Update PROJECT_CONTEXT.md after meaningful architecture or feature changes, including resolved issues, new limitations and validation evidence.
- The Audit Trail width/alignment/responsiveness request is pending as of onboarding. Do not implement it as part of documentation-only work; when requested, use the targeted files and acceptance criteria in PROJECT_CONTEXT.md.

